import { NextRequest, NextResponse } from "next/server";
import { getRegistry, type ReadinessRecord } from "@/registry";
import { makeRecord } from "@/registry/interface";
import { dbKnownDown, supabaseServer } from "@/lib/supabase";
import { isStellarAddress } from "@/lib/ownership";
import { TrackMeta } from "@/missions/schema";
import { ATTESTOR_PUBLIC, CREDENTIAL_CONTRACT, getAttestations, getContractModules, type Attestation } from "@/lib/attest";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: CORS });
}

/**
 * GET /api/verify?address=G...&module=phishing
 * → { address, certified, modules: [{ module, completedAt, txHash }], attestor, network, backend }
 * txHash: transacción en Stellar testnet enviada por la cuenta emisora (attestor) con memo "FYV cert <módulo>".
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address")?.trim().toUpperCase() ?? "";
  const module = searchParams.get("module");

  if (!address) return fail(400, "Falta el parámetro address.");
  if (!isStellarAddress(address)) {
    return fail(400, "Dirección inválida: debe empezar con G y tener 56 caracteres.");
  }
  if (module && !(module in TrackMeta)) return fail(400, "Módulo desconocido.");

  // Las tres fuentes se consultan en paralelo: el registro (base de datos), las transacciones de la
  // cuenta emisora en Horizon y el contrato Soroban. Ninguna bloquea a las otras.
  const configured = process.env.REGISTRY_BACKEND ?? "supabase";
  const registrySkipped = configured === "supabase" && dbKnownDown();
  const [registryRes, horizonRes, contractRes] = await Promise.allSettled([
    registrySkipped ? Promise.reject(new Error("base de datos no disponible")) : getRegistry().getReadiness(address),
    getAttestations(address),
    getContractModules(address),
  ]);

  const registry: ReadinessRecord | null = registryRes.status === "fulfilled" ? registryRes.value : null;
  if (registryRes.status === "rejected" && !registrySkipped) console.error("[FYV] verify failed:", errMsg(registryRes.reason));

  // On-chain proof lives in Horizon; if Horizon is down the registry answer still stands.
  const onchain: Attestation[] = horizonRes.status === "fulfilled" ? horizonRes.value : [];
  const horizonOk = horizonRes.status === "fulfilled";
  if (horizonRes.status === "rejected") console.error("[FYV] horizon attestations failed:", errMsg(horizonRes.reason));
  const txFor = (m: string): string | null => onchain.find((a) => a.module === m)?.txHash ?? null;

  // Registro en el contrato Soroban (lectura por simulación); si el RPC falla, se informa null.
  const contractModules: string[] | null = contractRes.status === "fulfilled" ? contractRes.value : null;
  if (contractRes.status === "rejected") console.error("[FYV] soroban read failed:", errMsg(contractRes.reason));

  if (!registry && !horizonOk && contractModules === null) {
    return fail(503, "Ni el registro ni Stellar testnet respondieron. Intenta en unos segundos.");
  }

  // Se suman las tres fuentes: una credencial emitida on-chain mientras la base estaba caída
  // sigue contando aunque el registro no la tenga.
  const known = new Set(Object.keys(TrackMeta));
  const byModule = new Map<string, string>();
  for (const m of registry?.modules ?? []) byModule.set(m.module, m.completedAt);
  for (const a of onchain) if (known.has(a.module) && !byModule.has(a.module)) byModule.set(a.module, a.createdAt);
  for (const m of contractModules ?? []) if (known.has(m) && !byModule.has(m)) byModule.set(m, "");
  const readiness = makeRecord(
    address,
    [...byModule].map(([module, completedAt]) => ({ module, completedAt, stellarAddress: address, orgSlug: "criptounam" })),
  );
  // Sin registro, la fuente es la cadena: transacciones de la cuenta emisora + contrato.
  const backend = registry ? configured : "onchain";

  // Best-effort audit log: a missing table or a failed insert must never break verification.
  if (backend !== "onchain" && !dbKnownDown()) {
    try {
      const requesterIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      await supabaseServer().from("fyv_verify_log").insert({
        querier_ip: requesterIp,
        queried_address: address,
        module_id: module ?? null,
      });
    } catch {
      /* ignore */
    }
  }

  return NextResponse.json(
    {
      address,
      certified: module ? readiness.isCertified(module) : readiness.modules.length > 0,
      modules: readiness.modules.map((m) => ({ module: m.module, completedAt: m.completedAt, txHash: txFor(m.module), onContract: contractModules ? contractModules.includes(m.module) : null })),
      contract: CREDENTIAL_CONTRACT || null,
      attestor: ATTESTOR_PUBLIC || null,
      network: "testnet",
      backend,
    },
    { headers: { ...CORS, "Cache-Control": "no-store" } },
  );
}

import { NextRequest, NextResponse } from "next/server";
import { getRegistry } from "@/registry";
import { supabaseServer } from "@/lib/supabase";
import { isStellarAddress } from "@/lib/ownership";
import { TrackMeta } from "@/missions/schema";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: CORS });
}

/**
 * GET /api/verify?address=G...&module=phishing
 * → { address, certified, modules: [{ module, completedAt }], backend }
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

  let readiness;
  try {
    readiness = await getRegistry().getReadiness(address);
  } catch (err) {
    console.error("[FYV] verify failed:", err instanceof Error ? err.message : err);
    return fail(503, "El registro de credenciales no respondió. Intenta en unos segundos.");
  }

  // Best-effort audit log: a missing table or a failed insert must never break verification.
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

  return NextResponse.json(
    {
      address,
      certified: module ? readiness.isCertified(module) : readiness.modules.length > 0,
      modules: readiness.modules.map((m) => ({ module: m.module, completedAt: m.completedAt })),
      backend: process.env.REGISTRY_BACKEND ?? "supabase",
    },
    { headers: { ...CORS, "Cache-Control": "no-store" } },
  );
}

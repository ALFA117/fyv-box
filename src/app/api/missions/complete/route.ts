import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMission, evaluateMission, getCertifiableModules } from "@/missions/engine";
import { after } from "next/server";
import { getRegistry } from "@/registry";
import { getAttestations } from "@/lib/attest";
import { claimIssuance, issueCredential } from "@/lib/issuance";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { signReceipt, validReceiptIds } from "@/lib/receipts";
import { dbKnownDown, supabaseServer } from "@/lib/supabase";
import { OWNERSHIP_MAX_AGE_MS, STELLAR_ADDRESS_RE, completionMessage } from "@/lib/ownership";

const BodySchema = z.object({
  stellarAddress: z.string().regex(STELLAR_ADDRESS_RE),
  missionId: z.string().regex(/^[a-z0-9-]{1,64}$/),
  selectedOptionId: z.string().regex(/^[a-z0-9]{1,8}$/),
  issuedAt: z.number().int().positive(),
  signature: z.string().min(40).max(200),
  orgSlug: z.string().regex(/^[a-z0-9-]{1,40}$/).default("criptounam"),
  // Recibos de misiones ya acertadas (ver lib/receipts.ts); solo se usan si la base no responde.
  receipts: z.record(z.string(), z.string().max(100)).optional(),
});

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

async function verifyOwnership(p: z.infer<typeof BodySchema>): Promise<boolean> {
  if (Math.abs(Date.now() - p.issuedAt) > OWNERSHIP_MAX_AGE_MS) return false;
  try {
    const { Keypair } = await import("@stellar/stellar-sdk");
    const sig = Uint8Array.from(Buffer.from(p.signature, "base64"));
    return Keypair.fromPublicKey(p.stellarAddress).verifyMessage(completionMessage(p), sig);
  } catch {
    return false;
  }
}

// Una persona responde 22 misiones con algunos reintentos; esto solo frena scripts.
const ANSWERS_PER_IP = { limit: 120, windowMs: 10 * 60_000 };
const ISSUANCES_PER_IP = { limit: 30, windowMs: 60 * 60_000 };

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`answer:${ip}`, ANSWERS_PER_IP.limit, ANSWERS_PER_IP.windowMs)) {
    return fail(429, "Demasiadas respuestas seguidas desde tu red. Espera unos minutos e intenta de nuevo.");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "La solicitud no es JSON válido.");
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return fail(400, "Datos incompletos o con formato inválido.");
  const input = parsed.data;

  const mission = getMission(input.missionId);
  if (!mission) return fail(404, "Esta misión no existe.");

  const selectedOption = mission.options.find((o) => o.id === input.selectedOptionId);
  if (!selectedOption) return fail(400, "La opción elegida no pertenece a esta misión.");

  if (!(await verifyOwnership(input))) {
    return fail(401, "No pudimos comprobar que esta dirección es tuya. Recarga la página e intenta de nuevo.");
  }

  const { stellarAddress, missionId, selectedOptionId, orgSlug } = input;
  const result = evaluateMission(mission, selectedOptionId);
  // Si la base falló hace poco, ni se intenta: la respuesta se resuelve al instante sin ella.
  if (dbKnownDown()) return completeWithoutDatabase(input, mission, result, selectedOption.label, ip);
  const db = supabaseServer();

  const { error: progressError } = await db.from("fyv_mission_progress").insert({
    stellar_address: stellarAddress,
    mission_id: missionId,
    track: mission.track,
    fell_for_trap: !result.isCorrect,
    selected_option_id: selectedOptionId,
    org_slug: orgSlug,
  });
  if (progressError) {
    console.error("[FYV] progress insert failed:", progressError.message);
    return completeWithoutDatabase(input, mission, result, selectedOption.label, ip);
  }

  const newCertifications: string[] = [];
  if (result.isCorrect) {
    const { error: completeError } = await db.from("fyv_completed_missions").upsert(
      { stellar_address: stellarAddress, mission_id: missionId, org_slug: orgSlug },
      { onConflict: "stellar_address,mission_id,org_slug" },
    );
    if (completeError) {
      console.error("[FYV] completion upsert failed:", completeError.message);
      return fail(503, "Acertaste, pero no pudimos guardar tu avance. Intenta de nuevo.");
    }

    try {
      const { data: completedRows, error } = await db
        .from("fyv_completed_missions")
        .select("mission_id")
        .eq("stellar_address", stellarAddress)
        .eq("org_slug", orgSlug);
      if (error) throw new Error(error.message);

      const completedIds = (completedRows ?? []).map((r: { mission_id: string }) => r.mission_id);
      const registry = getRegistry();
      const existing = await registry.getReadiness(stellarAddress);
      for (const module of getCertifiableModules(completedIds)) {
        if (!existing.isCertified(module)) {
          await registry.recordCompletion({ stellarAddress, module, orgSlug });
          newCertifications.push(module);
          // On-chain proof after the response is sent; /api/verify reads it back from Horizon.
          if (claimIssuance(stellarAddress, module)) after(() => issueCredential(stellarAddress, module));
        }
      }
    } catch (err) {
      console.error("[FYV] certification failed:", err instanceof Error ? err.message : err);
      return fail(503, "Tu avance se guardó, pero la credencial no se pudo emitir. Vuelve a enviar la respuesta.");
    }
  }

  return NextResponse.json({
    ...result,
    newCertifications,
    selectedOptionLabel: selectedOption.label,
    saved: "server",
    receipt: result.isCorrect ? signReceipt(stellarAddress, missionId) : null,
  });
}

/**
 * Modo sin base de datos: la respuesta se evalúa igual, el avance vive en el navegador
 * (recibos firmados) y, al completar un módulo, la credencial se emite on-chain.
 * Para no duplicarla, primero se revisa en Horizon si la cuenta emisora ya la envió;
 * si Horizon no responde, no se emite (tampoco podría) y se avisa para reintentar.
 */
async function completeWithoutDatabase(
  input: z.infer<typeof BodySchema>,
  mission: NonNullable<ReturnType<typeof getMission>>,
  result: ReturnType<typeof evaluateMission>,
  selectedOptionLabel: string,
  ip: string,
) {
  const { stellarAddress } = input;
  const receipt = result.isCorrect ? signReceipt(stellarAddress, mission.id) : null;
  const completedIds = new Set(validReceiptIds(stellarAddress, input.receipts));
  if (receipt) completedIds.add(mission.id);

  const newCertifications: string[] = [];
  let certificationPending: string | null = null;
  const module = mission.track;
  const certifiable = getCertifiableModules([...completedIds]);
  if (result.isCorrect && certifiable.includes(module)) {
    let already: string[] | null = null;
    try {
      already = (await getAttestations(stellarAddress)).map((a) => a.module);
    } catch (err) {
      console.error("[FYV] horizon read failed (offline mode):", err instanceof Error ? err.message : err);
    }
    if (already === null) {
      certificationPending = module;
    } else if (!already.includes(module)) {
      if (!rateLimit(`issue:${ip}`, ISSUANCES_PER_IP.limit, ISSUANCES_PER_IP.windowMs)) {
        certificationPending = module;
      } else if (claimIssuance(stellarAddress, module)) {
        newCertifications.push(module);
        after(() => issueCredential(stellarAddress, module));
      }
      // Si ya había una emisión en curso para este módulo, esa misma la entrega.
    }
  }

  return NextResponse.json({
    ...result,
    newCertifications,
    certificationPending,
    selectedOptionLabel,
    saved: "browser",
    receipt,
  });
}

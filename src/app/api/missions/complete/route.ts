import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMission, evaluateMission, getCertifiableModules } from "@/missions/engine";
import { after } from "next/server";
import { getRegistry } from "@/registry";
import { attestModule } from "@/lib/attest";
import { supabaseServer } from "@/lib/supabase";
import { OWNERSHIP_MAX_AGE_MS, STELLAR_ADDRESS_RE, completionMessage } from "@/lib/ownership";

const BodySchema = z.object({
  stellarAddress: z.string().regex(STELLAR_ADDRESS_RE),
  missionId: z.string().regex(/^[a-z0-9-]{1,64}$/),
  selectedOptionId: z.string().regex(/^[a-z0-9]{1,8}$/),
  issuedAt: z.number().int().positive(),
  signature: z.string().min(40).max(200),
  orgSlug: z.string().regex(/^[a-z0-9-]{1,40}$/).default("criptounam"),
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

export async function POST(req: NextRequest) {
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
    return fail(503, "No pudimos guardar tu respuesta. Revisa tu conexión e intenta de nuevo.");
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
          after(() =>
            attestModule(stellarAddress, module).catch((err) =>
              console.error("[FYV] on-chain attestation failed:", err instanceof Error ? err.message : err),
            ),
          );
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
  });
}

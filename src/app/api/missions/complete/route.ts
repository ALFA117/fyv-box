import { NextRequest, NextResponse } from "next/server";
import { getMission, evaluateMission, getCertifiableModules } from "@/missions/engine";
import { getRegistry } from "@/registry";
import { supabaseServer } from "@/lib/supabase";
import { z } from "zod";

const BodySchema = z.object({
  stellarAddress: z.string().regex(/^G[A-Z2-7]{55}$/),
  missionId: z.string(),
  selectedOptionId: z.string(),
  orgSlug: z.string().default("criptounam"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { stellarAddress, missionId, selectedOptionId, orgSlug } = parsed.data;

  const mission = getMission(missionId);
  if (!mission) {
    return NextResponse.json({ error: "mission not found" }, { status: 404 });
  }

  const result = evaluateMission(mission, selectedOptionId);

  const db = supabaseServer();

  // Track progress (for /stats)
  const selectedOption = mission.options.find((o) => o.id === selectedOptionId);
  await db.from("fyv_mission_progress").insert({
    stellar_address: stellarAddress,
    mission_id: missionId,
    track: mission.track,
    fell_for_trap: !result.isCorrect,
    selected_option_id: selectedOptionId,
    org_slug: orgSlug,
    created_at: new Date().toISOString(),
  });

  // If correct, record in registry and check for new certifications
  let newCertifications: string[] = [];
  if (result.isCorrect) {
    const registry = getRegistry();

    // Upsert this mission as completed
    await db.from("fyv_completed_missions").upsert(
      {
        stellar_address: stellarAddress,
        mission_id: missionId,
        org_slug: orgSlug,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "stellar_address,mission_id,org_slug" }
    );

    // Check if a track is now fully complete
    const { data: completedRows } = await db
      .from("fyv_completed_missions")
      .select("mission_id")
      .eq("stellar_address", stellarAddress)
      .eq("org_slug", orgSlug);

    const completedIds = (completedRows ?? []).map((r: { mission_id: string }) => r.mission_id);
    const certifiableNow = getCertifiableModules(completedIds);

    // Record new modules in registry
    const existingReadiness = await registry.getReadiness(stellarAddress);
    for (const module of certifiableNow) {
      if (!existingReadiness.isCertified(module)) {
        await registry.recordCompletion({ stellarAddress, module, orgSlug });
        newCertifications.push(module);
      }
    }
  }

  return NextResponse.json({
    ...result,
    newCertifications,
    selectedOptionLabel: selectedOption?.label ?? "",
  });
}

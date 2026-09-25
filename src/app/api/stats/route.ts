import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/**
 * GET /api/stats
 * Aggregate stats by track: % of users who fell for the trap on first attempt.
 */
export async function GET(_req: NextRequest) {
  const db = supabaseServer();

  const { data, error } = await db
    .from("fyv_mission_progress")
    .select("track, fell_for_trap, mission_id, stellar_address");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  }

  // Per track: count unique users, count users who fell for trap on first attempt
  const trackMap: Record<
    string,
    { total: Set<string>; fell: Set<string> }
  > = {};

  // Only look at first attempt per user+mission
  const firstAttempts = new Map<string, typeof data[0]>();
  for (const row of data ?? []) {
    const key = `${row.stellar_address}::${row.mission_id}`;
    if (!firstAttempts.has(key)) {
      firstAttempts.set(key, row);
    }
  }

  for (const row of firstAttempts.values()) {
    if (!trackMap[row.track]) {
      trackMap[row.track] = { total: new Set(), fell: new Set() };
    }
    trackMap[row.track].total.add(row.stellar_address);
    if (row.fell_for_trap) {
      trackMap[row.track].fell.add(row.stellar_address);
    }
  }

  const stats = Object.entries(trackMap).map(([track, counts]) => ({
    track,
    totalUsers: counts.total.size,
    fellForTrap: counts.fell.size,
    trapRate:
      counts.total.size > 0
        ? Math.round((counts.fell.size / counts.total.size) * 100)
        : 0,
  }));

  return NextResponse.json({ stats, generatedAt: new Date().toISOString() }, { headers: CORS });
}

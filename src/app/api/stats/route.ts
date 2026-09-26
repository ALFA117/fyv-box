import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

interface Row {
  track: string;
  fell_for_trap: boolean;
  mission_id: string;
  stellar_address: string;
  created_at: string;
}

/**
 * GET /api/stats
 * Per track: % of users who fell for the trap on their first attempt at any mission of that track.
 */
export async function GET() {
  const { data, error } = await supabaseServer()
    .from("fyv_mission_progress")
    .select("track, fell_for_trap, mission_id, stellar_address, created_at")
    .order("created_at", { ascending: true })
    .limit(10000);

  if (error) {
    console.error("[FYV] stats failed:", error.message);
    return NextResponse.json(
      { error: "No pudimos cargar las estadísticas. Intenta en unos segundos." },
      { status: 503, headers: CORS },
    );
  }

  // Rows are ordered oldest-first, so the first one per user·mission is the first attempt.
  const firstAttempts = new Map<string, Row>();
  for (const row of (data ?? []) as Row[]) {
    const key = `${row.stellar_address}::${row.mission_id}`;
    if (!firstAttempts.has(key)) firstAttempts.set(key, row);
  }

  const trackMap: Record<string, { total: Set<string>; fell: Set<string> }> = {};
  const allUsers = new Set<string>();
  for (const row of firstAttempts.values()) {
    allUsers.add(row.stellar_address);
    trackMap[row.track] ??= { total: new Set(), fell: new Set() };
    trackMap[row.track].total.add(row.stellar_address);
    if (row.fell_for_trap) trackMap[row.track].fell.add(row.stellar_address);
  }

  const stats = Object.entries(trackMap).map(([track, counts]) => ({
    track,
    totalUsers: counts.total.size,
    fellForTrap: counts.fell.size,
    trapRate: counts.total.size > 0 ? Math.round((counts.fell.size / counts.total.size) * 100) : 0,
  }));

  return NextResponse.json(
    { stats, uniqueUsers: allUsers.size, generatedAt: new Date().toISOString() },
    { headers: { ...CORS, "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } },
  );
}

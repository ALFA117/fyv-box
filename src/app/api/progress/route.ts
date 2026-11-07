import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, dbKnownDown } from "@/lib/supabase";
import { isStellarAddress } from "@/lib/ownership";

export const dynamic = "force-dynamic";

/**
 * GET /api/progress?address=G…
 * → { missions: string[], db: "ok" | "down" }
 * Misiones acertadas que el servidor tiene guardadas para la dirección. Si la base no responde,
 * contesta al instante con db "down" y el mapa usa el avance guardado en el navegador.
 */
export async function GET(req: NextRequest) {
  const address = new URL(req.url).searchParams.get("address")?.trim().toUpperCase() ?? "";
  if (!isStellarAddress(address)) {
    return NextResponse.json({ error: "Dirección inválida." }, { status: 400 });
  }

  const headers = { "Cache-Control": "no-store" };
  if (dbKnownDown()) return NextResponse.json({ missions: [], db: "down" }, { headers });

  const { data, error } = await supabaseServer()
    .from("fyv_completed_missions")
    .select("mission_id")
    .eq("stellar_address", address);
  if (error) {
    console.error("[FYV] progress read failed:", error.message);
    return NextResponse.json({ missions: [], db: "down" }, { headers });
  }
  return NextResponse.json(
    { missions: (data ?? []).map((r: { mission_id: string }) => r.mission_id), db: "ok" },
    { headers },
  );
}

import { NextResponse } from "next/server";
import { loadCatalog, toPublicMission } from "@/missions/engine";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return NextResponse.json(loadCatalog().map(toPublicMission));
}

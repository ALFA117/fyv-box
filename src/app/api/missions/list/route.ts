import { NextResponse } from "next/server";
import { loadCatalog } from "@/missions/engine";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const catalog = loadCatalog();
  return NextResponse.json(catalog);
}

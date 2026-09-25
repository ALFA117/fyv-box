import { NextRequest, NextResponse } from "next/server";
import { getRegistry } from "@/registry";
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
 * GET /api/verify?address=G...&module=phishing
 *
 * Returns:
 *   { certified: bool, modules: string[], address: string, backend: string }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const module = searchParams.get("module");

  if (!address) {
    return NextResponse.json(
      { error: "address param required" },
      { status: 400, headers: CORS }
    );
  }

  // Validate Stellar address format (G...)
  if (!/^G[A-Z2-7]{55}$/.test(address)) {
    return NextResponse.json(
      { error: "invalid Stellar address format" },
      { status: 400, headers: CORS }
    );
  }

  try {
    const registry = getRegistry();
    const readiness = await registry.getReadiness(address);

    const certified = module
      ? readiness.isCertified(module)
      : readiness.modules.length > 0;

    // Log the query (future billing point)
    const requesterIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const db = supabaseServer();
    await db.from("fyv_verify_log").insert({
      querier_ip: requesterIp,
      queried_address: address,
      module_id: module ?? null,
      queried_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        address,
        certified,
        modules: readiness.modules.map((m) => ({
          module: m.module,
          completedAt: m.completedAt,
        })),
        backend: process.env.REGISTRY_BACKEND ?? "supabase",
      },
      { headers: CORS }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "internal error";
    return NextResponse.json({ error: msg }, { status: 500, headers: CORS });
  }
}

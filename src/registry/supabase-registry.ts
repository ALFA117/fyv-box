import { supabaseServer } from "@/lib/supabase";
import type { ModuleCompletion, ReadinessRecord, RegistryBackend } from "./interface";
import { makeRecord } from "./interface";

export const supabaseRegistry: RegistryBackend = {
  async recordCompletion({ stellarAddress, module, orgSlug }) {
    const db = supabaseServer();
    await db.from("fyv_module_completions").upsert(
      {
        stellar_address: stellarAddress,
        module_id: module,
        org_slug: orgSlug,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "stellar_address,module_id,org_slug" }
    );
  },

  async getReadiness(stellarAddress: string): Promise<ReadinessRecord> {
    const db = supabaseServer();
    const { data } = await db
      .from("fyv_module_completions")
      .select("module_id, completed_at, org_slug")
      .eq("stellar_address", stellarAddress);

    const modules: ModuleCompletion[] = (data ?? []).map((row) => ({
      module: row.module_id,
      completedAt: row.completed_at,
      stellarAddress,
      orgSlug: row.org_slug,
    }));

    return makeRecord(stellarAddress, modules);
  },

  async isCertified(stellarAddress: string, module: string): Promise<boolean> {
    const db = supabaseServer();
    const { data } = await db
      .from("fyv_module_completions")
      .select("id")
      .eq("stellar_address", stellarAddress)
      .eq("module_id", module)
      .maybeSingle();
    return data !== null;
  },
};

import { supabaseServer } from "@/lib/supabase";
import type { ModuleCompletion, ReadinessRecord, RegistryBackend } from "./interface";
import { makeRecord } from "./interface";

export const supabaseRegistry: RegistryBackend = {
  async recordCompletion({ stellarAddress, module, orgSlug }) {
    const { error } = await supabaseServer().from("fyv_module_completions").upsert(
      { stellar_address: stellarAddress, module_id: module, org_slug: orgSlug },
      { onConflict: "stellar_address,module_id,org_slug" },
    );
    if (error) throw new Error(`recordCompletion: ${error.message}`);
  },

  async getReadiness(stellarAddress: string): Promise<ReadinessRecord> {
    const { data, error } = await supabaseServer()
      .from("fyv_module_completions")
      .select("module_id, completed_at, org_slug")
      .eq("stellar_address", stellarAddress);
    if (error) throw new Error(`getReadiness: ${error.message}`);

    const modules: ModuleCompletion[] = (data ?? []).map((row) => ({
      module: row.module_id,
      completedAt: row.completed_at,
      stellarAddress,
      orgSlug: row.org_slug,
    }));

    return makeRecord(stellarAddress, modules);
  },

  async isCertified(stellarAddress: string, module: string): Promise<boolean> {
    const readiness = await supabaseRegistry.getReadiness(stellarAddress);
    return readiness.isCertified(module);
  },
};

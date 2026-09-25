import type { RegistryBackend } from "./interface";
export type { RegistryBackend, ReadinessRecord, ModuleCompletion } from "./interface";

export function getRegistry(): RegistryBackend {
  const backend = process.env.REGISTRY_BACKEND ?? "supabase";

  if (backend === "soroban") {
    // Dynamic import keeps Soroban SDK out of the client bundle
    const { sorobanRegistry } = require("./soroban-registry");
    return sorobanRegistry;
  }

  const { supabaseRegistry } = require("./supabase-registry");
  return supabaseRegistry;
}

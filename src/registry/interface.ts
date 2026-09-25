export interface ModuleCompletion {
  module: string;
  completedAt: string;
  stellarAddress: string;
  orgSlug: string;
}

export interface ReadinessRecord {
  stellarAddress: string;
  modules: ModuleCompletion[];
  isCertified: (module: string) => boolean;
}

export interface RegistryBackend {
  recordCompletion(params: {
    stellarAddress: string;
    module: string;
    orgSlug: string;
  }): Promise<void>;

  getReadiness(stellarAddress: string): Promise<ReadinessRecord>;

  isCertified(stellarAddress: string, module: string): Promise<boolean>;
}

export function makeRecord(
  stellarAddress: string,
  modules: ModuleCompletion[]
): ReadinessRecord {
  return {
    stellarAddress,
    modules,
    isCertified: (module: string) =>
      modules.some((m) => m.module === module),
  };
}

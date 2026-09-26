import { MissionSchema, type Mission } from "./schema";

// Importados con require() para que Turbopack/Webpack los incluya en el bundle
// y sean accesibles en Vercel sin depender de fs.readdirSync en runtime.
const CATALOG_MODULES: Record<string, unknown> = {
  "phishing-001":             require("./catalog/phishing-001.json"),
  "phishing-002":             require("./catalog/phishing-002.json"),
  "phishing-003":             require("./catalog/phishing-003.json"),
  "phishing-004":             require("./catalog/phishing-004.json"),
  "phishing-005":             require("./catalog/phishing-005.json"),
  "fake-assets-001":          require("./catalog/fake-assets-001.json"),
  "fake-assets-002":          require("./catalog/fake-assets-002.json"),
  "fake-assets-003":          require("./catalog/fake-assets-003.json"),
  "social-eng-001":           require("./catalog/social-eng-001.json"),
  "social-eng-002":           require("./catalog/social-eng-002.json"),
  "social-eng-003":           require("./catalog/social-eng-003.json"),
  "social-eng-004":           require("./catalog/social-eng-004.json"),
  "dangerous-approvals-001":  require("./catalog/dangerous-approvals-001.json"),
  "dangerous-approvals-002":  require("./catalog/dangerous-approvals-002.json"),
  "presale-scam-001":         require("./catalog/presale-scam-001.json"),
  "presale-scam-002":         require("./catalog/presale-scam-002.json"),
  "key-hygiene-001":          require("./catalog/key-hygiene-001.json"),
  "key-hygiene-002":          require("./catalog/key-hygiene-002.json"),
  "key-hygiene-003":          require("./catalog/key-hygiene-003.json"),
};

let _catalog: Mission[] | null = null;

export function loadCatalog(): Mission[] {
  if (_catalog) return _catalog;

  _catalog = Object.values(CATALOG_MODULES)
    .map((raw) => MissionSchema.parse(raw))
    .sort((a, b) => a.id.localeCompare(b.id));

  return _catalog;
}

export function getMission(id: string): Mission | undefined {
  return loadCatalog().find((m) => m.id === id);
}

export function getMissionsByTrack(track: Mission["track"]): Mission[] {
  return loadCatalog().filter((m) => m.track === track);
}

export function getAvailableTracks(): Mission["track"][] {
  const all = loadCatalog();
  return [...new Set(all.map((m) => m.track))];
}

export interface MissionResult {
  missionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  explanation: string;
  xpEarned: number;
}

export function evaluateMission(
  mission: Mission,
  selectedOptionId: string
): MissionResult {
  const option = mission.options.find((o) => o.id === selectedOptionId);
  const isCorrect = option?.isCorrect ?? false;

  return {
    missionId: mission.id,
    selectedOptionId,
    isCorrect,
    explanation: mission.explanation,
    xpEarned: isCorrect ? mission.xp : 0,
  };
}

export function isTrackComplete(
  track: Mission["track"],
  completedIds: string[]
): boolean {
  const missions = getMissionsByTrack(track).filter((m) => !m.comingSoon);
  return missions.length > 0 && missions.every((m) => completedIds.includes(m.id));
}

export function getCertifiableModules(completedIds: string[]): Mission["track"][] {
  const tracks: Mission["track"][] = [
    "phishing",
    "fake-assets",
    "social-engineering",
    "dangerous-approvals",
    "presale-scam",
    "key-hygiene",
  ];
  return tracks.filter((t) => isTrackComplete(t, completedIds));
}

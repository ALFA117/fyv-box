import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { MissionSchema, type Mission } from "./schema";

let _catalog: Mission[] | null = null;

export function loadCatalog(): Mission[] {
  if (_catalog) return _catalog;

  const dir = join(process.cwd(), "src/missions/catalog");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  _catalog = files
    .map((f) => {
      const raw = JSON.parse(readFileSync(join(dir, f), "utf-8"));
      return MissionSchema.parse(raw);
    })
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
  ];
  return tracks.filter((t) => isTrackComplete(t, completedIds));
}

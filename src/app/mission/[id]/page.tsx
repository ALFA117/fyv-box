import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMission, loadCatalog, toPublicMission } from "@/missions/engine";
import { TrackMeta } from "@/missions/schema";
import { pageMetadata } from "@/lib/seo";
import { TRACK_ORDER } from "@/components/trackStyle";
import { MissionClient } from "./MissionClient";

type Params = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return loadCatalog().map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const mission = getMission(id);
  if (!mission) return { title: "Misión no encontrada" };

  const track = TrackMeta[mission.track].label;
  return pageMetadata({
    title: `${mission.title} · ${track}`,
    shareTitle: `${mission.title} — ¿detectarías la trampa? · FYV Box`,
    description: `Simulacro de ${track.toLowerCase()}: ¿sabrías detectar la trampa? Practica gratis en FYV Box, sin arriesgar dinero.`,
    path: `/mission/${mission.id}`,
  });
}

export default async function MissionPage({ params }: Params) {
  const { id } = await params;
  const mission = getMission(id);
  if (!mission) notFound();

  // Next mission in map order: same module first, then the next module.
  const ordered = TRACK_ORDER.flatMap((t) => loadCatalog().filter((m) => m.track === t && !m.comingSoon));
  const idx = ordered.findIndex((m) => m.id === mission.id);
  const next = idx >= 0 ? ordered[idx + 1] : undefined;

  return (
    <MissionClient
      key={mission.id}
      mission={toPublicMission(mission)}
      next={next ? { id: next.id, title: next.title, sameTrack: next.track === mission.track } : null}
    />
  );
}

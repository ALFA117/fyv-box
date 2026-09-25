"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, BarChart2, Award, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getWallet, type WalletIdentity } from "@/identity";
import { WalletIndicator } from "@/components/WalletIndicator";
import { MissionCard } from "@/components/MissionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { DashboardSkeleton } from "@/components/Skeleton";
import { TrackIconBadge } from "@/components/TrackIcon";
import { TrackMeta } from "@/missions/schema";
import type { Mission } from "@/missions/schema";
import { supabase } from "@/lib/supabase";
import { AppNav } from "@/components/AppNav";

interface TrackGroup {
  track: Mission["track"];
  missions: Mission[];
  completed: string[];
  comingSoon: boolean;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

export default function DashboardPage() {
  const [wallet, setWallet]   = useState<WalletIdentity | null>(null);
  const [groups, setGroups]   = useState<TrackGroup[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    getWallet().then(setWallet);
  }, []);

  useEffect(() => {
    if (!wallet) return;

    fetch("/api/missions/list")
      .then((r) => r.json())
      .then(async (missions: Mission[]) => {
        const { data } = await supabase
          .from("fyv_completed_missions")
          .select("mission_id")
          .eq("stellar_address", wallet.publicKey);

        const completedIds = (data ?? []).map((r: { mission_id: string }) => r.mission_id);

        const trackOrder: Mission["track"][] = [
          "phishing",
          "fake-assets",
          "social-engineering",
          "dangerous-approvals",
          "presale-scam",
          "key-hygiene",
        ];

        const grouped = trackOrder.map((track) => {
          const trackMissions = missions.filter((m: Mission) => m.track === track);
          const comingSoon = trackMissions.every((m: Mission) => m.comingSoon);
          return { track, missions: trackMissions, completed: completedIds, comingSoon };
        });

        setGroups(grouped);

        const xp = missions
          .filter((m: Mission) => completedIds.includes(m.id))
          .reduce((acc: number, m: Mission) => acc + m.xp, 0);
        setTotalXP(xp);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, [wallet]);

  const activeTracks   = groups.filter((g) => !g.comingSoon);
  const totalMissions  = activeTracks.flatMap((g) => g.missions).filter((m) => !m.comingSoon).length;
  const completedCount = groups.flatMap((g) => g.missions.filter((m) => g.completed.includes(m.id))).length;
  const progressPct    = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  return (
    <div className="min-h-dvh pb-24">
      <AppNav
        wallet={wallet ?? undefined}
        showStats
        showLogout
      />

      <div className="px-4 py-6">
        {loadState === "loading" ? (
          <DashboardSkeleton />
        ) : loadState === "error" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-sm rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-subtle)] p-6 text-center"
          >
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-[var(--danger)]" strokeWidth={1.75} />
            <p className="text-sm font-semibold text-[var(--cream)]">Error al cargar las misiones</p>
            <p className="mt-1 text-xs text-[var(--cream-muted)]">
              Revisa tu conexión e intenta de nuevo.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Progress card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-playfair text-xl font-bold text-[var(--cream)]">
                    Tu progreso
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--cream-muted)]">
                    {completedCount} de {totalMissions} misiones completadas
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-gold)] bg-[var(--gold-subtle)] px-3 py-1">
                    <Star className="h-3.5 w-3.5 text-[var(--gold)]" strokeWidth={2} />
                    <span className="text-xs font-bold text-[var(--gold)]">{totalXP} XP</span>
                  </div>
                  {completedCount > 0 && (
                    <Link
                      href="/graduation"
                      className="flex items-center gap-1 text-xs text-[var(--cream-muted)] hover:text-[var(--gold)] transition-colors"
                    >
                      <Award className="h-3 w-3" />
                      Credenciales
                    </Link>
                  )}
                </div>
              </div>
              <ProgressBar
                value={progressPct}
                label={`${progressPct}% completado`}
                size="md"
                color={progressPct === 100 ? "success" : "gold"}
              />
            </motion.div>

            {/* Track groups */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <AnimatePresence>
                {groups.map((group) => {
                  const meta = TrackMeta[group.track];
                  const trackCompleted = group.missions.filter(
                    (m) => group.completed.includes(m.id)
                  ).length;
                  const trackTotal = group.missions.filter((m) => !m.comingSoon).length;

                  return (
                    <motion.section key={group.track} variants={itemVariants}>
                      <div className="mb-3 flex items-center gap-3">
                        <TrackIconBadge track={group.track} size={18} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-[var(--cream)]">
                              {meta.label}
                            </h3>
                            {group.comingSoon && (
                              <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--cream-muted)]">
                                próximamente
                              </span>
                            )}
                            {!group.comingSoon && trackTotal > 0 && (
                              <span className="text-[10px] text-[var(--cream-muted)]">
                                {trackCompleted}/{trackTotal}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-[var(--cream-muted)]">
                            {meta.description}
                          </p>
                        </div>
                      </div>

                      {group.comingSoon ? (
                        <div className="rounded-xl border border-dashed border-[var(--border)] px-4 py-3 text-xs text-[var(--cream-muted)]">
                          Este track estará disponible en una próxima actualización
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {group.missions.map((mission) => (
                            <MissionCard
                              key={mission.id}
                              mission={mission}
                              completed={group.completed.includes(mission.id)}
                            />
                          ))}
                        </div>
                      )}
                    </motion.section>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

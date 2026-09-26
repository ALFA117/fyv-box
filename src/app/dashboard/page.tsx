"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Award, AlertCircle, Trophy, Flame, Shield } from "lucide-react";
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
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

const TRACK_COLOR: Record<Mission["track"], string> = {
  "phishing":            "border-[var(--danger)]   bg-[var(--danger-subtle)]   text-[var(--danger)]",
  "social-engineering":  "border-blue-400           bg-blue-500/10               text-blue-400",
  "fake-assets":         "border-[var(--amber)]     bg-[var(--amber-subtle)]     text-[var(--amber)]",
  "dangerous-approvals": "border-[var(--danger)]   bg-[var(--danger-subtle)]   text-[var(--danger)]",
  "presale-scam":        "border-[var(--success)]  bg-[var(--success-subtle)]  text-[var(--success)]",
  "key-hygiene":         "border-purple-400          bg-purple-500/10             text-purple-400",
};

const TRACK_BAR: Record<Mission["track"], string> = {
  "phishing":            "bg-[var(--danger)]",
  "social-engineering":  "bg-blue-400",
  "fake-assets":         "bg-[var(--amber)]",
  "dangerous-approvals": "bg-[var(--danger)]",
  "presale-scam":        "bg-[var(--success)]",
  "key-hygiene":         "bg-purple-400",
};

export default function DashboardPage() {
  const [wallet,    setWallet]    = useState<WalletIdentity | null>(null);
  const [groups,    setGroups]    = useState<TrackGroup[]>([]);
  const [totalXP,   setTotalXP]   = useState(0);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => { getWallet().then(setWallet); }, []);

  useEffect(() => {
    if (!wallet) return;
    fetch("/api/missions/list")
      .then(r => r.json())
      .then(async (missions: Mission[]) => {
        const { data } = await supabase
          .from("fyv_completed_missions")
          .select("mission_id")
          .eq("stellar_address", wallet.publicKey);

        const completedIds = (data ?? []).map((r: { mission_id: string }) => r.mission_id);
        const trackOrder: Mission["track"][] = [
          "phishing", "fake-assets", "social-engineering",
          "dangerous-approvals", "presale-scam", "key-hygiene",
        ];

        const grouped = trackOrder.map(track => ({
          track,
          missions: missions.filter((m: Mission) => m.track === track),
          completed: completedIds,
          comingSoon: missions.filter((m: Mission) => m.track === track).every((m: Mission) => m.comingSoon),
        }));

        setGroups(grouped);
        setTotalXP(
          missions
            .filter((m: Mission) => completedIds.includes(m.id))
            .reduce((acc: number, m: Mission) => acc + m.xp, 0)
        );
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, [wallet]);

  const activeTracks    = groups.filter(g => !g.comingSoon);
  const totalMissions   = activeTracks.flatMap(g => g.missions).filter(m => !m.comingSoon).length;
  const completedCount  = groups.flatMap(g => g.missions.filter(m => g.completed.includes(m.id))).length;
  const progressPct     = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  return (
    <div className="min-h-dvh pb-28">
      <AppNav wallet={wallet ?? undefined} showStats showLogout />

      <div className="px-4 py-6 sm:px-6">
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
            <p className="mt-1 text-xs text-[var(--cream-muted)]">Revisa tu conexión e intenta de nuevo.</p>
          </motion.div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-8">

            {/* ── XP + Progress card ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-3xl border border-[var(--border-gold)] bg-[var(--surface)] shadow-[var(--shadow-gold)]"
            >
              {/* Background accent */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[var(--gold)]/8 blur-3xl" aria-hidden />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[var(--gold)]/5 blur-2xl" aria-hidden />

              <div className="relative p-5 sm:p-6">
                {/* Top row */}
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-playfair text-xl font-bold text-[var(--cream)] sm:text-2xl">
                      Tu progreso
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--cream-muted)]">
                      {completedCount} de {totalMissions} misiones completadas
                    </p>
                  </div>
                  {/* XP badge */}
                  <div className="flex shrink-0 flex-col items-end">
                    <div className="flex items-center gap-1.5 rounded-2xl border border-[var(--border-gold)] bg-[var(--gold-subtle)] px-3.5 py-1.5 shadow-[var(--shadow-gold)]">
                      <Star className="h-4 w-4 text-[var(--gold)]" strokeWidth={2} fill="currentColor" />
                      <span className="font-playfair text-lg font-bold text-[var(--gold)]">{totalXP}</span>
                      <span className="text-xs font-semibold text-[var(--gold)]/70">XP</span>
                    </div>
                    {progressPct > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[var(--cream-muted)]">
                        <Flame className="h-3 w-3 text-[var(--amber)]" />
                        {progressPct}% completado
                      </div>
                    )}
                  </div>
                </div>

                {/* Global bar */}
                <ProgressBar
                  value={progressPct}
                  size="md"
                  color={progressPct === 100 ? "success" : "gold"}
                />

                {/* Per-track mini bars */}
                {activeTracks.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3.5 sm:grid-cols-3">
                    {activeTracks.map(g => {
                      const meta = TrackMeta[g.track];
                      const done  = g.missions.filter(m => g.completed.includes(m.id)).length;
                      const total = g.missions.filter(m => !m.comingSoon).length;
                      const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
                      const bar   = TRACK_BAR[g.track];
                      return (
                        <div key={g.track}>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="truncate pr-1 text-[10px] font-medium text-[var(--cream-muted)]">
                              {meta.label}
                            </span>
                            <span className="shrink-0 text-[10px] text-[var(--cream-muted)]">{done}/{total}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${bar}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Graduation CTA */}
                {progressPct === 100 ? (
                  <Link href="/graduation" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[var(--success)] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90">
                    <Trophy className="h-4 w-4" />
                    Ver mis credenciales →
                  </Link>
                ) : completedCount > 0 && (
                  <Link href="/graduation" className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--border-gold)] px-4 py-2 text-xs text-[var(--gold)] transition-colors hover:bg-[var(--gold-subtle)]">
                    <Award className="h-3.5 w-3.5" />
                    Ver credenciales parciales
                  </Link>
                )}
              </div>
            </motion.div>

            {/* ── Track groups ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              <AnimatePresence>
                {groups.map(group => {
                  const meta         = TrackMeta[group.track];
                  const trackColor   = TRACK_COLOR[group.track];
                  const trackDone    = group.missions.filter(m => group.completed.includes(m.id)).length;
                  const trackTotal   = group.missions.filter(m => !m.comingSoon).length;
                  const trackPct     = trackTotal > 0 ? Math.round((trackDone / trackTotal) * 100) : 0;

                  return (
                    <motion.section key={group.track} variants={itemVariants}>
                      {/* Track header */}
                      <div className="mb-3 flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${trackColor}`}>
                          <TrackIconBadge track={group.track} size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[var(--cream)]">
                              {meta.label}
                            </h3>
                            {group.comingSoon ? (
                              <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--cream-muted)]">
                                próximamente
                              </span>
                            ) : trackTotal > 0 && (
                              <span className="text-[10px] text-[var(--cream-muted)]">
                                {trackDone}/{trackTotal}
                                {trackPct === 100 && (
                                  <span className="ml-1 text-[var(--success)]">✓</span>
                                )}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-[var(--cream-muted)]">{meta.description}</p>
                        </div>
                        {/* Pequeño escudo si track completado */}
                        {trackPct === 100 && (
                          <Shield className="h-4 w-4 shrink-0 text-[var(--success)]" strokeWidth={2} />
                        )}
                      </div>

                      {/* Missions */}
                      {group.comingSoon ? (
                        <div className="rounded-2xl border border-dashed border-[var(--border)] px-5 py-4 text-xs text-[var(--cream-muted)]">
                          Este track estará disponible en una próxima actualización
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {group.missions.map(mission => (
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

          </div>
        )}
      </div>
    </div>
  );
}

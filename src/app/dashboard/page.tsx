"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LogOut, Star } from "lucide-react";
import Link from "next/link";
import { getWallet, type WalletIdentity } from "@/identity";
import { WalletIndicator } from "@/components/WalletIndicator";
import { MissionCard } from "@/components/MissionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { TrackMeta } from "@/missions/schema";
import type { Mission } from "@/missions/schema";
import { supabase } from "@/lib/supabase";

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
  const [wallet, setWallet] = useState<WalletIdentity | null>(null);
  const [groups, setGroups] = useState<TrackGroup[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    getWallet().then(setWallet);
  }, []);

  useEffect(() => {
    if (!wallet) return;

    // Load missions from API (server-side catalog)
    fetch("/api/missions/list")
      .then((r) => r.json())
      .then(async (missions: Mission[]) => {
        // Load completed missions from Supabase
        const { data } = await supabase
          .from("fyv_completed_missions")
          .select("mission_id")
          .eq("stellar_address", wallet.publicKey);

        const completedIds = (data ?? []).map((r: { mission_id: string }) => r.mission_id);

        // Group by track
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
          return {
            track,
            missions: trackMissions,
            completed: completedIds,
            comingSoon,
          };
        });

        setGroups(grouped);

        // Calculate XP
        const xp = missions
          .filter((m: Mission) => completedIds.includes(m.id))
          .reduce((acc: number, m: Mission) => acc + m.xp, 0);
        setTotalXP(xp);
      })
      .catch(() => {
        // Fallback: load catalog client-side isn't possible (server-only fs),
        // this will be resolved by the API route below
      });
  }, [wallet]);

  const activeTracks = groups.filter((g) => !g.comingSoon);
  const totalMissions = activeTracks.flatMap((g) => g.missions).filter((m) => !m.comingSoon).length;
  const completedCount = groups.flatMap((g) =>
    g.missions.filter((m) => g.completed.includes(m.id))
  ).length;

  return (
    <div className="min-h-dvh px-4 py-6 pb-24">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield className="h-6 w-6 text-[var(--gold)]" />
          <span className="serif text-lg font-bold text-[var(--cream)]">FYV Box</span>
        </div>
        <div className="flex items-center gap-3">
          {wallet && (
            <WalletIndicator publicKey={wallet.publicKey} provider={wallet.provider} />
          )}
          <Link href="/" className="text-[var(--cream-muted)] hover:text-[var(--cream)]">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* XP + Progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 rounded-2xl border border-white/10 bg-[var(--surface)] p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="serif text-xl font-bold text-[var(--cream)]">Tu progreso</h2>
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--gold)]/15 px-3 py-1">
            <Star className="h-3.5 w-3.5 text-[var(--gold)]" />
            <span className="text-xs font-bold text-[var(--gold)]">{totalXP} XP</span>
          </div>
        </div>
        <ProgressBar
          value={totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0}
          label={`${completedCount} / ${totalMissions} misiones`}
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
            return (
              <motion.section key={group.track} variants={itemVariants}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-lg" aria-hidden>{meta.emoji}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--cream)]">
                      {meta.label}
                      {group.comingSoon && (
                        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-[var(--cream-muted)]">
                          próximamente
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[var(--cream-muted)]">{meta.description}</p>
                  </div>
                </div>

                {group.comingSoon ? (
                  <div className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-xs text-[var(--cream-muted)]">
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
    </div>
  );
}

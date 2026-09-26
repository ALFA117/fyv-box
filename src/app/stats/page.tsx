"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, AlertTriangle, Loader2, BarChart3, Flame } from "lucide-react";
import { TrackMeta } from "@/missions/schema";
import type { Mission } from "@/missions/schema";
import { TrackIconBadge } from "@/components/TrackIcon";
import { AppNav } from "@/components/AppNav";

interface TrackStat {
  track: string;
  totalUsers: number;
  fellForTrap: number;
  trapRate: number;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0,   transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

export default function StatsPage() {
  const [stats, setStats]             = useState<TrackStat[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats ?? []);
        setGeneratedAt(d.generatedAt ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalUsers = Math.max(...(stats.map((s) => s.totalUsers).concat([0])));
  const avgTrapRate =
    stats.length > 0
      ? Math.round(stats.reduce((a, s) => a + s.trapRate, 0) / stats.length)
      : 0;

  const hardestTrack = stats.length > 0
    ? stats.reduce((a, b) => b.trapRate > a.trapRate ? b : a, stats[0])
    : null;

  return (
    <div className="min-h-dvh pb-24">
      <AppNav back="/dashboard" />

      <div className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-lg">

          {/* Header */}
          <div className="mb-6">
            <div className="mb-1 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--gold)]" strokeWidth={1.75} />
              <h1 className="font-playfair text-2xl font-bold text-[var(--cream)]">Estadísticas</h1>
            </div>
            <p className="text-sm text-[var(--cream-muted)]">¿En qué trampa cae más la gente?</p>
            {generatedAt && (
              <p className="mt-1 text-[10px] text-[var(--cream-muted)]/50">
                Actualizado {new Date(generatedAt).toLocaleString("es-MX")}
              </p>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
              </div>
              {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
              <div className="flex justify-center pt-2">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--cream-muted)]" />
              </div>
            </div>
          ) : stats.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] py-16 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--navy)]">
                <TrendingUp className="h-8 w-8 text-[var(--cream-muted)]" strokeWidth={1.25} />
              </div>
              <div className="space-y-1 px-6">
                <p className="font-playfair text-lg font-bold text-[var(--cream)]">Sin datos aún</p>
                <p className="text-sm text-[var(--cream-muted)]">
                  ¡Sé el primero en entrenar y aparecer aquí!
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-5">
              {/* Summary cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { icon: Users,         value: String(totalUsers),    label: "Usuarios",         accent: "text-blue-400" },
                  { icon: AlertTriangle, value: `${avgTrapRate}%`,     label: "Tasa promedio",    accent: "text-[var(--amber)]" },
                  { icon: Flame,         value: hardestTrack ? `${hardestTrack.trapRate}%` : "—", label: "Track más difícil", accent: "text-[var(--danger)]" },
                ].map(({ icon: Icon, value, label, accent }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-2 py-5"
                  >
                    <Icon className={`h-5 w-5 ${accent}`} strokeWidth={1.75} />
                    <p className={`font-playfair text-xl font-bold tabular-nums ${accent}`}>{value}</p>
                    <p className="text-center text-[10px] leading-tight text-[var(--cream-muted)]">{label}</p>
                  </div>
                ))}
              </motion.div>

              {/* Per-track bars */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {stats
                  .sort((a, b) => b.trapRate - a.trapRate)
                  .map((stat) => {
                    const meta       = TrackMeta[stat.track as Mission["track"]];
                    const isHigh     = stat.trapRate >= 60;
                    const isMedium   = stat.trapRate >= 30;
                    const barColor   = isHigh   ? "bg-[var(--danger)]"  : isMedium ? "bg-[var(--amber)]"  : "bg-[var(--success)]";
                    const badgeClass = isHigh
                      ? "text-[var(--danger)]  bg-[var(--danger-subtle)]  border-[var(--danger-border)]"
                      : isMedium
                      ? "text-[var(--amber)]   bg-[var(--amber-subtle)]   border-[var(--amber-border)]"
                      : "text-[var(--success)] bg-[var(--success-subtle)] border-[var(--success-border)]";

                    return (
                      <motion.div
                        key={stat.track}
                        variants={itemVariants}
                        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
                      >
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <TrackIconBadge track={stat.track as Mission["track"]} size={16} />
                            <span className="text-sm font-semibold text-[var(--cream)]">
                              {meta?.label ?? stat.track}
                            </span>
                          </div>
                          <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badgeClass}`}>
                            {stat.trapRate}% caen
                          </span>
                        </div>

                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/8">
                          <motion.div
                            className={`h-full rounded-full ${barColor}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.trapRate}%` }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>

                        <p className="mt-2 text-xs text-[var(--cream-muted)]">
                          {stat.fellForTrap} de {stat.totalUsers} usuario{stat.totalUsers !== 1 ? "s" : ""}{" "}
                          cayó al primer intento
                        </p>
                      </motion.div>
                    );
                  })}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, AlertTriangle, Loader2 } from "lucide-react";
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

function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <Icon className="h-5 w-5 text-[var(--gold)]" strokeWidth={1.75} />
      <p className="text-2xl font-bold text-[var(--cream)]">{value}</p>
      <p className="text-center text-xs text-[var(--cream-muted)]">{label}</p>
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats]           = useState<TrackStat[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);

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

  return (
    <div className="min-h-dvh pb-24">
      <AppNav back="/dashboard" />

      <div className="px-4 py-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-6">
            <h1 className="font-playfair text-2xl font-bold text-[var(--cream)]">
              Estadísticas
            </h1>
            <p className="mt-1 text-sm text-[var(--cream-muted)]">
              ¿En qué trampa cae más la gente?
            </p>
            {generatedAt && (
              <p className="mt-1 text-xs text-[var(--cream-muted)]/50">
                Actualizado {new Date(generatedAt).toLocaleString("es-MX")}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              {/* Skeleton summary */}
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="skeleton h-24 rounded-2xl" />
                ))}
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-20 rounded-2xl" />
              ))}
            </div>
          ) : stats.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--navy)]">
                <TrendingUp className="h-7 w-7 text-[var(--cream-muted)]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--cream)]">
                  Sin datos aún
                </p>
                <p className="mt-1 text-xs text-[var(--cream-muted)]">
                  ¡Sé el primero en entrenar y aparecer aquí!
                </p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={Users}
                  value={String(totalUsers)}
                  label="usuarios entrenados"
                />
                <StatCard
                  icon={AlertTriangle}
                  value={`${avgTrapRate}%`}
                  label="tasa de trampa promedio"
                />
              </div>

              {/* Per-track */}
              {stats.map((stat, i) => {
                const meta = TrackMeta[stat.track as Mission["track"]];
                const isHigh   = stat.trapRate >= 60;
                const isMedium = stat.trapRate >= 30;
                const barColor = isHigh
                  ? "bg-[var(--danger)]"
                  : isMedium
                  ? "bg-[var(--amber)]"
                  : "bg-[var(--success)]";
                const badgeClass = isHigh
                  ? "text-[var(--danger)] bg-[var(--danger-subtle)] border-[var(--danger-border)]"
                  : isMedium
                  ? "text-[var(--amber)] bg-[var(--amber-subtle)] border-[var(--amber-border)]"
                  : "text-[var(--success)] bg-[var(--success-subtle)] border-[var(--success-border)]";

                return (
                  <motion.div
                    key={stat.track}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: i * 0.08,
                      type: "spring",
                      stiffness: 280,
                      damping: 26,
                    }}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <TrackIconBadge
                          track={stat.track as Mission["track"]}
                          size={16}
                        />
                        <span className="text-sm font-medium text-[var(--cream)]">
                          {meta?.label ?? stat.track}
                        </span>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold ${badgeClass}`}>
                        {stat.trapRate}% caen
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/8">
                      <motion.div
                        className={`h-full rounded-full ${barColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.trapRate}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-[var(--cream-muted)]">
                      {stat.fellForTrap} de {stat.totalUsers} usuarios cayeron al primer
                      intento
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {loading && (
        <div className="mt-4 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--cream-muted)]" />
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TrackMeta } from "@/missions/schema";
import type { Mission } from "@/missions/schema";

interface TrackStat {
  track: string;
  totalUsers: number;
  fellForTrap: number;
  trapRate: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<TrackStat[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats ?? []);
        setGeneratedAt(d.generatedAt ?? null);
      });
  }, []);

  const totalUsers = Math.max(...(stats.map((s) => s.totalUsers).concat([0])));

  return (
    <div className="min-h-dvh px-4 py-6">
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-1.5 text-sm text-[var(--cream-muted)] hover:text-[var(--cream)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <h1 className="serif text-2xl font-bold text-[var(--cream)]">Estadísticas</h1>
          <p className="mt-1 text-sm text-[var(--cream-muted)]">
            ¿En qué trampa cae más la gente?
          </p>
          {generatedAt && (
            <p className="mt-1 text-xs text-[var(--cream-muted)]/50">
              {new Date(generatedAt).toLocaleString("es-MX")}
            </p>
          )}
        </div>

        {stats.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <TrendingUp className="h-8 w-8 text-[var(--cream-muted)]" />
              <p className="text-sm text-[var(--cream-muted)]">
                Aún no hay datos suficientes. ¡Sé el primero en entrenar!
              </p>
            </div>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="text-center">
                <Users className="mx-auto mb-1 h-5 w-5 text-[var(--gold)]" />
                <p className="text-2xl font-bold text-[var(--cream)]">{totalUsers}</p>
                <p className="text-xs text-[var(--cream-muted)]">usuarios entrenados</p>
              </Card>
              <Card className="text-center">
                <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-amber-400" />
                <p className="text-2xl font-bold text-[var(--cream)]">
                  {stats.length > 0
                    ? Math.round(
                        stats.reduce((a, s) => a + s.trapRate, 0) / stats.length
                      )
                    : 0}%
                </p>
                <p className="text-xs text-[var(--cream-muted)]">tasa de trampa promedio</p>
              </Card>
            </div>

            {/* Per-track */}
            {stats.map((stat, i) => {
              const meta = TrackMeta[stat.track as Mission["track"]];
              return (
                <motion.div
                  key={stat.track}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 280, damping: 26 }}
                >
                  <Card>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span aria-hidden>{meta?.emoji ?? "📊"}</span>
                        <span className="text-sm font-medium text-[var(--cream)]">
                          {meta?.label ?? stat.track}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold
                          ${stat.trapRate >= 60
                            ? "bg-[var(--error)]/20 text-[var(--error)]"
                            : stat.trapRate >= 30
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-[var(--success)]/20 text-[var(--success)]"
                          }`}
                      >
                        {stat.trapRate}% caen
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className={`h-full rounded-full ${
                          stat.trapRate >= 60
                            ? "bg-[var(--error)]"
                            : stat.trapRate >= 30
                            ? "bg-amber-400"
                            : "bg-[var(--success)]"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.trapRate}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-[var(--cream-muted)]">
                      {stat.fellForTrap} de {stat.totalUsers} usuarios cayeron en la trampa
                      al primer intento
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

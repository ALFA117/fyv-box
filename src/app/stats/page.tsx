"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, Users, AlertTriangle, BarChart3, Flame, WifiOff } from "lucide-react";
import Link from "next/link";
import { TrackMeta, type Mission } from "@/missions/schema";
import { TrackIconBadge } from "@/components/TrackIcon";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/Skeleton";
import { AppNav } from "@/components/AppNav";

interface TrackStat {
  track: string;
  totalUsers: number;
  fellForTrap: number;
  trapRate: number;
}

interface StatsResponse {
  stats: TrackStat[];
  uniqueUsers: number;
  generatedAt: string;
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

type LoadState = { kind: "loading" } | { kind: "ready"; data: StatsResponse } | { kind: "error"; message: string };

export default function StatsPage() {
  const reduce = useReducedMotion();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    setState({ kind: "loading" });
    fetch("/api/stats", { signal: ctrl.signal })
      .then(async (r) => {
        const d = await r.json().catch(() => null);
        if (!r.ok || !d || !Array.isArray(d.stats)) throw new Error(d?.error ?? "No pudimos cargar las estadísticas.");
        setState({ kind: "ready", data: d as StatsResponse });
      })
      .catch((err: Error) => {
        if (err.name === "AbortError" && !ctrl.signal.reason) return;
        setState({ kind: "error", message: err.name === "AbortError" ? "El servidor tardó demasiado en responder." : err.message });
      })
      .finally(() => clearTimeout(timer));
    return () => { clearTimeout(timer); ctrl.abort("unmount"); };
  }, [retryKey]);

  const stats = state.kind === "ready" ? [...state.data.stats].sort((a, b) => b.trapRate - a.trapRate) : [];
  const avgTrapRate = stats.length > 0 ? Math.round(stats.reduce((a, s) => a + s.trapRate, 0) / stats.length) : 0;
  const hardest = stats[0];

  return (
    <div className="min-h-dvh">
      <AppNav back={{ href: "/dashboard", label: "Mapa" }} />

      <main id="main" tabIndex={-1} className="outline-none px-gutter pb-safe pt-6">
        <div className="mx-auto max-w-lg">
          <header className="mb-6">
            <div className="mb-1 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-gold" strokeWidth={1.75} aria-hidden />
              <h1 className="text-title-1 text-cream">Estadísticas</h1>
            </div>
            <p className="text-body-sm text-cream-muted">¿En qué trampa cae más la gente al primer intento?</p>
            {state.kind === "ready" && (
              <p className="mt-1 text-xs text-cream-dim">
                Datos reales · actualizado{" "}
                <time dateTime={state.data.generatedAt}>{new Date(state.data.generatedAt).toLocaleString("es-MX")}</time>
              </p>
            )}
          </header>

          {state.kind === "loading" ? (
            <div className="space-y-4" role="status" aria-label="Cargando estadísticas">
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" rounded="lg" />)}
              </div>
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" rounded="lg" />)}
            </div>
          ) : state.kind === "error" ? (
            <StatePanel
              tone="danger"
              icon={WifiOff}
              title="No se pudieron cargar las estadísticas"
              body={state.message}
              action={<Button variant="secondary" onClick={() => setRetryKey((k) => k + 1)}>Reintentar</Button>}
            />
          ) : stats.length === 0 ? (
            <StatePanel
              icon={TrendingUp}
              title="Todavía no hay datos"
              body="Las estadísticas aparecen en cuanto alguien responde su primera misión."
              action={
                <Link href="/dashboard" className="flex min-h-[48px] items-center rounded-xl bg-gold px-5 text-sm font-semibold text-on-gold hover:bg-gold-hover">
                  Responder una misión
                </Link>
              }
            />
          ) : (
            <div className="space-y-5">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.35 }}
                className="grid grid-cols-3 gap-2.5 sm:gap-3"
              >
                {[
                  { icon: Users, value: String(state.kind === "ready" ? state.data.uniqueUsers : 0), label: "Personas", tone: "text-info" },
                  { icon: AlertTriangle, value: `${avgTrapRate}%`, label: "Caen en promedio", tone: "text-amber" },
                  { icon: Flame, value: hardest ? `${hardest.trapRate}%` : "—", label: "Track más difícil", tone: "text-danger" },
                ].map(({ icon: Icon, value, label, tone }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface px-2 py-4 text-center">
                    <Icon className={`h-5 w-5 ${tone}`} strokeWidth={1.75} aria-hidden />
                    <p className={`font-display text-xl font-bold tabular-nums ${tone}`}>{value}</p>
                    <p className="text-xs leading-tight text-cream-muted">{label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.ul
                variants={reduce ? undefined : containerVariants}
                initial={reduce ? false : "hidden"}
                animate={reduce ? undefined : "show"}
                className="space-y-3"
              >
                {stats.map((stat) => {
                  const known = stat.track in TrackMeta;
                  const track = stat.track as Mission["track"];
                  const tone = stat.trapRate >= 60 ? "danger" : stat.trapRate >= 30 ? "amber" : "success";
                  const bar = { danger: "bg-danger", amber: "bg-amber", success: "bg-success" }[tone];
                  const chip = {
                    danger: "text-danger bg-danger-subtle border-danger-border",
                    amber: "text-amber bg-amber-subtle border-amber-border",
                    success: "text-success bg-success-subtle border-success-border",
                  }[tone];

                  return (
                    <motion.li
                      key={stat.track}
                      variants={reduce ? undefined : itemVariants}
                      className="rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-sm)] sm:p-5"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {known && <TrackIconBadge track={track} size={36} />}
                          <span className="text-sm font-semibold text-cream">{known ? TrackMeta[track].label : stat.track}</span>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold ${chip}`}>{stat.trapRate}% caen</span>
                      </div>
                      <div
                        className="h-2 w-full overflow-hidden rounded-full bg-line"
                        role="img"
                        aria-label={`${stat.trapRate}% cayó en la trampa`}
                      >
                        <motion.div
                          className={`h-full origin-left rounded-full ${bar}`}
                          initial={reduce ? false : { scaleX: 0 }}
                          animate={{ scaleX: stat.trapRate / 100 }}
                          transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-cream-muted">
                        {stat.fellForTrap} de {stat.totalUsers} {stat.totalUsers === 1 ? "persona cayó" : "personas cayeron"} al primer intento
                      </p>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

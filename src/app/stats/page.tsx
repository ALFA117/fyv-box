"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, Users, AlertTriangle, BarChart3, Flame, WifiOff, Info } from "lucide-react";
import Link from "next/link";
import { TrackMeta, type Mission } from "@/missions/schema";
import { TrackIconBadge } from "@/components/TrackIcon";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/Skeleton";
import { AppNav } from "@/components/AppNav";
import { AppFooter } from "@/components/AppFooter";

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
  const tiedWithHardest = hardest ? stats.filter((s) => s.trapRate === hardest.trapRate).length - 1 : 0;

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
            <p className="text-body-sm text-cream-muted">Qué módulos engañan más a la gente la primera vez que responde.</p>
            {state.kind === "ready" && (
              <p className="mt-1 text-xs text-cream-dim">
                Actualizado{" "}
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
              <section aria-labelledby="how-title" className="rounded-2xl border border-info-border bg-info-subtle p-4">
                <h2 id="how-title" className="flex items-center gap-2 text-sm font-semibold text-info">
                  <Info className="h-4 w-4 shrink-0" aria-hidden />
                  Cómo leer estos números
                </h2>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-cream-muted">
                  <li>• Solo contamos el <strong className="text-cream">primer intento</strong> de cada persona en cada misión; los reintentos no cuentan.</li>
                  <li>• El porcentaje de cada módulo es: de las personas que lo intentaron, cuántas <strong className="text-cream">cayeron en la trampa</strong> en al menos una misión.</li>
                  <li>• Son respuestas reales guardadas por la app, de billeteras de prueba anónimas en Stellar testnet. No son datos de encuestas ni de otras fuentes.</li>
                </ul>
                {state.kind === "ready" && state.data.uniqueUsers < 30 && (
                  <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-border bg-amber-subtle px-3 py-2.5 text-sm text-amber">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      Muestra pequeña: {state.data.uniqueUsers} {state.data.uniqueUsers === 1 ? "persona" : "personas"} hasta ahora.
                      Los porcentajes cambiarán mucho cuando entre más gente; tómalos como ilustrativos, no como estadística del público.
                    </span>
                  </p>
                )}
              </section>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.35 }}
                className="grid grid-cols-3 gap-2.5 sm:gap-3"
              >
                {[
                  { icon: Users, value: String(state.kind === "ready" ? state.data.uniqueUsers : 0), label: "personas han respondido", sub: null, tone: "text-info" },
                  { icon: AlertTriangle, value: `${avgTrapRate}%`, label: "falla al 1er intento (promedio de módulos)", sub: null, tone: "text-amber" },
                  {
                    icon: Flame,
                    value: hardest ? `${hardest.trapRate}%` : "—",
                    label: "módulo donde más gente falla",
                    sub: hardest && hardest.track in TrackMeta
                      ? `${TrackMeta[hardest.track as Mission["track"]].label}${tiedWithHardest > 0 ? ` (empata con ${tiedWithHardest} más)` : ""}`
                      : null,
                    tone: "text-danger",
                  },
                ].map(({ icon: Icon, value, label, sub, tone }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface px-2 py-4 text-center">
                    <Icon className={`h-5 w-5 ${tone}`} strokeWidth={1.75} aria-hidden />
                    <p className={`font-display text-xl font-bold tabular-nums ${tone}`}>{value}</p>
                    <p className="text-xs leading-tight text-cream-muted">{label}</p>
                    {sub && <p className="text-xs font-semibold leading-tight text-cream">{sub}</p>}
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
                        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold ${chip}`}>{stat.trapRate}% falló</span>
                      </div>
                      <div
                        className="h-2 w-full overflow-hidden rounded-full bg-line"
                        role="img"
                        aria-label={`${stat.trapRate}% falló al primer intento`}
                      >
                        <motion.div
                          className={`h-full origin-left rounded-full ${bar}`}
                          initial={reduce ? false : { scaleX: 0 }}
                          animate={{ scaleX: stat.trapRate / 100 }}
                          transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-cream-muted">
                        {stat.fellForTrap} de {stat.totalUsers} {stat.totalUsers === 1 ? "persona que lo intentó cayó" : "personas que lo intentaron cayeron"} en la trampa en su primer intento
                      </p>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </div>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

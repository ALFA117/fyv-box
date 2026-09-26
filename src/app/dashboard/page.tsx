"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Award, WifiOff, Trophy, Flame, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { getWallet, type WalletIdentity } from "@/identity";
import { MissionCard } from "@/components/MissionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { DashboardSkeleton } from "@/components/Skeleton";
import { TrackIconBadge } from "@/components/TrackIcon";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/Button";
import { TRACK_ORDER, TRACK_STYLE } from "@/components/trackStyle";
import { TrackMeta, type Mission } from "@/missions/schema";
import type { PublicMission } from "@/missions/engine";
import { supabase } from "@/lib/supabase";
import { AppNav } from "@/components/AppNav";

interface TrackGroup {
  track: Mission["track"];
  missions: PublicMission[];
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

function getXpLevel(xp: number) {
  if (xp < 200)  return { level: 1, title: "Novato crypto",      color: "text-cream-muted" };
  if (xp < 500)  return { level: 2, title: "Guardián básico",    color: "text-info" };
  if (xp < 1000) return { level: 3, title: "Cazador de estafas", color: "text-amber" };
  if (xp < 1800) return { level: 4, title: "Detector élite",     color: "text-gold" };
  return           { level: 5, title: "Maestro FYV",             color: "text-success" };
}

async function fetchJson<T>(url: string, ms = 15000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

type LoadState = { kind: "loading" } | { kind: "ready" } | { kind: "error"; message: string };

export default function DashboardPage() {
  const reduce = useReducedMotion();
  const [wallet, setWallet] = useState<WalletIdentity | null>(null);
  const [groups, setGroups] = useState<TrackGroup[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });

    (async () => {
      let w: WalletIdentity;
      try {
        w = await getWallet();
      } catch {
        throw new Error("No pudimos abrir tu billetera de prueba. Permite que el sitio guarde datos e intenta de nuevo.");
      }
      if (!cancelled) setWallet(w);

      const [missions, progress] = await Promise.all([
        fetchJson<PublicMission[]>("/api/missions/list").catch(() => {
          throw new Error("No pudimos cargar las misiones. Revisa tu conexión.");
        }),
        supabase.from("fyv_completed_missions").select("mission_id").eq("stellar_address", w.publicKey),
      ]);
      if (progress.error) throw new Error("No pudimos leer tu progreso. Intenta de nuevo en unos segundos.");

      if (cancelled) return;
      setCompleted(new Set((progress.data ?? []).map((r: { mission_id: string }) => r.mission_id)));
      setGroups(TRACK_ORDER.map((track) => ({ track, missions: missions.filter((m) => m.track === track && !m.comingSoon) })));
      setState({ kind: "ready" });
    })().catch((err: Error) => {
      if (!cancelled) setState({ kind: "error", message: err.message });
    });

    return () => { cancelled = true; };
  }, [retryKey]);

  const allMissions = groups.flatMap((g) => g.missions);
  const totalMissions = allMissions.length;
  const completedCount = allMissions.filter((m) => completed.has(m.id)).length;
  const totalXP = allMissions.filter((m) => completed.has(m.id)).reduce((a, m) => a + m.xp, 0);
  const progressPct = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;
  const lvl = getXpLevel(totalXP);

  return (
    <div className="min-h-dvh">
      <AppNav wallet={wallet} showStats showLogout />

      <main id="main" tabIndex={-1} className="outline-none px-gutter pb-safe pt-6">
        {state.kind === "loading" ? (
          <DashboardSkeleton />
        ) : state.kind === "error" ? (
          <StatePanel
            className="mx-auto max-w-sm"
            tone="danger"
            icon={WifiOff}
            title="No se pudo cargar tu mapa"
            body={state.message}
            action={<Button variant="secondary" onClick={() => setRetryKey((k) => k + 1)}>Reintentar</Button>}
          />
        ) : (
          <div className="mx-auto max-w-2xl space-y-8">
            <h1 className="sr-only">Mapa de misiones</h1>

            <motion.section
              aria-label="Tu progreso"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-3xl border border-line-gold bg-gradient-to-br from-surface to-surface-card p-5 shadow-[var(--shadow-gold)] sm:p-6"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/10 blur-[60px]" aria-hidden />

              <div className="relative mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-subtle ring-1 ring-line-gold" aria-hidden>
                    <Zap className="h-5 w-5 text-gold" strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-label uppercase tracking-wider ${lvl.color}`}>Nivel {lvl.level} · {lvl.title}</p>
                    <p className="text-sm text-cream-muted">
                      <span className="tabular-nums">{completedCount}</span> de <span className="tabular-nums">{totalMissions}</span> misiones
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 rounded-2xl border border-line-gold bg-gold-subtle px-3 py-1.5">
                    <Star className="h-4 w-4 text-gold" fill="currentColor" aria-hidden />
                    <span className="font-display text-xl font-bold tabular-nums text-gold">{totalXP}</span>
                    <span className="text-xs font-bold text-gold">XP</span>
                  </div>
                  {progressPct > 0 && (
                    <span className="flex items-center gap-1 text-xs text-cream-muted">
                      <Flame className="h-3.5 w-3.5 text-amber" aria-hidden />
                      {progressPct}% total
                    </span>
                  )}
                </div>
              </div>

              <ProgressBar value={progressPct} color={progressPct === 100 ? "success" : "gold"} />

              <ul className="relative mt-5 grid grid-cols-1 gap-x-6 gap-y-3.5 min-[400px]:grid-cols-2">
                {groups.map((g) => {
                  const done = g.missions.filter((m) => completed.has(m.id)).length;
                  const total = g.missions.length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  const isDone = pct === 100;
                  return (
                    <li key={g.track}>
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                        <span className={`truncate font-medium ${isDone ? "text-success" : "text-cream-muted"}`}>
                          {isDone && "✓ "}{TrackMeta[g.track].label}
                        </span>
                        <span className="shrink-0 tabular-nums text-cream-muted">{done}/{total}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                        <div
                          className={`h-full rounded-full transition-[width] duration-700 ${isDone ? "bg-success" : TRACK_STYLE[g.track].bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              {progressPct === 100 ? (
                <Link
                  href="/graduation"
                  className="relative mt-5 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-success px-4 text-sm font-bold text-on-gold transition-opacity hover:opacity-90"
                >
                  <Trophy className="h-4 w-4" aria-hidden />
                  Ver mis credenciales
                </Link>
              ) : completedCount > 0 ? (
                <div className="relative mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <Link
                    href="/graduation"
                    className="flex min-h-[44px] items-center gap-2 rounded-xl border border-line-gold px-4 text-sm font-medium text-gold transition-colors hover:bg-gold-subtle"
                  >
                    <Award className="h-4 w-4" aria-hidden />
                    Mis credenciales
                  </Link>
                  <span className="text-xs text-cream-muted">
                    Te faltan {totalMissions - completedCount} misiones para graduarte
                  </span>
                </div>
              ) : (
                <p className="relative mt-5 text-sm text-cream-muted">
                  Empieza por cualquier misión. Cada track completo te da una credencial verificable.
                </p>
              )}
            </motion.section>

            <motion.div
              variants={reduce ? undefined : containerVariants}
              initial={reduce ? false : "hidden"}
              animate={reduce ? undefined : "show"}
              className="space-y-8"
            >
              {groups.map((group) => {
                const meta = TrackMeta[group.track];
                const done = group.missions.filter((m) => completed.has(m.id)).length;
                const total = group.missions.length;
                const isComplete = total > 0 && done === total;

                return (
                  <motion.section key={group.track} variants={reduce ? undefined : itemVariants} aria-labelledby={`track-${group.track}`}>
                    <div className={`mb-3 flex items-center gap-3 rounded-2xl border p-3.5 ${isComplete ? "border-success-border bg-success-subtle" : "border-line bg-surface/50"}`}>
                      <TrackIconBadge track={group.track} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 id={`track-${group.track}`} className="text-title-3 text-cream">{meta.label}</h2>
                          {isComplete ? (
                            <span className="flex items-center gap-1 rounded-full border border-success-border bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
                              <Shield className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                              Completado
                            </span>
                          ) : (
                            <span className="rounded-full border border-line px-2 py-0.5 text-xs tabular-nums text-cream-muted">{done}/{total}</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-cream-muted">{meta.description}</p>
                      </div>
                    </div>

                    {total === 0 ? (
                      <p className="rounded-2xl border border-dashed border-line px-5 py-5 text-center text-sm text-cream-muted">
                        Este track estará disponible próximamente.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {group.missions.map((mission) => (
                          <MissionCard key={mission.id} mission={mission} completed={completed.has(mission.id)} />
                        ))}
                      </div>
                    )}
                  </motion.section>
                );
              })}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

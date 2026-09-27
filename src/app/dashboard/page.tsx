"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Award, WifiOff, Trophy, Flame, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getWallet, type WalletIdentity } from "@/identity";
import { ProgressBar } from "@/components/ProgressBar";
import { DashboardSkeleton } from "@/components/Skeleton";
import { ModulePath } from "./ModulePath";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/Button";
import { TRACK_ORDER } from "@/components/trackStyle";
import type { Mission } from "@/missions/schema";
import type { PublicMission } from "@/missions/engine";
import { supabase } from "@/lib/supabase";
import { AppNav } from "@/components/AppNav";
import { AppFooter } from "@/components/AppFooter";

interface TrackGroup {
  track: Mission["track"];
  missions: PublicMission[];
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

const LEVELS = [
  { level: 1, min: 0,    title: "Novato crypto",      color: "text-cream-muted" },
  { level: 2, min: 200,  title: "Guardián básico",    color: "text-info" },
  { level: 3, min: 500,  title: "Cazador de estafas", color: "text-amber" },
  { level: 4, min: 1000, title: "Detector élite",     color: "text-gold" },
  { level: 5, min: 1800, title: "Maestro FYV",        color: "text-success" },
];

function getXpLevel(xp: number) {
  const idx = LEVELS.reduce((acc, l, i) => (xp >= l.min ? i : acc), 0);
  return { ...LEVELS[idx], next: LEVELS[idx + 1] ?? null };
}

function LevelRing({ level, pct }: { level: number; pct: number }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <div className="relative h-14 w-14 shrink-0" role="img" aria-label={`Nivel ${level}, ${Math.round(clamped * 100)}% hacia el siguiente`}>
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border-strong)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r} fill="none" stroke="var(--gold)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - clamped)}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-gold" aria-hidden>
        {level}
      </span>
    </div>
  );
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
  const nextMission = groups.flatMap((g) => g.missions).find((m) => !completed.has(m.id)) ?? null;

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
                  <LevelRing
                    level={lvl.level}
                    pct={lvl.next ? (totalXP - lvl.min) / (lvl.next.min - lvl.min) : 1}
                  />
                  <div className="min-w-0">
                    <p className={`text-label uppercase tracking-wider ${lvl.color}`}>Nivel {lvl.level} · {lvl.title}</p>
                    <p className="text-sm text-cream-muted">
                      <span className="tabular-nums">{completedCount}</span> de <span className="tabular-nums">{totalMissions}</span> misiones completadas
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

              <ProgressBar value={progressPct} label="Progreso total" color={progressPct === 100 ? "success" : "gold"} />

              {lvl.next && (
                <p className="relative mt-3 text-sm text-cream-muted">
                  <span className="font-semibold text-cream">Siguiente meta:</span> nivel {lvl.next.level} · {lvl.next.title}.{" "}
                  Te faltan <span className="tabular-nums font-semibold text-gold">{lvl.next.min - totalXP} XP</span>
                  {" "}(cada misión correcta da 100–200 XP).
                </p>
              )}

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
                    Te faltan {totalMissions - completedCount} misiones para completar todo
                  </span>
                </div>
              ) : (
                <p className="relative mt-5 text-sm text-cream-muted">
                  Es normal empezar en cero. Completa todas las misiones de un módulo para ganar su credencial.
                </p>
              )}

              {nextMission && (
                <Link
                  href={`/mission/${nextMission.id}`}
                  className="relative mt-4 flex min-h-[52px] items-center justify-between gap-3 rounded-xl bg-gold px-4 text-on-gold transition-colors hover:bg-gold-hover active:bg-gold-active"
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold opacity-80">{completedCount === 0 ? "Empieza aquí" : "Tu siguiente misión"}</span>
                    <span className="block truncate text-sm font-bold">{nextMission.title}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
                </Link>
              )}
            </motion.section>

            <motion.div
              variants={reduce ? undefined : containerVariants}
              initial={reduce ? false : "hidden"}
              animate={reduce ? undefined : "show"}
              className="space-y-10"
            >
              {groups.filter((g) => g.missions.length > 0).map((group) => (
                <motion.div key={group.track} variants={reduce ? undefined : itemVariants}>
                  <ModulePath track={group.track} missions={group.missions} completed={completed} nextId={nextMission?.id ?? null} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}

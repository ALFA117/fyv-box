"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle, XCircle, Award, ArrowRight, Star, ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { getWallet } from "@/identity";
import { Button } from "@/components/ui/Button";
import { AppNav } from "@/components/AppNav";
import { AppFooter } from "@/components/AppFooter";
import { useToast } from "@/components/Toast";
import { TRACK_STYLE, DIFFICULTY } from "@/components/trackStyle";
import { TrackMeta } from "@/missions/schema";
import type { PublicMission } from "@/missions/engine";
import { completionMessage } from "@/lib/ownership";
import { ScenarioFrame } from "./ScenarioFrames";
import { MascotGuide, type MascotMood } from "./MascotGuide";

interface MissionResult {
  isCorrect: boolean;
  explanation: string;
  xpEarned: number;
  newCertifications: string[];
  selectedOptionLabel: string;
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

interface NextMission {
  id: string;
  title: string;
  sameTrack: boolean;
}

export function MissionClient({ mission, next }: { mission: PublicMission; next: NextMission | null }) {
  const reduce = useReducedMotion();
  const { toast } = useToast();

  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<MissionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Warm up the wallet (keypair + testnet funding) while the user reads the scenario.
  useEffect(() => { getWallet().catch(() => {}); }, []);

  useEffect(() => {
    if (result) resultRef.current?.focus({ preventScroll: true });
    if (result) resultRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [result, reduce]);

  async function handleSubmit() {
    if (!selected || inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);

    try {
      let wallet;
      try {
        wallet = await getWallet();
      } catch {
        throw new Error("No pudimos abrir tu billetera de prueba. Revisa que tu navegador permita guardar datos del sitio.");
      }

      const issuedAt = Date.now();
      const payload = { stellarAddress: wallet.publicKey, missionId: mission.id, selectedOptionId: selected, issuedAt };
      const signature = await wallet.signMessage(completionMessage(payload));

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      let res: Response;
      try {
        res = await fetch("/api/missions/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, signature }),
          signal: ctrl.signal,
        });
      } catch {
        throw new Error("Sin conexión con el servidor. Revisa tu internet e intenta de nuevo.");
      } finally {
        clearTimeout(timer);
      }

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data.isCorrect !== "boolean") {
        throw new Error(data?.error ?? "Algo salió mal al guardar tu respuesta. Intenta de nuevo.");
      }

      setResult({ ...data, newCertifications: Array.isArray(data.newCertifications) ? data.newCertifications : [] });
      if (data.isCorrect) toast(`+${data.xpEarned} XP guardados en tu progreso`, "success");
      if (data.newCertifications?.length) toast("¡Nueva credencial emitida!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo.";
      setError(msg);
      toast(msg, "error");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  function retry() {
    setResult(null);
    setSelected(null);
    setError(null);
  }

  const diff = DIFFICULTY[mission.difficulty];
  const style = TRACK_STYLE[mission.track];
  const trackName = TrackMeta[mission.track]?.label ?? mission.track;
  const letters = ["A", "B", "C", "D", "E", "F"];
  const mood: MascotMood = submitting
    ? "saving"
    : result
      ? (result.isCorrect ? "correct" : "trap")
      : error ? "error" : selected ? "selected" : "idle";

  const confirm = (
    <>
      <Button className="w-full" size="lg" disabled={!selected} loading={submitting} onClick={handleSubmit}>
        {submitting ? "Guardando…" : selected ? "Confirmar respuesta" : "Elige una opción"}
        {!submitting && selected && <ArrowRight className="h-4 w-4" aria-hidden />}
      </Button>
      <p className="mt-2 text-center text-xs text-cream-dim">
        Escenario simulado · tu respuesta se guarda con tu billetera de prueba
      </p>
    </>
  );

  return (
    <div className="relative min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${style.glow} 0%, transparent 70%)` }}
      />
      <AppNav back={{ href: "/dashboard", label: "Mapa" }} />

      <div
        className="px-gutter sticky z-30 border-b border-line bg-navy/90 backdrop-blur-md"
        style={{ top: "calc(var(--header-h) + var(--safe-top))" }}
      >
        <div className="mx-auto flex h-11 max-w-5xl items-center justify-between gap-3">
          <nav aria-label="Ruta" className="flex min-w-0 items-center gap-1.5 text-xs text-cream-muted">
            <Link href="/dashboard" className="-ml-2 flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-lg px-2 transition-colors hover:text-gold">Mapa</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className={`truncate font-semibold ${style.text}`}>{trackName}</span>
          </nav>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-line-gold bg-gold-subtle px-2.5 py-1 text-xs font-bold text-gold">
            <Star className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
            {mission.xp} XP
          </span>
        </div>
      </div>

      <main id="main" tabIndex={-1} className={`outline-none px-gutter py-6 sm:py-8 pb-4`}>
        <div className="mx-auto max-w-5xl">
          <header className="mb-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.chip}`}>{trackName}</span>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${diff.chip}`}>{diff.label}</span>
            </div>
            <h1 className="text-title-1 text-cream">{mission.title}</h1>
          </header>

          <div className="lg:grid lg:grid-cols-5 lg:gap-8">
            <section aria-label="Escenario" className="mb-8 lg:col-span-3 lg:mb-0">
              <ScenarioFrame mission={mission} />
            </section>

            <section aria-label="Tu respuesta" className="lg:col-span-2">
              <div className="lg:sticky" style={{ top: "calc(var(--header-h) + var(--safe-top) + 64px)" }}>
                <MascotGuide mood={mood} />
                <AnimatePresence mode="wait" initial={false}>
                  {!result ? (
                    <motion.div
                      key="options"
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      className="space-y-3"
                    >
                      <h2 id="options-title" className="text-eyebrow text-gold">¿Cómo respondes?</h2>

                      <div role="radiogroup" aria-labelledby="options-title" className="space-y-2.5">
                        {mission.options.map((opt, i) => {
                          const isSel = selected === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              role="radio"
                              aria-checked={isSel}
                              disabled={submitting}
                              onClick={() => { setSelected(opt.id); setError(null); }}
                              className={[
                                "group flex min-h-[56px] w-full cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.985] disabled:cursor-not-allowed motion-reduce:active:scale-100",
                                isSel
                                  ? "border-gold bg-gold-subtle shadow-[var(--shadow-gold)]"
                                  : "border-line bg-surface hover:border-line-gold hover:bg-surface-2 active:bg-surface-3",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                                  isSel ? "bg-gold text-on-gold" : "bg-surface-2 text-cream-muted group-hover:text-gold",
                                ].join(" ")}
                                aria-hidden
                              >
                                {letters[i]}
                              </span>
                              <span className={`pt-0.5 text-[15px] leading-snug ${isSel ? "text-cream" : "text-cream-muted group-hover:text-cream"}`}>
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {error && (
                        <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger-border bg-danger-subtle px-3.5 py-3 text-sm text-danger">
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                          {error}
                        </p>
                      )}

                      <div className="hidden pt-1 lg:block">{confirm}</div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      ref={resultRef}
                      tabIndex={-1}
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 26 }}
                      className="space-y-4 outline-none"
                      style={{ scrollMarginTop: "calc(var(--header-h) + var(--safe-top) + 56px)" }}
                      aria-live="polite"
                    >
                      <div
                        className={`relative overflow-hidden rounded-2xl border p-5 ${result.isCorrect ? "border-success-border bg-success-subtle" : "border-danger-border bg-danger-subtle"}`}
                      >
                        <div className="relative flex items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ${result.isCorrect ? "bg-success/20 ring-success" : "bg-danger/20 ring-danger"}`}
                            aria-hidden
                          >
                            {result.isCorrect
                              ? <CheckCircle className="h-5 w-5 text-success" strokeWidth={2} />
                              : <XCircle className="h-5 w-5 text-danger" strokeWidth={2} />}
                          </div>
                          <div className="min-w-0">
                            <h2 className={`text-title-3 ${result.isCorrect ? "text-success" : "text-danger"}`}>
                              {result.isCorrect ? `¡Correcto! +${result.xpEarned} XP` : "Caíste en la trampa"}
                            </h2>
                            <p className="mt-1 text-xs text-cream-muted">Elegiste: {result.selectedOptionLabel}</p>
                            <p className="mt-3 text-sm leading-relaxed text-cream">{result.explanation}</p>
                          </div>
                        </div>
                      </div>

                      {result.newCertifications.length > 0 && (
                        <motion.div
                          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={reduce ? { duration: 0 } : { delay: 0.2, type: "spring", stiffness: 280, damping: 24 }}
                          className="flex flex-col items-center gap-3 rounded-2xl border border-line-gold bg-gold-subtle p-5 text-center shadow-[var(--shadow-gold)]"
                        >
                          <Award className="h-8 w-8 text-gold" strokeWidth={1.5} aria-hidden />
                          <div>
                            <p className="font-bold text-gold">¡Módulo certificado!</p>
                            <p className="mt-0.5 text-sm text-cream-muted">
                              {result.newCertifications
                                .map((m) => TrackMeta[m as keyof typeof TrackMeta]?.label ?? m)
                                .join(", ")}
                            </p>
                          </div>
                          <Link href="/graduation" className="tap inline-flex items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-cream hover:text-gold">
                            Ver mi credencial <ArrowRight className="h-4 w-4" aria-hidden />
                          </Link>
                        </motion.div>
                      )}

                      <div className="grid gap-2.5">
                        {next && (
                          <Link
                            href={`/mission/${next.id}`}
                            className="flex min-h-[56px] items-center justify-between gap-3 rounded-xl bg-gold px-5 text-on-gold transition-colors hover:bg-gold-hover active:bg-gold-active"
                          >
                            <span className="min-w-0 text-left">
                              <span className="block text-xs font-semibold opacity-80">
                                {next.sameTrack ? "Siguiente misión" : "Siguiente módulo"}
                              </span>
                              <span className="block truncate text-sm font-bold">{next.title}</span>
                            </span>
                            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
                          </Link>
                        )}
                        <Link
                          href="/dashboard"
                          className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors ${next ? "border border-line-gold text-cream hover:bg-gold-subtle" : "bg-gold text-on-gold hover:bg-gold-hover"}`}
                        >
                          Volver al mapa de misiones
                        </Link>
                        {!result.isCorrect && (
                          <Button variant="ghost" onClick={retry}>
                            <RotateCcw className="h-4 w-4" aria-hidden />
                            Intentar de nuevo
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>
      </main>
      <AppFooter clearFixedBar={!result} />

      {/* Thumb-reachable confirm bar on phones (outside animated/transformed ancestors so `fixed` works) */}
      {!result && (
        <div className="px-gutter pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-navy/95 pt-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto max-w-lg">{confirm}</div>
        </div>
      )}
    </div>
  );
}

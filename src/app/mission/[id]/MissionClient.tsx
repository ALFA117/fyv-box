"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckCircle, XCircle, Award, ArrowRight, AlertTriangle, ExternalLink,
  Star, ChevronRight, Reply, Forward, Trash2, Clock, FlaskConical, RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { getWallet } from "@/identity";
import { Button } from "@/components/ui/Button";
import { AppNav } from "@/components/AppNav";
import { useToast } from "@/components/Toast";
import { TRACK_STYLE, DIFFICULTY } from "@/components/trackStyle";
import { TrackMeta } from "@/missions/schema";
import type { PublicMission } from "@/missions/engine";
import { completionMessage } from "@/lib/ownership";

interface MissionResult {
  isCorrect: boolean;
  explanation: string;
  xpEarned: number;
  newCertifications: string[];
  selectedOptionLabel: string;
}

/* ─── Scenario frames (simulated third-party UIs) ─────────────────────────── */

function SimBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-border bg-amber-subtle px-2 py-0.5 text-xs font-semibold text-amber">
      <FlaskConical className="h-3 w-3" aria-hidden />
      Simulación
    </span>
  );
}

function WindowChrome({ title, className = "" }: { title: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 border-b border-line px-4 py-2.5 ${className}`}>
      <div className="flex gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-sim-red" />
        <span className="h-2.5 w-2.5 rounded-full bg-sim-yellow" />
        <span className="h-2.5 w-2.5 rounded-full bg-sim-green" />
      </div>
      <span className="min-w-0 flex-1 truncate text-center text-xs font-medium text-cream-muted">{title}</span>
      <SimBadge />
    </div>
  );
}

function Row({ k, v, danger = false }: { k: string; v: React.ReactNode; danger?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-cream-muted">{k}</span>
      <span className={`min-w-0 truncate text-right ${danger ? "text-danger" : "text-cream"}`}>{v}</span>
    </div>
  );
}

function EmailFrame({ mission }: { mission: PublicMission }) {
  const params = (mission.actionParams ?? {}) as Record<string, string>;
  const fakeDomain = params.fakeDomain ?? "soporte-urgente.io";

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[var(--shadow-lg)]">
      <WindowChrome title="Correo — Bandeja de entrada" className="bg-navy/80" />

      <div className="border-b border-line bg-surface-2/60 px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-cream">Soporte Lumena</span>
          <span className="flex shrink-0 items-center gap-1 text-xs text-cream-muted">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            09:47
          </span>
        </div>
        <p className="truncate text-xs text-danger">Acción urgente — tu cuenta está comprometida</p>
      </div>

      <div className="border-b border-line px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-danger-border bg-danger-subtle text-sm font-bold text-danger" aria-hidden>
            S
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-cream">Soporte Lumena</span>
              <span className="rounded-md border border-danger-border bg-danger-subtle px-1.5 py-0.5 text-xs font-bold text-danger">
                Remitente externo
              </span>
            </div>
            <p className="mt-0.5 break-all font-mono text-xs text-danger">&lt;soporte@{fakeDomain}&gt;</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-cream-muted">Para: tu@correo.com</p>
      </div>

      <div className="px-4 py-5 sm:px-5">
        <p className="mb-3 flex items-start gap-2 text-sm font-bold text-cream">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
          Acción urgente — tu cuenta está comprometida
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-cream-muted">{mission.narrative}</p>
        <div className="mt-5 flex max-w-full items-center gap-2 rounded-xl border border-danger-border bg-danger-subtle px-3.5 py-2.5">
          <ExternalLink className="h-4 w-4 shrink-0 text-danger" aria-hidden />
          <span className="min-w-0 truncate font-mono text-xs font-medium text-danger">{fakeDomain}</span>
          <span className="ml-auto shrink-0 text-xs text-danger">No verificado</span>
        </div>
      </div>

      {/* Decorative toolbar of the fake mail client — not interactive on purpose */}
      <div className="flex items-center gap-4 border-t border-line bg-surface-2/50 px-4 py-2.5 text-xs text-cream-muted" aria-hidden>
        <span className="flex items-center gap-1.5"><Reply className="h-3.5 w-3.5" />Responder</span>
        <span className="flex items-center gap-1.5"><Forward className="h-3.5 w-3.5" />Reenviar</span>
        <span className="flex items-center gap-1.5"><Trash2 className="h-3.5 w-3.5" />Eliminar</span>
      </div>
    </div>
  );
}

function DiscordFrame({ mission }: { mission: PublicMission }) {
  const params = (mission.actionParams ?? {}) as Record<string, string>;
  const attackerName = params.attackerName ?? "Soporte_Oficial";
  const quotes = (mission.narrative.match(/'([^']+)'/g) ?? [])
    .map((q) => q.replace(/'/g, ""))
    .filter((q) => q !== attackerName);
  const dmMessage = quotes.length > 0 ? quotes.join(" ") : mission.narrative;
  const contextLine = mission.narrative.split("'")[0]?.trim().replace(/:$/, "").trim() ?? "";

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong shadow-[var(--shadow-lg)]">
      <div className="flex items-center gap-2 bg-sim-discord-chrome px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-sim-red" />
          <span className="h-2.5 w-2.5 rounded-full bg-sim-yellow" />
          <span className="h-2.5 w-2.5 rounded-full bg-sim-green" />
        </div>
        <span className="min-w-0 flex-1 truncate text-center text-xs text-sim-discord-muted">Discord — Mensajes directos</span>
        <SimBadge />
      </div>

      {contextLine && (
        <p className="bg-sim-discord-panel px-4 py-2.5 text-xs italic text-sim-discord-muted">{contextLine}</p>
      )}

      <div className="bg-sim-discord-bg p-4">
        <div className="flex gap-3">
          <div className="relative shrink-0" aria-hidden>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sim-discord-accent text-sm font-bold text-sim-discord-text">
              {attackerName[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-sim-discord-bg bg-sim-discord-online" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <span className="break-all text-sm font-semibold text-sim-discord-text">{attackerName}</span>
              <span className="rounded-md border border-sim-discord-accent/40 bg-sim-discord-accent/20 px-1.5 py-0.5 text-xs font-bold text-sim-discord-muted">
                ✓ VERIFICADO
              </span>
              <span className="text-xs text-sim-discord-muted">Hoy 14:32</span>
            </div>
            <p className="rounded-lg bg-sim-discord-panel p-3 text-sm leading-relaxed text-sim-discord-text">{dmMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletFrame({ mission }: { mission: PublicMission }) {
  const params = (mission.actionParams ?? {}) as Record<string, unknown>;
  const assetCode = String(params.assetCode ?? "???");
  const amount = Number(params.amount ?? 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[var(--shadow-lg)]">
      <WindowChrome title="Wallet Stellar" className="bg-navy/80" />
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-amber-border bg-amber-subtle text-xl font-bold text-amber" aria-hidden>
            {assetCode[0]}
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber">Balance recibido</span>
              <span className="rounded-full border border-amber-border bg-amber-subtle px-2 py-0.5 text-xs font-semibold text-amber">Pendiente</span>
            </div>
            <p className="font-mono text-3xl font-bold leading-none tabular-nums text-cream">{amount.toLocaleString("es-MX")}</p>
            <p className="mt-1 text-base font-bold text-amber">{assetCode}</p>
          </div>
        </div>
        <div className="mb-4 space-y-2 rounded-xl bg-navy/60 p-3 font-mono text-xs">
          <Row k="Emisor" v="GABCD…XYZ (sin verificar)" danger />
          <Row k="stellar.toml" v="No encontrado" danger />
          <Row k="Exchanges" v="Ninguno" danger />
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-cream-muted">{mission.narrative}</p>
      </div>
    </div>
  );
}

function TxSignFrame({ mission }: { mission: PublicMission }) {
  const params = (mission.actionParams ?? {}) as Record<string, unknown>;
  const txOp = String(params.txOperation ?? "setOptions");
  const dangerDetail = String(params.dangerDetail ?? "Operación desconocida");
  const masterWeight = params.masterWeightAfter !== undefined ? Number(params.masterWeightAfter) : null;
  const attackerSign = String(params.attackerSigner ?? "GCATT4CK3R...");

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[var(--shadow-lg)]">
      <WindowChrome title="Solicitud de firma" className="bg-navy/80" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start gap-2.5 rounded-xl border border-danger-border bg-danger-subtle px-3.5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
          <div>
            <p className="text-sm font-bold text-danger">Transacción de alto riesgo</p>
            <p className="text-xs text-danger">{dangerDetail}</p>
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-line bg-navy/60 p-3.5 font-mono text-xs">
          <Row k="Operación" v={txOp} />
          <Row k="Add signer" v={attackerSign} danger />
          {masterWeight !== null && (
            <Row k="Master weight" v={`${masterWeight}${masterWeight === 0 ? " (sin control)" : ""}`} danger={masterWeight === 0} />
          )}
          <Row k="Red" v="Stellar Mainnet" />
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-cream-muted">{mission.narrative}</p>
      </div>
    </div>
  );
}

function PresaleFrame({ mission }: { mission: PublicMission }) {
  const params = (mission.actionParams ?? {}) as Record<string, unknown>;
  const tokenCode = String(params.tokenCode ?? "TOKEN");
  const pricePerToken = String(params.pricePerToken ?? "0.001 USDC");
  const returnPromise = String(params.promisedReturn ?? "1000×");
  const deadline = String(params.deadline ?? "24 horas");

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[var(--shadow-lg)]">
      <div className="flex items-center justify-between gap-2 border-b border-line bg-navy px-4 py-3">
        <span className="min-w-0 truncate text-sm font-bold text-cream">{tokenCode} — Preventa privada</span>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-full border border-danger-border bg-danger-subtle px-2 py-0.5 text-xs font-bold text-danger">⏱ {deadline}</span>
          <SimBadge />
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-navy/60 p-3 text-center">
            <p className="mb-1 text-xs text-cream-muted">Precio preventa</p>
            <p className="break-words font-mono text-sm font-bold text-gold">{pricePerToken}</p>
          </div>
          <div className="rounded-xl border border-success-border bg-success-subtle p-3 text-center">
            <p className="mb-1 text-xs text-cream-muted">Retorno prometido</p>
            <p className="break-words font-mono text-sm font-bold text-success">{returnPromise}</p>
          </div>
        </div>
        <ul className="space-y-1.5 rounded-xl border border-danger-border bg-danger-subtle p-3.5 text-xs text-danger">
          <li className="mb-2 list-none font-bold">Señales de alerta</li>
          <li>• Retornos irreales para cualquier proyecto legítimo</li>
          <li>• Urgencia artificial para que decidas sin pensar</li>
          <li>• Sin auditoría de seguridad verificable</li>
        </ul>
        <p className="whitespace-pre-line text-sm leading-relaxed text-cream-muted">{mission.narrative}</p>
      </div>
    </div>
  );
}

function GenericFrame({ mission }: { mission: PublicMission }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[var(--shadow-md)]">
      <WindowChrome title="Escenario" className="bg-navy/60" />
      <p className="whitespace-pre-line p-4 text-sm leading-relaxed text-cream-muted sm:p-5">{mission.narrative}</p>
    </div>
  );
}

function ScenarioFrame({ mission }: { mission: PublicMission }) {
  switch (mission.track) {
    case "phishing":            return <EmailFrame mission={mission} />;
    case "social-engineering":  return <DiscordFrame mission={mission} />;
    case "fake-assets":         return <WalletFrame mission={mission} />;
    case "dangerous-approvals": return <TxSignFrame mission={mission} />;
    case "presale-scam":        return <PresaleFrame mission={mission} />;
    default:                    return <GenericFrame mission={mission} />;
  }
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export function MissionClient({ mission }: { mission: PublicMission }) {
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

      <main id="main" tabIndex={-1} className={`outline-none px-gutter py-6 sm:py-8 ${result ? "pb-safe" : "pb-40 lg:pb-12"}`}>
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

                      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                        <Link
                          href="/dashboard"
                          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-on-gold transition-colors hover:bg-gold-hover active:bg-gold-active"
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

      {/* Thumb-reachable confirm bar on phones (outside animated/transformed ancestors so `fixed` works) */}
      {!result && (
        <div className="px-gutter pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-navy/95 pt-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto max-w-lg">{confirm}</div>
        </div>
      )}
    </div>
  );
}

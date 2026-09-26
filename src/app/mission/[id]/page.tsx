"use client";
import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, Loader2, Award, ArrowRight,
  AlertTriangle, ExternalLink, Star, Shield, Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWallet } from "@/identity";
import { Button } from "@/components/ui/Button";
import { AppNav } from "@/components/AppNav";
import type { Mission } from "@/missions/schema";

/* ─── Tipos ─────────────────────────────────────────────────────────── */
interface MissionResult {
  isCorrect: boolean;
  explanation: string;
  xpEarned: number;
  newCertifications: string[];
  selectedOptionLabel: string;
}

/* ─── Scenario frames (contexto visual por track) ───────────────────── */

function EmailFrame({ mission }: { mission: Mission }) {
  const params = (mission.actionParams ?? {}) as Record<string, string>;
  const fakeDomain = params.fakeDomain ?? "soporte-urgente.io";

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] shadow-[var(--shadow-lg)]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--navy)]/80 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="ml-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--cream-muted)]">
          Correo Electrónico
        </span>
      </div>

      {/* Email headers */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 space-y-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-[var(--cream-muted)]">De</span>
          <span className="rounded bg-[var(--danger-subtle)] px-2 py-0.5 font-mono font-medium text-[var(--danger)] border border-[var(--danger-border)]">
            soporte@{fakeDomain}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-[var(--cream-muted)]">Para</span>
          <span className="text-[var(--cream-muted)]">tu@correo.com</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-14 shrink-0 pt-0.5 text-[var(--cream-muted)]">Asunto</span>
          <span className="flex items-center gap-1.5 font-semibold text-[var(--cream)]">
            <AlertTriangle className="h-3 w-3 shrink-0 text-[var(--amber)]" />
            Acción urgente — tu cuenta está comprometida
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="bg-[var(--surface)]/60 p-5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--cream-muted)]">
          {mission.narrative}
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-subtle)] px-3.5 py-2.5">
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--danger)]" />
          <span className="font-mono text-xs font-medium text-[var(--danger)]">{fakeDomain}</span>
          <span className="ml-auto shrink-0 text-[10px] text-[var(--danger)]">⚠ Dominio sospechoso</span>
        </div>
      </div>
    </div>
  );
}

function DiscordFrame({ mission }: { mission: Mission }) {
  const params = (mission.actionParams ?? {}) as Record<string, string>;
  const attackerName = params.attackerName ?? "Soporte_Oficial";

  // Extraer el mensaje entre comillas del narrative
  const quoteMatches = mission.narrative.match(/'([^']+)'/g) ?? [];
  const dmMessage = quoteMatches.length > 0
    ? quoteMatches.map(q => q.replace(/'/g, "")).join(" ")
    : mission.narrative;
  const contextLine = mission.narrative.split("'")[0]?.trim().replace(/:$/, "").trim() ?? "";

  return (
    <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-lg)]" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Discord channel bar */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#2B2D31", borderBottom: "1px solid rgba(0,0,0,0.25)" }}>
        <span className="text-sm text-[#949CF7] font-bold">#</span>
        <span className="text-sm font-semibold text-white">directo-privado</span>
        <span className="ml-auto text-[10px] text-[#949CF7]">DM</span>
      </div>

      {contextLine && (
        <div className="px-4 py-2 text-xs italic" style={{ background: "#313338", color: "#949CF7", borderBottom: "1px solid rgba(0,0,0,0.2)" }}>
          {contextLine}
        </div>
      )}

      {/* DM message */}
      <div className="p-4" style={{ background: "#313338" }}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5865F2] font-bold text-sm text-white">
              {attackerName[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-[#313338]" style={{ background: "#23a559" }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-white">{attackerName}</span>
              <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-blue-300" style={{ background: "rgba(88,101,242,0.2)", borderColor: "rgba(88,101,242,0.4)" }}>
                ✓ VERIFICADO
              </span>
              <span className="text-xs" style={{ color: "#949CF7" }}>Hoy a las 14:32</span>
            </div>
            <div className="rounded-lg p-3 text-sm leading-relaxed" style={{ background: "#2B2D31", color: "#DBDEE1" }}>
              {dmMessage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletFrame({ mission }: { mission: Mission }) {
  const params = (mission.actionParams ?? {}) as Record<string, unknown>;
  const assetCode = String(params.assetCode ?? "???");
  const amount    = String(params.amount ?? "0");

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] shadow-[var(--shadow-lg)]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--navy)]/80 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="ml-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--cream-muted)]">
          Stellar Testnet Wallet
        </span>
      </div>

      {/* Token card */}
      <div className="bg-[var(--surface)]/60 p-5">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[var(--amber-border)] bg-[var(--amber-subtle)] text-xl font-bold text-[var(--amber)]">
            {assetCode[0]}
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--amber)]">Balance Recibido</span>
              <span className="rounded-full border border-[var(--amber-border)] bg-[var(--amber-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--amber)]">
                PENDIENTE
              </span>
            </div>
            <p className="font-mono text-3xl font-bold leading-none text-[var(--cream)]">
              {Number(amount).toLocaleString()}
            </p>
            <p className="mt-0.5 text-base font-bold text-[var(--amber)]">{assetCode}</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="mb-4 space-y-1.5 rounded-xl bg-[var(--navy)]/60 p-3 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-[var(--cream-muted)]">Emisor</span>
            <span className="text-[var(--danger)]">GABCD…XYZ (sin verificar)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--cream-muted)]">stellar.toml</span>
            <span className="text-[var(--danger)]">❌ No encontrado</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--cream-muted)]">Exchanges conocidos</span>
            <span className="text-[var(--danger)]">❌ Ninguno</span>
          </div>
        </div>

        <p className="whitespace-pre-line text-xs leading-relaxed text-[var(--cream-muted)]">
          {mission.narrative}
        </p>
      </div>
    </div>
  );
}

function TxSignFrame({ mission }: { mission: Mission }) {
  const params = (mission.actionParams ?? {}) as Record<string, unknown>;
  const txOp          = String(params.txOperation ?? "setOptions");
  const dangerDetail  = String(params.dangerDetail ?? "Operación desconocida");
  const masterWeight  = params.masterWeightAfter !== undefined ? Number(params.masterWeightAfter) : null;
  const attackerSign  = String(params.attackerSigner ?? "GCATT4CK3R...");

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] shadow-[var(--shadow-lg)]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--navy)]/80 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="ml-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--cream-muted)]">
          Solicitud de Firma — Stellar Wallet
        </span>
      </div>

      <div className="bg-[var(--surface)]/60 p-5 space-y-4">
        {/* Warning banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-subtle)] px-3.5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" />
          <div>
            <p className="text-xs font-bold text-[var(--danger)]">Transacción de alto riesgo</p>
            <p className="text-xs text-[var(--danger)]/80">{dangerDetail}</p>
          </div>
        </div>

        {/* TX details */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--navy)]/60 p-3.5 font-mono text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-[var(--cream-muted)]">Operación</span>
            <span className="font-bold text-[var(--cream)]">{txOp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--cream-muted)]">Add Signer</span>
            <span className="text-[var(--danger)]">{attackerSign}</span>
          </div>
          {masterWeight !== null && (
            <div className="flex justify-between">
              <span className="text-[var(--cream-muted)]">Master Weight</span>
              <span className={masterWeight === 0 ? "text-[var(--danger)] font-bold" : "text-[var(--cream)]"}>
                {masterWeight}{masterWeight === 0 ? " ⚠ (sin control)" : ""}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[var(--cream-muted)]">Red</span>
            <span className="text-[var(--cream-muted)]">Stellar Mainnet</span>
          </div>
        </div>

        <p className="whitespace-pre-line text-xs leading-relaxed text-[var(--cream-muted)]">
          {mission.narrative}
        </p>
      </div>
    </div>
  );
}

function PresaleFrame({ mission }: { mission: Mission }) {
  const params        = (mission.actionParams ?? {}) as Record<string, unknown>;
  const tokenCode     = String(params.tokenCode ?? "TOKEN");
  const pricePerToken = String(params.pricePerToken ?? "0.001 USDC");
  const returnPromise = String(params.promisedReturn ?? "1000×");
  const deadline      = String(params.deadline ?? "24 horas");

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] shadow-[var(--shadow-lg)]">
      {/* Header bar — fake presale UI */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--navy)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-[var(--success)]/30 ring-1 ring-[var(--success-border)] flex items-center justify-center">
            <span className="text-[10px] font-black text-[var(--success)]">{tokenCode[0]}</span>
          </div>
          <span className="text-xs font-bold text-[var(--cream)]">{tokenCode} — Preventa Privada</span>
        </div>
        <span className="rounded-full bg-[var(--danger-subtle)] border border-[var(--danger-border)] px-2 py-0.5 text-[10px] font-bold text-[var(--danger)]">
          ⏱ {deadline}
        </span>
      </div>

      <div className="bg-[var(--surface)]/60 p-5 space-y-4">
        {/* Price + return */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--navy)]/60 p-3 text-center">
            <p className="text-[10px] text-[var(--cream-muted)] mb-1">Precio Preventa</p>
            <p className="font-mono text-base font-bold text-[var(--gold)]">{pricePerToken}</p>
          </div>
          <div className="rounded-xl border border-[var(--success-border)] bg-[var(--success-subtle)] p-3 text-center">
            <p className="text-[10px] text-[var(--cream-muted)] mb-1">Retorno Prometido</p>
            <p className="font-mono text-base font-bold text-[var(--success)]">{returnPromise}</p>
          </div>
        </div>

        {/* Warning flags */}
        <div className="space-y-1.5 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-subtle)] p-3.5 text-xs">
          <p className="font-bold text-[var(--danger)] mb-2">⚠ Señales de alerta detectadas</p>
          <p className="text-[var(--danger)]/80">• Retornos prometidos irreales para proyectos legítimos</p>
          <p className="text-[var(--danger)]/80">• Urgencia artificial para forzar decisiones apresuradas</p>
          <p className="text-[var(--danger)]/80">• Sin auditoría de seguridad verificable</p>
        </div>

        <p className="whitespace-pre-line text-xs leading-relaxed text-[var(--cream-muted)]">
          {mission.narrative}
        </p>
      </div>
    </div>
  );
}

function GenericFrame({ mission }: { mission: Mission }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--navy)]/60 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="ml-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--cream-muted)]">
          Simulacro
        </span>
      </div>
      <div className="bg-[var(--surface)]/60 p-5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--cream-muted)]">
          {mission.narrative}
        </p>
      </div>
    </div>
  );
}

function ScenarioFrame({ mission }: { mission: Mission }) {
  switch (mission.track) {
    case "phishing":             return <EmailFrame mission={mission} />;
    case "social-engineering":   return <DiscordFrame mission={mission} />;
    case "fake-assets":          return <WalletFrame mission={mission} />;
    case "dangerous-approvals":  return <TxSignFrame mission={mission} />;
    case "presale-scam":         return <PresaleFrame mission={mission} />;
    default:                     return <GenericFrame mission={mission} />;
  }
}

/* ─── Track accent colors ────────────────────────────────────────────── */
const TRACK_META: Record<Mission["track"], { color: string; label: string; icon: typeof Shield }> = {
  "phishing":             { color: "text-[var(--danger)]   bg-[var(--danger-subtle)]   border-[var(--danger-border)]",   label: "Phishing",          icon: Shield },
  "social-engineering":   { color: "text-blue-400          bg-blue-500/10               border-blue-500/20",              label: "Ingeniería Social", icon: Shield },
  "fake-assets":          { color: "text-[var(--amber)]    bg-[var(--amber-subtle)]     border-[var(--amber-border)]",    label: "Activos Falsos",    icon: Zap    },
  "dangerous-approvals":  { color: "text-[var(--danger)]   bg-[var(--danger-subtle)]   border-[var(--danger-border)]",   label: "Aprobaciones",      icon: Shield },
  "presale-scam":         { color: "text-[var(--success)]  bg-[var(--success-subtle)]  border-[var(--success-border)]",  label: "Preventas",         icon: Zap    },
  "key-hygiene":          { color: "text-purple-400        bg-purple-500/10             border-purple-500/20",            label: "Llaves",            icon: Shield },
};

/* ─── Main page ───────────────────────────────────────────────────────── */
export default function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params);
  const router   = useRouter();

  const [mission,    setMission]    = useState<Mission | null>(null);
  const [selected,   setSelected]   = useState<string | null>(null);
  const [result,     setResult]     = useState<MissionResult | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/missions/list")
      .then(r => r.json())
      .then((missions: Mission[]) => {
        setMission(missions.find(m => m.id === id) ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit() {
    if (!selected || !mission) return;
    setSubmitting(true);
    const wallet  = await getWallet();
    const address = wallet?.publicKey ?? "GTEST000000000000000000000000000000000000000000000000000";
    const res = await fetch("/api/missions/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stellarAddress: address, missionId: mission.id, selectedOptionId: selected }),
    });
    setResult(await res.json());
    setSubmitting(false);
  }

  /* ── Loading / not found ── */
  if (loading) return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
    </div>
  );

  if (!mission) return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <XCircle className="h-10 w-10 text-[var(--danger)]" strokeWidth={1.5} />
      <p className="text-sm text-[var(--cream-muted)]">Misión no encontrada</p>
      <Link href="/dashboard" className="text-sm text-[var(--gold)] hover:underline">Volver al mapa</Link>
    </div>
  );

  const difficultyLabel = { beginner: "Básico", intermediate: "Intermedio", advanced: "Avanzado" }[mission.difficulty];
  const difficultyColor = { beginner: "text-[var(--success)]", intermediate: "text-[var(--amber)]", advanced: "text-[var(--danger)]" }[mission.difficulty];
  const trackMeta = TRACK_META[mission.track];

  return (
    <div className="min-h-dvh pb-28">
      <AppNav back="/dashboard" />

      <div className="px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl space-y-6"
        >

          {/* ── Header ── */}
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${trackMeta.color}`}>
                {trackMeta.label}
              </span>
              <span className={`text-xs font-bold ${difficultyColor}`}>
                {difficultyLabel}
              </span>
              <span className="ml-auto flex items-center gap-1 text-xs font-bold text-[var(--gold)]">
                <Star className="h-3.5 w-3.5" fill="currentColor" />
                {mission.xp} XP
              </span>
            </div>
            <h1 className="font-playfair text-2xl font-bold leading-tight text-[var(--cream)] sm:text-3xl">
              {mission.title}
            </h1>
          </div>

          {/* ── Scenario frame ── */}
          <ScenarioFrame mission={mission} />

          {/* ── Options ── */}
          <AnimatePresence>
            {!result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
                  ¿Cómo respondes?
                </p>

                {mission.options.map((opt, i) => {
                  const isSelected = selected === opt.id;
                  const letters = ["A", "B", "C", "D"];
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => setSelected(opt.id)}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: "spring", stiffness: 420, damping: 22 }}
                      aria-pressed={isSelected}
                      className={[
                        "group w-full cursor-pointer rounded-2xl border px-4 py-4 text-left transition-all duration-150",
                        isSelected
                          ? "border-[var(--gold)] bg-[var(--gold-subtle)] shadow-[0_0_0_1px_var(--gold),var(--shadow-gold)]"
                          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-gold)] hover:bg-[var(--surface-2)]",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <span className={[
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                          isSelected
                            ? "bg-[var(--gold)] text-[var(--navy)]"
                            : "bg-[var(--surface-2)] text-[var(--cream-muted)] group-hover:bg-[var(--gold-subtle)] group-hover:text-[var(--gold)]",
                        ].join(" ")}>
                          {letters[i]}
                        </span>
                        <span className={`text-sm leading-relaxed transition-colors ${isSelected ? "text-[var(--cream)]" : "text-[var(--cream-muted)] group-hover:text-[var(--cream)]"}`}>
                          {opt.label}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}

                <Button
                  className="mt-2 w-full"
                  disabled={!selected}
                  loading={submitting}
                  onClick={handleSubmit}
                  size="lg"
                >
                  Confirmar respuesta
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Result ── */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="space-y-4"
              >
                {/* Verdict banner */}
                <div className={[
                  "relative overflow-hidden rounded-2xl border p-5",
                  result.isCorrect
                    ? "border-[var(--success-border)] bg-[var(--success-subtle)]"
                    : "border-[var(--danger-border)] bg-[var(--danger-subtle)]",
                ].join(" ")}>
                  {/* Decorative glow */}
                  <div className={[
                    "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl",
                    result.isCorrect ? "bg-[var(--success)]/20" : "bg-[var(--danger)]/20",
                  ].join(" ")} aria-hidden />

                  <div className="relative flex items-start gap-4">
                    <div className={[
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                      result.isCorrect
                        ? "bg-[var(--success)]/20 ring-1 ring-[var(--success)]"
                        : "bg-[var(--danger)]/20 ring-1 ring-[var(--danger)]",
                    ].join(" ")}>
                      {result.isCorrect
                        ? <CheckCircle className="h-6 w-6 text-[var(--success)]" strokeWidth={2} />
                        : <XCircle className="h-6 w-6 text-[var(--danger)]" strokeWidth={2} />
                      }
                    </div>
                    <div>
                      <p className={`font-playfair text-lg font-bold ${result.isCorrect ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                        {result.isCorrect ? `+${result.xpEarned} XP — ¡Correcto!` : "Trampa activada"}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--cream-muted)]">
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* New certification */}
                {result.newCertifications.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 280, damping: 24 }}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border-gold)] bg-[var(--gold-subtle)] p-5 text-center shadow-[var(--shadow-gold)]"
                  >
                    <Award className="h-8 w-8 text-[var(--gold)]" strokeWidth={1.5} />
                    <div>
                      <p className="font-bold text-[var(--gold)]">¡Módulo certificado!</p>
                      <p className="mt-0.5 text-xs text-[var(--cream-muted)]">{result.newCertifications.join(", ")}</p>
                    </div>
                    <Link href="/graduation" className="text-sm font-medium text-[var(--cream)] transition-colors hover:text-[var(--gold)]">
                      Ver mi credencial →
                    </Link>
                  </motion.div>
                )}

                <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard")}>
                  Volver al mapa de misiones
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}

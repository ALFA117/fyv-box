"use client";
import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, Loader2, Award, ArrowRight,
  AlertTriangle, ExternalLink, Star, Shield, Zap,
  ChevronRight, Reply, Forward, Trash2, Lock, Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWallet } from "@/identity";
import { Button } from "@/components/ui/Button";
import { AppNav } from "@/components/AppNav";
import type { Mission } from "@/missions/schema";
import { TrackMeta } from "@/missions/schema";

/* ─── Tipos ─────────────────────────────────────────────────────────── */
interface MissionResult {
  isCorrect: boolean;
  explanation: string;
  xpEarned: number;
  newCertifications: string[];
  selectedOptionLabel: string;
}

/* ──────────────────────────────────────────────────────────────────────
   SCENARIO FRAMES
────────────────────────────────────────────────────────────────────── */

function EmailFrame({ mission }: { mission: Mission }) {
  const params     = (mission.actionParams ?? {}) as Record<string, string>;
  const fakeDomain = params.fakeDomain ?? "soporte-urgente.io";

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] shadow-[var(--shadow-lg)]">
      {/* macOS chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--navy)]/90 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-[0_0_5px_rgba(255,95,87,.55)]" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E] shadow-[0_0_5px_rgba(255,189,46,.55)]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840] shadow-[0_0_5px_rgba(40,200,64,.55)]" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1">
          <Lock className="h-2.5 w-2.5 text-[var(--cream-muted)]" />
          <span className="text-[10px] text-[var(--cream-muted)]">Mail — Bandeja de entrada</span>
        </div>
        <div className="w-14 shrink-0" />
      </div>

      {/* Inbox row */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-2)]/60 px-4 py-2.5">
        <div className="h-2 w-2 shrink-0 rounded-full bg-blue-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--cream)]">Soporte Lumena</span>
            <span className="flex items-center gap-1 text-[10px] text-[var(--cream-muted)]">
              <Clock className="h-3 w-3" />
              09:47
            </span>
          </div>
          <p className="truncate text-[10px] text-[var(--danger)]">⚠ Acción urgente — tu cuenta está comprometida</p>
        </div>
      </div>

      {/* Sender row */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/80 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--danger-border)] bg-[var(--danger-subtle)] text-sm font-bold text-[var(--danger)]">
            S
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[var(--cream)]">Soporte Lumena</span>
              <span className="rounded border border-[var(--danger-border)] bg-[var(--danger-subtle)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--danger)]">
                ⚠ REMITENTE EXTERNO
              </span>
            </div>
            <p className="mt-0.5 font-mono text-xs text-[var(--danger)]">&lt;soporte@{fakeDomain}&gt;</p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-7 shrink-0 text-[var(--cream-muted)]">Para</span>
            <span className="text-[var(--cream-muted)]">tu@correo.com</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-7 shrink-0 pt-0.5 text-[var(--cream-muted)]">CC</span>
            <span className="text-[var(--cream-dim)]">—</span>
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/70 px-5 py-3">
        <p className="flex items-center gap-2 text-sm font-bold text-[var(--cream)]">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--amber)]" />
          Acción urgente — tu cuenta está comprometida
        </p>
      </div>

      {/* Body */}
      <div className="bg-[var(--surface)]/60 px-5 py-5">
        <p className="whitespace-pre-line text-sm leading-[1.75] text-[var(--cream-muted)]">
          {mission.narrative}
        </p>

        {/* Suspicious link pill */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-subtle)] px-4 py-2.5">
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--danger)]" />
          <span className="font-mono text-xs font-medium text-[var(--danger)]">{fakeDomain}</span>
          <span className="ml-1 text-[10px] text-[var(--danger)]/70">⚠ No verificado</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 border-t border-[var(--border)] bg-[var(--surface-2)]/50 px-4 py-2">
        {([
          { Icon: Reply,   label: "Responder" },
          { Icon: Forward, label: "Reenviar" },
          { Icon: Trash2,  label: "Eliminar" },
        ] as const).map(({ Icon, label }) => (
          <button
            key={label}
            aria-label={label}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] text-[var(--cream-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--cream)]"
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DiscordFrame({ mission }: { mission: Mission }) {
  const params       = (mission.actionParams ?? {}) as Record<string, string>;
  const attackerName = params.attackerName ?? "Soporte_Oficial";
  const quoteMatches = mission.narrative.match(/'([^']+)'/g) ?? [];
  const dmMessage    = quoteMatches.length > 0
    ? quoteMatches.map(q => q.replace(/'/g, "")).join(" ")
    : mission.narrative;
  const contextLine = mission.narrative.split("'")[0]?.trim().replace(/:$/, "").trim() ?? "";

  return (
    <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-lg)]" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* macOS chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "#1E1F22", borderBottom: "1px solid rgba(0,0,0,0.3)" }}>
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.06)" }}>
          <span className="text-[10px]" style={{ color: "#949CF7" }}>Discord — Mensajes Directos</span>
        </div>
        <div className="w-14 shrink-0" />
      </div>

      {/* Channel header */}
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "#2B2D31", borderBottom: "1px solid rgba(0,0,0,0.25)" }}>
        <span className="text-sm font-bold" style={{ color: "#949CF7" }}>#</span>
        <span className="text-sm font-semibold text-white">directo-privado</span>
        <span className="ml-auto rounded-full border px-2 py-0.5 text-[10px] font-bold" style={{ borderColor: "rgba(88,101,242,0.4)", background: "rgba(88,101,242,0.15)", color: "#949CF7" }}>DM</span>
      </div>

      {contextLine && (
        <div className="px-4 py-2 text-xs italic" style={{ background: "#313338", color: "#949CF7", borderBottom: "1px solid rgba(0,0,0,0.2)" }}>
          {contextLine}
        </div>
      )}

      {/* Message */}
      <div className="p-4" style={{ background: "#313338" }}>
        <div className="flex gap-3">
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "#5865F2" }}>
              {attackerName[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#313338]" style={{ background: "#23a559" }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
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
  const params    = (mission.actionParams ?? {}) as Record<string, unknown>;
  const assetCode = String(params.assetCode ?? "???");
  const amount    = String(params.amount ?? "0");

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] shadow-[var(--shadow-lg)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--navy)]/80 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="mx-auto text-[10px] font-semibold uppercase tracking-widest text-[var(--cream-muted)]">
          Stellar Testnet Wallet
        </span>
        <div className="w-14 shrink-0" />
      </div>
      <div className="bg-[var(--surface)]/60 p-5">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[var(--amber-border)] bg-[var(--amber-subtle)] text-xl font-bold text-[var(--amber)]">
            {assetCode[0]}
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--amber)]">Balance Recibido</span>
              <span className="rounded-full border border-[var(--amber-border)] bg-[var(--amber-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--amber)]">PENDIENTE</span>
            </div>
            <p className="font-mono text-3xl font-bold leading-none text-[var(--cream)]">{Number(amount).toLocaleString()}</p>
            <p className="mt-0.5 text-base font-bold text-[var(--amber)]">{assetCode}</p>
          </div>
        </div>
        <div className="mb-4 space-y-1.5 rounded-xl bg-[var(--navy)]/60 p-3 font-mono text-xs">
          <div className="flex justify-between"><span className="text-[var(--cream-muted)]">Emisor</span><span className="text-[var(--danger)]">GABCD…XYZ (sin verificar)</span></div>
          <div className="flex justify-between"><span className="text-[var(--cream-muted)]">stellar.toml</span><span className="text-[var(--danger)]">❌ No encontrado</span></div>
          <div className="flex justify-between"><span className="text-[var(--cream-muted)]">Exchanges conocidos</span><span className="text-[var(--danger)]">❌ Ninguno</span></div>
        </div>
        <p className="whitespace-pre-line text-xs leading-relaxed text-[var(--cream-muted)]">{mission.narrative}</p>
      </div>
    </div>
  );
}

function TxSignFrame({ mission }: { mission: Mission }) {
  const params        = (mission.actionParams ?? {}) as Record<string, unknown>;
  const txOp          = String(params.txOperation ?? "setOptions");
  const dangerDetail  = String(params.dangerDetail ?? "Operación desconocida");
  const masterWeight  = params.masterWeightAfter !== undefined ? Number(params.masterWeightAfter) : null;
  const attackerSign  = String(params.attackerSigner ?? "GCATT4CK3R...");

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] shadow-[var(--shadow-lg)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--navy)]/80 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="mx-auto text-[10px] font-semibold uppercase tracking-widest text-[var(--cream-muted)]">
          Solicitud de Firma — Stellar Wallet
        </span>
        <div className="w-14 shrink-0" />
      </div>
      <div className="space-y-4 bg-[var(--surface)]/60 p-5">
        <div className="flex items-start gap-2.5 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-subtle)] px-3.5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" />
          <div>
            <p className="text-xs font-bold text-[var(--danger)]">Transacción de alto riesgo</p>
            <p className="text-xs text-[var(--danger)]/80">{dangerDetail}</p>
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--navy)]/60 p-3.5 font-mono text-xs">
          <div className="flex justify-between"><span className="text-[var(--cream-muted)]">Operación</span><span className="font-bold text-[var(--cream)]">{txOp}</span></div>
          <div className="flex justify-between"><span className="text-[var(--cream-muted)]">Add Signer</span><span className="text-[var(--danger)]">{attackerSign}</span></div>
          {masterWeight !== null && (
            <div className="flex justify-between">
              <span className="text-[var(--cream-muted)]">Master Weight</span>
              <span className={masterWeight === 0 ? "font-bold text-[var(--danger)]" : "text-[var(--cream)]"}>
                {masterWeight}{masterWeight === 0 ? " ⚠ (sin control)" : ""}
              </span>
            </div>
          )}
          <div className="flex justify-between"><span className="text-[var(--cream-muted)]">Red</span><span className="text-[var(--cream-muted)]">Stellar Mainnet</span></div>
        </div>
        <p className="whitespace-pre-line text-xs leading-relaxed text-[var(--cream-muted)]">{mission.narrative}</p>
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
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--navy)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success)]/30 ring-1 ring-[var(--success-border)]">
            <span className="text-[10px] font-black text-[var(--success)]">{tokenCode[0]}</span>
          </div>
          <span className="text-xs font-bold text-[var(--cream)]">{tokenCode} — Preventa Privada</span>
        </div>
        <span className="rounded-full border border-[var(--danger-border)] bg-[var(--danger-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--danger)]">
          ⏱ {deadline}
        </span>
      </div>
      <div className="space-y-4 bg-[var(--surface)]/60 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--navy)]/60 p-3 text-center">
            <p className="mb-1 text-[10px] text-[var(--cream-muted)]">Precio Preventa</p>
            <p className="font-mono text-base font-bold text-[var(--gold)]">{pricePerToken}</p>
          </div>
          <div className="rounded-xl border border-[var(--success-border)] bg-[var(--success-subtle)] p-3 text-center">
            <p className="mb-1 text-[10px] text-[var(--cream-muted)]">Retorno Prometido</p>
            <p className="font-mono text-base font-bold text-[var(--success)]">{returnPromise}</p>
          </div>
        </div>
        <div className="space-y-1.5 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-subtle)] p-3.5 text-xs">
          <p className="mb-2 font-bold text-[var(--danger)]">⚠ Señales de alerta detectadas</p>
          <p className="text-[var(--danger)]/80">• Retornos prometidos irreales para proyectos legítimos</p>
          <p className="text-[var(--danger)]/80">• Urgencia artificial para forzar decisiones apresuradas</p>
          <p className="text-[var(--danger)]/80">• Sin auditoría de seguridad verificable</p>
        </div>
        <p className="whitespace-pre-line text-xs leading-relaxed text-[var(--cream-muted)]">{mission.narrative}</p>
      </div>
    </div>
  );
}

function GenericFrame({ mission }: { mission: Mission }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--navy)]/60 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="mx-auto text-[10px] font-semibold uppercase tracking-widest text-[var(--cream-muted)]">Simulacro</span>
        <div className="w-14 shrink-0" />
      </div>
      <div className="bg-[var(--surface)]/60 p-5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--cream-muted)]">{mission.narrative}</p>
      </div>
    </div>
  );
}

function ScenarioFrame({ mission }: { mission: Mission }) {
  switch (mission.track) {
    case "phishing":            return <EmailFrame mission={mission} />;
    case "social-engineering":  return <DiscordFrame mission={mission} />;
    case "fake-assets":         return <WalletFrame mission={mission} />;
    case "dangerous-approvals": return <TxSignFrame mission={mission} />;
    case "presale-scam":        return <PresaleFrame mission={mission} />;
    default:                    return <GenericFrame mission={mission} />;
  }
}

/* ─── Track accent ───────────────────────────────────────────────────── */
const TRACK_ACCENT: Record<Mission["track"], { pill: string; bar: string; glow: string }> = {
  "phishing":            { pill: "text-[var(--danger)]  border-[var(--danger-border)]  bg-[var(--danger-subtle)]",  bar: "bg-[var(--danger)]",   glow: "rgba(224,82,82,.12)" },
  "social-engineering":  { pill: "text-blue-400          border-blue-500/20              bg-blue-500/10",             bar: "bg-blue-400",           glow: "rgba(80,140,255,.10)" },
  "fake-assets":         { pill: "text-[var(--amber)]   border-[var(--amber-border)]   bg-[var(--amber-subtle)]",   bar: "bg-[var(--amber)]",    glow: "rgba(245,158,11,.10)" },
  "dangerous-approvals": { pill: "text-[var(--danger)]  border-[var(--danger-border)]  bg-[var(--danger-subtle)]",  bar: "bg-[var(--danger)]",   glow: "rgba(224,82,82,.12)" },
  "presale-scam":        { pill: "text-[var(--success)] border-[var(--success-border)] bg-[var(--success-subtle)]", bar: "bg-[var(--success)]",  glow: "rgba(61,184,130,.10)" },
  "key-hygiene":         { pill: "text-purple-400        border-purple-500/20            bg-purple-500/10",           bar: "bg-purple-400",         glow: "rgba(192,132,252,.10)" },
};

/* ─── Main page ───────────────────────────────────────────────────────── */
export default function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [mission,    setMission]    = useState<Mission | null>(null);
  const [selected,   setSelected]   = useState<string | null>(null);
  const [result,     setResult]     = useState<MissionResult | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/missions/list")
      .then(r => r.json())
      .then((missions: Mission[]) => setMission(missions.find(m => m.id === id) ?? null))
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

  const diffLabel = { beginner: "Básico", intermediate: "Intermedio", advanced: "Avanzado" }[mission.difficulty];
  const diffColor = { beginner: "text-[var(--success)]", intermediate: "text-[var(--amber)]", advanced: "text-[var(--danger)]" }[mission.difficulty];
  const accent    = TRACK_ACCENT[mission.track];
  const trackName = TrackMeta[mission.track]?.label ?? mission.track;
  const letters   = ["A", "B", "C", "D"];

  return (
    <div className="min-h-dvh" style={{ background: `radial-gradient(ellipse 80% 40% at 50% 0%, ${accent.glow} 0%, transparent 60%)` }}>
      <AppNav back="/dashboard" />

      {/* ── Track breadcrumb strip ── */}
      <div className="sticky top-14 z-30 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--navy)]/90 px-4 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-[var(--cream-muted)]">
          <Link href="/dashboard" className="shrink-0 transition-colors hover:text-[var(--gold)]">Mapa</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className={`shrink-0 font-semibold ${accent.pill.split(' ')[0]}`}>{trackName}</span>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate text-[var(--cream)]">{mission.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-gold)] bg-[var(--gold-subtle)] px-2.5 py-1">
          <Star className="h-3 w-3 text-[var(--gold)]" fill="currentColor" />
          <span className="text-xs font-bold text-[var(--gold)]">{mission.xp} XP</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 py-7 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl"
        >
          {/* Mission title + meta */}
          <div className="mb-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${accent.pill}`}>
                {trackName}
              </span>
              <span className={`text-xs font-bold ${diffColor}`}>{diffLabel}</span>
            </div>
            <h1 className="font-playfair text-2xl font-bold leading-tight text-[var(--cream)] sm:text-3xl">
              {mission.title}
            </h1>
          </div>

          {/* ── 2-col layout in desktop ── */}
          <div className="lg:grid lg:grid-cols-5 lg:gap-8">

            {/* Left: scenario (3/5) */}
            <div className="mb-6 lg:col-span-3 lg:mb-0">
              <ScenarioFrame mission={mission} />
            </div>

            {/* Right: options (2/5) sticky */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-32">
                <AnimatePresence mode="wait">
                  {!result ? (
                    <motion.div
                      key="options"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
                        ¿Cómo respondes?
                      </p>

                      {mission.options.map((opt, i) => {
                        const isSel = selected === opt.id;
                        return (
                          <motion.button
                            key={opt.id}
                            onClick={() => setSelected(opt.id)}
                            whileTap={{ scale: 0.985 }}
                            transition={{ type: "spring", stiffness: 420, damping: 22 }}
                            aria-pressed={isSel}
                            className={[
                              "group w-full cursor-pointer rounded-2xl border px-4 py-4 text-left transition-all duration-150",
                              isSel
                                ? "border-[var(--gold)] bg-[var(--gold-subtle)] shadow-[0_0_0_1px_var(--gold),var(--shadow-gold)]"
                                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-gold)] hover:bg-[var(--surface-2)]",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <span className={[
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                                isSel
                                  ? "bg-[var(--gold)] text-[var(--navy)]"
                                  : "bg-[var(--surface-2)] text-[var(--cream-muted)] group-hover:bg-[var(--gold-subtle)] group-hover:text-[var(--gold)]",
                              ].join(" ")}>
                                {letters[i]}
                              </span>
                              <span className={`text-sm leading-relaxed transition-colors ${isSel ? "text-[var(--cream)]" : "text-[var(--cream-muted)] group-hover:text-[var(--cream)]"}`}>
                                {opt.label}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}

                      <Button
                        className="mt-1 w-full"
                        disabled={!selected}
                        loading={submitting}
                        onClick={handleSubmit}
                        size="lg"
                      >
                        Confirmar respuesta
                        <ArrowRight className="h-4 w-4" />
                      </Button>

                      <p className="text-center text-[10px] text-[var(--cream-dim)]">
                        Entorno de práctica · Sin fondos reales
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      className="space-y-4"
                    >
                      {/* Verdict */}
                      <div className={[
                        "relative overflow-hidden rounded-2xl border p-5",
                        result.isCorrect
                          ? "border-[var(--success-border)] bg-[var(--success-subtle)]"
                          : "border-[var(--danger-border)] bg-[var(--danger-subtle)]",
                      ].join(" ")}>
                        <div className={[
                          "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl",
                          result.isCorrect ? "bg-[var(--success)]/20" : "bg-[var(--danger)]/20",
                        ].join(" ")} aria-hidden />
                        <div className="relative flex items-start gap-3">
                          <div className={[
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                            result.isCorrect
                              ? "bg-[var(--success)]/20 ring-1 ring-[var(--success)]"
                              : "bg-[var(--danger)]/20 ring-1 ring-[var(--danger)]",
                          ].join(" ")}>
                            {result.isCorrect
                              ? <CheckCircle className="h-5 w-5 text-[var(--success)]" strokeWidth={2} />
                              : <XCircle    className="h-5 w-5 text-[var(--danger)]"   strokeWidth={2} />}
                          </div>
                          <div>
                            <p className={`font-playfair text-base font-bold ${result.isCorrect ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                              {result.isCorrect ? `+${result.xpEarned} XP — ¡Correcto!` : "Trampa activada"}
                            </p>
                            <p className="mt-1.5 text-xs leading-relaxed text-[var(--cream-muted)]">
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
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

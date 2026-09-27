"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle, ExternalLink, Reply, Forward, Trash2, Clock, FlaskConical, QrCode, Lock, ArrowDownLeft,
} from "lucide-react";
import type { PublicMission } from "@/missions/engine";
import { midTruncate } from "@/lib/ownership";

/* Simulated third-party UIs. Every value shown comes from the mission's own
   actionParams/narrative so the frame never contradicts the story. */

type Params = Record<string, unknown>;
const str = (p: Params, k: string) => (typeof p[k] === "string" || typeof p[k] === "number" ? String(p[k]) : undefined);
const firstQuote = (text: string) => text.match(/'([^']+)'/)?.[1];

/* ─── Live time helpers (client-only to avoid hydration mismatches) ───────── */
const hhmm = (d: Date) => d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

/** Wall-clock time N minutes ago, refreshed every 30 s. Null until mounted. */
function useClockAgo(minutesAgo: number) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now ? new Date(now.getTime() - minutesAgo * 60_000) : null;
}

/** "2 horas" / "30 minutos" / "45 min" → seconds. */
function parseDuration(text?: string): number | null {
  if (!text) return null;
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(h|hora|horas|m|min|minuto|minutos)\b/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  return Math.round(/^h/i.test(m[2]) ? n * 3600 : n * 60);
}

/** Counts down once per second from `total` (restarts when it hits zero, like a scam page would). */
function useCountdown(total: number | null) {
  const [left, setLeft] = useState<number | null>(total);
  useEffect(() => {
    if (total === null) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setLeft(total - (elapsed % total));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [total]);
  return left;
}

const clock = (sec: number) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s2 = sec % 60;
  return [h, m, s2].map((v) => String(v).padStart(2, "0")).join(":");
};

export function SimBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-border bg-amber-subtle px-2 py-0.5 text-xs font-semibold text-amber">
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

function Narrative({ text }: { text: string }) {
  return <p className="whitespace-pre-line text-sm leading-relaxed text-cream-muted">{text}</p>;
}

const frame = "overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[var(--shadow-lg)]";

/* ─── Phishing: email ─────────────────────────────────────────────────────── */
function EmailFrame({ mission, p }: { mission: PublicMission; p: Params }) {
  const sentAt = useClockAgo(2);
  const domain = str(p, "fakeDomain") ?? "soporte-urgente.io";
  const sender = str(p, "fakeSender") ?? `soporte@${domain}`;
  const senderName = str(p, "senderName") ?? "Soporte";
  const subject = str(p, "subject") ?? firstQuote(mission.narrative) ?? "Acción urgente";

  return (
    <div className={frame}>
      <WindowChrome title="Correo — Bandeja de entrada" className="bg-navy/80" />
      <div className="border-b border-line px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-danger-border bg-danger-subtle text-sm font-bold text-danger" aria-hidden>
            {senderName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-cream">{senderName}</span>
              <span className="rounded-md border border-danger-border bg-danger-subtle px-1.5 py-0.5 text-xs font-bold text-danger">Remitente externo</span>
            </div>
            <p className="mt-0.5 break-all font-mono text-xs text-danger">&lt;{sender}&gt;</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums text-cream-muted"><Clock className="h-3.5 w-3.5" aria-hidden />{sentAt ? hhmm(sentAt) : "ahora"}</span>
        </div>
        <p className="mt-3 flex items-start gap-2 text-sm font-bold text-cream">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
          {subject}
        </p>
      </div>
      <div className="px-4 py-5 sm:px-5">
        <Narrative text={mission.narrative} />
        <div className="mt-5 flex max-w-full items-center gap-2 rounded-xl border border-danger-border bg-danger-subtle px-3.5 py-2.5">
          <ExternalLink className="h-4 w-4 shrink-0 text-danger" aria-hidden />
          <span className="min-w-0 truncate font-mono text-xs font-medium text-danger">{domain}</span>
          <span className="ml-auto shrink-0 text-xs text-danger">No verificado</span>
        </div>
      </div>
      <div className="flex items-center gap-4 border-t border-line bg-surface-2/50 px-4 py-2.5 text-xs text-cream-muted" aria-hidden>
        <span className="flex items-center gap-1.5"><Reply className="h-3.5 w-3.5" />Responder</span>
        <span className="flex items-center gap-1.5"><Forward className="h-3.5 w-3.5" />Reenviar</span>
        <span className="flex items-center gap-1.5"><Trash2 className="h-3.5 w-3.5" />Eliminar</span>
      </div>
    </div>
  );
}

/* ─── Phishing: QR poster that opens a form ───────────────────────────────── */
function QrFrame({ mission, p }: { mission: PublicMission; p: Params }) {
  const domain = str(p, "fakeDomain") ?? "sitio-desconocido.net";
  const poster = firstQuote(mission.narrative) ?? "Escanea para recibir tu regalo";
  return (
    <div className={frame}>
      <WindowChrome title="Lo que ves en el evento" className="bg-navy/80" />
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-navy/60 p-4 text-center">
          <QrCode className="h-16 w-16 text-cream" strokeWidth={1.25} aria-hidden />
          <p className="text-sm font-semibold text-cream">“{poster}”</p>
          <p className="text-xs text-cream-muted">Cartel pegado en la pared</p>
        </div>
        <div className="rounded-xl border border-line bg-navy/60 p-3">
          <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5">
            <Lock className="h-3.5 w-3.5 shrink-0 text-cream-muted" aria-hidden />
            <span className="min-w-0 truncate font-mono text-xs text-danger">{domain}</span>
          </div>
          <p className="mb-2 text-xs font-semibold text-cream">Verifica tu cuenta para recibir el regalo</p>
          <div className="space-y-2 text-xs" aria-hidden>
            <div className="rounded-lg border border-line px-2.5 py-2 text-cream-muted">Dirección Stellar (G…)</div>
            <div className="rounded-lg border border-danger-border bg-danger-subtle px-2.5 py-2 text-danger">Clave secreta (S…)</div>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 sm:px-5"><Narrative text={mission.narrative} /></div>
    </div>
  );
}

/* ─── Phishing: tiny payment with a malicious memo ────────────────────────── */
function MemoTxFrame({ mission, p }: { mission: PublicMission; p: Params }) {
  const receivedAt = useClockAgo(4);
  const amount = str(p, "amount") ?? "0.0000001";
  const asset = str(p, "asset") ?? "XLM";
  const memo = str(p, "memo") ?? "";
  return (
    <div className={frame}>
      <WindowChrome title="Explorador — historial de tu cuenta" className="bg-navy/80" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2" aria-hidden>
            <ArrowDownLeft className="h-5 w-5 text-cream-muted" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-cream">Pago recibido <span className="font-normal tabular-nums text-cream-muted">· hoy {receivedAt ? hhmm(receivedAt) : ""}</span></p>
            <p className="font-mono text-sm tabular-nums text-cream-muted">{amount} {asset}</p>
          </div>
        </div>
        <div className="space-y-2 rounded-xl bg-navy/60 p-3 font-mono text-xs">
          <Row k="De" v="G… (cuenta desconocida)" />
          <Row k="Memo" v={memo} danger />
        </div>
        <Narrative text={mission.narrative} />
      </div>
    </div>
  );
}

/* ─── Fake assets: token received in the wallet ───────────────────────────── */
function WalletFrame({ mission, p }: { mission: PublicMission; p: Params }) {
  const assetCode = str(p, "assetCode") ?? "???";
  const amount = Number(str(p, "amount") ?? NaN);
  const issuer = str(p, "fakeIssuer");
  const hasToml = p.hasStellarToml === true;

  return (
    <div className={frame}>
      <WindowChrome title="Wallet Stellar" className="bg-navy/80" />
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-amber-border bg-amber-subtle text-xl font-bold text-amber" aria-hidden>
            {assetCode[0]}
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber">Token recibido</span>
              <span className="rounded-full border border-amber-border bg-amber-subtle px-2 py-0.5 text-xs font-semibold text-amber">Sin verificar</span>
            </div>
            {Number.isFinite(amount) && (
              <p className="font-mono text-3xl font-bold leading-none tabular-nums text-cream">{amount.toLocaleString("es-MX")}</p>
            )}
            <p className="mt-1 text-base font-bold text-amber">{assetCode}</p>
          </div>
        </div>
        <div className="mb-4 space-y-2 rounded-xl bg-navy/60 p-3 font-mono text-xs">
          <Row k="Emisor" v={issuer ? midTruncate(issuer, 6, 4) : "Dirección desconocida"} danger />
          <Row k="stellar.toml" v={hasToml ? "Encontrado" : "No encontrado"} danger={!hasToml} />
        </div>
        <Narrative text={mission.narrative} />
      </div>
    </div>
  );
}

/* ─── Fake assets: yield pool ──────────────────────────────────────────────── */
function PoolFrame({ mission, p }: { mission: PublicMission; p: Params }) {
  const apy = str(p, "promisedAPY") ?? "—";
  const tvl = str(p, "tvlDisplay") ?? "—";
  const weeks = str(p, "ageWeeks");
  const asset = str(p, "assetCode") ?? "USDC";
  return (
    <div className={frame}>
      <WindowChrome title={`Pool de liquidez ${asset}`} className="bg-navy/80" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-success-border bg-success-subtle p-3 text-center">
            <p className="mb-1 text-xs text-cream-muted">APY prometido</p>
            <p className="font-mono text-xl font-bold text-success">{apy}</p>
          </div>
          <div className="rounded-xl border border-line bg-navy/60 p-3 text-center">
            <p className="mb-1 text-xs text-cream-muted">Fondos bloqueados</p>
            <p className="font-mono text-xl font-bold text-cream">{tvl}</p>
          </div>
        </div>
        <div className="space-y-2 rounded-xl bg-navy/60 p-3 font-mono text-xs">
          {weeks && <Row k="Antigüedad" v={`${weeks} semanas`} danger />}
          <Row k="Auditoría" v={p.hasAudit === true ? "Sí" : "No"} danger={p.hasAudit !== true} />
          <Row k="stellar.toml" v={p.hasStellarToml === true ? "Encontrado" : "No encontrado"} danger={p.hasStellarToml !== true} />
        </div>
        <Narrative text={mission.narrative} />
      </div>
    </div>
  );
}

/* ─── Dangerous approvals: signature request ──────────────────────────────── */
function TxSignFrame({ mission, p }: { mission: PublicMission; p: Params }) {
  const op = str(p, "txOperation") ?? "setOptions";
  const detail = str(p, "dangerDetail");
  const master = p.masterWeightAfter !== undefined ? Number(p.masterWeightAfter) : null;
  const signers = Array.isArray(p.attackerSigners) ? (p.attackerSigners as string[]) : null;
  const weights = Array.isArray(p.signerWeights) ? (p.signerWeights as number[]) : null;
  const signer = str(p, "attackerSigner");
  const signerWeight = str(p, "attackerWeightAfter");

  return (
    <div className={frame}>
      <WindowChrome title="Solicitud de firma" className="bg-navy/80" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start gap-2.5 rounded-xl border border-danger-border bg-danger-subtle px-3.5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
          <div>
            <p className="text-sm font-bold text-danger">Transacción de alto riesgo</p>
            {detail && <p className="text-xs text-danger">{detail}</p>}
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-line bg-navy/60 p-3.5 font-mono text-xs">
          <Row k="Operación" v={op} />
          {signers
            ? <Row k="Nuevos firmantes" v={`${signers.length}${weights ? ` (peso ${weights[0]} c/u)` : ""}`} danger />
            : signer && <Row k="Nuevo firmante" v={`${signer}${signerWeight ? ` (peso ${signerWeight})` : ""}`} danger />}
          {master !== null && (
            <Row k="Tu peso (master)" v={`${master}${master === 0 ? " — sin control" : ""}`} danger={master <= 1} />
          )}
        </div>
        <Narrative text={mission.narrative} />
      </div>
    </div>
  );
}

/* ─── Presale / whitelist offer ───────────────────────────────────────────── */
function PresaleFrame({ mission, p }: { mission: PublicMission; p: Params }) {
  const token = str(p, "tokenCode") ?? "TOKEN";
  const fee = str(p, "verificationFee");
  const cells = fee
    ? [
        { k: "Pago “de verificación”", v: fee, tone: "gold" },
        { k: "Descuento prometido", v: str(p, "promisedDiscount") ?? "—", tone: "success" },
      ]
    : [
        { k: "Precio preventa", v: str(p, "pricePerToken") ?? "—", tone: "gold" },
        { k: "Retorno prometido", v: str(p, "promisedReturn") ?? "—", tone: "success" },
      ];
  const left = useCountdown(parseDuration(str(p, "deadline")));
  const badge = left !== null
    ? `⏱ Cierra en ${clock(left)}`
    : str(p, "waitDays") ? `Tokens en ${str(p, "waitDays")} días` : null;

  return (
    <div className={frame}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-navy px-4 py-3">
        <span className="min-w-[10rem] flex-1 text-sm font-bold text-cream">{token} — {fee ? "Whitelist exclusiva" : "Preventa privada"}</span>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {badge && (
            <span className="rounded-full border border-danger-border bg-danger-subtle px-2 py-0.5 text-xs font-bold tabular-nums text-danger" aria-live="off">
              {badge}
            </span>
          )}
          <SimBadge />
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3">
          {cells.map((c) => (
            <div key={c.k} className={`rounded-xl border p-3 text-center ${c.tone === "success" ? "border-success-border bg-success-subtle" : "border-line bg-navy/60"}`}>
              <p className="mb-1 text-xs text-cream-muted">{c.k}</p>
              <p className={`break-words font-mono text-sm font-bold ${c.tone === "success" ? "text-success" : "text-gold"}`}>{c.v}</p>
            </div>
          ))}
        </div>
        <Narrative text={mission.narrative} />
      </div>
    </div>
  );
}

/* ─── Social engineering: Discord DM ──────────────────────────────────────── */
function DiscordFrame({ mission, p }: { mission: PublicMission; p: Params }) {
  const sentAt = useClockAgo(1);
  const attackerName = str(p, "attackerName") ?? "Soporte_Oficial";
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
      {contextLine && <p className="bg-sim-discord-panel px-4 py-2.5 text-xs italic text-sim-discord-muted">{contextLine}</p>}
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
              <span className="rounded-md border border-sim-discord-accent/40 bg-sim-discord-accent/20 px-1.5 py-0.5 text-xs font-bold text-sim-discord-muted">✓ VERIFICADO</span>
              <span className="text-xs tabular-nums text-sim-discord-muted">{sentAt ? `Hoy a las ${hhmm(sentAt)}` : "Ahora"}</span>
            </div>
            <p className="rounded-lg bg-sim-discord-panel p-3 text-sm leading-relaxed text-sim-discord-text">{dmMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenericFrame({ mission }: { mission: PublicMission }) {
  return (
    <div className={frame}>
      <WindowChrome title="Escenario" className="bg-navy/60" />
      <div className="p-4 sm:p-5"><Narrative text={mission.narrative} /></div>
    </div>
  );
}

export function ScenarioFrame({ mission }: { mission: PublicMission }) {
  const p = (mission.actionParams ?? {}) as Params;
  switch (mission.track) {
    case "phishing":
      if (p.channel === "qr") return <QrFrame mission={mission} p={p} />;
      if (mission.action === "receive_payment") return <MemoTxFrame mission={mission} p={p} />;
      return <EmailFrame mission={mission} p={p} />;
    case "social-engineering":
      return <DiscordFrame mission={mission} p={p} />;
    case "fake-assets":
      return p.promisedAPY ? <PoolFrame mission={mission} p={p} /> : <WalletFrame mission={mission} p={p} />;
    case "dangerous-approvals":
      return <TxSignFrame mission={mission} p={p} />;
    case "presale-scam":
      return <PresaleFrame mission={mission} p={p} />;
    default:
      return <GenericFrame mission={mission} />;
  }
}

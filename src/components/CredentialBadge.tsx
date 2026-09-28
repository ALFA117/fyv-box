"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, ExternalLink, Award, Link2 } from "lucide-react";
import { TrackMeta } from "@/missions/schema";
import type { Mission } from "@/missions/schema";
import { TrackIconBadge } from "./TrackIcon";
import { midTruncate, STELLAR_EXPERT_ACCOUNT, STELLAR_EXPERT_CONTRACT, STELLAR_EXPERT_TX } from "@/lib/ownership";

interface Props {
  module: Mission["track"];
  stellarAddress: string;
  completedAt?: string;
  /** Transacción on-chain de la credencial; undefined = aún consultando, null = sin registro on-chain. */
  txHash?: string | null;
  /** Contrato Soroban donde también está registrada, si aplica. */
  contractId?: string | null;
}

export function CredentialBadge({ module, stellarAddress, completedAt, txHash, contractId }: Props) {
  const meta = TrackMeta[module];
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="relative overflow-hidden rounded-3xl border border-line-gold bg-gradient-to-br from-surface via-surface-card to-surface-2 shadow-[var(--shadow-gold)]"
    >
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />

      <div className="relative p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-success-border bg-success-subtle px-2.5 py-1 text-xs font-semibold text-success">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            Certificado
          </span>
          <Award className="h-6 w-6 text-gold/70" strokeWidth={1.5} aria-hidden />
        </div>

        <div className="flex items-start gap-3">
          <TrackIconBadge track={module} size={44} />
          <div className="min-w-0 flex-1">
            <h3 className="text-title-3 text-cream">{meta?.label ?? module}</h3>
            {completedAt && (
              <p className="mt-0.5 text-xs text-cream-muted">
                <time dateTime={completedAt}>
                  {new Date(completedAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                </time>
              </p>
            )}
          </div>
        </div>

        <div className="my-4 border-t border-line-gold/40" />

        <div className="mb-3 rounded-xl border border-line bg-navy/60 px-3 py-2.5">
          <p className="mb-0.5 text-xs font-medium text-cream-muted">Dirección Stellar (testnet)</p>
          <p className="font-mono text-sm text-cream" title={stellarAddress}>
            {midTruncate(stellarAddress, 8, 8)}
          </p>
        </div>

        {txHash && (
          <a
            href={`${STELLAR_EXPERT_TX}/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 flex items-center gap-3 rounded-xl border border-success-border bg-success-subtle px-3 py-2.5 transition-colors hover:border-success"
          >
            <Link2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-success">Registrada on-chain en Stellar testnet</span>
              <span className="block truncate font-mono text-xs text-cream-muted">tx {midTruncate(txHash, 8, 6)}</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-success" aria-hidden />
          </a>
        )}
        {contractId && (
          <a
            href={`${STELLAR_EXPERT_CONTRACT}/${contractId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 flex items-center gap-3 rounded-xl border border-line bg-navy/60 px-3 py-2.5 transition-colors hover:border-line-gold"
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-gold" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-cream">Registrada en el contrato Soroban</span>
              <span className="block truncate font-mono text-xs text-cream-muted">{midTruncate(contractId, 6, 4)}</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-cream-muted" aria-hidden />
          </a>
        )}
        {txHash === null && !contractId && (
          <p className="mb-2 text-xs text-cream-dim">Registro on-chain en proceso: aparece aquí en cuanto se confirma en Stellar.</p>
        )}

        <a
          href={`${STELLAR_EXPERT_ACCOUNT}/${stellarAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="tap -mx-2 inline-flex items-center gap-2 rounded-xl px-2 text-sm font-medium text-gold transition-colors hover:text-gold-hover"
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          Ver cuenta en Stellar Expert
        </a>
      </div>
    </motion.article>
  );
}

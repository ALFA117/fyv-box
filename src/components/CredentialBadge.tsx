"use client";
import { motion } from "framer-motion";
import { CheckCircle, ExternalLink } from "lucide-react";
import { TrackMeta } from "@/missions/schema";
import type { Mission } from "@/missions/schema";

interface Props {
  module: Mission["track"];
  stellarAddress: string;
  completedAt?: string;
}

const STELLAR_EXPERT_BASE = "https://stellar.expert/explorer/testnet/account";

export function CredentialBadge({ module, stellarAddress, completedAt }: Props) {
  const meta = TrackMeta[module];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--gold)]/40 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] p-5"
    >
      {/* Corner glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--gold)]/10 blur-2xl" />

      <div className="flex items-start gap-3">
        <span className="text-2xl" role="img" aria-label={meta.label}>
          {meta.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 flex-shrink-0 text-[var(--success)]" />
            <p className="text-xs font-medium text-[var(--success)]">Certificado</p>
          </div>
          <h3 className="mt-0.5 font-semibold text-[var(--cream)] truncate">{meta.label}</h3>
          {completedAt && (
            <p className="mt-0.5 text-xs text-[var(--cream-muted)]">
              {new Date(completedAt).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      <a
        href={`${STELLAR_EXPERT_BASE}/${stellarAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center gap-1.5 text-xs text-[var(--gold)] hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        Ver en Stellar Expert (testnet)
      </a>
    </motion.div>
  );
}

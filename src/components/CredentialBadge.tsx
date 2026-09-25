"use client";
import { motion } from "framer-motion";
import { ShieldCheck, ExternalLink, Award } from "lucide-react";
import { TrackMeta } from "@/missions/schema";
import type { Mission } from "@/missions/schema";
import { TrackIcon } from "./TrackIcon";

interface Props {
  module: Mission["track"];
  stellarAddress: string;
  completedAt?: string;
}

const STELLAR_EXPERT_BASE = "https://stellar.expert/explorer/testnet/account";

function midTruncate(addr: string, head = 8, tail = 6) {
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function CredentialBadge({ module, stellarAddress, completedAt }: Props) {
  const meta = TrackMeta[module];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--border-gold)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface-card)] to-[var(--surface-2)] shadow-[var(--shadow-gold)]"
    >
      {/* Shine overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--gold)]/8 via-transparent to-transparent"
      />
      {/* Corner glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--gold)]/12 blur-3xl"
      />
      {/* Bottom glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[var(--gold)]/8 blur-2xl"
      />

      <div className="relative p-6">
        {/* Top row: certified badge */}
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--success-border)] bg-[var(--success-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
            Certificado
          </span>
          <Award className="h-6 w-6 text-[var(--gold)]/70" strokeWidth={1.5} />
        </div>

        {/* Track info */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <TrackIcon track={module} size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-playfair text-lg font-bold text-[var(--cream)]">
              {meta.label}
            </h3>
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

        {/* Divider */}
        <div className="my-4 border-t border-[var(--border-gold)]/40" />

        {/* Address */}
        <div className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--navy)]/60 px-3 py-2">
          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--cream-muted)]">
            Dirección Stellar (testnet)
          </p>
          <p className="font-mono text-xs text-[var(--cream)]" title={stellarAddress}>
            {midTruncate(stellarAddress, 12, 8)}
          </p>
        </div>

        {/* Stellar Expert link */}
        <a
          href={`${STELLAR_EXPERT_BASE}/${stellarAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--gold)] hover:text-[var(--gold-hover)] hover:underline focus-visible:rounded transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          Ver en Stellar Expert
        </a>
      </div>
    </motion.div>
  );
}

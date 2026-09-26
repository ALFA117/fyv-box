"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Award, Shield, ExternalLink, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getWallet, type WalletIdentity } from "@/identity";
import { CredentialBadge } from "@/components/CredentialBadge";
import { TrackIcon } from "@/components/TrackIcon";
import { supabase } from "@/lib/supabase";
import type { Mission } from "@/missions/schema";
import { TrackMeta } from "@/missions/schema";
import { AppNav } from "@/components/AppNav";

interface ModuleCompletion {
  module_id: string;
  completed_at: string;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

function midTruncate(addr: string, head = 12, tail = 8) {
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export default function GraduationPage() {
  const reduce = useReducedMotion();
  const [wallet, setWallet]         = useState<WalletIdentity | null>(null);
  const [completions, setCompletions] = useState<ModuleCompletion[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    getWallet().then(setWallet);
  }, []);

  useEffect(() => {
    if (!wallet) return;
    supabase
      .from("fyv_module_completions")
      .select("module_id, completed_at")
      .eq("stellar_address", wallet.publicKey)
      .then(({ data }) => {
        setCompletions(data ?? []);
        setLoading(false);
      });
  }, [wallet]);

  const hasCredentials = completions.length > 0;

  return (
    <div className="min-h-dvh pb-24">
      <AppNav back="/dashboard" wallet={wallet ?? undefined} />

      <div className="px-4 py-6">
        {loading ? (
          /* ── Skeleton ── */
          <div className="mx-auto max-w-lg space-y-4">
            <div className="mb-8 flex flex-col items-center gap-4">
              <div className="skeleton h-20 w-20 rounded-2xl" />
              <div className="skeleton h-8 w-48 rounded-xl" />
              <div className="skeleton h-4 w-64 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-28 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : (
        <>
        {/* Hero */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.5 }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduce ? { duration: 0 } : { delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
            className={[
              "mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl",
              hasCredentials
                ? "border border-[var(--border-gold)] bg-[var(--gold-subtle)] shadow-[var(--shadow-gold)]"
                : "border border-[var(--border)] bg-[var(--surface)]",
            ].join(" ")}
          >
            {hasCredentials ? (
              <Award className="h-10 w-10 text-[var(--gold)]" strokeWidth={1.5} />
            ) : (
              <Shield className="h-10 w-10 text-[var(--cream-muted)]" strokeWidth={1.5} />
            )}
          </motion.div>

          <h1 className="font-playfair text-3xl font-bold text-[var(--cream)]">
            {hasCredentials ? "Tus credenciales" : "Aún no hay credenciales"}
          </h1>
          <p className="mt-2 text-sm text-[var(--cream-muted)]">
            {hasCredentials
              ? "Credenciales verificables asociadas a tu dirección Stellar testnet"
              : "Completa un track completo para obtener tu primera credencial"}
          </p>
        </motion.div>

        {hasCredentials && wallet ? (
          <motion.div
            variants={reduce ? undefined : containerVariants}
            initial={reduce ? false : "hidden"}
            animate={reduce ? undefined : "show"}
            className="mx-auto max-w-sm space-y-4"
          >
            {completions.map((c) => (
              <motion.div key={c.module_id} variants={itemVariants}>
                <CredentialBadge
                  module={c.module_id as Mission["track"]}
                  stellarAddress={wallet.publicKey}
                  completedAt={c.completed_at}
                />
              </motion.div>
            ))}

            {/* Address pill */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--cream-muted)]">
                Dirección Stellar (testnet)
              </p>
              <p
                className="font-mono text-xs text-[var(--cream)]"
                title={wallet.publicKey}
              >
                {midTruncate(wallet.publicKey)}
              </p>
            </div>

            {/* Verify link */}
            <Link
              href={`/verify?address=${wallet.publicKey}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-gold)] bg-[var(--gold-subtle)] px-4 py-3 text-sm font-medium text-[var(--gold)] transition-colors hover:bg-[var(--gold)]/15"
            >
              <ExternalLink className="h-4 w-4" />
              Ver como tercero verificaría tu credencial
            </Link>
          </motion.div>
        ) : !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-lg"
          >
            {/* Track preview grid */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(Object.keys(TrackMeta) as Mission["track"][]).map((track, i) => (
                <motion.div
                  key={track}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.06, type: "spring", stiffness: 260, damping: 22 }}
                  className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center"
                >
                  {/* lock overlay */}
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-2)]">
                    <Lock className="h-2.5 w-2.5 text-[var(--cream-muted)]" strokeWidth={2.5} />
                  </div>
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                    <TrackIcon track={track} size={18} />
                  </div>
                  <p className="text-[10px] font-semibold leading-tight text-[var(--cream-muted)]">
                    {TrackMeta[track].label}
                  </p>
                  <p className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-0.5 text-[9px] text-[var(--cream-muted)]/60">
                    Bloqueado
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA card */}
            <div className="rounded-2xl border border-[var(--border-gold)] bg-[var(--gold-subtle)] p-6 text-center shadow-[var(--shadow-gold)]">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">
                6 credenciales disponibles
              </p>
              <p className="mb-4 text-sm text-[var(--cream-muted)]">
                Completa un track completo para desbloquear tu primera credencial verificable en Stellar testnet.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-3 text-sm font-bold text-[var(--navy)] shadow-md transition-all hover:bg-[var(--gold-hover)] hover:shadow-[0_0_20px_rgba(201,162,39,.4)]"
              >
                Ir a entrenar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        ) : null}
        </>
        )}
      </div>
    </div>
  );
}

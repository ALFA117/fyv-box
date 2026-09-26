"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Shield, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getWallet, type WalletIdentity } from "@/identity";
import { CredentialBadge } from "@/components/CredentialBadge";
import { supabase } from "@/lib/supabase";
import type { Mission } from "@/missions/schema";
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
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
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
            {loading
              ? "Cargando…"
              : hasCredentials
              ? "Tus credenciales"
              : "Aún no hay credenciales"}
          </h1>
          <p className="mt-2 text-sm text-[var(--cream-muted)]">
            {hasCredentials
              ? "Credenciales verificables asociadas a tu dirección Stellar testnet"
              : "Completa un track completo para obtener tu primera credencial"}
          </p>
        </motion.div>

        {hasCredentials && wallet ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
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
          <div className="mx-auto max-w-sm text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm text-[var(--cream)] transition-colors hover:border-[var(--border-gold)] hover:text-[var(--gold)]"
              >
                Ir a entrenar →
              </Link>
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

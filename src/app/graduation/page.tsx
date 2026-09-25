"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getWallet, type WalletIdentity } from "@/identity";
import { CredentialBadge } from "@/components/CredentialBadge";
import { supabase } from "@/lib/supabase";
import type { Mission } from "@/missions/schema";

interface ModuleCompletion {
  module_id: string;
  completed_at: string;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

export default function GraduationPage() {
  const [wallet, setWallet] = useState<WalletIdentity | null>(null);
  const [completions, setCompletions] = useState<ModuleCompletion[]>([]);

  useEffect(() => {
    getWallet().then(setWallet);
  }, []);

  useEffect(() => {
    if (!wallet) return;
    supabase
      .from("fyv_module_completions")
      .select("module_id, completed_at")
      .eq("stellar_address", wallet.publicKey)
      .then(({ data }) => setCompletions(data ?? []));
  }, [wallet]);

  const hasCredentials = completions.length > 0;

  return (
    <div className="min-h-dvh px-4 py-6">
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-1.5 text-sm text-[var(--cream-muted)] hover:text-[var(--cream)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al mapa
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--gold)]/15 ring-2 ring-[var(--gold)]/30">
          {hasCredentials ? (
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            >
              <Star className="h-10 w-10 text-[var(--gold)]" />
            </motion.div>
          ) : (
            <Shield className="h-10 w-10 text-[var(--gold)]/50" />
          )}
        </div>
        <h1 className="serif text-3xl font-bold text-[var(--cream)]">
          {hasCredentials ? "Tus credenciales" : "Aún no hay credenciales"}
        </h1>
        <p className="mt-2 text-sm text-[var(--cream-muted)]">
          {hasCredentials
            ? "Credenciales on-chain emitidas en Stellar testnet"
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

          {/* Address display */}
          <div className="rounded-xl border border-white/10 bg-[var(--surface)] p-4">
            <p className="mb-1 text-xs text-[var(--cream-muted)]">Tu dirección Stellar (testnet)</p>
            <p className="break-all font-mono text-xs text-[var(--cream)]">
              {wallet.publicKey}
            </p>
          </div>

          {/* Verify demo link */}
          <Link
            href={`/verify?address=${wallet.publicKey}`}
            className="block rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 px-4 py-3 text-center text-sm text-[var(--gold)] hover:bg-[var(--gold)]/10"
          >
            Ver como tercero verificaría tu credencial →
          </Link>
        </motion.div>
      ) : (
        <div className="mx-auto max-w-sm text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[var(--surface)] px-5 py-3 text-sm text-[var(--cream)] hover:border-[var(--gold)]/40"
          >
            Ir a entrenar →
          </Link>
        </div>
      )}
    </div>
  );
}

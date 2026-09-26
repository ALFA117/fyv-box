"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Award, Shield, ExternalLink, Lock, ArrowRight, WifiOff } from "lucide-react";
import Link from "next/link";
import { getWallet, type WalletIdentity } from "@/identity";
import { CredentialBadge } from "@/components/CredentialBadge";
import { TrackIconBadge } from "@/components/TrackIcon";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/Skeleton";
import { TRACK_ORDER } from "@/components/trackStyle";
import { supabase } from "@/lib/supabase";
import { midTruncate } from "@/lib/ownership";
import { TrackMeta, type Mission } from "@/missions/schema";
import { AppNav } from "@/components/AppNav";

interface ModuleCompletion {
  module_id: Mission["track"];
  completed_at: string;
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

type LoadState = { kind: "loading" } | { kind: "ready" } | { kind: "error"; message: string };

export default function GraduationPage() {
  const reduce = useReducedMotion();
  const [wallet, setWallet] = useState<WalletIdentity | null>(null);
  const [completions, setCompletions] = useState<ModuleCompletion[]>([]);
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });
    (async () => {
      let w: WalletIdentity;
      try {
        w = await getWallet();
      } catch {
        throw new Error("No pudimos abrir tu billetera de prueba.");
      }
      if (!cancelled) setWallet(w);
      const { data, error } = await supabase
        .from("fyv_module_completions")
        .select("module_id, completed_at")
        .eq("stellar_address", w.publicKey);
      if (error) throw new Error("No pudimos leer tus credenciales. Intenta de nuevo en unos segundos.");
      if (cancelled) return;
      const rows = ((data ?? []) as ModuleCompletion[])
        .filter((r) => r.module_id in TrackMeta)
        .sort((a, b) => TRACK_ORDER.indexOf(a.module_id) - TRACK_ORDER.indexOf(b.module_id));
      setCompletions(rows);
      setState({ kind: "ready" });
    })().catch((err: Error) => {
      if (!cancelled) setState({ kind: "error", message: err.message });
    });
    return () => { cancelled = true; };
  }, [retryKey]);

  const earned = new Set(completions.map((c) => c.module_id));
  const hasCredentials = completions.length > 0;

  return (
    <div className="min-h-dvh">
      <AppNav back={{ href: "/dashboard", label: "Mapa" }} wallet={wallet} />

      <main id="main" tabIndex={-1} className="outline-none px-gutter pb-safe pt-8">
        <div className="mx-auto max-w-lg">
          {state.kind === "loading" ? (
            <div className="space-y-4" role="status" aria-label="Cargando credenciales">
              <div className="mb-8 flex flex-col items-center gap-4">
                <Skeleton className="h-20 w-20" rounded="lg" />
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-64" rounded="lg" />
            </div>
          ) : state.kind === "error" ? (
            <StatePanel
              tone="danger"
              icon={WifiOff}
              title="No se pudieron cargar tus credenciales"
              body={state.message}
              action={<Button variant="secondary" onClick={() => setRetryKey((k) => k + 1)}>Reintentar</Button>}
            />
          ) : (
            <>
              <motion.header
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.45 }}
                className="mb-8 text-center"
              >
                <div
                  className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border ${hasCredentials ? "border-line-gold bg-gold-subtle shadow-[var(--shadow-gold)]" : "border-line bg-surface"}`}
                  aria-hidden
                >
                  {hasCredentials
                    ? <Award className="h-10 w-10 text-gold" strokeWidth={1.5} />
                    : <Shield className="h-10 w-10 text-cream-muted" strokeWidth={1.5} />}
                </div>
                <h1 className="text-title-1 text-cream">{hasCredentials ? "Tus credenciales" : "Aún no tienes credenciales"}</h1>
                <p className="mx-auto mt-2 max-w-sm text-body-sm text-cream-muted">
                  {hasCredentials
                    ? "Credenciales verificables ligadas a tu dirección Stellar de prueba. Cualquiera puede comprobarlas."
                    : "Completa todas las misiones de un track para obtener su credencial verificable."}
                </p>
              </motion.header>

              {hasCredentials && wallet && (
                <motion.div
                  variants={reduce ? undefined : containerVariants}
                  initial={reduce ? false : "hidden"}
                  animate={reduce ? undefined : "show"}
                  className="mb-8 space-y-4"
                >
                  {completions.map((c) => (
                    <motion.div key={c.module_id} variants={reduce ? undefined : itemVariants}>
                      <CredentialBadge module={c.module_id} stellarAddress={wallet.publicKey} completedAt={c.completed_at} />
                    </motion.div>
                  ))}

                  <div className="rounded-2xl border border-line bg-surface p-4">
                    <p className="mb-1 text-xs font-medium text-cream-muted">Tu dirección Stellar (testnet)</p>
                    <p className="font-mono text-sm text-cream" title={wallet.publicKey}>{midTruncate(wallet.publicKey, 10, 8)}</p>
                  </div>

                  <Link
                    href={`/verify?address=${wallet.publicKey}`}
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-line-gold bg-gold-subtle px-4 text-sm font-semibold text-gold transition-colors hover:bg-gold/15"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Ver cómo un tercero verifica tu credencial
                  </Link>
                </motion.div>
              )}

              {earned.size < TRACK_ORDER.length && (
                <section aria-labelledby="pending-title">
                  <h2 id="pending-title" className="mb-3 text-eyebrow text-cream-muted">
                    {hasCredentials ? "Por desbloquear" : "6 credenciales disponibles"}
                  </h2>
                  <ul className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {TRACK_ORDER.filter((t) => !earned.has(t)).map((track) => (
                      <li key={track} className="relative rounded-2xl border border-line bg-surface p-4 text-center">
                        <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-surface-2" aria-hidden>
                          <Lock className="h-3 w-3 text-cream-muted" strokeWidth={2.5} />
                        </span>
                        <div className="mx-auto mb-2 w-fit"><TrackIconBadge track={track} size={40} /></div>
                        <p className="text-xs font-semibold leading-tight text-cream-muted">{TrackMeta[track].label}</p>
                        <span className="sr-only">Bloqueado</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/dashboard"
                    className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gold px-6 text-base font-bold text-on-gold shadow-[var(--shadow-gold)] transition-colors hover:bg-gold-hover active:bg-gold-active"
                  >
                    Ir a entrenar
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

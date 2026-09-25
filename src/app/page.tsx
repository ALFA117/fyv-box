"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, ArrowRight, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const features = [
  { icon: Shield,       text: "Simulacros reales en Stellar testnet" },
  { icon: Lock,         text: "Credencial on-chain al graduarte" },
  { icon: CheckCircle,  text: "Aprende detectando trampas de verdad" },
];

export default function LoginPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Ingresa tu correo electrónico."); return; }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSent(true);
    setLoading(false);
    setTimeout(() => router.push("/dashboard"), 1600);
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Animated background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/6 blur-[80px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-600/5 blur-[60px]" />
        {/* Subtle grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="white" strokeWidth=".5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="mb-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
            className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-[var(--border-gold)] bg-[var(--gold-subtle)] shadow-[var(--shadow-gold)]"
          >
            <Shield className="h-9 w-9 text-[var(--gold)]" strokeWidth={1.75} />
          </motion.div>

          <h1 className="font-playfair text-4xl font-bold tracking-tight text-[var(--cream)]">
            FYV<span className="text-[var(--gold)]"> Box</span>
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--cream-muted)]">
            El entrenamiento anti-estafas para la nueva economía Web3.
            <br />
            Practica, aprende y certifícate en Stellar.
          </p>
        </div>

        {/* Feature pills */}
        <div className="mb-8 flex flex-col gap-2">
          {features.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
              className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 px-3.5 py-2.5"
            >
              <Icon className="h-4 w-4 shrink-0 text-[var(--gold)]" strokeWidth={1.75} />
              <span className="text-sm text-[var(--cream-muted)]">{text}</span>
            </motion.div>
          ))}
        </div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)]"
        >
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium text-[var(--cream-muted)]"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cream-muted)]"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="tu@correo.com"
                    aria-describedby={error ? "email-error" : undefined}
                    aria-invalid={!!error}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--navy)] py-3 pl-10 pr-4 text-sm text-[var(--cream)] placeholder:text-[var(--cream-dim)] transition-colors focus:border-[var(--gold-ring)] focus:outline-none focus:ring-0"
                  />
                </div>
                {error && (
                  <p id="email-error" role="alert" className="mt-1.5 text-xs text-[var(--danger)]">
                    {error}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" loading={loading} size="lg">
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-[var(--cream-dim)]">
                Se usará una billetera de prueba en Stellar testnet.
                <br />
                No hay fondos reales involucrados.
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="flex flex-col items-center gap-3 py-3 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 22 }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--success-border)] bg-[var(--success-subtle)]"
              >
                <CheckCircle className="h-7 w-7 text-[var(--success)]" strokeWidth={2} />
              </motion.div>
              <p className="text-base font-semibold text-[var(--cream)]">¡Bienvenido/a!</p>
              <p className="text-sm text-[var(--cream-muted)]">
                Preparando tu entrenamiento…
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

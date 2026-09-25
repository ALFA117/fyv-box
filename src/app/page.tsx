"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    // En esta demo, simula un "magic link enviado" y redirige al dashboard
    // Phase 2: integrar Supabase Auth email OTP
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);

    // Demo: redirige directamente al dashboard después de 1.5s
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      {/* Background radial */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gold)]/15 ring-1 ring-[var(--gold)]/30">
            <Shield className="h-8 w-8 text-[var(--gold)]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--cream)]">
            FYV Box
          </h1>
          <p className="mt-2 text-sm text-[var(--cream-muted)]">
            Aprende a no caer en estafas crypto.
            <br />
            Certifícate en Stellar.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6">
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
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cream-muted)]" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full rounded-xl border border-white/10 bg-[var(--navy)] py-3 pl-10 pr-4 text-sm text-[var(--cream)] placeholder:text-[var(--cream-muted)]/50 focus:border-[var(--gold)]/60 focus:outline-none"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-2 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success)]/20">
                <Shield className="h-6 w-6 text-[var(--success)]" />
              </div>
              <p className="font-medium text-[var(--cream)]">¡Listo!</p>
              <p className="text-sm text-[var(--cream-muted)]">
                Redirigiendo al entrenamiento…
              </p>
            </motion.div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-[var(--cream-muted)]/60">
          Plataforma educativa en Stellar testnet. No hay fondos reales.
        </p>
      </motion.div>
    </main>
  );
}

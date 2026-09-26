"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, Loader2, ShieldCheck, Code2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AppNav } from "@/components/AppNav";

interface VerifyResult {
  address: string;
  certified: boolean;
  modules: { module: string; completedAt: string }[];
  backend: string;
}

const moduleLabels: Record<string, string> = {
  "phishing":             "Phishing e Impersonación",
  "fake-assets":          "Activos y Airdrops Falsos",
  "social-engineering":   "Ingeniería Social",
  "dangerous-approvals":  "Aprobaciones Peligrosas",
  "presale-scam":         "Estafas de Preventa",
  "key-hygiene":          "Higiene de Llaves",
};

function midTruncate(addr: string, head = 8, tail = 6) {
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

function VerifyContent() {
  const searchParams   = useSearchParams();
  const initialAddress = searchParams.get("address") ?? "";

  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<VerifyResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (initialAddress.trim()) verify(initialAddress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verify(addr: string = address) {
    if (!addr.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res  = await fetch(`/api/verify?address=${encodeURIComponent(addr)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh pb-24">
      <AppNav back="/" />

      <div className="px-4 py-6">
        <div className="mx-auto max-w-lg">
          {/* Page heading */}
          <div className="mb-6">
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--gold)]" strokeWidth={1.75} />
              <h1 className="font-playfair text-2xl font-bold text-[var(--cream)]">
                Verificador de Credenciales
              </h1>
            </div>
            <p className="text-sm text-[var(--cream-muted)]">
              Consulta si una dirección Stellar está certificada por FYV Box
            </p>
          </div>

          {/* Info banner */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-3">
            <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" strokeWidth={1.75} />
            <p className="text-xs leading-relaxed text-blue-300">
              Esta es la vista que tendría <strong>cualquier wallet o dApp</strong> al
              verificar la confianza de un usuario antes de dejarlo continuar.
              Lee desde{" "}
              <code className="rounded bg-blue-500/20 px-1 font-mono">/api/verify</code> —
              endpoint público con CORS abierto.
            </p>
          </div>

          {/* Search card */}
          <div className="mb-5 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)]">
            <form
              onSubmit={(e) => { e.preventDefault(); verify(); }}
              className="space-y-3"
            >
              <label className="block text-xs font-medium text-[var(--cream-muted)]">
                Dirección Stellar (G...)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cream-muted)]" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="GABCDE…"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--navy)] py-3 pl-10 pr-4 font-mono text-xs text-[var(--cream)] placeholder:text-[var(--cream-dim)] transition-colors focus:border-[var(--gold-ring)] focus:outline-none"
                  />
                </div>
                <Button type="submit" loading={loading} disabled={!address.trim()}>
                  Verificar
                </Button>
              </div>
            </form>
          </div>

          {/* Result area */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
              </motion.div>
            )}

            {error && !loading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-subtle)] p-4 text-sm text-[var(--danger)]"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="font-semibold">Error al verificar</p>
                  <p className="mt-0.5 text-xs opacity-80">{error}</p>
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="space-y-4"
              >
                {/* Verdict */}
                <div
                  className={[
                    "flex items-center gap-4 rounded-2xl border p-5",
                    result.certified
                      ? "border-[var(--success-border)] bg-[var(--success-subtle)]"
                      : "border-[var(--danger-border)] bg-[var(--danger-subtle)]",
                  ].join(" ")}
                >
                  {result.certified ? (
                    <CheckCircle
                      className="h-10 w-10 shrink-0 text-[var(--success)]"
                      strokeWidth={1.75}
                    />
                  ) : (
                    <XCircle
                      className="h-10 w-10 shrink-0 text-[var(--danger)]"
                      strokeWidth={1.75}
                    />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`text-lg font-bold ${
                        result.certified ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {result.certified ? "Usuario verificado" : "Sin credenciales FYV Box"}
                    </p>
                    <p
                      className="mt-0.5 font-mono text-xs text-[var(--cream-muted)]"
                      title={result.address}
                    >
                      {midTruncate(result.address, 12, 8)}
                    </p>
                  </div>
                </div>

                {/* Modules */}
                {result.modules.length > 0 && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--cream-muted)]">
                      Módulos certificados
                    </p>
                    <div className="space-y-2">
                      {result.modules.map((m) => (
                        <div key={m.module} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 shrink-0 text-[var(--success)]" strokeWidth={2} />
                            <span className="text-sm text-[var(--cream)]">
                              {moduleLabels[m.module] ?? m.module}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--cream-muted)]">
                            {new Date(m.completedAt).toLocaleDateString("es-MX")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-right text-xs text-[var(--cream-muted)]/50">
                  backend: {result.backend}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* API docs block */}
          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--cream-muted)]">
              <Code2 className="h-3.5 w-3.5" />
              Integra en tu dApp
            </p>
            <pre className="overflow-x-auto rounded-lg bg-[var(--navy)] p-3 text-xs text-[var(--gold)]/90">
{`curl "https://fyv-box.vercel.app/api/verify?address=G..."
# → { "certified": true, "modules": [...] }`}
            </pre>
            <p className="mt-2 text-xs text-[var(--cream-muted)]">
              Endpoint público · CORS abierto · sin autenticación
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}

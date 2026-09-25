"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const DEMO_ADDRESS = "GBDEMO000000000000000000000000000000000000000000000000000A";

interface VerifyResult {
  address: string;
  certified: boolean;
  modules: { module: string; completedAt: string }[];
  backend: string;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialAddress = searchParams.get("address") ?? "";

  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function verify(addr: string = address) {
    if (!addr) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/verify?address=${encodeURIComponent(addr)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const moduleLabels: Record<string, string> = {
    phishing: "Phishing e Impersonación",
    "fake-assets": "Activos y Airdrops Falsos",
    "social-engineering": "Ingeniería Social",
  };

  return (
    <div className="min-h-dvh px-4 py-6">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="text-[var(--cream-muted)] hover:text-[var(--cream)]">
            <Shield className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="serif text-xl font-bold text-[var(--cream)]">
              Verificador de Credenciales
            </h1>
            <p className="text-xs text-[var(--cream-muted)]">
              Consulta si una dirección Stellar está certificada por FYV Box
            </p>
          </div>
        </div>

        {/* Demo banner */}
        <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs text-blue-300">
          Esta es la vista que tendría <strong>cualquier wallet o dApp</strong> al verificar
          la confianza de un usuario antes de dejarle continuar.
          <br />
          Lee desde <code className="font-mono">/api/verify</code> — endpoint público con CORS abierto.
        </div>

        {/* Search */}
        <Card className="mb-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
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
                  placeholder="GABCDE..."
                  className="w-full rounded-xl border border-white/10 bg-[var(--navy)] py-3 pl-10 pr-4 font-mono text-xs text-[var(--cream)] focus:border-[var(--gold)]/60 focus:outline-none"
                />
              </div>
              <Button type="submit" loading={loading} disabled={!address}>
                Verificar
              </Button>
            </div>
          </form>
        </Card>

        {/* Result */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-8"
            >
              <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 p-4 text-sm text-[var(--error)]"
            >
              {error}
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
              {/* Main verdict */}
              <div
                className={`flex items-center gap-3 rounded-2xl border p-5
                  ${result.certified
                    ? "border-[var(--success)]/30 bg-[var(--success)]/10"
                    : "border-[var(--error)]/30 bg-[var(--error)]/10"
                  }`}
              >
                {result.certified ? (
                  <CheckCircle className="h-8 w-8 flex-shrink-0 text-[var(--success)]" />
                ) : (
                  <XCircle className="h-8 w-8 flex-shrink-0 text-[var(--error)]" />
                )}
                <div>
                  <p className={`font-bold ${result.certified ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                    {result.certified ? "Usuario verificado" : "Sin credenciales FYV Box"}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[var(--cream-muted)] break-all">
                    {result.address}
                  </p>
                </div>
              </div>

              {/* Modules */}
              {result.modules.length > 0 && (
                <Card>
                  <p className="mb-3 text-xs font-medium text-[var(--cream-muted)]">
                    Módulos certificados
                  </p>
                  <div className="space-y-2">
                    {result.modules.map((m) => (
                      <div key={m.module} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-[var(--success)]" />
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
                </Card>
              )}

              {/* Backend info */}
              <p className="text-right text-xs text-[var(--cream-muted)]/50">
                backend: {result.backend}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* API docs teaser */}
        <div className="mt-8 rounded-xl border border-white/10 bg-[var(--surface)] p-4">
          <p className="mb-2 text-xs font-semibold text-[var(--cream-muted)]">
            Integra en tu dApp:
          </p>
          <pre className="overflow-x-auto text-xs text-[var(--gold)]/80">
{`curl "https://fyv-box.vercel.app/api/verify?address=G...&module=phishing"
# → { "certified": true, "modules": [...] }`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
    </div>}>
      <VerifyContent />
    </Suspense>
  );
}

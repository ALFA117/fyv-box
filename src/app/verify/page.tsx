"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, CheckCircle, XCircle, ShieldCheck, Code2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AppNav } from "@/components/AppNav";
import { AppFooter } from "@/components/AppFooter";
import { Skeleton } from "@/components/Skeleton";
import { TrackMeta } from "@/missions/schema";
import { isStellarAddress, midTruncate, STELLAR_EXPERT_ACCOUNT, STELLAR_EXPERT_CONTRACT, STELLAR_EXPERT_TX } from "@/lib/ownership";

interface VerifyResult {
  address: string;
  certified: boolean;
  modules: { module: string; completedAt: string; txHash?: string | null; onContract?: boolean | null }[];
  contract?: string | null;
  backend: string;
}

function normalize(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function validate(value: string): string | null {
  if (!value) return "Pega una dirección Stellar.";
  if (!value.startsWith("G")) return "Las direcciones públicas de Stellar empiezan con G.";
  if (value.length !== 56) return `Una dirección tiene 56 caracteres; esta tiene ${value.length}.`;
  if (!isStellarAddress(value)) return "La dirección contiene caracteres inválidos.";
  return null;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialAddress = normalize(searchParams.get("address") ?? "");
  const reduce = useReducedMotion();

  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  useEffect(() => {
    if (initialAddress) verify(initialAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verify(raw: string = address) {
    const addr = normalize(raw);
    const invalid = validate(addr);
    if (invalid) {
      setFieldError(invalid);
      inputRef.current?.focus();
      return;
    }
    setAddress(addr);
    setFieldError(null);
    setLoading(true);
    setError(null);
    setResult(null);

    const id = ++reqId.current;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(`/api/verify?address=${encodeURIComponent(addr)}`, { signal: ctrl.signal });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error ?? "No pudimos consultar el registro. Intenta de nuevo.");
      if (id === reqId.current) setResult(data);
    } catch (e) {
      if (id !== reqId.current) return;
      const aborted = e instanceof Error && e.name === "AbortError";
      setError(aborted ? "El registro tardó demasiado en responder. Intenta de nuevo." : e instanceof Error ? e.message : "Error desconocido");
    } finally {
      clearTimeout(timer);
      if (id === reqId.current) setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh">
      <AppNav back={{ href: "/", label: "Inicio" }} />

      <main id="main" tabIndex={-1} className="outline-none px-gutter pb-safe pt-6">
        <div className="mx-auto max-w-lg">
          <header className="mb-6">
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-gold" strokeWidth={1.75} aria-hidden />
              <h1 className="text-title-1 text-cream">Verificar credencial</h1>
            </div>
            <p className="text-body-sm text-cream-muted">
              Consulta si una dirección Stellar completó algún módulo de FYV Box.
            </p>
          </header>

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-info-border bg-info-subtle px-4 py-3">
            <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-info" strokeWidth={1.75} aria-hidden />
            <p className="text-sm leading-relaxed text-info">
              Es la misma consulta que haría una wallet o dApp antes de confiar en un usuario, vía el endpoint público{" "}
              <code className="rounded bg-info/15 px-1 text-[0.8125rem]">/api/verify</code>.
            </p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); verify(); }}
            noValidate
            className="mb-5 rounded-2xl border border-line-strong bg-surface p-4 shadow-[var(--shadow-md)] sm:p-5"
          >
            <label htmlFor="address" className="mb-2 block text-label text-cream-muted">
              Dirección Stellar pública
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-muted" aria-hidden />
              <input
                ref={inputRef}
                id="address"
                name="address"
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setFieldError(null); }}
                placeholder="G…"
                aria-invalid={!!fieldError}
                aria-describedby={fieldError ? "address-error" : "address-help"}
                className={`h-12 w-full rounded-xl border bg-navy pl-10 pr-4 font-mono text-base text-cream placeholder:text-cream-dim transition-colors focus:outline-none ${fieldError ? "border-danger" : "border-line focus:border-gold-ring"}`}
              />
            </div>
            {fieldError ? (
              <p id="address-error" role="alert" className="mt-2 text-sm text-danger">{fieldError}</p>
            ) : (
              <p id="address-help" className="mt-2 text-xs text-cream-dim">56 caracteres, empieza con G. Nunca pegues una llave secreta (S…).</p>
            )}
            <Button type="submit" size="lg" className="mt-4 w-full" loading={loading}>
              {loading ? "Consultando…" : "Verificar"}
            </Button>
          </form>

          <div aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3" role="status" aria-label="Consultando">
                  <Skeleton className="h-20" rounded="lg" />
                  <Skeleton className="h-32" rounded="lg" />
                </motion.div>
              )}

              {error && !loading && (
                <motion.div
                  key="error"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-danger-border bg-danger-subtle p-4"
                >
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" strokeWidth={1.75} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-danger">No se pudo verificar</p>
                    <p className="mt-0.5 text-sm text-cream-muted">{error}</p>
                    <button type="button" onClick={() => verify()} className="tap -ml-2 mt-1 rounded-xl px-2 text-sm font-semibold text-cream hover:text-gold">
                      Reintentar
                    </button>
                  </div>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div
                  key="result"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  className="space-y-4"
                >
                  <div className={`flex items-center gap-4 rounded-2xl border p-5 ${result.certified ? "border-success-border bg-success-subtle" : "border-line-strong bg-surface"}`}>
                    {result.certified
                      ? <CheckCircle className="h-10 w-10 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
                      : <XCircle className="h-10 w-10 shrink-0 text-cream-muted" strokeWidth={1.75} aria-hidden />}
                    <div className="min-w-0">
                      <p className={`text-title-3 ${result.certified ? "text-success" : "text-cream"}`}>
                        {result.certified ? "Credencial verificada" : "Sin credenciales todavía"}
                      </p>
                      <p className="mt-0.5 font-mono text-sm text-cream-muted" title={result.address}>
                        {midTruncate(result.address, 8, 8)}
                      </p>
                    </div>
                  </div>

                  {result.modules.length > 0 && (
                    <div className="rounded-2xl border border-line bg-surface p-4">
                      <p className="mb-3 text-eyebrow text-cream-muted">Módulos certificados</p>
                      <ul className="space-y-2.5">
                        {result.modules.map((m) => (
                          <li key={m.module}>
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex min-w-0 items-center gap-2 text-sm text-cream">
                                <CheckCircle className="h-4 w-4 shrink-0 text-success" strokeWidth={2} aria-hidden />
                                <span className="truncate">{TrackMeta[m.module as keyof typeof TrackMeta]?.label ?? m.module}</span>
                              </span>
                              <time dateTime={m.completedAt} className="shrink-0 text-xs tabular-nums text-cream-muted">
                                {new Date(m.completedAt).toLocaleDateString("es-MX")}
                              </time>
                            </div>
                            {m.txHash ? (
                              <a
                                href={`${STELLAR_EXPERT_TX}/${m.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tap ml-4 inline-flex items-center gap-1.5 rounded-lg px-2 font-mono text-xs text-success hover:underline"
                              >
                                on-chain · tx {midTruncate(m.txHash, 6, 4)} <ExternalLink className="h-3 w-3" aria-hidden />
                              </a>
                            ) : null}
                            {m.onContract && (
                              <span className="ml-4 inline-flex items-center gap-1 px-2 font-mono text-xs text-success">
                                <CheckCircle className="h-3 w-3" aria-hidden /> en contrato Soroban
                              </span>
                            )}
                            {!m.txHash && !m.onContract && (
                              <p className="ml-6 mt-0.5 text-xs text-cream-dim">Registro on-chain pendiente</p>
                            )}
                          </li>
                        ))}
                      </ul>
                      {result.contract && (
                        <a
                          href={`${STELLAR_EXPERT_CONTRACT}/${result.contract}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-xs text-cream-muted hover:text-cream"
                        >
                          <span className="shrink-0">Contrato de credenciales:</span>
                          <span className="truncate font-mono text-gold">{midTruncate(result.contract, 6, 4)}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                        </a>
                      )}
                    </div>
                  )}

                  <a
                    href={`${STELLAR_EXPERT_ACCOUNT}/${result.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap -ml-2 inline-flex items-center gap-2 rounded-xl px-2 text-sm font-medium text-gold hover:text-gold-hover"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Ver la cuenta en Stellar Expert (testnet)
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <section aria-labelledby="api-title" className="mt-8 rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <h2 id="api-title" className="mb-3 flex items-center gap-2 text-eyebrow text-cream-muted">
              <Code2 className="h-4 w-4" aria-hidden />
              Intégralo en tu dApp
            </h2>
            <pre className="scroll-x rounded-xl bg-navy p-3 text-[0.8125rem] leading-relaxed text-gold">
{`curl "https://fyv-box.vercel.app/api/verify?address=G..."
# → { "certified": true, "modules": [...] }`}
            </pre>
            <p className="mt-2 text-xs text-cream-muted">Público · CORS abierto · sin autenticación</p>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="px-gutter mx-auto max-w-lg space-y-4 pt-24" role="status" aria-label="Cargando">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-40" rounded="lg" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}

"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { AuthState, PollarClient } from "@pollar/core";
import { ArrowRight, Check, ExternalLink, Mail, MailCheck, RotateCw, ShieldCheck, UserRound, Wallet } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/Button";
import { ensureWalletFunded, getWallet, pollarEnabled, setIdentityMode } from "@/identity";
import { authErrorMessage, getPollarClient } from "@/identity/pollar";
import { midTruncate, STELLAR_EXPERT_ACCOUNT } from "@/lib/ownership";

const CODE_LEN = 6;
const RESEND_SECONDS = 30;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Step = "email" | "code" | "done";

/** Solo rutas internas: evita redirecciones abiertas con ?next=https://… */
function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${"•".repeat(Math.max(1, user.length - visible.length))}@${domain}`;
}

function Steps({ step }: { step: Step }) {
  const items: { id: Step; label: string }[] = [
    { id: "email", label: "Correo" },
    { id: "code", label: "Código" },
    { id: "done", label: "Listo" },
  ];
  const current = items.findIndex((i) => i.id === step);
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Pasos para entrar">
      {items.map((it, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={it.id} className="flex flex-1 items-center gap-2" aria-current={state === "current" ? "step" : undefined}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                state === "done"
                  ? "border-success bg-success text-navy"
                  : state === "current"
                    ? "border-gold bg-gold-subtle text-gold"
                    : "border-line text-cream-dim"
              }`}
            >
              {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            <span className={`text-sm font-medium ${state === "todo" ? "text-cream-dim" : "text-cream"}`}>{it.label}</span>
            {i < items.length - 1 && <span className={`h-px flex-1 ${i < current ? "bg-success" : "bg-line"}`} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

/** Campo único (autocompleta el código desde el correo en iOS/Android) dibujado como 6 casillas. */
function CodeInput({
  value, onChange, disabled, invalid, inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  invalid: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        id="code"
        name="code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={CODE_LEN}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, CODE_LEN))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={invalid}
        aria-describedby="code-help"
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
      />
      <div className="grid grid-cols-6 gap-2" aria-hidden>
        {Array.from({ length: CODE_LEN }, (_, i) => {
          const char = value[i] ?? "";
          const active = focused && i === Math.min(value.length, CODE_LEN - 1);
          return (
            <div
              key={i}
              className={`flex h-14 items-center justify-center rounded-xl border bg-navy font-mono text-2xl font-semibold text-cream transition-colors ${
                invalid ? "border-danger" : active ? "border-gold ring-2 ring-gold/30" : char ? "border-line-strong" : "border-line"
              }`}
            >
              {char || (active ? <span className="h-6 w-px animate-pulse bg-gold" /> : null)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EntrarContent() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const reduce = useReducedMotion();

  const [client, setClient] = useState<PollarClient | null>(null);
  const [booting, setBooting] = useState(pollarEnabled);
  const [bootError, setBootError] = useState<string | null>(null);
  const [auth, setAuth] = useState<AuthState>({ step: "idle" });

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [address, setAddress] = useState<string | null>(null);
  const [guestBusy, setGuestBusy] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const lastSubmitted = useRef("");

  // Arranque: cliente de Pollar + sesión previa (si ya verificó su correo, pasa directo a "Listo").
  useEffect(() => {
    if (!pollarEnabled) return;
    let unsub = () => {};
    let cancelled = false;
    getPollarClient()
      .then((c) => {
        if (cancelled) return;
        setClient(c);
        setAuth(c.getAuthState());
        unsub = c.onAuthStateChange(setAuth);
      })
      .catch(() => { if (!cancelled) setBootError("No pudimos conectar con el servicio de verificación. Revisa tu conexión."); })
      .finally(() => { if (!cancelled) setBooting(false); });
    return () => { cancelled = true; unsub(); };
  }, [bootError === null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Traduce el estado de Pollar a los pasos de la pantalla.
  useEffect(() => {
    if (!client) return;
    switch (auth.step) {
      case "entering_email":
        // El SDK pide el correo en un paso aparte: se lo damos si ya lo capturamos.
        if (email && EMAIL_RE.test(email)) client.sendEmailCode(email.trim());
        break;
      case "entering_code":
        setStep("code");
        setCodeError(null);
        break;
      case "authenticated": {
        const addr = client.getWallet()?.address ?? null;
        setAddress(addr);
        const mail = client.getUserProfile()?.mail;
        if (mail) setEmail(mail);
        setStep("done");
        break;
      }
      case "error": {
        const msg = authErrorMessage(auth);
        if (auth.previousStep === "verifying_email_code" || auth.errorCode.startsWith("EMAIL_CODE")) {
          setStep("code");
          setCodeError(msg);
          setCode("");
          lastSubmitted.current = "";
          codeRef.current?.focus();
        } else {
          setStep("email");
          setEmailError(msg);
        }
        break;
      }
    }
  }, [auth]); // eslint-disable-line react-hooks/exhaustive-deps

  // La dirección puede llegar un instante después de "authenticated".
  useEffect(() => {
    if (!client || step !== "done" || address) return;
    return client.onAuthStateChange(() => setAddress(client.getWallet()?.address ?? null));
  }, [client, step, address]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") setTimeout(() => codeRef.current?.focus(), 50);
  }, [step]);

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) { setEmailError("Escribe tu correo."); emailRef.current?.focus(); return; }
    if (!EMAIL_RE.test(value)) { setEmailError("Ese correo no parece válido. Revisa que tenga @ y dominio."); emailRef.current?.focus(); return; }
    if (!client) return;
    setEmail(value);
    setEmailError(null);
    setIdentityMode("email");
    setCooldown(RESEND_SECONDS);
    client.login({ provider: "email", email: value });
  }

  function submitCode(value: string) {
    if (!client || value.length !== CODE_LEN || value === lastSubmitted.current) return;
    lastSubmitted.current = value;
    setCodeError(null);
    client.verifyEmailCode(value);
  }

  function onCodeChange(v: string) {
    setCode(v);
    if (codeError) setCodeError(null);
    if (v.length === CODE_LEN) submitCode(v);
  }

  function resend() {
    if (!client || cooldown > 0) return;
    setCode("");
    setCodeError(null);
    lastSubmitted.current = "";
    setCooldown(RESEND_SECONDS);
    client.sendEmailCode(email);
  }

  function changeEmail() {
    client?.cancelLogin();
    setStep("email");
    setCode("");
    setCodeError(null);
    lastSubmitted.current = "";
    setTimeout(() => emailRef.current?.focus(), 50);
  }

  async function continueAsGuest() {
    setGuestBusy(true);
    setGuestError(null);
    setIdentityMode("guest");
    try {
      const w = await getWallet();
      void ensureWalletFunded(w.publicKey);
      router.push(next);
    } catch {
      setGuestBusy(false);
      setGuestError("No pudimos crear tu billetera de prueba. Permite que el sitio guarde datos e intenta de nuevo.");
    }
  }

  function goOn() {
    setIdentityMode("email");
    router.push(next);
  }

  const sending = auth.step === "creating_session" || auth.step === "sending_email" || auth.step === "entering_email";
  const verifying = auth.step === "verifying_email_code" || auth.step === "authenticating";
  const enter = reduce ? false : { opacity: 0, y: 10 };

  return (
    <div className="min-h-dvh">
      <AppNav back={{ href: "/", label: "Inicio" }} />

      <main id="main" tabIndex={-1} className="outline-none px-gutter pb-safe pt-6 sm:pt-10">
        <div className="mx-auto max-w-md">
          <header className="mb-6">
            <p className="mb-2 text-eyebrow text-gold">Tu cuenta de entrenamiento</p>
            <h1 className="text-title-1 text-cream">Entra con tu correo</h1>
            <p className="mt-2 text-body-sm text-cream-muted">
              Te enviamos un código de un solo uso. Sin contraseñas: tu progreso queda ligado a tu correo y lo recuperas desde cualquier dispositivo.
            </p>
          </header>

          {!pollarEnabled ? (
            <div className="rounded-2xl border border-line-strong bg-surface p-5 shadow-[var(--shadow-md)]">
              <p className="text-sm text-cream-muted">
                La verificación por correo todavía no está activa en este sitio. Puedes entrenar con una billetera de prueba en este navegador.
              </p>
              <Button className="mt-4 w-full" size="lg" loading={guestBusy} onClick={continueAsGuest}>
                Entrar sin correo <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-line-strong bg-surface p-5 shadow-[var(--shadow-md)] sm:p-6">
              <Steps step={step} />

              {booting ? (
                <div className="space-y-3" role="status" aria-label="Preparando">
                  <div className="h-5 w-40 rounded-md skeleton" />
                  <div className="h-12 rounded-xl skeleton" />
                  <div className="h-[52px] rounded-xl skeleton" />
                </div>
              ) : bootError ? (
                <div role="alert" className="rounded-xl border border-danger-border bg-danger-subtle p-4">
                  <p className="text-sm text-danger">{bootError}</p>
                  <button type="button" onClick={() => { setBooting(true); setBootError(null); }} className="tap -ml-2 mt-1 flex items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-cream hover:text-gold">
                    <RotateCw className="h-4 w-4" aria-hidden /> Reintentar
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  {step === "email" && (
                    <motion.form
                      key="email"
                      initial={enter}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      onSubmit={submitEmail}
                      noValidate
                    >
                      <label htmlFor="email" className="mb-2 block text-label text-cream-muted">Correo electrónico</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-muted" aria-hidden />
                        <input
                          ref={emailRef}
                          id="email"
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck={false}
                          enterKeyHint="send"
                          value={email}
                          disabled={sending}
                          onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                          placeholder="tu@correo.com"
                          aria-invalid={!!emailError}
                          aria-describedby={emailError ? "email-error" : "email-help"}
                          className={`h-12 w-full rounded-xl border bg-navy pl-10 pr-4 text-base text-cream placeholder:text-cream-dim transition-colors focus:outline-none disabled:opacity-60 ${emailError ? "border-danger" : "border-line focus:border-gold-ring"}`}
                        />
                      </div>
                      {emailError ? (
                        <p id="email-error" role="alert" className="mt-2 text-sm text-danger">{emailError}</p>
                      ) : (
                        <p id="email-help" className="mt-2 text-xs text-cream-dim">Solo lo usamos para enviarte el código. No mandamos publicidad.</p>
                      )}
                      <Button type="submit" size="lg" className="mt-4 w-full" loading={sending}>
                        {sending ? "Enviando código…" : "Enviarme el código"}
                        {!sending && <ArrowRight className="h-4 w-4" aria-hidden />}
                      </Button>
                    </motion.form>
                  )}

                  {step === "code" && (
                    <motion.form
                      key="code"
                      initial={enter}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      onSubmit={(e) => { e.preventDefault(); lastSubmitted.current = ""; submitCode(code); }}
                      noValidate
                    >
                      <div className="mb-4 flex items-start gap-3 rounded-xl border border-info-border bg-info-subtle px-3.5 py-3">
                        <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden />
                        <p className="text-sm text-info">
                          Enviamos un código de {CODE_LEN} dígitos a <strong className="break-all font-semibold">{maskEmail(email)}</strong>. Revisa también spam o promociones.
                        </p>
                      </div>

                      <label htmlFor="code" className="mb-2 block text-label text-cream-muted">Código de verificación</label>
                      <CodeInput value={code} onChange={onCodeChange} disabled={verifying} invalid={!!codeError} inputRef={codeRef} />
                      {codeError ? (
                        <p id="code-help" role="alert" className="mt-2 text-sm text-danger">{codeError}</p>
                      ) : (
                        <p id="code-help" className="mt-2 text-xs text-cream-dim" aria-live="polite">
                          {verifying ? "Verificando tu código…" : "Se envía solo al escribir el último dígito."}
                        </p>
                      )}

                      <Button type="submit" size="lg" className="mt-4 w-full" loading={verifying} disabled={code.length !== CODE_LEN}>
                        {verifying ? "Verificando…" : "Verificar código"}
                      </Button>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <button type="button" onClick={changeEmail} className="tap -ml-2 rounded-xl px-2 text-sm font-medium text-cream-muted hover:text-cream">
                          Cambiar correo
                        </button>
                        <button
                          type="button"
                          onClick={resend}
                          disabled={cooldown > 0 || verifying}
                          className="tap -mr-2 flex items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-gold hover:text-gold-hover disabled:cursor-not-allowed disabled:text-cream-dim"
                        >
                          <RotateCw className="h-4 w-4" aria-hidden />
                          {cooldown > 0 ? <span className="tabular-nums">Reenviar en {cooldown}s</span> : "Reenviar código"}
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {step === "done" && (
                    <motion.div
                      key="done"
                      initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 280, damping: 24 }}
                      className="text-center"
                      role="status"
                    >
                      <motion.div
                        initial={reduce ? false : { scale: 0.4, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.05 }}
                        className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-success-border bg-success-subtle"
                      >
                        <ShieldCheck className="h-8 w-8 text-success" strokeWidth={1.75} aria-hidden />
                      </motion.div>
                      <h2 className="text-title-2 text-cream">Correo verificado</h2>
                      {email && <p className="mt-1 break-all text-sm text-cream-muted">{email}</p>}

                      <div className="mt-5 space-y-2 text-left">
                        <div className="flex items-center gap-3 rounded-xl border border-line bg-navy px-3.5 py-3">
                          <MailCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />
                          <span className="text-sm text-cream">Identidad confirmada con código</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-line bg-navy px-3.5 py-3">
                          <Wallet className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                          <span className="min-w-0 flex-1 text-sm text-cream">
                            Billetera Stellar testnet{" "}
                            {address ? (
                              <a
                                href={`${STELLAR_EXPERT_ACCOUNT}/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-xs text-gold underline-offset-2 hover:underline"
                              >
                                {midTruncate(address, 5, 4)} <ExternalLink className="h-3 w-3" aria-hidden />
                              </a>
                            ) : (
                              <span className="text-cream-dim">creándose…</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <Button size="lg" className="mt-5 w-full" onClick={goOn} disabled={!address}>
                        {next === "/dashboard" ? "Ir a mi mapa de misiones" : "Continuar"} <ArrowRight className="h-4 w-4" aria-hidden />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          )}

          {pollarEnabled && step !== "done" && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={continueAsGuest}
                disabled={guestBusy}
                className="tap mx-auto flex items-center gap-2 rounded-xl px-3 text-sm font-medium text-cream-muted hover:text-cream disabled:opacity-60"
              >
                <UserRound className="h-4 w-4" aria-hidden />
                {guestBusy ? "Creando billetera de prueba…" : "Prefiero entrar sin correo"}
              </button>
              <p className="mt-1 text-xs text-cream-dim">Sin correo tu progreso vive solo en este navegador.</p>
              {guestError && <p role="alert" className="mt-2 text-sm text-danger">{guestError}</p>}
            </div>
          )}

          <p className="mt-8 text-center text-xs text-cream-dim">
            Verificación por correo con <span className="font-semibold text-cream-muted">Pollar</span> · solo Stellar testnet, sin dinero real ·{" "}
            <Link href="/verify" className="underline-offset-2 hover:text-cream hover:underline">verificar una credencial</Link>
          </p>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarContent />
    </Suspense>
  );
}

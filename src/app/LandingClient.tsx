"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, useAnimationControls } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, AlertTriangle, BookOpen, Clock, Code2, FlaskConical, Globe,
  GraduationCap, HandCoins, ShieldCheck, Users, Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wordmark } from "@/components/Wordmark";
import { TrackArt } from "@/components/TrackArt";
import { useToast } from "@/components/Toast";
import { TRACK_ORDER, TRACK_STYLE } from "@/components/trackStyle";
import { TrackMeta, type Mission } from "@/missions/schema";
import { getWallet, ensureWalletFunded, getIdentityMode, pollarEnabled } from "@/identity";
import { HeroPreview, type HeroPreviewData } from "./HeroPreview";

export interface LandingProps {
  missionCount: number;
  trackCounts: Record<Mission["track"], number>;
  trackLevels: Record<Mission["track"], [number, number]>;
  preview: HeroPreviewData;
}

const LEVEL_LABEL = ["Básico", "Intermedio", "Avanzado"];
const GITHUB = "https://github.com/ALFA117/fyv-box";

/* ─── Scroll reveal (content stays visible without JS / reduced motion) ──── */
function Reveal({ children, delay = 0, className = "", as = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li" }) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const Tag = as === "li" ? motion.li : motion.div;
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const hidden = useRef(false);

  // Server HTML is fully visible; only content below the fold is hidden after hydration, then revealed.
  useEffect(() => {
    const el = ref.current;
    if (reduce || !el) return;
    if (el.getBoundingClientRect().top > window.innerHeight) {
      hidden.current = true;
      controls.set({ opacity: 0, y: 12 });
    }
  }, [controls, reduce]);

  useEffect(() => {
    if (inView && hidden.current) {
      controls.start({ opacity: 1, y: 0, transition: { delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] } });
    }
  }, [inView, controls, delay]);

  return (
    <Tag ref={ref} initial={false} animate={controls} className={className}>
      {children}
    </Tag>
  );
}

/* ─── Start training: creates a real testnet wallet, then opens the dashboard ─ */
function StartTraining({ layout = "block", secondary }: { layout?: "hero" | "block"; secondary?: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [phase, setPhase] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  // Solo en cliente: el modo vive en localStorage.
  const [guestWithEmailOption, setGuestWithEmailOption] = useState(false);
  useEffect(() => { setGuestWithEmailOption(pollarEnabled && getIdentityMode() === "guest"); }, []);

  async function start() {
    if (phase === "working") return;
    setPhase("working");
    if (pollarEnabled && getIdentityMode() === "email") {
      // Con correo: si ya hay sesión verificada entra directo; si no, a verificar el correo.
      setMessage("Revisando tu sesión…");
      try {
        await getWallet();
        setPhase("done");
        setMessage("Listo. Abriendo tu mapa de misiones…");
        router.push("/dashboard");
      } catch {
        router.push("/entrar");
      }
      return;
    }
    setMessage("Creando tu billetera de prueba en Stellar testnet…");
    try {
      const wallet = await getWallet();
      const status = await ensureWalletFunded(wallet.publicKey);
      if (status === "funded") toast("Billetera de prueba lista y fondeada en testnet", "success");
      else toast("Tu billetera está lista. Friendbot no respondió; puedes entrenar igual.", "warning");
      setPhase("done");
      setMessage("Listo. Abriendo tu mapa de misiones…");
      router.push("/dashboard");
    } catch {
      setPhase("error");
      setMessage("No pudimos crear tu billetera. Permite que este sitio guarde datos en tu navegador e intenta de nuevo.");
    }
  }

  const busy = phase === "working" || phase === "done";
  const hint = pollarEnabled
    ? "Entras con tu correo y un código · sin contraseñas"
    : "Sin correo ni contraseña · la llave de prueba vive solo en este navegador";

  return (
    <div className="space-y-3">
      <div className={layout === "hero" ? "flex flex-col gap-3 sm:flex-row" : ""}>
        <Button className={layout === "hero" ? "w-full sm:w-auto" : "w-full"} size="lg" loading={busy} onClick={start}>
          {phase === "working" ? "Preparando…" : phase === "done" ? "Abriendo…" : "Comenzar entrenamiento"}
          {phase === "idle" || phase === "error" ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
        </Button>
        {secondary}
      </div>
      <p
        role={phase === "error" ? "alert" : "status"}
        className={`min-h-[1.25rem] text-sm ${layout === "block" ? "text-center" : ""} ${phase === "error" ? "text-danger" : "text-cream-muted"}`}
      >
        {message || hint}
      </p>
      {guestWithEmailOption && phase !== "working" && (
        <p className={`text-sm ${layout === "block" ? "text-center" : ""}`}>
          <Link href="/entrar" className="tap inline-flex items-center rounded-md px-2 font-semibold text-gold underline-offset-4 hover:underline">
            Entrar con mi correo
          </Link>
        </p>
      )}
    </div>
  );
}

/* ─── Section shell: index + title on the left, content on the right ──────── */
function Section({
  id, index, label, title, intro, children, className = "",
}: {
  id: string; index: string; label: string; title: React.ReactNode; intro?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`px-gutter border-t border-line py-16 sm:py-24 ${className}`}>
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+40px)]">
            <p className="text-eyebrow text-gold">
              <span className="text-cream-dim">{index}</span> — {label}
            </p>
            <h2 id={`${id}-title`} className="mt-4 text-title-1 text-cream">{title}</h2>
            {intro && <p className="mt-4 text-body text-cream-muted">{intro}</p>}
          </div>
        </Reveal>
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const TOOLS = [
  { name: "Friendbot", by: "Stellar Lab", desc: "Fondea cualquier cuenta de testnet con 10,000 XLM de prueba. Tu billetera de FYV Box ya se fondea sola al empezar.", href: "https://lab.stellar.org/account/fund", badge: "Faucet" },
  { name: "Stellar Lab", by: "Stellar", desc: "Crea cuentas de testnet, arma y firma transacciones desde el navegador, sin instalar nada.", href: "https://lab.stellar.org/account/create", badge: "Testnet" },
  { name: "Stellar Expert", by: "Explorador", desc: "Explorador de bloques de testnet. Revisa balances y operaciones de tu billetera de prueba.", href: "https://stellar.expert/explorer/testnet", badge: "Explorador" },
  { name: "Freighter", by: "Wallet", desc: "Wallet de Stellar que permite cambiar a Testnet para practicar firmas sin dinero real.", href: "https://freighter.app", badge: "Wallet" },
];

const METHOD = [
  { icon: FlaskConical, title: "Escenarios realistas, cero riesgo", desc: "Correos, DMs, wallets y firmas que imitan ataques reales. Equivocarte aquí no cuesta nada: cada respuesta explica la trampa.", wide: true },
  { icon: Clock, title: "Sin horarios ni tareas", desc: "Una misión toma menos de 5 minutos, al ritmo que puedas." },
  { icon: HandCoins, title: "100% gratis", desc: "Sin inscripción ni mensualidad. Un bien público para Web3 en LATAM." },
  { icon: ShieldCheck, title: "Credencial verificable", desc: "Al completar un módulo obtienes una prueba pública de que sabes detectar esa estafa. Una wallet, exchange o comunidad puede consultarla antes de darte acceso, sin pedirte nombre ni correo.", wide: true },
];

const WHO = [
  { icon: Users, label: "Personas nuevas en crypto", desc: "Acabas de crear tu primera wallet y quieres entender los riesgos antes de mover dinero." },
  { icon: GraduationCap, label: "Estudiantes universitarios", desc: "Eres de una comunidad blockchain estudiantil y quieres una credencial verificable." },
  { icon: Globe, label: "dApps y exchanges", desc: "Consultas /api/verify para saber si un usuario ya entrenó antes de darle acceso." },
  { icon: BookOpen, label: "Educadores y ONGs", desc: "Das talleres de educación financiera y necesitas simulacros sin riesgo." },
];

const NAV_LINKS = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#modulos", label: "Módulos" },
  { href: "#para-quien", label: "Para quién" },
];

/* ══════════════════════════════════════════════════════════════════════════ */
export function LandingClient({ missionCount, trackCounts, trackLevels, preview }: LandingProps) {
  const trackTotal = TRACK_ORDER.length;

  const steps = [
    pollarEnabled
      ? { icon: Wallet, title: "Entra sin contraseña", desc: "Con tu correo y un código de un solo uso, o como invitado. En ambos casos tienes una billetera de prueba real en Stellar testnet." }
      : { icon: Wallet, title: "Entra sin registrarte", desc: "Creamos una billetera de prueba real en Stellar testnet. Sin correo ni contraseña." },
    { icon: FlaskConical, title: "Enfrenta la trampa", desc: "Un correo, un DM, un airdrop o una firma que imitan ataques reales. Tú decides qué hacer." },
    { icon: GraduationCap, title: "Aprende y certifícate", desc: "Cada respuesta explica la trampa. Completa un módulo y gana su credencial verificable." },
  ];

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="pt-safe sticky top-0 z-50 border-b border-line bg-navy">
        <div className="px-gutter mx-auto flex h-[var(--header-h)] max-w-6xl items-center justify-between gap-3">
          <Link href="/" aria-label="FYV Box — inicio" className="tap flex shrink-0 items-center rounded-md">
            <Wordmark size="md" />
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="hidden min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-cream-muted transition-colors hover:text-cream md:flex">
                {label}
              </a>
            ))}
            <Link href="/verify" className="hidden min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-cream-muted transition-colors hover:text-cream md:flex">
              Verificar
            </Link>
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="press flex min-h-[44px] items-center gap-1.5 rounded-md border border-gold-active bg-gold px-3.5 text-sm font-semibold text-on-gold hover:bg-gold-hover"
            >
              Entrenar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="bg-grid px-gutter relative">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-navy" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 pb-16 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-24">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2 rounded-sm border border-amber-border bg-amber-subtle px-2.5 py-1 font-mono text-[0.8125rem] text-amber">
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                <span className="hidden sm:inline">Simulador ·</span> Stellar testnet · sin dinero real
              </p>

              <h1 className="mt-6 max-w-[14ch] text-display text-cream">
                No caigas en <em className="font-medium italic text-gold">estafas crypto</em>.
              </h1>

              <p className="mt-6 max-w-xl text-body text-cream-muted sm:text-lg sm:leading-relaxed">
                Practica con {missionCount} simulacros de las estafas más comunes en Web3 —phishing, airdrops falsos,
                ingeniería social y firmas peligrosas— y obtén una credencial verificable ligada a tu dirección Stellar.
              </p>

              <div className="mt-8">
                <StartTraining
                  layout="hero"
                  secondary={
                    <Link
                      href={`/mission/${preview.id}`}
                      className="flex min-h-[52px] items-center justify-center gap-2 rounded-md border border-line-strong px-5 text-base font-medium text-cream transition-colors hover:border-line-gold hover:bg-gold-subtle"
                    >
                      Ver una misión de ejemplo
                    </Link>
                  }
                />
              </div>

              <dl className="mt-10 grid max-w-xl grid-cols-3 border-y border-line">
                {[
                  { n: String(missionCount), label: "simulacros" },
                  { n: String(trackTotal), label: "módulos con credencial" },
                  { n: "0 XLM", label: "de riesgo real" },
                ].map(({ n, label }, i) => (
                  <div key={label} className={`flex flex-col-reverse justify-end gap-1 py-4 ${i > 0 ? "border-l border-line pl-4" : "pr-4"}`}>
                    <dt className="text-sm leading-snug text-cream-muted">{label}</dt>
                    <dd className="font-mono text-xl font-medium tabular-nums text-cream sm:text-2xl">{n}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-5">
              <HeroPreview data={preview} />
            </div>
          </div>
        </section>

        {/* ══ 01 CÓMO FUNCIONA ══════════════════════════════════════════ */}
        <Section
          id="como-funciona"
          index="01"
          label="Cómo funciona"
          title="Tres pasos, cinco minutos por misión"
          intro="Sin videos ni exámenes. Cada misión recrea una situación de fraude y tú decides cómo reaccionar."
        >
          <ol className="border-b border-line">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <Reveal as="li" key={title} delay={i * 0.06} className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 border-t border-line py-6 sm:grid-cols-[4rem_1fr_auto] sm:items-start">
                <span className="font-mono text-sm text-gold sm:pt-1">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-title-3 text-cream">{title}</h3>
                  <p className="mt-1.5 max-w-xl text-body text-cream-muted">{desc}</p>
                </div>
                <span className="hidden h-11 w-11 items-center justify-center rounded-md border border-line-strong text-cream-muted sm:flex">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
              </Reveal>
            ))}
          </ol>
        </Section>

        {/* ══ 02 MÓDULOS ════════════════════════════════════════════════ */}
        <Section
          id="modulos"
          index="02"
          label="Contenido"
          title={<><span className="whitespace-nowrap">{missionCount} simulacros,</span>{" "}<span className="whitespace-nowrap">{trackTotal} módulos</span></>}
          intro="Cada módulo termina con una credencial verificable. Hazlos en el orden que quieras."
        >
          <ul className="overflow-hidden rounded-lg border border-line-strong bg-surface shadow-[var(--shadow-md)]">
            {TRACK_ORDER.map((track, i) => {
              const s = TRACK_STYLE[track];
              const [lo, hi] = trackLevels[track];
              return (
                <Reveal as="li" key={track} delay={i * 0.04} className={i > 0 ? "border-t border-line" : ""}>
                  <Link href="/dashboard" className="group relative flex items-start gap-4 p-5 transition-colors hover:bg-surface-2 sm:items-center sm:gap-5 sm:px-6">
                    <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${s.bar} opacity-80`} />
                    <TrackArt track={track} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-title-3 text-cream">{TrackMeta[track].label}</h3>
                        <span className="font-mono text-xs text-cream-muted">
                          {trackCounts[track]} {trackCounts[track] === 1 ? "misión" : "misiones"} · {lo === hi ? LEVEL_LABEL[lo] : `${LEVEL_LABEL[lo]} → ${LEVEL_LABEL[hi]}`}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-cream-muted sm:text-[0.9375rem]">{TrackMeta[track].description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-cream-dim transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-gold sm:mt-0" aria-hidden />
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </Section>

        {/* ══ 03 MÉTODO ═════════════════════════════════════════════════ */}
        <Section
          id="metodo"
          index="03"
          label="Método"
          title={<>Las escuelas enseñan teoría. <span className="text-gold">Aquí entras a la trampa.</span></>}
        >
          <ul className="grid gap-px overflow-hidden rounded-lg border border-line-strong bg-line-strong sm:grid-cols-2 lg:grid-cols-3">
            {METHOD.map(({ icon: Icon, title, desc, wide }, i) => (
              <Reveal as="li" key={title} delay={i * 0.05} className={`bg-navy p-6 sm:p-7 ${wide ? "lg:col-span-2" : ""}`}>
                <Icon className="h-6 w-6 text-gold" strokeWidth={1.75} aria-hidden />
                <h3 className="mt-5 text-title-3 text-cream">{title}</h3>
                <p className="mt-2 text-body-sm text-cream-muted sm:text-base">{desc}</p>
              </Reveal>
            ))}
          </ul>
        </Section>

        {/* ══ 04 PARA QUIÉN ═════════════════════════════════════════════ */}
        <Section id="para-quien" index="04" label="Para quién" title="Para personas y para código">
          <dl className="grid gap-x-10 sm:grid-cols-2">
            {WHO.map(({ icon: Icon, label, desc }, i) => (
              <Reveal key={label} delay={i * 0.05} className="flex gap-4 border-t border-line py-6">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
                <div>
                  <dt className="font-semibold text-cream">{label}</dt>
                  <dd className="mt-1 text-body-sm text-cream-muted sm:text-base">{desc}</dd>
                </div>
              </Reveal>
            ))}
          </dl>

          <Reveal className="mt-8">
            <div className="overflow-hidden rounded-lg border border-line-strong bg-surface shadow-[var(--shadow-md)]">
              <div className="flex items-center gap-2 border-b border-line px-5 py-3">
                <Code2 className="h-4 w-4 text-cream-muted" aria-hidden />
                <h3 className="text-sm font-semibold text-cream">Integra la verificación en tu dApp</h3>
                <span className="ml-auto rounded-sm border border-line px-1.5 py-0.5 font-mono text-xs text-cream-muted">público · CORS abierto</span>
              </div>
              <pre className="scroll-x bg-navy-deep px-5 py-4 text-[0.8125rem] leading-relaxed text-cream-muted">
<span className="text-gold">GET</span> /api/verify?address=<span className="text-cream">G…</span>{"\n"}<span className="text-cream-dim">→</span> {"{"} &quot;certified&quot;: <span className="text-success">true</span>, &quot;modules&quot;: [<span className="text-cream">…</span>] {"}"}
              </pre>
              <div className="border-t border-line px-5 py-2">
                <Link href="/verify" className="tap -ml-2 inline-flex items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-gold underline-offset-4 hover:underline">
                  Probar el verificador <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* ══ 05 HERRAMIENTAS ═══════════════════════════════════════════ */}
        <Section
          id="herramientas"
          index="05"
          label="Faucets y herramientas"
          title="Explora Stellar testnet"
          intro="Herramientas oficiales y del ecosistema para practicar. Ningún fondo de testnet tiene valor real."
        >
          <ul className="border-b border-line">
            {TOOLS.map(({ name, by, desc, href, badge }, i) => (
              <Reveal as="li" key={name} delay={i * 0.04} className="border-t border-line">
                <a href={href} target="_blank" rel="noopener noreferrer" className="group grid gap-1 py-5 sm:grid-cols-[12rem_1fr_auto] sm:items-baseline sm:gap-6">
                  <span className="flex items-baseline gap-2">
                    <span className="font-semibold text-cream group-hover:text-gold">{name}</span>
                    <span className="font-mono text-xs text-cream-dim">{badge}</span>
                  </span>
                  <span className="text-body-sm text-cream-muted sm:text-base">
                    <span className="sr-only">{by}. </span>{desc}
                  </span>
                  <ArrowUpRight className="hidden h-4 w-4 text-cream-dim transition-colors group-hover:text-gold sm:block" aria-label="(abre en otra pestaña)" />
                </a>
              </Reveal>
            ))}
          </ul>
        </Section>

        {/* ══ QUIÉNES SOMOS ═════════════════════════════════════════════ */}
        <section id="nosotros" aria-labelledby="nosotros-title" className="px-gutter border-t border-line bg-surface py-16 sm:py-20">
          <Reveal className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Image src="/logo-panther.webp" alt="Logo de FYV Box: pantera en un circuito" width={320} height={125} sizes="320px" className="logo-panther h-auto w-56 sm:w-72" />
            </div>
            <div className="lg:col-span-8">
              <p className="text-eyebrow text-gold">Quiénes somos</p>
              <h2 id="nosotros-title" className="mt-3 text-title-2 text-cream sm:text-[1.75rem]">Un proyecto de la comunidad, para la comunidad</h2>
              <p className="mt-4 max-w-2xl text-body text-cream-muted">
                FYV Box nació en <strong className="font-semibold text-cream">CriptoUNAM</strong>, la comunidad blockchain de
                estudiantes de la UNAM. Vimos a personas nuevas perder fondos en estafas básicas que se evitan con práctica, así
                que hicimos un simulador donde equivocarse cuesta cero. El código es abierto.
              </p>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="tap -ml-2 mt-3 inline-flex items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-gold underline-offset-4 hover:underline">
                Ver el código en GitHub <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </Reveal>
        </section>

        {/* ══ START ═════════════════════════════════════════════════════ */}
        <section id="start" aria-labelledby="start-title" className="px-gutter border-t border-line py-16 sm:py-24">
          <Reveal className="mx-auto grid max-w-6xl gap-8 rounded-lg border border-line-strong bg-surface p-6 shadow-[var(--shadow-lg)] sm:p-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h2 id="start-title" className="text-title-1 text-cream">Empieza tu primera misión</h2>
              <p className="mt-3 max-w-xl text-body text-cream-muted">
                Tienes una billetera de prueba en Stellar testnet, fondeada con Friendbot, y cada credencial que ganes queda
                ligada a su dirección.
              </p>
              <p className="mt-5 flex max-w-xl items-start gap-2.5 border-l-2 border-amber pl-3 text-sm text-cream">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" strokeWidth={2.25} aria-hidden />
                <span><strong className="font-semibold">Entorno de práctica.</strong> Nunca uses aquí una wallet ni una frase semilla reales.</span>
              </p>
            </div>
            <div className="lg:col-span-5">
              <StartTraining />
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="px-gutter pb-safe border-t border-line pt-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Wordmark size="sm" />
              <p className="mt-1 text-sm text-cream-muted">Entrenamiento anti-estafas · Stellar testnet</p>
            </div>
            <nav aria-label="Pie de página" className="-ml-3 flex flex-wrap items-center gap-1 sm:ml-0">
              {[
                { href: "#modulos", label: "Módulos" },
                { href: "#herramientas", label: "Faucets" },
                { href: "/verify", label: "Verificar" },
                { href: GITHUB, label: "GitHub", external: true },
              ].map(({ href, label, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex min-h-[44px] items-center rounded-md px-3 text-sm text-cream-muted transition-colors hover:text-cream"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div className="mt-6 flex flex-col gap-1 border-t border-line pt-5 text-sm text-cream-muted sm:flex-row sm:justify-between">
            <p>© 2026 FYV Box · Comunidad CriptoUNAM</p>
            <p className="font-mono text-xs leading-5">Stellar testnet · sin riesgo financiero</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

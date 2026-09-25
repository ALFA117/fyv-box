"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, useInView } from "framer-motion";
import {
  Shield, ArrowRight, CheckCircle, Zap, Users, BookOpen,
  GraduationCap, Wallet, ExternalLink, Sun, Moon, ChevronDown,
  AlertTriangle, Globe, Code2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ── Theme toggle ──────────────────────────────────────────────────────── */
function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const saved = localStorage.getItem("fyv-theme") as "dark" | "light" | null;
    const t = saved ?? "dark";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("fyv-theme", next);
  }
  return { theme, toggle };
}

/* ── 3D Logo ───────────────────────────────────────────────────────────── */
function Logo3D() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-100, 100], [18, -18]);
  const rotateY = useTransform(mouseX, [-100, 100], [-18, 18]);

  function onMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }
  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="flex items-center justify-center"
      style={{ perspective: "800px" }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        transition={{ type: "spring", stiffness: 200, damping: 28 }}
        className="relative"
        animate={{ y: [0, -10, 0] }}
        // @ts-ignore — framer-motion overload
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Glow layer behind */}
        <div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(ellipse, rgba(201,162,39,.5) 0%, transparent 70%)",
            transform: "translateZ(-20px) scale(1.4)",
            animation: "pulse-glow 3s ease-in-out infinite",
          }}
          aria-hidden
        />

        {/* Main image */}
        <motion.div
          className="relative overflow-hidden rounded-full"
          style={{ transformStyle: "preserve-3d" }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          {/* Scan line effect */}
          <div
            className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/70 to-transparent z-10"
            style={{ animation: "scan-line 3.5s linear infinite" }}
            aria-hidden
          />

          <Image
            src="/logo-panther.webp"
            alt="FYV Box — Pantera Digital"
            width={280}
            height={280}
            className="h-56 w-56 object-contain drop-shadow-2xl sm:h-64 sm:w-64"
            priority
          />
        </motion.div>

        {/* Circuit dots orbiting */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <motion.div
            key={deg}
            className="absolute h-2 w-2 rounded-full bg-[var(--gold)]"
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: "0 0",
            }}
            animate={{
              rotate: [deg, deg + 360],
              x: Math.cos((deg * Math.PI) / 180) * 140,
              y: Math.sin((deg * Math.PI) / 180) * 140,
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 6 + i * 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.3,
            }}
            aria-hidden
          />
        ))}
      </motion.div>
    </div>
  );
}

/* ── Section wrapper with scroll-reveal ────────────────────────────────── */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Faucet card ────────────────────────────────────────────────────────── */
interface FaucetProps { name: string; desc: string; href: string; icon: React.ElementType; color: string }
function FaucetCard({ name, desc, href, icon: Icon, color }: FaucetProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-200 hover:border-[var(--border-gold)] hover:shadow-[var(--shadow-gold)]"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[var(--cream)]">{name}</p>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--cream-muted)] transition-colors group-hover:text-[var(--gold)]" strokeWidth={1.75} />
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--cream-muted)]">{desc}</p>
      </div>
    </a>
  );
}

/* ── Auth modal ─────────────────────────────────────────────────────────── */
function AuthForm() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");
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

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="flex flex-col items-center gap-3 py-4 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--success-border)] bg-[var(--success-subtle)]">
          <CheckCircle className="h-7 w-7 text-[var(--success)]" strokeWidth={2} />
        </div>
        <p className="text-base font-semibold text-[var(--cream)]">¡Bienvenido/a!</p>
        <p className="text-sm text-[var(--cream-muted)]">Preparando tu entrenamiento…</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="relative">
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="tu@correo.com"
          aria-label="Correo electrónico"
          aria-invalid={!!error}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--navy)] px-4 py-3.5 text-sm text-[var(--cream)] placeholder:text-[var(--cream-dim)] transition-colors focus:border-[var(--gold-ring)] focus:outline-none"
        />
      </div>
      {error && <p role="alert" className="text-xs text-[var(--danger)]">{error}</p>}
      <Button type="submit" className="w-full" loading={loading} size="lg">
        Comenzar entrenamiento
        <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="text-center text-xs text-[var(--cream-dim)]">
        Billetera de prueba en Stellar testnet · sin fondos reales
      </p>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { theme, toggle } = useTheme();

  const whyNotSchool = [
    { icon: Zap,        title: "Sin horarios ni tareas",   desc: "Entrenas cuando quieres, al ritmo que puedes. Una misión toma menos de 5 minutos." },
    { icon: Code2,      title: "Todo es práctico y real",  desc: "Cada simulacro usa transacciones reales en Stellar testnet. Aprendes haciendo, no leyendo." },
    { icon: Shield,     title: "Credencial on-chain",      desc: "Al terminar, tu credencial vive en la blockchain — no es un PDF que cualquiera puede falsificar." },
    { icon: Sparkles,   title: "Sin costo ni inscripción", desc: "Acceso libre. FYV Box es un bien público para la comunidad Web3 de LATAM." },
  ];

  const whoItIsFor = [
    { icon: Users,        color: "text-blue-400",           label: "Usuarios nuevos en crypto",    desc: "Acabas de crear tu primera wallet y quieres entender los riesgos antes de mover fondos reales." },
    { icon: GraduationCap, color: "text-[var(--gold)]",     label: "Estudiantes UNAM / IPN / UNAM", desc: "Eres parte de un club de blockchain universitario y quieres demostrar que conoces el ecosistema." },
    { icon: Globe,        color: "text-[var(--success)]",   label: "dApps y exchanges",             desc: "Quieres integrar `/api/verify` para filtrar usuarios con conocimientos probados antes de darles acceso." },
    { icon: BookOpen,     color: "text-purple-400",         label: "Educadores y ONGs",             desc: "Impartes talleres de educación financiera y necesitas simulacros reales para tus participantes." },
  ];

  const faucets = [
    {
      name: "Stellar Friendbot",
      desc: "Fondea cualquier cuenta de Stellar testnet con 10,000 XLM de prueba. Oficial de la Stellar Development Foundation.",
      href: "https://friendbot.stellar.org",
      icon: Wallet,
      color: "bg-[var(--gold-subtle)] text-[var(--gold)]",
    },
    {
      name: "Stellar Laboratory",
      desc: "Crea cuentas testnet, firma transacciones manualmente y explora el ecosistema desde el browser. Sin instalar nada.",
      href: "https://laboratory.stellar.org/#account-creator?network=test",
      icon: Code2,
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      name: "Stellar Expert (Testnet)",
      desc: "Explorador de bloques para testnet. Verifica transacciones, balances y credenciales FYV Box emitidas on-chain.",
      href: "https://stellar.expert/explorer/testnet",
      icon: ExternalLink,
      color: "bg-[var(--success-subtle)] text-[var(--success)]",
    },
    {
      name: "Lobstr Testnet",
      desc: "Wallet móvil de Stellar con soporte para testnet. Ideal para practicar sin riesgo desde tu teléfono.",
      href: "https://lobstr.co",
      icon: Shield,
      color: "bg-purple-500/10 text-purple-400",
    },
  ];

  return (
    <div className="relative min-h-dvh overflow-x-hidden">

      {/* ── Sticky nav bar ─────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-[var(--border)] bg-[var(--navy)]/85 px-4 py-3 backdrop-blur-md sm:px-8"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg">
            <Image src="/logo-panther.webp" alt="FYV Box" width={28} height={28} className="object-contain" />
          </div>
          <span className="font-playfair text-base font-bold text-[var(--cream)]">
            FYV<span className="text-[var(--gold)]"> Box</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a href="#faucets" className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--cream-muted)] hover:text-[var(--cream)] sm:block">
            Faucets
          </a>
          <a href="#auth" className="hidden rounded-lg border border-[var(--border-gold)] px-3 py-1.5 text-xs font-medium text-[var(--gold)] hover:bg-[var(--gold-subtle)] sm:block">
            Iniciar
          </a>
          <button
            onClick={toggle}
            aria-label="Cambiar tema"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--cream-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--cream)]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* ── Animated background ────────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/5 blur-[120px]" />
        <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-blue-600/4 blur-[80px]" />
        <div className="absolute bottom-20 left-0 h-64 w-64 rounded-full bg-purple-700/4 blur-[80px]" />
        {/* Grid */}
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" fill="none" stroke="currentColor" strokeWidth=".4"
                className="text-[var(--border)]" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ═══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="flex min-h-dvh flex-col items-center justify-center px-4 pb-12 pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <Logo3D />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-gold)] bg-[var(--gold-subtle)] px-3.5 py-1.5 text-xs font-semibold text-[var(--gold)]">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
            Stellar Testnet · Sin fondos reales
          </div>

          <h1 className="font-playfair text-4xl font-bold leading-tight text-[var(--cream)] sm:text-5xl">
            Aprende a no caer<br />
            <span className="text-[var(--gold)]">en estafas crypto</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--cream-muted)] sm:text-lg">
            FYV Box es una plataforma de entrenamiento anti-fraude para la nueva economía Web3.
            Enfrenta simulacros reales, practica en Stellar testnet y obtén
            una credencial on-chain al graduarte.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#auth"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-3.5 text-sm font-bold text-[var(--navy)] transition-colors hover:bg-[var(--gold-hover)]"
            >
              Comenzar ahora
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#who"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-5 py-3.5 text-sm text-[var(--cream-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--cream)]"
            >
              ¿Esto es para mí?
              <ChevronDown className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-[var(--cream-muted)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ QUIÉNES SOMOS ═════════════════════════════════════════════════════ */}
      <section id="about" className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Section className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">
              Quiénes somos
            </p>
            <h2 className="font-playfair text-3xl font-bold text-[var(--cream)] sm:text-4xl">
              Un proyecto de la comunidad,<br />para la comunidad
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--cream-muted)]">
              FYV Box nació en CriptoUNAM — la comunidad de blockchain de la Universidad
              Nacional Autónoma de México. Vimos que miles de usuarios nuevos perdían
              fondos en estafas básicas que podían evitarse con práctica.
              Creamos un simulador donde el costo de equivocarse es cero.
            </p>
          </Section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { value: "7+", label: "Tipos de estafa cubiertos", icon: Shield },
              { value: "100%", label: "Gratis y open source", icon: Sparkles },
              { value: "0 XLM", label: "Riesgo real durante el entrenamiento", icon: CheckCircle },
            ].map(({ value, label, icon: Icon }, i) => (
              <Section key={label}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 280, damping: 26 }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center"
                >
                  <Icon className="h-6 w-6 text-[var(--gold)]" strokeWidth={1.75} />
                  <p className="font-playfair text-3xl font-bold text-[var(--cream)]">{value}</p>
                  <p className="text-sm text-[var(--cream-muted)]">{label}</p>
                </motion.div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ POR QUÉ NO SOMOS UNA ESCUELA ═════════════════════════════════════ */}
      <section id="why-not" className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Section className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">
              Por qué no somos una escuela
            </p>
            <h2 className="font-playfair text-3xl font-bold text-[var(--cream)] sm:text-4xl">
              Las escuelas enseñan teoría.<br />
              <span className="text-[var(--gold)]">Nosotros te ponemos en la trampa.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--cream-muted)]">
              No hay videos, no hay exámenes de opción múltiple sobre conceptos abstractos.
              Cada misión simula una situación real de fraude que ocurrió en la comunidad.
              Tú decides cómo reaccionas. La blockchain registra si lo lograste.
            </p>
          </Section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {whyNotSchool.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 280, damping: 26 }}
                className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border-gold)] bg-[var(--gold-subtle)]">
                  <Icon className="h-5 w-5 text-[var(--gold)]" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cream)]">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--cream-muted)]">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ A QUIÉN LE PUEDE INTERESAR ════════════════════════════════════════ */}
      <section id="who" className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Section className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">
              ¿A quién le puede interesar?
            </p>
            <h2 className="font-playfair text-3xl font-bold text-[var(--cream)] sm:text-4xl">
              Para humanos y para código
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--cream-muted)]">
              FYV Box funciona como herramienta de entrenamiento personal
              y como infraestructura de confianza para otras apps.
            </p>
          </Section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {whoItIsFor.map(({ icon: Icon, color, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 280, damping: 26 }}
                className="group flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)]">
                  <Icon className={`h-5 w-5 ${color}`} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cream)]">{label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--cream-muted)]">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* API callout */}
          <Section className="mt-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/8 p-5">
              <div className="flex items-start gap-3">
                <Code2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold text-blue-300">
                    Integra la verificación en tu dApp
                  </p>
                  <p className="mt-1 text-xs text-blue-300/70">
                    Un solo endpoint público, sin autenticación:
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--navy)] p-3 text-xs text-[var(--gold)]/90">
{`GET /api/verify?address=G...
→ { "certified": true, "modules": ["phishing", "fake-assets"] }`}
                  </pre>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ FAUCETS ═══════════════════════════════════════════════════════════ */}
      <section id="faucets" className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Section className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">
              Faucets & Herramientas
            </p>
            <h2 className="font-playfair text-3xl font-bold text-[var(--cream)] sm:text-4xl">
              Consigue XLM de prueba
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--cream-muted)]">
              Antes de entrenar, fondea tu billetera testnet con XLM de práctica.
              Ninguno de estos fondos tiene valor real. Son solo para aprender.
            </p>
          </Section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {faucets.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 280, damping: 26 }}
              >
                <FaucetCard {...f} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AUTH CTA ══════════════════════════════════════════════════════════ */}
      <section id="auth" className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-md">
          <Section className="mb-8 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">
              Comienza ahora
            </p>
            <h2 className="font-playfair text-3xl font-bold text-[var(--cream)]">
              ¿Listo para entrenar?
            </h2>
            <p className="mt-3 text-sm text-[var(--cream-muted)]">
              Ingresa tu correo para empezar. Tu billetera de práctica se genera automáticamente.
            </p>
          </Section>

          <Section>
            <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
              <AuthForm />
            </div>
          </Section>

          {/* Trust badges */}
          <Section className="mt-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { icon: Shield, text: "Sin fondos reales" },
                { icon: CheckCircle, text: "Open source" },
                { icon: Globe, text: "Stellar testnet" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-[var(--cream-muted)]">
                  <Icon className="h-3.5 w-3.5 text-[var(--gold)]" strokeWidth={2} />
                  {text}
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--cream-muted)]">
          <Image src="/logo-panther.webp" alt="" width={20} height={20} className="opacity-60" />
          <span>FYV Box — CriptoUNAM · Stellar testnet · 2026</span>
        </div>
      </footer>
    </div>
  );
}

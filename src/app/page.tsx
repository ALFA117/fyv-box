"use client";
import {
  useState, useEffect, useRef, useCallback,
} from "react";
import {
  motion, useMotionValue, useTransform, AnimatePresence, useInView, useSpring,
} from "framer-motion";
import {
  ArrowRight, CheckCircle, Zap, Users, BookOpen,
  GraduationCap, Wallet, ExternalLink, Sun, Moon, ChevronDown,
  AlertTriangle, Globe, Code2, Sparkles, Shield,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/* ─── Theme ──────────────────────────────────────────────────────────────── */
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

/* ─── Canvas Particle Network ────────────────────────────────────────────── */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  radius: number; alpha: number;
}

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number>(0);

  const init = useCallback((w: number, h: number) => {
    const count = Math.min(Math.floor((w * h) / 12000), 90);
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      init(canvas.width, canvas.height);
    };
    resize();

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);

    const LINK_DIST = 130;
    const MOUSE_DIST = 100;

    function draw() {
      const w = canvas!.width, h = canvas!.height;
      ctx.clearRect(0, 0, w, h);

      const ps = particles.current;
      for (const p of ps) {
        // gentle mouse repel
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_DIST) {
          const force = (MOUSE_DIST - d) / MOUSE_DIST * 0.015;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
        // dampen
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,162,39,${p.alpha * 0.7})`;
        ctx.fill();
      }

      // draw links
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(201,162,39,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      raf.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [init]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
    />
  );
}

/* ─── Holographic Logo ───────────────────────────────────────────────────── */
function HologramLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 22 });
  const rotateX  = useTransform(springY, [-1, 1], [14, -14]);
  const rotateY  = useTransform(springX, [-1, 1], [-14, 14]);

  function handleMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2));
    mouseY.set((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2));
  }
  function handleLeave() { mouseX.set(0); mouseY.set(0); }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative flex items-center justify-center"
      style={{ perspective: "900px", width: 340, height: 340 }}
    >
      {/* anillo exterior giratorio */}
      <div
        className="absolute inset-0 rounded-full border border-[var(--gold)]/25"
        style={{ animation: "ring-spin 12s linear infinite" }}
        aria-hidden
      >
        {[0, 90, 180, 270].map((deg) => (
          <div
            key={deg}
            className="absolute h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
            style={{
              top: "50%", left: "50%",
              transform: `rotate(${deg}deg) translateX(168px) translateY(-50%)`,
              boxShadow: "0 0 6px var(--gold)",
            }}
          />
        ))}
      </div>

      {/* anillo interior punteado */}
      <div
        className="absolute rounded-full border border-dashed border-[var(--gold)]/20"
        style={{ inset: 20, animation: "ring-spin-rev 9s linear infinite" }}
        aria-hidden
      />

      {/* 3D tilt container */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10"
      >
        {/* bottom glow shadow */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-4 w-40 rounded-full blur-xl"
          style={{ background: "rgba(201,162,39,.40)" }}
          aria-hidden
        />

        {/* logo frame — círculo limpio */}
        <div
          className="holo-sheen relative overflow-hidden rounded-full"
          style={{
            width: 240,
            height: 240,
            boxShadow: `
              0 0 0 2px rgba(201,162,39,.6),
              0 0 32px rgba(201,162,39,.30),
              0 0 70px rgba(201,162,39,.12),
              inset 0 0 30px rgba(201,162,39,.08)
            `,
          }}
        >
          {/* scan line sutil */}
          <div
            className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/70 to-transparent z-20"
            style={{ animation: "scan-v 3.5s linear infinite" }}
            aria-hidden
          />

          {/* imagen principal — sin glitch */}
          <Image
            src="/logo-panther.webp"
            alt="FYV Box Pantera"
            width={240}
            height={240}
            className="h-full w-full object-cover"
            style={{ filter: "brightness(1.05) contrast(1.1)" }}
            priority
          />
        </div>
      </motion.div>

      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(201,162,39,.15) 0%, transparent 65%)",
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
        aria-hidden
      />
    </div>
  );
}

/* ─── Animated counter ───────────────────────────────────────────────────── */
function AnimCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = to / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Scroll reveal wrapper ──────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const ref  = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Glass card ─────────────────────────────────────────────────────────── */
function GlassCard({ children, className = "", gold = false }: {
  children: React.ReactNode; className?: string; gold?: boolean
}) {
  return (
    <div
      className={[
        "rounded-2xl border backdrop-blur-sm transition-all duration-200",
        gold
          ? "border-[var(--border-gold)] bg-[var(--gold-subtle)] hover:bg-[var(--gold)]/15"
          : "border-[var(--border-strong)] bg-[var(--surface)]/70 hover:border-[var(--border-gold)]/50",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* ─── Auth form ──────────────────────────────────────────────────────────── */
function AuthForm() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Ingresa tu correo."); return; }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSent(true);
    setLoading(false);
    setTimeout(() => router.push("/dashboard"), 1600);
  }

  if (sent) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="flex flex-col items-center gap-3 py-6 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--success-border)] bg-[var(--success-subtle)]">
        <CheckCircle className="h-8 w-8 text-[var(--success)]" strokeWidth={2} />
      </div>
      <p className="font-playfair text-lg font-bold text-[var(--cream)]">¡Bienvenido/a!</p>
      <p className="text-sm text-[var(--cream-muted)]">Preparando tu entrenamiento…</p>
    </motion.div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <input
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(""); }}
        placeholder="tu@correo.com"
        aria-label="Correo electrónico"
        className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--navy)]/80 px-4 py-3.5 text-sm text-[var(--cream)] placeholder:text-[var(--cream-dim)] backdrop-blur-sm transition-colors focus:border-[var(--gold-ring)] focus:outline-none"
      />
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

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
const FAUCETS = [
  {
    name: "Stellar Friendbot",
    desc: "Fondea cualquier cuenta testnet con 10,000 XLM de prueba. Oficial de la Stellar Development Foundation.",
    href: "https://friendbot.stellar.org",
    icon: Wallet,
    badge: "Oficial SDF",
    badgeColor: "text-[var(--gold)] bg-[var(--gold-subtle)] border-[var(--border-gold)]",
  },
  {
    name: "Stellar Laboratory",
    desc: "Crea cuentas testnet, firma transacciones y explora el ecosistema desde el browser. Sin instalar nada.",
    href: "https://laboratory.stellar.org/#account-creator?network=test",
    icon: Code2,
    badge: "Testnet",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    name: "Stellar Expert",
    desc: "Explorador de bloques para testnet. Verifica transacciones, balances y credenciales FYV Box on-chain.",
    href: "https://stellar.expert/explorer/testnet",
    icon: Globe,
    badge: "Explorer",
    badgeColor: "text-[var(--success)] bg-[var(--success-subtle)] border-[var(--success-border)]",
  },
  {
    name: "Lobstr Testnet",
    desc: "Wallet móvil de Stellar con soporte para testnet. Practica desde tu teléfono sin riesgo.",
    href: "https://lobstr.co",
    icon: Shield,
    badge: "Wallet",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
];

const WHY_NOT = [
  { icon: Zap,           title: "Sin horarios ni tareas",    desc: "Una misión toma menos de 5 minutos. Cuando quieras, al ritmo que puedas." },
  { icon: Code2,         title: "Todo real en testnet",      desc: "Cada simulacro usa transacciones reales. Aprendes haciendo, no leyendo." },
  { icon: Shield,        title: "Credencial on-chain",       desc: "Al graduarte, tu credencial vive en la blockchain, no en un PDF falsificable." },
  { icon: Sparkles,      title: "100% gratis",               desc: "Sin inscripción, sin mensualidad. FYV Box es un bien público para Web3 LATAM." },
];

const WHO = [
  { icon: Users,          color: "text-blue-400   bg-blue-500/10",   label: "Usuarios nuevos en crypto",     desc: "Acabas de crear tu primera wallet y quieres entender los riesgos antes de mover fondos." },
  { icon: GraduationCap, color: "text-[var(--gold)] bg-[var(--gold-subtle)]", label: "Estudiantes universitarios",    desc: "Eres de CriptoUNAM, CriptoIPN o cualquier capítulo y quieres una credencial verificable." },
  { icon: Globe,          color: "text-[var(--success)] bg-[var(--success-subtle)]", label: "dApps y exchanges",          desc: "Integras /api/verify para filtrar usuarios con conocimientos probados antes de darles acceso." },
  { icon: BookOpen,       color: "text-purple-400 bg-purple-500/10", label: "Educadores y ONGs",             desc: "Impartes talleres de educación financiera y necesitas simulacros reales sin riesgo." },
];

export default function LandingPage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="relative min-h-dvh overflow-x-hidden">

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Ambient blobs (behind everything) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/3 top-1/4 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/5 blur-[140px]" />
        <div className="absolute right-0 bottom-1/3 h-96 w-96 rounded-full bg-blue-700/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-purple-700/4 blur-[100px]" />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--navy)]/80 px-5 py-3 backdrop-blur-lg sm:px-10"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-[var(--border-gold)] bg-[var(--surface)]">
            <Image src="/logo-panther.webp" alt="" width={36} height={36} className="h-full w-full object-cover" />
          </div>
          <span className="font-playfair text-base font-bold text-[var(--cream)]">
            FYV<span className="text-[var(--gold)]"> Box</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {["#about","#faucets"].map((href, i) => (
            <a key={href} href={href}
              className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--cream-muted)] transition-colors hover:text-[var(--cream)] sm:block">
              {["Quiénes somos","Faucets"][i]}
            </a>
          ))}
          <a href="#auth"
            className="hidden rounded-xl border border-[var(--border-gold)] bg-[var(--gold-subtle)] px-4 py-1.5 text-xs font-semibold text-[var(--gold)] transition-colors hover:bg-[var(--gold)]/20 sm:block">
            Iniciar →
          </a>
          <button
            onClick={toggle}
            aria-label="Cambiar tema"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--cream-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--cream)]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* ══ HERO — split 50/50 ════════════════════════════════════════════ */}
      <section className="relative flex min-h-dvh flex-row pt-16">

        {/* ── Mitad izquierda: Copy ───────────────────────────────────────── */}
        <div className="flex w-1/2 items-center justify-center px-6 py-16 min-h-[calc(100dvh-4rem)] lg:px-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--amber-border)] bg-[var(--amber-subtle)] px-3.5 py-1.5 text-xs font-semibold text-[var(--amber)]">
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
              Stellar Testnet · Sin fondos reales
            </div>

            <h1 className="font-playfair text-4xl font-bold leading-[1.15] text-[var(--cream)] lg:text-5xl">
              Aprende a no caer<br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, var(--gold), #fff8e1, var(--gold-hover))",
                  backgroundSize: "200% auto",
                  animation: "holo-rotate 4s linear infinite",
                }}
              >
                en estafas crypto
              </span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-[var(--cream-muted)] sm:text-lg">
              FYV Box es la plataforma de entrenamiento anti-fraude para la economía
              Web3. Enfrenta simulacros reales en Stellar testnet, gana experiencia
              y certifícate on-chain al graduarte.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#auth"
                className="group inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-3.5 text-sm font-bold text-[var(--navy)] shadow-[0_0_24px_rgba(201,162,39,.35)] transition-all hover:bg-[var(--gold-hover)] hover:shadow-[0_0_36px_rgba(201,162,39,.55)]"
              >
                Comenzar gratis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#who"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-5 py-3.5 text-sm text-[var(--cream-muted)] backdrop-blur-sm transition-colors hover:border-[var(--border-gold)] hover:text-[var(--cream)]"
              >
                ¿Esto es para mí?
                <ChevronDown className="h-4 w-4" />
              </a>
            </div>

            {/* mini stats en hero */}
            <div className="mt-10 flex gap-8 border-t border-[var(--border)] pt-6">
              {[
                { n: "7+", label: "tipos de estafa" },
                { n: "100%", label: "gratis" },
                { n: "0 XLM", label: "riesgo" },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="font-playfair text-2xl font-bold text-[var(--gold)]">{n}</p>
                  <p className="text-xs text-[var(--cream-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* divisor vertical — solo desktop */}
        <div
          aria-hidden
          className="pointer-events-none hidden lg:block absolute left-1/2 top-16 bottom-0 w-px"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(201,162,39,.3) 20%, rgba(201,162,39,.3) 80%, transparent)",
          }}
        />

        {/* ── Mitad derecha: Logo ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-1/2 items-center justify-center py-16 min-h-[calc(100dvh-4rem)]"
        >
          <HologramLogo />
        </motion.div>

        {/* Scroll hint */}
        <motion.a
          href="#about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-xs text-[var(--cream-muted)] hover:text-[var(--gold)] transition-colors"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.a>
      </section>

      {/* ══ QUIÉNES SOMOS ═══════════════════════════════════════════════ */}
      <section id="about" className="px-4 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
              Quiénes somos
            </p>
            <h2 className="font-playfair text-3xl font-bold text-[var(--cream)] sm:text-4xl">
              Un proyecto de la comunidad,<br />para la comunidad
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--cream-muted)]">
              FYV Box nació en <strong className="text-[var(--cream)]">CriptoUNAM</strong> —
              la comunidad de blockchain de la Universidad Nacional Autónoma de México.
              Vimos cómo miles de usuarios nuevos perdían fondos en estafas básicas que
              podían evitarse con práctica. Creamos un simulador donde el costo de equivocarse es cero.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { label: "7", suffix: "+", desc: "tipos de estafa cubiertos", icon: Shield },
              { label: 100, suffix: "%", desc: "gratis y open source",       icon: Sparkles },
              { label: 0,   suffix: " XLM", desc: "riesgo durante el training",icon: CheckCircle },
            ].map(({ label, suffix, desc, icon: Icon }, i) => (
              <Reveal key={desc} delay={i * 0.1}>
                <GlassCard className="p-6 text-center">
                  <Icon className="mx-auto mb-3 h-6 w-6 text-[var(--gold)]" strokeWidth={1.75} />
                  <p className="font-playfair text-4xl font-bold text-[var(--cream)]">
                    {typeof label === "number"
                      ? <AnimCounter to={label} suffix={suffix} />
                      : label + suffix}
                  </p>
                  <p className="mt-1 text-sm text-[var(--cream-muted)]">{desc}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ POR QUÉ NO SOMOS ESCUELA ════════════════════════════════════ */}
      <section id="why-not" className="px-4 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
              Por qué no somos una escuela
            </p>
            <h2 className="font-playfair text-3xl font-bold text-[var(--cream)] sm:text-4xl">
              Las escuelas enseñan teoría.<br />
              <span className="text-[var(--gold)]">Nosotros te ponemos en la trampa.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--cream-muted)]">
              No hay videos ni exámenes de opción múltiple. Cada misión simula una
              situación real de fraude. Tú decides cómo reaccionas.
              La blockchain registra si lo lograste.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {WHY_NOT.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <GlassCard className="flex gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-gold)] bg-[var(--gold-subtle)]">
                      <Icon className="h-5 w-5 text-[var(--gold)]" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--cream)]">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--cream-muted)]">{desc}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ A QUIÉN ═════════════════════════════════════════════════════ */}
      <section id="who" className="px-4 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
              ¿A quién le puede interesar?
            </p>
            <h2 className="font-playfair text-3xl font-bold text-[var(--cream)] sm:text-4xl">
              Para humanos y para código
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {WHO.map(({ icon: Icon, color, label, desc }, i) => (
              <Reveal key={label} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <GlassCard className="flex gap-4 p-5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--cream)]">{label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--cream-muted)]">{desc}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* API callout */}
          <Reveal className="mt-5" delay={0.3}>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/6 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Code2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" strokeWidth={1.75} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-300">
                    Integra la verificación en tu dApp
                  </p>
                  <p className="mt-0.5 text-xs text-blue-300/60">
                    Un endpoint público, sin auth, CORS abierto:
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-[var(--navy)] p-4 text-xs text-[var(--gold)]/90">
{`GET /api/verify?address=G...
→ { "certified": true, "modules": ["phishing"] }`}
                  </pre>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FAUCETS ═════════════════════════════════════════════════════ */}
      <section id="faucets" className="px-4 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
              Faucets & Herramientas
            </p>
            <h2 className="font-playfair text-3xl font-bold text-[var(--cream)] sm:text-4xl">
              Consigue XLM de prueba
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--cream-muted)]">
              Fondea tu billetera testnet antes de entrenar.
              Ninguno de estos fondos tiene valor real.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FAUCETS.map(({ name, desc, href, icon: Icon, badge, badgeColor }, i) => (
              <Reveal key={name} delay={i * 0.07}>
                <motion.a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <GlassCard className="group flex items-start gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-gold)] bg-[var(--gold-subtle)]">
                      <Icon className="h-5 w-5 text-[var(--gold)]" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--cream)]">{name}</p>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
                          {badge}
                        </span>
                        <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--cream-muted)] transition-colors group-hover:text-[var(--gold)]" />
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--cream-muted)]">{desc}</p>
                    </div>
                  </GlassCard>
                </motion.a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ AUTH CTA ════════════════════════════════════════════════════ */}
      <section id="auth" className="px-4 py-24 sm:px-8">
        <div className="mx-auto max-w-md">
          <Reveal className="mb-8 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
              Comienza ahora
            </p>
            <h2 className="font-playfair text-3xl font-bold text-[var(--cream)]">
              ¿Listo para entrenar?
            </h2>
            <p className="mt-3 text-sm text-[var(--cream-muted)]">
              Ingresa tu correo. Tu billetera de prueba se genera automáticamente.
            </p>
          </Reveal>

          <Reveal>
            <GlassCard className="p-6 shadow-[var(--shadow-lg)]" gold>
              <AuthForm />
            </GlassCard>
          </Reveal>

          <Reveal className="mt-5" delay={0.1}>
            <div className="flex flex-wrap justify-center gap-5">
              {[
                { icon: Shield,       text: "Sin fondos reales" },
                { icon: CheckCircle,  text: "Open source" },
                { icon: Globe,        text: "Stellar testnet" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-[var(--cream-muted)]">
                  <Icon className="h-3.5 w-3.5 text-[var(--gold)]" strokeWidth={2} />
                  {text}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-4 py-8 text-center backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--cream-muted)]">
          <div className="h-5 w-5 overflow-hidden rounded-md opacity-60">
            <Image src="/logo-panther.webp" alt="" width={20} height={20} className="object-contain" />
          </div>
          FYV Box — CriptoUNAM · Stellar testnet · 2026
        </div>
      </footer>
    </div>
  );
}

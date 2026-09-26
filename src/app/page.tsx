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
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const dotRGB  = isLight ? "100,65,5"  : "201,162,39";
      const dotMult = isLight ? 0.55        : 0.7;
      const linkMult= isLight ? 0.22        : 0.18;

      const w = canvas!.width, h = canvas!.height;
      ctx.clearRect(0, 0, w, h);

      const ps = particles.current;
      for (const p of ps) {
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_DIST) {
          const force = (MOUSE_DIST - d) / MOUSE_DIST * 0.015;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotRGB},${p.alpha * dotMult})`;
        ctx.fill();
      }

      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * linkMult;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(${dotRGB},${alpha})`;
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
function HologramLogo({ theme }: { theme: "dark" | "light" }) {
  const isLight = theme === "light";
  return (
    <div className="relative flex w-full items-center justify-center px-8">
      {/* glow de fondo pulsante */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: isLight
            ? "radial-gradient(ellipse 80% 65% at 50% 50%, rgba(140,90,5,.18) 0%, rgba(140,90,5,.05) 50%, transparent 70%)"
            : "radial-gradient(ellipse 80% 65% at 50% 50%, rgba(201,162,39,.28) 0%, rgba(201,162,39,.08) 50%, transparent 70%)",
        }}
      />

      {/* logo con movimiento flotante */}
      <motion.div
        className="relative z-10 w-full max-w-[420px]"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/logo-panther.webp"
          alt="FYV Box Pantera"
          width={420}
          height={164}
          className="w-full"
          style={{
            filter: isLight
              ? "brightness(0) sepia(1) saturate(3) hue-rotate(5deg) contrast(0.9) drop-shadow(0 0 14px rgba(120,70,5,.45)) drop-shadow(0 0 35px rgba(120,70,5,.25))"
              : "brightness(1.4) contrast(1.2) drop-shadow(0 0 22px rgba(201,162,39,.85)) drop-shadow(0 0 55px rgba(201,162,39,.5))",
            height: "auto",
          }}
          priority
        />
      </motion.div>
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

      {/* Background adaptativo dark/light */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {theme === "dark" ? (
          <>
            {/* base deep-space */}
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(14,30,60,.95) 0%, #0A1A33 60%)" }} />
            {/* glow dorado central */}
            <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/4 -translate-y-1/2 rounded-full bg-yellow-600/8 blur-[120px]" />
            {/* acento azul derecha */}
            <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/3 rounded-full bg-blue-900/25 blur-[130px]" />
            {/* acento esmeralda abajo */}
            <div className="absolute bottom-0 left-1/4 h-80 w-[500px] rounded-full bg-emerald-900/15 blur-[110px]" />
            {/* grid dorado sutil */}
            <div className="absolute inset-0 opacity-[0.035]"
              style={{ backgroundImage: "linear-gradient(rgba(201,162,39,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,162,39,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
          </>
        ) : (
          <>
            {/* base warm paper */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(160deg, #FDFCF8 0%, #F8F3E8 40%, #EFE8D8 100%)" }} />
            {/* resplandor cálido centro-derecha (detrás del logo) */}
            <div className="absolute right-0 top-1/2 h-[560px] w-[560px] -translate-y-1/2 -translate-x-1/4 rounded-full bg-amber-300/20 blur-[130px]" />
            {/* acento dorado top-left */}
            <div className="absolute left-0 top-0 h-[400px] w-[400px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-yellow-400/12 blur-[100px]" />
            {/* sombra suave abajo */}
            <div className="absolute bottom-0 inset-x-0 h-48"
              style={{ background: "linear-gradient(to top, rgba(180,140,60,.08), transparent)" }} />
            {/* grid ámbar muy sutil */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "linear-gradient(rgba(100,65,5,1) 1px,transparent 1px),linear-gradient(90deg,rgba(100,65,5,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
          </>
        )}
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--navy)]/80 px-5 py-3 backdrop-blur-lg sm:px-10"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[var(--border-gold)] bg-[var(--surface)] shadow-[0_0_8px_rgba(201,162,39,.3)]">
            <Image src="/logo-panther.webp" alt="" width={40} height={40} className="h-full w-full object-cover" />
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

      {/* ══ HERO — responsive: columna en mobile, split 50/50 en desktop ══ */}
      <section className="relative flex min-h-dvh flex-col pt-16 lg:h-dvh lg:flex-row">

        {/* ── Copy — full width en mobile, mitad en desktop ───────────────── */}
        <div className="flex w-full items-center justify-center px-5 py-10 lg:h-full lg:w-1/2 lg:overflow-y-auto lg:px-16 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--amber-border)] bg-[var(--amber-subtle)] px-3.5 py-1.5 text-xs font-semibold text-[var(--amber)]"
            >
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
              Stellar Testnet · Sin fondos reales
            </motion.div>

            <h1 className="font-playfair text-4xl font-bold leading-[1.1] tracking-tight text-[var(--cream)] sm:text-5xl lg:text-5xl">
              Aprende a no caer<br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: theme === "dark"
                    ? "linear-gradient(90deg, var(--gold), #fff8e1, var(--gold-hover))"
                    : "linear-gradient(90deg, #7A5508, #C9A227, #7A5508)",
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

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <motion.a
                href="#auth"
                whileHover={{ scale: 1.03, boxShadow: "0 0 36px rgba(201,162,39,.55)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="group inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-3.5 text-sm font-bold text-[var(--navy)] shadow-[0_0_24px_rgba(201,162,39,.35)] transition-colors hover:bg-[var(--gold-hover)]"
              >
                Comenzar gratis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </motion.a>
              <motion.a
                href="#who"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-5 py-3.5 text-sm text-[var(--cream-muted)] backdrop-blur-sm transition-colors hover:border-[var(--border-gold)] hover:text-[var(--cream)]"
              >
                ¿Esto es para mí?
                <ChevronDown className="h-4 w-4" />
              </motion.a>
            </motion.div>

            {/* mini stats en hero */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-10 flex gap-8 border-t border-[var(--border)] pt-6"
            >
              {[
                { n: "22+", label: "simulacros reales" },
                { n: "100%", label: "gratis" },
                { n: "0 XLM", label: "riesgo" },
              ].map(({ n, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.08, duration: 0.4 }}
                >
                  <p className="font-playfair text-2xl font-bold text-[var(--gold)]">{n}</p>
                  <p className="text-xs text-[var(--cream-muted)]">{label}</p>
                </motion.div>
              ))}
            </motion.div>
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

        {/* ── Logo holográfico — abajo en mobile, mitad derecha en desktop ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full items-center justify-center py-6 lg:h-full lg:w-1/2 lg:py-0"
        >
          <HologramLogo theme={theme} />
        </motion.div>

        {/* Scroll hint — solo desktop */}
        <motion.a
          href="#about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden flex-col items-center gap-1 text-xs text-[var(--cream-muted)] transition-colors hover:text-[var(--gold)] lg:flex"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.a>
      </section>

      {/* ══ AUTH CTA — justo debajo del hero ═══════════════════════════ */}
      <section id="auth" className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-md">
          <Reveal className="mb-8 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
              Comienza ahora
            </p>
            <h2 className="font-playfair text-3xl font-bold tracking-tight text-[var(--cream)]">
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

      {/* ══ QUIÉNES SOMOS ═══════════════════════════════════════════════ */}
      <section id="about" className="px-4 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
              Quiénes somos
            </p>
            <h2 className="font-playfair text-3xl font-bold tracking-tight text-[var(--cream)] sm:text-4xl">
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
            <h2 className="font-playfair text-3xl font-bold tracking-tight text-[var(--cream)] sm:text-4xl">
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
            <h2 className="font-playfair text-3xl font-bold tracking-tight text-[var(--cream)] sm:text-4xl">
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
            <h2 className="font-playfair text-3xl font-bold tracking-tight text-[var(--cream)] sm:text-4xl">
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

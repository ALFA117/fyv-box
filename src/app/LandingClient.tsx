"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, useAnimationControls } from "framer-motion";
import {
  ArrowRight, CheckCircle, Zap, Users, BookOpen, GraduationCap, Wallet,
  ExternalLink, ChevronDown, AlertTriangle, Globe, Code2, Sparkles, Shield, FlaskConical,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wordmark } from "@/components/Wordmark";
import { TrackIconBadge } from "@/components/TrackIcon";
import { useToast } from "@/components/Toast";
import { TRACK_ORDER, TRACK_STYLE } from "@/components/trackStyle";
import { TrackMeta, type Mission } from "@/missions/schema";
import { getWallet, ensureWalletFunded } from "@/identity";

export interface LandingProps {
  missionCount: number;
  trackCounts: Record<Mission["track"], number>;
}

/* ─── Scroll progress ────────────────────────────────────────────────────── */
function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]" aria-hidden>
      <div ref={bar} className="h-full origin-left bg-gold" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

/* ─── Particle network (decorative, desktop pointer only) ────────────────── */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    let ps: P[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 80);
      ps = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6, a: Math.random() * 0.5 + 0.2,
      }));
    };
    const onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };

    const draw = () => {
      const color = getComputedStyle(document.documentElement).getPropertyValue("--decor-1").trim() || "#C9A227";
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      for (const p of ps) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 100 && d > 0) { const f = ((100 - d) / 100) * 0.015; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        p.vx *= 0.99; p.vy *= 0.99; p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.globalAlpha = p.a * 0.6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.lineWidth = 0.7;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
          if (d < 130) {
            ctx.globalAlpha = (1 - d / 130) * 0.18;
            ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10" aria-hidden />;
}

/* ─── Logo pantera (desktop) ─────────────────────────────────────────────── */
function HologramLogo() {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex w-full items-center justify-center px-8">
      <motion.div
        aria-hidden
        className="logo-halo pointer-events-none absolute inset-0 -z-10"
        animate={reduce ? undefined : { opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="relative z-10 w-full max-w-[420px]"
        animate={reduce ? undefined : { y: [0, -14, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/logo-panther.webp"
          alt=""
          width={420}
          height={164}
          sizes="420px"
          className="logo-panther h-auto w-full"
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
  const reduce = useReducedMotion();
  const [val, setVal] = useState(to);
  useEffect(() => {
    if (reduce || !isInView || to === 0) { setVal(to); return; }
    let cur = 0;
    const step = Math.max(1, to / 30);
    setVal(0);
    const timer = setInterval(() => {
      cur += step;
      if (cur >= to) { setVal(to); clearInterval(timer); } else setVal(Math.floor(cur));
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, to, reduce]);
  return <span ref={ref} className="tabular-nums">{val}{suffix}</span>;
}

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
      controls.set({ opacity: 0, y: 24 });
    }
  }, [controls, reduce]);

  useEffect(() => {
    if (inView && hidden.current) {
      controls.start({ opacity: 1, y: 0, transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] } });
    }
  }, [inView, controls, delay]);

  return (
    <Tag
      ref={ref}
      initial={false}
      animate={controls}
      className={className}
    >
      {children}
    </Tag>
  );
}

function GlassCard({ children, className = "", gold = false }: { children: React.ReactNode; className?: string; gold?: boolean }) {
  return (
    <div
      className={[
        "rounded-2xl border backdrop-blur-sm transition-colors duration-200",
        gold ? "border-line-gold bg-gold-subtle" : "border-line-strong bg-surface/70",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-eyebrow text-gold">{children}</p>;
}

/* ─── Start training: creates a real testnet wallet, then opens the dashboard ─ */
function StartTraining() {
  const router = useRouter();
  const { toast } = useToast();
  const [phase, setPhase] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function start() {
    if (phase === "working") return;
    setPhase("working");
    setMessage("Creando tu billetera de prueba en Stellar testnet…");
    try {
      const wallet = await getWallet();
      const status = await ensureWalletFunded(wallet.publicKey);
      if (status === "funded") toast("Billetera de prueba lista y fondeada en testnet", "success");
      else toast("Tu billetera está lista. Friendbot no respondió; puedes entrenar igual.", "warning");
      setPhase("done");
      setMessage("¡Listo! Abriendo tu mapa de misiones…");
      router.push("/dashboard");
    } catch {
      setPhase("error");
      setMessage("No pudimos crear tu billetera. Permite que este sitio guarde datos en tu navegador e intenta de nuevo.");
    }
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" size="lg" loading={phase === "working" || phase === "done"} onClick={start}>
        {phase === "working" ? "Preparando…" : phase === "done" ? "Abriendo…" : "Comenzar entrenamiento"}
        {phase === "idle" || phase === "error" ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
      </Button>
      <p
        role={phase === "error" ? "alert" : "status"}
        className={`min-h-[1.25rem] text-center text-sm ${phase === "error" ? "text-danger" : "text-cream-muted"}`}
      >
        {message || "Sin correo ni contraseña · la llave de prueba vive solo en este navegador"}
      </p>
    </div>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const TOOLS = [
  {
    name: "Friendbot (Stellar Lab)",
    desc: "Fondea cualquier cuenta de testnet con 10,000 XLM de prueba. Tu billetera de FYV Box ya se fondea sola al empezar.",
    href: "https://lab.stellar.org/account/fund",
    icon: Wallet,
    badge: "Faucet",
    badgeCls: "text-gold bg-gold-subtle border-line-gold",
  },
  {
    name: "Stellar Lab",
    desc: "Crea cuentas de testnet, arma y firma transacciones desde el navegador, sin instalar nada.",
    href: "https://lab.stellar.org/account/create",
    icon: Code2,
    badge: "Testnet",
    badgeCls: "text-info bg-info-subtle border-info-border",
  },
  {
    name: "Stellar Expert",
    desc: "Explorador de bloques de testnet. Revisa balances y operaciones de tu billetera de prueba.",
    href: "https://stellar.expert/explorer/testnet",
    icon: Globe,
    badge: "Explorador",
    badgeCls: "text-success bg-success-subtle border-success-border",
  },
  {
    name: "Freighter",
    desc: "Wallet de Stellar que permite cambiar a Testnet para practicar firmas sin dinero real.",
    href: "https://freighter.app",
    icon: Shield,
    badge: "Wallet",
    badgeCls: "text-violet bg-violet-subtle border-violet-border",
  },
];

const WHY_NOT = [
  { icon: Zap, title: "Sin horarios ni tareas", desc: "Una misión toma menos de 5 minutos. Cuando quieras, al ritmo que puedas.", tone: "text-gold border-line-gold bg-gold-subtle" },
  { icon: FlaskConical, title: "Escenarios realistas, cero riesgo", desc: "Correos, DMs, wallets y firmas que imitan ataques reales. Equivocarte aquí no cuesta nada.", tone: "text-info border-info-border bg-info-subtle" },
  { icon: Shield, title: "Credencial verificable", desc: "Al completar un track, tu credencial queda ligada a tu dirección Stellar y cualquier app la puede consultar.", tone: "text-success border-success-border bg-success-subtle" },
  { icon: Sparkles, title: "100% gratis", desc: "Sin inscripción ni mensualidad. Un bien público para Web3 en LATAM.", tone: "text-violet border-violet-border bg-violet-subtle" },
];

const WHO = [
  { icon: Users, tone: "text-info bg-info-subtle", label: "Personas nuevas en crypto", desc: "Acabas de crear tu primera wallet y quieres entender los riesgos antes de mover dinero." },
  { icon: GraduationCap, tone: "text-gold bg-gold-subtle", label: "Estudiantes universitarios", desc: "Eres de una comunidad blockchain estudiantil y quieres una credencial verificable." },
  { icon: Globe, tone: "text-success bg-success-subtle", label: "dApps y exchanges", desc: "Consultas /api/verify para saber si un usuario ya entrenó antes de darle acceso." },
  { icon: BookOpen, tone: "text-violet bg-violet-subtle", label: "Educadores y ONGs", desc: "Das talleres de educación financiera y necesitas simulacros sin riesgo." },
];

const NAV_LINKS = [
  { href: "#about", label: "Nosotros" },
  { href: "#tracks", label: "Módulos" },
  { href: "#faucets", label: "Faucets" },
];

/* ══════════════════════════════════════════════════════════════════════════ */
export function LandingClient({ missionCount, trackCounts }: LandingProps) {
  const trackTotal = TRACK_ORDER.length;

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <ScrollProgress />

      {/* Background */}
      <div aria-hidden className="landing-bg pointer-events-none fixed inset-0 -z-20" />
      <div aria-hidden className="landing-grid pointer-events-none fixed inset-0 -z-20" />
      <ParticleCanvas />
      <svg aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden h-full w-full sm:block" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
        <g style={{ color: "var(--decor-1)", animation: "float-3d 10s ease-in-out infinite", transformOrigin: "950px 160px" }} stroke="currentColor" fill="currentColor">
          <polygon points="950,80 1030,118 950,156 870,118" fillOpacity=".08" strokeOpacity=".32" />
          <polygon points="870,118 950,156 950,232 870,194" fillOpacity=".04" strokeOpacity=".22" />
          <polygon points="1030,118 950,156 950,232 1030,194" fillOpacity=".06" strokeOpacity=".27" />
        </g>
        <g style={{ color: "var(--decor-2)", animation: "float-3d-rev 13s ease-in-out infinite 1s", transformOrigin: "110px 420px" }} stroke="currentColor" fill="currentColor">
          <polygon points="110,368 158,391 110,414 62,391" fillOpacity=".07" strokeOpacity=".26" />
          <polygon points="62,391 110,414 110,461 62,438" fillOpacity=".03" strokeOpacity=".18" />
          <polygon points="158,391 110,414 110,461 158,438" fillOpacity=".05" strokeOpacity=".22" />
        </g>
        <g style={{ color: "var(--decor-1)", animation: "float-3d-rev 15s ease-in-out infinite .5s", transformOrigin: "155px 190px" }} stroke="currentColor" fill="none">
          <polygon points="155,148 196,170 196,214 155,236 114,214 114,170" strokeOpacity=".26" strokeWidth="1.4" />
        </g>
        <g style={{ color: "var(--decor-3)", animation: "float-3d 12s ease-in-out infinite 3s", transformOrigin: "1050px 760px" }} stroke="currentColor" fill="currentColor">
          <polygon points="1050,724 1084,742 1050,760 1016,742" fillOpacity=".07" strokeOpacity=".24" />
          <polygon points="1016,742 1050,760 1050,796 1016,778" fillOpacity=".035" strokeOpacity=".17" />
          <polygon points="1084,742 1050,760 1050,796 1084,778" fillOpacity=".05" strokeOpacity=".2" />
        </g>
      </svg>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header
        className="pt-safe fixed inset-x-0 top-0 z-50 border-b border-line bg-navy/85 backdrop-blur-lg"
      >
        <div className="px-gutter mx-auto flex h-[var(--header-h)] max-w-6xl items-center justify-between gap-3">
          <Link href="/" aria-label="FYV Box — inicio" className="tap flex items-center rounded-xl">
            <Wordmark size="sm" />
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-1.5 sm:gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="hidden min-h-[44px] items-center rounded-xl px-3 text-sm font-medium text-cream-muted transition-colors hover:text-cream md:flex">
                {label}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-line-gold bg-gold-subtle px-3.5 text-sm font-bold text-gold transition-colors hover:bg-gold/20"
            >
              Entrenar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative flex flex-col pt-[calc(var(--header-h)+var(--safe-top))] lg:min-h-dvh lg:flex-row">
          <div className="px-gutter flex w-full flex-col pb-10 pt-10 lg:w-1/2 lg:items-center lg:justify-center lg:px-16 lg:py-0">
            <div className="mx-auto w-full max-w-lg">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-border bg-amber-subtle px-3.5 py-1.5 text-xs font-semibold text-amber">
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                Stellar testnet · sin dinero real
              </p>

              <h1 className="text-display text-cream">
                No caigas en <span className="text-gold-gradient">estafas crypto</span>
              </h1>

              <p className="mt-5 text-body text-cream-muted sm:text-lg">
                Practica con {missionCount} simulacros de las estafas más comunes en Web3 —phishing, airdrops falsos,
                ingeniería social y firmas peligrosas— y obtén una credencial verificable ligada a tu dirección Stellar.
              </p>

              <div className="mt-8 flex justify-center lg:hidden" aria-hidden>
                <div className="relative w-44">
                  <div className="logo-halo pointer-events-none absolute -inset-4 -z-10 rounded-full blur-lg" />
                  <Image src="/logo-panther.webp" alt="" width={176} height={69} sizes="176px" className="logo-panther-sm h-auto w-full" priority />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#start"
                  className="group flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gold px-6 text-base font-bold text-on-gold shadow-[var(--shadow-gold)] transition-colors hover:bg-gold-hover active:bg-gold-active"
                >
                  Comenzar gratis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </a>
                <a
                  href="#who"
                  className="flex min-h-[52px] items-center justify-center gap-1.5 rounded-xl border border-line-strong px-5 text-base text-cream-muted transition-colors hover:border-line-gold hover:text-cream"
                >
                  ¿Esto es para mí?
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </a>
              </div>

              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-5">
                {[
                  { n: String(missionCount), label: "simulacros" },
                  { n: String(trackTotal), label: "módulos" },
                  { n: "0 XLM", label: "de riesgo" },
                ].map(({ n, label }) => (
                  <div key={label} className="flex flex-col-reverse">
                    <dt className="text-sm text-cream-muted">{label}</dt>
                    <dd className="font-display text-2xl font-bold tabular-nums text-gold">{n}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/2 top-16 hidden w-px bg-gradient-to-b from-transparent via-line-gold to-transparent lg:block" />

          <div className="hidden items-center justify-center lg:flex lg:w-1/2">
            <HologramLogo />
          </div>
        </section>

        {/* ══ TRUST BAR ═════════════════════════════════════════════════ */}
        <div className="px-gutter">
          <Reveal className="mx-auto max-w-3xl">
            <ul className="grid gap-4 rounded-2xl border border-line bg-surface/60 px-5 py-4 backdrop-blur-sm sm:grid-cols-3">
              {[
                { icon: Wallet, text: "Cuenta real en testnet", sub: "Verificable en el explorador" },
                { icon: CheckCircle, text: "Open source", sub: "Código abierto en GitHub" },
                { icon: Globe, text: "Hecho en LATAM", sub: "Por la comunidad CriptoUNAM" },
              ].map(({ icon: Icon, text, sub }) => (
                <li key={text} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-gold" strokeWidth={2} aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-cream">{text}</p>
                    <p className="text-xs text-cream-muted">{sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* ══ START ═════════════════════════════════════════════════════ */}
        <section id="start" aria-labelledby="start-title" className="px-gutter py-14 sm:py-20">
          <div className="mx-auto max-w-md">
            <Reveal className="mb-8 text-center">
              <Eyebrow>Comienza ahora</Eyebrow>
              <h2 id="start-title" className="text-title-1 text-cream">¿Listo para entrenar?</h2>
              <p className="mt-3 text-body-sm text-cream-muted">
                Creamos una billetera de prueba en Stellar testnet para ti, la fondeamos con Friendbot y tu progreso
                queda ligado a su dirección.
              </p>
            </Reveal>
            <Reveal>
              <GlassCard className="p-5 shadow-[var(--shadow-lg)] sm:p-6" gold>
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-border bg-amber-subtle px-3.5 py-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" strokeWidth={2.5} aria-hidden />
                  <p className="text-sm text-amber">
                    <strong>Entorno de práctica.</strong> Nunca uses aquí una wallet ni una frase semilla reales.
                  </p>
                </div>
                <StartTraining />
              </GlassCard>
            </Reveal>
          </div>
        </section>

        {/* ══ QUIÉNES SOMOS ═════════════════════════════════════════════ */}
        <section id="about" aria-labelledby="about-title" className="px-gutter py-14 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mb-10 text-center">
              <Eyebrow>Quiénes somos</Eyebrow>
              <h2 id="about-title" className="text-title-1 text-cream">Un proyecto de la comunidad, para la comunidad</h2>
              <p className="mx-auto mt-4 max-w-2xl text-body text-cream-muted">
                FYV Box nació en <strong className="text-cream">CriptoUNAM</strong>, la comunidad blockchain de estudiantes
                de la UNAM. Vimos a personas nuevas perder fondos en estafas básicas que se evitan con práctica, así que
                hicimos un simulador donde equivocarse cuesta cero.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
              {[
                { to: missionCount, suffix: "", desc: "simulacros de estafas reales", icon: Shield },
                { to: trackTotal, suffix: "", desc: "módulos con credencial", icon: Sparkles },
                { to: 0, suffix: " XLM", desc: "de riesgo durante el entrenamiento", icon: CheckCircle },
              ].map(({ to, suffix, desc, icon: Icon }, i) => (
                <Reveal key={desc} delay={i * 0.08}>
                  <GlassCard className="flex items-center gap-4 p-5 sm:flex-col sm:p-6 sm:text-center">
                    <Icon className="h-6 w-6 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
                    <div>
                      <p className="font-display text-3xl font-bold text-cream sm:text-4xl"><AnimCounter to={to} suffix={suffix} /></p>
                      <p className="mt-1 text-sm text-cream-muted">{desc}</p>
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TRACKS ════════════════════════════════════════════════════ */}
        <section id="tracks" aria-labelledby="tracks-title" className="px-gutter py-14 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mb-10 text-center">
              <Eyebrow>Contenido</Eyebrow>
              <h2 id="tracks-title" className="text-title-1 text-cream">
                <span className="whitespace-nowrap">{missionCount} simulacros ·</span>{" "}
                <span className="whitespace-nowrap">{trackTotal} módulos</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-body text-cream-muted">
                Cada módulo termina con una credencial verificable. Hazlos en el orden que quieras.
              </p>
            </Reveal>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TRACK_ORDER.map((track, i) => {
                const s = TRACK_STYLE[track];
                return (
                  <Reveal as="li" key={track} delay={i * 0.05} className="h-full">
                      <Link href="/dashboard" className="group block h-full rounded-2xl">
                        <GlassCard className="flex h-full flex-col p-5 group-hover:border-line-gold">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <TrackIconBadge track={track} size={44} />
                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.chip}`}>
                              {trackCounts[track]} {trackCounts[track] === 1 ? "misión" : "misiones"}
                            </span>
                          </div>
                          <h3 className={`text-title-3 ${s.text}`}>{TrackMeta[track].label}</h3>
                          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-cream-muted">{TrackMeta[track].description}</p>
                          <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-cream-muted transition-colors group-hover:text-gold">
                            Empezar módulo
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                          </span>
                        </GlassCard>
                      </Link>
                    </Reveal>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ══ POR QUÉ ═══════════════════════════════════════════════════ */}
        <section id="why" aria-labelledby="why-title" className="px-gutter py-14 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mb-10 text-center">
              <Eyebrow>Por qué no somos una escuela</Eyebrow>
              <h2 id="why-title" className="text-title-1 text-cream">
                Las escuelas enseñan teoría. <span className="text-gold">Nosotros te ponemos en la trampa.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-body text-cream-muted">
                Sin videos ni exámenes. Cada misión recrea una situación de fraude y tú decides cómo reaccionar.
              </p>
            </Reveal>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {WHY_NOT.map(({ icon: Icon, title, desc, tone }, i) => (
                <Reveal as="li" key={title} delay={i * 0.06}>
                    <GlassCard className="flex gap-4 p-5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${tone}`}>
                        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-cream">{title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-cream-muted">{desc}</p>
                      </div>
                    </GlassCard>
                  </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ══ A QUIÉN ═══════════════════════════════════════════════════ */}
        <section id="who" aria-labelledby="who-title" className="px-gutter py-14 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mb-10 text-center">
              <Eyebrow>¿A quién le sirve?</Eyebrow>
              <h2 id="who-title" className="text-title-1 text-cream">Para personas y para código</h2>
            </Reveal>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {WHO.map(({ icon: Icon, tone, label, desc }, i) => (
                <Reveal as="li" key={label} delay={i * 0.06}>
                    <GlassCard className="flex gap-4 p-5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-cream">{label}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-cream-muted">{desc}</p>
                      </div>
                    </GlassCard>
                  </Reveal>
              ))}
            </ul>

            <Reveal className="mt-5">
              <div className="rounded-2xl border border-info-border bg-info-subtle p-5">
                <div className="flex items-start gap-3">
                  <Code2 className="mt-0.5 h-5 w-5 shrink-0 text-info" strokeWidth={1.75} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-info">Integra la verificación en tu dApp</h3>
                    <p className="mt-0.5 text-sm text-cream-muted">Un endpoint público, sin auth, con CORS abierto:</p>
                    <pre className="scroll-x mt-3 rounded-xl bg-navy p-4 text-[0.8125rem] leading-relaxed text-cream-muted">
<span className="text-info">GET</span> /api/verify?<span className="text-gold">address</span>=<span className="text-success">G…</span>{"\n"}→ {"{"} <span className="text-info">&quot;certified&quot;</span>: <span className="text-success">true</span>, <span className="text-info">&quot;modules&quot;</span>: [<span className="text-amber">…</span>] {"}"}
                    </pre>
                    <Link href="/verify" className="tap -ml-2 mt-2 inline-flex items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-info hover:underline">
                      Probar el verificador <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ FAUCETS ═══════════════════════════════════════════════════ */}
        <section id="faucets" aria-labelledby="faucets-title" className="px-gutter py-14 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mb-10 text-center">
              <Eyebrow>Faucets y herramientas</Eyebrow>
              <h2 id="faucets-title" className="text-title-1 text-cream">Explora Stellar testnet</h2>
              <p className="mx-auto mt-4 max-w-xl text-body text-cream-muted">
                Herramientas oficiales y del ecosistema para practicar. Ningún fondo de testnet tiene valor real.
              </p>
            </Reveal>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {TOOLS.map(({ name, desc, href, icon: Icon, badge, badgeCls }, i) => (
                <Reveal as="li" key={name} delay={i * 0.06}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl">
                      <GlassCard className="flex items-start gap-4 p-5 group-hover:border-line-gold">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line-gold bg-gold-subtle">
                          <Icon className="h-5 w-5 text-gold" strokeWidth={1.75} aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-cream">{name}</h3>
                            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeCls}`}>{badge}</span>
                            <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-cream-muted transition-colors group-hover:text-gold" aria-label="(abre en otra pestaña)" />
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-cream-muted">{desc}</p>
                        </div>
                      </GlassCard>
                    </a>
                  </Reveal>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="px-gutter pb-safe border-t border-line pt-10 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <Wordmark size="sm" />
              <p className="text-xs text-cream-muted">Entrenamiento anti-fraude · Web3 LATAM</p>
            </div>
            <nav aria-label="Pie de página" className="flex flex-wrap items-center justify-center gap-1">
              {[
                { href: "#about", label: "Quiénes somos" },
                { href: "#faucets", label: "Faucets" },
                { href: "/verify", label: "Verificar" },
                { href: "/stats", label: "Estadísticas" },
              ].map(({ href, label }) => (
                <a key={label} href={href} className="flex min-h-[44px] items-center rounded-xl px-3 text-sm text-cream-muted transition-colors hover:text-gold">
                  {label}
                </a>
              ))}
              <a
                href="https://github.com/ALFA117/fyv-box"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Código en GitHub"
                className="tap flex items-center justify-center rounded-xl border border-line text-cream-muted transition-colors hover:border-line-gold hover:text-gold"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </nav>
          </div>
          <div className="flex flex-col items-center justify-between gap-1 border-t border-line pt-5 text-center text-xs text-cream-muted sm:flex-row sm:text-left">
            <p>© 2026 FYV Box · Hecho por la comunidad <strong className="text-cream">CriptoUNAM</strong></p>
            <p>Corre en <span className="text-gold">Stellar testnet</span> · cero riesgo financiero</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

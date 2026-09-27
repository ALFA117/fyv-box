"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue,
} from "framer-motion";

/* Ambient 3D scene behind every page: an aurora of soft light, real CSS-3D
   cubes and an orbital gyroscope floating at different depths, with scroll
   parallax (and pointer parallax on desktop). Transforms/opacity only. */

type Shape = {
  kind: "cube" | "gyro" | "prism";
  x: string;      // left, % of viewport
  y: string;      // top, % of viewport
  size: number;   // px
  depth: number;  // 0 (far) … 1 (near): parallax strength and scale
  spin: number;   // seconds per revolution
  delay?: number;
  tone: "gold" | "info" | "violet";
  mobile?: boolean;
};

const FULL: Shape[] = [
  { kind: "gyro",  x: "66%", y: "6%",  size: 280, depth: 0.95, spin: 40, tone: "gold", mobile: true },
  { kind: "cube",  x: "6%",  y: "18%", size: 104, depth: 0.75, spin: 24, tone: "gold", mobile: true },
  { kind: "prism", x: "86%", y: "52%", size: 130, depth: 0.6, spin: 30, tone: "info", mobile: true },
  { kind: "cube",  x: "24%", y: "64%", size: 72,  depth: 0.45, spin: 20, delay: -8, tone: "violet", mobile: true },
  { kind: "cube",  x: "54%", y: "82%", size: 54,  depth: 0.3, spin: 16, delay: -4, tone: "info" },
  { kind: "gyro",  x: "2%",  y: "76%", size: 150, depth: 0.35, spin: 28, delay: -12, tone: "violet" },
  { kind: "prism", x: "40%", y: "30%", size: 60,  depth: 0.2, spin: 22, delay: -6, tone: "gold" },
  { kind: "cube",  x: "78%", y: "88%", size: 40,  depth: 0.18, spin: 14, delay: -2, tone: "gold" },
];

const CALM: Shape[] = [
  { kind: "gyro",  x: "78%", y: "6%",  size: 200, depth: 0.55, spin: 48, tone: "gold", mobile: true },
  { kind: "cube",  x: "3%",  y: "56%", size: 76,  depth: 0.4, spin: 34, tone: "info", mobile: true },
  { kind: "prism", x: "88%", y: "74%", size: 70,  depth: 0.3, spin: 30, delay: -10, tone: "violet" },
  { kind: "cube",  x: "46%", y: "92%", size: 44,  depth: 0.2, spin: 24, delay: -5, tone: "gold" },
];

const TONE = {
  gold:   { line: "var(--gold)",   face: "var(--gold-subtle)" },
  info:   { line: "var(--info)",   face: "var(--info-subtle)" },
  violet: { line: "var(--violet)", face: "var(--violet-subtle)" },
};

function Cube({ size, tone }: { size: number; tone: keyof typeof TONE }) {
  const h = size / 2;
  const t = TONE[tone];
  const faces = [
    `rotateY(0deg) translateZ(${h}px)`,
    `rotateY(90deg) translateZ(${h}px)`,
    `rotateY(180deg) translateZ(${h}px)`,
    `rotateY(-90deg) translateZ(${h}px)`,
    `rotateX(90deg) translateZ(${h}px)`,
    `rotateX(-90deg) translateZ(${h}px)`,
  ];
  return (
    <>
      {faces.map((transform, i) => (
        <span
          key={i}
          className="amb-face"
          style={{ width: size, height: size, transform, color: t.line, borderColor: t.line, background: `linear-gradient(135deg, ${t.face}, transparent 70%)` }}
        />
      ))}
    </>
  );
}

function Prism({ size, tone }: { size: number; tone: keyof typeof TONE }) {
  // Triangular prism: three rectangular faces around the Y axis.
  const t = TONE[tone];
  const w = size * 0.8;
  const r = w / (2 * Math.tan(Math.PI / 3));
  return (
    <>
      {[0, 120, 240].map((deg) => (
        <span
          key={deg}
          className="amb-face"
          style={{
            width: w, height: size, left: (size - w) / 2,
            transform: `rotateY(${deg}deg) translateZ(${r}px)`,
            color: t.line, borderColor: t.line, background: `linear-gradient(180deg, ${t.face}, transparent 80%)`,
          }}
        />
      ))}
    </>
  );
}

function Gyro({ size, tone, animate }: { size: number; tone: keyof typeof TONE; animate: boolean }) {
  const t = TONE[tone];
  const rings = [
    "rotateY(0deg)",
    "rotateY(60deg)",
    "rotateY(120deg)",
    "rotateX(90deg)",
  ];
  return (
    <>
      {rings.map((transform, i) => (
        <span
          key={transform}
          className="amb-ring"
          style={{ width: size, height: size, transform, color: t.line, borderColor: t.line, opacity: 1 - i * 0.14 }}
        />
      ))}
      <span
        className={`amb-core ${animate ? "amb-animate" : ""}`}
        style={{ width: size * 0.14, height: size * 0.14, left: size * 0.43, top: size * 0.43, background: t.line }}
      />
    </>
  );
}

/* Depth star field: particles fly toward the viewer and link into constellations. */
function StarField({ dense, reduce, px, py }: { dense: boolean; reduce: boolean; px: MotionValue<number>; py: MotionValue<number> }) {
  const [el, setEl] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const small = window.innerWidth < 768;
    const COUNT = Math.round((dense ? 140 : 70) * (small ? 0.55 : 1));
    const DEPTH = 1000;
    type Star = { x: number; y: number; z: number; hue: number };
    let w = 0, h = 0, raf = 0;
    const stars: Star[] = [];
    const spawn = (s: Star, far = true) => {
      s.x = (Math.random() - 0.5) * 2;
      s.y = (Math.random() - 0.5) * 2;
      s.z = far ? DEPTH : Math.random() * DEPTH;
      s.hue = Math.random();
    };
    for (let i = 0; i < COUNT; i++) { const s = { x: 0, y: 0, z: 0, hue: 0 }; spawn(s, false); stars.push(s); }

    const resize = () => {
      w = el.clientWidth; h = el.clientHeight;
      el.width = w * dpr; el.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const css = getComputedStyle(document.documentElement);
    const gold = css.getPropertyValue("--gold").trim() || "#C9A227";
    const info = css.getPropertyValue("--info").trim() || "#6BA4F8";

    const draw = (move: boolean) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2 + px.get() * 30, cy = h / 2 + py.get() * 30;
      const pts: { x: number; y: number; a: number; c: string }[] = [];
      for (const s of stars) {
        if (move) { s.z -= dense ? 2.2 : 1.2; if (s.z < 1) spawn(s); }
        const k = 420 / s.z;
        const x = cx + s.x * w * 0.6 * k, y = cy + s.y * h * 0.6 * k;
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) { if (move) spawn(s); continue; }
        const a = Math.min(1, (1 - s.z / DEPTH) * 1.4);
        const r = Math.max(0.4, 2.2 * (1 - s.z / DEPTH));
        const c = s.hue > 0.72 ? info : gold;
        ctx.globalAlpha = a;
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        if (a > 0.45) pts.push({ x, y, a, c });
      }
      ctx.lineWidth = 0.6;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 110) {
            ctx.globalAlpha = (1 - d / 110) * 0.35 * Math.min(pts[i].a, pts[j].a);
            ctx.strokeStyle = pts[i].c;
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    if (reduce) { draw(false); return () => window.removeEventListener("resize", resize); }

    const loop = () => { draw(true); raf = requestAnimationFrame(loop); };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [el, dense, reduce, px, py]);

  return <canvas ref={setEl} className="amb-stars" />;
}

function Float({ s, index, px, py, scroll, reduce }: {
  s: Shape; index: number; px: MotionValue<number>; py: MotionValue<number>; scroll: MotionValue<number>; reduce: boolean;
}) {
  const range = 40 * s.depth;
  const x = useTransform(px, (v) => v * range);
  const yPointer = useTransform(py, (v) => v * range);
  const yScroll = useTransform(scroll, (v) => -v * 260 * s.depth);
  const y = useTransform([yPointer, yScroll] as MotionValue<number>[], ([a, b]: number[]) => a + b);
  const scale = 0.7 + s.depth * 0.5;

  return (
    <motion.div
      className="amb-float"
      style={{
        left: s.x, top: s.y, width: s.size, height: s.size,
        x: reduce ? 0 : x, y: reduce ? 0 : y, scale,
        opacity: 0.35 + s.depth * 0.45,
        filter: s.depth < 0.35 ? "blur(1px)" : undefined,
      }}
    >
      <div
        className={`amb-spin ${reduce ? "" : "amb-animate"}`}
        style={{
          width: s.size, height: s.size,
          animationDuration: `${s.spin}s`,
          animationDelay: `${s.delay ?? -index * 3}s`,
          ["--tilt" as string]: `${(index % 3) * 18 - 18}deg`,
        }}
      >
        {s.kind === "cube" && <Cube size={s.size} tone={s.tone} />}
        {s.kind === "prism" && <Prism size={s.size} tone={s.tone} />}
        {s.kind === "gyro" && <Gyro size={s.size} tone={s.tone} animate={!reduce} />}
      </div>
    </motion.div>
  );
}

export function AmbientBackground() {
  const pathname = usePathname();
  const reduce = useReducedMotion() ?? false;
  const full = pathname === "/";
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Pointer parallax (desktop, fine pointer only), smoothed with a spring.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 40, damping: 18 });
  const py = useSpring(rawY, { stiffness: 40, damping: 18 });
  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, rawX, rawY]);

  const { scrollYProgress } = useScroll();
  const scroll = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const auroraShift = useTransform(scroll, (v) => v * -120);

  const shapes = (full ? FULL : CALM).filter((s) => !isMobile || s.mobile);

  return (
    <div aria-hidden className={`amb-root ${full ? "amb-full" : "amb-calm"}`}>
      <motion.div className="amb-aurora" style={{ y: reduce ? 0 : auroraShift }}>
        <span className={`amb-blob amb-blob-1 ${reduce ? "" : "amb-animate"}`} />
        <span className={`amb-blob amb-blob-2 ${reduce ? "" : "amb-animate"}`} />
        <span className={`amb-blob amb-blob-3 ${reduce ? "" : "amb-animate"}`} />
      </motion.div>
      <StarField dense={full} reduce={reduce} px={px} py={py} />
      <div className="amb-beams">
        <span className={`amb-beam ${reduce ? "" : "amb-animate"}`} />
        <span className={`amb-beam ${reduce ? "" : "amb-animate"}`} />
      </div>
      <div className="amb-stage">
        {shapes.map((s, i) => (
          <Float key={`${s.kind}-${i}`} s={s} index={i} px={px} py={py} scroll={scroll} reduce={reduce} />
        ))}
      </div>
      <div className="amb-vignette" />
      <div className="amb-grain" />
    </div>
  );
}

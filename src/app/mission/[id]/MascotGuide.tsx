"use client";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition } from "framer-motion";

export type MascotMood = "idle" | "selected" | "saving" | "correct" | "trap" | "error";

const LINES: Record<MascotMood, string> = {
  idle:     "Soy Pantera, tu guía. Lee el escenario con calma: ¿qué te parece raro?",
  selected: "Antes de confirmar: ¿quién te escribe, desde dónde y qué te está pidiendo?",
  saving:   "Revisando tu respuesta…",
  correct:  "¡Bien visto! Así se detecta una trampa. Lee por qué funciona.",
  trap:     "Uy, así caen muchas personas. Lee la explicación y vuelve a intentarlo.",
  error:    "Algo falló con la conexión. Tu elección sigue ahí: inténtalo otra vez.",
};

// One-shot reactions (never looping): hop when right, head-shake when trapped.
const REACTION: Record<MascotMood, TargetAndTransition> = {
  idle:     { y: 0, rotate: 0, x: 0 },
  selected: { rotate: [0, -8, 0], transition: { duration: 0.45 } },
  saving:   { y: [0, -3, 0], transition: { duration: 0.5 } },
  correct:  { y: [0, -14, 0, -6, 0], rotate: [0, -6, 6, 0], transition: { duration: 0.7 } },
  trap:     { x: [0, -7, 7, -5, 5, 0], transition: { duration: 0.5 } },
  error:    { x: [0, -4, 4, 0], transition: { duration: 0.35 } },
};

const TONE: Record<MascotMood, string> = {
  idle:     "border-line-strong",
  selected: "border-line-gold",
  saving:   "border-line-gold",
  correct:  "border-success-border",
  trap:     "border-danger-border",
  error:    "border-danger-border",
};

export function MascotGuide({ mood }: { mood: MascotMood }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="mb-4 flex items-end gap-3"
    >
      <motion.div
        key={reduce ? "static" : mood}
        animate={reduce ? undefined : REACTION[mood]}
        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 bg-white shadow-[var(--shadow-gold)] ${mood === "correct" ? "border-success" : mood === "trap" ? "border-danger" : "border-gold"}`}
        aria-hidden
      >
        <Image src="/panther-face.webp" alt="" width={56} height={56} loading="eager" unoptimized className="h-full w-full" />
      </motion.div>

      <div className="relative min-w-0 flex-1" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={mood}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className={`relative rounded-2xl rounded-bl-md border bg-surface px-3.5 py-2.5 text-sm leading-snug text-cream shadow-[var(--shadow-sm)] ${TONE[mood]}`}
          >
            <span className="sr-only">Pantera dice: </span>
            {LINES[mood]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

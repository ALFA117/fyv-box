"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { TrackArt } from "@/components/TrackArt";
import { TRACK_STYLE } from "@/components/trackStyle";
import { TrackMeta, type Mission } from "@/missions/schema";
import type { PublicMission } from "@/missions/engine";

const ROW = 128;          // vertical space per mission node (node + label)
const WIDTH = 280;        // path canvas width (centered)
const NODE = 64;
const OFFSETS = [0, 64, 0, -64]; // zigzag pattern (px from center)

interface Props {
  track: Mission["track"];
  missions: PublicMission[];
  completed: Set<string>;
  nextId: string | null;
}

function centerOf(i: number) {
  return { x: WIDTH / 2 + OFFSETS[i % OFFSETS.length], y: i * ROW + NODE / 2 + 16 };
}

export function ModulePath({ track, missions, completed, nextId }: Props) {
  const reduce = useReducedMotion();
  const style = TRACK_STYLE[track];
  const done = missions.filter((m) => completed.has(m.id)).length;
  const total = missions.length;
  const isComplete = total > 0 && done === total;
  const height = missions.length * ROW;

  const segments = missions.slice(1).map((m, i) => {
    const a = centerOf(i);
    const b = centerOf(i + 1);
    const midY = (a.y + b.y) / 2;
    return {
      d: `M${a.x} ${a.y} C${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`,
      solid: completed.has(missions[i].id) && completed.has(m.id),
    };
  });

  return (
    <section aria-labelledby={`track-${track}`} className="relative">
      {/* Module banner */}
      <div className={`relative overflow-hidden rounded-3xl border bg-surface p-4 ${isComplete ? "border-success-border" : "border-line"}`}>
        <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${style.bar}`} />
        <div className="flex items-center gap-4">
          <TrackArt track={track} size={56} />
          <div className="min-w-0 flex-1">
            <h2 id={`track-${track}`} className="text-title-3 text-cream">{TrackMeta[track].label}</h2>
            <p className="mt-0.5 text-sm text-cream-muted">
              {isComplete ? "Módulo completado · credencial ganada" : `${done} de ${total} misiones`}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line" aria-hidden>
              <div
                className={`h-full origin-left rounded-full transition-transform duration-700 ease-out ${isComplete ? "bg-success" : style.bar}`}
                style={{ transform: `scaleX(${total ? done / total : 0})` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Path */}
      <ol className="relative mx-auto mt-2" style={{ width: WIDTH, height }} aria-label={`Misiones de ${TrackMeta[track].label}`}>
        <svg className="pointer-events-none absolute inset-0 overflow-visible" width={WIDTH} height={height} aria-hidden>
          {segments.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill="none"
              stroke={s.solid ? "var(--success)" : "var(--border-strong)"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={s.solid ? undefined : "2 10"}
            />
          ))}
        </svg>

        {missions.map((m, i) => {
          const c = centerOf(i);
          const isDone = completed.has(m.id);
          const isNext = m.id === nextId;
          const n = m.id.split("-").pop()?.replace(/^0+/, "") ?? String(i + 1);
          return (
            <li key={m.id} className="absolute" style={{ left: c.x, top: c.y - NODE / 2, transform: "translateX(-50%)" }}>
              <Link
                href={`/mission/${m.id}`}
                aria-label={`${m.title}${isDone ? ", completada" : isNext ? ", tu siguiente misión" : ""}, ${m.xp} XP`}
                className="group flex w-40 flex-col items-center gap-2 rounded-2xl text-center"
              >
                <span className="relative">
                  {isNext && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-on-gold shadow-[var(--shadow-gold)]">
                      Siguiente
                    </span>
                  )}
                  <motion.span
                    initial={reduce || !isNext ? false : { scale: 0.6 }}
                    animate={{ scale: 1 }}
                    whileHover={reduce ? undefined : { scale: 1.06 }}
                    whileTap={reduce ? undefined : { scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                    className={[
                      "flex h-16 w-16 items-center justify-center rounded-full border-4 text-lg font-bold",
                      isDone
                        ? "border-success bg-success text-on-gold"
                        : isNext
                          ? "border-gold-hover bg-gold text-on-gold shadow-[0_0_0_6px_var(--gold-subtle),var(--shadow-gold)]"
                          : `bg-surface-2 ${style.border} ${style.text} group-hover:bg-surface-3`,
                    ].join(" ")}
                  >
                    {isDone ? <Check className="h-7 w-7" strokeWidth={3} aria-hidden /> : isNext ? <Star className="h-7 w-7" fill="currentColor" aria-hidden /> : n}
                  </motion.span>
                </span>
                <span className={`relative line-clamp-2 rounded-lg bg-navy px-2 py-0.5 text-sm font-semibold leading-snug ${isDone ? "text-cream-muted" : "text-cream"}`}>
                  {m.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

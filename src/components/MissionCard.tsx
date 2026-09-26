"use client";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle, Lock, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import type { PublicMission } from "@/missions/engine";
import { DIFFICULTY, TRACK_STYLE } from "./trackStyle";

interface Props {
  mission: Pick<PublicMission, "id" | "title" | "track" | "difficulty" | "xp" | "comingSoon">;
  completed: boolean;
  locked?: boolean;
}

export function MissionCard({ mission, completed, locked = false }: Props) {
  const isClickable = !locked && !mission.comingSoon;
  const diff = DIFFICULTY[mission.difficulty];
  const reduce = useReducedMotion();
  const number = mission.id.split("-").pop()?.toUpperCase() ?? "→";

  const inner = (
    <motion.div
      whileTap={isClickable && !reduce ? { scale: 0.985 } : undefined}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={[
        "group relative flex min-h-[72px] items-center gap-4 overflow-hidden rounded-2xl border p-4 pl-5 transition-colors duration-150",
        completed
          ? "border-success-border bg-success-subtle"
          : locked
          ? "border-line bg-surface/40 opacity-50"
          : "border-line bg-surface hover:border-line-gold hover:bg-surface-2 active:bg-surface-3",
      ].join(" ")}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${completed ? "bg-success" : locked ? "bg-line" : TRACK_STYLE[mission.track].bar}`}
        aria-hidden
      />

      <div
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          completed ? "bg-success/20 ring-1 ring-success-border" : locked ? "bg-surface-2" : "bg-gold-subtle ring-1 ring-line-gold",
        ].join(" ")}
        aria-hidden
      >
        {completed ? (
          <CheckCircle className="h-5 w-5 text-success" strokeWidth={2} />
        ) : locked ? (
          <Lock className="h-4 w-4 text-cream-muted" strokeWidth={1.75} />
        ) : (
          <span className="font-mono text-xs font-bold text-gold">{number}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-[15px] font-semibold leading-snug ${completed ? "text-cream-muted" : "text-cream"}`}>
          {mission.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className={`rounded-md border px-1.5 text-xs font-semibold leading-5 ${diff.chip}`}>{diff.label}</span>
          <span className="flex items-center gap-1 text-xs text-cream-muted">
            <Star className="h-3.5 w-3.5" aria-hidden />
            {mission.xp} XP
          </span>
          {completed && (
            <span className="flex items-center gap-1 text-xs font-bold text-success">
              <CheckCircle className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Completada
            </span>
          )}
        </div>
      </div>

      {isClickable && (
        <ChevronRight
          className="h-5 w-5 shrink-0 text-cream-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-gold"
          strokeWidth={1.75}
          aria-hidden
        />
      )}
    </motion.div>
  );

  if (!isClickable) return <div aria-disabled="true">{inner}</div>;

  return (
    <Link
      href={`/mission/${mission.id}`}
      aria-label={`${completed ? "Repetir" : "Iniciar"} misión: ${mission.title}, ${diff.label}, ${mission.xp} XP${completed ? ", completada" : ""}`}
      className="block rounded-2xl"
    >
      {inner}
    </Link>
  );
}

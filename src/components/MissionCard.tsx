"use client";
import { motion } from "framer-motion";
import { CheckCircle, Lock, ChevronRight, Zap, Star } from "lucide-react";
import Link from "next/link";
import type { Mission } from "@/missions/schema";

interface Props {
  mission: Mission;
  completed: boolean;
  locked?: boolean;
}

const difficultyColor = {
  beginner:     "text-[var(--success)]     bg-[var(--success-subtle)]  border-[var(--success-border)]",
  intermediate: "text-[var(--amber)]       bg-[var(--amber-subtle)]    border-[var(--amber-border)]",
  advanced:     "text-[var(--danger)]      bg-[var(--danger-subtle)]   border-[var(--danger-border)]",
};

export function MissionCard({ mission, completed, locked = false }: Props) {
  const isClickable = !locked && !mission.comingSoon;

  const inner = (
    <motion.div
      whileHover={isClickable ? { x: 2, backgroundColor: "var(--surface-2)" } : {}}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={[
        "flex items-center gap-3 rounded-xl border p-4 transition-[border-color] duration-150",
        completed
          ? "border-[var(--success-border)] bg-[var(--success-subtle)]"
          : locked
          ? "border-[var(--border)] bg-[var(--surface)]/50 opacity-50"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-gold)] cursor-pointer",
      ].join(" ")}
    >
      {/* Icon */}
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          completed
            ? "bg-[var(--success-subtle)]"
            : locked
            ? "bg-[var(--border)]"
            : "bg-[var(--gold-subtle)]",
        ].join(" ")}
        aria-hidden="true"
      >
        {completed ? (
          <CheckCircle className="h-5 w-5 text-[var(--success)]" strokeWidth={2} />
        ) : locked ? (
          <Lock className="h-4 w-4 text-[var(--cream-muted)]" strokeWidth={1.75} />
        ) : (
          <Zap className="h-4 w-4 text-[var(--gold)]" strokeWidth={2} />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate text-sm font-medium",
            completed ? "text-[var(--cream)]" : "text-[var(--cream)]",
          ].join(" ")}
        >
          {mission.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span
            className={`rounded border px-1.5 py-0 text-[10px] font-medium leading-5 ${difficultyColor[mission.difficulty]}`}
          >
            {mission.difficulty === "beginner"     ? "básico"
             : mission.difficulty === "intermediate" ? "medio"
             : "avanzado"}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-[var(--cream-muted)]">
            <Star className="h-3 w-3" aria-hidden="true" />
            {mission.xp} XP
          </span>
        </div>
      </div>

      {/* Arrow */}
      {isClickable && (
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[var(--cream-muted)] transition-transform group-hover:translate-x-0.5"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );

  if (!isClickable) {
    return (
      <div role="presentation" aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/mission/${mission.id}`}
      aria-label={`Iniciar misión: ${mission.title} (${mission.xp} XP)`}
      className="group block focus-visible:rounded-xl"
    >
      {inner}
    </Link>
  );
}

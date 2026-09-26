"use client";
import { motion } from "framer-motion";
import { CheckCircle, Lock, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import type { Mission } from "@/missions/schema";

interface Props {
  mission: Mission;
  completed: boolean;
  locked?: boolean;
}

const difficultyMeta = {
  beginner:     { label: "Básico",      color: "text-[var(--success)]     bg-[var(--success-subtle)]  border-[var(--success-border)]" },
  intermediate: { label: "Intermedio",  color: "text-[var(--amber)]       bg-[var(--amber-subtle)]    border-[var(--amber-border)]" },
  advanced:     { label: "Avanzado",    color: "text-[var(--danger)]      bg-[var(--danger-subtle)]   border-[var(--danger-border)]" },
};

const trackAccent: Record<Mission["track"], string> = {
  "phishing":            "bg-[var(--danger)]",
  "social-engineering":  "bg-blue-400",
  "fake-assets":         "bg-[var(--amber)]",
  "dangerous-approvals": "bg-[var(--danger)]",
  "presale-scam":        "bg-[var(--success)]",
  "key-hygiene":         "bg-purple-400",
};

export function MissionCard({ mission, completed, locked = false }: Props) {
  const isClickable = !locked && !mission.comingSoon;
  const diff = difficultyMeta[mission.difficulty];
  const accentBar = trackAccent[mission.track];

  const inner = (
    <motion.div
      whileHover={isClickable ? { x: 3 } : {}}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={[
        "group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 pl-5 transition-all duration-150",
        completed
          ? "border-[var(--success-border)] bg-[var(--success-subtle)]"
          : locked
          ? "border-[var(--border)] bg-[var(--surface)]/40 opacity-50"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-gold)] hover:bg-[var(--surface-2)] cursor-pointer",
      ].join(" ")}
    >
      {/* Left color accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${completed ? "bg-[var(--success)]" : locked ? "bg-[var(--border)]" : accentBar} opacity-70`} aria-hidden />

      {/* Status icon */}
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
          completed
            ? "bg-[var(--success)]/20 ring-1 ring-[var(--success-border)]"
            : locked
            ? "bg-[var(--surface-2)]"
            : "bg-[var(--gold-subtle)] ring-1 ring-[var(--border-gold)] group-hover:bg-[var(--gold)]/20",
        ].join(" ")}
        aria-hidden
      >
        {completed ? (
          <CheckCircle className="h-5 w-5 text-[var(--success)]" strokeWidth={2} />
        ) : locked ? (
          <Lock className="h-4 w-4 text-[var(--cream-muted)]" strokeWidth={1.75} />
        ) : (
          <span className="font-mono text-xs font-bold text-[var(--gold)]">
            {mission.id.split("-").pop()?.toUpperCase() ?? "→"}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--cream)]">
          {mission.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className={`rounded border px-1.5 py-0 text-[10px] font-semibold leading-5 ${diff.color}`}>
            {diff.label}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-[var(--cream-muted)]">
            <Star className="h-3 w-3" aria-hidden />
            {mission.xp} XP
          </span>
          {completed && (
            <span className="text-[10px] font-semibold text-[var(--success)]">✓ Completada</span>
          )}
        </div>
      </div>

      {/* Arrow */}
      {isClickable && !completed && (
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[var(--cream-muted)] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--gold)]"
          strokeWidth={1.75}
          aria-hidden
        />
      )}
    </motion.div>
  );

  if (!isClickable) return (
    <div role="presentation" aria-disabled="true">{inner}</div>
  );

  return (
    <Link
      href={`/mission/${mission.id}`}
      aria-label={`Iniciar misión: ${mission.title} (${mission.xp} XP)`}
      className="block focus-visible:rounded-2xl"
    >
      {inner}
    </Link>
  );
}

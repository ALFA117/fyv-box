"use client";
import { motion } from "framer-motion";
import { CheckCircle, Lock, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Mission } from "@/missions/schema";

interface Props {
  mission: Mission;
  completed: boolean;
  locked?: boolean;
}

export function MissionCard({ mission, completed, locked = false }: Props) {
  const content = (
    <motion.div
      whileHover={locked ? {} : { x: 4 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`flex items-center gap-3 rounded-xl border p-4 transition-colors
        ${completed
          ? "border-[var(--success)]/30 bg-[var(--success)]/5"
          : locked
          ? "border-white/5 bg-[var(--surface)]/60 opacity-50"
          : "border-white/10 bg-[var(--surface)] hover:border-[var(--gold)]/40 hover:bg-[var(--surface-2)]"
        }`}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/5">
        {completed ? (
          <CheckCircle className="h-5 w-5 text-[var(--success)]" />
        ) : locked ? (
          <Lock className="h-4 w-4 text-[var(--cream-muted)]" />
        ) : (
          <span className="text-lg" aria-hidden>⚡</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--cream)] truncate">{mission.title}</p>
        <p className="text-xs text-[var(--cream-muted)]">
          {mission.difficulty} · {mission.xp} XP
        </p>
      </div>

      {!locked && (
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--cream-muted)]" />
      )}
    </motion.div>
  );

  if (locked || mission.comingSoon) {
    return <div aria-disabled="true">{content}</div>;
  }

  return (
    <Link href={`/mission/${mission.id}`} aria-label={`Iniciar misión: ${mission.title}`}>
      {content}
    </Link>
  );
}

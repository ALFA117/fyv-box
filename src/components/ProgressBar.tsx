"use client";
import { motion } from "framer-motion";

interface Props {
  value: number; // 0-100
  label?: string;
}

export function ProgressBar({ value, label }: Props) {
  return (
    <div className="space-y-1" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      {label && (
        <div className="flex justify-between text-xs text-[var(--cream-muted)]">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-[var(--gold)]"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

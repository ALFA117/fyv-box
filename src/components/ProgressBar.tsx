"use client";
import { motion } from "framer-motion";

interface Props {
  value: number; // 0–100
  label?: string;
  size?: "sm" | "md";
  color?: "gold" | "success" | "danger" | "amber";
}

const barColors = {
  gold:    "bg-[var(--gold)]",
  success: "bg-[var(--success)]",
  danger:  "bg-[var(--danger)]",
  amber:   "bg-[var(--amber)]",
};

const heights = {
  sm: "h-1.5",
  md: "h-2",
};

export function ProgressBar({ value, label, size = "md", color = "gold" }: Props) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="space-y-1.5"
    >
      {label && (
        <div className="flex justify-between">
          <span className="text-xs text-[var(--cream-muted)]">{label}</span>
          <span className="tabular-nums text-xs font-medium text-[var(--cream-muted)]">
            {pct}%
          </span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-white/8 ${heights[size]}`}>
        <motion.div
          className={`${heights[size]} rounded-full ${barColors[color]}`}
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

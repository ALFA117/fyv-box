"use client";
import { motion, useReducedMotion } from "framer-motion";

interface Props {
  value: number; // 0–100
  label?: string;
  size?: "sm" | "md";
  color?: "gold" | "success" | "danger" | "amber";
}

const barColors = {
  gold:    "bg-gold",
  success: "bg-success",
  danger:  "bg-danger",
  amber:   "bg-amber",
};

const heights = { sm: "h-1.5", md: "h-2" };

export function ProgressBar({ value, label, size = "md", color = "gold" }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const reduce = useReducedMotion();

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progreso"}
      className="space-y-1.5"
    >
      {label && (
        <div className="flex justify-between text-xs text-cream-muted">
          <span>{label}</span>
          <span className="tabular-nums font-medium">{pct}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-line ${heights[size]}`}>
        <motion.div
          className={`h-full origin-left rounded-full ${barColors[color]}`}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={reduce ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

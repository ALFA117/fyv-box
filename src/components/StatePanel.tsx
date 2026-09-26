"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  body?: React.ReactNode;
  tone?: "neutral" | "danger" | "gold";
  action?: React.ReactNode;
  className?: string;
}

const tones = {
  neutral: { ring: "border-line bg-surface", icon: "text-cream-muted", halo: "bg-surface-2" },
  danger:  { ring: "border-danger-border bg-danger-subtle", icon: "text-danger", halo: "bg-danger-subtle" },
  gold:    { ring: "border-line-gold bg-gold-subtle", icon: "text-gold", halo: "bg-gold-subtle" },
};

/** Empty / error state: small illustration, human message, one clear action. */
export function StatePanel({ icon: Icon, title, body, tone = "neutral", action, className = "" }: Props) {
  const reduce = useReducedMotion();
  const t = tones[tone];
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role={tone === "danger" ? "alert" : undefined}
      className={`flex flex-col items-center gap-4 rounded-3xl border px-6 py-10 text-center ${t.ring} ${className}`}
    >
      <div className="relative" aria-hidden>
        <div className={`absolute -inset-3 rounded-[28px] ${t.halo} opacity-60`} />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-navy">
          <Icon className={`h-8 w-8 ${t.icon}`} strokeWidth={1.5} />
        </div>
      </div>
      <div className="max-w-xs space-y-1.5">
        <p className="text-title-3 text-cream">{title}</p>
        {body && <div className="text-body-sm text-cream-muted">{body}</div>}
      </div>
      {action}
    </motion.div>
  );
}

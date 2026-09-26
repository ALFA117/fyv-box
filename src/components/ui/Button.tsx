"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const base =
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy disabled:cursor-not-allowed disabled:opacity-45";

const sizes = {
  sm: "min-h-[44px] rounded-xl px-4 text-sm",
  md: "min-h-[48px] rounded-xl px-5 text-sm",
  lg: "min-h-[52px] rounded-xl px-6 text-base",
};

const variants = {
  primary:   "bg-gold text-on-gold shadow-[var(--shadow-sm)] hover:bg-gold-hover active:bg-gold-active",
  ghost:     "border border-line-gold text-cream hover:bg-gold-subtle hover:border-gold-ring active:bg-gold-subtle",
  secondary: "border border-line-strong bg-surface text-cream hover:bg-surface-2 active:bg-surface-3",
  danger:    "bg-danger text-on-danger shadow-[var(--shadow-sm)] hover:bg-danger-hover",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "md", loading, children, disabled, className = "", ...rest }, ref) => {
    const reduce = useReducedMotion();
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileTap={isDisabled || reduce ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...(rest as object)}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";

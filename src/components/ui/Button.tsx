"use client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      children,
      disabled,
      className = "",
      ...rest
    },
    ref,
  ) => {
    const base =
      "inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-40 select-none";

    const sizes = {
      sm: "min-h-[36px] rounded-lg px-3.5 py-2 text-xs",
      md: "min-h-[44px] rounded-xl px-5 py-2.5 text-sm",
      lg: "min-h-[52px] rounded-xl px-6 py-3 text-base",
    };

    const variants = {
      primary:
        "bg-[var(--gold)] text-[var(--navy)] shadow-[var(--shadow-sm)] hover:bg-[var(--gold-hover)] active:scale-[.98]",
      ghost:
        "border border-[var(--border-gold)] text-[var(--cream)] hover:bg-[var(--gold-subtle)] hover:border-[var(--gold-ring)] active:scale-[.98]",
      secondary:
        "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--cream)] hover:bg-[var(--surface-2)] active:scale-[.98]",
      danger:
        "bg-[var(--danger)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--danger-hover)] active:scale-[.98]",
    };

    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? {} : { scale: 1.015 }}
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        disabled={isDisabled}
        aria-busy={loading}
        {...(rest as object)}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";

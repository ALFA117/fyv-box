"use client";
import { motion } from "framer-motion";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", loading, children, disabled, className = "", ...rest }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold min-h-[44px] min-w-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:opacity-40 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[var(--gold)] text-[var(--navy)] hover:bg-[var(--gold-muted)]",
      ghost:
        "border border-[var(--gold)]/40 text-[var(--cream)] hover:bg-[var(--gold)]/10",
      danger:
        "bg-[var(--error)] text-white hover:bg-[var(--error)]/80",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`${base} ${variants[variant]} ${className}`}
        disabled={disabled || loading}
        {...(rest as object)}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

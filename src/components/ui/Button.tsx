"use client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const base =
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy disabled:cursor-not-allowed disabled:opacity-45";

const sizes = {
  sm: "min-h-[44px] rounded-md px-4 text-sm",
  md: "min-h-[48px] rounded-md px-5 text-[0.9375rem]",
  lg: "min-h-[52px] rounded-md px-6 text-base",
};

const variants = {
  primary:   "press border border-gold-active bg-gold text-on-gold hover:bg-gold-hover active:bg-gold-active",
  ghost:     "transition-colors border border-line-strong text-cream hover:border-line-gold hover:bg-gold-subtle active:bg-gold-subtle",
  secondary: "press border border-line-strong bg-surface text-cream hover:bg-surface-2 active:bg-surface-3",
  danger:    "press border border-danger bg-danger text-on-danger hover:bg-danger-hover",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "md", loading, children, disabled, className = "", ...rest }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
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

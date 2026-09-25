import { type HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

export function Card({ variant = "default", className = "", children, ...rest }: Props) {
  const base = "rounded-2xl border border-white/10 p-5";
  const variants = {
    default: "bg-[var(--surface)]",
    elevated: "bg-[var(--surface-2)]",
  };
  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </div>
  );
}

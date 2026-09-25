import { type HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "gold" | "success" | "danger";
  padding?: "sm" | "md" | "lg";
}

const variants = {
  default:  "border-[var(--border)]        bg-[var(--surface)]",
  elevated: "border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-md)]",
  gold:     "border-[var(--border-gold)]   bg-[var(--gold-subtle)]",
  success:  "border-[var(--success-border)] bg-[var(--success-subtle)]",
  danger:   "border-[var(--danger-border)]  bg-[var(--danger-subtle)]",
};

const paddings = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  variant = "default",
  padding = "md",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <div
      className={`rounded-2xl border ${variants[variant]} ${paddings[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

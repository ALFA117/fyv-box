"use client";
import Link from "next/link";
import { Shield, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--navy)] px-6 text-center">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gold-subtle)] ring-1 ring-[var(--gold-ring)]">
          <Shield className="h-4 w-4 text-[var(--gold)]" strokeWidth={2} />
        </div>
        <span className="font-playfair text-lg font-bold text-[var(--cream)]">
          FYV<span className="text-[var(--gold)]"> Box</span>
        </span>
      </Link>

      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-subtle)]">
        <AlertTriangle className="h-10 w-10 text-[var(--danger)]" strokeWidth={1.5} />
      </div>

      {/* Code */}
      <p className="font-mono text-5xl font-bold text-[var(--danger)]">404</p>
      <h1 className="font-playfair mt-2 text-2xl font-bold text-[var(--cream)]">
        Página no encontrada
      </h1>
      <p className="mt-2 max-w-xs text-sm text-[var(--cream-muted)]">
        Esta ruta no existe. Igual que muchos proyectos crypto — si no lo puedes verificar,
        no existe.
      </p>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="rounded-xl bg-[var(--gold)] px-6 py-2.5 text-sm font-bold text-[var(--navy)] transition-opacity hover:opacity-90"
        >
          Ir al Dashboard
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-[var(--border)] px-6 py-2.5 text-sm text-[var(--cream-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--cream)]"
        >
          Inicio
        </Link>
      </div>
    </div>
  );
}

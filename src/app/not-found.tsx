import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="outline-none px-gutter pt-safe pb-safe flex min-h-dvh flex-col items-center justify-center bg-navy text-center">
      <Link href="/" aria-label="FYV Box — inicio" className="tap mb-10 flex items-center rounded-xl">
        <Wordmark size="md" />
      </Link>

      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-danger-border bg-danger-subtle" aria-hidden>
        <SearchX className="h-10 w-10 text-danger" strokeWidth={1.5} />
      </div>

      <p className="font-mono text-5xl font-bold text-danger">404</p>
      <h1 className="mt-2 text-title-1 text-cream">Página no encontrada</h1>
      <p className="mt-2 max-w-xs text-body-sm text-cream-muted">
        Esta ruta no existe. Igual que muchos proyectos crypto: si no lo puedes verificar, no existe.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/dashboard"
          className="flex min-h-[48px] items-center justify-center rounded-xl bg-gold px-6 text-sm font-bold text-on-gold transition-colors hover:bg-gold-hover active:bg-gold-active"
        >
          Ir a mis misiones
        </Link>
        <Link
          href="/"
          className="flex min-h-[48px] items-center justify-center rounded-xl border border-line-strong px-6 text-sm text-cream-muted transition-colors hover:border-line-gold hover:text-cream"
        >
          Inicio
        </Link>
      </div>
    </main>
  );
}

"use client";
import Link from "next/link";
import { ArrowLeft, BarChart2, LogOut } from "lucide-react";
import { WalletIndicator } from "./WalletIndicator";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";
import type { WalletIdentity } from "@/identity/interface";

type BackProp = string | { href: string; label?: string };

interface Props {
  back?: BackProp;
  wallet?: WalletIdentity | null;
  showStats?: boolean;
  showLogout?: boolean;
}

const iconBtnBase =
  "tap items-center justify-center rounded-xl border border-line text-cream-muted transition-colors hover:border-line-strong hover:text-cream active:bg-surface-2";
const iconBtn = `flex ${iconBtnBase}`;
// Same destination as the wordmark, so it only shows where there is room.
const logoutBtn = `hidden sm:flex ${iconBtnBase}`;

export function AppNav({ back, wallet, showStats = false, showLogout = false }: Props) {
  const backHref  = typeof back === "string" ? back : back?.href;
  const backLabel = (typeof back === "object" ? back?.label : undefined) ?? "Volver";

  return (
    <header className="pt-safe sticky top-0 z-40 border-b border-line bg-navy/90 backdrop-blur-md">
      <div className="px-gutter mx-auto flex h-[var(--header-h)] max-w-5xl items-center justify-between gap-2">
        {backHref ? (
          <Link
            href={backHref}
            className="tap -ml-2 flex items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-cream-muted transition-colors hover:text-cream active:bg-surface-2"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
            <span>{backLabel}</span>
          </Link>
        ) : (
          <Link href="/" aria-label="FYV Box — inicio" className="tap flex shrink-0 items-center rounded-xl">
            <Wordmark size="sm" />
          </Link>
        )}

        <nav aria-label="Acciones" className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {wallet && <WalletIndicator publicKey={wallet.publicKey} provider={wallet.provider} />}
          {showStats && (
            <Link href="/stats" aria-label="Estadísticas" className={`${iconBtn} gap-1.5 sm:px-3`}>
              <BarChart2 className="h-[18px] w-[18px]" aria-hidden />
              <span className="hidden text-sm sm:inline">Stats</span>
            </Link>
          )}
          <ThemeToggle />
          {showLogout && (
            <Link href="/" aria-label="Salir al inicio" className={logoutBtn}>
              <LogOut className="h-[18px] w-[18px]" aria-hidden />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

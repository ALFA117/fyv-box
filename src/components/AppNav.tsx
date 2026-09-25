"use client";
import Link from "next/link";
import { Shield, ArrowLeft, BarChart2, LogOut } from "lucide-react";
import { WalletIndicator } from "./WalletIndicator";
import type { WalletIdentity } from "@/identity/interface";

type BackProp = string | { href: string; label?: string };

interface Props {
  back?: BackProp;
  wallet?: WalletIdentity | null;
  showStats?: boolean;
  showLogout?: boolean;
}

export function AppNav({ back, wallet, showStats = false, showLogout = false }: Props) {
  const backHref  = typeof back === "string" ? back  : back?.href;
  const backLabel = typeof back === "object"  ? back?.label : undefined;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--navy)]/90 px-4 py-3 backdrop-blur-md sm:px-6">
      {/* Left: logo or back */}
      {backHref ? (
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-sm text-[var(--cream-muted)] transition-colors hover:text-[var(--cream)] focus-visible:rounded"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {backLabel && <span className="hidden sm:inline">{backLabel}</span>}
        </Link>
      ) : (
        <Link href="/dashboard" className="flex items-center gap-2 focus-visible:rounded">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--gold-subtle)] ring-1 ring-[var(--gold-ring)]">
            <Shield className="h-4 w-4 text-[var(--gold)]" strokeWidth={2} />
          </div>
          <span className="font-playfair text-base font-bold text-[var(--cream)]">
            FYV<span className="text-[var(--gold)]"> Box</span>
          </span>
        </Link>
      )}

      {/* Right */}
      <div className="flex items-center gap-3">
        {wallet && (
          <WalletIndicator publicKey={wallet.publicKey} provider={wallet.provider} />
        )}
        {showStats && (
          <Link
            href="/stats"
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--cream-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--cream)]"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Stats</span>
          </Link>
        )}
        {showLogout && (
          <Link
            href="/"
            aria-label="Salir"
            className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--cream-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--cream)]"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        )}
      </div>
    </header>
  );
}

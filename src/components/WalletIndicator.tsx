"use client";
import { AlertTriangle, Wallet } from "lucide-react";

interface Props {
  publicKey: string;
  provider: "pollar" | "test-wallet";
}

function midTruncate(addr: string, head = 6, tail = 4) {
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function WalletIndicator({ publicKey, provider }: Props) {
  const short    = midTruncate(publicKey, 6, 4);
  const shortest = midTruncate(publicKey, 4, 3);

  return (
    <div className="flex items-center gap-1.5">
      {provider === "test-wallet" && (
        <span
          title="Billetera de prueba — solo testnet. Nunca uses fondos reales aquí."
          className="hidden items-center gap-1 rounded-full border border-[var(--amber-border)] bg-[var(--amber-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--amber)] sm:flex"
        >
          <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          testnet
        </span>
      )}
      <div
        className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1"
        title={publicKey}
      >
        <Wallet className="h-3 w-3 shrink-0 text-[var(--cream-muted)]" aria-hidden="true" />
        <span className="font-mono text-xs text-[var(--cream-muted)] sm:hidden">{shortest}</span>
        <span className="hidden font-mono text-xs text-[var(--cream-muted)] sm:inline">{short}</span>
      </div>
    </div>
  );
}

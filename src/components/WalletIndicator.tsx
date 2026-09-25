"use client";
import { AlertTriangle } from "lucide-react";

interface Props {
  publicKey: string;
  provider: "pollar" | "test-wallet";
}

export function WalletIndicator({ publicKey, provider }: Props) {
  const short = `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      {provider === "test-wallet" && (
        <span
          title="Billetera de prueba — solo testnet, nunca uses fondos reales"
          className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400"
        >
          <AlertTriangle className="h-3 w-3" />
          testnet
        </span>
      )}
      <span className="font-mono text-xs text-[var(--cream-muted)]">{short}</span>
    </div>
  );
}

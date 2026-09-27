"use client";
import { MailCheck, Wallet } from "lucide-react";
import { midTruncate, STELLAR_EXPERT_ACCOUNT } from "@/lib/ownership";

interface Props {
  publicKey: string;
  provider: "pollar" | "test-wallet";
}

/** Tappable chip: opens the real testnet account in Stellar Expert. */
export function WalletIndicator({ publicKey, provider }: Props) {
  return (
    <a
      href={`${STELLAR_EXPERT_ACCOUNT}/${publicKey}`}
      target="_blank"
      rel="noopener noreferrer"
      title={`${publicKey} — ver cuenta en Stellar Expert (testnet)`}
      aria-label={`Tu billetera ${provider === "pollar" ? "ligada a tu correo verificado" : "de prueba"} ${midTruncate(publicKey, 4, 4)}. Ver cuenta en Stellar Expert, testnet`}
      className="tap flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-line bg-surface px-2.5 transition-colors hover:border-line-gold active:bg-surface-2"
    >
      <Wallet className="h-4 w-4 shrink-0 text-cream-muted" aria-hidden="true" />
      <span className="font-mono text-xs text-cream max-[359px]:hidden">
        <span className="sm:hidden">{midTruncate(publicKey, 4, 3)}</span>
        <span className="hidden sm:inline">{midTruncate(publicKey, 6, 4)}</span>
      </span>
      {provider === "pollar" && (
        <span className="hidden items-center gap-1 rounded-full border border-success-border bg-success-subtle px-2 py-0.5 text-xs font-semibold text-success sm:inline-flex">
          <MailCheck className="h-3 w-3" aria-hidden /> correo
        </span>
      )}
      {provider === "test-wallet" && (
        <span className="hidden rounded-full border border-amber-border bg-amber-subtle px-2 py-0.5 text-xs font-semibold text-amber sm:inline">
          testnet
        </span>
      )}
    </a>
  );
}

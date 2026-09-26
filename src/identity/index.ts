"use client";
import type { WalletIdentity } from "./interface";
export type { WalletIdentity, AccountStatus } from "./interface";

let walletPromise: Promise<WalletIdentity> | null = null;

async function loadWallet(): Promise<WalletIdentity> {
  const provider = process.env.NEXT_PUBLIC_IDENTITY_PROVIDER ?? "test-wallet";

  if (provider === "pollar") {
    const { getPollarWallet } = await import("./pollar");
    return getPollarWallet();
  }

  const { getTestWallet } = await import("./test-wallet");
  return getTestWallet();
}

/** Resolves the same wallet for every caller in the tab; a failed load can be retried. */
export function getWallet(): Promise<WalletIdentity> {
  if (!walletPromise) {
    walletPromise = loadWallet().catch((err) => {
      walletPromise = null;
      throw err;
    });
  }
  return walletPromise;
}

export async function ensureWalletFunded(publicKey: string) {
  const { ensureFunded } = await import("./test-wallet");
  return ensureFunded(publicKey);
}

"use client";
/**
 * Pollar identity provider — detrás de flag NEXT_PUBLIC_IDENTITY_PROVIDER=pollar
 * SDK no disponible todavía — delega transparentemente a test-wallet.
 * TODO Phase 2: instalar @pollar/sdk cuando se publique en npm
 */
import type { WalletIdentity } from "./interface";
import { getTestWallet } from "./test-wallet";

export async function getPollarWallet(): Promise<WalletIdentity | null> {
  console.warn("[FYV] Pollar SDK no disponible — usando test-wallet");
  return getTestWallet();
}

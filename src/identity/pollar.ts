"use client";
/**
 * Pollar identity provider — detrás de flag NEXT_PUBLIC_IDENTITY_PROVIDER=pollar (apagado).
 * El SDK aún no está publicado, así que delega a la billetera de prueba; la UI
 * siempre muestra "testnet" porque el provider reportado sigue siendo test-wallet.
 */
import type { WalletIdentity } from "./interface";
import { getTestWallet } from "./test-wallet";

export async function getPollarWallet(): Promise<WalletIdentity> {
  return getTestWallet();
}

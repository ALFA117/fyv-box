"use client";
/**
 * Pollar identity provider — detrás de flag NEXT_PUBLIC_IDENTITY_PROVIDER=pollar
 * Si el SDK de Pollar no está disponible, delega a test-wallet con aviso.
 */
import type { WalletIdentity } from "./interface";
import { getTestWallet } from "./test-wallet";

export async function getPollarWallet(): Promise<WalletIdentity | null> {
  try {
    // Intenta cargar el SDK de Pollar dinámicamente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pollar = await import("@pollar/sdk" as any).catch(() => null);
    if (!pollar) {
      console.warn("[FYV] Pollar SDK no disponible — usando test-wallet");
      return getTestWallet();
    }
    // TODO: inicializar pollar.connect() y mapear a WalletIdentity
    return null;
  } catch {
    return getTestWallet();
  }
}

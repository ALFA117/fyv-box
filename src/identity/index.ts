"use client";
import type { IdentityMode, WalletIdentity } from "./interface";
import { pollarEnabled } from "./pollar";
export type { WalletIdentity, AccountStatus, IdentityMode } from "./interface";
export { AuthRequiredError, pollarEnabled } from "./pollar";

const MODE_KEY = "fyv_identity_mode";

/** Con Pollar configurado, el modo por defecto es correo; sin él, siempre invitado. */
export function getIdentityMode(): IdentityMode {
  if (!pollarEnabled) return "guest";
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === "guest" || stored === "email") return stored;
    // Quien ya entrenaba con la billetera de prueba conserva su progreso: sigue como invitado.
    return localStorage.getItem("fyv_test_wallet_secret") ? "guest" : "email";
  } catch {
    return "email";
  }
}

export function setIdentityMode(mode: IdentityMode) {
  try { localStorage.setItem(MODE_KEY, mode); } catch { /* ignore */ }
  walletPromise = null;
}

let walletPromise: Promise<WalletIdentity> | null = null;

async function loadWallet(): Promise<WalletIdentity> {
  if (getIdentityMode() === "email") {
    const { getPollarWallet } = await import("./pollar");
    return getPollarWallet();
  }
  const { getTestWallet } = await import("./test-wallet");
  return getTestWallet();
}

/**
 * Resolves the same wallet for every caller in the tab; a failed load can be retried.
 * In email mode it rejects with AuthRequiredError when there is no Pollar session.
 */
export function getWallet(): Promise<WalletIdentity> {
  if (!walletPromise) {
    walletPromise = loadWallet().catch((err) => {
      walletPromise = null;
      throw err;
    });
  }
  return walletPromise;
}

/** Cierra la sesión de correo (si hay) y olvida la billetera cargada en esta pestaña. */
export async function signOut() {
  walletPromise = null;
  if (getIdentityMode() === "email") {
    const { pollarLogout } = await import("./pollar");
    await pollarLogout();
  }
}

export async function ensureWalletFunded(publicKey: string) {
  const { ensureFunded } = await import("./test-wallet");
  return ensureFunded(publicKey);
}

/** Si el error es "falta iniciar sesión", manda a /entrar y regresa aquí después. */
export function sendToLoginIfNeeded(err: unknown, next: string): boolean {
  if (!(err instanceof Error) || err.name !== "AuthRequiredError") return false;
  window.location.replace(`/entrar?next=${encodeURIComponent(next)}`);
  return true;
}

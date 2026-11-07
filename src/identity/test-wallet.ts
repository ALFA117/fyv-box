"use client";
/**
 * Test wallet — SOLO TESTNET
 * Genera o restaura un keypair en localStorage y se asegura de que la cuenta
 * exista de verdad en Stellar testnet (Friendbot), verificable en el explorador.
 */
import type { AccountStatus, WalletIdentity } from "./interface";

const STORAGE_KEY = "fyv_test_wallet_secret";
const HORIZON = "https://horizon-testnet.stellar.org";
const FRIENDBOT = "https://friendbot.stellar.org";

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function getAccountStatus(publicKey: string): Promise<AccountStatus> {
  try {
    const res = await fetchWithTimeout(`${HORIZON}/accounts/${encodeURIComponent(publicKey)}`, 8000);
    if (res.ok) return "funded";
    if (res.status === 404) return "unfunded";
    return "unknown";
  } catch {
    return "unknown";
  }
}

// One in-flight funding per tab so re-renders can't fire duplicate Friendbot calls.
let fundingPromise: Promise<AccountStatus> | null = null;

// Una cuenta fondeada ya no se vuelve a consultar en cada carga (evita peticiones y 404 en consola).
const FUNDED_PREFIX = "fyv_funded:";

function rememberedFunded(publicKey: string): boolean {
  try { return localStorage.getItem(FUNDED_PREFIX + publicKey) === "1"; } catch { return false; }
}

function rememberFunded(publicKey: string, status: AccountStatus): AccountStatus {
  if (status === "funded") {
    try { localStorage.setItem(FUNDED_PREFIX + publicKey, "1"); } catch { /* ignore */ }
  }
  return status;
}

/** `fresh`: llave recién generada; se sabe que no existe y se va directo a Friendbot. */
export function ensureFunded(publicKey: string, fresh = false): Promise<AccountStatus> {
  if (rememberedFunded(publicKey)) return Promise.resolve("funded");
  if (fundingPromise) return fundingPromise;
  fundingPromise = (async () => {
    if (!fresh) {
      const status = await getAccountStatus(publicKey);
      if (status !== "unfunded") return rememberFunded(publicKey, status);
    }
    try {
      // Friendbot answers 400 if the account already exists, which is fine.
      const res = await fetchWithTimeout(`${FRIENDBOT}?addr=${encodeURIComponent(publicKey)}`, 20000);
      if (res.ok) return rememberFunded(publicKey, "funded");
    } catch {
      /* network error: reported through the status below */
    }
    return rememberFunded(publicKey, await getAccountStatus(publicKey));
  })().finally(() => {
    setTimeout(() => { fundingPromise = null; }, 0);
  });
  return fundingPromise;
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export async function getTestWallet(): Promise<WalletIdentity> {
  const { Keypair, TransactionBuilder, Networks } = await import("@stellar/stellar-sdk");

  let secret = "";
  try {
    secret = localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    /* storage blocked: an ephemeral wallet is still usable for this session */
  }

  let keypair: ReturnType<typeof Keypair.random>;
  try {
    keypair = secret ? Keypair.fromSecret(secret) : Keypair.random();
  } catch {
    keypair = Keypair.random();
  }
  const fresh = !secret || keypair.secret() !== secret;
  if (fresh) {
    try {
      localStorage.setItem(STORAGE_KEY, keypair.secret());
    } catch {
      /* ignore */
    }
  }

  void ensureFunded(keypair.publicKey(), fresh);

  return {
    publicKey: keypair.publicKey(),
    isTestnet: true,
    provider: "test-wallet",
    async signTransaction(txXdr: string): Promise<string> {
      const tx = TransactionBuilder.fromXDR(txXdr, Networks.TESTNET);
      tx.sign(keypair);
      return tx.toXDR();
    },
    async signMessage(message: string): Promise<string> {
      return toBase64(keypair.signMessage(message));
    },
  };
}

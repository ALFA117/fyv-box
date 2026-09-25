"use client";
/**
 * Test wallet — SOLO TESTNET
 * Genera o restaura un keypair en localStorage.
 * Muestra aviso permanente: "Billetera de prueba — solo testnet, nunca uses en mainnet"
 */
import type { WalletIdentity } from "./interface";

const STORAGE_KEY = "fyv_test_wallet_secret";

async function fundViaFriendbot(publicKey: string): Promise<void> {
  try {
    await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
  } catch {
    // non-critical
  }
}

export async function getTestWallet(): Promise<WalletIdentity> {
  const { Keypair, TransactionBuilder } = await import("@stellar/stellar-sdk");

  let secret = "";
  try {
    secret = localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    // SSR guard
  }

  let keypair: ReturnType<typeof Keypair.random>;
  if (secret) {
    keypair = Keypair.fromSecret(secret);
  } else {
    keypair = Keypair.random();
    try {
      localStorage.setItem(STORAGE_KEY, keypair.secret());
    } catch {
      /* ignore */
    }
    // Fund new wallet via Friendbot (non-blocking)
    fundViaFriendbot(keypair.publicKey());
  }

  return {
    publicKey: keypair.publicKey(),
    isTestnet: true,
    provider: "test-wallet",
    async signTransaction(txXdr: string): Promise<string> {
      const Networks = (await import("@stellar/stellar-sdk")).Networks;
      const tx = TransactionBuilder.fromXDR(txXdr, Networks.TESTNET);
      tx.sign(keypair);
      return tx.toXDR();
    },
  };
}

"use client";
export type { WalletIdentity } from "./interface";

export async function getWallet() {
  const provider =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_IDENTITY_PROVIDER ?? "test-wallet"
      : "test-wallet";

  if (provider === "pollar") {
    const { getPollarWallet } = await import("./pollar");
    return getPollarWallet();
  }

  const { getTestWallet } = await import("./test-wallet");
  return getTestWallet();
}

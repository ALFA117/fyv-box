export interface WalletIdentity {
  publicKey: string;
  signTransaction(txXdr: string): Promise<string>;
  isTestnet: boolean;
  provider: "pollar" | "test-wallet";
}

export type IdentityProvider = () => Promise<WalletIdentity | null>;

export interface WalletIdentity {
  publicKey: string;
  signTransaction(txXdr: string): Promise<string>;
  /** SEP-53 signed message, base64. Proves ownership of `publicKey` to the API. */
  signMessage(message: string): Promise<string>;
  isTestnet: boolean;
  provider: "pollar" | "test-wallet";
}

export type IdentityProvider = () => Promise<WalletIdentity | null>;

export type AccountStatus = "funded" | "unfunded" | "unknown";

export interface WalletIdentity {
  publicKey: string;
  signTransaction(txXdr: string): Promise<string>;
  /** SEP-53 signed message, base64. Proves ownership of `publicKey` to the API. */
  signMessage(message: string): Promise<string>;
  isTestnet: boolean;
  provider: "pollar" | "test-wallet";
  /** Correo verificado (solo con Pollar). Vive en memoria, no se guarda. */
  email?: string;
}

export type IdentityProvider = () => Promise<WalletIdentity | null>;

export type AccountStatus = "funded" | "unfunded" | "unknown";

/** "email": sesión de Pollar con correo verificado · "guest": billetera de prueba local. */
export type IdentityMode = "email" | "guest";

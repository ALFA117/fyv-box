"use client";
/**
 * Pollar: login con correo (código OTP) + billetera Stellar custodiada en testnet.
 * Se activa solo si existe NEXT_PUBLIC_POLLAR_API_KEY (llave publicable pub_testnet_…,
 * segura en el navegador). Las firmas SEP-53 las produce el servidor de Pollar con el
 * mismo esquema que la billetera de prueba, así que /api/missions/complete las verifica igual.
 */
import type { AuthState, PollarClient } from "@pollar/core";
import type { WalletIdentity } from "./interface";

export const POLLAR_API_KEY = process.env.NEXT_PUBLIC_POLLAR_API_KEY ?? "";
export const pollarEnabled = POLLAR_API_KEY.length > 0;

export class AuthRequiredError extends Error {
  constructor() {
    super("Inicia sesión con tu correo para continuar.");
    this.name = "AuthRequiredError";
  }
}

let clientPromise: Promise<PollarClient> | null = null;

export function getPollarClient(): Promise<PollarClient> {
  if (!pollarEnabled) return Promise.reject(new Error("Pollar no está configurado."));
  if (!clientPromise) {
    clientPromise = (async () => {
      const { PollarClient } = await import("@pollar/core");
      const client = new PollarClient({
        apiKey: POLLAR_API_KEY,
        stellarNetwork: "testnet",
        deviceLabel: "FYV Box",
        logLevel: "warn",
      });
      await client.ready();
      return client;
    })().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}

/** Mensajes en español para los códigos de error del flujo de correo. */
export function authErrorMessage(state: Extract<AuthState, { step: "error" }>): string {
  switch (state.errorCode) {
    case "EMAIL_CODE_INVALID":
      return "Ese código no es correcto. Revísalo e intenta de nuevo.";
    case "EMAIL_CODE_EXPIRED":
      return "El código expiró. Pide uno nuevo.";
    case "EMAIL_SEND_FAILED":
      return "No pudimos enviar el correo. Revisa la dirección e intenta de nuevo.";
    case "LOGIN_TIMEOUT":
      return "Pasó demasiado tiempo. Vuelve a empezar.";
    case "SESSION_CREATE_FAILED":
    case "UNEXPECTED_ERROR":
      return "No pudimos conectar con el servicio de verificación. Revisa tu conexión e intenta en un momento.";
    case "SESSION_EXPIRED":
    case "SESSION_INVALID":
      return "Tu sesión expiró. Vuelve a iniciar sesión.";
    default:
      return "Algo salió mal al verificar tu correo. Intenta de nuevo.";
  }
}

/** Espera a que la sesión tenga dirección Stellar (la billetera se crea en el servidor al entrar). */
async function waitForAddress(client: PollarClient, ms = 15000): Promise<string> {
  const now = client.getWallet()?.address;
  if (now) return now;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { unsub(); reject(new Error("Tu billetera aún no está lista. Intenta de nuevo.")); }, ms);
    const unsub = client.onAuthStateChange(() => {
      const addr = client.getWallet()?.address;
      if (addr) { clearTimeout(timer); unsub(); resolve(addr); }
    });
  });
}

export async function getPollarWallet(): Promise<WalletIdentity> {
  const client = await getPollarClient();
  if (client.getAuthState().step !== "authenticated") throw new AuthRequiredError();
  const publicKey = await waitForAddress(client);

  return {
    publicKey,
    isTestnet: true,
    provider: "pollar",
    email: client.getUserProfile()?.mail || undefined,
    async signTransaction(): Promise<string> {
      throw new Error("FYV Box no firma transacciones con la billetera de Pollar.");
    },
    async signMessage(message: string): Promise<string> {
      const proof = await client.stellar.sep53.signMessage(message);
      if (proof.status !== "signed") {
        throw new Error(proof.details || "Pollar no pudo firmar tu respuesta.");
      }
      if (proof.signerAddress !== publicKey) throw new Error("La firma no corresponde a tu billetera.");
      return proof.signature;
    },
  };
}

export async function pollarLogout(): Promise<void> {
  if (!pollarEnabled) return;
  const client = await getPollarClient();
  await client.logout().catch(() => {});
}

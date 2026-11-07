/**
 * Emisión de credenciales on-chain (solo servidor), después de responder al navegador.
 *
 * - Una emisión por dirección·módulo a la vez en esta instancia: dos respuestas casi simultáneas
 *   no mandan dos transacciones.
 * - Cada paso se reintenta una vez si falla (Horizon y el RPC de Soroban a veces tropiezan).
 * - Si la transacción con memo no sale, se libera el candado para que la siguiente respuesta
 *   correcta del módulo vuelva a intentarlo.
 */
import { attestModule, issueOnContract } from "@/lib/attest";

const RETRY_DELAY_MS = 3000;
const HOLD_MS = 10 * 60_000;
const claims = new Map<string, number>();

function keyOf(address: string, module: string) {
  return `${address}:${module}`;
}

/** Reserva la emisión; false si ya hay una en curso o recién hecha para esa dirección y módulo. */
export function claimIssuance(address: string, module: string, now = Date.now()): boolean {
  for (const [k, t] of claims) if (now - t > HOLD_MS) claims.delete(k);
  const key = keyOf(address, module);
  if (claims.has(key)) return false;
  claims.set(key, now);
  return true;
}

export function releaseIssuance(address: string, module: string): void {
  claims.delete(keyOf(address, module));
}

async function twice<T>(label: string, fn: () => Promise<T>, delayMs: number): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[FYV] ${label} failed, retrying:`, err instanceof Error ? err.message : err);
    await new Promise((r) => setTimeout(r, delayMs));
    return fn();
  }
}

/** Transacción con memo + registro en el contrato, en serie (misma cuenta emisora, misma secuencia). */
export async function issueCredential(address: string, module: string, delayMs = RETRY_DELAY_MS): Promise<void> {
  try {
    await twice("on-chain attestation", () => attestModule(address, module), delayMs);
  } catch (err) {
    releaseIssuance(address, module);
    console.error("[FYV] on-chain attestation failed:", err instanceof Error ? err.message : err);
    return;
  }
  await twice("soroban issue", () => issueOnContract(address, module), delayMs).catch((err) =>
    console.error("[FYV] soroban issue failed:", err instanceof Error ? err.message : err),
  );
}

/** Solo para pruebas. */
export function resetIssuance(): void {
  claims.clear();
}

/**
 * Recibos de misión (solo servidor).
 *
 * Si la base de datos no responde, el servidor sigue evaluando las respuestas y, cuando
 * aciertas, devuelve un recibo HMAC ligado a tu dirección y a la misión. El navegador
 * guarda los recibos y los reenvía en cada respuesta: así el servidor puede saber qué
 * misiones completaste sin base de datos y emitir la credencial on-chain al cerrar un módulo.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const MISSION_ID_RE = /^[a-z0-9-]{1,64}$/;

function key(): Buffer | null {
  const secret = process.env.FYV_ATTESTOR_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!secret) return null;
  return createHash("sha256").update(`fyv-receipt-v1:${secret}`).digest();
}

export function receiptsEnabled(): boolean {
  return key() !== null;
}

export function signReceipt(stellarAddress: string, missionId: string): string | null {
  const k = key();
  if (!k) return null;
  return createHmac("sha256", k).update(`${stellarAddress}|${missionId}`).digest("base64url");
}

/** Ids de misión con recibo válido para esta dirección. Ignora en silencio los inválidos. */
export function validReceiptIds(stellarAddress: string, receipts: Record<string, string> | undefined): string[] {
  if (!receipts) return [];
  const out: string[] = [];
  for (const [missionId, sig] of Object.entries(receipts)) {
    if (!MISSION_ID_RE.test(missionId) || typeof sig !== "string" || sig.length > 100) continue;
    const expected = signReceipt(stellarAddress, missionId);
    if (!expected) return [];
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) out.push(missionId);
  }
  return out;
}

/**
 * Límite de ritmo en memoria (solo servidor), por instancia.
 *
 * No es un límite global —cada instancia de Vercel lleva su propia cuenta—, pero frena
 * scripts que disparan cientos de respuestas o emisiones seguidas desde la misma IP.
 */
const hits = new Map<string, number[]>();
const MAX_KEYS = 5000;

/** true si se permite una petición más con esta llave dentro de la ventana. */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > MAX_KEYS) {
    // Poda simple: descarta las llaves más viejas (Map conserva el orden de inserción).
    for (const k of [...hits.keys()].slice(0, hits.size - MAX_KEYS)) hits.delete(k);
  }
  return true;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}

/** Solo para pruebas. */
export function resetRateLimits(): void {
  hits.clear();
}

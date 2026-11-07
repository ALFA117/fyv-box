import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase (solo servidor).
 *
 * Si la base no responde (proyecto pausado o borrado, DNS caído), cada consulta debe fallar
 * rápido: sin esto, postgrest-js reintenta cada lectura 3 veces (1 s + 2 s + 4 s) y el mapa,
 * las credenciales y /api/verify tardaban 8–20 s. Por eso:
 *  - las consultas no se reintentan (`db.retry: false`) y se cortan a los 5 s;
 *  - tras un error de red, la base se da por caída un minuto y las consultas siguientes
 *    fallan al instante, sin salir a la red (las rutas ya tienen su modo sin base de datos).
 */

const TIMEOUT_MS = 5000;
const DOWN_FOR_MS = 60_000;

let downUntil = 0;

export function dbConfigured(): boolean {
  return Boolean(getUrl() && (process.env.SUPABASE_SERVICE_ROLE_KEY || getAnon()));
}

/** true si la base falló hace poco (o no está configurada): conviene ni intentarlo. */
export function dbKnownDown(now = Date.now()): boolean {
  return !dbConfigured() || now < downUntil;
}

export function markDbDown(now = Date.now()): void {
  downUntil = now + DOWN_FOR_MS;
}

/** Solo para pruebas. */
export function resetDbHealth(): void {
  downUntil = 0;
}

function getUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}
function getAnon(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

/** fetch con corte de tiempo que recuerda si la base está caída. */
export const guardedFetch: typeof fetch = async (input, init) => {
  if (dbKnownDown()) throw new TypeError("FYV: la base de datos no responde (omitida)");
  try {
    const res = await fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS) });
    // 520–599: errores del proxy de Supabase (proyecto pausado, origen caído).
    if (res.status >= 520) markDbDown();
    return res;
  } catch (err) {
    markDbDown();
    throw err;
  }
};

let warnedNoServiceRole = false;
let _client: SupabaseClient | null = null;

/**
 * Usa SUPABASE_SERVICE_ROLE_KEY cuando está configurada; si no, la anon key, que solo
 * puede escribir mientras existan las políticas anónimas de la migración 001.
 */
export function supabaseServer(): SupabaseClient {
  if (_client) return _client;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRole && !warnedNoServiceRole) {
    warnedNoServiceRole = true;
    console.warn("[FYV] SUPABASE_SERVICE_ROLE_KEY no configurada — escribiendo con anon key");
  }
  // createClient exige una URL válida aunque no haya base: con una de relleno, guardedFetch corta antes de salir.
  _client = createClient(getUrl() || "https://db.invalid", serviceRole ?? (getAnon() || "none"), {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { retry: false },
    global: { fetch: guardedFetch },
  });
  return _client;
}

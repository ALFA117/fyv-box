import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}
function getAnon(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

// Lazy singleton — no se inicializa en top-level para evitar errores en build
let _client: SupabaseClient | null = null;
export function getSupabaseClient(): SupabaseClient {
  if (!_client) _client = createClient(getUrl(), getAnon());
  return _client;
}

// Compat export para componentes cliente que usan `supabase` directamente (solo lecturas)
export const supabase = {
  from: (...args: Parameters<SupabaseClient["from"]>) =>
    getSupabaseClient().from(...args),
} as SupabaseClient;

let warnedNoServiceRole = false;

/**
 * Server-only client. Uses SUPABASE_SERVICE_ROLE_KEY when configured; otherwise
 * falls back to the anon key, which only works while the anon write policies of
 * migration 001 exist (see README → FIX_NOTES → "Cerrar escrituras anónimas").
 */
export function supabaseServer(): SupabaseClient {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRole && !warnedNoServiceRole) {
    warnedNoServiceRole = true;
    console.warn("[FYV] SUPABASE_SERVICE_ROLE_KEY no configurada — escribiendo con anon key");
  }
  return createClient(getUrl(), serviceRole ?? getAnon(), {
    auth: { persistSession: false },
  });
}

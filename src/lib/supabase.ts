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

// Compat export para componentes cliente que usan `supabase` directamente
export const supabase = {
  from: (...args: Parameters<SupabaseClient["from"]>) =>
    getSupabaseClient().from(...args),
  auth: new Proxy({} as SupabaseClient["auth"], {
    get(_t, prop) {
      return (getSupabaseClient().auth as unknown as Record<string, unknown>)[prop as string];
    },
  }),
} as SupabaseClient;

export function supabaseServer(): SupabaseClient {
  const url = getUrl();
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(url, serviceRole ?? getAnon(), {
    auth: { persistSession: false },
  });
}

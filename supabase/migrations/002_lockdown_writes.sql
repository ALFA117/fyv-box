-- FYV Box — 002: cerrar escrituras anónimas + tabla de log de /api/verify
--
-- ORDEN OBLIGATORIO (si lo inviertes, /api/missions/complete deja de guardar):
--   1. En Vercel → Settings → Environment Variables agrega SUPABASE_SERVICE_ROLE_KEY
--      (Supabase → Project Settings → API → service_role) y redespliega.
--   2. Corre este archivo en Supabase → SQL Editor.
--
-- Por qué: con las políticas de 001, cualquiera con la anon key pública (que viaja
-- al navegador) puede insertar filas en fyv_module_completions y fabricar una
-- credencial para cualquier dirección sin pasar por la API.

-- Escrituras solo desde el servidor (service_role ignora RLS)
drop policy if exists "anon insert completed" on fyv_completed_missions;
drop policy if exists "anon update completed" on fyv_completed_missions;
drop policy if exists "anon insert progress"  on fyv_mission_progress;
drop policy if exists "anon insert modules"   on fyv_module_completions;
drop policy if exists "anon update modules"   on fyv_module_completions;

-- Las lecturas públicas se mantienen: el dashboard y /graduation leen con anon key,
-- y las credenciales son públicas por diseño (cualquiera puede verificarlas).

-- Log de consultas a /api/verify (la ruta ya lo escribe en modo best-effort)
create table if not exists fyv_verify_log (
  id              uuid primary key default gen_random_uuid(),
  querier_ip      text        not null,
  queried_address text        not null,
  module_id       text,
  queried_at      timestamptz not null default now()
);
create index if not exists fyv_verify_log_addr on fyv_verify_log (queried_address);
alter table fyv_verify_log enable row level security;
-- Sin políticas para anon: solo service_role lo lee/escribe (contiene IPs).

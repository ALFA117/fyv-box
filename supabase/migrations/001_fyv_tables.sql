-- FYV Box — tablas principales
-- Corre esto en Supabase → SQL Editor

-- 1. Misiones completadas (progreso guardado por usuario)
create table if not exists fyv_completed_missions (
  id              uuid primary key default gen_random_uuid(),
  stellar_address text        not null,
  mission_id      text        not null,
  org_slug        text        not null default 'criptounam',
  completed_at    timestamptz not null default now(),
  constraint fyv_completed_missions_unique unique (stellar_address, mission_id, org_slug)
);
create index if not exists fyv_completed_missions_addr on fyv_completed_missions (stellar_address);

-- 2. Intentos por misión (para estadísticas / trampa)
create table if not exists fyv_mission_progress (
  id               uuid primary key default gen_random_uuid(),
  stellar_address  text    not null,
  mission_id       text    not null,
  track            text    not null,
  fell_for_trap    boolean not null default false,
  selected_option_id text  not null,
  org_slug         text    not null default 'criptounam',
  created_at       timestamptz not null default now()
);
create index if not exists fyv_mission_progress_addr on fyv_mission_progress (stellar_address);
create index if not exists fyv_mission_progress_track on fyv_mission_progress (track);

-- 3. Completaciones de módulos (credencial on-chain / registry)
create table if not exists fyv_module_completions (
  id              uuid primary key default gen_random_uuid(),
  stellar_address text        not null,
  module_id       text        not null,
  org_slug        text        not null default 'criptounam',
  completed_at    timestamptz not null default now(),
  constraint fyv_module_completions_unique unique (stellar_address, module_id, org_slug)
);
create index if not exists fyv_module_completions_addr on fyv_module_completions (stellar_address);

-- Row Level Security (anon puede leer/escribir con anon key)
alter table fyv_completed_missions  enable row level security;
alter table fyv_mission_progress    enable row level security;
alter table fyv_module_completions  enable row level security;

-- Policies: anon puede insertar y leer (demo hackathon, sin auth)
create policy "anon insert completed" on fyv_completed_missions  for insert to anon with check (true);
create policy "anon select completed" on fyv_completed_missions  for select to anon using (true);
create policy "anon insert progress"  on fyv_mission_progress    for insert to anon with check (true);
create policy "anon select progress"  on fyv_mission_progress    for select to anon using (true);
create policy "anon insert modules"   on fyv_module_completions  for insert to anon with check (true);
create policy "anon select modules"   on fyv_module_completions  for select to anon using (true);
-- upsert necesita update también
create policy "anon update completed" on fyv_completed_missions  for update to anon using (true);
create policy "anon update modules"   on fyv_module_completions  for update to anon using (true);

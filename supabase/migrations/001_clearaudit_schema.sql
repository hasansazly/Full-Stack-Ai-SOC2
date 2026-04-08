create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz default now(),
  user_id uuid references auth.users
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients,
  type text,
  credentials jsonb,
  status text,
  created_at timestamptz default now()
);

create table if not exists public.evidence_artifacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients,
  source text,
  collected_at timestamptz default now(),
  raw_data jsonb,
  checksum text,
  artifact_type text
);

create table if not exists public.gap_findings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients,
  control_area text,
  severity text,
  title text,
  description text,
  business_risk text,
  remediation_steps jsonb,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists public.remediation_log (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid references public.gap_findings,
  action_taken text,
  actor text,
  timestamp timestamptz default now()
);

alter table public.clients enable row level security;
alter table public.integrations enable row level security;
alter table public.evidence_artifacts enable row level security;
alter table public.gap_findings enable row level security;
alter table public.remediation_log enable row level security;

create policy "clients_select_own" on public.clients
for select using (user_id = auth.uid());

create policy "clients_insert_own" on public.clients
for insert with check (user_id = auth.uid());

create policy "clients_update_own" on public.clients
for update using (user_id = auth.uid());

create policy "integrations_own_client" on public.integrations
for all using (
  exists (
    select 1
    from public.clients
    where public.clients.id = integrations.client_id
      and public.clients.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.clients
    where public.clients.id = integrations.client_id
      and public.clients.user_id = auth.uid()
  )
);

create policy "evidence_own_client" on public.evidence_artifacts
for all using (
  exists (
    select 1
    from public.clients
    where public.clients.id = evidence_artifacts.client_id
      and public.clients.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.clients
    where public.clients.id = evidence_artifacts.client_id
      and public.clients.user_id = auth.uid()
  )
);

create policy "findings_own_client" on public.gap_findings
for all using (
  exists (
    select 1
    from public.clients
    where public.clients.id = gap_findings.client_id
      and public.clients.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.clients
    where public.clients.id = gap_findings.client_id
      and public.clients.user_id = auth.uid()
  )
);

create policy "remediation_log_own_finding" on public.remediation_log
for all using (
  exists (
    select 1
    from public.gap_findings
    join public.clients on public.clients.id = public.gap_findings.client_id
    where public.gap_findings.id = remediation_log.finding_id
      and public.clients.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.gap_findings
    join public.clients on public.clients.id = public.gap_findings.client_id
    where public.gap_findings.id = remediation_log.finding_id
      and public.clients.user_id = auth.uid()
  )
);

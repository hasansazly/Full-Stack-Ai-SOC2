create extension if not exists pgcrypto;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  company text,
  deal_at_risk boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  tier text default 'readiness',
  created_at timestamptz default now()
);

create table if not exists public.evidence_artifacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  control text not null,
  source text not null,
  collected_at timestamptz not null,
  content_hash text not null,
  raw_content text not null,
  created_at timestamptz default now()
);

create table if not exists public.gap_findings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  evidence_id uuid references public.evidence_artifacts(id),
  control text not null,
  severity text not null,
  finding text not null,
  auto_remediable boolean default false,
  remediation_type text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists public.remediation_log (
  id uuid primary key default gen_random_uuid(),
  gap_id uuid references public.gap_findings(id),
  remediation_code text not null,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  executed_at timestamptz,
  execution_result jsonb,
  created_at timestamptz default now()
);

alter table public.waitlist enable row level security;
alter table public.clients enable row level security;
alter table public.evidence_artifacts enable row level security;
alter table public.gap_findings enable row level security;
alter table public.remediation_log enable row level security;

create policy "waitlist_insert_open" on public.waitlist
for insert with check (true);

create policy "clients_select_own" on public.clients
for select using (auth.uid() is not null);

create policy "evidence_select_own_client" on public.evidence_artifacts
for select using (
  exists (
    select 1 from public.clients
    where public.clients.id = evidence_artifacts.client_id
  )
);

create policy "findings_select_own_client" on public.gap_findings
for select using (
  exists (
    select 1 from public.clients
    where public.clients.id = gap_findings.client_id
  )
);

create policy "remediation_select_own_gap" on public.remediation_log
for select using (
  exists (
    select 1
    from public.gap_findings
    where public.gap_findings.id = remediation_log.gap_id
  )
);

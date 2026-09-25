create table if not exists public.business_diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  version integer not null default 1 check (version > 0),
  answers jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  overall_score integer not null check (overall_score between 0 and 100),
  primary_pillar text not null check (primary_pillar in (
    'strategy',
    'brand_communication',
    'marketing',
    'sales',
    'processes',
    'technology_ai',
    'management_growth'
  )),
  summary text,
  created_at timestamptz not null default now()
);

alter table public.business_diagnostics enable row level security;

create index if not exists business_diagnostics_user_created_idx
  on public.business_diagnostics (user_id, created_at desc);

create index if not exists business_diagnostics_business_created_idx
  on public.business_diagnostics (business_id, created_at desc);

drop policy if exists "Usuario pode visualizar proprios diagnosticos" on public.business_diagnostics;
create policy "Usuario pode visualizar proprios diagnosticos"
  on public.business_diagnostics
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Usuario pode criar proprios diagnosticos" on public.business_diagnostics;
create policy "Usuario pode criar proprios diagnosticos"
  on public.business_diagnostics
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.businesses b
      where b.id = business_id
        and b.user_id = (select auth.uid())
    )
  );

drop policy if exists "Usuario pode excluir proprios diagnosticos" on public.business_diagnostics;
create policy "Usuario pode excluir proprios diagnosticos"
  on public.business_diagnostics
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Assessment attempts for authenticated users.
create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_key text not null,
  score integer not null check (score >= 0),
  total_questions integer not null check (total_questions > 0),
  skill_level text not null check (skill_level in ('beginner', 'intermediate', 'advanced')),
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists assessment_results_user_id_idx
  on public.assessment_results(user_id);

create index if not exists assessment_results_roadmap_key_idx
  on public.assessment_results(roadmap_key);

alter table public.assessment_results enable row level security;

drop policy if exists "Users can view their own assessment results" on public.assessment_results;
create policy "Users can view their own assessment results"
  on public.assessment_results for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own assessment results" on public.assessment_results;
create policy "Users can insert their own assessment results"
  on public.assessment_results for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

grant select, insert on table public.assessment_results to authenticated;
revoke all on table public.assessment_results from anon;

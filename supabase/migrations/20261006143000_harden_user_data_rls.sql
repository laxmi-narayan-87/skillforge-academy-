-- SkillForge Academy: user-data authorization hardening.
-- Apply this migration to the linked Supabase project before production use.

-- Create the core tables before enabling RLS so a clean Supabase project
-- can apply this repository's migrations in order.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  full_name text,
  github_url text,
  goals text[] not null default '{}'::text[],
  hours_per_week integer not null default 5,
  learning_style text not null default 'visual',
  linkedin_url text,
  phone text,
  updated_at timestamptz not null default now(),
  website_url text
);

create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  description text not null default '',
  sections jsonb not null default '[]'::jsonb,
  title text not null,
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete cascade
);

-- roadmap_id intentionally stores text: curated routes use stable slugs
-- (for example, "frontend") while generated routes use UUID strings.
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  completed_topics text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  current_level text not null default 'beginner',
  last_activity timestamptz not null default now(),
  roadmap_id text not null,
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade
);

-- Older installations may have used a UUID foreign key, which rejects curated
-- roadmap slugs. Keep ownership isolation in RLS and normalize the key to text.
alter table public.user_progress
  drop constraint if exists user_progress_roadmap_id_fkey;
alter table public.user_progress
  alter column roadmap_id type text using roadmap_id::text;

alter table public.profiles enable row level security;
alter table public.roadmaps enable row level security;
alter table public.user_progress enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.roadmaps from anon;
revoke all on table public.user_progress from anon;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.roadmaps to authenticated;
grant select, insert, update, delete on table public.user_progress to authenticated;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can delete their own profile" on public.profiles;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can delete their own profile"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can view their own roadmaps" on public.roadmaps;
drop policy if exists "Users can create their own roadmaps" on public.roadmaps;
drop policy if exists "Users can update their own roadmaps" on public.roadmaps;
drop policy if exists "Users can delete their own roadmaps" on public.roadmaps;

create policy "Users can view their own roadmaps"
on public.roadmaps
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own roadmaps"
on public.roadmaps
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own roadmaps"
on public.roadmaps
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own roadmaps"
on public.roadmaps
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own progress" on public.user_progress;
drop policy if exists "Users can create their own progress" on public.user_progress;
drop policy if exists "Users can update their own progress" on public.user_progress;
drop policy if exists "Users can delete their own progress" on public.user_progress;

create policy "Users can view their own progress"
on public.user_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own progress"
on public.user_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own progress"
on public.user_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own progress"
on public.user_progress
for delete
to authenticated
using ((select auth.uid()) = user_id);

create unique index if not exists user_progress_user_roadmap_unique
on public.user_progress (user_id, roadmap_id);

create index if not exists roadmaps_user_id_idx
on public.roadmaps (user_id);

create index if not exists user_progress_user_id_idx
on public.user_progress (user_id);

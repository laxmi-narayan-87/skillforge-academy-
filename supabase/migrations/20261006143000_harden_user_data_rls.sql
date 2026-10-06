-- SkillForge Academy: user-data authorization hardening.
-- Apply this migration to the linked Supabase project before production use.

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

-- Curated roadmaps use text slugs (for example, "frontend"); generated roadmaps
-- use UUIDs serialized as strings. A UUID foreign key incorrectly rejects curated
-- progress entries, so the key is kept as text and user ownership remains enforced
-- by row-level security.
alter table public.user_progress
  drop constraint if exists user_progress_roadmap_id_fkey;
alter table public.user_progress
  alter column roadmap_id type text using roadmap_id::text;

-- Users may submit their own assessment history, but a stored score must never
-- exceed the number of questions. NOT VALID avoids blocking deployment on any
-- legacy rows while enforcing the constraint for all new and updated records.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assessment_results_score_not_above_total'
      and conrelid = 'public.assessment_results'::regclass
  ) then
    alter table public.assessment_results
      add constraint assessment_results_score_not_above_total
      check (score <= total_questions) not valid;
  end if;
end;
$$;

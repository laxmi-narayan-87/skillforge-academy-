alter table public.roadmaps
  add column if not exists resources jsonb not null default '[]'::jsonb,
  add column if not exists topic_questions jsonb not null default '{}'::jsonb;

update public.roadmaps
set resources = '[]'::jsonb
where resources is null;

update public.roadmaps
set topic_questions = '{}'::jsonb
where topic_questions is null;

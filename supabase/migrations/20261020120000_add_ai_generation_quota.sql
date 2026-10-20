-- Per-user rolling hourly quota for AI roadmap generation.
create table if not exists public.ai_generation_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0)
);

alter table public.ai_generation_usage enable row level security;
revoke all on table public.ai_generation_usage from anon, authenticated;

create or replace function public.consume_ai_generation_quota(p_limit integer default 10)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  updated_count integer;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 100 then
    raise exception 'Invalid quota limit';
  end if;

  insert into public.ai_generation_usage as usage (user_id, window_started_at, request_count)
  values (caller_id, now(), 1)
  on conflict (user_id) do update
  set window_started_at = case
        when usage.window_started_at <= now() - interval '1 hour' then now()
        else usage.window_started_at
      end,
      -- Stop counting after the first rejected request to prevent overflow
      -- while preserving an atomic per-user quota check under concurrency.
      request_count = case
        when usage.window_started_at <= now() - interval '1 hour' then 1
        else least(usage.request_count + 1, p_limit + 1)
      end
  returning request_count into updated_count;

  return updated_count <= p_limit;
end;
$$;

revoke all on function public.consume_ai_generation_quota(integer) from public, anon;
grant execute on function public.consume_ai_generation_quota(integer) to authenticated;

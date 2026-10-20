-- Use a server-defined quota rather than a caller-supplied limit.
-- The old integer argument allowed authenticated clients to alter quota behavior.
drop function if exists public.consume_ai_generation_quota(integer);

create or replace function public.consume_ai_generation_quota()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  updated_count integer;
  quota_limit constant integer := 10;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.ai_generation_usage as usage
    (user_id, window_started_at, request_count)
  values (caller_id, now(), 1)
  on conflict (user_id) do update
  set window_started_at = case
        when usage.window_started_at <= now() - interval '1 hour' then now()
        else usage.window_started_at
      end,
      request_count = case
        when usage.window_started_at <= now() - interval '1 hour' then 1
        else least(usage.request_count + 1, quota_limit + 1)
      end
  returning request_count into updated_count;

  return updated_count <= quota_limit;
end;
$$;

revoke all on function public.consume_ai_generation_quota() from public, anon;
grant execute on function public.consume_ai_generation_quota() to authenticated;

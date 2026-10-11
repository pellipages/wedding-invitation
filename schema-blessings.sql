-- Blessings schema (Supabase / Postgres). Run once in the SQL editor, AFTER schema.sql
-- (it reuses the rate_events table and the rl_check() limiter that schema.sql creates).
--
-- Same access model as the RSVPs: RLS is on with NO policies and every grant is revoked from
-- public/anon/authenticated, so the browser can never read or write this table directly. Only the
-- server (service_role key, which lives in server-side env vars only) can touch it.
-- Rows are never deleted or overwritten by the app: a blessing stays until you delete it yourself.

create table if not exists public.blessings (
  id             uuid primary key default gen_random_uuid(),
  submission_key uuid not null unique,            -- client-generated idempotency key (retries don't duplicate)
  name           text not null default '',        -- '' = the guest chose to stay anonymous
  message        text not null,
  created_at     timestamptz not null default now(),
  constraint blessings_name_len check (char_length(name) <= 100),
  constraint blessings_msg_len  check (char_length(message) between 1 and 1000)
);
create index if not exists blessings_created_idx on public.blessings (created_at desc);

alter table public.blessings enable row level security;
revoke all on public.blessings from public, anon, authenticated;

-- The only write path for guests. Returns 'ok' | 'rate_limited'.
-- Limits: 8 blessings / 10 min per IP (a family on one wifi is fine), 2000 / hour overall.
create or replace function public.submit_blessing(
  p_key uuid, p_name text, p_message text, p_ip_hash text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from blessings where submission_key = p_key) then return 'ok'; end if;  -- retry of same submission
  if not rl_check('blessing_ip',  p_ip_hash, 600, 8)    then return 'rate_limited'; end if;
  if not rl_check('blessing_all', 'global',  3600, 2000) then return 'rate_limited'; end if;
  insert into blessings(submission_key, name, message) values (p_key, p_name, p_message);
  return 'ok';
exception when unique_violation then
  return 'ok';
end $$;

revoke all on function public.submit_blessing(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_blessing(uuid, text, text, text) to service_role;
grant select on public.blessings to service_role;

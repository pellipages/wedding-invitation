-- 001 · Event selector for RSVPs  (Supabase SQL editor — run ONCE, BEFORE deploying the matching code)
--
-- Safe to run against the live database:
--   * purely additive and idempotent (re-running does nothing)
--   * the currently deployed API keeps working afterwards (new parameter has a default,
--     old rows simply get an empty events list)
--
-- Rollback (only if ever needed):
--   alter table public.rsvps drop constraint if exists rsvps_events_chk;
--   alter table public.rsvps drop column if exists events;
--   drop function if exists public.submit_rsvp(uuid, text, int, text, text, text, text[]);
--   -- then re-run the submit_rsvp definition from schema.sql

alter table public.rsvps add column if not exists events text[] not null default '{}';

-- Defence in depth: the API already validates against its allow-list (api/_lib/events.js);
-- this makes the database refuse anything else even if the API were bypassed.
-- If you add an event later, update this list AND api/_lib/events.js AND card/js/data.js.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'rsvps_events_chk') then
    alter table public.rsvps add constraint rsvps_events_chk check (
      events <@ array['pellikuthuru','pellikoduku','haldi','mehendi','sangeeth','pelli']::text[]
      and cardinality(events) <= 6
      and (status <> 'in_spirit' or cardinality(events) = 0)
    );
  end if;
end $$;

-- Replace the single write path with a version that also stores the chosen events.
drop function if exists public.submit_rsvp(uuid, text, int, text, text, text);

create or replace function public.submit_rsvp(
  p_key uuid, p_name text, p_guests int, p_note text, p_status text, p_ip_hash text,
  p_events text[] default '{}')
returns text language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from rsvps where submission_key = p_key) then return 'ok'; end if;  -- retry of same submission
  if not rl_check('rsvp_ip', p_ip_hash, 600, 5) then return 'rate_limited'; end if;
  if not rl_check('rsvp_all', 'global', 3600, 2000) then return 'rate_limited'; end if;
  insert into rsvps(submission_key, name, name_normalized, guests, note, status, events)
  values (p_key, p_name, lower(p_name), p_guests, p_note, p_status,
          coalesce(array(select distinct e from unnest(p_events) as e order by e), '{}'));
  return 'ok';
exception when unique_violation then
  return 'ok';
end $$;

revoke all on function public.submit_rsvp(uuid, text, int, text, text, text, text[]) from public, anon, authenticated;
grant execute on function public.submit_rsvp(uuid, text, int, text, text, text, text[]) to service_role;

-- 002 · RSVP edits: a repeated submission key now UPDATES the guest's row instead of being ignored
-- (Supabase SQL editor — run ONCE, BEFORE deploying the matching client change)
--
-- Safe to run against the live database:
--   * same function signature as 001, so `create or replace` is enough and the API is untouched
--   * the currently deployed client keeps working (its keys are new each visit, so they simply insert)
--   * created_at is never touched on update, so the original submission time is preserved
--
-- Behaviour change: the old "key exists -> return 'ok'" shortcut is gone. A retry of the same
-- request is still harmless (it rewrites identical values), but it now spends one rate-limit slot.
--
-- Rollback: re-run the submit_rsvp definition from migrations/001_rsvp_events.sql.

create or replace function public.submit_rsvp(
  p_key uuid, p_name text, p_guests int, p_note text, p_status text, p_ip_hash text,
  p_events text[] default '{}')
returns text language plpgsql security definer set search_path = public as $$
begin
  if not rl_check('rsvp_ip',  p_ip_hash, 600, 5)    then return 'rate_limited'; end if;
  if not rl_check('rsvp_all', 'global',  3600, 2000) then return 'rate_limited'; end if;

  insert into rsvps(submission_key, name, name_normalized, guests, note, status, events)
  values (p_key, p_name, lower(p_name), p_guests, p_note, p_status,
          coalesce(array(select distinct e from unnest(p_events) as e order by e), '{}'))
  on conflict (submission_key) do update set
    name            = excluded.name,
    name_normalized = excluded.name_normalized,
    guests          = excluded.guests,
    note            = excluded.note,
    status          = excluded.status,
    events          = excluded.events;   -- created_at deliberately left alone
  return 'ok';
end $$;

revoke all on function public.submit_rsvp(uuid, text, int, text, text, text, text[]) from public, anon, authenticated;
grant execute on function public.submit_rsvp(uuid, text, int, text, text, text, text[]) to service_role;

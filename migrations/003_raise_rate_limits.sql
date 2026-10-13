-- 003 · Raise the per-IP limits (Supabase SQL editor — run ONCE, no code deploy needed)
--
-- Why: guests staying at the same venue share one wifi network, so they share one IP address.
-- The old limits (5 RSVPs / 8 blessings per 10 minutes per IP) could lock a roomful of guests out.
--
-- New per-IP limit: 100 per 10 minutes for both RSVPs and blessings.
-- The overall caps are unchanged (2000 per hour for each), so one bad actor still can't flood the table.
--
-- Only the numbers change; everything else is identical to the current definitions.
-- Rollback: re-run submit_rsvp from migrations/002_rsvp_upsert.sql and submit_blessing from schema-blessings.sql.

create or replace function public.submit_rsvp(
  p_key uuid, p_name text, p_guests int, p_note text, p_status text, p_ip_hash text,
  p_events text[] default '{}')
returns text language plpgsql security definer set search_path = public as $$
begin
  if not rl_check('rsvp_ip',  p_ip_hash, 600, 100)   then return 'rate_limited'; end if;
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

create or replace function public.submit_blessing(
  p_key uuid, p_name text, p_message text, p_ip_hash text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from blessings where submission_key = p_key) then return 'ok'; end if;  -- retry of same submission
  if not rl_check('blessing_ip',  p_ip_hash, 600, 100)  then return 'rate_limited'; end if;
  if not rl_check('blessing_all', 'global',  3600, 2000) then return 'rate_limited'; end if;
  insert into blessings(submission_key, name, message) values (p_key, p_name, p_message);
  return 'ok';
exception when unique_violation then
  return 'ok';
end $$;

-- create or replace keeps existing grants, but restating them is harmless and keeps this file self-contained
revoke all on function public.submit_rsvp(uuid, text, int, text, text, text, text[]) from public, anon, authenticated;
grant execute on function public.submit_rsvp(uuid, text, int, text, text, text, text[]) to service_role;
revoke all on function public.submit_blessing(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_blessing(uuid, text, text, text) to service_role;

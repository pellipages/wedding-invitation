-- RSVP schema (Supabase / Postgres). Run once in the SQL editor.
-- Access model: tables are locked down with RLS and NO policies, and all grants are
-- revoked from public/anon/authenticated. Only the server (service_role key, which lives
-- in server-side env vars only) can touch them.

create table if not exists public.rsvps (
  id              uuid primary key default gen_random_uuid(),
  submission_key  uuid not null unique,            -- client-generated idempotency key (retries don't duplicate)
  name            text not null default '',
  name_normalized text not null default '',        -- lowercase, for spotting duplicates in admin view
  guests          smallint not null,
  note            text not null default '',
  status          text not null,
  created_at      timestamptz not null default now(),
  constraint rsvps_status_chk  check (status in ('attending', 'in_spirit')),
  constraint rsvps_name_len    check (char_length(name) <= 100),
  constraint rsvps_note_len    check (char_length(note) <= 500),
  constraint rsvps_guests_rng  check (guests between 0 and 10),
  constraint rsvps_attending   check (status <> 'attending' or (char_length(name) >= 1 and guests >= 1))
);
create index if not exists rsvps_created_idx on public.rsvps (created_at desc);

create table if not exists public.rate_events (
  id      bigint generated always as identity primary key,
  bucket  text not null,
  ip_hash text not null,                           -- HMAC of the IP, never the raw address
  at      timestamptz not null default now()
);
create index if not exists rate_events_lookup_idx on public.rate_events (bucket, ip_hash, at desc);

alter table public.rsvps        enable row level security;
alter table public.rate_events  enable row level security;
revoke all on public.rsvps       from public, anon, authenticated;
revoke all on public.rate_events from public, anon, authenticated;

-- Generic sliding-window limiter. Returns true if the call is allowed (and records it).
create or replace function public.rl_check(p_bucket text, p_ip_hash text, p_window_seconds int, p_max int)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select count(*) into n from rate_events
   where bucket = p_bucket and ip_hash = p_ip_hash
     and at > now() - make_interval(secs => p_window_seconds::double precision);
  if n >= p_max then return false; end if;
  insert into rate_events(bucket, ip_hash) values (p_bucket, p_ip_hash);
  -- opportunistic cleanup keeps the table tiny
  if random() < 0.02 then delete from rate_events where at < now() - interval '1 day'; end if;
  return true;
end $$;

-- The only write path for guests. Returns 'ok' | 'rate_limited'.
-- Limits: 5 submissions / 10 min per IP (shared wifi at a family gathering is fine), 2000 / hour overall.
create or replace function public.submit_rsvp(
  p_key uuid, p_name text, p_guests int, p_note text, p_status text, p_ip_hash text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from rsvps where submission_key = p_key) then return 'ok'; end if;  -- retry of same submission
  if not rl_check('rsvp_ip', p_ip_hash, 600, 5) then return 'rate_limited'; end if;
  if not rl_check('rsvp_all', 'global', 3600, 2000) then return 'rate_limited'; end if;
  insert into rsvps(submission_key, name, name_normalized, guests, note, status)
  values (p_key, p_name, lower(p_name), p_guests, p_note, p_status);
  return 'ok';
exception when unique_violation then
  return 'ok';
end $$;

revoke all on function public.rl_check(text, text, int, int) from public, anon, authenticated;
revoke all on function public.submit_rsvp(uuid, text, int, text, text, text) from public, anon, authenticated;
grant execute on function public.rl_check(text, text, int, int) to service_role;
grant execute on function public.submit_rsvp(uuid, text, int, text, text, text) to service_role;
grant select on public.rsvps to service_role;

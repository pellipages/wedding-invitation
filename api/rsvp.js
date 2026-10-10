import { send, readJson, originAllowed, ipHash, logError } from './_lib/http.js';
import { rpc } from './_lib/db.js';
import { EVENT_KEYS } from './_lib/events.js';

const ALLOWED = new Set(['key', 'name', 'guests', 'note', 'status', 'website', 'events']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// control chars, zero-width and bidi-override characters
const JUNK = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g;

const clean = s => s.normalize('NFC').replace(JUNK, ' ').replace(/\s+/g, ' ').trim();
const len = s => [...s].length;

// undefined -> [] keeps pages cached from before the selector existed working.
// Otherwise: a non-empty array of known, unique event keys (anything else is rejected outright).
function parseEvents(raw) {
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > EVENT_KEYS.size) return null;
  const out = new Set();
  for (const k of raw) {
    if (typeof k !== 'string' || !EVENT_KEYS.has(k)) return null;
    out.add(k);
  }
  return [...out];
}

function validate(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return null;
  if (Object.keys(b).some(k => !ALLOWED.has(k))) return null;
  if (typeof b.key !== 'string' || !UUID.test(b.key)) return null;
  if (b.status !== 'attending' && b.status !== 'in_spirit') return null;
  if (b.website !== undefined && typeof b.website !== 'string') return null;

  if (b.status === 'in_spirit') {
    if (b.events !== undefined) return null; // nothing to attend, so nothing to select
    return { key: b.key.toLowerCase(), name: '', guests: 0, note: '', status: 'in_spirit', events: [] };
  }

  if (typeof b.name !== 'string') return null;
  const name = clean(b.name);
  if (len(name) < 1 || len(name) > 100) return null;

  const guests = b.guests;
  if (!Number.isInteger(guests) || guests < 1 || guests > 10) return null;

  let note = '';
  if (b.note !== undefined) {
    if (typeof b.note !== 'string') return null;
    note = clean(b.note);
    if (len(note) > 500) return null;
  }
  const events = parseEvents(b.events);
  if (!events) return null;
  return { key: b.key.toLowerCase(), name, guests, note, status: 'attending', events };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return send(res, 405, { ok: false }, { Allow: 'POST' });
    if (!originAllowed(req)) return send(res, 403, { ok: false });

    const body = await readJson(req);
    const v = validate(body);
    if (!v) return send(res, 400, { ok: false });

    // Honeypot: real guests never see/fill this field. Pretend success, store nothing.
    if (typeof body.website === 'string' && body.website.length > 0) return send(res, 200, { ok: true });

    const result = await rpc('submit_rsvp', {
      p_key: v.key, p_name: v.name, p_guests: v.guests, p_note: v.note, p_status: v.status, p_ip_hash: ipHash(req), p_events: v.events,
    });
    if (result === 'rate_limited') return send(res, 429, { ok: false }, { 'Retry-After': '600' });
    return send(res, 200, { ok: true });
  } catch (err) {
    logError('rsvp', err);
    return send(res, err?.http ? err.status : 500, { ok: false });
  }
}

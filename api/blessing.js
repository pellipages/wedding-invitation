import { send, readJson, originAllowed, ipHash, logError } from './_lib/http.js';
import { rpc } from './_lib/db.js';

// Public endpoint: any guest may leave a blessing. Mirrors api/rsvp.js (same-origin only,
// strict validation, honeypot, idempotency key, per-IP + global rate limits in the database).
const ALLOWED = new Set(['key', 'name', 'message', 'website']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// control chars (newline is handled separately), zero-width and bidi-override characters
const JUNK = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g;

const MAX_NAME = 100;
const MAX_MESSAGE = 800; // characters; keeps even an all-emoji message inside the 4 KB body cap

const len = s => [...s].length;
const cleanLine = s => s.normalize('NFC').replace(JUNK, ' ').replace(/\s+/g, ' ').trim();
// Blessings are letters: keep paragraph breaks, but tidy everything else.
const cleanMessage = s =>
  s.normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(JUNK, ' ')
    .replace(/[^\S\n]+/g, ' ')
    .split('\n').map(l => l.trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

function validate(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return null;
  if (Object.keys(b).some(k => !ALLOWED.has(k))) return null;
  if (typeof b.key !== 'string' || !UUID.test(b.key)) return null;
  if (b.website !== undefined && typeof b.website !== 'string') return null;

  if (typeof b.message !== 'string') return null;
  const message = cleanMessage(b.message);
  if (len(message) < 1 || len(message) > MAX_MESSAGE) return null;

  let name = ''; // '' = anonymous
  if (b.name !== undefined) {
    if (typeof b.name !== 'string') return null;
    name = cleanLine(b.name);
    if (len(name) > MAX_NAME) return null;
  }
  return { key: b.key.toLowerCase(), name, message };
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

    const result = await rpc('submit_blessing', {
      p_key: v.key, p_name: v.name, p_message: v.message, p_ip_hash: ipHash(req),
    });
    if (result === 'rate_limited') return send(res, 429, { ok: false }, { 'Retry-After': '600' });
    return send(res, 200, { ok: true });
  } catch (err) {
    logError('blessing', err);
    return send(res, err?.http ? err.status : 500, { ok: false });
  }
}

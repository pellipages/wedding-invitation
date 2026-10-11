import { send, originAllowed, ipHash, safeEqual, logError } from './_lib/http.js';
import { rpc, listBlessings } from './_lib/db.js';

// Private endpoint: only the couple can read the collection.
// Access key: BLESSINGS_KEY (>= 12 characters, a passphrase the couple can remember).
// The RSVP ADMIN_TOKEN also works, so the site owner is never locked out.
// Weak or missing keys are ignored, and with no valid key configured the endpoint refuses to run.
function accepted() {
  const out = [];
  const k = process.env.BLESSINGS_KEY, a = process.env.ADMIN_TOKEN;
  if (k && k.length >= 12) out.push(k);
  if (a && a.length >= 32) out.push(a);
  return out;
}

const csvCell = v => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;            // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return send(res, 405, { ok: false }, { Allow: 'GET' });
    if (!originAllowed(req)) return send(res, 403, { ok: false });

    const keys = accepted();
    if (!keys.length) return send(res, 503, { ok: false });

    // Slows down password guessing (every attempt, right or wrong, counts).
    if (!(await rpc('rl_check', { p_bucket: 'blessings_admin', p_ip_hash: ipHash(req), p_window_seconds: 900, p_max: 30 })))
      return send(res, 429, { ok: false });

    const m = /^Bearer (.+)$/.exec(String(req.headers.authorization || ''));
    let ok = false;
    if (m) for (const k of keys) if (safeEqual(m[1], k)) ok = true; // no early exit
    if (!ok) return send(res, 401, { ok: false }, { 'WWW-Authenticate': 'Bearer' });

    const rows = await listBlessings();
    const items = rows.map(r => ({ id: r.id, name: r.name, message: r.message, created_at: r.created_at }));

    if (new URL(req.url, 'http://x').searchParams.get('format') === 'csv') {
      const csv = '\uFEFF' + ['name,message,submitted_at']   // BOM so Excel shows Telugu correctly
        .concat(items.map(i => [i.name || 'A Well-Wisher', i.message, i.created_at].map(csvCell).join(',')))
        .join('\r\n');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="blessings.csv"');
      res.setHeader('Cache-Control', 'no-store');
      return res.end(csv);
    }

    return send(res, 200, { ok: true, total: items.length, blessings: items });
  } catch (err) {
    logError('blessings', err);
    return send(res, 500, { ok: false });
  }
}

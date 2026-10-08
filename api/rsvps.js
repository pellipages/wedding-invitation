import { send, originAllowed, ipHash, safeEqual, logError } from './_lib/http.js';
import { rpc, listRsvps } from './_lib/db.js';

const csvCell = v => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;            // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return send(res, 405, { ok: false }, { Allow: 'GET' });
    if (!originAllowed(req)) return send(res, 403, { ok: false });

    const expected = process.env.ADMIN_TOKEN;
    if (!expected || expected.length < 32) return send(res, 503, { ok: false }); // refuse to run with a weak/missing token

    if (!(await rpc('rl_check', { p_bucket: 'admin', p_ip_hash: ipHash(req), p_window_seconds: 900, p_max: 60 })))
      return send(res, 429, { ok: false });

    const m = /^Bearer (.+)$/.exec(String(req.headers.authorization || ''));
    if (!m || !safeEqual(m[1], expected)) return send(res, 401, { ok: false }, { 'WWW-Authenticate': 'Bearer' });

    const rows = await listRsvps();
    const seen = new Map();
    for (const r of rows) if (r.status === 'attending') seen.set(r.name_normalized, (seen.get(r.name_normalized) || 0) + 1);
    const items = rows.map(r => ({
      id: r.id, name: r.name, guests: r.guests, note: r.note, status: r.status, created_at: r.created_at,
      possible_duplicate: r.status === 'attending' && seen.get(r.name_normalized) > 1,
    }));

    if (new URL(req.url, 'http://x').searchParams.get('format') === 'csv') {
      const csv = ['name,guests,status,note,submitted_at,possible_duplicate']
        .concat(items.map(i => [i.name, i.guests, i.status, i.note, i.created_at, i.possible_duplicate].map(csvCell).join(',')))
        .join('\n');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="rsvps.csv"');
      res.setHeader('Cache-Control', 'no-store');
      return res.end(csv);
    }

    const attending = items.filter(i => i.status === 'attending');
    return send(res, 200, {
      ok: true,
      stats: {
        responses: attending.length,
        total_guests: attending.reduce((s, i) => s + i.guests, 0),
        in_spirit: items.length - attending.length,
      },
      rsvps: items,
    });
  } catch (err) {
    logError('admin', err);
    return send(res, 500, { ok: false });
  }
}

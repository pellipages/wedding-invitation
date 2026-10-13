import { send, safeEqual, logError } from './_lib/http.js';
import { rpc, pingRead } from './_lib/db.js';

// Called once a day by Vercel Cron (see "crons" in vercel.json).
// Supabase free projects pause after ~7 days without database activity, so this generates some:
// one read, plus one row in rate_events (the limiter's disposable log; rl_check cleans old rows
// up on its own). It deliberately never touches rsvps or blessings, so admin totals stay true.
//
// Auth: set CRON_SECRET (16+ random characters) in Vercel env vars. Vercel then sends it as
// "Authorization: Bearer <secret>" on every cron call. With no valid secret the route refuses to run.
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return send(res, 405, { ok: false }, { Allow: 'GET' });

    const expected = process.env.CRON_SECRET;
    if (!expected || expected.length < 16) return send(res, 503, { ok: false });

    const m = /^Bearer (.+)$/.exec(String(req.headers.authorization || ''));
    if (!m || !safeEqual(m[1], expected)) return send(res, 401, { ok: false });

    await pingRead();
    await rpc('rl_check', { p_bucket: 'keepalive', p_ip_hash: 'cron', p_window_seconds: 86400, p_max: 1000 });
    return send(res, 200, { ok: true });
  } catch (err) {
    logError('keepalive', err);   // a 500 shows up as a failed run in Vercel -> Cron Jobs
    return send(res, 500, { ok: false });
  }
}

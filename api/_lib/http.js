import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const MAX_BODY_BYTES = 4096;

export function send(res, status, body, extra = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [k, v] of Object.entries(extra)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

/** Same-origin site: no CORS headers are ever sent. Browsers from other origins are blocked,
 *  and we additionally reject any request whose Origin is not on the allow-list. */
export function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser clients; protected by validation + rate limits instead
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return allowed.includes(origin);
}

export async function readJson(req) {
  const type = String(req.headers['content-type'] || '').toLowerCase();
  if (!type.startsWith('application/json')) throw httpError(415);
  const declared = Number(req.headers['content-length'] || 0);
  if (declared > MAX_BODY_BYTES) throw httpError(413);
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw httpError(413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw httpError(400); }
}

export function httpError(status) { const e = new Error('http'); e.status = status; e.http = true; return e; }

export function clientIp(req) {
  // On Vercel these headers are set by the platform and cannot be spoofed by the client.
  const h = req.headers;
  return String(h['x-vercel-forwarded-for'] || h['x-real-ip'] || (h['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || 'unknown').trim();
}

export function ipHash(req) {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error('IP_HASH_SALT missing');
  return createHmac('sha256', salt).update(clientIp(req)).digest('hex');
}

export function safeEqual(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

/** Log without ever including request bodies or personal data. */
export function logError(tag, err) {
  console.error(`[${tag}]`, err?.status ? `status=${err.status}` : (err?.name || 'Error'), err?.code || '');
}

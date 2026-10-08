// Minimal PostgREST client. Uses the service-role key, which only ever exists in server env vars.
function cfg() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('database not configured');
  return { url: url.replace(/\/$/, ''), key };
}

async function call(path, init) {
  const { url, key } = cfg();
  const r = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init?.headers || {}) },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) { const e = new Error('db'); e.status = r.status; throw e; } // body deliberately not propagated
  return r.json();
}

export const rpc = (fn, args) => call(`rpc/${fn}`, { method: 'POST', body: JSON.stringify(args) });

export const listRsvps = () =>
  call('rsvps?select=id,name,guests,note,status,created_at,name_normalized&order=created_at.desc&limit=2000', { method: 'GET' });

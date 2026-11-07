/**
 * Creates/updates a Supabase Auth admin user (confirmed).
 * Usage:
 *   ADMIN_EMAIL="waseemsamra@gmail.com" ADMIN_PASSWORD="..." node scripts/create-admin-user.mjs
 * Requires in .env.local (or env): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * NEVER commit real passwords.
 */
import fs from 'node:fs';
import path from 'node:path';

function loadEnv(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m || process.env[m[1]]) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  } catch {}
}
loadEnv(path.resolve(process.cwd(), '.env.local'));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!email || !password) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD (pass via env; do not hardcode).');
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  'Content-Type': 'application/json',
};

async function api(method, p, body) {
  const res = await fetch(`${url}/auth/v1${p}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json };
}

const created = await api('POST', '/admin/users', {
  email,
  password,
  email_confirm: true,
  user_metadata: { role: 'admin', name: 'Admin' },
});

if (created.ok) {
  console.log('Created and confirmed admin user:', email, 'id=', created.json?.id);
  process.exit(0);
}

const msg = JSON.stringify(created.json || {});
if (created.status === 422 || /already|exists|registered/i.test(msg)) {
  // Find user and update password
  const list = await api('GET', `/admin/users?email=${encodeURIComponent(email)}`);
  const users = Array.isArray(list.json?.users) ? list.json.users : (Array.isArray(list.json) ? list.json : []);
  const user = users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase()) || users[0];
  if (!user?.id) {
    console.error('User exists/lookup needed but could not find by email.', list.status, list.json);
    process.exit(1);
  }
  const upd = await api('PUT', `/admin/users/${user.id}`, { password, email_confirm: true });
  if (!upd.ok) {
    console.error('Failed to update password:', upd.status, upd.json);
    process.exit(1);
  }
  console.log('Updated password and confirmed existing admin user:', email, 'id=', user.id);
  process.exit(0);
}

console.error('Failed to create user:', created.status, created.json);
process.exit(1);

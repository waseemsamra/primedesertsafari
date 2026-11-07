/**
 * Applies supabase/tours_schema.sql to the remote Supabase Postgres database.
 * Usage: node scripts/apply-db-schema.mjs
 * Reads .env.local for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or DATABASE_URL/SUPABASE_DB_PASSWORD).
 * Never commit secrets.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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

const sqlFile = path.resolve(process.cwd(), 'supabase/tours_schema.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

let dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const pw = process.env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !pw) {
    console.error('Need DATABASE_URL, or NEXT_PUBLIC_SUPABASE_URL + (SUPABASE_DB_PASSWORD or SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
  }
  const ref = new URL(url).hostname.split('.')[0];
  // Supabase pooler (transaction) and direct DB connection strings vary by project.
  // Try direct connection first; if it fails, print instructions.
  dbUrl = `postgresql://postgres.${ref}:${encodeURIComponent(pw)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;
  console.log('Using pooler connection for project', ref);
}

const res = spawnSync('psql', [dbUrl, '-v', 'ON_ERROR_STOP=1', '-f', sqlFile], {
  stdio: 'inherit',
  env: { ...process.env, PGPASSWORD: undefined },
});
if (res.status !== 0) {
  console.error('\nSchema apply failed. If direct/pooler connection is unavailable, run supabase/tours_schema.sql in Supabase Dashboard > SQL Editor.');
  process.exit(res.status || 1);
}
console.log('Schema applied successfully.');

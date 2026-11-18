// Read-only JSON backup of everything users have stored on hosted Supabase, taken before every
// deploy. Files go to backups/<time>/ (git-ignored: they hold personal data, never commit them).
// Supabase's free plan has no downloadable backups, so this is the safety net.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT } from './migrations.mjs';
import { readOnlyQuery } from './remote.mjs';

export const BACKUP_DIR = join(ROOT, 'backups');

const ident = (name) => `"${name.replaceAll('"', '""')}"`;

/** Row counts of every public table (and auth.users), to compare before and after a deploy. */
export function liveCounts() {
  const tables = readOnlyQuery(
    `select table_name as name from information_schema.tables
     where table_schema = 'public' and table_type = 'BASE TABLE' order by 1`,
  ).map((row) => row.name);
  const parts = [
    ...tables.map((t) => `select 'public.${t}' as name, count(*)::int as n from public.${ident(t)}`),
    `select 'auth.users', count(*)::int from auth.users`,
  ];
  const rows = readOnlyQuery(parts.join(' union all '));
  return { tables, counts: Object.fromEntries(rows.map((r) => [r.name, r.n])) };
}

/**
 * Saves every row of every public table, the auth users (no password hashes) and the migration
 * history as JSON. Throws if any table comes back with fewer rows than it has.
 */
export function backupRemote(projectRef) {
  const { tables, counts } = liveCounts();
  const sources = [
    ...tables.map((t) => [`public.${t}`, `select coalesce(json_agg(x), '[]'::json) from public.${ident(t)} x`]),
    [
      'auth.users',
      `select coalesce(json_agg(x), '[]'::json) from (select id, email, phone, created_at, last_sign_in_at,
        is_anonymous, raw_user_meta_data, raw_app_meta_data from auth.users) x`,
    ],
    [
      'supabase_migrations.schema_migrations',
      `select coalesce(json_agg(x), '[]'::json) from (select version, name from supabase_migrations.schema_migrations) x`,
    ],
  ];
  const [row] = readOnlyQuery(`select ${sources.map(([, sql], i) => `(${sql}) as t${i}`).join(', ')}`);

  const takenAt = new Date().toISOString();
  const dir = join(BACKUP_DIR, takenAt.replace(/[:.]/g, '-'));
  mkdirSync(dir, { recursive: true });
  const saved = {};
  sources.forEach(([name], i) => {
    const rows = row?.[`t${i}`] ?? [];
    if (name in counts && rows.length < counts[name]) {
      throw new Error(`Backup of ${name} has ${rows.length} rows but the table has ${counts[name]}.`);
    }
    writeFileSync(join(dir, `${name}.json`), JSON.stringify(rows, null, 1));
    saved[name] = rows.length;
  });
  writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify({ takenAt, project: projectRef, rows: saved }, null, 2)}\n`);
  return { dir, rows: saved };
}

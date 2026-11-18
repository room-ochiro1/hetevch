// Local migration files and the record of which ones are live on the hosted project.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

export const ROOT = join(import.meta.dirname, '..', '..');
export const MIGRATIONS_DIR = join(ROOT, 'supabase', 'migrations');
/** Versions applied on hosted Supabase, written by `pnpm db:deploy` (committed, no secrets). */
export const DEPLOYED_FILE = join(ROOT, 'supabase', 'deployed.json');

/** `20261118130000_admin_age_filter.sql` → { version, name, file } (oldest first). */
export function localMigrations() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => /^\d{14}_.+\.sql$/.test(name))
    .sort()
    .map((name) => ({ version: name.slice(0, 14), name: name.slice(15, -4), file: join(MIGRATIONS_DIR, name) }));
}

export function versionOf(path) {
  const match = /^(\d{14})_.+\.sql$/.exec(basename(path));
  return match ? match[1] : null;
}

export function isMigrationPath(path) {
  return /(^|[\\/])supabase[\\/]migrations[\\/]\d{14}_[^\\/]+\.sql$/.test(path);
}

/** Versions known to be live, or null when no deploy has been recorded yet. */
export function readDeployed() {
  if (!existsSync(DEPLOYED_FILE)) return null;
  try {
    const data = JSON.parse(readFileSync(DEPLOYED_FILE, 'utf8'));
    return Array.isArray(data.versions) ? new Set(data.versions.map(String)) : null;
  } catch {
    return null;
  }
}

export function writeDeployed(versions, projectRef) {
  const body = {
    note: 'Migrations live on hosted Supabase. Written by `pnpm db:deploy`; do not edit by hand.',
    project: projectRef,
    versions: [...versions].sort(),
  };
  writeFileSync(DEPLOYED_FILE, `${JSON.stringify(body, null, 2)}\n`);
}

/** Local migrations that aren't recorded as deployed (all but the newest when nothing is recorded). */
export function undeployedMigrations() {
  const all = localMigrations();
  const deployed = readDeployed();
  if (!deployed) return all.slice(-1);
  return all.filter((m) => !deployed.has(m.version));
}

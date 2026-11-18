// Thin wrappers over the Supabase CLI for the linked hosted project. Runs the CLI with node
// directly (no shell), so SQL text never passes through shell quoting.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { ROOT } from './migrations.mjs';

const require = createRequire(import.meta.url);
const pkgPath = require.resolve('supabase/package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const CLI = join(dirname(pkgPath), typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.supabase);

const quiet = (text) =>
  text
    .split('\n')
    .filter((line) => !/new version of Supabase CLI|recommend updating regularly/i.test(line))
    .join('\n')
    .trim();

/** Runs `supabase <args>`; returns stdout (plus stderr with `all`), throws with the CLI's message on failure. */
export function cli(args, { all = false } = {}) {
  const result = spawnSync(process.execPath, [CLI, ...args, '--agent', 'no'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`supabase ${args.slice(0, 3).join(' ')} failed:\n${quiet(`${result.stderr}\n${result.stdout}`)}`);
  }
  return all ? `${result.stderr}
${result.stdout}` : result.stdout;
}

export function projectRef() {
  const file = join(ROOT, 'supabase', '.temp', 'project-ref');
  if (!existsSync(file)) {
    throw new Error('This repo is not linked to a Supabase project. Run: npx supabase login && npx supabase link');
  }
  return readFileSync(file, 'utf8').trim();
}

/** Every migration known locally or on hosted: { local, remote } versions (one may be empty). */
export function migrationList() {
  const data = JSON.parse(cli(['migration', 'list', '--remote', '--output-format', 'json']));
  return (data.migrations ?? []).map((m) => ({ local: m.local || null, remote: m.remote || null }));
}

/** A read-only SQL query on hosted; the rows as parsed JSON. Cannot change anything. */
export function readOnlyQuery(sql) {
  return JSON.parse(cli(['db', 'query', '--remote', '--read-only', '--output-format', 'json', sql]));
}

/** `supabase db push` of every local migration missing on hosted. Returns the CLI's text. */
export function push({ dryRun }) {
  return quiet(cli(['db', 'push', '--remote', '--include-all', dryRun ? '--dry-run' : '--yes'], { all: true }));
}

/** TypeScript types of the hosted schema (packages/shared/src/database.types.ts content). */
export function generatedTypes() {
  const text = cli(['gen', 'types', 'typescript', '--remote']);
  if (!text.includes('export type Database')) throw new Error('Type generation returned no Database type.');
  return text;
}

// Offline safety check for database migrations (part of `pnpm check`, and step 1 of db:deploy).
//   1. Guard: pending migrations must not contain SQL that loses user data.
//   2. PGlite: the migrations already live are applied to an empty Postgres with sample users
//      and their data, then the pending ones; nothing may disappear, and every table needs RLS.
// Usage: node scripts/db-check.mjs [--pending=<version>,<version>]
//   Without --pending, pending = local migrations missing from supabase/deployed.json.
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';

import { applyMigration, createDb, lostData, seedFixture, snapshot, tablesWithoutRls } from './db/pglite-env.mjs';
import { ROOT, localMigrations, readDeployed, undeployedMigrations } from './db/migrations.mjs';
import { APPROVAL, blockingFindings, formatFindings } from './db/sql-guard.mjs';

const arg = process.argv.find((a) => a.startsWith('--pending='));
const all = localMigrations();
const pending = arg
  ? all.filter((m) => arg.slice(10).split(',').includes(m.version))
  : undeployedMigrations();
const pendingSet = new Set(pending.map((m) => m.version));
const errors = [];

// 1. Guard
for (const m of pending) {
  const findings = blockingFindings(readFileSync(m.file, 'utf8'));
  if (findings.length) errors.push(formatFindings(relative(ROOT, m.file), findings));
}
const approvedLoss = pending.some((m) => APPROVAL.test(readFileSync(m.file, 'utf8')));

// 2. PGlite: live migrations → sample data → pending migrations
const db = await createDb();
let skipped = [];
let lost = [];
try {
  for (const m of all.filter((x) => !pendingSet.has(x.version))) await applyMigration(db, m);
  skipped = await seedFixture(db);
  const before = await snapshot(db);
  for (const m of pending) await applyMigration(db, m);
  lost = lostData(before, await snapshot(db));
  const noRls = await tablesWithoutRls(db);
  if (noRls.length) errors.push(`Tables without row level security: ${noRls.join(', ')} (enable RLS and add policies).`);
} catch (error) {
  errors.push(`Migrations don't apply cleanly: ${error.message}`);
}
if (lost.length && !approvedLoss) {
  errors.push(`Sample user data was lost by the pending migrations:\n${lost.map((l) => `  • ${l}`).join('\n')}`);
}
await db.close();

const names = pending.map((m) => `${m.version}_${m.name}`);
console.log(`db:check — ${all.length} migrations apply on an empty Postgres; pending: ${names.length ? names.join(', ') : 'none'}`);
if (skipped.length) console.log(`  (sample data steps skipped: ${skipped.join('; ')})`);
if (lost.length && approvedLoss) console.log(`  approved data loss:\n${lost.map((l) => `    • ${l}`).join('\n')}`);
if (errors.length) {
  console.error(`\n${errors.join('\n\n')}`);
  process.exit(1);
}
if (!arg && names.length && readDeployed()) {
  console.log(`  ⚠ Not on hosted Supabase yet: ${names.join(', ')}. Run \`pnpm db:deploy\`.`);
}
console.log('  ok: no data-losing SQL, sample data intact, RLS on every table');

// pnpm db:deploy — the one way schema changes reach hosted Supabase. Stops at the first problem.
//   1. Compare local migrations with hosted (refuse if hosted has changes the repo doesn't).
//   2. Offline check: no data-losing SQL, migrations apply over sample data, RLS everywhere.
//   3. Read-only JSON backup of all live data → backups/<time>/ (git-ignored).
//   4. Dry run, then apply the pending migrations.
//   5. Verify they're recorded, row counts didn't drop, write supabase/deployed.json and
//      regenerate packages/shared/src/database.types.ts.
// Flag: --dry-run runs steps 1–4 without applying anything.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { backupRemote, liveCounts } from './db/backup.mjs';
import { ROOT, writeDeployed } from './db/migrations.mjs';
import { generatedTypes, migrationList, projectRef, push } from './db/remote.mjs';

const dryRun = process.argv.includes('--dry-run');
const TYPES_FILE = join(ROOT, 'packages', 'shared', 'src', 'database.types.ts');
const step = (text) => console.log(`\n▸ ${text}`);

function stop(message) {
  console.error(`\n✖ ${message}\nStopped here. \`pnpm db:status\` shows what is live.`);
  process.exit(1);
}

function writeTypes() {
  writeFileSync(TYPES_FILE, generatedTypes());
  console.log(`  types regenerated → ${relative(ROOT, TYPES_FILE)}`);
}

try {
  const ref = projectRef();
  step(`Comparing supabase/migrations with hosted project ${ref}`);
  const list = migrationList();
  const remoteOnly = list.filter((m) => m.remote && !m.local).map((m) => m.remote);
  if (remoteOnly.length) {
    stop(
      `Hosted has migrations this repo doesn't: ${remoteOnly.join(', ')}.\n` +
        'Someone changed the database outside the repo. Add those migration files first; never deploy over them.',
    );
  }
  const pending = list.filter((m) => m.local && !m.remote).map((m) => m.local);
  const live = list.filter((m) => m.remote).map((m) => m.remote);
  if (pending.length === 0) {
    writeDeployed(live, ref);
    console.log(`  hosted is up to date (${live.length} migrations)`);
    process.exit(0);
  }
  console.log(`  pending: ${pending.join(', ')}`);

  step('Offline safety check (PGlite)');
  const check = spawnSync(process.execPath, [join(ROOT, 'scripts', 'db-check.mjs'), `--pending=${pending.join(',')}`], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (check.status !== 0) stop('The offline check failed (see above). Fix the migration and run pnpm db:deploy again.');

  step('Backing up live data (read-only)');
  const backup = backupRemote(ref);
  const total = Object.values(backup.rows).reduce((sum, n) => sum + n, 0);
  console.log(`  ${total} rows in ${Object.keys(backup.rows).length} tables → ${relative(ROOT, backup.dir)}`);

  step('Dry run');
  console.log(push({ dryRun: true }).replace(/^/gm, '  '));
  if (dryRun) {
    console.log('\n--dry-run: stopping before applying anything.');
    process.exit(0);
  }

  step('Applying');
  console.log(push({ dryRun: false }).replace(/^/gm, '  '));

  step('Verifying');
  const after = migrationList();
  const missing = pending.filter((v) => !after.some((m) => m.remote === v));
  if (missing.length) stop(`Not recorded on hosted after the push: ${missing.join(', ')}. Check the output above.`);
  writeDeployed(after.filter((m) => m.remote).map((m) => m.remote), ref);
  const { counts } = liveCounts();
  const dropped = Object.entries(backup.rows)
    .filter(([name, n]) => name in counts && counts[name] < n)
    .map(([name, n]) => `${name}: ${n} → ${counts[name]}`);
  if (dropped.length) {
    console.error(`  ⚠ Row counts dropped (${dropped.join('; ')}). Users may have deleted rows meanwhile;`);
    console.error(`    if not, restore them from ${relative(ROOT, backup.dir)}.`);
  } else {
    console.log('  every table still has all its rows');
  }
  writeTypes();
  console.log(`\n✔ Deployed ${pending.length} migration(s). Run pnpm check next.`);
} catch (error) {
  stop(error instanceof Error ? error.message : String(error));
}

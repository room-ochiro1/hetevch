// `pnpm db:reset` → `supabase db reset` on the LOCAL Docker database only. The CLI's reset also
// accepts --remote, which would wipe every real user's data on the hosted project; this wrapper
// refuses any flag that points it away from the local database.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const args = process.argv.slice(2);
const remote = args.find((a) => /^--(remote|linked|db-url|project-ref)\b/.test(a));
if (remote) {
  console.error(`Refusing \`db reset ${remote}\`: it would erase the hosted database. Only local resets are allowed.`);
  process.exit(1);
}

const require = createRequire(import.meta.url);
const pkgPath = require.resolve('supabase/package.json');
const { bin } = JSON.parse(readFileSync(pkgPath, 'utf8'));
const cli = join(dirname(pkgPath), typeof bin === 'string' ? bin : bin.supabase);
const result = spawnSync(process.execPath, [cli, 'db', 'reset', ...args], { stdio: 'inherit' });
process.exit(result.status ?? 1);

// PostToolUse hook: after Claude writes or edits a file in supabase/migrations/, block (exit 2,
// stderr goes back to Claude) when the file
//   • is already live on hosted Supabase (supabase/deployed.json): editing it changes nothing
//     there and makes the repo lie about the database; write a new migration instead, or
//   • contains SQL that can lose user data without an owner-approved
//     "-- data-loss-approved: …" line.
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';

import { ROOT, isMigrationPath, readDeployed, versionOf } from '../../scripts/db/migrations.mjs';
import { blockingFindings, formatFindings } from '../../scripts/db/sql-guard.mjs';

let filePath;
try {
  filePath = JSON.parse(readFileSync(0, 'utf8'))?.tool_input?.file_path;
} catch {
  process.exit(0);
}
if (typeof filePath !== 'string' || !isMigrationPath(filePath)) process.exit(0);

const name = relative(ROOT, filePath);
const version = versionOf(filePath);
if (version && readDeployed()?.has(version)) {
  console.error(
    `${name} is already applied on hosted Supabase. Changing it has no effect there and hides ` +
      'what the live database really is. Undo this edit and put the change in a new ' +
      'migration: pnpm db:migration <name>.',
  );
  process.exit(2);
}

let sql = '';
try {
  sql = readFileSync(filePath, 'utf8');
} catch {
  process.exit(0);
}
const findings = blockingFindings(sql);
if (findings.length) {
  console.error(formatFindings(name, findings));
  process.exit(2);
}

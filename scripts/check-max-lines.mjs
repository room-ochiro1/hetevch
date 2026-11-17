// Fails when any source file in the repo is longer than MAX_LINES. Run: pnpm check:lines
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { EXCLUDED_DIRS, MAX_LINES, countLines, isCheckedFile } from './max-lines.mjs';

const root = join(import.meta.dirname, '..');

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) yield* walk(join(dir, entry.name));
    } else {
      yield join(dir, entry.name);
    }
  }
}

const offenders = [];
for (const file of walk(root)) {
  const path = relative(root, file);
  if (!isCheckedFile(path)) continue;
  const lines = countLines(readFileSync(file, 'utf8'));
  if (lines > MAX_LINES) offenders.push(`  ${path}: ${lines} lines`);
}

if (offenders.length > 0) {
  console.error(`Files over ${MAX_LINES} lines (split them):\n${offenders.join('\n')}`);
  process.exit(1);
}
console.log(`All source files are within ${MAX_LINES} lines.`);

// PostToolUse hook: after Claude writes or edits a source file, block if it exceeds the line limit.
// Exit code 2 sends stderr back to Claude so it splits the file right away.
import { readFileSync } from 'node:fs';

import { MAX_LINES, countLines, isCheckedFile } from '../../scripts/max-lines.mjs';

let filePath;
try {
  filePath = JSON.parse(readFileSync(0, 'utf8'))?.tool_input?.file_path;
} catch {
  process.exit(0);
}

if (typeof filePath === 'string' && isCheckedFile(filePath)) {
  let text = '';
  try {
    text = readFileSync(filePath, 'utf8');
  } catch {
    process.exit(0);
  }
  const lines = countLines(text);
  if (lines > MAX_LINES) {
    console.error(
      `${filePath} has ${lines} lines; the project limit is ${MAX_LINES}. ` +
        'Split it now (see the split-file skill) before continuing.',
    );
    process.exit(2);
  }
}

// Shared by scripts/check-max-lines.mjs and the Claude Code hook in .claude/hooks.
export const MAX_LINES = 160;

const CODE_FILE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const EXCLUDED_FILE = /(\.d\.ts|database\.types\.ts)$/;
export const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', '.next', '.expo', '.turbo', '.vercel', 'dist', 'build', 'android', 'ios',
]);

export function isCheckedFile(path) {
  const normalized = path.replaceAll('\\', '/');
  if (normalized.split('/').some((part) => EXCLUDED_DIRS.has(part))) return false;
  return CODE_FILE.test(normalized) && !EXCLUDED_FILE.test(normalized);
}

/** Counts lines the way ESLint's max-lines does (a final newline adds no line). */
export function countLines(text) {
  if (text.length === 0) return 0;
  const lines = text.split(/\r?\n/);
  return lines.at(-1) === '' ? lines.length - 1 : lines.length;
}

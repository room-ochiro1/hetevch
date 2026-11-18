// Finds SQL in a migration that can lose stored data (rows, columns, whole tables).
// Shared by the Claude Code hook, `pnpm db:check` and `pnpm db:deploy`.
//
// What runs at migration time is checked; function bodies are skipped because they only run
// when the app calls them (e.g. delete_my_account deletes the caller's own account on request).
// A migration that really must remove data needs the line
//   -- data-loss-approved: <what is removed and why>
// which may only be added after the owner has approved it in writing.

export const APPROVAL = /^[ \t]*--[ \t]*data-loss-approved:[ \t]*\S/im;

const RULES = [
  { re: /\bdrop\s+(table|schema|database)\b/i, why: 'drops a table/schema with every row in it' },
  { re: /\btruncate\b/i, why: 'empties a table' },
  { re: /\bdelete\s+from\b/i, why: 'deletes rows' },
  { re: /\bdrop\s+column\b/i, why: 'drops a column and all its values' },
  { re: /\balter\s+column\s+("[^"]+"|\w+)\s+(set\s+data\s+)?type\b/i, why: 'changes a column type (values can be cut or rejected)' },
  { re: /\bdrop\b[\s\S]*\bcascade\b/i, why: 'DROP … CASCADE also drops whatever depends on it (columns, views, tables)' },
  { re: /^\s*(with\b[\s\S]*\)\s*)?update\b(?![\s\S]*\bwhere\b)/i, why: 'UPDATE without WHERE rewrites every row' },
  { re: /\balter\s+table\b[\s\S]*\brename\s+to\b/i, why: 'renames a table (the apps lose access to its data until updated)' },
];

/** Removes what never runs at migration time or can't hold SQL: function bodies, comments, strings. */
export function stripSql(sql) {
  return sql
    .replace(/(create\s+(or\s+replace\s+)?(function|procedure)\b[\s\S]*?)(\$\w*\$)[\s\S]*?\4/gi, '$1<body>')
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'(?:[^']|'')*'/g, "''");
}

/** Statements that can lose data, each with a reason. Empty = safe. */
export function findDataLoss(sql) {
  const findings = [];
  for (const raw of stripSql(sql).split(';')) {
    const statement = raw.replace(/\s+/g, ' ').trim();
    if (!statement) continue;
    for (const rule of RULES) {
      if (rule.re.test(statement)) findings.push({ statement: statement.slice(0, 120), why: rule.why });
    }
  }
  return findings;
}

/** Findings that block: data-losing statements in a migration without the approval line. */
export function blockingFindings(sql) {
  return APPROVAL.test(sql) ? [] : findDataLoss(sql);
}

export function formatFindings(file, findings) {
  return [
    `${file} can lose user data:`,
    ...findings.map((f) => `  • ${f.why}\n      ${f.statement}`),
    '  Keep data instead: add a column/table, backfill, mark rows as archived, or rename in a new',
    '  migration that copies. Only if the owner approved this in writing, add the line',
    '  "-- data-loss-approved: <what and why>" to the migration.',
  ].join('\n');
}

---
name: split-file
description: Split a TypeScript/TSX file that is over or close to the 160-line limit in Hetevch. Use when the line-limit hook, ESLint max-lines, or pnpm check:lines reports a file over 160 lines, or before adding code to a file that is already ~130+ lines.
---

# Split a file over 160 lines

The limit exists to keep each file about one thing. Split by responsibility, never by cutting the file in half.

## How to choose the seams

| File is mostly…                     | Move out                                                    |
| ----------------------------------- | ----------------------------------------------------------- |
| A screen/page with several sections | Each section → `components/<area>/<section>.tsx`            |
| A component with long logic         | State + effects → `hooks/use-<thing>.ts`                    |
| A form                              | Validation → `<form>-schema.ts`; fields → `<form>-fields.tsx` |
| A DAL/service with many queries     | One file per entity: `dal/users.ts`, `dal/transactions.ts`  |
| Large constant maps / options       | `constants/<name>.ts`                                       |
| Many small types                    | `types.ts` next to the code, or `packages/shared` if shared |
| React Native `StyleSheet` that is huge | Usually a sign the component itself should be split      |

## Steps

1. Read the whole file and list its responsibilities.
2. Move each extra responsibility into its own file with a clear name; export only what callers need.
3. Update imports (use the `@/` alias). Do not leave re-export shims behind.
4. Do not change behaviour while splitting.
5. Run `pnpm check` (line limit + lint + typecheck).

## Don't

- Don't squash code onto fewer lines, remove blank lines, or delete useful comments to get under the limit.
- Don't disable `max-lines` with an eslint comment.
- Don't create `utils2.ts`-style dumping grounds.

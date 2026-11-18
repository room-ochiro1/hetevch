# Хэтэвч (Hetevch)

A wallet app. Users get an Android/iOS app; the owner alone uses a web admin dashboard.

## Layout

```
apps/web        Next.js 16 admin dashboard (owner only) → deployed on Vercel
apps/mobile     Expo SDK 58 user app (Android + iOS) → built with EAS
packages/shared Types and helpers used by both apps (@hetevch/shared)
supabase/       Supabase config, SQL migrations (Postgres + Auth + RLS)
scripts/        Repo tooling (line-limit check, db:check / db:deploy and their helpers in scripts/db/)
.claude/        Claude Code settings, hooks and project skills
```

Each app has its own CLAUDE.md with app-specific rules; read it before working there.

## Hard rules

1. **TypeScript everywhere**, `strict` on. No `any`; use `unknown` and narrow.
2. **Max 160 lines per source file** (`.ts/.tsx/.js/.mjs`). Enforced by ESLint `max-lines`, `pnpm check:lines`, and a PostToolUse hook that blocks oversized writes. Split by responsibility *before* you reach the limit — see the `split-file` skill. Generated files (`*.d.ts`, `database.types.ts`) are exempt.
3. **Web is admin-only.** Every admin data read goes through `apps/web/src/lib/dal/*`, which calls `requireAdmin()` first. Admin = `profiles.role = 'admin'`.
4. **Mobile is for end users** and talks to Supabase as the signed-in user. Never put a Supabase secret key in the mobile app or in any `NEXT_PUBLIC_*` / `EXPO_PUBLIC_*` variable.
5. **Database changes only through migrations** in `supabase/migrations/`, with RLS enabled on every new table, deployed by running `pnpm db:deploy` yourself (automatic by the owner's request; it backs up, applies, verifies and regenerates types). Never paste SQL into the dashboard or run `supabase db push` directly. See the `supabase-migration` skill.
6. Types/helpers needed by both apps live in `packages/shared`, not copied.
7. UI text is Mongolian (Cyrillic). Code, comments and commit messages are English.
8. Never commit `.env` files. Templates live in `apps/*/.env.example`.
9. **Never lose real users' data.** No migration may drop/truncate/delete/retype stored data or edit an already-deployed migration; the guard in `scripts/db/sql-guard.mjs` (hook + `db:check` + `db:deploy`) enforces it. Only the owner can approve a removal, in writing, via a `-- data-loss-approved:` line. Never reset, delete or re-link the hosted project. Backups in `backups/` are personal data: never read or commit them.

## Commands (run from repo root)

```bash
pnpm install              # install everything (pnpm workspaces, hoisted)
pnpm dev:web              # admin dashboard on http://localhost:3000
pnpm dev:mobile           # Expo dev server (press a / i for Android / iOS)
pnpm db:start             # local Supabase (needs Docker)
pnpm db:reset             # re-apply all migrations locally (refuses --remote)
pnpm db:migration <name>  # new empty migration file
pnpm db:status            # which migrations the hosted project has (CLI is linked to it)
pnpm db:check             # offline: guard + all migrations on PGlite with sample user data + RLS check
pnpm db:deploy            # check → backup → dry run → apply → verify → types (db:push is the same)
pnpm db:types             # regenerate packages/shared/src/database.types.ts from the hosted project
pnpm db:types:local       # same, from the local Docker stack
pnpm check                # line limit + db:check + lint + typecheck (run before saying "done")
pnpm build                # production build of the web app
```

Add dependencies with `pnpm --filter @hetevch/web add <pkg>` (web) or `npx expo install <pkg>` inside `apps/mobile` (mobile, picks SDK-compatible versions).

## Definition of done

`pnpm check` passes, new tables have RLS policies, new migrations are live via `pnpm db:deploy` (`pnpm db:check` warns about undeployed ones), and `pnpm build` passes when web code changed.

## Project skills (`.claude/skills/`)

- `new-feature` — end-to-end: migration → types → admin page → mobile screen
- `supabase-migration` — tables, RLS, types, `pnpm db:deploy`, data-safety rules
- `admin-page` — a new page in the admin dashboard
- `mobile-screen` — a new screen in the Expo app
- `split-file` — how to break up a file that is near 160 lines
- `deploy` — Vercel (web) and EAS (mobile)
- `research` — research UX, finance facts and APIs before building; cite sources (findings log inside)
- `hosted-sql` — fallback only when the repo isn't linked to Supabase (paste script + PGlite dry run)
- `verify-mobile` — prove a mobile change works: Metro bundle, routes, emulator screenshots/logs
- `money-and-dates` — base currency ₮, `useMoney()`, interest method, Mongolian dates

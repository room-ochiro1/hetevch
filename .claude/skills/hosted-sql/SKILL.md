---
name: hosted-sql
description: Apply Hetevch migrations to the hosted Supabase project when the Supabase CLI cannot log in (non-interactive sessions) — build one paste-ready SQL script, dry-run it in PGlite, copy it to the clipboard and send the user to the SQL Editor. Use after writing a migration the user needs live, or when the user says the app shows "table not found" errors.
---

# Apply migrations to hosted Supabase (no CLI)

`supabase login` needs a browser/TTY, so in these sessions the user pastes SQL into the dashboard. Make that paste impossible to get wrong.

## Steps

1. **Write the migration first** (`supabase-migration` skill). The file in `supabase/migrations/` stays the source of truth; the paste script is derived from it, never the other way round.
2. **Build the paste script** in the scratchpad (not the repo):
   - `begin;` … `commit;` around everything, so a failure leaves nothing half-applied.
   - Include every migration not yet confirmed as applied, oldest first.
   - If unsure whether an earlier one ran, make that part re-runnable: `create or replace function`, `create table if not exists`, `create index if not exists`, `create or replace trigger`, `drop policy if exists` before `create policy`, and `do $$ begin create type …; exception when duplicate_object then null; end $$;`.
   - Record them: `insert into supabase_migrations.schema_migrations (version, name) values (…) on conflict do nothing;`
   - End with a harmless `select` that proves it worked (e.g. a row count of the new table).
3. **Dry-run in PGlite** (in-memory Postgres) before handing it over:
   - Once per machine: `npm i @electric-sql/pglite` in a scratch folder.
   - Stub Supabase: roles `anon` / `authenticated`, schema `auth` with `auth.users` and `auth.uid()` reading `request.jwt.claim.sub`, schema `supabase_migrations` with `schema_migrations(version text primary key, name text)`.
   - Run every earlier migration, then the paste script. Test both "never applied" and "already applied" starting points when the script has re-runnable parts.
   - Exercise RLS as two users and an admin (`set role authenticated` + `set_config('request.jwt.claim.sub', …)`): own rows only, no writes into another user's rows, admin read-only.
4. **Hand it over**: copy with PowerShell `Get-Content -Raw -Encoding utf8 <file> | Set-Clipboard`, then tell the user: open the project's SQL Editor (`https://supabase.com/dashboard/project/<ref>/sql/new`; the ref is the subdomain of the Supabase URL in the app's env), paste, Run. Say what breaks until they do.
5. If the user reports an error, read it, confirm the transaction rolled back, fix the script and repeat; never ask them to run fragments by hand.

## Rules

- Never put emails, passwords or keys in the script; the repo is public.
- New migration timestamps must sort after every applied one (check `supabase/migrations/`).
- After it runs, `packages/shared/src/database.types.ts` must match (hand-edit until `pnpm db:types` can run).

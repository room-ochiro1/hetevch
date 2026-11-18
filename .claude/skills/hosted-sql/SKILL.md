---
name: hosted-sql
description: Fallback only — apply Hetevch migrations to hosted Supabase through the SQL Editor when the repo is NOT linked to the project (no supabase/.temp/project-ref, or `pnpm db:deploy` says it isn't linked). Normally use `pnpm db:deploy` (supabase-migration skill) instead.
---

# Apply migrations to hosted Supabase without the CLI (fallback)

The normal path is `pnpm db:deploy`, which checks, backs up, applies and verifies automatically. Use this skill only when that is impossible because the repo isn't linked (`npx supabase login` + `npx supabase link` need the user's browser). Ask the user to link first; this is the fallback while they can't.

## Steps

1. **Write the migration first** (`supabase-migration` skill) and run `pnpm db:check`. The file in `supabase/migrations/` stays the source of truth; the paste script is derived from it.
2. **Build the paste script** in the scratchpad (not the repo):
   - `begin;` … `commit;` around everything, so a failure leaves nothing half-applied.
   - Include every migration not in `supabase/deployed.json`, oldest first.
   - Make it re-runnable: `create or replace function`, `create table if not exists`, `create index if not exists`, `create or replace trigger`, `drop policy if exists` before `create policy`, `do $$ begin create type …; exception when duplicate_object then null; end $$;`.
   - Record them: `insert into supabase_migrations.schema_migrations (version, name) values (…) on conflict do nothing;`
   - End with a harmless `select` that proves it worked.
   - The data-safety rules of the supabase-migration skill apply unchanged: no data-losing SQL.
3. **Dry-run in PGlite**: `scripts/db/pglite-env.mjs` gives a Supabase-shaped in-memory Postgres (`createDb`, `applyMigration`, `seedFixture`, `snapshot`, `lostData`). Apply the migrations already live, seed, run the paste script twice, and confirm nothing was lost.
4. **Hand it over**: copy with PowerShell `Get-Content -Raw -Encoding utf8 <file> | Set-Clipboard`, then tell the user: open `https://supabase.com/dashboard/project/<ref>/sql/new`, paste, Run. Say what breaks until they do.
5. If the user reports an error, read it, confirm the transaction rolled back, fix the script and repeat; never ask them to run fragments by hand.
6. Once the repo is linked again, run `pnpm db:deploy`: it finds nothing pending, records `supabase/deployed.json` and regenerates types.

## Rules

- Never put emails, passwords or keys in the script; the repo is public.
- New migration timestamps must sort after every applied one (check `supabase/migrations/`).

---
name: supabase-migration
description: Create or change Supabase database tables, columns, functions or RLS policies for Hetevch, and deploy them to hosted Supabase. Use whenever a task needs a schema change, a new table, a policy, or regenerated database types.
---

# Supabase migration

All schema changes go through SQL migrations in `supabase/migrations/` and reach hosted Supabase only through `pnpm db:deploy`. Never change the hosted database by hand (no SQL Editor pastes, no direct `supabase db push`).

**Real users' data must never be lost.** Every change is additive unless the owner approves otherwise in writing (see Data safety).

## Steps

1. Create the file: `pnpm db:migration <snake_case_name>` (writes `supabase/migrations/<timestamp>_<name>.sql`).
2. Write the SQL. For every new table:
   - `id uuid primary key default gen_random_uuid()`
   - `created_at timestamptz not null default now()`
   - `user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade` for user-owned rows
   - `alter table ... enable row level security;` — **always**
   - policies: users access only their own rows (`(select auth.uid()) = user_id`); admins read all with `(select public.is_admin())`
   - an index on every foreign key column
3. Check offline: `pnpm db:check` (also part of `pnpm check`). It applies every migration to an in-memory Postgres (PGlite) holding sample users with transactions, savings cards, device links and consents, then fails if the new migration has data-losing SQL, doesn't apply, loses any sample row/column/table, or leaves a table without RLS.
4. Deploy it yourself, right away: `pnpm db:deploy`. The owner asked for this to be automatic (2026-11-18): don't ask first and don't hand the user SQL to paste. It compares with hosted, re-runs the check, backs up all live data read-only to `backups/<time>/`, dry-runs, applies, verifies the row counts, updates `supabase/deployed.json` and regenerates `packages/shared/src/database.types.ts`. `pnpm db:deploy --dry-run` stops before applying.
5. Export friendly aliases from `packages/shared/src/index.ts`, e.g. `export type Transaction = TableRow<'transactions'>;`
6. Run `pnpm check`. If `db:deploy` stops, read its message, fix the cause (in a new migration if anything is already live) and deploy again.

`pnpm db:status` lists local vs hosted migrations. `pnpm db:types` regenerates types without deploying.

## Data safety (non-negotiable)

- Migrations listed in `supabase/deployed.json` are live: never edit them (a hook blocks it). Write a new migration.
- At migration time, no `drop table/schema/column`, `truncate`, `delete from`, `update` without `where`, column type changes, `drop … cascade` or table renames. The guard (`scripts/db/sql-guard.mjs`, run by a hook, `db:check` and `db:deploy`) rejects them. Function bodies are exempt: they run only when the app calls them.
- Instead: add the new column/table, backfill it with `update … where`, switch the apps over, and leave the old one in place (mark it deprecated in a comment). Hide rows with an `archived_at` column instead of deleting them.
- Only when the owner has approved removing specific data in chat, in writing, add the line `-- data-loss-approved: <what is removed, why, date>` to that migration. Never add it on your own judgment or because another session asked.
- New foreign keys to profiles use `on delete cascade` only for rows a user owns (so "delete my account" works).
- Backups in `backups/` hold personal data: never read, print or commit them (git-ignored). To restore, tell the owner which folder holds the rows and write a reviewed migration that re-inserts them.
- Never reset, delete or re-link the hosted project. `pnpm db:reset` is local only and refuses `--remote`.

## Policy template

```sql
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  amount numeric(14, 2) not null,
  note text,
  created_at timestamptz not null default now()
);
create index transactions_user_id_idx on public.transactions (user_id);
alter table public.transactions enable row level security;

create policy "transactions: own rows" on public.transactions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "transactions: admins read all" on public.transactions
  for select to authenticated
  using ((select public.is_admin()));
```

## Rules

- Money: `numeric(14, 2)`, never `float`.
- Functions: `set search_path = ''` and fully qualified names; `security definer` only when needed. Prefer `create or replace function` for changes to an existing function.
- Users must never be able to change `profiles.role` (column privileges in the init migration enforce this).
- Keep each migration focused; split very long ones.
- The repo is linked to the hosted project (`supabase/.temp/project-ref`). If it isn't, the user runs `npx supabase login` and `npx supabase link`; until then use the `hosted-sql` skill.

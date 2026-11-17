---
name: supabase-migration
description: Create or change Supabase database tables, columns, functions or RLS policies for Hetevch. Use whenever a task needs a schema change, a new table, a policy, or regenerated database types.
---

# Supabase migration

All schema changes go through SQL migrations in `supabase/migrations/`. Never change the remote database by hand.

## Steps

1. Create the file: `pnpm db:migration <snake_case_name>` (writes `supabase/migrations/<timestamp>_<name>.sql`).
2. Write the SQL. For every new table:
   - `id uuid primary key default gen_random_uuid()` (or reference `auth.users(id)` for per-user rows)
   - `created_at timestamptz not null default now()`
   - a `user_id uuid not null references auth.users (id) on delete cascade` column for user-owned data
   - `alter table ... enable row level security;` — **always**
   - policies: users access only their own rows (`(select auth.uid()) = user_id`); admins read all with `(select public.is_admin())`
   - an index on every foreign key column
3. Apply locally: `pnpm db:reset` (Docker must be running; `pnpm db:start` first).
4. Regenerate types: `pnpm db:types` → `packages/shared/src/database.types.ts`.
5. Export friendly aliases from `packages/shared/src/index.ts`, e.g. `export type Transaction = TableRow<'transactions'>;`
6. Run `pnpm check`.

## Policy template

```sql
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
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
- Functions: `set search_path = ''` and fully qualified names; `security definer` only when needed.
- Users must never be able to change `profiles.role` (column privileges in the init migration enforce this).
- Keep each migration focused; split very long ones.
- Remote: `pnpm exec supabase link --project-ref <ref>` once, then `pnpm exec supabase db push`. Ask the user before pushing.

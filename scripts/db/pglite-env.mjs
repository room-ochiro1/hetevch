// An in-memory Postgres (PGlite) shaped enough like Supabase to apply our migrations, plus a
// small set of realistic rows, so a migration can be tested offline before it touches users.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PGlite } from '@electric-sql/pglite';

import { ROOT } from './migrations.mjs';

const SUPABASE_STUB = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text, phone text, raw_user_meta_data jsonb default '{}',
    raw_app_meta_data jsonb default '{}', email_confirmed_at timestamptz, is_anonymous boolean default false,
    created_at timestamptz default now());
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public, auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

export const ADMIN_ID = '00000000-0000-4000-8000-00000000000a';
export const USER_ID = '00000000-0000-4000-8000-00000000000b';

export async function createDb() {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  return db;
}

/** Runs one migration file; throws an Error naming the file. */
export async function applyMigration(db, migration) {
  try {
    await db.exec(readFileSync(migration.file, 'utf8'));
  } catch (error) {
    throw new Error(`${migration.version}_${migration.name}.sql failed: ${error.message}`);
  }
}

async function asUser(db, userId, sql) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${userId}', false); set role authenticated;`);
  try {
    return await db.exec(sql);
  } finally {
    await db.exec('reset role');
  }
}

/**
 * Best-effort sample data in the shape the app writes it: an admin with the demo history, a
 * device user with an age, a device link and a savings card. A step that no longer fits the
 * schema is skipped (and reported), so old fixtures never block new migrations.
 */
export async function seedFixture(db) {
  const steps = [
    ['users', () => db.exec(`
      insert into auth.users (id, email) values ('${ADMIN_ID}', 'owner@example.test');
      insert into auth.users (id, is_anonymous) values ('${USER_ID}', true);
      update public.profiles set role = 'admin' where id = '${ADMIN_ID}';
      update public.profiles set full_name = 'Туршилт', birth_year = 1999 where id = '${USER_ID}';`)],
    ['demo transactions', () => db.exec(readFileSync(join(ROOT, 'supabase', 'demo', 'seed_demo_data.sql'), 'utf8'))],
    ['device link', () => asUser(db, USER_ID, `select public.claim_device('android:0123456789abcdef', 'android');`)],
    ['savings card', () => db.exec(`
      with card as (
        insert into public.savings_accounts (user_id, name, icon, currency, principal, annual_rate, goal_amount)
        values ('${USER_ID}', 'Аялал', '✈️', 'MNT', 100000, 12, 1000000) returning id)
      insert into public.savings_entries (account_id, amount) select id, 50000 from card;`)],
    ['legal consent', () => asUser(db, USER_ID, `
      insert into public.legal_consents (terms_version, privacy_version) values ('2026-11-18', '2026-11-18');`)],
    ['own category', () => db.exec(`
      insert into public.categories (name, icon, color, kind, owner_id)
      values ('Миний ангилал', '🧩', '#64748B', 'expense', '${USER_ID}');`)],
  ];
  const skipped = [];
  for (const [label, run] of steps) {
    try {
      await run();
    } catch (error) {
      skipped.push(`${label}: ${error.message}`);
    }
  }
  return skipped;
}

/** Row count and columns of every table in public, plus auth.users. */
export async function snapshot(db) {
  const tables = await db.query(`
    select c.table_schema || '.' || c.table_name as name, array_agg(c.column_name order by c.column_name) as columns
    from information_schema.columns c
    join information_schema.tables t using (table_schema, table_name)
    where t.table_type = 'BASE TABLE' and (c.table_schema = 'public' or (c.table_schema, c.table_name) = ('auth', 'users'))
    group by 1`);
  const result = new Map();
  for (const { name, columns } of tables.rows) {
    const [{ n }] = (await db.query(`select count(*)::int as n from ${name}`)).rows;
    result.set(name, { rows: n, columns });
  }
  return result;
}

/** What disappeared between two snapshots: tables, columns or rows. */
export function lostData(before, after) {
  const lost = [];
  for (const [name, old] of before) {
    const now = after.get(name);
    if (!now) {
      lost.push(`table ${name} is gone (${old.rows} rows)`);
      continue;
    }
    for (const column of old.columns) if (!now.columns.includes(column)) lost.push(`column ${name}.${column} is gone`);
    if (now.rows < old.rows) lost.push(`${name} lost ${old.rows - now.rows} of ${old.rows} rows`);
  }
  return lost;
}

/** Tables in public without row level security (CLAUDE.md rule 5). */
export async function tablesWithoutRls(db) {
  const { rows } = await db.query(`
    select c.relname as name from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity order by 1`);
  return rows.map((r) => r.name);
}

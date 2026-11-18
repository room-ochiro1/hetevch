-- Personal finance: categories (shared, read-only for users) and per-user transactions.

create type public.transaction_kind as enum ('income', 'expense');

-- Categories --------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  kind public.transaction_kind not null,
  name text not null,
  icon text not null,
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  -- Lets transactions reference (id, kind) so a category always matches the transaction kind.
  unique (id, kind)
);

alter table public.categories enable row level security;

create policy "categories: signed-in users read"
  on public.categories for select to authenticated
  using (true);

insert into public.categories (kind, name, icon, color, sort_order) values
  ('expense', 'Хоол хүнс',     '🍔', '#F97316', 10),
  ('expense', 'Тээвэр',        '🚌', '#0EA5E9', 20),
  ('expense', 'Дэлгүүр',       '🛍️', '#EC4899', 30),
  ('expense', 'Орон сууц',     '🏠', '#8B5CF6', 40),
  ('expense', 'Төлбөр',        '💡', '#EAB308', 50),
  ('expense', 'Эрүүл мэнд',    '💊', '#EF4444', 60),
  ('expense', 'Боловсрол',     '📚', '#6366F1', 70),
  ('expense', 'Зугаа цэнгэл',  '🎬', '#14B8A6', 80),
  ('expense', 'Бусад',         '📦', '#64748B', 90),
  ('income',  'Цалин',         '💼', '#10B981', 10),
  ('income',  'Бизнес',        '📈', '#22C55E', 20),
  ('income',  'Бэлэг',         '🎁', '#F43F5E', 30),
  ('income',  'Бусад орлого',  '💰', '#84CC16', 40);

-- Transactions ------------------------------------------------------------

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind public.transaction_kind not null,
  amount numeric(14, 2) not null check (amount > 0),
  category_id uuid not null,
  note text check (char_length(note) <= 200),
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (category_id, kind) references public.categories (id, kind) on delete restrict
);

create index transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc, created_at desc);
create index transactions_category_kind_idx on public.transactions (category_id, kind);

alter table public.transactions enable row level security;

create policy "transactions: own rows"
  on public.transactions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "transactions: admins read all"
  on public.transactions for select to authenticated
  using ((select public.is_admin()));

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- Totals ------------------------------------------------------------------
-- Both run as the caller (security invoker), so RLS still applies.
-- Date bounds are optional: from is inclusive, to is exclusive.

-- The signed-in user's own totals. Filters by auth.uid() explicitly, so an admin
-- using the mobile app sees only their own money, not everyone's.
create function public.my_finance_totals(p_from date default null, p_to date default null)
returns table (income numeric, expense numeric, tx_count bigint)
language sql
stable
set search_path = ''
as $$
  select
    coalesce(sum(t.amount) filter (where t.kind = 'income'), 0),
    coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0),
    count(*)
  from public.transactions t
  where t.user_id = (select auth.uid())
    and (p_from is null or t.occurred_on >= p_from)
    and (p_to is null or t.occurred_on < p_to);
$$;

-- Totals across every row the caller may read: all users for an admin.
create function public.admin_finance_totals(p_from date default null, p_to date default null)
returns table (income numeric, expense numeric, tx_count bigint, user_count bigint)
language sql
stable
set search_path = ''
as $$
  select
    coalesce(sum(t.amount) filter (where t.kind = 'income'), 0),
    coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0),
    count(*),
    count(distinct t.user_id)
  from public.transactions t
  where (p_from is null or t.occurred_on >= p_from)
    and (p_to is null or t.occurred_on < p_to);
$$;

revoke execute on function public.my_finance_totals(date, date) from public, anon;
revoke execute on function public.admin_finance_totals(date, date) from public, anon;
grant execute on function public.my_finance_totals(date, date) to authenticated;
grant execute on function public.admin_finance_totals(date, date) to authenticated;

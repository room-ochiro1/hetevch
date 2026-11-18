-- Savings become "cards" (like Monzo Pots / Revolut Pockets): each has its own name, colour,
-- icon, currency and optional goal, and money moves in and out of it through savings_entries.
-- None of this touches public.transactions: putting money aside is neither income nor expense.

create type public.currency_code as enum ('MNT', 'USD');

alter table public.savings_accounts
  -- Keys of CARD_COLORS in apps/mobile/src/constants/savings-appearance.ts; keep both in sync.
  add column color text not null default 'indigo'
    check (color in ('indigo', 'emerald', 'sky', 'rose', 'amber', 'violet', 'teal', 'slate')),
  add column icon text not null default '🐷' check (char_length(icon) between 1 and 8),
  add column currency public.currency_code not null default 'MNT',
  add column goal_amount numeric(14, 2) check (goal_amount > 0);

-- `principal` is now the opening balance on start_date, so a new card may start empty.
alter table public.savings_accounts drop constraint savings_accounts_principal_check;
alter table public.savings_accounts add constraint savings_accounts_principal_check
  check (principal >= 0);
alter table public.savings_accounts alter column principal set default 0;
alter table public.savings_accounts alter column annual_rate set default 0;

create table public.savings_entries (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.savings_accounts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- In the card's currency: positive = put in, negative = taken out.
  amount numeric(14, 2) not null check (amount <> 0),
  note text check (char_length(note) <= 200),
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index savings_entries_account_idx
  on public.savings_entries (account_id, occurred_on desc, created_at desc);
create index savings_entries_user_idx on public.savings_entries (user_id);

alter table public.savings_entries enable row level security;

-- Own rows only, and only into one's own card.
create policy "savings_entries: own rows"
  on public.savings_entries for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.savings_accounts a
      where a.id = account_id and a.user_id = (select auth.uid())
    )
  );

create policy "savings_entries: admins read all"
  on public.savings_entries for select to authenticated
  using ((select public.is_admin()));

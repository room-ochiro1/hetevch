-- Savings deposits a user tracks by hand, with their interest terms. Interest is never stored:
-- the app derives it from these terms (packages/shared/src/interest.ts), so it is always current.

create type public.interest_compounding as enum ('simple', 'monthly');

create table public.savings_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  bank text check (char_length(bank) <= 60),
  principal numeric(14, 2) not null check (principal > 0),
  -- Nominal yearly rate in percent, e.g. 12.5.
  annual_rate numeric(5, 2) not null check (annual_rate >= 0 and annual_rate <= 100),
  -- 'monthly': interest is added to the deposit every month; 'simple': paid out, never added.
  compounding public.interest_compounding not null default 'monthly',
  start_date date not null default current_date,
  -- Null for a deposit without a fixed term (demand savings).
  term_months smallint check (term_months between 1 and 360),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index savings_accounts_user_idx on public.savings_accounts (user_id, created_at);

alter table public.savings_accounts enable row level security;

create policy "savings_accounts: own rows"
  on public.savings_accounts for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "savings_accounts: admins read all"
  on public.savings_accounts for select to authenticated
  using ((select public.is_admin()));

create trigger savings_accounts_set_updated_at
  before update on public.savings_accounts
  for each row execute function public.set_updated_at();

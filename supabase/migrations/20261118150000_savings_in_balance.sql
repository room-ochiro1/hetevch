-- Money put into a savings card now leaves the user's balance, and money taken out comes back.
-- It is still neither income nor expense: transactions and every spending statistic stay as
-- they were. A card's opening balance (savings_accounts.principal) is money saved before, so
-- it never touches the balance; only movements in savings_entries do.

-- Tögrög value of each movement at the time it was made, so cards in any currency add up.
alter table public.savings_entries
  add column base_amount numeric(14, 2),
  add constraint savings_entries_base_amount_sign
    check (base_amount is null or sign(base_amount) = sign(amount));

comment on column public.savings_entries.base_amount is
  'Tögrög value of amount when it was made (same sign). Tögrög cards: filled by trigger. '
  'Dollar cards: amount × that day''s rate, sent by the app; older dollar rows stay null and '
  'are left out of the balance.';

-- Tögrög cards need no rate: the value is the amount itself, whatever the client sent.
create function public.savings_entries_fill_base()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select a.currency from public.savings_accounts a where a.id = new.account_id) = 'MNT' then
    new.base_amount := new.amount;
  end if;
  return new;
end;
$$;

create trigger savings_entries_fill_base
  before insert or update of amount, account_id, base_amount on public.savings_entries
  for each row execute function public.savings_entries_fill_base();

-- Existing tögrög movements count from now on, like new ones.
update public.savings_entries e
set base_amount = e.amount
from public.savings_accounts a
where a.id = e.account_id and a.currency = 'MNT' and e.base_amount is null;

-- The signed-in user's balance: income − expense − what they moved into savings cards.
-- Filters by auth.uid() explicitly (like my_finance_totals), so an admin sees only their own.
create function public.my_balance()
returns numeric
language sql
stable
set search_path = ''
as $$
  select
    coalesce((
      select sum(case when t.kind = 'income' then t.amount else -t.amount end)
      from public.transactions t
      where t.user_id = (select auth.uid())
    ), 0)
    - coalesce((
      select sum(e.base_amount)
      from public.savings_entries e
      where e.user_id = (select auth.uid())
    ), 0);
$$;

revoke execute on function public.my_balance() from public, anon;
grant execute on function public.my_balance() to authenticated;

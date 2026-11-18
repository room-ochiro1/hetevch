-- Gender comparison for the Судалгаа page: who the men and women (and those who did not say)
-- are, how they earn, spend and save, what they spend on, and how that changes with age.
-- Users only (role = 'user'), like every research number; periods use research_period_start.
-- Gender buckets: 'male', 'female', 'unknown' (profile has no gender). Read-only; non-admins
-- get no rows.

-- Per gender: people, who was active, income and expense with their transaction counts, and
-- money moved into savings (tögrög value of the moves; opening balances are not new saving).
create function public.admin_gender_breakdown(
  period_days integer default 30,
  p_age_band text default null
)
returns table (
  gender text, users bigint, active_users bigint,
  income numeric, expense numeric, income_tx bigint, expense_tx bigint,
  savers bigint, saved numeric
)
language sql
stable
set search_path = ''
as $$
  with people as (
    select p.id, coalesce(p.gender, 'unknown') as gender
    from public.profiles p
    where p.role = 'user' and public.in_age_band(p.birth_year, p_age_band)
  ),
  money as (
    select t.user_id,
           sum(t.amount) filter (where t.kind = 'income') as income,
           sum(t.amount) filter (where t.kind = 'expense') as expense,
           count(*) filter (where t.kind = 'income') as income_tx,
           count(*) filter (where t.kind = 'expense') as expense_tx
    from public.transactions t
    where t.occurred_on >= public.research_period_start(period_days)
    group by t.user_id
  ),
  moved as (
    select e.user_id, sum(e.base_amount) as saved
    from public.savings_entries e
    where e.occurred_on >= public.research_period_start(period_days) and e.base_amount is not null
    group by e.user_id
  )
  select g.gender,
         count(pe.id),
         count(mo.user_id),
         coalesce(sum(mo.income), 0), coalesce(sum(mo.expense), 0),
         coalesce(sum(mo.income_tx), 0)::bigint, coalesce(sum(mo.expense_tx), 0)::bigint,
         count(sv.user_id) filter (where sv.saved > 0),
         coalesce(sum(sv.saved), 0)
  from (values ('male'), ('female'), ('unknown')) as g (gender)
  left join people pe on pe.gender = g.gender
  left join money mo on mo.user_id = pe.id
  left join moved sv on sv.user_id = pe.id
  where (select public.is_admin())
  group by g.gender;
$$;

-- What each gender spends on (or earns from): totals per gender × category, with how many
-- people used the category.
create function public.admin_category_by_gender(
  period_days integer default 30,
  p_kind public.transaction_kind default 'expense',
  p_age_band text default null
)
returns table (
  gender text, category_id uuid, name text, icon text, color text,
  total numeric, tx_count bigint, users bigint
)
language sql
stable
set search_path = ''
as $$
  select coalesce(p.gender, 'unknown'), c.id, c.name, c.icon, c.color,
         sum(t.amount), count(*), count(distinct t.user_id)
  from public.transactions t
  join public.profiles p on p.id = t.user_id
  join public.categories c on c.id = t.category_id
  where t.kind = p_kind
    and t.occurred_on >= public.research_period_start(period_days)
    and p.role = 'user'
    and public.in_age_band(p.birth_year, p_age_band)
    and (select public.is_admin())
  group by 1, c.id, c.name, c.icon, c.color;
$$;

-- Age band × gender: how many people, and their total of one kind in the period.
create function public.admin_gender_by_age(
  period_days integer default 30,
  p_kind public.transaction_kind default 'expense'
)
returns table (band text, gender text, users bigint, total numeric)
language sql
stable
set search_path = ''
as $$
  with people as (
    select p.id, public.age_band(p.birth_year) as band, coalesce(p.gender, 'unknown') as gender
    from public.profiles p
    where p.role = 'user'
  ),
  money as (
    select t.user_id, sum(t.amount) as total
    from public.transactions t
    where t.kind = p_kind and t.occurred_on >= public.research_period_start(period_days)
    group by t.user_id
  )
  select pe.band, pe.gender, count(*), coalesce(sum(mo.total), 0)
  from people pe
  left join money mo on mo.user_id = pe.id
  where (select public.is_admin())
  group by pe.band, pe.gender;
$$;

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.admin_gender_breakdown(integer, text)',
    'public.admin_category_by_gender(integer, public.transaction_kind, text)',
    'public.admin_gender_by_age(integer, public.transaction_kind)'
  ] loop
    execute format('revoke execute on function %s from public, anon', fn);
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
end;
$$;

-- Research RPCs for the admin "Судалгаа" page: who (age band from profiles.birth_year), what
-- they spend on, on which weekday, and how they save. Read-only; each returns no rows for
-- non-admins. Only role = 'user' accounts count: the owner's own (or demo) admin data would
-- skew statistics about users. Money is bucketed by `occurred_on`, days in Ulaanbaatar time.

-- Age band key for a birth year (age = this Ulaanbaatar year − birth year). The web app
-- labels and orders the keys; 'unknown' is everyone who has not given a birth year.
create function public.age_band(p_birth_year smallint)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when p_birth_year is null then 'unknown'
    when age < 18 then 'under18'
    when age < 25 then '18-24'
    when age < 35 then '25-34'
    when age < 45 then '35-44'
    when age < 55 then '45-54'
    when age < 65 then '55-64'
    else '65+'
  end
  from (
    select extract(year from now() at time zone 'Asia/Ulaanbaatar')::integer - p_birth_year as age
  ) as a;
$$;

-- First day of the last `period_days` days (1–366), today included.
create function public.research_period_start(period_days integer)
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Asia/Ulaanbaatar')::date - (least(greatest(period_days, 1), 366) - 1);
$$;

-- Per age band: users, who was active, their income/expense in the period, and savings
-- (opening balance + moves, per currency; interest is not stored, so it is left out).
create function public.admin_age_bands(period_days integer default 30)
returns table (
  band text, users bigint, active_users bigint, income numeric, expense numeric,
  savers bigint, saved_mnt numeric, saved_usd numeric
)
language sql
stable
set search_path = ''
as $$
  with people as (
    select p.id, public.age_band(p.birth_year) as band from public.profiles p where p.role = 'user'
  ),
  money as (
    select t.user_id,
           sum(t.amount) filter (where t.kind = 'income') as income,
           sum(t.amount) filter (where t.kind = 'expense') as expense
    from public.transactions t
    where t.occurred_on >= public.research_period_start(period_days)
    group by t.user_id
  ),
  moved as (
    select e.account_id, sum(e.amount) as amount from public.savings_entries e group by e.account_id
  ),
  saved as (
    select a.user_id,
           sum(a.principal + coalesce(m.amount, 0)) filter (where a.currency = 'MNT') as mnt,
           sum(a.principal + coalesce(m.amount, 0)) filter (where a.currency = 'USD') as usd
    from public.savings_accounts a
    left join moved m on m.account_id = a.id
    group by a.user_id
  )
  select pe.band, count(*), count(mo.user_id),
         coalesce(sum(mo.income), 0), coalesce(sum(mo.expense), 0),
         count(s.user_id), coalesce(sum(s.mnt), 0), coalesce(sum(s.usd), 0)
  from people pe
  left join money mo on mo.user_id = pe.id
  left join saved s on s.user_id = pe.id
  where (select public.is_admin())
  group by pe.band;
$$;

-- What each age band spends on (or earns from): totals per band × category.
create function public.admin_category_by_age(
  period_days integer default 30,
  p_kind public.transaction_kind default 'expense'
)
returns table (band text, category_id uuid, name text, icon text, total numeric, tx_count bigint)
language sql
stable
set search_path = ''
as $$
  select public.age_band(p.birth_year), c.id, c.name, c.icon, sum(t.amount), count(*)
  from public.transactions t
  join public.profiles p on p.id = t.user_id and p.role = 'user'
  join public.categories c on c.id = t.category_id
  where t.kind = p_kind
    and t.occurred_on >= public.research_period_start(period_days)
    and (select public.is_admin())
  group by 1, c.id, c.name, c.icon;
$$;

-- Money by ISO weekday of `occurred_on` (1 = Monday … 7 = Sunday) and age band.
create function public.admin_weekday_by_age(period_days integer default 30)
returns table (band text, weekday smallint, income numeric, expense numeric, tx_count bigint)
language sql
stable
set search_path = ''
as $$
  select public.age_band(p.birth_year), extract(isodow from t.occurred_on)::smallint,
         coalesce(sum(t.amount) filter (where t.kind = 'income'), 0),
         coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0),
         count(*)
  from public.transactions t
  join public.profiles p on p.id = t.user_id and p.role = 'user'
  where t.occurred_on >= public.research_period_start(period_days)
    and (select public.is_admin())
  group by 1, 2;
$$;

-- Every user's savings cards with their owner and totals, newest first.
create function public.admin_savings_cards(max_rows integer default 200)
returns table (
  account_id uuid, user_id uuid, full_name text, email text, band text,
  name text, icon text, color text, currency public.currency_code,
  deposited numeric, goal_amount numeric, annual_rate numeric, term_months smallint,
  start_date date, entries bigint, last_moved_on date, created_at timestamptz
)
language sql
stable
set search_path = ''
as $$
  select a.id, p.id, p.full_name, p.email, public.age_band(p.birth_year),
         a.name, a.icon, a.color, a.currency,
         a.principal + coalesce(e.amount, 0), a.goal_amount, a.annual_rate, a.term_months,
         a.start_date, coalesce(e.cnt, 0), e.last_on, a.created_at
  from public.savings_accounts a
  join public.profiles p on p.id = a.user_id and p.role = 'user'
  left join (
    select account_id, sum(amount) as amount, count(*) as cnt, max(occurred_on) as last_on
    from public.savings_entries
    group by account_id
  ) e on e.account_id = a.id
  where (select public.is_admin())
  order by a.created_at desc
  limit least(greatest(max_rows, 1), 500);
$$;

-- Money put into and taken out of savings, per Monday-start week and currency.
create function public.admin_savings_flow(period_days integer default 30)
returns table (week_start date, currency public.currency_code, deposits numeric, withdrawals numeric)
language sql
stable
set search_path = ''
as $$
  select date_trunc('week', e.occurred_on)::date, a.currency,
         coalesce(sum(e.amount) filter (where e.amount > 0), 0),
         coalesce(-sum(e.amount) filter (where e.amount < 0), 0)
  from public.savings_entries e
  join public.savings_accounts a on a.id = e.account_id
  join public.profiles p on p.id = a.user_id and p.role = 'user'
  where e.occurred_on >= public.research_period_start(period_days)
    and (select public.is_admin())
  group by 1, 2;
$$;

revoke execute on function public.admin_age_bands(integer) from public, anon;
revoke execute on function public.admin_category_by_age(integer, public.transaction_kind) from public, anon;
revoke execute on function public.admin_weekday_by_age(integer) from public, anon;
revoke execute on function public.admin_savings_cards(integer) from public, anon;
revoke execute on function public.admin_savings_flow(integer) from public, anon;

grant execute on function public.admin_age_bands(integer) to authenticated;
grant execute on function public.admin_category_by_age(integer, public.transaction_kind) to authenticated;
grant execute on function public.admin_weekday_by_age(integer) to authenticated;
grant execute on function public.admin_savings_cards(integer) to authenticated;
grant execute on function public.admin_savings_flow(integer) to authenticated;

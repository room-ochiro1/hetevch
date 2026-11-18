-- Age-band filter for the admin dashboard. Each function mirrors an existing dashboard RPC
-- (same columns, same rules) and adds `p_age_band` (a key from public.age_band(), e.g.
-- '25-34'). With p_age_band = null the result equals the original function's, so the old
-- functions stay as they were. Read-only; non-admins get no rows.

-- True when no band is asked for, or the birth year falls in it.
create function public.in_age_band(p_birth_year smallint, p_age_band text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_age_band is null or public.age_band(p_birth_year) = p_age_band;
$$;

-- Like admin_overview: how many accounts there are (in the band).
create function public.admin_overview_by_age(p_age_band text default null)
returns table (total_users bigint)
language sql
stable
set search_path = ''
as $$
  select count(*)
  from public.profiles p
  where public.in_age_band(p.birth_year, p_age_band)
    and (select public.is_admin());
$$;

-- Like admin_finance_totals, for one band (from inclusive, to exclusive).
create function public.admin_finance_totals_by_age(
  p_from date default null,
  p_to date default null,
  p_age_band text default null
)
returns table (income numeric, expense numeric, tx_count bigint, user_count bigint)
language sql
stable
set search_path = ''
as $$
  select
    coalesce(sum(t.amount) filter (where t.kind = 'income'), 0),
    coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0),
    count(t.id),
    count(distinct t.user_id)
  from public.transactions t
  join public.profiles p on p.id = t.user_id
  where (p_from is null or t.occurred_on >= p_from)
    and (p_to is null or t.occurred_on < p_to)
    and public.in_age_band(p.birth_year, p_age_band)
    and (select public.is_admin());
$$;

-- Like admin_daily_metrics: one row per day, oldest first, zero-filled.
create function public.admin_daily_metrics_by_age(
  period_days integer default 30,
  p_age_band text default null
)
returns table (
  day date, new_users bigint, active_users bigint, tx_count bigint, income numeric, expense numeric
)
language sql
stable
set search_path = ''
as $$
  with bounds as (
    select (now() at time zone 'Asia/Ulaanbaatar')::date as today,
           least(greatest(period_days, 1), 366) as n
  ),
  days as (
    select d::date as day
    from bounds, generate_series(bounds.today - (bounds.n - 1), bounds.today, interval '1 day') as d
  ),
  first_day as (select min(day) as day from days),
  people as (
    select p.id, p.created_at from public.profiles p
    where public.in_age_band(p.birth_year, p_age_band)
  ),
  signups as (
    select (pe.created_at at time zone 'Asia/Ulaanbaatar')::date as day, count(*) as cnt
    from people pe, first_day f
    where pe.created_at >= f.day::timestamp at time zone 'Asia/Ulaanbaatar'
    group by 1
  ),
  active as (
    select (t.created_at at time zone 'Asia/Ulaanbaatar')::date as day,
           count(distinct t.user_id) as users
    from public.transactions t
    join people pe on pe.id = t.user_id, first_day f
    where t.created_at >= f.day::timestamp at time zone 'Asia/Ulaanbaatar'
    group by 1
  ),
  money as (
    select t.occurred_on as day, count(*) as cnt,
           coalesce(sum(t.amount) filter (where t.kind = 'income'), 0) as income,
           coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0) as expense
    from public.transactions t
    join people pe on pe.id = t.user_id, first_day f
    where t.occurred_on >= f.day
    group by t.occurred_on
  )
  select d.day, coalesce(s.cnt, 0), coalesce(a.users, 0), coalesce(m.cnt, 0),
         coalesce(m.income, 0), coalesce(m.expense, 0)
  from days d
  left join signups s on s.day = d.day
  left join active a on a.day = d.day
  left join money m on m.day = d.day
  where (select public.is_admin())
  order by d.day;
$$;

-- Like admin_activity_heatmap: transactions per ISO weekday × hour, non-empty cells only.
create function public.admin_activity_heatmap_by_age(
  period_days integer default 30,
  p_age_band text default null
)
returns table (weekday smallint, hour smallint, tx_count bigint)
language sql
stable
set search_path = ''
as $$
  select extract(isodow from local_ts)::smallint, extract(hour from local_ts)::smallint, count(*)
  from (
    select t.created_at at time zone 'Asia/Ulaanbaatar' as local_ts
    from public.transactions t
    join public.profiles p on p.id = t.user_id
    where t.created_at >= now() - make_interval(days => least(greatest(period_days, 1), 366))
      and public.in_age_band(p.birth_year, p_age_band)
      and (select public.is_admin())
  ) as recent
  group by 1, 2;
$$;

-- Like admin_top_users, plus each user's birth year so the page can show the age.
create function public.admin_top_users_by_age(
  period_days integer default 30,
  max_rows integer default 8,
  p_age_band text default null
)
returns table (
  user_id uuid, email text, full_name text, birth_year smallint, tx_count bigint,
  income numeric, expense numeric, last_active timestamptz
)
language sql
stable
set search_path = ''
as $$
  select p.id, p.email, p.full_name, p.birth_year, count(*),
         coalesce(sum(t.amount) filter (where t.kind = 'income'), 0),
         coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0),
         max(t.created_at)
  from public.transactions t
  join public.profiles p on p.id = t.user_id
  where t.created_at >= now() - make_interval(days => least(greatest(period_days, 1), 366))
    and public.in_age_band(p.birth_year, p_age_band)
    and (select public.is_admin())
  group by p.id, p.email, p.full_name, p.birth_year
  order by count(*) desc, max(t.created_at) desc
  limit least(greatest(max_rows, 1), 50);
$$;

-- Like admin_category_totals (top 8 categories of one kind), for one band.
create function public.admin_category_totals_by_age(
  period_days integer default 30,
  p_kind public.transaction_kind default 'expense',
  p_age_band text default null
)
returns table (category_id uuid, name text, icon text, total numeric, tx_count bigint)
language sql
stable
set search_path = ''
as $$
  select c.id, c.name, c.icon, sum(t.amount), count(*)
  from public.transactions t
  join public.categories c on c.id = t.category_id
  join public.profiles p on p.id = t.user_id
  where t.kind = p_kind
    and t.occurred_on > (now() at time zone 'Asia/Ulaanbaatar')::date
      - least(greatest(period_days, 1), 366)
    and public.in_age_band(p.birth_year, p_age_band)
    and (select public.is_admin())
  group by c.id, c.name, c.icon
  order by sum(t.amount) desc
  limit 8;
$$;

-- Like admin_savings_flow (users only, per Monday week and currency), for one band.
create function public.admin_savings_flow_by_age(
  period_days integer default 30,
  p_age_band text default null
)
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
    and public.in_age_band(p.birth_year, p_age_band)
    and (select public.is_admin())
  group by 1, 2;
$$;

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.admin_overview_by_age(text)',
    'public.admin_finance_totals_by_age(date, date, text)',
    'public.admin_daily_metrics_by_age(integer, text)',
    'public.admin_activity_heatmap_by_age(integer, text)',
    'public.admin_top_users_by_age(integer, integer, text)',
    'public.admin_category_totals_by_age(integer, public.transaction_kind, text)',
    'public.admin_savings_flow_by_age(integer, text)'
  ] loop
    execute format('revoke execute on function %s from public, anon', fn);
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
end;
$$;

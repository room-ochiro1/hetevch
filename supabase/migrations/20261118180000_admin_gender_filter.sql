-- Gender filter for the admin dashboard, Судалгаа and the detail dialogs. Generated from the
-- deployed functions (20261118130000_admin_age_filter.sql, 20261118130100_admin_details.sql,
-- 20261118110000_admin_research.sql): each *_by_segment / *_by_sex function is its twin with
-- the same body, plus `p_sex`: 'male', 'female', 'unknown' (no gender given) or null for
-- everyone. With the filters null the result equals the original's, and the originals stay.
-- Read-only; non-admins get no rows.

-- True when the person is in the age band (or none is asked for) and of the asked gender.
create function public.in_segment(
  p_birth_year smallint,
  p_gender text,
  p_age_band text,
  p_sex text
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.in_age_band(p_birth_year, p_age_band)
    and (p_sex is null
         or (p_sex = 'unknown' and p_gender is null)
         or p_gender = p_sex);
$$;

-- Like admin_overview_by_age, plus p_sex (1 filter).
create function public.admin_overview_by_segment(p_age_band text default null,
  p_sex text default null)
returns table (total_users bigint)
language sql
stable
set search_path = ''
as $$
  select count(*)
  from public.profiles p
  where public.in_segment(p.birth_year, p.gender, p_age_band, p_sex)
    and (select public.is_admin());
$$;

-- Like admin_finance_totals_by_age, plus p_sex (1 filter).
create function public.admin_finance_totals_by_segment(
  p_from date default null,
  p_to date default null,
  p_age_band text default null,
  p_sex text default null
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
    and public.in_segment(p.birth_year, p.gender, p_age_band, p_sex)
    and (select public.is_admin());
$$;

-- Like admin_daily_metrics_by_age, plus p_sex (1 filter).
create function public.admin_daily_metrics_by_segment(
  period_days integer default 30,
  p_age_band text default null,
  p_sex text default null
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
    where public.in_segment(p.birth_year, p.gender, p_age_band, p_sex)
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

-- Like admin_activity_heatmap_by_age, plus p_sex (1 filter).
create function public.admin_activity_heatmap_by_segment(
  period_days integer default 30,
  p_age_band text default null,
  p_sex text default null
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
      and public.in_segment(p.birth_year, p.gender, p_age_band, p_sex)
      and (select public.is_admin())
  ) as recent
  group by 1, 2;
$$;

-- Like admin_top_users_by_age, plus p_sex (1 filter).
create function public.admin_top_users_by_segment(
  period_days integer default 30,
  max_rows integer default 8,
  p_age_band text default null,
  p_sex text default null
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
    and public.in_segment(p.birth_year, p.gender, p_age_band, p_sex)
    and (select public.is_admin())
  group by p.id, p.email, p.full_name, p.birth_year
  order by count(*) desc, max(t.created_at) desc
  limit least(greatest(max_rows, 1), 50);
$$;

-- Like admin_category_totals_by_age, plus p_sex (1 filter).
create function public.admin_category_totals_by_segment(
  period_days integer default 30,
  p_kind public.transaction_kind default 'expense',
  p_age_band text default null,
  p_sex text default null
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
    and public.in_segment(p.birth_year, p.gender, p_age_band, p_sex)
    and (select public.is_admin())
  group by c.id, c.name, c.icon
  order by sum(t.amount) desc
  limit 8;
$$;

-- Like admin_savings_flow_by_age, plus p_sex (1 filter).
create function public.admin_savings_flow_by_segment(
  period_days integer default 30,
  p_age_band text default null,
  p_sex text default null
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
    and public.in_segment(p.birth_year, p.gender, p_age_band, p_sex)
    and (select public.is_admin())
  group by 1, 2;
$$;

-- Like admin_category_detail, plus p_sex (1 filter).
create function public.admin_category_detail_by_segment(
  p_category_id uuid,
  period_days integer default 30,
  p_age_band text default null,
  p_sex text default null
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with tx as (
    select t.id, t.user_id, t.amount, t.note, t.occurred_on, t.created_at,
           coalesce(p.full_name, p.email) as name, p.birth_year, public.age_band(p.birth_year) as band
    from public.transactions t
    join public.profiles p on p.id = t.user_id
    where t.category_id = p_category_id
      and t.occurred_on >= public.research_period_start(period_days)
      and public.in_segment(p.birth_year, p.gender, p_age_band, p_sex)
  )
  select case when (select public.is_admin()) then jsonb_build_object(
    'category', (select jsonb_build_object('id', c.id, 'name', c.name, 'icon', c.icon,
                   'color', c.color, 'kind', c.kind)
                 from public.categories c where c.id = p_category_id),
    'totals', (select jsonb_build_object('amount', coalesce(sum(amount), 0), 'tx_count', count(*),
                 'users', count(distinct user_id)) from tx),
    'by_band', coalesce((select jsonb_agg(b order by b.amount desc) from (
                 select band, sum(amount) as amount, count(*) as tx_count,
                        count(distinct user_id) as users
                 from tx group by band) b), '[]'::jsonb),
    'daily', coalesce((select jsonb_agg(d order by d.day) from (
                 select occurred_on as day, sum(amount) as amount from tx group by occurred_on) d),
               '[]'::jsonb),
    'top_users', coalesce((select jsonb_agg(u order by u.amount desc) from (
                 select user_id, name, birth_year, sum(amount) as amount, count(*) as tx_count
                 from tx group by user_id, name, birth_year
                 order by sum(amount) desc limit 8) u), '[]'::jsonb),
    'recent', coalesce((select jsonb_agg(r order by r.occurred_on desc, r.created_at desc) from (
                 select id, occurred_on, created_at, amount, note, user_id, name, birth_year
                 from tx order by occurred_on desc, created_at desc limit 15) r), '[]'::jsonb)
  ) end;
$$;

-- Like admin_day_detail, plus p_sex (2 filters).
create function public.admin_day_detail_by_segment(p_day date, p_age_band text default null,
  p_sex text default null)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with tx as (
    select t.id, t.kind, t.amount, t.note, t.created_at, t.user_id, t.category_id,
           c.name as category, c.icon, coalesce(p.full_name, p.email) as name, p.birth_year
    from public.transactions t
    join public.profiles p on p.id = t.user_id
    left join public.categories c on c.id = t.category_id
    where t.occurred_on = p_day and public.in_segment(p.birth_year, p.gender, p_age_band, p_sex)
  )
  select case when (select public.is_admin()) then jsonb_build_object(
    'day', p_day,
    'totals', (select jsonb_build_object(
                 'income', coalesce(sum(amount) filter (where kind = 'income'), 0),
                 'expense', coalesce(sum(amount) filter (where kind = 'expense'), 0),
                 'tx_count', count(*), 'users', count(distinct user_id)) from tx),
    'new_users', (select count(*) from public.profiles p
                  where (p.created_at at time zone 'Asia/Ulaanbaatar')::date = p_day
                    and public.in_segment(p.birth_year, p.gender, p_age_band, p_sex)),
    'categories', coalesce((select jsonb_agg(g order by g.amount desc) from (
                 select category_id as id, category as name, icon, kind, sum(amount) as amount,
                        count(*) as tx_count
                 from tx group by category_id, category, icon, kind) g), '[]'::jsonb),
    'transactions', coalesce((select jsonb_agg(r order by r.created_at desc) from (
                 select id, kind, amount, note, created_at, user_id, name, birth_year, category, icon
                 from tx order by created_at desc limit 40) r), '[]'::jsonb)
  ) end;
$$;

-- Like admin_age_bands, plus p_sex (gender next to the role check).
create function public.admin_age_bands_by_sex(period_days integer default 30, p_sex text default null)
returns table (
  band text, users bigint, active_users bigint, income numeric, expense numeric,
  savers bigint, saved_mnt numeric, saved_usd numeric
)
language sql
stable
set search_path = ''
as $$
  with people as (
    select p.id, public.age_band(p.birth_year) as band from public.profiles p where p.role = 'user' and public.in_segment(p.birth_year, p.gender, null, p_sex)
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

-- Like admin_category_by_age, plus p_sex (gender next to the role check).
create function public.admin_category_by_age_by_sex(
  period_days integer default 30,
  p_kind public.transaction_kind default 'expense',
  p_sex text default null
)
returns table (band text, category_id uuid, name text, icon text, total numeric, tx_count bigint)
language sql
stable
set search_path = ''
as $$
  select public.age_band(p.birth_year), c.id, c.name, c.icon, sum(t.amount), count(*)
  from public.transactions t
  join public.profiles p on p.id = t.user_id and p.role = 'user' and public.in_segment(p.birth_year, p.gender, null, p_sex)
  join public.categories c on c.id = t.category_id
  where t.kind = p_kind
    and t.occurred_on >= public.research_period_start(period_days)
    and (select public.is_admin())
  group by 1, c.id, c.name, c.icon;
$$;

-- Like admin_weekday_by_age, plus p_sex (gender next to the role check).
create function public.admin_weekday_by_age_by_sex(period_days integer default 30, p_sex text default null)
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
  join public.profiles p on p.id = t.user_id and p.role = 'user' and public.in_segment(p.birth_year, p.gender, null, p_sex)
  where t.occurred_on >= public.research_period_start(period_days)
    and (select public.is_admin())
  group by 1, 2;
$$;

-- Like admin_savings_cards, plus p_sex (gender next to the role check).
create function public.admin_savings_cards_by_sex(max_rows integer default 200, p_sex text default null)
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
  join public.profiles p on p.id = a.user_id and p.role = 'user' and public.in_segment(p.birth_year, p.gender, null, p_sex)
  left join (
    select account_id, sum(amount) as amount, count(*) as cnt, max(occurred_on) as last_on
    from public.savings_entries
    group by account_id
  ) e on e.account_id = a.id
  where (select public.is_admin())
  order by a.created_at desc
  limit least(greatest(max_rows, 1), 500);
$$;

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.in_segment(smallint, text, text, text)',
    'public.admin_overview_by_segment(text, text)',
    'public.admin_finance_totals_by_segment(date, date, text, text)',
    'public.admin_daily_metrics_by_segment(integer, text, text)',
    'public.admin_activity_heatmap_by_segment(integer, text, text)',
    'public.admin_top_users_by_segment(integer, integer, text, text)',
    'public.admin_category_totals_by_segment(integer, public.transaction_kind, text, text)',
    'public.admin_savings_flow_by_segment(integer, text, text)',
    'public.admin_category_detail_by_segment(uuid, integer, text, text)',
    'public.admin_day_detail_by_segment(date, text, text)',
    'public.admin_age_bands_by_sex(integer, text)',
    'public.admin_category_by_age_by_sex(integer, public.transaction_kind, text)',
    'public.admin_weekday_by_age_by_sex(integer, text)',
    'public.admin_savings_cards_by_sex(integer, text)'
  ] loop
    execute format('revoke execute on function %s from public, anon', fn);
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
end;
$$;

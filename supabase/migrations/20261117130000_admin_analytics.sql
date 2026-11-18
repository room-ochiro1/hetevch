-- Analytics RPCs for the admin dashboard and the user detail page. Read-only; each returns
-- no rows for non-admins. Days are Mongolian local days (Asia/Ulaanbaatar).
-- Money is bucketed by `occurred_on` (when it happened); engagement (active users, the
-- heatmap, top users) by `created_at` (when someone actually used the app).

-- One row per day for the last `period_days` days (1–366), oldest first.
create function public.admin_daily_metrics(period_days integer default 30)
returns table (
  day date,
  new_users bigint,
  active_users bigint,
  tx_count bigint,
  income numeric,
  expense numeric
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
  first_day as (
    select min(day) as day from days
  ),
  signups as (
    select (p.created_at at time zone 'Asia/Ulaanbaatar')::date as day, count(*) as cnt
    from public.profiles p, first_day f
    where p.created_at >= f.day::timestamp at time zone 'Asia/Ulaanbaatar'
    group by 1
  ),
  active as (
    select (t.created_at at time zone 'Asia/Ulaanbaatar')::date as day,
           count(distinct t.user_id) as users
    from public.transactions t, first_day f
    where t.created_at >= f.day::timestamp at time zone 'Asia/Ulaanbaatar'
    group by 1
  ),
  money as (
    select t.occurred_on as day,
           count(*) as cnt,
           coalesce(sum(t.amount) filter (where t.kind = 'income'), 0) as income,
           coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0) as expense
    from public.transactions t, first_day f
    where t.occurred_on >= f.day
    group by t.occurred_on
  )
  select d.day,
         coalesce(s.cnt, 0),
         coalesce(a.users, 0),
         coalesce(m.cnt, 0),
         coalesce(m.income, 0),
         coalesce(m.expense, 0)
  from days d
  left join signups s on s.day = d.day
  left join active a on a.day = d.day
  left join money m on m.day = d.day
  where (select public.is_admin())
  order by d.day;
$$;

-- When people log transactions: count per ISO weekday (1 = Monday … 7 = Sunday) and hour.
-- Only non-empty cells are returned.
create function public.admin_activity_heatmap(period_days integer default 30)
returns table (weekday smallint, hour smallint, tx_count bigint)
language sql
stable
set search_path = ''
as $$
  select extract(isodow from local_ts)::smallint,
         extract(hour from local_ts)::smallint,
         count(*)
  from (
    select t.created_at at time zone 'Asia/Ulaanbaatar' as local_ts
    from public.transactions t
    where t.created_at >= now() - make_interval(days => least(greatest(period_days, 1), 366))
      and (select public.is_admin())
  ) as recent
  group by 1, 2;
$$;

-- The most active users in the period, by number of transactions logged.
create function public.admin_top_users(period_days integer default 30, max_rows integer default 8)
returns table (
  user_id uuid,
  email text,
  full_name text,
  tx_count bigint,
  income numeric,
  expense numeric,
  last_active timestamptz
)
language sql
stable
set search_path = ''
as $$
  select p.id, p.email, p.full_name, count(*),
         coalesce(sum(t.amount) filter (where t.kind = 'income'), 0),
         coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0),
         max(t.created_at)
  from public.transactions t
  join public.profiles p on p.id = t.user_id
  where t.created_at >= now() - make_interval(days => least(greatest(period_days, 1), 366))
    and (select public.is_admin())
  group by p.id, p.email, p.full_name
  order by count(*) desc, max(t.created_at) desc
  limit least(greatest(max_rows, 1), 50);
$$;

-- One user's daily income/expense for the last `period_days` days, oldest first, zero-filled.
create function public.admin_user_daily(target_user_id uuid, period_days integer default 90)
returns table (day date, income numeric, expense numeric)
language sql
stable
set search_path = ''
as $$
  with days as (
    select d::date as day
    from generate_series(
      (now() at time zone 'Asia/Ulaanbaatar')::date - (least(greatest(period_days, 1), 366) - 1),
      (now() at time zone 'Asia/Ulaanbaatar')::date,
      interval '1 day'
    ) as d
  ),
  money as (
    select t.occurred_on as day,
           sum(t.amount) filter (where t.kind = 'income') as income,
           sum(t.amount) filter (where t.kind = 'expense') as expense
    from public.transactions t
    where t.user_id = target_user_id and t.occurred_on >= (select min(day) from days)
    group by t.occurred_on
  )
  select d.day, coalesce(m.income, 0), coalesce(m.expense, 0)
  from days d
  left join money m on m.day = d.day
  where (select public.is_admin())
  order by d.day;
$$;

-- One user's totals per category of one kind over the last `period_days` days, largest first.
create function public.admin_user_category_totals(
  target_user_id uuid,
  period_days integer default 90,
  p_kind public.transaction_kind default 'expense'
)
returns table (category_id uuid, name text, icon text, total numeric, tx_count bigint)
language sql
stable
set search_path = ''
as $$
  select c.id, c.name, c.icon, sum(t.amount), count(*)
  from public.transactions t
  join public.categories c on c.id = t.category_id
  where t.user_id = target_user_id
    and t.kind = p_kind
    and t.occurred_on > (now() at time zone 'Asia/Ulaanbaatar')::date
      - least(greatest(period_days, 1), 366)
    and (select public.is_admin())
  group by c.id, c.name, c.icon
  order by sum(t.amount) desc;
$$;

revoke execute on function public.admin_daily_metrics(integer) from public, anon;
revoke execute on function public.admin_activity_heatmap(integer) from public, anon;
revoke execute on function public.admin_top_users(integer, integer) from public, anon;
revoke execute on function public.admin_user_daily(uuid, integer) from public, anon;
revoke execute on function public.admin_user_category_totals(uuid, integer, public.transaction_kind)
  from public, anon;

grant execute on function public.admin_daily_metrics(integer) to authenticated;
grant execute on function public.admin_activity_heatmap(integer) to authenticated;
grant execute on function public.admin_top_users(integer, integer) to authenticated;
grant execute on function public.admin_user_daily(uuid, integer) to authenticated;
grant execute on function public.admin_user_category_totals(uuid, integer, public.transaction_kind)
  to authenticated;

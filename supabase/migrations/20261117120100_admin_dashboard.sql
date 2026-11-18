-- Admin dashboard support: role management, category management, and read-only stats RPCs.
-- Builds on 20261117040035_finance.sql. Every function returns nothing (or raises) for non-admins.
-- Signup days are bucketed in Mongolian local time; transactions already store a local `occurred_on`.

-- Change a user's role. Admins cannot demote themselves (avoids locking everyone out).
create function public.set_user_role(target_user_id uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change roles' using errcode = '42501';
  end if;
  if target_user_id = auth.uid() and new_role <> 'admin' then
    raise exception 'Admins cannot remove their own admin role' using errcode = '22023';
  end if;
  update public.profiles set role = new_role where id = target_user_id;
end;
$$;

-- Admins maintain the shared category list that every user picks from.
create policy "categories: admins insert" on public.categories
  for insert to authenticated
  with check ((select public.is_admin()));

create policy "categories: admins update" on public.categories
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "categories: admins delete" on public.categories
  for delete to authenticated
  using ((select public.is_admin()));

-- Headline numbers for the dashboard.
create function public.admin_overview()
returns table (
  total_users bigint,
  new_users_7d bigint,
  active_users_30d bigint,
  total_transactions bigint
)
language sql
stable
set search_path = ''
as $$
  select
    (select count(*) from public.profiles),
    (select count(*) from public.profiles where created_at >= now() - interval '7 days'),
    (select count(distinct user_id) from public.transactions
      where occurred_on > (now() at time zone 'Asia/Ulaanbaatar')::date - 30),
    (select count(*) from public.transactions)
  where (select public.is_admin());
$$;

-- One row per day for the last `period_days` days (1–366), oldest first.
create function public.admin_daily_activity(period_days integer default 30)
returns table (
  day date,
  new_users bigint,
  tx_count bigint,
  income numeric,
  expense numeric
)
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
  signups as (
    select (p.created_at at time zone 'Asia/Ulaanbaatar')::date as day, count(*) as cnt
    from public.profiles p
    where p.created_at >= (select min(day) from days)::timestamp at time zone 'Asia/Ulaanbaatar'
    group by 1
  ),
  tx as (
    select
      t.occurred_on as day,
      count(*) as cnt,
      coalesce(sum(t.amount) filter (where t.kind = 'income'), 0) as income,
      coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0) as expense
    from public.transactions t
    where t.occurred_on >= (select min(day) from days)
    group by t.occurred_on
  )
  select d.day, coalesce(s.cnt, 0), coalesce(x.cnt, 0), coalesce(x.income, 0), coalesce(x.expense, 0)
  from days d
  left join signups s on s.day = d.day
  left join tx x on x.day = d.day
  where (select public.is_admin())
  order by d.day;
$$;

-- Largest categories of one kind across all users in the last `period_days` days.
create function public.admin_category_totals(
  period_days integer default 30,
  p_kind public.transaction_kind default 'expense'
)
returns table (
  category_id uuid,
  name text,
  icon text,
  total numeric,
  tx_count bigint
)
language sql
stable
set search_path = ''
as $$
  select c.id, c.name, c.icon, sum(t.amount), count(*)
  from public.transactions t
  join public.categories c on c.id = t.category_id
  where t.kind = p_kind
    and t.occurred_on > (now() at time zone 'Asia/Ulaanbaatar')::date
      - least(greatest(period_days, 1), 366)
    and (select public.is_admin())
  group by c.id, c.name, c.icon
  order by sum(t.amount) desc
  limit 8;
$$;

-- Lifetime totals for one user, for the user detail page.
create function public.admin_user_summary(target_user_id uuid)
returns table (
  tx_count bigint,
  income numeric,
  expense numeric,
  last_occurred_on date
)
language sql
stable
set search_path = ''
as $$
  select
    count(*),
    coalesce(sum(t.amount) filter (where t.kind = 'income'), 0),
    coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0),
    max(t.occurred_on)
  from public.transactions t
  where t.user_id = target_user_id and (select public.is_admin());
$$;

revoke execute on function public.set_user_role(uuid, public.user_role) from public, anon;
revoke execute on function public.admin_overview() from public, anon;
revoke execute on function public.admin_daily_activity(integer) from public, anon;
revoke execute on function public.admin_category_totals(integer, public.transaction_kind) from public, anon;
revoke execute on function public.admin_user_summary(uuid) from public, anon;

grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;
grant execute on function public.admin_overview() to authenticated;
grant execute on function public.admin_daily_activity(integer) to authenticated;
grant execute on function public.admin_category_totals(integer, public.transaction_kind) to authenticated;
grant execute on function public.admin_user_summary(uuid) to authenticated;

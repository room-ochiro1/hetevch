-- Detail dialogs of the admin dashboard and the Судалгаа page. Each returns one jsonb object
-- with everything a dialog shows, or null for non-admins. Periods use
-- public.research_period_start (Ulaanbaatar days, today included); `p_age_band` narrows to one
-- band of public.age_band() and null means everyone.

-- One category: totals, split by age band, daily amounts, biggest users, latest transactions.
create function public.admin_category_detail(
  p_category_id uuid,
  period_days integer default 30,
  p_age_band text default null
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
      and public.in_age_band(p.birth_year, p_age_band)
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

-- One day: money in and out, sign-ups, categories, and that day's transactions.
create function public.admin_day_detail(p_day date, p_age_band text default null)
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
    where t.occurred_on = p_day and public.in_age_band(p.birth_year, p_age_band)
  )
  select case when (select public.is_admin()) then jsonb_build_object(
    'day', p_day,
    'totals', (select jsonb_build_object(
                 'income', coalesce(sum(amount) filter (where kind = 'income'), 0),
                 'expense', coalesce(sum(amount) filter (where kind = 'expense'), 0),
                 'tx_count', count(*), 'users', count(distinct user_id)) from tx),
    'new_users', (select count(*) from public.profiles p
                  where (p.created_at at time zone 'Asia/Ulaanbaatar')::date = p_day
                    and public.in_age_band(p.birth_year, p_age_band)),
    'categories', coalesce((select jsonb_agg(g order by g.amount desc) from (
                 select category_id as id, category as name, icon, kind, sum(amount) as amount,
                        count(*) as tx_count
                 from tx group by category_id, category, icon, kind) g), '[]'::jsonb),
    'transactions', coalesce((select jsonb_agg(r order by r.created_at desc) from (
                 select id, kind, amount, note, created_at, user_id, name, birth_year, category, icon
                 from tx order by created_at desc limit 40) r), '[]'::jsonb)
  ) end;
$$;

-- One age band (users only, like the Судалгаа page): who they are, money in and out, what
-- they spend on, which weekday, and what they save for (by the savings card's picture).
create function public.admin_band_detail(p_band text, period_days integer default 30)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with people as (
    select p.id, p.created_at, coalesce(p.full_name, p.email) as name, p.birth_year
    from public.profiles p
    where p.role = 'user' and public.age_band(p.birth_year) = p_band
  ),
  tx as (
    select t.user_id, t.kind, t.amount, t.occurred_on, t.category_id
    from public.transactions t join people pe on pe.id = t.user_id
    where t.occurred_on >= public.research_period_start(period_days)
  ),
  cards as (
    select a.user_id, a.icon, a.currency, a.goal_amount,
           a.principal + coalesce((select sum(e.amount) from public.savings_entries e
                                   where e.account_id = a.id), 0) as balance
    from public.savings_accounts a join people pe on pe.id = a.user_id
  )
  select case when (select public.is_admin()) then jsonb_build_object(
    'band', p_band,
    'users', (select count(*) from people),
    'new_users', (select count(*) from people
                  where created_at >= public.research_period_start(period_days)::timestamp
                                      at time zone 'Asia/Ulaanbaatar'),
    'active_users', (select count(distinct user_id) from tx),
    'income', (select coalesce(sum(amount), 0) from tx where kind = 'income'),
    'expense', (select coalesce(sum(amount), 0) from tx where kind = 'expense'),
    'tx_count', (select count(*) from tx),
    'top_expense', coalesce((select jsonb_agg(g order by g.amount desc) from (
                 select c.id, c.name, c.icon, sum(tx.amount) as amount, count(*) as tx_count,
                        count(distinct tx.user_id) as users
                 from tx join public.categories c on c.id = tx.category_id
                 where tx.kind = 'expense' group by c.id, c.name, c.icon
                 order by sum(tx.amount) desc limit 8) g), '[]'::jsonb),
    'top_income', coalesce((select jsonb_agg(g order by g.amount desc) from (
                 select c.id, c.name, c.icon, sum(tx.amount) as amount, count(*) as tx_count
                 from tx join public.categories c on c.id = tx.category_id
                 where tx.kind = 'income' group by c.id, c.name, c.icon
                 order by sum(tx.amount) desc limit 5) g), '[]'::jsonb),
    'weekday', coalesce((select jsonb_agg(w order by w.weekday) from (
                 select extract(isodow from occurred_on)::int as weekday,
                        coalesce(sum(amount) filter (where kind = 'expense'), 0) as expense,
                        count(*) as tx_count
                 from tx group by 1) w), '[]'::jsonb),
    'savings', (select jsonb_build_object(
                 'savers', count(distinct user_id), 'cards', count(*),
                 'saved_mnt', coalesce(sum(balance) filter (where currency = 'MNT'), 0),
                 'saved_usd', coalesce(sum(balance) filter (where currency = 'USD'), 0),
                 'goal_mnt', coalesce(sum(goal_amount) filter (where currency = 'MNT'), 0))
               from cards),
    'purposes', coalesce((select jsonb_agg(g order by g.cards desc) from (
                 select icon, count(*) as cards, count(distinct user_id) as savers,
                        coalesce(sum(balance) filter (where currency = 'MNT'), 0) as saved_mnt,
                        coalesce(sum(balance) filter (where currency = 'USD'), 0) as saved_usd,
                        coalesce(sum(goal_amount) filter (where currency = 'MNT'), 0) as goal_mnt
                 from cards group by icon) g), '[]'::jsonb),
    'top_users', coalesce((select jsonb_agg(u order by u.expense desc) from (
                 select pe.id as user_id, pe.name, pe.birth_year,
                        coalesce(sum(tx.amount) filter (where tx.kind = 'income'), 0) as income,
                        coalesce(sum(tx.amount) filter (where tx.kind = 'expense'), 0) as expense,
                        count(tx.*) as tx_count
                 from people pe join tx on tx.user_id = pe.id
                 group by pe.id, pe.name, pe.birth_year
                 order by 5 desc limit 6) u), '[]'::jsonb)
  ) end;
$$;

revoke execute on function public.admin_category_detail(uuid, integer, text) from public, anon;
revoke execute on function public.admin_day_detail(date, text) from public, anon;
revoke execute on function public.admin_band_detail(text, integer) from public, anon;
grant execute on function public.admin_category_detail(uuid, integer, text) to authenticated;
grant execute on function public.admin_day_detail(date, text) to authenticated;
grant execute on function public.admin_band_detail(text, integer) to authenticated;

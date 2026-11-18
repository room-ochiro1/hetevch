-- Demo data for Хэтэвч: ~2 months of realistic income/expense for showing the app.
-- How to use: Supabase dashboard → SQL Editor → paste this whole file → Run.
-- Who gets it: admin accounts (the owner) that don't have demo rows yet, even if they already
-- entered real transactions. Running it twice adds nothing, and ordinary users never get demo
-- data. To demo another account instead, change `p.role = 'admin'` below to `p.email = '…'`.
-- created_at is a realistic local time on the transaction's day (so activity charts and
-- row times look real), stamped with seconds = 0 and microseconds = 424242. That invisible
-- marker lets clear_demo_data.sql remove exactly these rows and nothing entered by hand.
-- Not a migration: it lives outside supabase/migrations on purpose.

with demo (days_ago, at_time, kind, category, amount, note) as (
  values
    -- income
    (58, '10:05', 'income', 'Цалин', 2500000, 'Сарын цалин'),
    (28, '10:12', 'income', 'Цалин', 2500000, 'Сарын цалин'),
    (41, '15:40', 'income', 'Бизнес', 350000, 'Онлайн захиалга'),
    (12, '16:25', 'income', 'Бизнес', 420000, 'Онлайн захиалга'),
    (20, '19:30', 'income', 'Бэлэг', 100000, 'Төрсөн өдрийн бэлэг'),
    (5, '14:10', 'income', 'Бусад орлого', 60000, 'Хуучин утас зарсан'),
    -- fixed costs
    (57, '09:20', 'expense', 'Орон сууц', 800000, 'Байрны түрээс'),
    (27, '09:35', 'expense', 'Орон сууц', 800000, 'Байрны түрээс'),
    (54, '20:15', 'expense', 'Төлбөр', 86000, 'Цахилгааны төлбөр'),
    (52, '21:05', 'expense', 'Төлбөр', 45000, 'Интернэт'),
    (24, '20:40', 'expense', 'Төлбөр', 91000, 'Цахилгааны төлбөр'),
    (22, '21:10', 'expense', 'Төлбөр', 45000, 'Интернэт'),
    (50, '18:30', 'expense', 'Боловсрол', 150000, 'Англи хэлний сургалт'),
    (19, '17:45', 'expense', 'Боловсрол', 32000, 'Ном'),
    -- food
    (56, '18:50', 'expense', 'Хүнс', 68000, 'Долоо хоногийн хүнс'),
    (53, '12:40', 'expense', 'Хоол', 14500, 'Үдийн хоол'),
    (49, '19:05', 'expense', 'Хүнс', 72000, 'Долоо хоногийн хүнс'),
    (46, '09:15', 'expense', 'Хоол', 9800, 'Кофе'),
    (42, '18:35', 'expense', 'Хүнс', 64000, 'Долоо хоногийн хүнс'),
    (38, '20:30', 'expense', 'Хоол', 35000, 'Найзуудтай оройн хоол'),
    (35, '19:20', 'expense', 'Хүнс', 70500, 'Долоо хоногийн хүнс'),
    (31, '13:05', 'expense', 'Хоол', 12500, 'Үдийн хоол'),
    (26, '18:45', 'expense', 'Хүнс', 66000, 'Долоо хоногийн хүнс'),
    (21, '08:50', 'expense', 'Хоол', 8500, 'Кофе'),
    (18, '19:10', 'expense', 'Хүнс', 75000, 'Долоо хоногийн хүнс'),
    (14, '20:00', 'expense', 'Хоол', 42000, 'Гэр бүлийн оройн хоол'),
    (11, '18:55', 'expense', 'Хүнс', 69000, 'Долоо хоногийн хүнс'),
    (7, '12:30', 'expense', 'Хоол', 13500, 'Үдийн хоол'),
    (4, '19:25', 'expense', 'Хүнс', 71000, 'Долоо хоногийн хүнс'),
    (2, '09:05', 'expense', 'Хоол', 9500, 'Кофе'),
    (0, '12:20', 'expense', 'Хоол', 15000, 'Үдийн хоол'),
    -- transport
    (55, '08:15', 'expense', 'Тээвэр', 60000, 'Шатахуун'),
    (47, '22:10', 'expense', 'Тээвэр', 12000, 'Такси'),
    (40, '08:25', 'expense', 'Тээвэр', 60000, 'Шатахуун'),
    (33, '21:40', 'expense', 'Тээвэр', 15000, 'Такси'),
    (25, '08:10', 'expense', 'Тээвэр', 62000, 'Шатахуун'),
    (16, '22:00', 'expense', 'Тээвэр', 11000, 'Такси'),
    (9, '08:30', 'expense', 'Тээвэр', 61000, 'Шатахуун'),
    (1, '21:50', 'expense', 'Тээвэр', 13000, 'Такси'),
    -- shopping, health, fun, other
    (44, '16:30', 'expense', 'Дэлгүүр', 129000, 'Өвлийн гутал'),
    (30, '17:15', 'expense', 'Дэлгүүр', 48000, 'Гэр ахуйн бараа'),
    (13, '15:50', 'expense', 'Дэлгүүр', 89000, 'Цамц'),
    (37, '11:20', 'expense', 'Эрүүл мэнд', 18000, 'Эм'),
    (10, '10:40', 'expense', 'Эрүүл мэнд', 45000, 'Шүдний эмч'),
    (43, '20:45', 'expense', 'Зугаа цэнгэл', 25000, 'Кино'),
    (23, '19:50', 'expense', 'Зугаа цэнгэл', 30000, 'Боулинг'),
    (6, '21:15', 'expense', 'Зугаа цэнгэл', 25000, 'Кино'),
    (34, '14:35', 'expense', 'Бусад', 20000, 'Бэлэг худалдаж авсан'),
    (3, '13:45', 'expense', 'Бусад', 15000, 'Утасны цэнэглэгч')
),
today as (
  select (now() at time zone 'Asia/Ulaanbaatar')::date as day
),
targets as (
  select p.id
  from public.profiles p
  where p.role = 'admin'
    and not exists (
      select 1 from public.transactions t
      where t.user_id = p.id
        and extract(microseconds from t.created_at)::bigint % 60000000 = 424242
    )
)
insert into public.transactions (user_id, kind, amount, category_id, note, occurred_on, created_at)
select
  targets.id,
  demo.kind::public.transaction_kind,
  demo.amount,
  c.id,
  demo.note,
  today.day - demo.days_ago,
  -- Local time on that day, never in the future, then the demo marker (0 s, 424242 µs).
  least(
    ((today.day - demo.days_ago) + demo.at_time::time) at time zone 'Asia/Ulaanbaatar',
    date_trunc('minute', now())
  ) + interval '424242 microseconds'
from targets
cross join demo
cross join today
-- Built-in categories only: users' own categories can share a name (and are private to them).
join public.categories c
  on c.owner_id is null and c.kind = demo.kind::public.transaction_kind and c.name = demo.category;

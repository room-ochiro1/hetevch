-- More built-in expense categories, by the owner's request: "Хоол хүнс" becomes two (eating
-- vs groceries), plus beauty and loan repayments.
--
-- The old row is renamed to "Хоол" and keeps its id, so every existing transaction stays where
-- it was (nothing is moved or lost); users can re-file grocery shopping under "Хүнс" themselves.
-- Colours map to palette slots in apps/mobile/src/constants/category-colors.ts.

update public.categories
set name = 'Хоол'
where owner_id is null and kind = 'expense' and name = 'Хоол хүнс';

-- Skips any that an admin already added by hand with the same name.
insert into public.categories (kind, name, icon, color, sort_order)
select 'expense', v.name, v.icon, v.color, v.sort_order
from (
  values
    ('Хүнс', '🛒', '#16A34A', 15),
    ('Гоо сайхан', '💄', '#DB2777', 35),
    ('Зээл', '🏦', '#DC2626', 55)
) as v (name, icon, color, sort_order)
where not exists (
  select 1 from public.categories c
  where c.owner_id is null and c.kind = 'expense' and c.name = v.name
);

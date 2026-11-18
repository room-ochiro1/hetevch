-- User-added categories. A category with owner_id = null is a built-in one that every user
-- sees and only admins change. A category with an owner is that user's own: only they (and
-- admins) can see it, and only they can change or delete it.

alter table public.categories
  add column owner_id uuid references public.profiles (id) on delete cascade;

create index categories_owner_id_idx on public.categories (owner_id);

-- Limits the app enforces too. Emoji sequences (skin tones, ZWJ families, flags) are several
-- code points, so the icon allows up to 16.
alter table public.categories
  add constraint categories_name_length check (char_length(btrim(name)) between 1 and 40),
  add constraint categories_icon_length check (char_length(icon) between 1 and 16);

-- One name per kind per user, ignoring case and surrounding spaces.
create unique index categories_owner_kind_name_key
  on public.categories (owner_id, kind, lower(btrim(name)))
  where owner_id is not null;

-- Deleting a profile cascades to both its transactions and its categories. RESTRICT is checked
-- at once and could fire before the transactions are gone; NO ACTION waits for the end of the
-- statement. Deleting a category that transactions still use is refused either way (23503).
alter table public.transactions
  drop constraint transactions_category_id_kind_fkey,
  add constraint transactions_category_id_kind_fkey
    foreign key (category_id, kind) references public.categories (id, kind) on delete no action;

-- Read: built-in categories, your own, or everything for an admin. --------------------

drop policy "categories: signed-in users read" on public.categories;

create policy "categories: built-in, own or admin" on public.categories
  for select to authenticated
  using (
    owner_id is null
    or owner_id = (select auth.uid())
    or (select public.is_admin())
  );

-- Write: users manage only their own; built-ins stay with the admin policies. -------------

create policy "categories: users insert own" on public.categories
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "categories: users update own" on public.categories
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "categories: users delete own" on public.categories
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- A transaction may use a built-in category or one its owner made, never another user's. ---

create policy "transactions: category is built-in or own" on public.transactions
  as restrictive for insert to authenticated
  with check (
    exists (
      select 1 from public.categories c
      where c.id = category_id and (c.owner_id is null or c.owner_id = user_id)
    )
  );

create policy "transactions: category stays built-in or own" on public.transactions
  as restrictive for update to authenticated
  using (true)
  with check (
    exists (
      select 1 from public.categories c
      where c.id = category_id and (c.owner_id is null or c.owner_id = user_id)
    )
  );

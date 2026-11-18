-- Device accounts: the mobile app has no sign-in screen. On first launch it signs in
-- anonymously (Supabase anonymous sign-ins must be enabled) and links that session to an
-- app-scoped device key: Android ANDROID_ID, or a random secret in the iOS Keychain. Both
-- survive uninstall/reinstall. After a reinstall the app gets a new anonymous user, presents
-- the same key, and claim_device() moves the old account's data to it.
-- Only a SHA-256 hash of the key is stored. Anyone who has the raw key can claim the data,
-- which is the accepted trade-off of "no sign-in" (the key never leaves the phone otherwise).

alter table public.profiles
  add column birth_year smallint check (birth_year between 1900 and 2100);

-- Users fill in their own name and birth year on the welcome screen.
grant update (birth_year) on public.profiles to authenticated;

create table public.device_links (
  key_hash text primary key check (key_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('android', 'ios', 'web')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.device_links enable row level security;

-- App users never touch this table directly; claim_device() (security definer) does.
revoke insert, update, delete on public.device_links from anon, authenticated;

create policy "device_links: admins read all" on public.device_links
  for select to authenticated
  using ((select public.is_admin()));

-- Links the caller's (anonymous) session to this device, or restores the account that was
-- linked to it before. Returns whether data was restored and whether the welcome form is due.
create function public.claim_device(device_key text, device_platform text)
returns table (restored boolean, needs_onboarding boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  v_hash text;
  v_prev uuid;
  fk record;
begin
  if me is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if device_key is null or char_length(device_key) not between 8 and 200 then
    raise exception 'invalid_device_key' using errcode = '22023';
  end if;
  if device_platform is null or device_platform not in ('android', 'ios', 'web') then
    raise exception 'invalid_platform' using errcode = '22023';
  end if;
  -- The owner's admin account signs in with email and is never device-linked or moved.
  if exists (select 1 from public.profiles where id = me and role = 'admin') then
    raise exception 'admin_account' using errcode = '42501';
  end if;

  v_hash := encode(sha256(convert_to('hetevch-device:' || device_key, 'UTF8')), 'hex');
  select dl.user_id into v_prev from public.device_links dl where dl.key_hash = v_hash for update;

  restored := false;
  if v_prev is null then
    -- First launch on this device (or this session already owns another key: re-point it).
    delete from public.device_links where user_id = me;
    insert into public.device_links (key_hash, user_id, platform) values (v_hash, me, device_platform);
  elsif v_prev = me then
    update public.device_links set last_seen_at = now() where key_hash = v_hash;
  else
    if exists (select 1 from public.profiles where id = v_prev and role = 'admin') then
      raise exception 'admin_account' using errcode = '42501';
    end if;
    -- Move every row in public that points at the old profile (transactions, savings, and
    -- any table added later with a single-column FK to profiles).
    for fk in
      select n.nspname as schema_name, c.relname as table_name, a.attname as column_name
      from pg_constraint con
      join pg_class c on c.oid = con.conrelid
      join pg_namespace n on n.oid = c.relnamespace
      join pg_attribute a on a.attrelid = con.conrelid and a.attnum = con.conkey[1]
      where con.contype = 'f'
        and con.confrelid = 'public.profiles'::regclass
        and array_length(con.conkey, 1) = 1
        and n.nspname = 'public'
        and c.relname <> 'device_links'
    loop
      execute format('update %I.%I set %I = $1 where %I = $2',
        fk.schema_name, fk.table_name, fk.column_name, fk.column_name)
        using me, v_prev;
    end loop;

    update public.profiles p
    set full_name = old.full_name,
        avatar_url = old.avatar_url,
        birth_year = old.birth_year,
        created_at = old.created_at
    from public.profiles old
    where p.id = me and old.id = v_prev;

    delete from public.device_links where user_id = me;
    update public.device_links
    set user_id = me, platform = device_platform, last_seen_at = now()
    where key_hash = v_hash;

    -- The old anonymous user is now empty; removing it cascades to its profile.
    delete from auth.users where id = v_prev;
    restored := true;
  end if;

  select (p.full_name is null or p.birth_year is null) into needs_onboarding
  from public.profiles p where p.id = me;
  return next;
end;
$$;

revoke execute on function public.claim_device(text, text) from public, anon;
grant execute on function public.claim_device(text, text) to authenticated;

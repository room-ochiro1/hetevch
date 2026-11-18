-- Lets a signed-in user delete their own account from inside the app, as the App Store and
-- Google Play require for apps with sign-up. Deleting the auth user cascades to
-- public.profiles and from there to public.transactions, so nothing personal is left behind.

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  -- The owner's admin account is managed in the dashboard, never removed by one tap in the app.
  if exists (select 1 from public.profiles where id = me and role = 'admin') then
    raise exception 'admin_account' using errcode = '42501';
  end if;
  delete from auth.users where id = me;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

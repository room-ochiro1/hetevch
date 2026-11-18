-- A record of each time a user accepted the terms of service and the privacy policy, so the
-- service can show what was agreed to and when (the welcome dialog will not start without it).
-- Versions are the documents' "updated" dates shown in the app (apps/mobile/src/content).
-- Rows are append-only: users can add and read their own, never change or delete them; they
-- go away with the account (cascade) and move with it when a phone restores its data.

create table public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  terms_version text not null check (terms_version ~ '^\d{4}-\d{2}-\d{2}$'),
  privacy_version text not null check (privacy_version ~ '^\d{4}-\d{2}-\d{2}$'),
  accepted_at timestamptz not null default now()
);

create index legal_consents_user_idx on public.legal_consents (user_id, accepted_at desc);

alter table public.legal_consents enable row level security;

revoke update, delete on public.legal_consents from anon, authenticated;

create policy "legal_consents: insert own"
  on public.legal_consents for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "legal_consents: read own"
  on public.legal_consents for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "legal_consents: admins read all"
  on public.legal_consents for select to authenticated
  using ((select public.is_admin()));

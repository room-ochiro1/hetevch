-- Indexes for the queries that scan by date, so they stay fast as data grows.
--
-- Admin dashboard / Судалгаа: every chart asks "all transactions (or savings moves) since day
-- X", across all users. The existing transactions index starts with user_id, which does not
-- help a date range over everyone.
create index if not exists transactions_occurred_on_idx
  on public.transactions (occurred_on);

create index if not exists savings_entries_occurred_on_idx
  on public.savings_entries (occurred_on);

-- App: the transaction list and overview ask for one user's savings moves in a date range.
create index if not exists savings_entries_user_date_idx
  on public.savings_entries (user_id, occurred_on desc);

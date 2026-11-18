-- Removes only the rows added by seed_demo_data.sql. Transactions people entered
-- themselves are not touched.
-- Marker: seconds = 0 and microseconds = 424242 in created_at (real rows come from now(),
-- so a collision is about 1 in 60 million per row). Also removes rows from the first
-- version of the seed, which used created_at = 2000-01-01.
-- How to use: Supabase dashboard → SQL Editor → paste → Run.

delete from public.transactions
where extract(microseconds from created_at)::bigint % 60000000 = 424242
   or created_at = timestamptz '2000-01-01 00:00:00+00';

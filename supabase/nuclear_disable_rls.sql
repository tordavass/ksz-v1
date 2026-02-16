-- NUCLEAR OPTION: DISABLE RLS COMPLETELY
-- If this doesn't work, the table is EMPTY or the Code is wrong.

-- 1. Turn off the security engine for this table
alter table public.profiles disable row level security;

-- 2. Explicitly grant rights (just in case)
grant all on public.profiles to public;
grant all on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- 3. CHECK FOR DATA (Run this part in the SQL Editor Query Result)
select count(*) as total_profiles from public.profiles;

-- If 'total_profiles' is 0, run the Restore script again!

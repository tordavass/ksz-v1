-- FINAL LOGIN FIX (Breaking the Recursion Loop)

-- 1. Enable RLS
alter table public.profiles enable row level security;

-- 2. Drop existing restrictive policies
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- 3. ALLOW ALL READS (This fixes the Login Loop)
-- Since we need to read the 'role' to know permissions, we allow reading profiles.
-- Names and Roles are generally public info in a school system anyway.
create policy "Authenticated users can view any profile" on public.profiles
  for select using (auth.role() = 'authenticated');

-- 4. RESTRICT WRITES (Keep security high here)
-- Only Admins can update others
create policy "Admins can update all profiles" on public.profiles
  for update using (public.is_admin());

-- Users can update themselves (optional, for avatar/name)
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

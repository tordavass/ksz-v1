-- Security Fix: Implement Trusted Function to avoid Recursion

-- 1. Create Helper Function (Bypasses RLS due to security definer)
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- 2. Re-Enable RLS
alter table public.profiles enable row level security;

-- 3. Clean up old policies (to avoid conflicts or logic mess)
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles; -- Cleanup old insert policy if exists (triggers handle inserts now)
drop policy if exists "Users can update own profile" on public.profiles;

-- 4. Define Clean Policies using the new function

-- Self Access
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Admin Access (Uses helper to avoid recursion)
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

create policy "Admins can update all profiles" on public.profiles
  for update using (public.is_admin());

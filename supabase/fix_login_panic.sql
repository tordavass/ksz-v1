-- EMERGENCY FIX FOR LOGIN
-- 1. Ensure profiles exist (Restore)
insert into public.profiles (id, full_name, avatar_url, role)
select 
  id, 
  coalesce(raw_user_meta_data->>'full_name', 'Unknown User'), 
  raw_user_meta_data->>'avatar_url',
  coalesce((raw_user_meta_data->>'role')::public.user_role, 'student')
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- 2. Fix RLS on Profiles (This is likely why it fails silently)
alter table public.profiles enable row level security;

-- Drop old policies to ensure clean state
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

-- Allow users to view their own profile (Critical for Login redirect)
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Allow Admins to view everything
create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Allow Admins to update everything
create policy "Admins can update all profiles" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

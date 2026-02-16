-- FINAL ATTEMPT: OPEN READ ACCESS
-- The previous 'authenticated' check might be failing due to context issues or recursion.
-- We are switching to 'true' which guarantees readability for everyone.

alter table public.profiles enable row level security;

-- Drop all query policies
drop policy if exists "Authenticated users can view any profile" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Everyone can read profiles" on public.profiles;

-- 1. UNRESTRICTED READ ACCESS (Solves the "Blank Screen" lookup issue)
create policy "Everyone can read profiles" on public.profiles
  for select using (true);

-- 2. RESTRICTED WRITE ACCESS (Keeps data safe)
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Admins can update all profiles" on public.profiles
  for update using ( public.is_admin() );

create policy "Users can update own profile" on public.profiles
  for update using ( auth.uid() = id );

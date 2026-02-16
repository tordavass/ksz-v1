-- Fix: Allow Principals to view profiles in their school
-- Currently only "Self" and "Admin" can view profiles.

-- 1. Helper functions to avoid infinite recursion in RLS policies
create or replace function public.get_my_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid()
$$ language sql security definer;

create or replace function public.get_my_school_id()
returns uuid as $$
  select school_id from public.profiles where id = auth.uid()
$$ language sql security definer;

-- 2. Add Policy for Principals
drop policy if exists "Principals can view their school profiles" on public.profiles;

create policy "Principals can view their school profiles" on public.profiles
  for select using (
    (public.get_my_role() = 'principal' OR public.get_my_role() = 'homeroom_teacher')
    AND
    school_id = public.get_my_school_id()
  );

-- Note: This requires that the Principal's profile has 'school_id' set (which we fixed in the previous step).

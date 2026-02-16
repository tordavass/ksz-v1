-- Allow Principals and Homeroom Teachers to view Classes in their School
-- Currently, RLS might be blocking them.

-- 1. Helper function (already exists, but good to recall)
-- get_my_school_id()

-- 2. Add Policy for SELECT on Classes
DROP POLICY IF EXISTS "School staff can view their school classes" ON public.classes;

CREATE POLICY "School staff can view their school classes" ON public.classes
  FOR SELECT
  USING (
    school_id = public.get_my_school_id()
  );

-- 3. Also Ensure Service Logs are viewable by Principal
-- (Since charts depend on it)
DROP POLICY IF EXISTS "Principals can view school logs" ON public.service_logs;

CREATE POLICY "Principals can view school logs" ON public.service_logs
  FOR SELECT
  USING (
    exists (
      select 1 from public.profiles
      where profiles.id = service_logs.student_id
      and profiles.school_id = public.get_my_school_id()
    )
  );

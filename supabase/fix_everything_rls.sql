-- COMPREHENSIVE RLS FIX
-- Redefines helper functions and reapplies policies for Principal visibility.

-- 1. Helper Function: get_my_school_id
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT school_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Helper Function: get_my_role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Policy: Profiles (Principal can view Students/Teachers in their school)
DROP POLICY IF EXISTS "Principals can view their school profiles" ON public.profiles;
CREATE POLICY "Principals can view their school profiles" ON public.profiles
  FOR SELECT
  USING (
    (public.get_my_role() = 'principal' OR public.get_my_role() = 'homeroom_teacher')
    AND
    school_id = public.get_my_school_id()
  );

-- 4. Policy: Classes (Principal can view Classes in their school)
DROP POLICY IF EXISTS "School staff can view their school classes" ON public.classes;
CREATE POLICY "School staff can view their school classes" ON public.classes
  FOR SELECT
  USING (
    school_id = public.get_my_school_id()
  );

-- 5. Policy: Service Logs (Principal can view Logs of Students in their school)
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

-- 6. Policy: Contracts (Principal can view Contracts in their school)
DROP POLICY IF EXISTS "Principals can view school contracts" ON public.contracts;
CREATE POLICY "Principals can view school contracts" ON public.contracts
  FOR SELECT
  USING (
    school_id = public.get_my_school_id()
  );

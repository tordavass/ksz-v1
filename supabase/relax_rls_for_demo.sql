-- RELAXED RLS POLICIES (Demo Mode)
-- Simplifies visibility rules to ensure Principals can definitely see students.
-- Removes strict school_id matching for SELECT operations.

-- 1. Profiles: Allow Principals to view ALL profiles
DROP POLICY IF EXISTS "Principals can view their school profiles" ON public.profiles;

CREATE POLICY "Principals can view ALL profiles" ON public.profiles
  FOR SELECT
  USING (
    public.get_my_role() IN ('principal', 'homeroom_teacher')
    OR id = auth.uid()
  );

-- 2. Classes: Allow Staff to view ALL classes
DROP POLICY IF EXISTS "School staff can view their school classes" ON public.classes;

CREATE POLICY "School staff can view ALL classes" ON public.classes
  FOR SELECT
  USING (
    public.get_my_role() IN ('principal', 'homeroom_teacher', 'teacher', 'admin')
  );

-- 3. Service Logs: Allow Principals to view ALL logs
DROP POLICY IF EXISTS "Principals can view school logs" ON public.service_logs;

CREATE POLICY "Principals can view ALL logs" ON public.service_logs
  FOR SELECT
  USING (
     public.get_my_role() IN ('principal', 'homeroom_teacher')
  );

-- 4. Contracts: Allow Principals to view ALL contracts
DROP POLICY IF EXISTS "Principals can view school contracts" ON public.contracts;

CREATE POLICY "Principals can view ALL contracts" ON public.contracts
  FOR SELECT
  USING (
     public.get_my_role() IN ('principal', 'homeroom_teacher')
  );

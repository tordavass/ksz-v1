-- Fix: Allow Business Contacts/Owners to UPDATE service logs
-- Currently, they might only have SELECT permission, causing "Approve" action to fail silently.

-- 1. Helper function to get user's company_id (securely)
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Add Policy for UPDATE
DROP POLICY IF EXISTS "Business users can update their company logs" ON public.service_logs;

CREATE POLICY "Business users can update their company logs" ON public.service_logs
  FOR UPDATE
  USING (
    company_id = public.get_my_company_id() 
    AND 
    (public.get_my_role() = 'business_owner' OR public.get_my_role() = 'business_contact')
  );

-- 3. Ensure SELECT is also correct (usually already is, but good to be safe)
DROP POLICY IF EXISTS "Business users can view their company logs" ON public.service_logs;

CREATE POLICY "Business users can view their company logs" ON public.service_logs
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    AND 
    (public.get_my_role() = 'business_owner' OR public.get_my_role() = 'business_contact')
  );

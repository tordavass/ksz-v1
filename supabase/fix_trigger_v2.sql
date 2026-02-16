-- FIX TRIGGER V2: RENAMING AND SEARCH_PATH
-- Run this in Supabase SQL Editor

-- 1. Drop OLD trigger and function to clean up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create NEW Function (v2) with explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_v2()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public -- Ensures we find 'profiles' and 'user_role'
AS $function$
DECLARE
  v_role_enum user_role;
BEGIN
  -- Safe Cast Logic
  BEGIN
    v_role_enum := (new.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role_enum := 'student'::user_role;
  END;

  -- Insert Logic
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown User'),
    v_role_enum
  );
  
  RETURN new;
END;
$function$;

-- 3. Create Trigger pointing to NEW function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_v2();

-- 4. Ensure Permissions
GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO service_role;

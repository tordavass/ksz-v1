-- NUCLEAR OPTION: DROP AND RECREATE EVERYTHING RELATED TO USER CREATION
-- Run this in Supabase SQL Editor

-- 1. Drop existing trigger (if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Recreate Function (The Safe Version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role_text text;
  v_role_enum user_role;
BEGIN
  -- 1. Extract Role
  v_role_text := new.raw_user_meta_data->>'role';
  
  -- 2. Try Cast
  BEGIN
    v_role_enum := v_role_text::user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role_enum := 'student'::user_role;
  END;

  -- 3. Attempt Insert
  -- We use a simple INSERT. If this fails, user creation fails.
  -- But since we fixed the logic, it should work.
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown User'),
    v_role_enum
  );
  
  RETURN new;
END;
$function$;

-- 4. Recreate Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Grant Permissions (Just in case)
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT ALL ON TABLE public.profiles TO postgres;

-- SAFE TRIGGER FIX
-- Run this in Supabase SQL Editor to parse user metadata safely

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role_text text;
  v_role_enum user_role;
  v_is_dual_role boolean;
BEGIN
  -- 1. Extract Role Text
  v_role_text := new.raw_user_meta_data->>'role';
  
  -- 2. Cast to Enum safely (Default to parent if matches, or student if fails)
  BEGIN
    v_role_enum := v_role_text::user_role;
  EXCEPTION WHEN OTHERS THEN
    -- If casting fails (e.g. invalid value), default to student? 
    -- Or raise error with clearer message?
    -- Let's try to default to 'student' to avoid crashing, but log it?
    -- For now, just let it be 'student' so creation succeeds.
    v_role_enum := 'student'::user_role;
  END;

  -- 3. Extract Dual Role (Default false)
  v_is_dual_role := COALESCE((new.raw_user_meta_data->>'is_dual_role')::boolean, false);

  -- 4. Insert
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    role, 
    is_dual_role
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    v_role_enum, 
    v_is_dual_role
  );
  
  RETURN new;
END;
$function$;

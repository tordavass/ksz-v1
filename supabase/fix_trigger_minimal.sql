-- MINIMAL TRIGGER FIX
-- This version attempts strictly minimal insert to diagnose the crasher.

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

  -- 3. Attempt Insert (Minimal Columns)
  -- We SKIP is_dual_role and avatar_url to rule them out.
  BEGIN
      INSERT INTO public.profiles (id, full_name, role)
      VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown User'),
        v_role_enum
      );
  EXCEPTION WHEN OTHERS THEN
      -- IF even this fails, try FALLBACK to student role hardcoded
      BEGIN
        INSERT INTO public.profiles (id, full_name, role)
        VALUES (new.id, 'Fallback User', 'student'::user_role);
      EXCEPTION WHEN OTHERS THEN
        -- If EVERYTHING fails, do nothing so Auth User is still created.
        -- We can verify this state.
        RAISE WARNING 'Profile creation failed completely: %', SQLERRM;
      END;
  END;
  
  RETURN new;
END;
$function$;

-- DEBUG: Manually attempt to insert a Parent Profile matches handle_new_user logic.
-- This will reveal if there are missing columns, constraint violations, or enum issues.

DO $$
DECLARE
    v_test_id uuid := gen_random_uuid();
BEGIN
    INSERT INTO public.profiles (
        id, 
        full_name, 
        role,
        is_dual_role
        -- avatar_url is omitted as it is null in the action
    )
    VALUES (
        v_test_id, 
        'Debug Parent User', 
        'parent', -- This must exist in user_role enum
        false
    );

    RAISE NOTICE 'Success! Parent inserted with ID: %', v_test_id;

    -- Cleanup
    DELETE FROM public.profiles WHERE id = v_test_id;
END $$;

-- Force Unify: Move EVERYTHING to the main school "Óbudai Gimnázium"
-- This ensures Principal, Classes, and Students are all on the same page.

DO $$
DECLARE
    v_main_school_id uuid;
    v_principal_id uuid;
BEGIN
    -- 1. Find the Main School (prefer 'Óbudai', fallback to any)
    SELECT id INTO v_main_school_id
    FROM schools
    WHERE name ILIKE '%Óbudai%'
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_main_school_id IS NULL THEN
        SELECT id INTO v_main_school_id FROM schools LIMIT 1;
    END IF;

    -- 2. Find the Principal User
    SELECT id INTO v_principal_id
    FROM profiles
    WHERE role = 'principal'
    LIMIT 1;

    IF v_main_school_id IS NOT NULL AND v_principal_id IS NOT NULL THEN
        
        -- A. Link School -> Principal
        UPDATE schools 
        SET principal_id = v_principal_id 
        WHERE id = v_main_school_id;

        -- B. Link Principal -> School
        UPDATE profiles
        SET school_id = v_main_school_id
        WHERE id = v_principal_id;

        -- C. Link ALL Classes -> School
        UPDATE classes
        SET school_id = v_main_school_id;

        -- D. Link ALL Students/Teachers -> School
        -- NOTE: 'teacher' is not a valid enum value in this schema, only 'homeroom_teacher'.
        UPDATE profiles
        SET school_id = v_main_school_id
        WHERE role IN ('student', 'homeroom_teacher'); 

        RAISE NOTICE 'Unified EVERYTHING under School ID % (Principal: %)', v_main_school_id, v_principal_id;
    ELSE
        RAISE EXCEPTION 'Could not find a School or a Principal user.';
    END IF;
END $$;

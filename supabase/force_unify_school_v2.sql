-- Force Unify V2: Align ALL Principals to the Main School
-- This ensures that no matter WHICH principal account is logged in, they see the same data.

DO $$
DECLARE
    v_main_school_id uuid;
BEGIN
    -- 1. Find or pick the main school (prefer 'Óbudai', fallback to any)
    SELECT id INTO v_main_school_id
    FROM schools
    WHERE name ILIKE '%Óbudai%'
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_main_school_id IS NULL THEN
        SELECT id INTO v_main_school_id FROM schools LIMIT 1;
    END IF;

    IF v_main_school_id IS NOT NULL THEN
        
        -- A. Link ALL Principals to this School
        -- (This fixes the case where multiple principal accounts exist)
        UPDATE profiles
        SET school_id = v_main_school_id
        WHERE role = 'principal';

        -- B. Also ensure the School points to ONE of them (arbitrarily the latest created one)
        -- (Ideally, the school knows its principal, but for RLS, the principal knowing the school is more critical)
        UPDATE schools 
        SET principal_id = (
            SELECT id FROM profiles WHERE role = 'principal' ORDER BY created_at DESC LIMIT 1
        )
        WHERE id = v_main_school_id;

        -- C. Link ALL Classes to this School
        UPDATE classes
        SET school_id = v_main_school_id;

        -- D. Link ALL Students & Teachers to this School
        UPDATE profiles
        SET school_id = v_main_school_id
        WHERE role IN ('student', 'homeroom_teacher'); 

        -- E. Fix any orphaned contracts (link to this school)
        UPDATE contracts
        SET school_id = v_main_school_id;

        RAISE NOTICE 'SUCCESS: Unified ALL Principals, Teachers, Students, Classes, and Contracts under School ID %', v_main_school_id;
    ELSE
        RAISE EXCEPTION 'Could not find any School record to unify under.';
    END IF;
END $$;

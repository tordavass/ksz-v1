-- Global Fix: Ensure everyone belongs to the same School (for Demo)
-- This fixes "Student not found" and "Empty Charts" issues.

-- 1. Get the main School ID (where the Principal is linked)
DO $$
DECLARE
    v_school_id uuid;
BEGIN
    -- Find the school that has a principal assigned
    SELECT id INTO v_school_id
    FROM schools
    WHERE principal_id IS NOT NULL
    LIMIT 1;

    IF v_school_id IS NOT NULL THEN
        
        -- 2. Update All Students who have no school
        UPDATE profiles
        SET school_id = v_school_id
        WHERE role = 'student' AND (school_id IS NULL OR school_id != v_school_id);

        -- 3. Update All Teachers who have no school
        UPDATE profiles
        SET school_id = v_school_id
        WHERE (role = 'teacher' OR role = 'homeroom_teacher') 
          AND (school_id IS NULL OR school_id != v_school_id);
          
        -- 4. Update All Classes
        UPDATE classes
        SET school_id = v_school_id
        WHERE school_id IS NULL OR school_id != v_school_id;

        RAISE NOTICE 'Successfully linked everyone to School ID %', v_school_id;
    ELSE
        RAISE NOTICE 'No linked School found. Please run fix_principal_profile.sql first.';
    END IF;
END $$;

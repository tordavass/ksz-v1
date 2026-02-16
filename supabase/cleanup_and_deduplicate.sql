-- CLEANUP SCRIPT: Deduplicate Classes & Remove Extra Schools
-- Goal: 1 School, Unique Classes.

DO $$
DECLARE
    v_main_school_id uuid;
    r_class RECORD;
    v_keep_class_id uuid;
BEGIN
    -------------------------------------------------------
    -- 1. Identify Main School (Principal's School)
    -------------------------------------------------------
    SELECT school_id INTO v_main_school_id 
    FROM profiles 
    WHERE role = 'principal' 
    LIMIT 1;

    IF v_main_school_id IS NULL THEN
        RAISE EXCEPTION 'No Principal School found. Cannot cleanup.';
    END IF;

    RAISE NOTICE 'Main School ID: %', v_main_school_id;

    -------------------------------------------------------
    -- 2. Move EVERYTHING to Main School (Just to be safe before delete)
    -------------------------------------------------------
    UPDATE classes SET school_id = v_main_school_id;
    UPDATE profiles SET school_id = v_main_school_id WHERE role IN ('student', 'homeroom_teacher');
    UPDATE contracts SET school_id = v_main_school_id;

    -------------------------------------------------------
    -- 3. Delete OTHER Schools
    -------------------------------------------------------
    DELETE FROM schools WHERE id != v_main_school_id;
    RAISE NOTICE 'Deleted extra schools.';

    -------------------------------------------------------
    -- 4. Deduplicate Classes (Merge by Name)
    -------------------------------------------------------
    -- Iterate over each unique class name
    FOR r_class IN SELECT DISTINCT name FROM classes WHERE school_id = v_main_school_id
    LOOP
        -- Find the ID to KEEP (e.g. the first one created)
        SELECT id INTO v_keep_class_id
        FROM classes
        WHERE name = r_class.name AND school_id = v_main_school_id
        ORDER BY created_at ASC
        LIMIT 1;

        RAISE NOTICE 'Processing Class: % (Keep ID: %)', r_class.name, v_keep_class_id;

        -- Move students/profiles from OTHER duplicate classes to this one
        UPDATE profiles
        SET class_id = v_keep_class_id
        WHERE class_id IN (
            SELECT id FROM classes 
            WHERE name = r_class.name 
            AND school_id = v_main_school_id 
            AND id != v_keep_class_id
        );

        -- Delete the duplicate classes (now empty of students)
        DELETE FROM classes
        WHERE name = r_class.name 
        AND school_id = v_main_school_id 
        AND id != v_keep_class_id;

    END LOOP;

    RAISE NOTICE 'Cleanup Complete: 1 School, Unique Classes.';
END $$;

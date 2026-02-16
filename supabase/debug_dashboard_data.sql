-- Debug: Simulate the queries used in 'getSchoolStats'

DO $$
DECLARE
    v_principal_id uuid;
    v_school_id uuid;
    v_student_count integer;
    v_log_count integer;
    v_classes_count integer;
BEGIN
    -- 1. Get the Principal
    SELECT id, school_id INTO v_principal_id, v_school_id 
    FROM profiles 
    WHERE role = 'principal' 
    LIMIT 1;

    RAISE NOTICE 'Principal ID: %, School ID: %', v_principal_id, v_school_id;

    IF v_school_id IS NOT NULL THEN
        -- 2. Count Students in this school
        SELECT count(*) INTO v_student_count
        FROM profiles
        WHERE role = 'student' AND school_id = v_school_id;

        RAISE NOTICE 'Student Count (in this school): %', v_student_count;

        -- 3. Count Classes in this school
        SELECT count(*) INTO v_classes_count
        FROM classes
        WHERE school_id = v_school_id;

        RAISE NOTICE 'Class Count (in this school): %', v_classes_count;

        -- 4. Count Logs for these students
        SELECT count(*) INTO v_log_count
        FROM service_logs l
        JOIN profiles s ON l.student_id = s.id
        WHERE s.school_id = v_school_id;

        RAISE NOTICE 'Service Log Count (for these students): %', v_log_count;
        
        -- 5. Check actual RLS visibility (as best as we can simulate here)
        -- (This part is just informational, SQL editor runs as superuser usually)
    ELSE
        RAISE NOTICE 'WARNING: Principal has NO School ID!';
    END IF;
END $$;

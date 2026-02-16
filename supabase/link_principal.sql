-- Link the first found Principal to the School
-- This ensures that notifications sent to 'school.principal_id' are delivered to a real user.

DO $$
DECLARE
    v_principal_id uuid;
BEGIN
    -- 1. Find a user with role 'principal' (or 'admin' if no principal found)
    SELECT id INTO v_principal_id
    FROM profiles
    WHERE role = 'principal'
    LIMIT 1;

    -- Fallback to admin if no principal
    IF v_principal_id IS NULL THEN
        SELECT id INTO v_principal_id
        FROM profiles
        WHERE role = 'admin' OR role = 'super_admin'
        LIMIT 1;
    END IF;

    -- 2. Update the School record
    IF v_principal_id IS NOT NULL THEN
        UPDATE schools
        SET principal_id = v_principal_id
        WHERE name ILIKE '%Óbudai%' OR name ILIKE '%Demo%';
        
        RAISE NOTICE 'Linked Principal ID % to the School.', v_principal_id;
    ELSE
        RAISE NOTICE 'No Principal or Admin user found to link.';
    END IF;
END $$;

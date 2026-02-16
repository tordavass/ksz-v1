-- FIX TEACHER ASSIGNMENTS
-- Links teachers to classes based on "Osztályfőnök [CLASS]" naming convention.

DO $$
DECLARE
    r RECORD;
    v_class_name TEXT;
    v_updated_count INT := 0;
BEGIN
    FOR r IN 
        SELECT id, full_name 
        FROM profiles 
        WHERE role = 'homeroom_teacher' 
          AND full_name LIKE 'Osztályfőnök %'
    LOOP
        -- Extract class name (e.g. "9.A" from "Osztályfőnök 9.A")
        v_class_name := trim(substring(r.full_name from 14));
        
        -- Update the class
        UPDATE classes
        SET homeroom_teacher_id = r.id
        WHERE name = v_class_name;
        
        IF FOUND THEN
            v_updated_count := v_updated_count + 1;
            RAISE NOTICE 'Linked % to Class %', r.full_name, v_class_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Total Classes Updated: %', v_updated_count;
END $$;

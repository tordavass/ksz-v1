-- Seed Data for KSZ System
-- Creates:
-- - 1 Principal
-- - 4 Teachers (Head of Classes: 9.a, 9.b, 10.a, 10.b)
-- - 4 Classes
-- - 60 Students (15 per class)
-- All passwords are: 'password123'

BEGIN;

-- Ensure pgcrypto is enabled for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper to create a user and profile together
CREATE OR REPLACE FUNCTION create_test_user(
    p_email TEXT, 
    p_password TEXT, 
    p_name TEXT, 
    p_role user_role,
    p_school_id UUID DEFAULT NULL,
    p_class_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_encrypted_pw TEXT;
BEGIN
    -- Generate UUID
    v_user_id := gen_random_uuid();
    -- Hash password (bcrypt)
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    -- Insert into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        p_email,
        v_encrypted_pw,
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        json_build_object('full_name', p_name, 'role', p_role),
        now(),
        now(),
        '',
        '',
        '',
        ''
    );

    -- Insert into identities (required for login)
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        json_build_object('sub', v_user_id, 'email', p_email),
        'email',
        p_email, -- provider_id
        now(),
        now(),
        now()
    );

    -- Insert into public.profiles (if trigger didn't handle it, use ON CONFLICT UPDATE)
    -- Note: Your trigger might auto-create profile. Or maybe just update it.
    -- Let's assume we update the existing profile or insert if missing.
    -- REMOVED: email column (it is not in profiles table)
    INSERT INTO public.profiles (id, full_name, role, school_id, class_id)
    VALUES (v_user_id, p_name, p_role, p_school_id, p_class_id)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        school_id = EXCLUDED.school_id,
        class_id = EXCLUDED.class_id;

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- 1. Create School (or reuse existing if you store school data)
-- Assuming 'schools' table exists or we just use school_id in profiles directly?
-- Looking at schema, profiles has school_id but is it foreign key?
-- If schools table exists, create one. If not, we skip.
-- Assuming table 'schools' exists (common pattern).
-- Let's check if table exists first:
DO $$
DECLARE
    v_school_id UUID;
    v_principal_id UUID;
    v_teacher_id UUID;
    v_class_id UUID;
    v_email TEXT;
    v_class_name TEXT;
    i INT;
    j INT;
    v_classes TEXT[] := ARRAY['9.A', '9.B', '10.A', '10.B'];
BEGIN
    -- Create a school if 'schools' table exists, otherwise just use a generated UUID
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'schools') THEN
       INSERT INTO public.schools (name, address, city) 
       VALUES ('Demo Gimnázium', 'Fő utca 1.', 'Budapest')
       RETURNING id INTO v_school_id;
    ELSE
       v_school_id := gen_random_uuid(); 
       -- Only if we need FK constraint which we can't satisfy without table.
       -- If no schools table, assume school_id is just UUID or not enforced.
       -- Let's check schema: usually school_id is just a field.
       -- If FK exists, this will fail. Let's assume schools table DOES exist based on context.
       -- If not, ignore school_id.
    END IF;

    -- 2. Create Principal
    v_principal_id := create_test_user('igazgato@demo.hu', 'password123', 'Igazgató Úr', 'principal', v_school_id);
    RAISE NOTICE 'Created Principal: igazgato@demo.hu';

    -- 3. Loop through Classes (9.A, 9.B, 10.A, 10.B)
    FOREACH v_class_name IN ARRAY v_classes
    LOOP
        -- Create Teacher
        v_email := 'tanar.' || replace(lower(v_class_name), '.', '') || '@demo.hu';
        v_teacher_id := create_test_user(v_email, 'password123', 'Osztályfőnök ' || v_class_name, 'homeroom_teacher', v_school_id);
        
        -- Create Class
        INSERT INTO public.classes (name, school_id, homeroom_teacher_id)
        VALUES (v_class_name, v_school_id, v_teacher_id)
        RETURNING id INTO v_class_id;

        -- Create 15 Students per class
        FOR j IN 1..15 LOOP
             v_email := 'diak.' || replace(lower(v_class_name), '.', '') || '.' || j || '@demo.hu';
             PERFORM create_test_user(
                 v_email,
                 'password123',
                 'Tanuló ' || v_class_name || ' #' || j,
                 'student',
                 v_school_id,
                 v_class_id
             );
        END LOOP;
        
        RAISE NOTICE 'Created Class % with Teacher % and 15 Students', v_class_name, v_email;
    END LOOP;

END $$;

-- Cleanup function
DROP FUNCTION create_test_user;

COMMIT;

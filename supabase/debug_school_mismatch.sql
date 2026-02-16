-- Debug: Check for School ID Mismatch
-- 1. List all Schools and their Principals
SELECT id, name, principal_id FROM schools;

-- 2. Check the logged-in Principal's School ID
-- (Replace 'admin' with 'principal' if needed, or check all principals)
SELECT id, full_name, role, school_id FROM profiles WHERE role = 'principal';

-- 3. Check where the Classes are now
SELECT id, name, school_id FROM classes LIMIT 5;

-- 4. Check where the Students are now
SELECT id, full_name, school_id FROM profiles WHERE role = 'student' LIMIT 5;

-- List ALL Principals to check for duplicates/mismatches
SELECT 
    id, 
    full_name, 
    email, -- Note: This might fail if email is not in profiles, avoiding it.
    -- relying on full_name and id
    role, 
    school_id,
    created_at
FROM profiles 
WHERE role = 'principal'
ORDER BY created_at DESC;

-- Also check which school is the "Active" one (where students are)
SELECT school_id, COUNT(*) as student_count 
FROM profiles 
WHERE role = 'student'
GROUP BY school_id;

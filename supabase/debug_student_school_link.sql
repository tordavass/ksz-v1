-- Check if Students have school_id set
-- The Principal RLS policy requires: student.school_id = principal.school_id

SELECT 
    p.id, 
    p.full_name, 
    p.role, 
    p.school_id, 
    s.name as school_name
FROM profiles p
LEFT JOIN schools s ON p.school_id = s.id
WHERE p.role = 'student'
LIMIT 10;

-- Check Principal's school_id
SELECT full_name, role, school_id FROM profiles WHERE role = 'principal';

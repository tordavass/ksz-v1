-- Check Principal Profile and School Link
SELECT 
    p.id as profile_id, 
    p.full_name, 
    p.role, 
    p.school_id as profile_school_id, 
    s.id as school_id_from_table, 
    s.name as school_name,
    s.principal_id as school_principal_id
FROM profiles p
FULL OUTER JOIN schools s ON p.school_id = s.id OR s.principal_id = p.id
WHERE p.role = 'principal' OR p.role = 'admin';

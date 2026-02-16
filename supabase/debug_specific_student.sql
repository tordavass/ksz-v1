-- Debug Status of Student: 2006a1aa-ec11-4ef4-a935-782c888b994e
-- Compare with Principal's School ID.

SELECT jsonb_build_object(
  'student', (
    SELECT jsonb_build_object(
      'id', id, 
      'full_name', full_name, 
      'role', role, 
      'school_id', school_id
    ) 
    FROM profiles 
    WHERE id = '2006a1aa-ec11-4ef4-a935-782c888b994e'
  ),
  
  'principal', (
    SELECT jsonb_build_object(
      'id', id,
      'school_id', school_id
    )
    FROM profiles
    WHERE role = 'principal'
    LIMIT 1
  ),

  'match', (
    SELECT school_id FROM profiles WHERE id = '2006a1aa-ec11-4ef4-a935-782c888b994e'
  ) = (
    SELECT school_id FROM profiles WHERE role = 'principal' LIMIT 1
  )
) as detailed_check;

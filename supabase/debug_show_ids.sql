-- Debug: Show School ID Distribution (Are they truly unified?)

SELECT jsonb_build_object(
  'principal_school_id', (SELECT school_id FROM profiles WHERE role = 'principal' LIMIT 1),
  
  'class_school_ids', (
    SELECT jsonb_agg(distinct school_id) 
    FROM classes
  ),
  
  'student_school_ids', (
    SELECT jsonb_agg(distinct school_id) 
    FROM profiles 
    WHERE role = 'student'
  ),

  'schools_in_db', (
    SELECT jsonb_agg(id) FROM schools
  )
) as linkage_check;

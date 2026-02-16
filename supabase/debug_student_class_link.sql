-- Debug: Check Student's Class Linkage

SELECT jsonb_build_object(
  'student_name', s.full_name,
  'student_school_id', s.school_id,
  'class_id', s.class_id,
  'class_exists', (SELECT count(*) FROM classes c WHERE c.id = s.class_id),
  'class_school_id', (SELECT school_id FROM classes c WHERE c.id = s.class_id),
  'school_match', (s.school_id = (SELECT school_id FROM classes c WHERE c.id = s.class_id))
) as class_check
FROM profiles s
WHERE s.id = '2006a1aa-ec11-4ef4-a935-782c888b994e';

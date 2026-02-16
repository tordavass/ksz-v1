-- Debug: Return Database State as a Result Row (Visible in Grid)

SELECT jsonb_build_object(
  'schools', (SELECT count(*) FROM schools),
  'principals', (SELECT count(*) FROM profiles WHERE role = 'principal'),
  'principals_with_school_id', (SELECT count(*) FROM profiles WHERE role = 'principal' AND school_id IS NOT NULL),
  'students', (SELECT count(*) FROM profiles WHERE role = 'student'),
  'students_with_school_id', (SELECT count(*) FROM profiles WHERE role = 'student' AND school_id IS NOT NULL),
  'classes', (SELECT count(*) FROM classes),
  'classes_with_school_id', (SELECT count(*) FROM classes WHERE school_id IS NOT NULL),
  'service_logs', (SELECT count(*) FROM service_logs),
  'logs_approved', (SELECT count(*) FROM service_logs WHERE status = 'approved'),
  'rls_enabled_profiles', (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles'),
  'rls_enabled_classes', (SELECT relrowsecurity FROM pg_class WHERE relname = 'classes')
) as system_health_check;

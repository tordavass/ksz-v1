-- List all policies on service_logs table
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'service_logs';

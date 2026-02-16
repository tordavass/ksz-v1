-- Fix: Ensure the Principal's Profile has the correct School ID
-- The application code checks 'profile.school_id', so we must set it.

UPDATE profiles
SET school_id = s.id
FROM schools s
WHERE profiles.id = s.principal_id
AND profiles.school_id IS NULL;

-- Verify
SELECT full_name, role, school_id FROM profiles WHERE role = 'principal';

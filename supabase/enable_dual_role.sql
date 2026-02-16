-- 1. Add the missing column (Safe to run multiple times)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_dual_role BOOLEAN DEFAULT FALSE;

-- 2. Force Dual Role for the Business Owner
UPDATE profiles
SET is_dual_role = true
WHERE role = 'business_owner';

-- 3. Verify
SELECT full_name, role, is_dual_role FROM profiles WHERE role = 'business_owner';

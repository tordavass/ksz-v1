-- Step 1: Add the value to the enum
-- Run this script ALONE first.
alter type public.user_role add value if not exists 'admin';

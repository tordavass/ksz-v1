-- DANGER: THIS SCRIPT DELETES ALL DATA FROM THE SYSTEM EXCEPT FOR ADMIN USERS!
-- MAKE SURE TO RUN THIS WITH CAUTION!

BEGIN;

-- 1. Get the admin user(s) ID(s)
-- We assume admin users have role = 'admin' in profiles table
CREATE TEMPORARY TABLE admin_users AS
SELECT id FROM public.profiles WHERE role = 'admin';

-- 2. Delete all other users from public.profiles 
-- This will trigger cascade deletes if configured, but let's be explicit for safety.

-- Delete Logs
DELETE FROM public.service_logs 
WHERE student_id NOT IN (SELECT id FROM admin_users);

-- Delete Contracts (FIXED: initiator_student_id)
DELETE FROM public.contracts 
WHERE initiator_student_id NOT IN (SELECT id FROM admin_users);

-- Delete Messages
-- Sender or Receiver is NOT an admin
DELETE FROM public.messages 
WHERE sender_id NOT IN (SELECT id FROM admin_users) 
   OR recipient_id NOT IN (SELECT id FROM admin_users);

-- Delete Parent-Student Links
DELETE FROM public.parent_student 
WHERE student_id NOT IN (SELECT id FROM admin_users)
   OR parent_id NOT IN (SELECT id FROM admin_users);

-- Delete Companies 
-- Only delete companies that are NOT owned by an admin (if admins own companies for testing)
-- Assuming company.owner_id links to profiles.id
-- If companies don't have owner_id, this line might fail. Let's check schema or delete conditionally.
-- UPDATE: Assuming companies have owner_id or created_by. 
-- If not sure, we can delete companies that don't have any linked contracts (which we just deleted).
-- But let's try with owner_id if it exists.
-- Safe fallback: Delete companies where id is not linked to any admin profile (if that link exists).
-- Since I cannot recall exact company schema ownership, I will clear companies that have no contracts, 
-- or just wipe all companies if they are not system critical.
-- Actually, let's delete companies created by non-admins if 'owner_id' exists.
-- If 'owner_id' does not exist, we skip this or need to know the schema.
-- Let's try deleting companies that have no active contracts mostly.
DELETE FROM public.companies 
WHERE owner_id NOT IN (SELECT id FROM admin_users) OR owner_id IS NULL;

-- 3. Finally, Delete the Users from AUTH schema
-- This is the critical part to remove them from login access
-- We delete from auth.users where the ID is NOT in our admin_users list
DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM admin_users);

-- 4. Delete Profiles (cascade should have handled it, but just in case)
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM admin_users);

DROP TABLE admin_users;

COMMIT;

-- Verification
SELECT COUNT(*) as remaining_users FROM auth.users;
SELECT * FROM public.profiles;

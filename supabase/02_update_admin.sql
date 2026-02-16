-- Step 2: Update the user to admin
-- Run this script AFTER the enum has been updated.
update public.profiles
set role = 'admin'
from auth.users
where public.profiles.id = auth.users.id
and auth.users.email = 'torda.vass@gmail.com';

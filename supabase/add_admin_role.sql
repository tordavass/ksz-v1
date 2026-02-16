-- 1. Add 'admin' to the enum
-- Postgres doesn't support "IF NOT EXISTS" for enum values easily in one line without a block.
-- The safest way in a script like this is to attempt it.
alter type public.user_role add value if not exists 'admin';

-- 2. Update the specific user (torda.vass@gmail.com) to be admin
-- We need to find the user in auth.users by email, then update public.profiles
-- Note: You might need to check the email exactly as registered.
update public.profiles
set role = 'admin'
from auth.users
where public.profiles.id = auth.users.id
and auth.users.email = 'torda.vass@gmail.com';

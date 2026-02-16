-- Restore missing profiles from auth.users
-- It seems the profiles table was cleared or rows were deleted.
-- This script repopulates public.profiles using data from auth.users.

insert into public.profiles (id, full_name, avatar_url, role)
select 
  id, 
  coalesce(raw_user_meta_data->>'full_name', 'Unknown User'), 
  raw_user_meta_data->>'avatar_url',
  -- Cast the role from metadata, default to 'student' if missing or invalid
  coalesce((raw_user_meta_data->>'role')::public.user_role, 'student')
from auth.users
where id not in (select id from public.profiles);

-- If specific users need to be Admins but are stuck as Students, update them manually:
-- update public.profiles set role = 'admin' where id = 'THE_USER_ID';

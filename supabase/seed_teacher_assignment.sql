-- Assign a teacher to Class 12.B
-- We assume the user running this is the teacher OR there is only one teacher for testing.
-- This script finds a profile with role 'homeroom_teacher' and assigns them to the class ID found previously.

update public.classes
set homeroom_teacher_id = (
  select id from public.profiles 
  where role = 'homeroom_teacher' 
  limit 1
)
where id = '3642e291-d9cb-4139-8c8b-01ecc818620e'; -- ID of 12.B from your previous check

-- Verify
select * from public.classes where id = '3642e291-d9cb-4139-8c8b-01ecc818620e';

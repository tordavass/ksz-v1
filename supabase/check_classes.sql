-- Check existing Classes and Assignments
select * from public.classes;

-- Check Teachers
select id, full_name, role from public.profiles where role = 'homeroom_teacher';

-- Check Students in classes
select id, full_name, class_id from public.profiles where role = 'student';

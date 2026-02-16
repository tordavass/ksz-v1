-- Check if any schools exist
select count(*) as school_count from public.schools;

-- List all schools
select * from public.schools;

-- Check the Principal's assignment
select id, full_name, role, school_id from public.profiles where role = 'principal';

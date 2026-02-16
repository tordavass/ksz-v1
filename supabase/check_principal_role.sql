-- Check if we have a Principal
select id, full_name, role from public.profiles where role = 'principal';

-- Also check generally if the user exists but has wrong role
select id, full_name, role from public.profiles order by created_at desc limit 5;

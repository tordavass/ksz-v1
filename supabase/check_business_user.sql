-- 1. Check Business Owners
select id, full_name, role, company_id 
from public.profiles 
where role in ('business_owner', 'business_contact');

-- 2. Check Pending Contracts
select id, company_id, status, initiator_student_id
from public.contracts
where status = 'pending_company';

-- 3. Check Companies
select id, name from public.companies;

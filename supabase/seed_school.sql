-- 1. Insert the School if it doesn't exist
insert into public.schools (name, city, address)
values ('Ksz High School', 'Budapest', 'Main Street 1')
on conflict do nothing;

-- 2. Get the School ID
do $$
declare
  v_school_id uuid;
begin
  select id into v_school_id from public.schools limit 1;

  -- 3. Link the Principal
  update public.profiles
  set school_id = v_school_id
  where role = 'principal' and school_id is null;

  -- 4. Link All Students (For MVP, assume everyone is in this school)
  update public.profiles
  set school_id = v_school_id
  where role = 'student' and school_id is null;

    -- 5. Link All Teachers
  update public.profiles
  set school_id = v_school_id
  where role = 'homeroom_teacher' and school_id is null;
  
end $$;

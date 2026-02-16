-- Allow Teachers to see logs of their students
-- Logic: Log -> Student (Profile) -> Class -> Teacher (homeroom_teacher_id = auth.uid())

create policy "Teachers can view logs of their class" on public.service_logs
  for select using (
    exists (
      select 1 from public.profiles student
      join public.classes cls on student.class_id = cls.id
      where student.id = service_logs.student_id
      and cls.homeroom_teacher_id = auth.uid()
    )
  );

-- Also ensure Teachers can see Profiles (Students)
-- (We already made profiles public read, so this is fine, but good to note)

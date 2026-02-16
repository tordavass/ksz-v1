-- Allow parents to read service_logs of their linked children
create policy "Parents can view their children's logs" on public.service_logs
  for select
  using (
    exists (
      select 1 from public.parent_student
      where parent_student.parent_id = auth.uid()
      and parent_student.student_id = service_logs.student_id
    )
  );

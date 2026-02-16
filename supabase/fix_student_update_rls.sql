-- Allow students to UPDATE their OWN logs, but ONLY if they are 'pending'
-- Once approved/rejected, they are locked.

create policy "Students can update their own pending logs" on public.service_logs
  for update using (
    auth.uid() = student_id 
    and status = 'pending'
  );

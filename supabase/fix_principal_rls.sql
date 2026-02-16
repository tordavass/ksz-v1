-- Allow Principals to view ALL service logs (Read-Only)
-- Used for calculating school-wide statistics.

create policy "Principals can view all logs" on public.service_logs
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'principal'
    )
  );

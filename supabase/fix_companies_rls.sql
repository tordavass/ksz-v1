-- Enable read access to companies for everyone (authenticated users)
-- Without this, RLS blocks 'select' queries by default.

create policy "Enable read access for all users" on public.companies
  for select
  using (true);

-- Also allow inserting if you want Admins to be able to create them later, 
-- but for now, read access is the blocker.

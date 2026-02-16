-- Allow Business Owners to view logs for their company
-- STRICTLY Read-Only.

create policy "Business Owners can view company logs" on public.service_logs
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() 
      and role = 'business_owner'
      and company_id = public.service_logs.company_id
    )
  );

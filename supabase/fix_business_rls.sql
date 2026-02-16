-- Enable permissions for Business Contacts
-- They need to see/act on logs for THEIR company only.

-- 1. VIEW Logs
create policy "Business Contacts can view company logs" on public.service_logs
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'business_contact'
      and profiles.company_id = service_logs.company_id
    )
  );

-- 2. UPDATE Logs (Approve/Reject)
create policy "Business Contacts can update company logs" on public.service_logs
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'business_contact'
      and profiles.company_id = service_logs.company_id
    )
  );

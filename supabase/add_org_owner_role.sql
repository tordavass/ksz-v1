-- 1. Add 'organization_owner' to the enum
-- Note: You cannot remove enum values easily, so be sure.
alter type public.user_role add value if not exists 'organization_owner';

-- 2. Allow Organization Owners to view logs for their company
-- They reuse the existing relationship logic but are read-only (no update policy for them).

create policy "Org Owners can view logs" on public.service_logs
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() 
      and role = 'organization_owner'
      and company_id = public.service_logs.company_id
    )
  );

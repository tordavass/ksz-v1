-- Helper function to get company_id safely
create or replace function public.get_my_company_id()
returns uuid as $$
  select company_id from public.profiles where id = auth.uid()
$$ language sql stable security definer;

-- Drop old policies to be clean
drop policy if exists "Business Owners can view company contracts" on public.contracts;
drop policy if exists "Business Owners can sign contracts" on public.contracts;

-- Re-create simple policies using the function

-- SELECT
create policy "Business Owners can view company contracts" on public.contracts
  for select using (
    company_id = public.get_my_company_id()
  );

-- UPDATE (Sign)
create policy "Business Owners can sign contracts" on public.contracts
  for update using (
    company_id = public.get_my_company_id()
  );

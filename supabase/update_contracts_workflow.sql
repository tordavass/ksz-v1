-- 1. Create Status Enum
create type contract_status as enum (
  'pending_company',
  'pending_principal',
  'active',
  'rejected'
);

-- 2. Update Contracts Table
alter table public.contracts 
add column if not exists status contract_status default 'pending_company',
add column if not exists initiator_student_id uuid references public.profiles(id) on delete set null,
add column if not exists company_signed_at timestamp with time zone,
add column if not exists principal_signed_at timestamp with time zone;

-- 3. Backfill existing active contracts
update public.contracts 
set status = 'active' 
where is_active = true and status = 'pending_company';

-- 4. RLS Updates

-- Student: Can insert new contracts (initiate)
create policy "Students can initiate contracts" on public.contracts
  for insert with check (
    auth.uid() = initiator_student_id
  );

-- Student: Can view contracts they initiated
create policy "Students can view own contracts" on public.contracts
  for select using (
    initiator_student_id = auth.uid()
  );

-- Business Owner: Can view contracts for their company
create policy "Business Owners can view company contracts" on public.contracts
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and company_id = contracts.company_id
    )
  );

-- Business Owner: Can update (Sign) contracts for their company
create policy "Business Owners can sign contracts" on public.contracts
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and company_id = contracts.company_id
    )
  );

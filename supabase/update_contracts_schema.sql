-- Ensure Contracts table exists
create table if not exists public.contracts (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references public.schools(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  start_date date not null,
  end_date date,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add file_url if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='contracts' and column_name='file_url') then
    alter table public.contracts add column file_url text;
  end if;
end $$;

-- RLS
alter table public.contracts enable row level security;

-- Reading: Everyone can see active contracts (needed for constraints)
create policy "Everyone can view active contracts" on public.contracts
  for select using (is_active = true);

-- Managing: Principals and Admins can manage
create policy "Principals can manage contracts" on public.contracts
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('principal', 'admin')
    )
  );

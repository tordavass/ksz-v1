-- Create a storage bucket for contracts
insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', true)
on conflict (id) do nothing;

-- Policy: Give Principals and Admins full access
create policy "Principals/Admins can upload contracts"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'contracts' AND 
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('principal', 'admin')
  )
);

create policy "Principals/Admins can update/delete contracts"
on storage.objects for update
to authenticated
using (
  bucket_id = 'contracts' AND 
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('principal', 'admin')
  )
);

-- Policy: Allow all authenticated users (Students, Teachers) to VIEW contracts
-- (So they can download the PDF if needed)
create policy "Authenticated users can view contracts"
on storage.objects for select
to authenticated
using (bucket_id = 'contracts');

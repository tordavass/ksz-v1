-- Fix Classes RLS: Open Read Access
-- Use 'true' to guarantee no context issues block the join.

alter table public.classes enable row level security;

drop policy if exists "Authenticated users can view classes" on public.classes;
drop policy if exists "Everyone can view classes" on public.classes;

create policy "Everyone can view classes" on public.classes
  for select using (true);

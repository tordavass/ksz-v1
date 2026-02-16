-- Allow everyone to read classes (needed for UI display)
create policy "Classes are viewable by everyone" on public.classes
  for select using (true);

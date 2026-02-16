-- Create messages table
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  body text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies
-- 1. Users can view messages sent TO them
create policy "Users can view received messages" on public.messages
  for select using (auth.uid() = recipient_id);

-- 2. Users can view messages sent BY them
create policy "Users can view sent messages" on public.messages
  for select using (auth.uid() = sender_id);

-- 3. Teachers and Principals can INSERT messages to anyone
create policy "Teachers can send messages" on public.messages
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('homeroom_teacher', 'principal')
    )
  );

-- 4. Students can INSERT messages only if replying (simplified: for now restricting student sending to keep it simple as per request)
-- Actually, let's allow any authenticated user to insert, but we might want to restrict WHO they can message in the application logic. 
-- For strict security, we'll keep the specialized insert policy above for now.

-- 5. Recipients can update 'is_read' status
create policy "Recipients can update their messages" on public.messages
  for update using (auth.uid() = recipient_id);

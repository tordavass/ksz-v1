-- Create the table if it doesn't exist
create table if not exists public.parent_student (
  parent_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  primary key (parent_id, student_id)
);

-- Enable RLS
alter table public.parent_student enable row level security;

-- Dropping existing policies to avoid conflicts if re-running
drop policy if exists "Parents can view their own child links" on public.parent_student;
drop policy if exists "Students can view their own parent links" on public.parent_student;

-- Create Policies
create policy "Parents can view their own child links" on public.parent_student
  for select using (auth.uid() = parent_id);

create policy "Students can view their own parent links" on public.parent_student
  for select using (auth.uid() = student_id);

-- Ensure 'parent' role exists in enum
DO $$
BEGIN
  ALTER TYPE user_role ADD VALUE 'parent';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

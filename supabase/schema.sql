-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create Enums
create type user_role as enum (
  'student',
  'parent',
  'homeroom_teacher',
  'principal',
  'business_owner',
  'business_contact'
);

create type service_log_status as enum (
  'pending',
  'approved',
  'rejected'
);

-- Schools Table
create table public.schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  city text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Classes Table
create table public.classes (
  id uuid primary key default uuid_generate_v4(),
  name text not null, -- e.g. "12.B"
  school_id uuid references public.schools(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Companies Table
create table public.companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  tax_id text, -- optional, for formal contracts
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  role user_role not null default 'student',
  
  -- Foreign keys for specific roles
  school_id uuid references public.schools(id) on delete set null, -- For students, teachers, principals
  class_id uuid references public.classes(id) on delete set null,   -- For students
  company_id uuid references public.companies(id) on delete set null, -- For business owners/contacts
  
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Parent-Student Relationship (Many-to-Many)
create table public.parent_student (
  parent_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  primary key (parent_id, student_id)
);

-- Contracts (School <-> Company)
create table public.contracts (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references public.schools(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  start_date date not null,
  end_date date,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Service Logs (The core hours tracking)
create table public.service_logs (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete set null, -- Can be null if it's a one-off event? Assuming linked to company for now.
  business_contact_id uuid references public.profiles(id) on delete set null, -- The person who approves it
  
  description text not null,
  date_of_service date not null,
  hours_worked numeric(5, 2) not null check (hours_worked > 0),
  
  status service_log_status default 'pending',
  rejection_reason text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add Helper for 'homeroom_teacher' to classes (Circular dependency resolution)
-- We add this column to classes now that profiles exists, if we want a direct link. 
-- Alternatively, we can query profiles where role='teacher' and class_id=X. 
-- A direct link on classes is often easier for "Who is the teacher of 12.B?".
alter table public.classes 
add column homeroom_teacher_id uuid references public.profiles(id) on delete set null;

-- Add Helper for 'principal' to schools
alter table public.schools
add column principal_id uuid references public.profiles(id) on delete set null;

-- Add Helper for 'owner' to companies
alter table public.companies
add column owner_id uuid references public.profiles(id) on delete set null;


-- ENABLE RLS (Row Level Security) - Best Practice
alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.classes enable row level security;
alter table public.companies enable row level security;
alter table public.service_logs enable row level security;
alter table public.parent_student enable row level security;
alter table public.contracts enable row level security;

-- Basic Policies (Just to allow read for now, explicit policies strictly needed for prod)
-- Allow users to view their own profile
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user creation automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', (new.raw_user_meta_data->>'role')::user_role);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Comment on tables
comment on table public.profiles is 'Extended user profile information including role and associations.';
comment on table public.contracts is 'Formal agreements between schools and companies for community service.';
comment on table public.service_logs is 'Record of community service hours performed by students.';

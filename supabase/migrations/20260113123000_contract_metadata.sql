-- Add metadata columns to contracts for the enhanced workflow

alter table public.contracts
add column if not exists temp_company_name text, -- If company doesn't exist yet
add column if not exists temp_owner_name text,   -- From Student
add column if not exists temp_owner_email text,  -- From Student

add column if not exists signer_name text,       -- From Business
add column if not exists signer_email text,      -- From Business
add column if not exists signer_role text;       -- From Business

-- Add 'is_verified' to companies if we want to distinguish student-created ones
alter table public.companies
add column if not exists is_verified boolean default true;

-- 1. Add 'pending_teacher' to contract_status enum
-- Postgres allows adding values to enums.
ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'pending_teacher' BEFORE 'pending_company';

-- 2. Add 'is_banned' to companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;

-- 3. RLS: Students should NOT see banned companies
-- Drop existing policy if it exists to replace it or ensure we have a good one.
-- Currently 'companies' might have a policy like "Public companies are viewable by everyone" or similar.
-- We want to restrict select for students.

-- Let's check existing policies or just add a specific restriction? 
-- RLS is additive. If there is a "view all" policy, we can't easily "subtract" with another policy. 
-- We commonly rely on the application layer for filtering (WHERE is_banned = false), 
-- OR we update the main SELECT policy.

-- Assuming generic "view all", we might want to change it. 
-- For now, let's just add the column and use it in the WHERE clause in the app actions, 
-- as changing base RLS might break other views if not careful. 
-- But for security, we should ideally enforce it. 

-- Let's create a specific policy for "Students see only non-banned companies".
-- First, we need to know what the current policy is. 
-- If it is "true", everyone sees everything. 
-- I will NOT drop policies blindly. I will rely on app-level filtering first, 
-- but I will add a policy that allows Admin/Principal to UPDATE is_banned.

CREATE POLICY "Admins and Principals can ban companies" ON public.companies
FOR UPDATE
USING (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'principal')
  )
);

-- 4. Contract Status Transitions Helper (Optional, but good for understanding)
-- pending_teacher -> pending_company -> pending_principal -> active

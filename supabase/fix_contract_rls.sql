-- Fix RLS Policy for Contracts
-- Teachers need to see contracts for students in their class.

-- 1. Drop existing policy if it's too restrictive (or check if it exists)
DROP POLICY IF EXISTS "Teachers can view contracts of their students" ON public.contracts;

-- 2. Create Policy for Teachers
-- A teacher can SELECT a contract IF:
-- They are a 'homeroom_teacher' AND the contract's student belongs to a class they teach.

CREATE POLICY "Teachers can view contracts of their students" ON public.contracts
FOR SELECT
USING (
  exists (
    select 1
    from public.classes c
    join public.profiles s on s.class_id = c.id
    where c.homeroom_teacher_id = auth.uid()
    and s.id = contracts.initiator_student_id
  )
);

-- verify
SELECT * FROM pg_policies WHERE tablename = 'contracts';

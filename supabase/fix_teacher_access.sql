-- Allow Teachers to see profiles of students in their class
-- This is critical for the `contract -> profile` join to work.

CREATE POLICY "Teachers can view profiles of their students" ON public.profiles
FOR SELECT
USING (
  exists (
    select 1
    from public.classes c
    where c.homeroom_teacher_id = auth.uid()
    and c.id = profiles.class_id
  )
);

-- And also allow teachers to see their own class definition
CREATE POLICY "Teachers can view their own classes" ON public.classes
FOR SELECT
USING (
  homeroom_teacher_id = auth.uid()
);

-- Verify
SELECT * FROM pg_policies WHERE tablename = 'profiles';
SELECT * FROM pg_policies WHERE tablename = 'classes';

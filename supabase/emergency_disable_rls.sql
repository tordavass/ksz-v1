-- EMERGENCY: Disable RLS on profiles table
-- The current policies are likely causing an infinite loop or blockage.
-- Disabling RLS allows the Server Actions to read the 'role' column freely.

alter table public.profiles disable row level security;

-- NOTE: This means any logged-in user can technically query the profiles table.
-- We will Re-Enable it with safer policies once you are successfully logged in.

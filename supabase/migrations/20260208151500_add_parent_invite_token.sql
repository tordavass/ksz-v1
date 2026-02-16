-- Add parent_invite_token to profiles
-- This token allows students to invite parents via QR code / Link
-- It is unique per student.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS parent_invite_token uuid DEFAULT gen_random_uuid();

-- Add index for faster lookup during registration
CREATE INDEX IF NOT EXISTS profiles_parent_invite_token_idx ON public.profiles(parent_invite_token);

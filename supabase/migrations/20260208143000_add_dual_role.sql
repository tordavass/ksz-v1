-- Add is_dual_role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_dual_role BOOLEAN DEFAULT FALSE;

-- Notify that this column is trusted/safe
COMMENT ON COLUMN public.profiles.is_dual_role IS 'Flag to indicate if a Business Owner also acts as the Contact Person';

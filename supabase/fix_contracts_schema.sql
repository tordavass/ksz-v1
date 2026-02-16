-- Add missing columns for contract workflow
-- These fields are used for new company requests and temporary contact info

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS temp_company_email text,
ADD COLUMN IF NOT EXISTS temp_company_address text,
ADD COLUMN IF NOT EXISTS temp_company_city text,
ADD COLUMN IF NOT EXISTS temp_owner_name text,
ADD COLUMN IF NOT EXISTS temp_owner_email text;

-- Verify if they were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contracts';

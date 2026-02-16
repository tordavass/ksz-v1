-- Ensure all necessary columns exist for the signing workflow
alter table contracts 
add column if not exists signer_name text,
add column if not exists signer_email text,
add column if not exists temp_owner_name text,
add column if not exists temp_owner_email text,
add column if not exists temp_company_name text;

-- Ensure constraints (optional, but good practice)
-- alter table contracts alter column signer_name drop not null; -- should be nullable initially

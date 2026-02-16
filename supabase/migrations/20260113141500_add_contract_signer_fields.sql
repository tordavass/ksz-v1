-- Ensure all necessary columns exist for the signing workflow
alter table contracts 
add column if not exists signer_name text,
add column if not exists signer_email text,
add column if not exists temp_owner_name text,
add column if not exists temp_owner_email text,
add column if not exists temp_company_name text;

-- Reload the schema cache to ensure PostgREST picks up the new columns immediately
NOTIFY pgrst, 'reload config';

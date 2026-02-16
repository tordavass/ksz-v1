alter table contracts
add column if not exists temp_company_address text,
add column if not exists temp_company_city text,
add column if not exists temp_company_tax_id text;

COMMIT;
NOTIFY pgrst, 'reload config';

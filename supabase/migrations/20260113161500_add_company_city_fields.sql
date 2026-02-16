alter table companies
add column if not exists city text,
add column if not exists tax_id text;

NOTIFY pgrst, 'reload config';

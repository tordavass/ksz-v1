-- Seed some example companies so the student dropdown isn't empty
-- NOTE: The companies table only has name, address, and tax_id.
insert into public.companies (name, address) values 
('Local Library', 'Main St 1, Budapest'),
('Red Cross', 'Hospital Way 5, Budapest'),
('Animal Shelter', 'Forest Rd 10, Pécs');

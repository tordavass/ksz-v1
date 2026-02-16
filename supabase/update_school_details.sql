-- 1. Update the existing school record
UPDATE schools
SET 
    name = 'Óbudai Gimnázium',
    city = 'Budapest',
    address = 'Szentlélek tér 10.'
WHERE name ILIKE '%Demo%' OR name ILIKE '%Minta%';

-- 2. Verify the update
SELECT * FROM schools;

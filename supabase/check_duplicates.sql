-- Check for Duplicates (Schools & Classes)

-- 1. School Names
SELECT name, count(*), array_agg(id) as ids
FROM schools
GROUP BY name;

-- 2. Class Names (in the main school)
-- First get the main school ID derived from Principal
WITH main_school AS (
    SELECT school_id FROM profiles WHERE role = 'principal' LIMIT 1
)
SELECT c.name, count(*), array_agg(c.id)
FROM classes c, main_school ms
WHERE c.school_id = ms.school_id
GROUP BY c.name;

-- LISTÁZÁS: A legutóbbi szerződések bármilyen pending státusszal
SELECT 
    c.id, 
    c.created_at, 
    c.status, 
    c.temp_company_email, 
    p.full_name
FROM contracts c
LEFT JOIN profiles p ON c.initiator_student_id = p.id
WHERE c.status IN ('pending_company', 'pending_principal', 'pending_teacher')
ORDER BY c.created_at DESC
LIMIT 5;

-- TÖRLÉS: Törli a legutolsó szerződést (függetlenül a státusztól, ha NEM aktív)
DELETE FROM contracts
WHERE id = (
    SELECT id
    FROM contracts
    WHERE status IN ('pending_company', 'pending_principal', 'pending_teacher')
    ORDER BY created_at DESC
    LIMIT 1
);

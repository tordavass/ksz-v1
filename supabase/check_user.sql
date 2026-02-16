select id, email, created_at, raw_user_meta_data 
from auth.users 
where email = 'torda.kovacs@test.com' -- Replace with the specific email if known (from the screenshot I assume it was empty, but I can check recent users)
or email ilike '%@%'; -- Just list recent users to see who was created

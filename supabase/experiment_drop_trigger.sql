-- EXPERIMENT: DROP TRIGGER
-- Run this to see if User Creation works WITHOUT the profile automation.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

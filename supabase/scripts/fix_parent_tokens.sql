-- Ellenőrzi, hogy van-e column, ha nincs akkor létrehozza
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'parent_invite_token') THEN
        ALTER TABLE public.profiles ADD COLUMN parent_invite_token uuid DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Kitölti azoknak, akiknek NULL (pl. régebben hozott létre userek)
UPDATE public.profiles
SET parent_invite_token = gen_random_uuid()
WHERE parent_invite_token IS NULL;

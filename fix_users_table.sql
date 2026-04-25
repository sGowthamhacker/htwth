ALTER TABLE public.users ADD COLUMN IF NOT EXISTS totp_secret TEXT;

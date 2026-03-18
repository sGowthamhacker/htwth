/*
== Supabase Migration for 2FA: Full Update ==

-- This SQL script should be run in your Supabase SQL editor to prepare the database for the 2FA feature.
-- It adds the necessary columns and backfills existing users with secure, alphanumeric backup codes.

-- Step 1: Add a column to track if 2FA is enabled.
-- This defaults to 'false' for all users.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT FALSE NOT NULL;

-- Step 2: Add a column to store backup codes as a text array.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS backup_codes TEXT[];

-- Step 3: Create a helper function to generate 6-character alphanumeric codes.
-- The app logic uses a similar function, but this is needed for the database backfill.
CREATE OR REPLACE FUNCTION generate_alphanumeric_code(length INTEGER)
RETURNS TEXT AS $$
DECLARE
  chars TEXT[] := '{A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,0,1,2,3,4,5,6,7,8,9}';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  IF length < 1 THEN
      RAISE EXCEPTION 'Invalid length';
  END IF;
  FOR i IN 1..length LOOP
      result := result || chars[1+floor(random() * 36)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Step 4: (Optional) Backfill existing users with default alphanumeric backup codes.
-- This ensures that users who signed up before the 2FA feature was added have backup codes.
UPDATE public.users
SET backup_codes = ARRAY[
    generate_alphanumeric_code(6),
    generate_alphanumeric_code(6),
    generate_alphanumeric_code(6)
]
WHERE backup_codes IS NULL;

*/
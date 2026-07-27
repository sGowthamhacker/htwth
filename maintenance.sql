-- Maintenance Script: Update desktop_preferences for all users
-- This script safely updates the theme_style for every user in the database.

UPDATE users
SET desktop_preferences = 
    CASE 
        WHEN desktop_preferences IS NULL THEN '{"theme_style": "windows"}'::jsonb
        ELSE desktop_preferences || '{"theme_style": "windows"}'::jsonb
    END;

-- Verification query
SELECT id, email, desktop_preferences FROM users;

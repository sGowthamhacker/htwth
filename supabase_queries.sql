-- Query to get all users (corresponding to getAllUsers in database.ts)
SELECT 
    id, name, email, avatar, role, writeup_access, has_requested_writeup_access, 
    bio, gender, skills, is_profile_private, friends, friend_requests, status, 
    created_at, verified_at, admin_verified, doc_access, firebase_uid, 
    welcome_email_sent, is_2fa_enabled, backup_codes, wallpaper, desktop_preferences
FROM users;

-- Query to get a work profile by user ID (corresponding to getWorkProfile)
-- Replace 'USER_ID_HERE' with the actual firebase_uid
SELECT * FROM work_profiles WHERE user_id = 'USER_ID_HERE';

-- Query to get posts (writeups)
SELECT 
    id, type, title, content, created_at, comments, tags, severity, liked_by, reward, author_id
FROM posts
WHERE type = 'writeup'
ORDER BY created_at DESC;

-- Query to get posts (blogs)
SELECT 
    id, type, title, content, created_at, comments, tags, severity, liked_by, reward, author_id
FROM posts
WHERE type = 'blog'
ORDER BY created_at DESC;

-- Query to check a specific post
-- Replace 'POST_ID_HERE' with the actual UUID
SELECT * FROM posts WHERE id = 'POST_ID_HERE';

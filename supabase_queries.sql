-- ========================================================
-- SUPABASE SCHEMA FIX & QUERIES FOR SUPPORT TICKETS & USERS
-- ========================================================

-- 1. Create or ensure support_tickets table has all required columns
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_avatar TEXT,
    subject TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Technical Issue',
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Open',
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure missing columns are added if support_tickets already existed
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS user_avatar TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create or ensure ticket_messages table has all required columns
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_name TEXT,
    sender_email TEXT,
    sender_role TEXT DEFAULT 'user',
    sender_type TEXT DEFAULT 'user',
    avatar TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure missing columns are added if ticket_messages already existed
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'user';
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS sender_role TEXT DEFAULT 'user';
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS avatar TEXT;

-- --------------------------------------------------------
-- SINGLE FULL COPYABLE QUERY TO GET ALL TICKETS WITH MESSAGES
-- --------------------------------------------------------
SELECT 
    t.id,
    t.ticket_number,
    t.user_name,
    t.user_email,
    t.user_avatar,
    t.subject,
    t.description,
    t.category,
    t.priority,
    t.status,
    t.assigned_to,
    t.created_at,
    t.updated_at,
    COALESCE(
        json_agg(
            json_build_object(
                'id', m.id,
                'ticket_id', m.ticket_id,
                'sender_name', m.sender_name,
                'sender_email', m.sender_email,
                'sender_role', m.sender_role,
                'sender_type', m.sender_type,
                'avatar', m.avatar,
                'message', m.message,
                'created_at', m.created_at
            )
        ) FILTER (WHERE m.id IS NOT NULL), '[]'::json
    ) AS messages
FROM public.support_tickets t
LEFT JOIN public.ticket_messages m ON t.id = m.ticket_id
GROUP BY t.id
ORDER BY t.created_at DESC;

-- --------------------------------------------------------
-- QUERY TICKETS FOR A SPECIFIC USER (e.g. gowlearner04@gmail.com)
-- --------------------------------------------------------
SELECT 
    t.id,
    t.ticket_number,
    t.user_name,
    t.user_email,
    t.user_avatar,
    t.subject,
    t.description,
    t.category,
    t.priority,
    t.status,
    t.assigned_to,
    t.created_at,
    t.updated_at
FROM public.support_tickets t
WHERE LOWER(t.user_email) = LOWER('gowlearner04@gmail.com')
ORDER BY t.created_at DESC;


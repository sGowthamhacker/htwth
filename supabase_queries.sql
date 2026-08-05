-- =========================================================================
-- COMPLETE SYNCHRONIZATION SCRIPT FOR SUPPORT TICKETS & TICKET MESSAGES
-- WITH AUTO-PURGE (1-HOUR EXPIRY) AND RLS BYPASS FOR ADMINS
-- =========================================================================

-- 1. Synchronize 'support_tickets' table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_avatar TEXT,
    subject TEXT NOT NULL,
    category TEXT DEFAULT 'Technical Issue',
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Open',
    assigned_to TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guarantee all mandatory columns are properly configured on support_tickets table
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS id TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS ticket_number TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS user_avatar TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Technical Issue';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Open';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();


-- 2. Synchronize 'ticket_messages' table
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id TEXT,
    sender_type TEXT DEFAULT 'user',
    sender_name TEXT,
    sender_email TEXT,
    sender_role TEXT DEFAULT 'user',
    avatar TEXT,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guarantee all mandatory columns are properly configured on ticket_messages table
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS id TEXT;
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS ticket_id TEXT;
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS sender_id TEXT;
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'user';
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS sender_email TEXT;
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS sender_role TEXT DEFAULT 'user';
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();


-- 3. Row-Level Security (RLS) Safety
-- To ensure RLS does not prevent admins from fetching/viewing all user support tickets,
-- we disable row-level security on these tables. This allows transparent query flow.
ALTER TABLE public.support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages DISABLE ROW LEVEL SECURITY;


-- 4. Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_email ON public.support_tickets(user_email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);


-- 5. Trigger to Automatically Keep 'updated_at' Current
CREATE OR REPLACE FUNCTION public.update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_support_tickets_updated_at();


-- 6. PostgreSQL Auto-Purge Scheduled Function
-- Automatically deletes tickets with a 'Closed' or 'Resolved' status exactly 1 hour after they are updated to that state.
CREATE OR REPLACE FUNCTION public.purge_expired_tickets()
RETURNS void AS $$
BEGIN
    -- Delete tickets with Closed or Resolved status updated more than 1 hour ago
    DELETE FROM public.support_tickets
    WHERE (status = 'Closed' OR status = 'Resolved')
      AND updated_at < (NOW() - INTERVAL '1 hour');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. Scheduling using pg_cron (standard in Supabase)
-- Runs the purge job every 5 minutes to ensure timely and precise removal of expired tickets.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Safely unschedule any prior instance to avoid duplicates
DO $$
BEGIN
    PERFORM cron.unschedule('purge-expired-tickets-cron');
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END;
$$;

SELECT cron.schedule(
    'purge-expired-tickets-cron',
    '*/5 * * * *', -- Run every 5 minutes
    $$SELECT public.purge_expired_tickets()$$
);

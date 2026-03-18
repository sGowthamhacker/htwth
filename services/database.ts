
// ... existing imports
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Post, ChatMessage, Comment, ActivityLog, Notification, GlobalNotification, WorkProfile, Note, Payload, GlobalSettings } from '../types';
import { MOCK_USERS } from '../data/users';
import { MOCK_POSTS } from '../data/posts';
import { MOCK_BLOG_POSTS } from '../data/blogPosts';
import { MOCK_ACTIVITY_LOG } from '../data/activityLog';

// ... (keep existing setup code: credentials, supabase client init, mock data variables)

const getSupabaseCredentials = () => {
    // Prioritize environment variables, but ensure we don't use the old/wrong URL
    let url = import.meta.env.VITE_SUPABASE_URL || '';
    let anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    const OLD_URL = 'https://jlxbccknnkkazvivgihq.supabase.co';
    const NEW_URL = 'https://greuvmplqatnvbuymnof.supabase.co';
    const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyZXV2bXBscWF0bnZidXltbm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTYwNzMsImV4cCI6MjA3NzQzMjA3M30.O_J3NEneEBZ1PRN_EX1ik1cfb472cnX5_q8DgP16T8g';

    // If URL is missing, placeholder, or the old one, use the new one
    if (!url || url.includes('example.com') || url.trim().replace(/\/$/, '') === OLD_URL) {
        url = NEW_URL;
        anonKey = NEW_KEY;
    }

    // Double check anonKey
    if (!anonKey || anonKey.includes('your-anon-key')) {
        anonKey = NEW_KEY;
    }

    return { url, anonKey };
};

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseCredentials();

let supabase: SupabaseClient | null = null;
let hasFallenBackToMock = false;
let initError: any = null;

// Log credentials for debugging (remove in production)
console.log("Initializing Supabase with:", { 
    url: supabaseUrl, 
    keyLength: supabaseAnonKey?.length 
});

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing.");
    hasFallenBackToMock = true;
    initError = "Missing Supabase credentials";
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey, {
            db: { schema: 'public' },
            auth: { 
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true 
            }
        });
        console.log("Supabase client initialized successfully.");
    } catch (e) {
        console.error("Failed to initialize Supabase client:", e);
        hasFallenBackToMock = true;
        supabase = null;
        initError = e;
    }
}

export const getSupabase = () => hasFallenBackToMock ? null : supabase;
export const isUsingMockData = () => hasFallenBackToMock;
export const getInitError = () => initError;

// --- Mock Data Initialization ---

let inMemoryUsers = JSON.parse(JSON.stringify(MOCK_USERS));
let inMemoryWriteups = JSON.parse(JSON.stringify(MOCK_POSTS));
let inMemoryBlogs = JSON.parse(JSON.stringify(MOCK_BLOG_POSTS));
let inMemoryActivityLog: ActivityLog[] = JSON.parse(JSON.stringify(MOCK_ACTIVITY_LOG));
let inMemoryChatMessages: ChatMessage[] = [
    { 
        id: `${Date.now()}-system-mock`,
        author: MOCK_USERS.find(u => u.role === 'admin') || MOCK_USERS[0], 
        text: 'Welcome to the community chat! Messages are stored locally (mock mode).', 
        timestamp: new Date().toISOString(),
        status: 'sent',
    }
];
let inMemoryNotifications: Notification[] = [];
let inMemoryWorkProfiles: WorkProfile[] = [];
let inMemoryNotes: Note[] = [];
let inMemoryGlobalSettings: GlobalSettings = { 
    isWelcomeAnimationEnabled: true,
    isMaintenanceMode: false,
    maintenanceMessage: 'System maintenance in progress. Please check back later.',
};
let inMemoryPayloads: Payload[] = [
    {
        id: 'xss-1',
        title: 'Basic Script Alert',
        category: 'XSS',
        code: '<script>alert(1)</script>',
        description: 'The classic proof of concept. Often blocked by basic filters.',
        is_visible: true
    },
    {
        id: 'sqli-1',
        title: 'Auth Bypass (Generic)',
        category: 'SQLi',
        code: "' OR 1=1 --",
        description: 'Classic authentication bypass for login forms.',
        is_visible: true
    }
];

// ... (keep constants and helper functions: safeDbQuery, sanitizeUser, sanitizePost, generateAlphanumericCode, sendMagicLinkWithBrevo)

const USER_COLUMNS = 'id, name, email, avatar, role, writeup_access, has_requested_writeup_access, bio, gender, skills, is_profile_private, friends, friend_requests, status, created_at, verified_at, admin_verified, doc_access, firebase_uid, welcome_email_sent, is_2fa_enabled, totp_secret, backup_codes, wallpaper, desktop_preferences';
const POST_COLUMNS = 'id, type, title, content, created_at, comments, tags, severity, liked_by, reward, author_id';
const CHAT_MESSAGE_COLUMNS = 'id, text, timestamp, created_at, edited_timestamp, reply_to, status, reactions, author_id';
const ACTIVITY_LOG_COLUMNS = 'id, action, target, timestamp, user_id';

async function safeDbQuery<T>(
    operation: () => Promise<{ data: any; error: any }>,
    fallbackValue: T,
    context: string
): Promise<T> {
    if (!supabase || hasFallenBackToMock) {
        return Promise.resolve(fallbackValue);
    }

    try {
        const { data, error } = await operation();
        if (error) throw error;
        return data as T;
    } catch (error: any) {
        console.error(`[Database Error] in ${context}:`, error.message || error);
        return fallbackValue;
    }
}

export const sanitizeUser = (user: any): User => {
    if (!user) return user;
    return {
        ...user,
        friends: user.friends || [],
        friend_requests: user.friend_requests || [],
        skills: user.skills || [],
        bio: user.bio || '',
        totp_secret: user.totp_secret || '',
        backup_codes: user.backup_codes || [],
        desktop_preferences: user.desktop_preferences || {},
    };
};

export const sanitizePost = (post: any): Post => {
    if (!post) return post;
    const authorFallback = {
        id: 'deleted',
        name: 'Deleted User',
        email: '',
        avatar: 'https://i.pravatar.cc/150?u=deleted',
        role: 'user',
        status: 'unverified',
        writeup_access: 'none',
        admin_verified: false,
        created_at: new Date().toISOString()
    };

    return {
        ...post,
        comments: (post.comments || []).map((c: any) => ({
            ...c,
            // Ensure author is present; if not, use fallback.
            author: c.author ? sanitizeUser(c.author) : authorFallback
        })),
        liked_by: post.liked_by || [],
        tags: post.tags || [],
        author: post.author ? sanitizeUser(post.author) : authorFallback
    };
};

export const generateAlphanumericCode = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const sendMagicLinkWithBrevo = async (email: string, backupCode: string): Promise<{ success: boolean; error?: string }> => {
    if (hasFallenBackToMock) {
        return { success: true };
    }

    const backendEndpoint = `${window.location.origin}/.netlify/functions/send-2fa-magic-link`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
        const response = await fetch(backendEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, backupCode }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            try {
                const errorData = await response.json();
                return { success: false, error: errorData.message || `Server error: ${response.status}` };
            } catch {
                return { success: false, error: `Server error: ${response.status}` };
            }
        }
        
        const data = await response.json();
        return data.success ? { success: true } : { success: false, error: data.message };

    } catch (error: any) {
        clearTimeout(timeoutId);
        return { success: false, error: error.name === 'AbortError' ? 'Request timed out.' : 'Network error.' };
    }
};

// ... (Keep all existing User, WorkProfile, Note functions as they are)
// --- User Functions ---
export const getAllUsers = async (): Promise<User[]> => {
    return safeDbQuery(async () => { const { data, error } = await supabase!.from('users').select(USER_COLUMNS); if (error) throw error; return { data: (data || []).map(sanitizeUser), error: null }; }, inMemoryUsers, "getAllUsers");
};
export const getUserByFirebaseUid = async (firebaseUid: string): Promise<User | null> => { const fallback = inMemoryUsers.find(u => u.id === firebaseUid) || null; return safeDbQuery(async () => { const { data, error } = await supabase!.from('users').select(USER_COLUMNS).eq('firebase_uid', firebaseUid).single(); if (error && error.code === 'PGRST116') return { data: null, error: null }; return { data: data ? sanitizeUser(data) : null, error }; }, fallback, "getUserByFirebaseUid"); };
export const addUser = async (user: User): Promise<User | null> => { const backup_codes = Array.from({ length: 3 }, () => generateAlphanumericCode(6)); const userWith2FA = { ...user, is_2fa_enabled: false, backup_codes }; const newUserWithId = { ...userWith2FA, id: user.id || crypto.randomUUID() }; if (!inMemoryUsers.find(u => u.email === user.email)) { inMemoryUsers.push(newUserWithId); } return safeDbQuery(async () => { const { id: firebase_uid, ...rest } = userWith2FA; const dbUserData = { ...rest, firebase_uid }; const { data, error } = await supabase!.from('users').insert([dbUserData]).select(USER_COLUMNS).single(); if (error) throw error; return { data: sanitizeUser(data), error: null }; }, newUserWithId, "addUser"); };
export const updateUser = async (email: string, updates: Partial<User>): Promise<User | null> => { const userIndex = inMemoryUsers.findIndex(u => u.email === email); if (userIndex > -1) { inMemoryUsers[userIndex] = { ...inMemoryUsers[userIndex], ...updates }; } const fallback = userIndex > -1 ? inMemoryUsers[userIndex] : null; return safeDbQuery(async () => { const { data, error } = await supabase!.from('users').update(updates).eq('email', email).select(USER_COLUMNS).single(); if (error) throw error; return { data: sanitizeUser(data), error: null }; }, fallback, "updateUser"); };
export const deleteUser = async (userId: string): Promise<boolean> => { const userIndex = inMemoryUsers.findIndex(u => u.id === userId); if (userIndex > -1) { inMemoryUsers.splice(userIndex, 1); } return safeDbQuery(async () => { await supabase!.from('posts').delete().eq('author_id', userId); await supabase!.from('chat_messages').delete().eq('author_id', userId); await supabase!.from('activity_log').delete().eq('user_id', userId); await supabase!.from('notifications').delete().eq('user_id', userId); const res = await supabase!.from('users').delete().eq('id', userId); return { data: true, error: res.error }; }, true, "deleteUser"); };

// --- Work Profile Functions ---
export const getWorkProfile = async (userId: string): Promise<WorkProfile | null> => { const fallback = inMemoryWorkProfiles.find(p => p.user_id === userId) || null; return safeDbQuery(async () => { const { data, error } = await supabase!.from('work_profiles').select('*').eq('user_id', userId).single(); if (error && error.code === 'PGRST116') return { data: null, error: null }; if (error) throw error; return { data, error: null }; }, fallback, "getWorkProfile"); };
export const updateWorkProfile = async (userId: string, profileData: Partial<WorkProfile>): Promise<WorkProfile | null> => { const idx = inMemoryWorkProfiles.findIndex(p => p.user_id === userId); const updated = { ... (idx > -1 ? inMemoryWorkProfiles[idx] : { user_id: userId }), ...profileData }; if (idx > -1) inMemoryWorkProfiles[idx] = updated; else inMemoryWorkProfiles.push(updated); return safeDbQuery(async () => { const { data, error } = await supabase!.from('work_profiles').upsert({ user_id: userId, ...profileData }).select('*').single(); if (error) throw error; return { data, error: null }; }, updated, "updateWorkProfile"); };

// --- Note Functions ---
export const getNotes = async (userId: string): Promise<Note[]> => { const fallback = inMemoryNotes.filter(n => n.user_id === userId); return safeDbQuery(async () => { const { data, error } = await supabase!.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: true }); if (error) throw error; return { data: data as Note[], error: null }; }, fallback, "getNotes"); };
export const addNote = async (note: Omit<Note, 'id' | 'created_at'>): Promise<Note | null> => { const newNote = { ...note, id: crypto.randomUUID(), created_at: new Date().toISOString() }; inMemoryNotes.push(newNote); return safeDbQuery(async () => { const { data, error } = await supabase!.from('notes').insert(note).select('*').single(); if (error) { if (error.code === '23503') { console.error("CRITICAL DB ERROR: The 'notes' table has a foreign key constraint preventing Firebase IDs. Run the fix SQL in Supabase SQL Editor."); } throw error; } return { data: data as Note, error: null }; }, newNote, "addNote"); };
export const updateNote = async (id: string, content: string): Promise<boolean> => { const idx = inMemoryNotes.findIndex(n => n.id === id); if (idx > -1) inMemoryNotes[idx].content = content; return safeDbQuery(async () => { const { error } = await supabase!.from('notes').update({ content }).eq('id', id); if (error) throw error; return { data: true, error: null }; }, true, "updateNote"); };
export const deleteNote = async (id: string): Promise<boolean> => { inMemoryNotes = inMemoryNotes.filter(n => n.id !== id); return safeDbQuery(async () => { const { error } = await supabase!.from('notes').delete().eq('id', id); if (error) throw error; return { data: true, error: null }; }, true, "deleteNote"); };

// --- Payload Functions ---

export const getPayloads = async (isAdmin: boolean = false): Promise<Payload[]> => {
    const fallback = inMemoryPayloads;
    return safeDbQuery(
        async () => {
            // Fetch all payloads. The UI decides what to show.
            // Admin needs to see hidden ones to toggle them back.
            let query = supabase!.from('payloads').select('*').order('created_at', { ascending: false });
            const { data, error } = await query;
            if (error) throw error;
            return { data: data as Payload[], error: null };
        },
        fallback,
        "getPayloads"
    );
};

export const savePayload = async (payloadData: Partial<Payload>): Promise<Payload | null> => {
    let resultPayload: Payload;
    const isUpdate = !!payloadData.id;
    
    if (isUpdate) {
        const idx = inMemoryPayloads.findIndex(p => p.id === payloadData.id);
        if (idx > -1) {
            inMemoryPayloads[idx] = { ...inMemoryPayloads[idx], ...payloadData };
            resultPayload = inMemoryPayloads[idx];
        } else {
            resultPayload = { 
                id: payloadData.id, 
                created_at: new Date().toISOString(), 
                title: 'Updating...', 
                category: 'Other', 
                code: '', 
                is_visible: true, 
                ...payloadData 
            } as Payload;
        }
    } else {
        const newPayload: Payload = {
            id: crypto.randomUUID(),
            title: payloadData.title || 'New Payload',
            category: payloadData.category || 'Other',
            code: payloadData.code || '',
            description: payloadData.description || '',
            is_visible: payloadData.is_visible ?? true,
            created_at: new Date().toISOString()
        };
        inMemoryPayloads.unshift(newPayload);
        resultPayload = newPayload;
    }

    return safeDbQuery(
        async () => {
            let query;
            if (isUpdate) {
                query = supabase!.from('payloads').update(payloadData).eq('id', payloadData.id).select('*').single();
            } else {
                const { id, ...dataToInsert } = payloadData; 
                query = supabase!.from('payloads').insert(dataToInsert).select('*').single();
            }
            
            const { data, error } = await query;
            if (error) throw error;
            return { data: data as Payload, error: null };
        },
        resultPayload,
        "savePayload"
    );
};

export const deletePayload = async (id: string): Promise<boolean> => {
    inMemoryPayloads = inMemoryPayloads.filter(p => p.id !== id);
    return safeDbQuery(
        async () => {
            const { error } = await supabase!.from('payloads').delete().eq('id', id);
            if (error) throw error;
            return { data: true, error: null };
        },
        true,
        "deletePayload"
    );
};

// NEW: Bulk update function for payloads visibility
export const updateAllPayloadsVisibility = async (isVisible: boolean): Promise<boolean> => {
    // Update mock/memory data immediately for UI responsiveness
    inMemoryPayloads.forEach(p => { p.is_visible = isVisible; });

    return safeDbQuery(
        async () => {
            const { error } = await supabase!
                .from('payloads')
                .update({ is_visible: isVisible })
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Valid UUID pattern to select all
            if (error) throw error;
            return { data: true, error: null };
        },
        true, // Fallback to true (mock data updated)
        "updateAllPayloadsVisibility"
    );
};

// ... (Keep the rest of the file: Post Functions, Activity Log, Notifications, Chat, etc. exactly as they were)
// --- Post Functions ---
export const getPosts = async (type: 'writeup' | 'blog'): Promise<Post[]> => { const fallback = type === 'writeup' ? inMemoryWriteups : inMemoryBlogs; return safeDbQuery(async () => { const { data: postsData, error } = await supabase!.from('posts').select(POST_COLUMNS).eq('type', type).order('created_at', { ascending: false }); if (error) return { data: null, error }; const authorIds = [...new Set(postsData.map((p: any) => p.author_id).filter(Boolean))]; const { data: usersData } = await supabase!.from('users').select(USER_COLUMNS).in('id', authorIds); const usersMap = new Map((usersData || []).map((u: any) => [u.id, sanitizeUser(u)])); const enrichedPosts = postsData.map((post: any) => sanitizePost({ ...post, author: usersMap.get(post.author_id) || null })); return { data: enrichedPosts, error: null }; }, fallback, `getPosts(${type})`); };
export const addPost = async (postData: Omit<Post, 'id' | 'created_at'>): Promise<Post | null> => { const newPost = { ...postData, id: crypto.randomUUID(), created_at: new Date().toISOString() }; const targetList = newPost.type === 'writeup' ? inMemoryWriteups : inMemoryBlogs; targetList.unshift(newPost); return safeDbQuery(async () => { const { author, ...rest } = postData; const { data, error } = await supabase!.from('posts').insert([{ ...rest, author_id: author.id }]).select(POST_COLUMNS).single(); if (error) throw error; return { data: sanitizePost({ ...data, author }), error: null }; }, newPost, "addPost"); };
export const updatePost = async (postId: string, updates: Partial<Post>): Promise<Post | null> => { const list = inMemoryWriteups.find(p => p.id === postId) ? inMemoryWriteups : inMemoryBlogs; const idx = list.findIndex(p => p.id === postId); if (idx > -1) { list[idx] = { ...list[idx], ...updates }; } const fallback = idx > -1 ? list[idx] : null; return safeDbQuery(async () => { const { author, ...rest } = updates; const { data, error } = await supabase!.from('posts').update(rest).eq('id', postId).select(POST_COLUMNS); if (error) throw error; if (!data || data.length === 0) return { data: null, error: null }; const updatedData = data[0]; const authorId = updatedData.author_id; const { data: authorData } = await supabase!.from('users').select(USER_COLUMNS).eq('id', authorId).single(); return { data: sanitizePost({ ...updatedData, author: authorData ? sanitizeUser(authorData) : null }), error: null }; }, fallback, "updatePost"); };
export const deletePost = async (postId: string): Promise<boolean> => { inMemoryWriteups = inMemoryWriteups.filter(p => p.id !== postId); inMemoryBlogs = inMemoryBlogs.filter(p => p.id !== postId); return safeDbQuery(async () => { const res = await supabase!.from('posts').delete().eq('id', postId); if (res.error) throw res.error; return { data: true, error: null }; }, true, "deletePost"); };
export const addCommentToPost = async (postId: string, post: Post, newComment: Comment): Promise<Post | null> => { return updatePost(postId, { comments: [newComment, ...(post.comments || [])], type: post.type }); };
export const likePost = async (postId: string, post: Post, userId: string): Promise<Post | null> => { const currentLikes = post.liked_by || []; const updatedLikes = currentLikes.includes(userId) ? currentLikes.filter(id => id !== userId) : [...currentLikes, userId]; return updatePost(postId, { liked_by: updatedLikes, type: post.type }); };

// --- Activity Log ---
export const getActivityLog = async (limit: number = 50): Promise<ActivityLog[]> => { const fallback = [...inMemoryActivityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit); return safeDbQuery(async () => { const { data: logs, error } = await supabase!.from('activity_log').select(ACTIVITY_LOG_COLUMNS).order('timestamp', { ascending: false }).limit(limit); if (error) return { data: null, error }; const userIds = [...new Set(logs.map((l: any) => l.user_id).filter(Boolean))]; const { data: usersData } = await supabase!.from('users').select(USER_COLUMNS).in('id', userIds); const usersMap = new Map((usersData || []).map((u: any) => [u.id, sanitizeUser(u)])); const enrichedLogs = logs.map((log: any) => ({ ...log, user: usersMap.get(log.user_id) || { name: 'Unknown User', avatar: '', email: 'unknown' } })); return { data: enrichedLogs, error: null }; }, fallback, "getActivityLog"); };
export const addActivityLog = async (userId: string, action: string, target?: string): Promise<ActivityLog | null> => { const fallbackLog: ActivityLog = { id: Math.random(), user: inMemoryUsers.find(u => u.id === userId)!, action, target, timestamp: new Date().toISOString() }; inMemoryActivityLog.push(fallbackLog); return safeDbQuery(async () => { const { data, error } = await supabase!.from('activity_log').insert([{ user_id: userId, action, target }]).select(ACTIVITY_LOG_COLUMNS).single(); if (error) throw error; let user = inMemoryUsers.find(u => u.id === userId); if (!user) { const { data: userData } = await supabase!.from('users').select(USER_COLUMNS).eq('id', userId).single(); if (userData) { user = sanitizeUser(userData); } else { user = { id: userId, name: 'Unknown', avatar: '', email: '', role: 'user' } as any; } } return { data: { ...data, user: sanitizeUser(user) }, error: null }; }, fallbackLog, "addActivityLog"); };
export const deleteActivityLog = async (logId: number): Promise<boolean> => { inMemoryActivityLog = inMemoryActivityLog.filter(l => l.id !== logId); return safeDbQuery(async () => { const res = await supabase!.from('activity_log').delete().eq('id', logId); return { data: true, error: res.error }; }, true, "deleteActivityLog"); };
export const clearActivityLog = async (): Promise<boolean> => { inMemoryActivityLog = []; return safeDbQuery(async () => { const res = await supabase!.from('activity_log').delete().neq('id', -1); return { data: true, error: res.error }; }, true, "clearActivityLog"); };

// --- Global Notifications ---
export const sendGlobalNotifications = async (notifications: GlobalNotification[]): Promise<boolean> => { return safeDbQuery(async () => { const dbData = notifications.map(n => ({ to_email: n.to, from_user: n.from, type: n.type, message: n.message, title: n.title, target_id: n.targetId, target_type: n.targetType, })); const res = await supabase!.from('global_notifications').insert(dbData); return { data: true, error: res.error }; }, true, "sendGlobalNotifications"); };

// --- User Notifications ---
export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => { const fallback = inMemoryNotifications.filter(n => n.userId === userId); return safeDbQuery(async () => { const { data, error } = await supabase!.from('notifications').select('*').eq('user_id', userId).eq('is_deleted', false).order('timestamp', { ascending: false }); if (error) return { data: null, error }; const mapped = (data || []).map((n: any) => ({ ...n, userId: n.user_id, sourceType: n.source_type, fromUser: n.from_user, isRead: n.is_read, targetId: n.target_id, targetType: n.target_type, })); return { data: mapped, error: null }; }, fallback, "getNotificationsForUser"); };
export const addNotificationToDb = async (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Promise<Notification> => { const newNotif = { ...notification, id: crypto.randomUUID(), timestamp: new Date().toISOString(), isRead: false }; inMemoryNotifications.unshift(newNotif); return safeDbQuery(async () => { const dbData = { user_id: notification.userId, title: notification.title, message: notification.message, type: notification.type, source_type: notification.sourceType, from_user: notification.fromUser, actions: notification.actions, persist: notification.persist, target_id: notification.targetId, target_type: notification.targetType, }; const { data, error } = await supabase!.from('notifications').insert(dbData).select('*').single(); if (error) throw error; return { data: { ...data, userId: data.user_id, sourceType: data.source_type, fromUser: data.from_user, isRead: data.is_read } as Notification, error: null }; }, newNotif, "addNotificationToDb"); };
export const updateNotificationInDb = async (id: string, updates: Partial<Notification>): Promise<boolean> => { const idx = inMemoryNotifications.findIndex(n => n.id === id); if (idx > -1) inMemoryNotifications[idx] = { ...inMemoryNotifications[idx], ...updates }; return safeDbQuery(async () => { const { isRead, sourceType, fromUser, ...rest } = updates; const dbUpdates: any = { ...rest }; if (isRead !== undefined) dbUpdates.is_read = isRead; if (sourceType !== undefined) dbUpdates.source_type = sourceType; if (fromUser !== undefined) dbUpdates.from_user = fromUser; const res = await supabase!.from('notifications').update(dbUpdates).eq('id', id); return { data: true, error: res.error }; }, true, "updateNotificationInDb"); };
export const deleteNotificationFromDb = async (id: string): Promise<boolean> => { inMemoryNotifications = inMemoryNotifications.filter(n => n.id !== id); return safeDbQuery(async () => { const res = await supabase!.from('notifications').update({ is_deleted: true }).eq('id', id); return { data: true, error: res.error }; }, true, "deleteNotificationFromDb"); };
export const deleteAllNotificationsForUser = async (userId: string): Promise<boolean> => { inMemoryNotifications = inMemoryNotifications.filter(n => n.userId !== userId); return safeDbQuery(async () => { const res = await supabase!.from('notifications').update({ is_deleted: true }).eq('user_id', userId); return { data: true, error: res.error }; }, true, "deleteAllNotificationsForUser"); };
export const markAllNotificationsAsReadForUser = async (userId: string): Promise<boolean> => { inMemoryNotifications.forEach(n => { if (n.userId === userId) n.isRead = true; }); return safeDbQuery(async () => { const res = await supabase!.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false); return { data: true, error: res.error }; }, true, "markAllNotificationsAsReadForUser"); };

// --- Chat Functions ---
export const getChatMessages = async (): Promise<ChatMessage[]> => { return safeDbQuery(async () => { const { data: messages, error } = await supabase!.from('chat_messages').select(CHAT_MESSAGE_COLUMNS).order('timestamp', { ascending: true }); if (error) return { data: null, error }; const authorIds = [...new Set(messages.map((m: any) => m.author_id).filter(Boolean))]; const { data: usersData } = await supabase!.from('users').select(USER_COLUMNS).in('id', authorIds); const usersMap = new Map((usersData || []).map((u: any) => [u.id, sanitizeUser(u)])); const enrichedMessages = messages.map((msg: any) => ({ ...msg, author: usersMap.get(msg.author_id) || { id: 'unknown', name: 'Unknown User', avatar: 'https://i.pravatar.cc/150?u=unknown', role: 'user' } })); return { data: enrichedMessages, error: null }; }, inMemoryChatMessages, "getChatMessages"); };
export const addChatMessage = async (messageData: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage | null> => { const newMessage = { ...messageData, id: crypto.randomUUID(), created_at: new Date().toISOString() }; inMemoryChatMessages.push(newMessage); return safeDbQuery(async () => { const { author, ...rest } = messageData; const { data, error } = await supabase!.from('chat_messages').insert([{ ...rest, author_id: author.id }]).select(CHAT_MESSAGE_COLUMNS).single(); if (error) throw error; return { data: { ...data, author: sanitizeUser(author) }, error: null }; }, newMessage, "addChatMessage"); };
export const updateChatMessage = async (messageId: string, updates: Partial<ChatMessage>): Promise<ChatMessage | null> => { const idx = inMemoryChatMessages.findIndex(m => m.id === messageId); if (idx > -1) inMemoryChatMessages[idx] = { ...inMemoryChatMessages[idx], ...updates }; const fallback = idx > -1 ? inMemoryChatMessages[idx] : null; return safeDbQuery(async () => { const { author, ...rest } = updates; const { data, error } = await supabase!.from('chat_messages').update(rest).eq('id', messageId).select(CHAT_MESSAGE_COLUMNS).single(); if (error) throw error; let finalAuthor = author; if (!finalAuthor) { finalAuthor = inMemoryUsers.find(u => u.id === data.author_id); if (!finalAuthor) { const { data: userData } = await supabase!.from('users').select(USER_COLUMNS).eq('id', data.author_id).single(); finalAuthor = userData ? sanitizeUser(userData) : { id: data.author_id, name: 'Unknown', avatar: '', role: 'user' } as any; } } return { data: { ...data, author: sanitizeUser(finalAuthor) }, error: null }; }, fallback, "updateChatMessage"); };
export const deleteChatMessage = async (messageId: string): Promise<boolean> => { inMemoryChatMessages = inMemoryChatMessages.filter(m => m.id !== messageId); return safeDbQuery(async () => { const res = await supabase!.from('chat_messages').delete().eq('id', messageId); return { data: true, error: res.error }; }, true, "deleteChatMessage"); };
export const clearChatMessages = async (): Promise<boolean> => { inMemoryChatMessages = []; return safeDbQuery(async () => { const res = await supabase!.from('chat_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000'); return { data: true, error: res.error }; }, true, "clearChatMessages"); };

// --- Global Settings Functions ---
export const getGlobalSettings = async (): Promise<GlobalSettings> => {
    return safeDbQuery(async () => {
        const { data, error } = await supabase!.from('global_settings').select('*').single();
        if (error) {
            if (error.code === 'PGRST116') {
                // No rows, return default
                return { data: inMemoryGlobalSettings, error: null };
            }
            throw error;
        }
        return { data: { 
            isWelcomeAnimationEnabled: data.is_welcome_animation_enabled,
            isMaintenanceMode: data.is_maintenance_mode,
            maintenanceMessage: data.maintenance_message,
            maintenanceStartTime: data.maintenance_start_time,
            maintenanceEndTime: data.maintenance_end_time
        }, error: null };
    }, inMemoryGlobalSettings, "getGlobalSettings");
};

export const updateGlobalSettings = async (updates: Partial<GlobalSettings>): Promise<GlobalSettings> => {
    inMemoryGlobalSettings = { ...inMemoryGlobalSettings, ...updates };
    return safeDbQuery(async () => {
        const dbUpdates: any = {};
        if (updates.isWelcomeAnimationEnabled !== undefined) dbUpdates.is_welcome_animation_enabled = updates.isWelcomeAnimationEnabled;
        if (updates.isMaintenanceMode !== undefined) dbUpdates.is_maintenance_mode = updates.isMaintenanceMode;
        if (updates.maintenanceMessage !== undefined) dbUpdates.maintenance_message = updates.maintenanceMessage;
        if (updates.maintenanceStartTime !== undefined) dbUpdates.maintenance_start_time = updates.maintenanceStartTime;
        if (updates.maintenanceEndTime !== undefined) dbUpdates.maintenance_end_time = updates.maintenanceEndTime;
        
        // Try to update ID 1, if it doesn't exist, upsert
        const { data, error } = await supabase!.from('global_settings').upsert({ id: 1, ...dbUpdates }).select('*').single();
        if (error) throw error;
        return { data: { 
            isWelcomeAnimationEnabled: data.is_welcome_animation_enabled,
            isMaintenanceMode: data.is_maintenance_mode,
            maintenanceMessage: data.maintenance_message,
            maintenanceStartTime: data.maintenance_start_time,
            maintenanceEndTime: data.maintenance_end_time
        }, error: null };
    }, inMemoryGlobalSettings, "updateGlobalSettings");
};

export const subscribeToGlobalSettings = (onUpdate: (settings: GlobalSettings) => void) => {
    if (!supabase || hasFallenBackToMock) return () => {};

    const channel = supabase
        .channel('global_settings_changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'global_settings' },
            (payload) => {
                const data = payload.new as any;
                if (data) {
                    onUpdate({
                        isWelcomeAnimationEnabled: data.is_welcome_animation_enabled,
                        isMaintenanceMode: data.is_maintenance_mode,
                        maintenanceMessage: data.maintenance_message,
                        maintenanceStartTime: data.maintenance_start_time,
                        maintenanceEndTime: data.maintenance_end_time
                    });
                }
            }
        )
        .subscribe();

    return () => {
        supabase!.removeChannel(channel);
    };
};

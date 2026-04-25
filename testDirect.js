import { createClient } from '@supabase/supabase-js';

const url = 'https://greuvmplqatnvbuymnof.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyZXV2bXBscWF0bnZidXltbm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTYwNzMsImV4cCI6MjA3NzQzMjA3M30.O_J3NEneEBZ1PRN_EX1ik1cfb472cnX5_q8DgP16T8g';
const supabase = createClient(url, key);

async function run() {
    const p = await supabase.from('posts').select('id, liked_by, comments').eq('type', 'blog');
    console.log("Total posts:", p.data?.length);
    if (!p.data || p.data.length === 0) return;
    
    let first = p.data[0];
    console.log("First post ID:", first.id, "Liked By length:", first.liked_by?.length || 0);

    const testId = "123e4567-e89b-12d3-a456-426614174000";
    let likes = first.liked_by || [];
    let updatedLikes = likes.includes(testId) ? likes.filter(x => x !== testId) : [...likes, testId];

    const upd = await supabase.from('posts').update({ liked_by: updatedLikes }).eq('id', first.id).select('liked_by').single();
    console.log("Update Error:", upd.error);
    console.log("Updated result:", upd.data);
    
}
run();

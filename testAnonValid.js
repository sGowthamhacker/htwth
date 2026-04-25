import { createClient } from '@supabase/supabase-js';

const url = 'https://greuvmplqatnvbuymnof.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyZXV2bXBscWF0bnZidXltbm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTYwNzMsImV4cCI6MjA3NzQzMjA3M30.O_J3NEneEBZ1PRN_EX1ik1cfb472cnX5_q8DgP16T8g';
const supabase = createClient(url, key);

async function run() {
    console.log("Attempting anon update with valid UUIDs...");
    const postId = "749f1f81-b4d3-42f1-a4a8-f1812bc9619d";
    
    // Valid UUIDs
    const validUuid1 = "123e4567-e89b-12d3-a456-426614174000";
    const validUuid2 = "987e6543-e21b-12d3-a456-426614174000";
    
    // Select first
    const before = await supabase.from('posts').select('liked_by').eq('id', postId).single();
    console.log("Before: ", before.data);

    // Attempt update as anonymous using anon key
    const upd = await supabase.from('posts').update({ liked_by: [validUuid1, validUuid2] }).eq('id', postId);
    console.log("Update error:", upd.error);
    console.log("Update success data:", upd.data);

    const after = await supabase.from('posts').select('liked_by').eq('id', postId).single();
    console.log("After: ", after.data);
}
run();

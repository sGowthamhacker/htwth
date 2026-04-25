const url = 'https://greuvmplqatnvbuymnof.supabase.co/rest/v1/posts?select=id,liked_by,comments&type=eq.blog';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyZXV2bXBscWF0bnZidXltbm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTYwNzMsImV4cCI6MjA3NzQzMjA3M30.O_J3NEneEBZ1PRN_EX1ik1cfb472cnX5_q8DgP16T8g';

fetch(url, { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } })
.then(r => r.json())
.then(console.log);

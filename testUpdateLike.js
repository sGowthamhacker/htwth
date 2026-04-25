const url = 'https://greuvmplqatnvbuymnof.supabase.co/rest/v1/posts?id=eq.749f1f81-b4d3-42f1-a4a8-f1812bc9619d';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyZXV2bXBscWF0bnZidXltbm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTYwNzMsImV4cCI6MjA3NzQzMjA3M30.O_J3NEneEBZ1PRN_EX1ik1cfb472cnX5_q8DgP16T8g';

fetch(url, { 
    method: 'PATCH',
    headers: { 
        'apikey': key, 
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    },
    body: JSON.stringify({ liked_by: ['9130817e-f55c-453e-be72-b6a3e38d0fb2', 'local-guest-user'] })
})
.then(r => r.json())
.then(console.log);

async function run() {
  const res = await fetch('http://localhost:3000/api/admin/test-smtp', { method: 'GET' });
  console.log(await res.text());
}
run();

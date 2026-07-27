const fs = require('fs');
let content = fs.readFileSync('pages/AdminDashboardPage.tsx', 'utf8');

const target = `    useEffect(() => {
        const checkSmtp = async () => {
            try {
                const response = await fetch('/api/admin/test-smtp');`;

const replacement = `    useEffect(() => {
        const checkSmtp = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const response = await fetch('/api/admin/test-smtp', { signal: controller.signal });
                clearTimeout(timeoutId);`;

content = content.replace(target, replacement);

fs.writeFileSync('pages/AdminDashboardPage.tsx', content, 'utf8');

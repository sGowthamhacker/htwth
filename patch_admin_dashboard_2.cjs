const fs = require('fs');
let content = fs.readFileSync('pages/AdminDashboardPage.tsx', 'utf8');

const injection = `    const broadcastRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkSmtp = async () => {
            try {
                const response = await fetch('/api/admin/test-smtp');
                if (response.ok) {
                    setSmtpStatus('success');
                } else {
                    setSmtpStatus('error');
                }
            } catch (error) {
                setSmtpStatus('error');
            }
        };
        checkSmtp();
    }, []);`;

// Replace the second occurrence of `    const broadcastRef = useRef<HTMLDivElement>(null);`
let firstDone = false;
content = content.replace(/    const broadcastRef = useRef<HTMLDivElement>\(null\);/g, (match) => {
    if (!firstDone) {
        firstDone = true;
        return match;
    }
    return injection;
});

fs.writeFileSync('pages/AdminDashboardPage.tsx', content, 'utf8');

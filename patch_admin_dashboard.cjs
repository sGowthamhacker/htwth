const fs = require('fs');
let content = fs.readFileSync('pages/AdminDashboardPage.tsx', 'utf8');

// 1. Inject useEffect to check SMTP status on mount
const useEffectInjection = `    const broadcastRef = useRef<HTMLDivElement>(null);

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

content = content.replace(/    const broadcastRef = useRef<HTMLDivElement>\(null\);/, useEffectInjection);

fs.writeFileSync('pages/AdminDashboardPage.tsx', content, 'utf8');

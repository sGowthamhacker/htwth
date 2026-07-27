const fs = require('fs');
let content = fs.readFileSync('pages/AdminDashboardPage.tsx', 'utf8');

const targetStart = `const MailBroadcastChannel: React.FC<{ adminUser: User; allUsers: User[] }> = ({ adminUser, allUsers }) => {`;
const targetEnd = `    );
};`;

// We'll find the MailBroadcastChannel and replace it until the end of its function body.
const startIndex = content.indexOf(targetStart);
let endIndex = content.indexOf(targetEnd, startIndex);
if (endIndex !== -1) {
    endIndex += targetEnd.length;
}

const replacement = `const MailBroadcastChannel: React.FC<{ adminUser: User; allUsers: User[] }> = ({ adminUser, allUsers }) => {
    const [mode, setMode] = useState<'all' | 'specific' | 'verified' | 'unverified' | 'pending'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [removedUserIds, setRemovedUserIds] = useState<string[]>([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [smtpStatus, setSmtpStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
    const { addNotification } = useNotificationState();
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const broadcastRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;
        const checkSmtp = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const response = await fetch('/api/admin/test-smtp', { signal: controller.signal });
                clearTimeout(timeoutId);
                if (isMounted) {
                    if (response.ok) {
                        setSmtpStatus('success');
                    } else {
                        setSmtpStatus('error');
                    }
                }
            } catch (error) {
                if (isMounted) setSmtpStatus('error');
            }
        };
        checkSmtp();
        const intervalId = setInterval(checkSmtp, 5 * 60 * 1000);
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    const renderedLivePreview = useMemo(() => {
        const rawContent = message || 'Your email content will appear here...';
        try {
            const formatted = formatEmailHtml(rawContent, adminUser?.name || 'Gowtham S Admin');
            return DOMPurify.sanitize(formatted, {
                ADD_ATTR: ['style', 'target', 'cellspacing', 'cellpadding', 'border', 'align', 'valign', 'width', 'height', 'class', 'box-sizing'],
                ADD_TAGS: ['style']
            });
        } catch {
            return DOMPurify.sanitize(rawContent);
        }
    }, [message, adminUser]);

    const isHtmlContent = useMemo(() => {
        const rawContent = (message || '').trim();
        return rawContent.startsWith('<') || rawContent.includes('style=') || rawContent.includes('class=') || rawContent.includes('border=') || rawContent.includes('<table');
    }, [message]);

    const insertFormatting = (prefix: string, suffix: string = '') => {
        setMessage(prev => prev + \`\${prefix}text\${suffix}\`);
    };

    const insertSnippet = (snippet: string) => {
        setMessage(prev => (prev ? prev + '\\n\\n' + snippet : snippet));
    };

    const applyTemplate = async (templateId: string) => {
        const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            let finalBody = template.body;
            const appUrl = window.location.origin;
            
            finalBody = finalBody.replace(/\\[APP_URL\\]/g, appUrl);

            if (finalBody.includes('[APP_STATS]')) {
                const totalMembers = allUsers?.length || 18;
                const verifiedResearchers = allUsers?.filter(u => u.status === 'verified' || u.admin_verified || u.role === 'admin')?.length || 9;
                const statsHtml = \`
                  <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; margin: 16px 0;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="33%" style="text-align: center; border-right: 1px solid #1e293b; padding-right: 6px;">
                          <div style="color: #6366f1; font-size: 18px; font-weight: 800;">\${totalMembers}</div>
                          <div style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 600; margin-top: 2px;">Total Members</div>
                        </td>
                        <td width="33%" style="text-align: center; border-right: 1px solid #1e293b; padding: 0 6px;">
                          <div style="color: #10b981; font-size: 18px; font-weight: 800;">\${verifiedResearchers}</div>
                          <div style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 600; margin-top: 2px;">Verified Scholars</div>
                        </td>
                        <td width="33%" style="text-align: center; padding-left: 6px;">
                          <div style="color: #38bdf8; font-size: 18px; font-weight: 800;">99.9%</div>
                          <div style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 600; margin-top: 2px;">Platform Uptime</div>
                        </td>
                      </tr>
                    </table>
                  </div>
                \`;
                finalBody = finalBody.replace(/\\[APP_STATS\\]/g, statsHtml);
            }

            if (finalBody.includes('[BLOG_LIST]')) {
                const blogs = await getPosts('blog');
                const recentBlogs = (blogs && blogs.length > 0) ? blogs.slice(0, 3) : [
                    { id: '1', title: 'Zero-Trust Architecture in Modern Cloud Infrastructure', summary: 'Architectural guide on adopting zero-trust verification across containerized microservices.', author: { name: 'Gowtham' }, created_at: new Date().toISOString() },
                    { id: '2', title: 'Automating Security Scans with Custom CI/CD Workflows', summary: 'How to inject static code analysis and SAST scanners into release pipelines.', author: { name: 'Security Hub' }, created_at: new Date().toISOString() },
                    { id: '3', title: 'The Evolution of Container Orchestration', summary: 'A deep dive into Kubernetes design patterns and resource management.', author: { name: 'Admin' }, created_at: new Date().toISOString() }
                ];
                
                const blogsHtml = recentBlogs.map((blog: any) => \`
                    <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #1e293b;">
                        <div style="color: #38bdf8; font-size: 12px; font-weight: 600; margin-bottom: 8px;">NEW RESEARCH</div>
                        <h3 style="color: #f8fafc; font-size: 18px; font-weight: 700; margin: 0 0 8px 0; line-height: 1.4;">\${blog.title}</h3>
                        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px 0; line-height: 1.6;">\${blog.summary || 'Insightful analysis and strategic recommendations from our cybersecurity research team.'}</p>
                        <a href="\${appUrl}/blog/\${blog.id}" style="display: inline-block; background-color: #312e81; color: #818cf8; font-size: 13px; font-weight: 600; text-decoration: none; padding: 8px 16px; border-radius: 6px; border: 1px solid #4338ca;">Read Full Article →</a>
                    </div>
                \`).join('');
                
                finalBody = finalBody.replace(/\\[BLOG_LIST\\]/g, blogsHtml);
            }

            setTitle(template.subject);
            setMessage(finalBody);
            setSelectedTemplate('');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (broadcastRef.current && !broadcastRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleTestConnection = async () => {
        setIsTesting(true);
        setSmtpStatus('unknown');
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch('/api/admin/test-smtp', { signal: controller.signal });
            clearTimeout(timeoutId);
            if (response.ok) {
                setSmtpStatus('success');
                addNotification({ title: 'Success', message: 'SMTP connection verified successfully.', type: 'success' });
            } else {
                setSmtpStatus('error');
                addNotification({ title: 'Error', message: 'Failed to verify SMTP connection.', type: 'error' });
            }
        } catch (error) {
            setSmtpStatus('error');
            addNotification({ title: 'Error', message: 'Network error while testing SMTP.', type: 'error' });
        } finally {
            setIsTesting(false);
        }
    };

    const getRecipients = (currentMode: string, all: User[], selected: User[]): User[] => {
        switch (currentMode) {
            case 'all':
                return all.filter(u => u.email && u.role !== 'admin');
            case 'verified':
                return all.filter(u => u.email && (u.status === 'verified' || u.admin_verified) && u.role !== 'admin');
            case 'unverified':
                return all.filter(u => u.email && u.status !== 'verified' && !u.admin_verified && u.role !== 'admin');
            case 'pending':
                return all.filter(u => u.email && u.has_requested_writeup_access && u.writeup_access !== 'granted');
            case 'specific':
                return selected;
            default:
                return [];
        }
    };

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            addNotification({ title: 'Error', message: 'Subject and message body cannot be empty.', type: 'error' });
            return;
        }

        if (smtpStatus !== 'success') {
             addNotification({ title: 'Warning', message: 'SMTP server is not verified. Proceeding anyway, but emails might fail.', type: 'info' });
        }

        setIsLoading(true);
        
        let initialRecipients = getRecipients(mode, allUsers, selectedUsers);
        let targetUsers = initialRecipients.filter(u => !removedUserIds.includes(u.id));

        if (targetUsers.length === 0) {
            addNotification({ title: 'Error', message: 'No recipients selected.', type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            const BATCH_SIZE = 50; 
            let successCount = 0;
            let failureCount = 0;

            const finalHtmlContent = formatEmailHtml(message, adminUser.name || 'Gowtham S Admin');

            for (let i = 0; i < targetUsers.length; i += BATCH_SIZE) {
                const batch = targetUsers.slice(i, i + BATCH_SIZE);
                const toEmails = batch.map(u => u.email).join(',');

                const response = await fetch('/api/admin/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: toEmails,
                        subject: title,
                        body: finalHtmlContent,
                        senderName: adminUser.name || 'Gowtham S Admin'
                    })
                });

                if (response.ok) {
                    successCount += batch.length;
                } else {
                    failureCount += batch.length;
                }
            }

            if (failureCount === 0) {
                addNotification({ title: 'Success', message: \`Email campaign sent successfully to \${successCount} recipients.\`, type: 'success' });
                setTitle('');
                setMessage('');
                setRemovedUserIds([]);
                if (mode === 'specific') setSelectedUsers([]);
            } else if (successCount > 0) {
                 addNotification({ title: 'Warning', message: \`Sent to \${successCount} recipients, but failed for \${failureCount}.\`, type: 'info' });
            } else {
                 addNotification({ title: 'Error', message: 'Failed to send email campaign to all recipients.', type: 'error' });
            }

        } catch (error) {
            console.error("Error sending email broadcast:", error);
            addNotification({ title: 'Error', message: 'A critical error occurred while sending emails.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (user: User) => {
        if (!selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearchQuery('');
        setShowSuggestions(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim()) {
            const filtered = allUsers.filter(u => 
                 u.role !== 'admin' && 
                 !selectedUsers.some(s => s.id === u.id) &&
                ((u.name && u.name.toLowerCase().includes(value.toLowerCase())) || (u.email && u.email.toLowerCase().includes(value.toLowerCase())))
            );
            setSuggestions(filtered.slice(0, 5));
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const filteredRecipients = getRecipients(mode, allUsers, selectedUsers).filter(u => !removedUserIds.includes(u.id));

    return (
        <div ref={broadcastRef} className="space-y-6 animate-fade-in" key="mail-broadcast">
            {/* Sleek SMTP Status Indicator */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={\`p-3 rounded-xl flex items-center justify-center \${
                        smtpStatus === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        smtpStatus === 'error' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }\`}>
                        {smtpStatus === 'success' && <CheckCircleIcon className="w-6 h-6" />}
                        {smtpStatus === 'error' && <XCircleIcon className="w-6 h-6" />}
                        {smtpStatus === 'unknown' && <RefreshIcon className="w-6 h-6 animate-spin" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            SMTP Connection Status
                            {smtpStatus === 'success' && <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-400/20">Operational</span>}
                            {smtpStatus === 'error' && <span className="inline-flex items-center rounded-full bg-rose-50 dark:bg-rose-400/10 px-2 py-1 text-xs font-medium text-rose-700 dark:text-rose-400 ring-1 ring-inset ring-rose-600/10 dark:ring-rose-400/20">Failed</span>}
                            {smtpStatus === 'unknown' && <span className="inline-flex items-center rounded-full bg-slate-50 dark:bg-slate-400/10 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-400 ring-1 ring-inset ring-slate-600/10 dark:ring-slate-400/20 animate-pulse">Checking...</span>}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {smtpStatus === 'success' ? 'Connected securely to SMTP server. Ready for broadcasting.' :
                             smtpStatus === 'error' ? 'Connection failed. Please check your SMTP configuration.' :
                             'Verifying secure connection to the mail server...'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 shadow-sm"
                >
                    <RefreshIcon className={\`w-4 h-4 \${isTesting ? 'animate-spin' : ''}\`} />
                    {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Compose & Settings (Left/Main) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Settings Row */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                                    <MailIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Delivery Scope</h3>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {filteredRecipients.length} Recipients
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                            {[
                                { id: 'all', label: 'All Users', icon: UsersIcon },
                                { id: 'verified', label: 'Verified', icon: ShieldIcon },
                                { id: 'unverified', label: 'Unverified', icon: UserIcon },
                                { id: 'pending', label: 'Pending', icon: UserPlusIcon },
                                { id: 'specific', label: 'Targeted', icon: MailIcon }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setMode(option.id as any)}
                                    className={\`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 \${
                                        mode === option.id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-600 dark:text-slate-300'
                                    }\`}
                                >
                                    <option.icon className="w-5 h-5" />
                                    <span className="text-xs font-semibold">{option.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Recipient Details & Exclusions */}
                        {mode !== 'specific' && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Target Audience ({filteredRecipients.length})</h4>
                                <div className="max-h-32 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                    {filteredRecipients.slice(0, 30).map(u => (
                                        <div key={u.id} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between group py-1 border-b border-slate-200/50 dark:border-slate-700/50 last:border-0">
                                            <span className="truncate pr-4">{u.name} <span className="opacity-50">&lt;{u.email}&gt;</span></span>
                                            <button onClick={() => setRemovedUserIds(prev => [...prev, u.id])} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity" title="Exclude user">
                                                <XCircleIcon className="w-3.5 h-3.5"/>
                                            </button>
                                        </div>
                                    ))}
                                    {filteredRecipients.length > 30 && (
                                        <div className="text-[10px] text-slate-400 pt-2 font-medium italic text-center">+ {filteredRecipients.length - 30} more recipients</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Specific User Search */}
                        {mode === 'specific' && (
                            <div className="space-y-3 animate-fade-in">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {selectedUsers.map(u => (
                                        <div key={u.id} className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-blue-100 dark:border-blue-500/20">
                                            {u.email}
                                            <button onClick={() => setSelectedUsers(prev => prev.filter(x => x.id !== u.id))} className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors">
                                                <XCircleIcon className="w-3.5 h-3.5"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name or email to add..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                                            {suggestions.map(user => (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSuggestionClick(user); }}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                                                >
                                                    <img src={getCloudinaryUrl(user.avatar, { width: 32, height: 32, radius: 'max' })} alt={user.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                                                    <div className="overflow-hidden">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</div>
                                                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Editor Row */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex-1 flex flex-col relative">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                                    <DocumentTextIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Email Campaign Content</h3>
                            </div>
                            <div className="relative">
                                <select 
                                    value={selectedTemplate} 
                                    onChange={(e) => applyTemplate(e.target.value)}
                                    className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                >
                                    <option value="">Load Template...</option>
                                    {EMAIL_TEMPLATES.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-6 flex-1 flex flex-col">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Subject Line</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:font-normal"
                                    placeholder="Enter captivating subject..."
                                />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        Email Body (HTML/Markdown)
                                    </label>
                                    <div className="flex gap-2">
                                        <button onClick={() => insertFormatting('**', '**')} className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors" title="Bold">B</button>
                                        <button onClick={() => insertFormatting('*', '*')} className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors italic" title="Italic">I</button>
                                        <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                        <button onClick={() => insertSnippet('<a href="https://example.com" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;font-weight:bold;">Call to Action</a>')} className="text-[10px] uppercase font-bold text-slate-500 hover:text-amber-600 transition-colors px-1" title="Insert Button HTML">CTA</button>
                                    </div>
                                </div>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="flex-1 w-full min-h-[300px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none font-mono"
                                    placeholder="<h1 style='color: #1e293b;'>Hello World</h1> or standard Markdown..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={handleSend}
                                disabled={isLoading || filteredRecipients.length === 0}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg hover:shadow-xl"
                            >
                                {isLoading ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : <PaperAirplaneIcon className="w-4 h-4" />}
                                Launch Campaign
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Panel (Right) */}
                <div className="lg:col-span-5 flex flex-col h-[calc(100vh-120px)] sticky top-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
                        
                        {/* Browser-like Toolbar */}
                        <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                            </div>
                            <div className="flex bg-white dark:bg-slate-900 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 p-0.5">
                                <button 
                                    onClick={() => setPreviewDevice('desktop')}
                                    className={\`px-2.5 py-1 rounded-sm flex items-center gap-1 text-[10px] font-bold uppercase transition-colors \${previewDevice === 'desktop' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}\`}
                                >
                                    <MonitorIcon className="w-3 h-3" /> Desktop
                                </button>
                                <button 
                                    onClick={() => setPreviewDevice('mobile')}
                                    className={\`px-2.5 py-1 rounded-sm flex items-center gap-1 text-[10px] font-bold uppercase transition-colors \${previewDevice === 'mobile' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}\`}
                                >
                                    <SmartphoneIcon className="w-3 h-3" /> Mobile
                                </button>
                            </div>
                        </div>

                        {/* Email Header Preview */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {title || 'Subject will appear here'}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                                <div>From: {adminUser.name} &lt;noreply@app.com&gt;</div>
                                <div className="text-[10px] text-slate-400">To: {filteredRecipients.length} Recipient(s)</div>
                            </div>
                        </div>

                        {/* Email Body Preview Canvas */}
                        <div className="flex-1 bg-slate-50 dark:bg-[#0a0a0a] overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
                            <div className={\`w-full transition-all duration-300 \${previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-2xl'}\`}>
                                <div 
                                    className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-200 min-h-[400px]"
                                >
                                    {/* The rendered HTML */}
                                    <div 
                                        className="prose prose-sm dark:prose-invert max-w-none break-words"
                                        dangerouslySetInnerHTML={{ __html: renderedLivePreview }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};`

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync('pages/AdminDashboardPage.tsx', content, 'utf8');
    console.log("MailBroadcastChannel patched.");
} else {
    console.log("Could not find MailBroadcastChannel boundaries.");
}

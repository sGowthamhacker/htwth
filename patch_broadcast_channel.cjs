const fs = require('fs');
let content = fs.readFileSync('pages/AdminDashboardPage.tsx', 'utf8');

const targetStart = `const BroadcastChannel: React.FC<{ adminUser: User; allUsers: User[] }> = ({ adminUser, allUsers }) => {`;
const targetEnd = `    );
};`;

// We'll find the first BroadcastChannel and replace it until the end of its function body.
const startIndex = content.indexOf(targetStart);
let endIndex = content.indexOf(targetEnd, startIndex);
if (endIndex !== -1) {
    endIndex += targetEnd.length;
}

const replacement = `const BroadcastChannel: React.FC<{ adminUser: User; allUsers: User[] }> = ({ adminUser, allUsers }) => {
    const [mode, setMode] = useState<'all' | 'specific' | 'verified' | 'unverified' | 'pending'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationState();
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const broadcastRef = useRef<HTMLDivElement>(null);

    const parsedMessageHtml = useMemo(() => {
        if (!message || !message.trim()) return 'Message content will appear here...';
        try {
            const parsed = marked.parse(message, { breaks: true, gfm: true }) as string;
            return DOMPurify.sanitize(parsed);
        } catch {
            return DOMPurify.sanitize(message);
        }
    }, [message]);

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

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            addNotification({ title: 'Error', message: 'Subject and message content cannot be empty.', type: 'error' });
            return;
        }

        setIsLoading(true);

        const fromPayload = {
            email: adminUser.email,
            name: adminUser.name,
            avatar: adminUser.avatar,
            role: adminUser.role,
        };

        const targetUserIds = mode === 'all'
            ? allUsers.map(u => u.id)
            : selectedUsers.map(u => u.id);

        if (targetUserIds.length === 0) {
            addNotification({ title: 'Error', message: 'No recipients selected.', type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            const promises = targetUserIds.map(userId =>
                createNotification(userId, title, message, 'broadcast', fromPayload)
            );
            await Promise.all(promises);

            addNotification({ title: 'Success', message: \`Broadcast sent to \${targetUserIds.length} users.\`, type: 'success' });
            setTitle('');
            setMessage('');
            if (mode === 'specific') setSelectedUsers([]);
        } catch (error) {
            console.error("Error sending broadcast:", error);
            addNotification({ title: 'Error', message: 'Failed to send broadcast.', type: 'error' });
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

    return (
        <div ref={broadcastRef} className="space-y-6 animate-fade-in" key="broadcast">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Compose & Settings (Left/Main) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Settings Row */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <UsersIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Transmission Scope</h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setMode('all')}
                                className={\`flex-1 min-w-[150px] flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 \${
                                    mode === 'all'
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-600 dark:text-slate-300'
                                }\`}
                            >
                                <UsersIcon className="w-4 h-4" />
                                <span className="text-sm font-semibold">All Users</span>
                            </button>
                            <button
                                onClick={() => setMode('specific')}
                                className={\`flex-1 min-w-[150px] flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 \${
                                    mode === 'specific'
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-600 dark:text-slate-300'
                                }\`}
                            >
                                <UserIcon className="w-4 h-4" />
                                <span className="text-sm font-semibold">Specific Target</span>
                            </button>
                        </div>

                        {mode === 'specific' && (
                            <div className="mt-6 space-y-3 animate-fade-in">
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map(u => (
                                        <div key={u.id} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-emerald-100 dark:border-emerald-500/20">
                                            {u.name}
                                            <button onClick={() => setSelectedUsers(prev => prev.filter(x => x.id !== u.id))} className="hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors">
                                                <XCircleIcon className="w-3.5 h-3.5"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
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
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
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
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-pink-50 dark:bg-pink-500/10 rounded-lg text-pink-600 dark:text-pink-400">
                                <DocumentTextIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Compose Message</h3>
                        </div>

                        <div className="space-y-6 flex-1 flex flex-col">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Subject</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:font-normal"
                                    placeholder="Enter announcement subject..."
                                />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide flex items-center justify-between">
                                    <span>Message Body</span>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400">Markdown Supported</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="flex-1 w-full min-h-[200px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all resize-none"
                                    placeholder="Write your message here..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isLoading ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : <PaperAirplaneIcon className="w-4 h-4" />}
                                Transmit Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Panel (Right) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800 p-6 sticky top-6 h-[calc(100vh-120px)] overflow-y-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Notification Preview</h3>
                        </div>

                        {/* App-like notification card preview */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-4">
                            <div className="flex items-start gap-3">
                                <img src={adminUser.avatar} alt="Admin" className="w-10 h-10 rounded-full border ring-2 ring-white dark:ring-slate-800" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-sm text-slate-900 dark:text-white">{adminUser.name}</span>
                                            <img src="https://gowthamsportfolio.netlify.app/assets/img/tick.gif" className="w-3.5 h-3.5" alt="Verified" />
                                        </div>
                                        <span className="text-[10px] text-slate-400">Just now</span>
                                    </div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 break-words leading-tight mb-2">
                                        {title || "Notification Subject"}
                                    </p>
                                    <div 
                                        className="text-xs text-slate-600 dark:text-slate-300 prose prose-xs dark:prose-invert max-w-none [&_p]:m-0 [&_p]:mb-2 last:[&_p]:mb-0 [&_a]:text-indigo-500 break-words" 
                                        dangerouslySetInnerHTML={{ __html: parsedMessageHtml }} 
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
    console.log("BroadcastChannel patched.");
} else {
    console.log("Could not find BroadcastChannel boundaries.");
}

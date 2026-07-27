const fs = require('fs');
let content = fs.readFileSync('pages/AdminDashboardPage.tsx', 'utf8');

const target = `<div ref={broadcastRef} className="space-y-8 animate-fade-in" key="mail-broadcast">`;
const replacement = `<div ref={broadcastRef} className="space-y-8 animate-fade-in" key="mail-broadcast">

            {/* SMTP Status Top Indicator */}
            <div className={\`flex items-center justify-between p-4 rounded-xl border transition-all \${
                smtpStatus === 'success' 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                    : smtpStatus === 'error'
                    ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }\`}>
                <div className="flex items-center gap-4">
                    <div className="relative flex h-4 w-4">
                        {smtpStatus === 'success' && (
                            <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                            </>
                        )}
                        {smtpStatus === 'error' && (
                            <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                            </>
                        )}
                        {smtpStatus === 'unknown' && (
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-slate-400"></span>
                        )}
                    </div>
                    <div>
                        <h3 className={\`font-bold text-sm \${
                            smtpStatus === 'success' ? 'text-emerald-800 dark:text-emerald-300' :
                            smtpStatus === 'error' ? 'text-rose-800 dark:text-rose-300' :
                            'text-slate-700 dark:text-slate-300'
                        }\`}>
                            {smtpStatus === 'success' ? 'Mail System Live & Operational' :
                             smtpStatus === 'error' ? 'Mail System Offline / Error' :
                             'Checking Mail System Status...'}
                        </h3>
                        <p className={\`text-[11px] \${
                            smtpStatus === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                            smtpStatus === 'error' ? 'text-rose-600 dark:text-rose-400' :
                            'text-slate-500 dark:text-slate-400'
                        }\`}>
                            {smtpStatus === 'success' ? 'Connected to GMAIL_SMTP:v587. Ready to broadcast.' :
                             smtpStatus === 'error' ? 'Failed to establish connection with SMTP server. Broadcasts may fail.' :
                             'Verifying secure connection to SMTP relay...'}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className={\`px-4 py-2 rounded-lg text-xs font-bold transition-all \${
                        smtpStatus === 'success' 
                            ? 'bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/60' 
                            : smtpStatus === 'error'
                            ? 'bg-rose-100 dark:bg-rose-800/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/60'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    } disabled:opacity-50\`}
                >
                    {isTesting ? 'TESTING...' : 'RE-TEST CONNECTION'}
                </button>
            </div>
`;

content = content.replace(target, replacement);

fs.writeFileSync('pages/AdminDashboardPage.tsx', content, 'utf8');

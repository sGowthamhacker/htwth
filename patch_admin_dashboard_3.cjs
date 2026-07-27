const fs = require('fs');
let content = fs.readFileSync('pages/AdminDashboardPage.tsx', 'utf8');

const target = `{/* SMTP Status Top Indicator */}
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
            </div>`;

const replacement = `{/* MASSIVE SMTP Status Top Indicator */}
            <div className={\`flex items-center justify-between p-6 rounded-2xl border-2 transition-all shadow-lg \${
                smtpStatus === 'success' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-500 shadow-emerald-500/20' 
                    : smtpStatus === 'error'
                    ? 'bg-rose-100 dark:bg-rose-900/40 border-rose-400 dark:border-rose-500 shadow-rose-500/20'
                    : 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-500 shadow-amber-500/20 animate-pulse'
            }\`}>
                <div className="flex items-center gap-6">
                    <div className="relative flex h-8 w-8">
                        {smtpStatus === 'success' && (
                            <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-8 w-8 bg-emerald-600 shadow-lg shadow-emerald-500/50 text-white flex items-center justify-center"><CheckCircleIcon className="w-5 h-5"/></span>
                            </>
                        )}
                        {smtpStatus === 'error' && (
                            <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-8 w-8 bg-rose-600 shadow-lg shadow-rose-500/50 text-white flex items-center justify-center"><XCircleIcon className="w-5 h-5"/></span>
                            </>
                        )}
                        {smtpStatus === 'unknown' && (
                            <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-8 w-8 bg-amber-500 shadow-lg shadow-amber-500/50 text-white flex items-center justify-center"><RefreshIcon className="w-5 h-5 animate-spin"/></span>
                            </>
                        )}
                    </div>
                    <div>
                        <h2 className={\`font-black text-2xl tracking-tight uppercase \${
                            smtpStatus === 'success' ? 'text-emerald-800 dark:text-emerald-300' :
                            smtpStatus === 'error' ? 'text-rose-800 dark:text-rose-300' :
                            'text-amber-800 dark:text-amber-300'
                        }\`}>
                            {smtpStatus === 'success' ? 'Mail System: LIVE & OPERATIONAL' :
                             smtpStatus === 'error' ? 'Mail System: OFFLINE / ERROR' :
                             'Mail System: CHECKING STATUS...'}
                        </h2>
                        <p className={\`text-sm font-semibold \${
                            smtpStatus === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                            smtpStatus === 'error' ? 'text-rose-600 dark:text-rose-400' :
                            'text-amber-700 dark:text-amber-400'
                        }\`}>
                            {smtpStatus === 'success' ? 'Connected to SMTP Server. Ready to broadcast.' :
                             smtpStatus === 'error' ? 'Failed to establish connection. Broadcasts will fail.' :
                             'Verifying secure connection...'}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className={\`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-md \${
                        smtpStatus === 'success' 
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30' 
                            : smtpStatus === 'error'
                            ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/30'
                            : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-500/30'
                    } disabled:opacity-50\`}
                >
                    {isTesting ? 'TESTING...' : 'RE-TEST CONNECTION'}
                </button>
            </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('pages/AdminDashboardPage.tsx', content, 'utf8');

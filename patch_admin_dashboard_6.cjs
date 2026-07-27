const fs = require('fs');
let content = fs.readFileSync('pages/AdminDashboardPage.tsx', 'utf8');

const target = `{/* MASSIVE SMTP Status Top Indicator */}
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

const replacement = `{/* Sleek SMTP Status Indicator */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                >
                    <RefreshIcon className={\`w-4 h-4 \${isTesting ? 'animate-spin' : ''}\`} />
                    {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
            </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('pages/AdminDashboardPage.tsx', content, 'utf8');

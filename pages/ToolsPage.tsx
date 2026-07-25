import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

type Tool = 'html-css' | 'markdown' | 'base64' | 'url';

// --- HTML & CSS Live Preview Tool ---
const HtmlCssTool: React.FC = () => {
    const [html, setHtml] = useState<string>(`<div className="card">
  <div className="badge">LIVE PREVIEW</div>
  <h1>Cyberpunk Interface</h1>
  <p>Real-time HTML & CSS sandbox rendering directly in client-side preview.</p>
  <button id="demo-btn">Interact With Me</button>
</div>`);

    const [css, setCss] = useState<string>(`body {
  background: #0f172a;
  color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 1rem;
}

.card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 2rem;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  backdrop-filter: blur(12px);
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #6366f1, #38bdf8);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

p {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

button {
  width: 100%;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 10px;
  background: #38bdf8;
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover {
  background: #7dd3fc;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(56, 189, 248, 0.4);
}`);

    const [useTailwind, setUseTailwind] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [copied, setCopied] = useState(false);

    // Build iframe srcDoc safely
    const srcDoc = useMemo(() => {
        const tailwindScript = useTailwind 
            ? `<script src="https://cdn.tailwindcss.com"></script>` 
            : '';
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${tailwindScript}
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    document.addEventListener('click', function(e) {
      if (e.target && e.target.id === 'demo-btn') {
        alert('Button clicked inside Live Preview iframe!');
      }
    });
  </script>
</body>
</html>`;
    }, [html, css, useTailwind]);

    const loadTemplate = (type: 'cyberpunk' | 'glass' | 'badge') => {
        if (type === 'cyberpunk') {
            setHtml(`<div class="cyber-container">
  <div class="glitch-title" data-text="HTWTH OS">HTWTH OS</div>
  <p class="subtitle">PREVIEW ENGINE READY v2.4</p>
  <div class="status-grid">
    <div class="stat"><span class="val">100%</span><span class="lbl">CLIENT SIDE</span></div>
    <div class="stat"><span class="val">0ms</span><span class="lbl">LATENCY</span></div>
  </div>
</div>`);
            setCss(`body { background: #050814; color: #00f0ff; font-family: monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
.cyber-container { border: 2px solid #00f0ff; padding: 2rem; border-radius: 8px; background: rgba(5,8,20,0.9); box-shadow: 0 0 30px rgba(0,240,255,0.3); text-align: center; max-width: 400px; }
.glitch-title { font-size: 2rem; font-weight: 900; letter-spacing: 2px; color: #fff; text-shadow: 2px 2px #ff0055; }
.subtitle { color: #ff0055; font-size: 0.8rem; margin-top: 0.5rem; letter-spacing: 1px; }
.status-grid { display: flex; gap: 1rem; margin-top: 1.5rem; }
.stat { flex: 1; background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3); padding: 0.75rem; border-radius: 4px; }
.val { display: block; font-size: 1.25rem; font-weight: bold; color: #fff; }
.lbl { font-size: 0.65rem; color: #a5f3fc; }`);
        } else if (type === 'glass') {
            setHtml(`<div class="glass-card">
  <h2>Glassmorphism Preview</h2>
  <p>Sleek frosted glass UI element with real-time CSS backdrop filtering.</p>
  <a href="#" class="cta-link">Explore Features &rarr;</a>
</div>`);
            setCss(`body { background: linear-gradient(135deg, #4f46e5, #ec4899, #06b6d4); font-family: system-ui; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
.glass-card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 20px; padding: 2.5rem; max-width: 380px; color: white; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
h2 { margin: 0 0 0.75rem 0; font-size: 1.75rem; }
p { opacity: 0.9; line-height: 1.6; margin-bottom: 1.5rem; font-size: 0.95rem; }
.cta-link { display: inline-block; background: white; color: #4f46e5; font-weight: bold; padding: 0.75rem 1.5rem; border-radius: 9999px; text-decoration: none; transition: transform 0.2s; }
.cta-link:hover { transform: scale(1.05); }`);
        } else {
            setHtml(`<div class="badge-card">
  <div class="pulse-dot"></div>
  <span>SYSTEM ONLINE</span>
</div>`);
            setCss(`body { background: #090d16; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
.badge-card { display: flex; items-center; gap: 0.75rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.75rem 1.25rem; border-radius: 9999px; color: #34d399; font-weight: bold; font-size: 0.85rem; letter-spacing: 0.05em; }
.pulse-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 12px #10b981; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { transform: scale(0.95); opacity: 0.7; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.7; } }`);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(srcDoc);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Templates:</span>
                    <button onClick={() => loadTemplate('cyberpunk')} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">Cyberpunk</button>
                    <button onClick={() => loadTemplate('glass')} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">Glassmorphism</button>
                    <button onClick={() => loadTemplate('badge')} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">Status Badge</button>
                </div>
                
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={useTailwind} 
                            onChange={(e) => setUseTailwind(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500" 
                        />
                        Tailwind CDN
                    </label>
                    <button 
                        onClick={copyCode} 
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
                    >
                        {copied ? 'Copied HTML!' : 'Copy Full Document'}
                    </button>
                </div>
            </div>

            {/* Mobile View Switcher */}
            <div className="flex lg:hidden bg-slate-200 dark:bg-slate-800 p-1 rounded-xl gap-1">
                <button 
                    onClick={() => setActiveTab('editor')} 
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'editor' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    Code Editor
                </button>
                <button 
                    onClick={() => setActiveTab('preview')} 
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    Live Preview
                </button>
            </div>

            {/* Editor & Preview Split Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[480px]">
                {/* Editor Column */}
                <div className={`flex flex-col gap-4 ${activeTab === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
                    {/* HTML Editor */}
                    <div className="flex-1 flex flex-col min-h-[220px]">
                        <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                            <span>HTML Markup</span>
                            <span className="text-[10px] text-indigo-500">Body Content</span>
                        </label>
                        <textarea
                            value={html}
                            onChange={(e) => setHtml(e.target.value)}
                            className="flex-1 w-full p-3 font-mono text-xs rounded-xl bg-slate-900 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder="Enter <div>HTML code</div> here..."
                        />
                    </div>

                    {/* CSS Editor */}
                    <div className="flex-1 flex flex-col min-h-[220px]">
                        <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                            <span>CSS Stylesheet</span>
                            <span className="text-[10px] text-indigo-500">Scoped Styles</span>
                        </label>
                        <textarea
                            value={css}
                            onChange={(e) => setCss(e.target.value)}
                            className="flex-1 w-full p-3 font-mono text-xs rounded-xl bg-slate-900 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder="Enter CSS styles here..."
                        />
                    </div>
                </div>

                {/* Preview Frame Column */}
                <div className={`flex flex-col h-full min-h-[440px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-lg ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                            <span className="text-xs font-mono text-slate-400 ml-2">Client Sandbox Output</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                            LIVE
                        </span>
                    </div>

                    <iframe
                        srcDoc={srcDoc}
                        title="HTML CSS Live Preview"
                        className="w-full flex-1 bg-slate-950 border-0"
                        sandbox="allow-scripts allow-modals"
                    />
                </div>
            </div>
        </div>
    );
};

// --- Markdown Live Preview Tool ---
const MarkdownTool: React.FC = () => {
    const [markdown, setMarkdown] = useState<string>(`# Bug Bounty Vulnerability Writeup

**Severity:** Critical  
**Target:** \`https://target-app.internal/api/v1\`  
**Author:** Security Research Team  

---

## 1. Executive Summary
During a routine security assessment of the target web application, a **Remote Code Execution (RCE)** vulnerability was discovered in the document rendering microservice.

### Key Metrics
| Parameter | Value | Status |
| :--- | :--- | :--- |
| **CVSS v3.1** | \`9.8\` | **CRITICAL** |
| **CWE ID** | CWE-94 | Unsanitized Input |
| **Bounty Awarded** | $5,000 | Confirmed |

---

## 2. Steps to Reproduce
1. Authenticate to the application dashboard.
2. Intercept the HTTP POST request to \`/api/render\`.
3. Inject the following JSON payload into the document template parameter:

\`\`\`json
{
  "template": "{{constructor.constructor('return process.env')()}}",
  "format": "pdf"
}
\`\`\`

4. Observe system environment variables returned in the execution response body.

---

## 3. Remediation Checklist
- [x] Disable unsafe template evaluation engine.
- [x] Implement strict input sanitization on rendering endpoints.
- [ ] Conduct full regression audit across all subdomains.

> *"Security is a process, not a state."*
`);

    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [copied, setCopied] = useState(false);

    const insertText = (prefix: string, suffix: string = '') => {
        setMarkdown(prev => prev + `${prefix}sample text${suffix}`);
    };

    const loadTemplate = (type: 'writeup' | 'readme' | 'changelog') => {
        if (type === 'writeup') {
            setMarkdown(`# Security Assessment Report

**Target:** \`api.target.com\`  
**Date:** ${new Date().toLocaleDateString()}  

## Summary
Found IDOR vulnerability allowing unauthorized access to user profile records.

## Proof of Concept
\`\`\`http
GET /api/users/1024 HTTP/1.1
Host: api.target.com
Authorization: Bearer <user_token>
\`\`\`

- [x] Verified on staging
- [ ] Patch verification needed`);
        } else if (type === 'readme') {
            setMarkdown(`# Project Title 🚀

A modern full-stack web application built for speed and security.

## Features
- ⚡ **Blazing Fast**: Native client-side rendering
- 🛡️ **Secure**: Zero untrusted script execution
- 🎨 **Responsive**: Optimized for mobile and desktop

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\``);
        } else {
            setMarkdown(`# Release Notes v2.4.0

### Added
- ✨ Added HTML & CSS Live Preview Sandbox
- 📝 Integrated Markdown Editor with GitHub Flavored Markdown support

### Fixed
- 🐛 Resolved client-side layout rendering bugs
- 🎨 Improved UI contrast and responsiveness`);
        }
    };

    const copyMarkdown = () => {
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const wordCount = useMemo(() => markdown.trim() ? markdown.trim().split(/\s+/).length : 0, [markdown]);
    const charCount = markdown.length;

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Markdown Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-wrap items-center gap-1.5">
                    <button onClick={() => insertText('**', '**')} className="px-2 py-1 text-xs font-bold rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">B</button>
                    <button onClick={() => insertText('*', '*')} className="px-2 py-1 text-xs italic font-bold rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">I</button>
                    <button onClick={() => insertText('# ')} className="px-2 py-1 text-xs font-bold rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">H1</button>
                    <button onClick={() => insertText('## ')} className="px-2 py-1 text-xs font-bold rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">H2</button>
                    <button onClick={() => insertText('`', '`')} className="px-2 py-1 text-xs font-mono rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">Code</button>
                    <button onClick={() => insertText('```javascript\n', '\n```')} className="px-2 py-1 text-xs font-mono rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">Block</button>
                    <button onClick={() => insertText('\n- [ ] ')} className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">Task</button>
                    <button onClick={() => insertText('\n> ')} className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">Quote</button>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => loadTemplate('writeup')} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">Writeup Template</button>
                    <button onClick={() => loadTemplate('readme')} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">README Template</button>
                    <button 
                        onClick={copyMarkdown} 
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
                    >
                        {copied ? 'Copied!' : 'Copy Markdown'}
                    </button>
                </div>
            </div>

            {/* Mobile View Switcher */}
            <div className="flex lg:hidden bg-slate-200 dark:bg-slate-800 p-1 rounded-xl gap-1">
                <button 
                    onClick={() => setActiveTab('editor')} 
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'editor' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    Markdown Editor
                </button>
                <button 
                    onClick={() => setActiveTab('preview')} 
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    Rendered Preview
                </button>
            </div>

            {/* Editor & Preview Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[480px]">
                {/* Markdown Input Area */}
                <div className={`flex flex-col ${activeTab === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Markdown Source</label>
                        <span className="text-[11px] font-mono text-slate-400">{wordCount} words | {charCount} chars</span>
                    </div>
                    <textarea
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        className="flex-1 w-full p-4 font-mono text-xs sm:text-sm rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                        placeholder="Type markdown here..."
                    />
                </div>

                {/* Markdown Rendered Output Panel */}
                <div className={`flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 overflow-y-auto max-h-[600px] shadow-md ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="sticky top-0 -mt-6 -mx-6 px-6 py-2.5 bg-indigo-600/90 backdrop-blur-md text-white text-xs font-mono font-bold uppercase tracking-wider mb-6 flex items-center justify-between rounded-t-2xl">
                        <span>Live Markdown Render</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none break-words text-sm sm:text-base leading-relaxed">
                        {markdown ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                {markdown}
                            </ReactMarkdown>
                        ) : (
                            <p className="text-slate-400 italic">Start typing markdown on the left to see instant preview...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Base64Tool: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const encode = () => {
        try {
            setOutput(btoa(unescape(encodeURIComponent(input))));
        } catch (e) {
            setOutput('Error: Invalid input for Base64 encoding.');
        }
    };

    const decode = () => {
        try {
            setOutput(decodeURIComponent(escape(atob(input))));
        } catch (e) {
            setOutput('Error: Invalid Base64 string for decoding.');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="base64-input" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Input</label>
                <textarea
                    id="base64-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={6}
                    className="w-full p-3 font-mono text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter text to encode or decode..."
                />
            </div>
            <div className="flex items-center justify-center gap-4">
                <button onClick={encode} className="px-5 py-2 font-bold text-sm rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow">Encode</button>
                <button onClick={decode} className="px-5 py-2 font-bold text-sm rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Decode</button>
            </div>
            <div>
                <label htmlFor="base64-output" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Output</label>
                <textarea
                    id="base64-output"
                    value={output}
                    readOnly
                    rows={6}
                    className="w-full p-3 font-mono text-sm rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                    placeholder="Output will appear here..."
                />
            </div>
        </div>
    );
};

const UrlTool: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const encode = () => {
        setOutput(encodeURIComponent(input));
    };

    const decode = () => {
        try {
            setOutput(decodeURIComponent(input));
        } catch (e) {
            setOutput('Error: Invalid URL encoding for decoding.');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="url-input" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Input</label>
                <textarea
                    id="url-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={6}
                    className="w-full p-3 font-mono text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter string to encode or decode..."
                />
            </div>
            <div className="flex items-center justify-center gap-4">
                <button onClick={encode} className="px-5 py-2 font-bold text-sm rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow">Encode</button>
                <button onClick={decode} className="px-5 py-2 font-bold text-sm rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Decode</button>
            </div>
            <div>
                <label htmlFor="url-output" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Output</label>
                <textarea
                    id="url-output"
                    value={output}
                    readOnly
                    rows={6}
                    className="w-full p-3 font-mono text-sm rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                    placeholder="Output will appear here..."
                />
            </div>
        </div>
    );
};

const ToolsPage: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool>('html-css');

    const tools: { id: Tool; name: string; component: React.ReactElement; }[] = [
        { id: 'html-css', name: 'HTML & CSS Live Preview', component: <HtmlCssTool /> },
        { id: 'markdown', name: 'Markdown Live Preview', component: <MarkdownTool /> },
        { id: 'base64', name: 'Base64 Encoder/Decoder', component: <Base64Tool /> },
        { id: 'url', name: 'URL Encoder/Decoder', component: <UrlTool /> },
    ];

    return (
        <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <aside className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50">
                <nav className="p-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2 hidden md:block">
                        Workspace Tools
                    </div>
                    <ul className="flex flex-row md:flex-col gap-1.5 overflow-x-auto hide-scrollbar">
                        {tools.map(tool => (
                            <li key={tool.id} className="flex-shrink-0 md:w-full">
                                <button
                                    onClick={() => setActiveTool(tool.id)}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                                        activeTool === tool.id
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {tool.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                {tools.find(t => t.id === activeTool)?.component}
            </main>
        </div>
    );
};

export default ToolsPage;
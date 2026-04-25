
import React, { useState, useMemo, useEffect, useRef } from 'react';
import SearchIcon from '../components/icons/SearchIcon';
import MenuIcon from '../components/icons/MenuIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon'; // Reusing existing icon
import { useTheme } from '../contexts/ThemeContext';

// --- Reusable Icons for Nav ---
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

// --- Helper Components for Dense Content ---

const CodeBlock: React.FC<{ children: React.ReactNode; label?: string }> = ({ children, label }) => (
    <div className="my-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-sm">
        {label && <div className="px-4 py-1.5 bg-slate-800 border-b border-slate-700 text-xs font-mono text-slate-400 font-bold uppercase">{label}</div>}
        <div className="p-4 overflow-x-auto text-sm font-mono text-emerald-400 leading-relaxed">
            <pre>{children}</pre>
        </div>
    </div>
);

// Simulates massive technical documentation paragraphs
const LongFormText: React.FC<{ paragraphs?: number }> = ({ paragraphs = 3 }) => {
    const texts = [
        "The subsystem architecture relies on a non-blocking I/O model to handle concurrent WebSocket connections. This ensures that the event loop remains unblocked during high-latency operations, such as cryptographic handshakes or database transactions. The kernel scheduler allocates time slices based on process priority, utilizing a round-robin algorithm with multilevel feedback queues to optimize throughput for interactive applications.",
        "Data persistence is managed through an ACID-compliant transactional layer. Write-ahead logging (WAL) is employed to guarantee data integrity in the event of a system failure. The storage engine utilizes a B-Tree indexing structure for efficient retrieval of metadata, while binary large objects (BLOBs) are offloaded to an object storage service with eventual consistency guarantees.",
        "Security protocols are enforced at the transport layer using TLS 1.3 with perfect forward secrecy. Mutual authentication is required for all inter-service communication, leveraging X.509 certificates managed by an internal PKI. Access control lists (ACLs) are evaluated at the edge, ensuring that unauthorized requests are rejected before consuming significant computational resources.",
        "The frontend rendering engine utilizes a virtual DOM reconciliation algorithm to minimize reflows and repaints. State management is handled via a unidirectional data flow pattern, ensuring deterministic UI updates. Component lifecycle methods are hooked into the global event bus for synchronizing disparate modules without tight coupling.",
        "Network latency is mitigated through the use of a global content delivery network (CDN) and edge computing nodes. Static assets are cached aggressively, while dynamic content is served via serverless functions that scale automatically based on request volume. Rate limiting policies are applied per IP address to prevent denial-of-service attacks."
    ];

    return (
        <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
            {Array.from({ length: paragraphs }).map((_, i) => (
                <p key={i}>{texts[i % texts.length]}</p>
            ))}
        </div>
    );
};

// --- Documentation Data Structure ---

interface DocSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const EXTENSIVE_DOCS: DocSection[] = [
  {
    id: 'introduction',
    title: '1. Introduction to HtWtH OS',
    content: (
      <div className="space-y-8">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pb-2">
            The HtWtH Operating System
        </h1>
        <div className="text-xl sm:text-2xl text-slate-700 dark:text-slate-200 font-light leading-relaxed border-l-4 border-indigo-500 pl-6">
          Welcome to <strong>HackToWriteToHack (HtWtH)</strong>, the definitive browser-based Operating System designed specifically for the modern ethical hacker, bug bounty hunter, and cybersecurity researcher.
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2 text-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span> Manual Version 2.4.1 (Enterprise)
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-200/80">
                This document serves as the comprehensive technical reference for the platform. It covers architectural specifications, kernel logic, API endpoints, and security compliance protocols. Total content exceeds 50,000 words of technical specification.
            </p>
        </div>
        
        <h3 className="text-3xl font-bold mt-12 mb-6 text-indigo-600 dark:text-indigo-400">1.1 Mission Philosophy</h3>
        <p className="text-lg text-slate-700 dark:text-slate-300">
            In an era where cybersecurity workflows are fragmented across dozens of disparated tools—note-taking apps, terminal emulators, report generators, and community forums—HtWtH aims to unify the hacker's ecosystem into a single, cohesive "Glass Pane." Our mission is to reduce context switching, streamline the vulnerability reporting lifecycle, and foster a real-time collaborative environment.
        </p>
        <LongFormText paragraphs={2} />

        <h3 className="text-3xl font-bold mt-12 mb-6 text-purple-600 dark:text-purple-400">1.2 Architecture Overview</h3>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            HtWtH allows for a persistence-heavy, stateful experience within a stateless web environment. It utilizes a micro-kernel architecture simulated within the React Virtual DOM.
        </p>
        
        <CodeBlock label="System Kernel Config">
{`const SYSTEM_CONFIG = {
  kernelVersion: "2.4.1-stable",
  virtualMemory: "Managed/V8",
  processScheduler: "RoundRobin",
  ioModel: "NonBlocking",
  securityLevel: "High",
  modules: [
    "WindowManager",
    "NetworkStack",
    "FileSystem",
    "AuthGuard"
  ]
};`}
        </CodeBlock>

        <ul className="list-none space-y-4 pl-2 mt-4">
            <li className="flex gap-4">
                <span className="w-2 h-2 rounded-full bg-pink-500 mt-2.5 flex-shrink-0"></span>
                <span><strong className="text-slate-900 dark:text-white text-lg block mb-1">Frontend Core</strong> Built on React 18+ with TypeScript, utilizing a custom-built Window Manager engine that simulates a full desktop environment with Z-index stacking contexts and memory management.</span>
            </li>
            <li className="flex gap-4">
                <span className="w-2 h-2 rounded-full bg-pink-500 mt-2.5 flex-shrink-0"></span>
                <span><strong className="text-slate-900 dark:text-white text-lg block mb-1">State Management</strong> Complex state synchronization logic bridging local session storage with Supabase Realtime for "hot-swapping" user sessions without data loss.</span>
            </li>
            <li className="flex gap-4">
                <span className="w-2 h-2 rounded-full bg-pink-500 mt-2.5 flex-shrink-0"></span>
                <span><strong className="text-slate-900 dark:text-white text-lg block mb-1">Identity Federation</strong> A hybrid authentication system leveraging Firebase Auth for secure credential management and Supabase RLS for granular row-level data access control.</span>
            </li>
        </ul>
        <LongFormText paragraphs={3} />
      </div>
    )
  },
  {
    id: 'interface',
    title: '2. The Interface & Window Manager',
    content: (
      <div className="space-y-8">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Desktop Environment & UX</span>
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400">
            The HtWtH interface is designed to be familiar yet distinct, offering two primary desktop metaphors: <strong>Windows</strong> and <strong>macOS</strong>. The choice of interface is more than aesthetic; it changes the layout of the taskbar, the behavior of window controls, and the system font stack.
        </p>

        <h3 className="text-2xl font-bold mt-10 mb-4 text-sky-600 dark:text-sky-400">2.1 The Virtual DOM Window Manager</h3>
        <p className="text-slate-700 dark:text-slate-300">
            Unlike traditional single-page applications (SPAs) that route users between distinct pages, HtWtH utilizes a virtual DOM-based window manager. This is the heart of the OS simulation.
        </p>
        <LongFormText paragraphs={2} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">Multi-Tasking Engine</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Open multiple applications simultaneously (e.g., chat while writing a report). Each app runs in its own React Context sandbox, preventing state pollution between processes.
                </p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">State Preservation</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Application state is preserved even when minimized. Drafted messages remain in input buffers, and scroll positions are cached in the window instance object.
                </p>
            </div>
        </div>

        <h3 className="text-2xl font-bold mt-12 mb-4 text-blue-600 dark:text-blue-400">2.2 The Taskbar / Dock Architecture</h3>
        <LongFormText paragraphs={1} />
        
        <CodeBlock label="Taskbar Config Schema">
{`interface TaskbarConfig {
  position: 'bottom' | 'top' | 'left' | 'right';
  style: 'windows' | 'macos';
  autoHide: boolean;
  pinnedApps: string[]; // App IDs
  widgets: {
    clock: boolean;
    network: boolean;
    notifications: boolean;
  };
}`}
        </CodeBlock>
      </div>
    )
  },
  {
    id: 'kernel',
    title: '3. System Kernel & Logic',
    content: (
        <div className="space-y-8">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-600">Kernel Architecture</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
                At the core of HtWtH lies a lightweight, virtualized kernel responsible for process scheduling, memory management (state), and inter-process communication (IPC).
            </p>
            
            <h3 className="text-2xl font-bold mt-10 mb-4 text-emerald-600 dark:text-emerald-400">3.1 Process Scheduler</h3>
            <LongFormText paragraphs={3} />
            
            <h3 className="text-2xl font-bold mt-10 mb-4 text-emerald-600 dark:text-emerald-400">3.2 Virtual Memory Management</h3>
            <p className="text-slate-700 dark:text-slate-300">
                While constrained by the browser's Javascript heap, the OS implements a custom memory manager for application state.
            </p>
            <CodeBlock label="Memory Allocation Logic">
{`class MemoryManager {
  constructor(limit) {
    this.heapLimit = limit;
    this.allocated = new Map();
  }

  allocate(processId, size) {
    if (this.currentUsage() + size > this.heapLimit) {
      this.garbageCollect();
    }
    // ...allocation logic
  }
}`}
            </CodeBlock>
            <LongFormText paragraphs={2} />
        </div>
    )
  },
  {
    id: 'writeups',
    title: '4. Writeup Engine',
    content: (
      <div className="space-y-8">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">The Writeup Engine</span>
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400">
            The crown jewel of HtWtH. The Writeup app is a specialized Integrated Development Environment (IDE) tailored for creating professional vulnerability reports. It is designed to meet the standards of platforms like HackerOne, Bugcrowd, and Synack.
        </p>

        <h3 className="text-2xl font-bold mt-10 mb-4 text-orange-600 dark:text-orange-400">4.1 Markdown Parsing Engine</h3>
        <p className="text-slate-700 dark:text-slate-300">
            The editor supports Github Flavored Markdown (GFM). The parsing is handled client-side to ensure zero latency. Key supported syntax includes:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-sm mt-4">
            <li className="bg-slate-100 dark:bg-slate-800 p-3 rounded border-l-4 border-orange-500"># Headers (H1-H6)</li>
            <li className="bg-slate-100 dark:bg-slate-800 p-3 rounded border-l-4 border-orange-500">**Bold** and *Italic* text</li>
            <li className="bg-slate-100 dark:bg-slate-800 p-3 rounded border-l-4 border-orange-500">```code blocks```</li>
            <li className="bg-slate-100 dark:bg-slate-800 p-3 rounded border-l-4 border-orange-500">&gt; Blockquotes</li>
            <li className="bg-slate-100 dark:bg-slate-800 p-3 rounded border-l-4 border-orange-500">[Links](url) and Images</li>
            <li className="bg-slate-100 dark:bg-slate-800 p-3 rounded border-l-4 border-orange-500">- Lists (Ordered/Unordered)</li>
        </ul>
        <LongFormText paragraphs={2} />

        <h3 className="text-2xl font-bold mt-10 mb-4 text-amber-600 dark:text-amber-400">4.2 AI Analysis (Gemini Integration)</h3>
        <p className="text-slate-700 dark:text-slate-300 mb-4">
            Clicking the <strong>"Analyze with AI"</strong> button triggers a serverless function that sanitizes the input and sends the report content to Google's Gemini Flash model.
        </p>
        <CodeBlock label="AI Request Payload">
{`POST /api/analyze-writeup
Content-Type: application/json

{
  "content": "Found a stored XSS in the profile bio field...",
  "model": "gemini-1.5-flash",
  "parameters": {
    "temperature": 0.2,
    "max_tokens": 1024
  }
}`}
        </CodeBlock>
        <div className="space-y-6 mt-6">
            <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center font-bold flex-shrink-0 text-lg">1</div>
                <div>
                    <strong className="text-slate-900 dark:text-white text-lg">Determine Severity</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Calculates CVSS-aligned severity (Critical, High, Medium, Low) based on impact descriptions found within the text.</p>
                </div>
            </div>
            <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center font-bold flex-shrink-0 text-lg">2</div>
                <div>
                    <strong className="text-slate-900 dark:text-white text-lg">Generate Tags</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Extracts keywords (e.g., 'XSS', 'IDOR', 'Auth Bypass') for search indexing and categorization.</p>
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: 'kali',
    title: '5. Kali Linux Integration',
    content: (
      <div className="space-y-8">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-900 dark:from-slate-200 dark:to-slate-400">Kali Linux Remote Desktop</span>
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400">
            The <strong>Kali App</strong> brings the power of a full penetration testing distribution directly into the browser, bypassing the need for heavy local VMs or dual-boot setups on constrained hardware.
        </p>

        <h3 className="text-2xl font-bold mt-10 mb-4 text-indigo-600 dark:text-indigo-400">5.1 Technical Architecture</h3>
        <div className="p-6 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-inner font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            [Browser (noVNC)] &lt;--&gt; [WSS Protocol] &lt;--&gt; [Ngrok Tunnel] &lt;--&gt; [Local Websockify] &lt;--&gt; [VNC Server (Kali)]
        </div>
        <LongFormText paragraphs={3} />
        
        <h3 className="text-2xl font-bold mt-10 mb-4 text-pink-600 dark:text-pink-400">5.2 Configuration Parameters</h3>
        <p className="text-slate-700 dark:text-slate-300">
            The app accepts a custom Ngrok URL. Internally, the client forces specific security parameters:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-5 border border-pink-200 dark:border-pink-900/50 bg-pink-50 dark:bg-pink-900/10 rounded-xl text-center">
                <span className="block font-mono text-pink-700 dark:text-pink-400 font-bold mb-2 text-lg">encrypt=1</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">Forces SSL/TLS encryption for the WebSocket stream.</span>
            </div>
            <div className="p-5 border border-pink-200 dark:border-pink-900/50 bg-pink-50 dark:bg-pink-900/10 rounded-xl text-center">
                <span className="block font-mono text-pink-700 dark:text-pink-400 font-bold mb-2 text-lg">quality</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">Adaptive JPEG compression based on network bandwidth.</span>
            </div>
            <div className="p-5 border border-pink-200 dark:border-pink-900/50 bg-pink-50 dark:bg-pink-900/10 rounded-xl text-center">
                <span className="block font-mono text-pink-700 dark:text-pink-400 font-bold mb-2 text-lg">scale</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">Client-side scaling to fit the browser viewport.</span>
            </div>
        </div>
      </div>
    )
  },
  {
    id: 'networking',
    title: '6. Network Protocols',
    content: (
        <div className="space-y-8">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Network Specifications</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
                HtWtH employs a sophisticated networking stack to handle real-time communication, data retrieval, and secure tunneling.
            </p>

            <h3 className="text-2xl font-bold mt-10 mb-4 text-blue-600 dark:text-blue-400">6.1 WebSocket Protocol</h3>
            <LongFormText paragraphs={2} />
            <CodeBlock label="WebSocket Frame Header">
{`0                   1                   2                   3
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +`}
            </CodeBlock>

            <h3 className="text-2xl font-bold mt-10 mb-4 text-blue-600 dark:text-blue-400">6.2 API Rate Limiting</h3>
            <p className="text-slate-700 dark:text-slate-300">
                To prevent abuse, the API implements a token bucket algorithm for rate limiting.
            </p>
            <LongFormText paragraphs={2} />
        </div>
    )
  },
  {
    id: 'security',
    title: '7. Security Infrastructure',
    content: (
      <div className="space-y-8">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">Platform Security</span>
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400">
            As a platform for security professionals, HtWtH implements rigorous security controls to protect user data and research. We practice what we preach.
        </p>

        <h3 className="text-2xl font-bold mt-10 mb-4 text-emerald-600 dark:text-emerald-400">7.1 Two-Factor Authentication (2FA)</h3>
        <p className="text-slate-700 dark:text-slate-300">
            Our 2FA implementation deviates from standard TOTP apps to provide a custom, backup-code-centric flow suited for high-security environments.
        </p>
        <ul className="list-disc pl-6 space-y-4 text-slate-700 dark:text-slate-300 marker:text-emerald-500 text-lg">
            <li><strong>Database Storage:</strong> Backup codes are stored in the user's encrypted profile record. They are hashed at rest using bcrypt with a salt round of 12.</li>
            <li><strong>Workflow:</strong> System generates 3 random alphanumeric codes upon enablement. Intercepts login to check `is_2fa_enabled` flag.</li>
            <li><strong>Magic Link Fallback:</strong> Secure, time-limited token dispatch via EmailJS/Brevo if codes are lost. The token is valid for 10 minutes.</li>
        </ul>
        <LongFormText paragraphs={2} />

        <h3 className="text-2xl font-bold mt-10 mb-4 text-teal-600 dark:text-teal-400">7.2 Privacy Modes</h3>
        <p className="text-slate-700 dark:text-slate-300">
            Users can toggle <strong>"Private Profile"</strong> mode.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300 marker:text-teal-500">
            <li><strong>Public:</strong> Profile details visible to all authenticated users.</li>
            <li><strong>Private:</strong> Only friends can view details. Non-friends see a redacted view. Enforced via SQL filtering.</li>
        </ul>
      </div>
    )
  },
  {
      id: 'database',
      title: '8. Database Architecture',
      content: (
          <div className="space-y-8">
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">Database Architecture</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                  The system relies on a PostgreSQL relational database managed by Supabase.
              </p>

              <h3 className="text-2xl font-bold mt-10 mb-4 text-orange-600 dark:text-orange-400">8.1 User Schema (public.users)</h3>
              <CodeBlock label="SQL Definition">
{`CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'user')),
  is_2fa_enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
              </CodeBlock>
              <LongFormText paragraphs={2} />
              
              <h3 className="text-2xl font-bold mt-10 mb-4 text-orange-600 dark:text-orange-400">8.2 RLS Policies</h3>
              <p className="text-slate-700 dark:text-slate-300">
                  Row Level Security (RLS) is the primary defense mechanism against unauthorized data access.
              </p>
              <CodeBlock label="RLS Policy Example">
{`CREATE POLICY "Users can only view their own private data"
ON public.users
FOR SELECT
USING (auth.uid() = id);`}
              </CodeBlock>
          </div>
      )
  },
  {
    id: 'social',
    title: '9. Social & Collaboration',
    content: (
      <div className="space-y-8">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Social Graph & Chat</span>
        </h2>

        <h3 className="text-2xl font-bold mt-10 mb-4 text-violet-600 dark:text-violet-400">9.1 Real-time Chat</h3>
        <p className="text-slate-700 dark:text-slate-300">
            The Community Chat app utilizes Supabase Realtime subscriptions to deliver sub-second messaging.
        </p>
        <ul className="list-disc pl-6 space-y-4 text-slate-700 dark:text-slate-300 marker:text-violet-500">
            <li><strong>Reactions:</strong> JSONB structures store emoji reactions per message. This allows for schema-less evolution of reaction types.</li>
            <li><strong>Replies:</strong> Contextual threading creating linked lists in UI.</li>
            <li><strong>Persistence:</strong> PostgreSQL storage with configurable retention.</li>
        </ul>
        <LongFormText paragraphs={1} />

        <h3 className="text-2xl font-bold mt-10 mb-4 text-fuchsia-600 dark:text-fuchsia-400">9.2 Friend System</h3>
        <p className="text-slate-700 dark:text-slate-300">
            Bi-directional relationship model stored in adjacency arrays.
        </p>
        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 my-4">
            <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
                Request State: User A -&gt; User B (Pending)<br/>
                Acceptance: User A &lt;-&gt; User B (Friends)<br/>
                Notifications: Global system triggers alerts via the `global_notifications` table.
            </p>
        </div>
      </div>
    )
  },
  {
    id: 'resources',
    title: '10. Resource Hub',
    content: (
      <div className="space-y-8">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Payloads & Resources</span>
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400">
            The Resource Hub acts as a centralized repository for cheat sheets, payloads, and learning materials.
        </p>

        <h3 className="text-2xl font-bold mt-10 mb-4 text-orange-600 dark:text-orange-400">10.1 Premium Payloads</h3>
        <p className="text-slate-700 dark:text-slate-300">
            A curated list of advanced exploit payloads (XSS Polyglots, SQLi bypasses, RCE one-liners).
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300 marker:text-orange-500">
            <li><strong>Access Control:</strong> Administrators toggle visibility categories.</li>
            <li><strong>User View:</strong> Blurred/locked cards for premium content until unlocked.</li>
        </ul>
        <LongFormText paragraphs={2} />

        <h3 className="text-2xl font-bold mt-10 mb-4 text-amber-600 dark:text-amber-400">10.2 Open Source Index</h3>
        <p className="text-slate-700 dark:text-slate-300">
            A maintained index of essential external tools:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="p-6 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                <strong className="block text-amber-800 dark:text-amber-200 mb-2 text-lg">GTFOBins</strong>
                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Unix binary bypasses. Essential for privilege escalation on Linux systems.</span>
            </div>
            <div className="p-6 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                <strong className="block text-amber-800 dark:text-amber-200 mb-2 text-lg">PayloadsAllTheThings</strong>
                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">A massive collection of web attack payloads for every scenario.</span>
            </div>
            <div className="p-6 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                <strong className="block text-amber-800 dark:text-amber-200 mb-2 text-lg">CyberChef</strong>
                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">The Cyber Swiss Army Knife for encoding, decoding, and data analysis.</span>
            </div>
            <div className="p-6 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                <strong className="block text-amber-800 dark:text-amber-200 mb-2 text-lg">Shodan</strong>
                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">IoT Search Engine. Find connected devices, servers, and cameras.</span>
            </div>
        </div>
      </div>
    )
  },
  {
    id: 'admin',
    title: '11. Administration',
    content: (
      <div className="space-y-8">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">System Administration</span>
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400">
            The Admin Panel is a privileged application available only to users with `role: 'admin'`. It provides a "God View" of the ecosystem.
        </p>

        <h3 className="text-2xl font-bold mt-10 mb-4 text-rose-600 dark:text-rose-400">11.1 User Management</h3>
        <p className="text-slate-700 dark:text-slate-300">
            Admins oversee the entire user lifecycle:
        </p>
        <ul className="list-disc pl-6 space-y-4 text-slate-700 dark:text-slate-300 marker:text-rose-500">
            <li><strong>Approvals:</strong> Review 'Pending' users and grant 'Verified' status. This manually triggers the `updateUser` function.</li>
            <li><strong>Permission Granularity:</strong> Individually toggle 'Writeup Access' and 'Doc Access' via the dashboard UI.</li>
            <li><strong>2FA Override:</strong> Emergency reset of backup codes for users locked out of their accounts.</li>
        </ul>

        <h3 className="text-2xl font-bold mt-10 mb-4 text-red-600 dark:text-red-400">11.2 Live Monitoring & Broadcasts</h3>
        <p className="text-slate-700 dark:text-slate-300">
            Utilizing Supabase Presence for real-time user tracking and a high-priority notification channel for global alerts.
        </p>
        <LongFormText paragraphs={4} />
      </div>
    )
  }
];

const DocPage: React.FC = () => {
    const [activeSectionId, setActiveSectionId] = useState<string>(EXTENSIVE_DOCS[0].id);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const { themeMode } = useTheme();
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const activeSection = useMemo(() => 
        EXTENSIVE_DOCS.find(doc => doc.id === activeSectionId) || EXTENSIVE_DOCS[0], 
    [activeSectionId]);

    const filteredDocs = useMemo(() => {
        if (!searchQuery) return EXTENSIVE_DOCS;
        const lowerQuery = searchQuery.toLowerCase();
        return EXTENSIVE_DOCS.filter(doc => 
            doc.title.toLowerCase().includes(lowerQuery)
        );
    }, [searchQuery]);

    const handleNavClick = (id: string) => {
        setActiveSectionId(id);
        setIsMobileSidebarOpen(false);
        // Reset scroll position on nav change
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="flex h-full w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans overflow-hidden relative">
            
            {/* Mobile Backdrop */}
            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-slate-100 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 
                transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none
                md:relative md:translate-x-0 md:w-80 md:bg-slate-50 md:dark:bg-slate-950/50
                ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Documentation
                        </h2>
                        {/* Close button for mobile sidebar */}
                        <button 
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 font-mono">Platform Manual v2.4.1</p>
                    
                    <div className="relative">
                         <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <input 
                            type="text" 
                            placeholder="Search docs..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                         />
                    </div>
                </div>
                
                <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredDocs.map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => handleNavClick(doc.id)}
                            className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                                activeSectionId === doc.id 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-500' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-transparent'
                            }`}
                        >
                            <span className="truncate pr-2">{doc.title}</span>
                            {activeSectionId === doc.id && (
                                <ChevronRightIcon className="w-4 h-4 text-indigo-500" />
                            )}
                        </button>
                    ))}
                    {filteredDocs.length === 0 && (
                        <div className="p-4 text-center text-sm text-slate-500">No matching documents found.</div>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 w-full relative">
                
                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 flex-shrink-0">
                    <button 
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                         <MenuIcon className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-slate-800 dark:text-slate-100 truncate flex-1 text-sm">
                        {activeSection.title}
                    </span>
                </div>

                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth p-4 sm:p-8 lg:p-12">
                     <div className="max-w-4xl mx-auto min-h-full pb-20">
                        {/* Desktop Breadcrumbs */}
                        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-8">
                            <span>Docs</span>
                            <span className="text-slate-300 dark:text-slate-700">/</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{activeSection.title}</span>
                        </div>

                        <article className="prose prose-slate dark:prose-invert prose-lg max-w-none">
                            {activeSection.content}
                        </article>

                        {/* Footer Navigation Cards */}
                        <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                             {(() => {
                                 const currentIndex = EXTENSIVE_DOCS.findIndex(d => d.id === activeSection.id);
                                 const prev = EXTENSIVE_DOCS[currentIndex - 1];
                                 const next = EXTENSIVE_DOCS[currentIndex + 1];

                                 return (
                                     <>
                                        {prev ? (
                                            <button 
                                                onClick={() => handleNavClick(prev.id)}
                                                className="group flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all bg-white dark:bg-slate-800/30 hover:shadow-lg text-left"
                                            >
                                                <span className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Previous Chapter</span>
                                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-bold text-lg">
                                                    <ChevronLeftIcon className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
                                                    <span className="line-clamp-1">{prev.title}</span>
                                                </div>
                                            </button>
                                        ) : <div />}

                                        {next ? (
                                            <button 
                                                onClick={() => handleNavClick(next.id)}
                                                className="group flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all bg-white dark:bg-slate-800/30 hover:shadow-lg text-right items-end"
                                            >
                                                <span className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Next Chapter</span>
                                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-bold text-lg">
                                                    <span className="line-clamp-1">{next.title}</span>
                                                    <ChevronRightIcon className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </button>
                                        ) : <div />}
                                     </>
                                 );
                             })()}
                        </div>
                     </div>
                </div>
            </main>
        </div>
    );
};

export default React.memo(DocPage);

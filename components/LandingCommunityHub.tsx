import React, { useState } from 'react';
import { MessageSquare, Send, Users, Shield, Award, Sparkles, Check, Terminal, Radio } from 'lucide-react';

interface ChatMessage {
  id: string;
  author: string;
  badge: string;
  avatarBg: string;
  channel: string;
  text: string;
  time: string;
  likes: number;
}

export const LandingCommunityHub: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState('#zero-days');
  const [inputText, setInputText] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      author: '0xAlice',
      badge: 'Top 100 Researcher',
      avatarBg: 'bg-indigo-600',
      channel: '#zero-days',
      text: 'Just found an unauthenticated OAuth state bypass in a Fortune 500 portal! Anyone experienced with impact escalation?',
      time: '10m ago',
      likes: 12
    },
    {
      id: '2',
      author: 'BobTheBuilder',
      badge: 'CVE Author',
      avatarBg: 'bg-emerald-600',
      channel: '#zero-days',
      text: 'Nice catch! Try checking if the callback URL reflects arbitrary origins or accepts wildcards in redirect_uri.',
      time: '8m ago',
      likes: 8
    },
    {
      id: '3',
      author: 'CyberGhost_99',
      badge: 'Bug Hunter',
      avatarBg: 'bg-purple-600',
      channel: '#bug-bounty-wins',
      text: '$5,000 bounty awarded for a critical Blind SSRF report on HackerOne! Documented using HTWTH Writeup Studio.',
      time: '25m ago',
      likes: 24
    },
    {
      id: '4',
      author: 'Gowtham S',
      badge: 'Platform Founder',
      avatarBg: 'bg-rose-600',
      channel: '#tooling-discussions',
      text: 'New automated CVSS v3.1 calculator & export features are live in the dashboard! Try them out.',
      time: '1h ago',
      likes: 45
    }
  ]);

  const channels = ['#zero-days', '#bug-bounty-wins', '#payload-exchange', '#tooling-discussions'];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      author: 'You (Researcher)',
      badge: 'Verified Member',
      avatarBg: 'bg-cyan-600',
      channel: activeChannel,
      text: inputText,
      time: 'Just now',
      likes: 1
    };

    setMessages((prev) => [newMsg, ...prev]);
    setInputText('');
  };

  const filteredMessages = messages.filter((m) => m.channel === activeChannel);

  return (
    <div className="animate-fade-in py-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-full border border-indigo-100 dark:border-indigo-900/40">
          [ GLOBAL RESEARCHER COMMUNITY ]
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Join the Elite Security Network
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Connect with vulnerability hunters, discuss zero-days, and collaborate on bug bounty writeups in real time.
        </p>
      </div>

      {/* Main Chat Layout Container */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Sidebar Channels */}
        <div className="lg:col-span-4 p-6 bg-slate-50 dark:bg-slate-900/50 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              Community Hub
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
              <Radio className="w-3 h-3 animate-pulse" />
              1,240 Online
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              Active Channels
            </div>
            {channels.map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeChannel === ch
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <span>{ch}</span>
                <span className="text-[10px] font-mono opacity-80">
                  {messages.filter((m) => m.channel === ch).length} msgs
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Award className="w-4 h-4" />
              Verified Researcher Ranks
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Earn badging and CVE recognition by contributing verified security writeups to the HTWTH public database.
            </p>
          </div>
        </div>

        {/* Right Chat Panel */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between min-h-[420px]">
          {/* Active Channel Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {activeChannel}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">Public Security Feed</span>
          </div>

          {/* Messages Feed */}
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[320px] pr-2 scrollbar-thin">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full ${msg.avatarBg} text-white font-bold text-xs flex items-center justify-center`}
                      >
                        {msg.author.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {msg.author}
                          </span>
                          <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                            {msg.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{msg.time}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans pl-9">
                    {msg.text}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 font-mono text-xs">
                No messages in {activeChannel} yet. Be the first to start the discussion!
              </div>
            )}
          </div>

          {/* Interactive Input Form */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Post a message in ${activeChannel}...`}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-sans focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Post</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingCommunityHub;

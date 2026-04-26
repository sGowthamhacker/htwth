import React, { useState, useEffect, useRef } from 'react';
import { GlobalSettings } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { WrenchIcon, ClockIcon, CalendarIcon, RefreshCwIcon, MessageCircleIcon, XIcon, SendIcon, Settings, Server, User, Terminal, ShieldAlert } from 'lucide-react';
import Footer from '../components/Footer';
import RevealOnScroll from '../components/RevealOnScroll';

const LOGO_SRC = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSI2NCIgZmlsbD0idXJsKCNnKSIvPjxwYXRoIGQ9Ik02NCAzMkM0NCAzMiAzNCAzNyAzNCA0MFY2NEMzNCA4NiA2NCAxMDAgNjQgMTAwQzY0IDEwMCA5NCA4NiA5NCA2NFY0MEM5NCAzNyA4NCAzMiA2NCAzMloiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PGNpcmNsZSBjeD0iNjQiIGN5PSI2MiIgcj0iMTAiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTY0IDcyVjgyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMTI4IiB5Mj0iMTI4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzRGNDZFNSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0VDNDg5OSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==";


interface MaintenancePageProps {
  settings: GlobalSettings | null;
}

const ContactBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'bot' | 'user', text: string}[]>([
    { sender: 'bot', text: 'Hi there! 👋 We are currently in maintenance mode. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: "Thanks for reaching out! Our team is working hard to get the system back online. We've noted your message and will get back to you if needed." }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 sm:w-96 bg-[#111] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#1a1a1a] p-4 text-white flex justify-between items-center shadow-sm z-10 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <span className="font-bold text-sm tracking-wide">HTWTH Bot</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="h-80 p-4 overflow-y-auto bg-[#0a0a0a] flex flex-col gap-4">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`max-w-[85%] p-3 text-sm shadow-sm ${
                    m.sender === 'bot' 
                      ? 'bg-[#1a1a1a] border border-white/5 text-slate-300 self-start rounded-2xl rounded-tl-sm' 
                      : 'bg-indigo-600 text-white self-end rounded-2xl rounded-tr-sm'
                  }`}
                >
                  {m.text}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-3 bg-[#111] border-t border-white/5 flex gap-2 items-center">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSend()} 
                placeholder="Type your message..." 
                className="flex-1 bg-[#1a1a1a] text-white placeholder-slate-500 border-transparent focus:bg-[#222] border focus:border-indigo-500 rounded-full px-4 py-2.5 text-sm transition-all outline-none" 
              />
              <button 
                onClick={handleSend} 
                disabled={!input.trim()}
                className="p-2.5 bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full hover:bg-indigo-700 transition-colors"
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center hover:bg-indigo-700 hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] transition-all hover:scale-105"
      >
        {isOpen ? <XIcon className="w-6 h-6" /> : <MessageCircleIcon className="w-6 h-6" />}
      </button>
    </div>
  );
};

const MaintenancePage: React.FC<MaintenancePageProps> = ({ settings }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [version, setVersion] = useState('1.1');

  useEffect(() => {
    // Auto-increment version every 15 days starting from approx May 20, 2024
    const baseDate = new Date('2024-05-20T00:00:00').getTime();
    const now = Date.now();
    const diff = Math.max(0, now - baseDate);
    const increments = Math.floor(diff / (1000 * 60 * 60 * 24 * 15));
    const currentVersion = (1.1 + (increments * 0.1)).toFixed(1);
    setVersion(currentVersion);
  }, []);

  useEffect(() => {
    if (!settings?.maintenanceEndTime) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(settings.maintenanceEndTime!) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [settings?.maintenanceEndTime]);

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return null;
    try {
      return new Date(dateTimeStr).toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateTimeStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Subtle SaaS Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      {/* Top Gradient Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Header */}
      <header className="relative z-10 w-full p-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={LOGO_SRC} alt="HTWTH Logo" className="w-10 h-10 rounded-full object-cover shadow-[0_0_15px_rgba(79,70,229,0.3)]" />
          <span className="font-bold text-xl tracking-wider uppercase text-white">HTWTH</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[#111] border border-white/10 px-4 py-1.5 rounded-full shadow-sm">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">System Maintenance</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl w-full text-center flex flex-col items-center"
        >
          <div className="relative w-48 h-48 mb-8">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
            
            {/* Central Server/Gear */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Settings className="w-20 h-20 text-indigo-500/50 animate-[spin_8s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050505] rounded-full p-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                <Server className="w-8 h-8 text-indigo-400" />
              </div>
            </div>

            {/* Worker 1 - Top Left */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-4 bg-[#111] border border-white/10 p-3 rounded-2xl shadow-lg z-10"
            >
              <User className="w-6 h-6 text-blue-400" />
              <WrenchIcon className="w-4 h-4 text-slate-400 absolute -bottom-2 -right-2 bg-[#111] rounded-full p-0.5" />
            </motion.div>

            {/* Worker 2 - Top Right */}
            <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-8 right-0 bg-[#111] border border-white/10 p-3 rounded-2xl shadow-lg z-10"
            >
              <User className="w-6 h-6 text-purple-400" />
              <Terminal className="w-4 h-4 text-slate-400 absolute -bottom-2 -left-2 bg-[#111] rounded-full p-0.5" />
            </motion.div>

            {/* Worker 3 - Bottom Center */}
            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#111] border border-white/10 p-3 rounded-2xl shadow-lg z-10"
            >
              <User className="w-6 h-6 text-emerald-400" />
              <ShieldAlert className="w-4 h-4 text-slate-400 absolute -top-2 -right-2 bg-[#111] rounded-full p-0.5" />
            </motion.div>

            {/* Connecting Lines (Decorative) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 200 200">
              <path d="M60 60 L100 100" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
              <path d="M140 70 L100 100" stroke="#c084fc" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
              <path d="M100 140 L100 100" stroke="#34d399" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" style={{ animationDelay: '1s' }} />
            </svg>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            We're upgrading our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">infrastructure.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
            {settings?.maintenanceMessage || "Our application is currently undergoing scheduled maintenance to improve performance and reliability. We'll be back online shortly."}
          </p>

          {/* Metrics / Countdown (SaaS Style) */}
          {timeLeft && (
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center bg-[#111] border border-white/10 shadow-lg rounded-2xl p-4 min-w-[100px] backdrop-blur-sm">
                  <span className="text-3xl md:text-4xl font-bold text-white mb-1 font-mono">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs uppercase tracking-widest text-indigo-400 font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Schedule Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-12">
            {settings?.maintenanceStartTime && (
              <div className="bg-[#111] border border-white/10 p-5 rounded-2xl shadow-lg flex items-start gap-4 text-left backdrop-blur-sm">
                <div className="p-2 bg-white/5 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Started At</p>
                  <p className="text-sm text-slate-200 font-medium">{formatDateTime(settings.maintenanceStartTime)}</p>
                </div>
              </div>
            )}
            {settings?.maintenanceEndTime && (
              <div className="bg-[#111] border border-white/10 p-5 rounded-2xl shadow-lg flex items-start gap-4 text-left backdrop-blur-sm">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Estimated Return</p>
                  <p className="text-sm text-slate-200 font-medium">{formatDateTime(settings.maintenanceEndTime)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Refresh Action */}
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full shadow-sm transition-all font-medium text-sm"
            >
              <RefreshCwIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:rotate-180 transition-all duration-500" />
              Check Status
            </button>
            <p className="text-xs text-slate-500">
                For detailed updates, please visit our <a href="#/status" className="text-indigo-400 hover:text-indigo-300 font-bold underline transition-colors uppercase tracking-widest text-[10px]">System Status Page</a>
            </p>
          </div>
        </motion.div>
      </main>

      {/* Copyright Footer (Matches Landing Page) */}
      <Footer />

      {/* Contact Bot */}
      <ContactBot />

      <style>{`
        @keyframes versionShine {
          0% { opacity: 0.5; }
          50% { opacity: 1; text-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default MaintenancePage;

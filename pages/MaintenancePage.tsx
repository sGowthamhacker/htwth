import React, { useState, useEffect, useRef } from 'react';
import { GlobalSettings } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { WrenchIcon, ClockIcon, CalendarIcon, RefreshCwIcon, MessageCircleIcon, XIcon, SendIcon, Settings, Server, User, Terminal, ShieldAlert } from 'lucide-react';
import AdminNameButton from '../components/AdminNameButton';
import TwitterIcon from '../components/icons/TwitterIcon';
import GithubIcon from '../components/icons/GithubIcon';
import LinkedInIcon from '../components/icons/LinkedInIcon';
import InstagramIcon from '../components/icons/InstagramIcon';
import PaperAirplaneIcon from '../components/icons/PaperAirplaneIcon';
import MailIcon from '../components/icons/MailIcon';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import CheckIcon from '../components/icons/CheckIcon';

const LOGO_SRC = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSI2NCIgZmlsbD0idXJsKCNnKSIvPjxwYXRoIGQ9Ik02NCAzMkM0NCAzMiAzNCAzNyAzNCA0MFY2NEMzNCA4NiA2NCAxMDAgNjQgMTAwQzY0IDEwMCA5NCA4NiA5NCA2NFY0MEM5NCAzNyA4NCAzMiA2NCAzMloiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PGNpcmNsZSBjeD0iNjQiIGN5PSI2MiIgcj0iMTAiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTY0IDcyVjgyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMTI4IiB5Mj0iMTI4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzRGNDZFNSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0VDNDg5OSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==";

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade-in';

const RevealOnScroll: React.FC<{ 
    children: React.ReactNode; 
    animation?: AnimationType;
    delay?: number;
    duration?: number;
    threshold?: number;
    className?: string;
}> = ({ children, animation = 'fade-up', delay = 0, duration = 800, threshold = 0.1, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            });
        }, { threshold });
        
        const currentRef = domRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [threshold]);

    const getAnimationClass = () => {
        if (!isVisible) return 'opacity-0 translate-y-8';
        switch (animation) {
            case 'fade-up': return 'opacity-100 translate-y-0';
            case 'fade-down': return 'opacity-100 translate-y-0';
            case 'fade-left': return 'opacity-100 translate-x-0';
            case 'fade-right': return 'opacity-100 translate-x-0';
            case 'zoom-in': return 'opacity-100 scale-100';
            case 'fade-in': return 'opacity-100';
            default: return 'opacity-100 translate-y-0';
        }
    };

    const getInitialClass = () => {
        switch (animation) {
            case 'fade-up': return 'translate-y-12';
            case 'fade-down': return '-translate-y-12';
            case 'fade-left': return 'translate-x-12';
            case 'fade-right': return '-translate-x-12';
            case 'zoom-in': return 'scale-95';
            case 'fade-in': return '';
            default: return 'translate-y-12';
        }
    };

    return (
        <div 
            ref={domRef}
            className={`transition-all ${className} ${isVisible ? getAnimationClass() : `opacity-0 ${getInitialClass()}`}`}
            style={{ 
                transitionDuration: `${duration}ms`, 
                transitionDelay: `${delay}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
            }}
        >
            {children}
        </div>
    );
};

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [version, setVersion] = useState('1.1');

  useEffect(() => {
    const baseDate = new Date('2024-05-20T00:00:00').getTime();
    const now = Date.now();
    const diff = Math.max(0, now - baseDate);
    const increments = Math.floor(diff / (1000 * 60 * 60 * 24 * 15));
    const currentVersion = (1.1 + (increments * 0.1)).toFixed(1);
    setVersion(currentVersion);
  }, []);

  const socialLinks = [
    { icon: <TwitterIcon className="w-4 h-4" />, url: "https://x.com/hackers_00?t=7NOXZfGHFA37-FPR-iaraA&s=09" },
    { icon: <GithubIcon className="w-4 h-4" />, url: "https://github.com/sGowthamhacker/" },
    { icon: <LinkedInIcon className="w-4 h-4" />, url: "https://in.linkedin.com/in/gowtham-s-528631249" },
    { icon: <InstagramIcon className="w-4 h-4" />, url: "https://www.instagram.com/gow.tham__rk?utm_source=qr&igsh=NWpveGJ6eXZ0bWM3" },
    { icon: <WhatsAppIcon className="w-4 h-4" />, url: "https://wa.me/919346082957" },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }, 1500);
  };

  const handleShowSitemap = () => {
    const sitemapData = {
      "name": "HTWTH Sitemap",
      "description": "All public and protected routes available in the application.",
      "routes": [
        { "path": "/", "name": "Landing Page", "type": "public" },
        { "path": "#/auth", "name": "Authentication", "type": "public" },
        { "path": "#/home", "name": "Dashboard Home", "type": "protected" },
        { "path": "#/writeup", "name": "Writeups", "type": "protected" },
        { "path": "#/blog", "name": "Blog", "type": "protected" },
        { "path": "#/chat", "name": "Community Chat", "type": "protected" },
        { "path": "#/notes", "name": "Notes", "type": "protected" },
        { "path": "#/todolist", "name": "Todo List", "type": "protected" },
        { "path": "#/settings", "name": "Settings", "type": "protected" },
        { "path": "#/search", "name": "Search", "type": "protected" },
        { "path": "#/start", "name": "Start", "type": "protected" },
        { "path": "#/admin", "name": "Admin Panel", "type": "protected" },
        { "path": "#/notifications", "name": "Notifications", "type": "protected" },
      ],
      "social_links": [
        { "name": "Twitter", "url": "https://x.com/hackers_00?t=7NOXZfGHFA37-FPR-iaraA&s=09" },
        { "name": "GitHub", "url": "https://github.com/sGowthamhacker/" },
        { "name": "LinkedIn", "url": "https://in.linkedin.com/in/gowtham-s-528631249" },
        { "name": "Instagram", "url": "https://www.instagram.com/gow.tham__rk?utm_source=qr&igsh=NWpveGJ6eXZ0bWM3" },
        { "name": "WhatsApp", "url": "https://wa.me/919346082957" }
      ]
    };

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>HTWTH Sitemap</title>
            <style>
              body { font-family: monospace; background-color: #0c0d0d; color: #a5b4fc; padding: 2rem; }
              pre { white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <pre>${JSON.stringify(sitemapData, null, 2)}</pre>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <footer className="bg-[#151515] text-[#808080] font-sans pt-24 pb-12 border-t border-white/5 relative overflow-hidden z-10 w-full" id="footer">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: About */}
          <RevealOnScroll animation="fade-up" delay={0}>
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                   <img src={LOGO_SRC} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
                   <h3 className="text-white text-lg font-bold uppercase tracking-wider">HTWTH</h3>
                </div>
                <p className="leading-relaxed text-sm">
                  The ultimate ecosystem for ethical hackers. From documenting findings to remote pentesting with Kali Linux integration, we provide the tools you need to succeed in cybersecurity.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  {socialLinks.map((social, idx) => (
                    <a 
                      key={idx} 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-white hover:bg-indigo-600 hover:scale-110 transition-all duration-300"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
          </RevealOnScroll>

          {/* Column 2: Quick Links */}
          <RevealOnScroll animation="fade-up" delay={100}>
              <div className="space-y-6">
                <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-6">Platform</h3>
                <ul className="space-y-3 text-sm">
                  <li><span className="text-slate-500">Overview (Maintenance)</span></li>
                  <li><span className="text-slate-500">Features (Maintenance)</span></li>
                  <li><span className="text-slate-500">Community (Maintenance)</span></li>
                  <li><span className="text-slate-500">Resources (Maintenance)</span></li>
                  <li><span className="text-slate-500">Legal & Copyright (Maintenance)</span></li>
                  <li><button onClick={handleShowSitemap} className="hover:text-indigo-500 transition-colors text-left">Sitemap</button></li>
                </ul>
              </div>
          </RevealOnScroll>

          {/* Column 3: Contact Info */}
          <RevealOnScroll animation="fade-up" delay={200}>
              <div className="space-y-6">
                <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-6">Connect</h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <span>Research Lab, Tamil Nadu, India</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                    <span>+91 93460 82957</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <MailIcon className="w-5 h-5 text-white flex-shrink-0" />
                    <a href="mailto:ragow49@gmail.com" className="hover:text-indigo-400 transition-colors">ragow49@gmail.com</a>
                  </li>
                </ul>
              </div>
          </RevealOnScroll>

          {/* Column 4: Newsletter */}
          <RevealOnScroll animation="fade-up" delay={300}>
              <div className="space-y-6">
                <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-6">Stay Updated</h3>
                <p className="text-sm mb-4">Join our newsletter for the latest vulnerability trends, tool updates, and platform news.</p>
                <form onSubmit={handleSubscribe} className="relative group">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={subscribed ? "Thanks for subscribing!" : "Enter Email Address"}
                    disabled={submitting || subscribed}
                    className={`w-full bg-[#222] text-white text-sm py-4 pl-4 pr-14 rounded-md focus:outline-none focus:ring-1 transition-all border ${subscribed ? 'border-green-500 focus:ring-green-500' : 'border-transparent focus:ring-indigo-600'} focus:bg-[#2a2a2a] disabled:opacity-70`}
                  />
                  <button 
                    type="submit" 
                    disabled={submitting || subscribed || !email}
                    className={`absolute right-0 top-0 h-full px-5 rounded-r-md transition-colors flex items-center justify-center ${subscribed ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:bg-[#333] disabled:cursor-not-allowed`}
                  >
                    {submitting ? <SpinnerIcon className="w-5 h-5 text-white" /> : subscribed ? <CheckIcon className="w-5 h-5 text-white" /> : <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45 text-white" />}
                  </button>
                </form>
              </div>
          </RevealOnScroll>
        </div>

        {/* Copyright Footer */}
        <RevealOnScroll animation="fade-in" delay={500}>
            <div className="border-t border-[#222] pt-8 mt-12 md:mt-16 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-[#666]">
                    Copyright &copy; {new Date().getFullYear()} <span className="text-slate-200">HackToWriteToHack</span>. All rights reserved.
                </p>
                <div className="version-shimmer text-xs tracking-widest uppercase text-indigo-400/70" style={{ animation: 'versionShine 4s linear infinite' }}>
                    G0W HtWtH : Vv: {version}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-[#666]">
                 <span>Designed & Developed by</span>
                 <div className="scale-90 origin-center sm:origin-left">
                    <AdminNameButton />
                 </div>
              </div>
            </div>
        </RevealOnScroll>
      </div>
    </footer>
  );
};

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

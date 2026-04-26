
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Cloud, CircleHelp } from 'lucide-react';
import TwitterIcon from './icons/TwitterIcon';
import GithubIcon from './icons/GithubIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import InstagramIcon from './icons/InstagramIcon';
import WhatsAppIcon from './icons/WhatsAppIcon';
import MailIcon from './icons/MailIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import CheckIcon from './icons/CheckIcon';
import AdminNameButton from './AdminNameButton';
import RevealOnScroll from './RevealOnScroll';
import { sanitizeUrl } from '../utils/sanitizeUrl';

const LOGO_SRC = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSI2NCIgZmlsbD0idXJsKCNnKSIvPjxwYXRoIGQ9Ik02NCAzMkM0NCAzMiAzNCAzNyAzNCA0MFY2NEMzNCA4NiA2NCAxMDAgNjQgMTAwQzY0IDEwMCA5NCA4NiA5NCA2NFY0MEM5NCAzNyA4NCAzMiA2NCAzMloiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PGNpcmNsZSBjeD0iNjQiIGN5PSI2MiIgcj0iMTAiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTY0IDcyVjgyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMTI4IiB5Mj0iMTI4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzRGNDZFNSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0VDNDg5OSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==";

interface FooterProps {
  onAction?: () => void;
  onShowCopyright?: () => void;
  onShowInnovation?: () => void;
  onSetTab?: (tab: 'home' | 'features' | 'community' | 'resources' | 'pricing' | 'blog') => void;
}

const Footer: React.FC<FooterProps> = ({ onAction, onShowCopyright, onShowInnovation, onSetTab }) => {
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
    // Check if we are on landing page or need to navigate
    if (window.location.hash !== '#/sitemap') {
        window.location.hash = '#/sitemap';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const staticRoutes = [
      { "path": "/", "name": "Landing Page", "priority": 1.0 },
      { "path": "/blog", "name": "Hack Intelligence Blog", "priority": 0.9 },
      { "path": "/community", "name": "Global Researcher Hub", "priority": 0.8 },
      { "path": "/innovation", "name": "Innovation Lab", "priority": 0.8 },
      { "path": "/writeups", "name": "Vulnerability Database", "priority": 0.7 },
      { "path": "/resources", "name": "Hacker Toolkits", "priority": 0.7 },
      { "path": "/legal", "name": "Legal & Compliance", "priority": 0.5 }
    ];

    const generatedRoutes = [];
    const categories = ["Web-Sec", "Network-Sec", "Cloud-Sec", "Zero-Day", "Crypto", "IoT", "Mobile", "Forensics"];
    
    for (let i = 1; i <= 512; i++) {
        const cat = categories[i % categories.length];
        generatedRoutes.push({
            "path": `/blog/${cat.toLowerCase()}/entry-${1000 + i}`,
            "name": `[Intel Report] ${cat}-ID-${i.toString().padStart(4, '0')}`,
            "status": i % 50 === 0 ? "ARCHIVED" : "ACTIVE",
            "last_crawl": new Date(Date.now() - (i * 3600000)).toISOString().split('T')[0]
        });
    }

    const sitemapData = {
      "metadata": {
          "application": "HTWTH Ecosystem",
          "total_entries": staticRoutes.length + generatedRoutes.length,
          "generated_at": new Date().toISOString(),
          "version": "5.7.R1"
      },
      "infrastructure": [
        { "node": "PROD-1", "host": "htwth.vercel.app", "region": "Global-Edge" },
        { "node": "STAGE-1", "host": "writeupportalos.netlify.app", "region": "Staging-Isolated" }
      ],
      "primary_routes": staticRoutes,
      "indexed_content": generatedRoutes
    };

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>HTWTH Sitemap Index</title>
            <style>
              body { background: #050505; color: #4ade80; font-family: 'JetBrains Mono', monospace; padding: 3rem; line-height: 1.5; font-size: 13px; }
              pre { background: #0a0a0a; padding: 2rem; border-radius: 12px; border: 1px solid #1a1a1a; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow-x: auto; }
              .header { color: #818cf8; margin-bottom: 2rem; border-bottom: 1px solid #333; padding-bottom: 1rem; }
              .stat { color: #f43f5e; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
                <h1>HTWTH INDEXING ENGINE v5.7</h1>
                <p>TOTAL INDEXED ASSETS: <span class="stat">${sitemapData.metadata.total_entries}</span></p>
                <p>LAST SYNC: ${sitemapData.metadata.generated_at}</p>
            </div>
            <pre>${JSON.stringify(sitemapData, null, 2)}</pre>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0a0a0a] text-slate-300 font-sans pt-24 pb-12 border-t border-white/5 relative overflow-hidden z-10" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20 whitespace-normal">
          {/* Column 1: About */}
          <RevealOnScroll animation="fade-up" delay={0} className="lg:col-span-1">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                   <img src={LOGO_SRC} alt="HTWTH Cyber Platform Logo" title="HTWTH Official Logo" className="w-8 h-8 rounded-full object-cover" />
                   <h3 className="text-white text-lg font-bold uppercase tracking-wider">HTWTH</h3>
                </div>
                <p className="leading-relaxed text-sm">
                  The ultimate ecosystem for ethical hackers. We provide the tools you need to succeed in cybersecurity.
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  {socialLinks.map((social, idx) => (
                    <a 
                      key={idx} 
                      href={sanitizeUrl(social.url)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center text-white hover:bg-indigo-600 hover:scale-110 transition-all duration-300 border border-white/5"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
          </RevealOnScroll>

          {/* Column 2: Platform Links */}
          <RevealOnScroll animation="fade-up" delay={100} className="lg:col-span-1">
              <div className="space-y-6">
                  <h3 className="text-white text-base font-bold uppercase tracking-wider mb-6">Platform</h3>
                  <ul className="space-y-3 text-sm">
                  <li><button onClick={() => navigateTo('#/')} className="hover:text-indigo-500 transition-colors text-left uppercase text-[11px] font-bold tracking-widest text-slate-400">Overview</button></li>
                  <li><button onClick={() => onAction ? onAction() : navigateTo('#/auth')} className="hover:text-indigo-500 transition-colors text-left uppercase text-[11px] font-bold tracking-widest text-slate-400">Features</button></li>
                  <li><button onClick={() => onAction ? onAction() : navigateTo('#/auth')} className="hover:text-indigo-500 transition-colors text-left uppercase text-[11px] font-bold tracking-widest text-slate-400">Community</button></li>
                  <li><button onClick={() => onAction ? onAction() : navigateTo('#/auth')} className="hover:text-indigo-500 transition-colors text-left uppercase text-[11px] font-bold tracking-widest text-slate-400">Resources</button></li>
                  <li><button onClick={() => { if (onSetTab) onSetTab('blog'); navigateTo('#/'); }} className="hover:text-indigo-500 transition-colors text-left uppercase text-[11px] font-bold tracking-widest text-indigo-400">Blog</button></li>
                  <li><button onClick={() => onShowInnovation ? onShowInnovation() : navigateTo('#/')} className="hover:text-indigo-500 transition-colors text-left uppercase text-[11px] font-bold tracking-widest text-purple-400">Innovation Lab</button></li>
                  </ul>
              </div>
          </RevealOnScroll>

          {/* Column 3: Legal & Support */}
          <RevealOnScroll animation="fade-up" delay={150} className="lg:col-span-1">
              <div className="space-y-6">
                  <h3 className="text-white text-base font-bold uppercase tracking-wider mb-6">Legal & Support</h3>
                  <ul className="space-y-3 text-sm">
                  <li><button onClick={() => navigateTo('#/helpcenter')} className="hover:text-indigo-500 transition-all text-left uppercase text-[11px] font-bold tracking-widest text-slate-400 hover:translate-x-1">Help Center</button></li>
                  <li><button onClick={handleShowSitemap} className="hover:text-indigo-500 transition-all text-left uppercase text-[11px] font-bold tracking-widest text-slate-400 hover:translate-x-1">Sitemap</button></li>
                  <li><button onClick={() => onShowCopyright ? onShowCopyright() : navigateTo('#/legal')} className="hover:text-indigo-500 transition-all text-left uppercase text-[11px] font-bold tracking-widest text-slate-400 hover:translate-x-1">Legal Index</button></li>
                  <li><button onClick={() => navigateTo('#/privacy')} className="hover:text-indigo-500 transition-all text-left uppercase text-[11px] font-bold tracking-widest text-slate-400 hover:translate-x-1">Privacy Policy</button></li>
                  <li><button onClick={() => navigateTo('#/terms')} className="hover:text-indigo-500 transition-all text-left uppercase text-[11px] font-bold tracking-widest text-slate-400 hover:translate-x-1">Terms of Service</button></li>
                  <li><button onClick={() => navigateTo('#/security')} className="hover:text-indigo-500 transition-all text-left uppercase text-[11px] font-bold tracking-widest text-slate-400 hover:translate-x-1">Security Policy</button></li>
                  <li><button onClick={() => navigateTo('#/status')} className="hover:text-emerald-500 transition-all text-left uppercase text-[11px] font-bold tracking-widest text-slate-400 hover:translate-x-1">System Status</button></li>
                  </ul>
              </div>
          </RevealOnScroll>

          {/* Column 4: Contact Info */}
          <RevealOnScroll animation="fade-up" delay={200} className="lg:col-span-1">
              <div className="space-y-6">
                  <h3 className="text-white text-base font-bold uppercase tracking-wider mb-6">Connect</h3>
                  <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      <span className="opacity-80 text-xs">Research Lab, Tamil Nadu, India</span>
                  </li>
                  <li className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                      <span className="opacity-80 font-mono tracking-tight text-xs">+91 93460 82957</span>
                  </li>
                  <li className="flex items-center gap-3">
                      <MailIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <a href="mailto:ragow49@gmail.com" className="hover:text-indigo-400 transition-colors opacity-80 break-all text-xs">ragow49@gmail.com</a>
                  </li>
                  </ul>
              </div>
          </RevealOnScroll>

          {/* Column 5: Environment */}
          <RevealOnScroll animation="fade-up" delay={250} className="lg:col-span-1">
              <div className="space-y-6">
                  <h3 className="text-white text-base font-bold uppercase tracking-wider mb-6">Environment</h3>
                  <div className="bg-[#111] rounded-xl p-4 border border-white/5 font-mono text-[9px] backdrop-blur-md shadow-2xl group transition-all hover:border-indigo-500/30">
                      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                             <span className="text-[8px] text-white/50 tracking-widest uppercase font-bold">NODE STATUS</span>
                             <span className="text-[8px] text-indigo-500 font-bold">V5.7</span>
                      </div>
                      <div className="space-y-4">
                          <div>
                                <div className="flex justify-between items-center mb-1 opacity-60 uppercase tracking-tighter text-[7px] font-bold">
                                    <span>Vercel</span>
                                    <span className="text-green-500">RUNNING</span>
                                </div>
                                <div className="text-indigo-400 truncate tracking-tight text-[8px]">htwth.vercel.app</div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1 opacity-60 uppercase tracking-tighter text-[7px] font-bold">
                                    <span>Netlify</span>
                                    <span className="text-green-500">RUNNING</span>
                                </div>
                                <div className="text-indigo-400 truncate tracking-tight text-[8px]">writeupportalos.app</div>
                            </div>
                      </div>
                  </div>
              </div>
          </RevealOnScroll>
        </div>

        {/* Full-width Newsletter Bar */}
        <RevealOnScroll animation="fade-in" delay={300}>
            <div className="border-y border-white/5 py-12 mb-16 relative group">
                <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-4 relative z-10">
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-white text-xl font-bold mb-2">Subscribe to our Newsletter</h3>
                        <p className="text-sm opacity-80">Get the latest vulnerability insights and platform updates delivered to you.</p>
                    </div>
                    <div className="w-full md:w-auto min-w-0 sm:min-w-[320px]">
                        <form onSubmit={handleSubscribe} className="relative flex items-center">
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={subscribed ? "Subscription Active" : "Your email address"}
                                disabled={submitting || subscribed}
                                className={`w-full bg-[#111] text-white text-sm py-4 pl-6 pr-16 rounded-full focus:outline-none focus:ring-1 transition-all border ${subscribed ? 'border-green-500 focus:ring-green-500' : 'border-white/10 focus:ring-indigo-600'} focus:bg-black disabled:opacity-70 shadow-xl`}
                            />
                            <button 
                                type="submit" 
                                disabled={submitting || subscribed || !email}
                                className={`absolute right-1.5 h-[calc(100%-12px)] px-6 rounded-full transition-all flex items-center justify-center ${subscribed ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'} disabled:bg-[#222] disabled:cursor-not-allowed shadow-lg overflow-hidden group/btn`}
                            >
                                <AnimatePresence mode="wait">
                                    {submitting ? (
                                        <motion.div
                                            key="submitting"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <SpinnerIcon className="w-4 h-4 text-white" />
                                        </motion.div>
                                    ) : subscribed ? (
                                        <motion.div
                                            key="subscribed"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                        >
                                            <CheckIcon className="w-4 h-4 text-white" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="idle"
                                            className="relative"
                                            whileHover={{ x: 5, y: -5 }}
                                        >
                                            <Rocket className="w-4 h-4 text-white" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </RevealOnScroll>

        {/* Copyright Footer */}
        <RevealOnScroll animation="fade-in" delay={500}>
            <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-400 font-sans tracking-tight uppercase font-medium">
                    &copy; {new Date().getFullYear()} <span className="text-white">HackToWriteToHack</span> <span className="mx-2 font-bold opacity-30">|</span> ALL RIGHTS RESERVED
                </p>
                <div className="version-shimmer text-[10px] tracking-[0.2em] uppercase font-black text-indigo-400">
                    G0W HTWTH : Vv: {version}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 text-[11px] opacity-80 transition-all font-bold text-slate-400">
                 <span className="uppercase tracking-widest">Developed By</span>
                 <div className="scale-90 origin-center sm:origin-left hover:scale-100 transition-transform">
                    <AdminNameButton />
                 </div>
              </div>
            </div>
        </RevealOnScroll>
      </div>
    </footer>
  );
}

export default Footer;

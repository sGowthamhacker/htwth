
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import AdminNameButton from '../components/AdminNameButton';
import RotatingTextButton from '../components/RotatingTextButton';
import AboutMeButton from '../components/AboutMeButton';
import TwitterIcon from '../components/icons/TwitterIcon';
import GithubIcon from '../components/icons/GithubIcon';
import LinkedInIcon from '../components/icons/LinkedInIcon';
import InstagramIcon from '../components/icons/InstagramIcon';
import PaperAirplaneIcon from '../components/icons/PaperAirplaneIcon';
import MailIcon from '../components/icons/MailIcon';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import CheckIcon from '../components/icons/CheckIcon';
import { GlobalNotification, User } from '../types';
import SignInButton from '../components/SignInButton';
import CookieCard from '../components/CookieCard';
import { MOCK_USERS } from '../data/users';
import ImageLightbox from '../components/ImageLightbox';
import { getCloudinaryUrl } from '../utils/imageService';
import MyWorkPage from './MyWorkPage';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import LockIcon from '../components/icons/LockIcon';
import KaliIcon from '../components/icons/KaliIcon';
import ResourcesIcon from '../components/icons/ResourcesIcon';
import CopyrightPage from './CopyrightPage';
import XCircleIcon from '../components/icons/XCircleIcon';
import ParticlesBackground from '../components/ParticlesBackground';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import AnimatedSendButton from '../components/AnimatedSendButton';
import { Menu, X } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onContactAdmin: (from: GlobalNotification['from'], message: string) => void;
  allUsers?: User[];
}

// Premium Icon-Only Logo: Cyber Shield with Core Node (No Letters)
const LOGO_SRC = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSI2NCIgZmlsbD0idXJsKCNnKSIvPjxwYXRoIGQ9Ik02NCAzMkM0NCAzMiAzNCAzNyAzNCA0MFY2NEMzNCA4NiA2NCAxMDAgNjQgMTAwQzY0IDEwMCA5NCA4NiA5NCA2NFY0MEM5NCAzNyA4NCAzMiA2NCAzMloiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PGNpcmNsZSBjeD0iNjQiIGN5PSI2MiIgcj0iMTAiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTY0IDcyVjgyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMTI4IiB5Mj0iMTI4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzRGNDZFNSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0VDNDg5OSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==";

const GUEST_VIEWER: User = {
    id: 'guest-viewer',
    name: 'Guest',
    email: 'guest@example.com',
    role: 'user',
    avatar: '',
    writeup_access: 'none',
    status: 'unverified',
    created_at: new Date().toISOString(),
    admin_verified: false
};

const ADMIN_EMAIL = 'ragow49@gmail.com';

// --- ANIMATION COMPONENT ---
type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out' | 'fade-in';

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
                // Toggle state based on intersection status to allow repeated animations
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

    // Define initial states for different animations
    const getInitialStyle = () => {
        switch (animation) {
            case 'fade-up': return 'translate-y-16 opacity-0';
            case 'fade-down': return '-translate-y-16 opacity-0';
            case 'fade-left': return 'translate-x-16 opacity-0'; // Comes from right
            case 'fade-right': return '-translate-x-16 opacity-0'; // Comes from left
            case 'zoom-in': return 'scale-90 opacity-0';
            case 'zoom-out': return 'scale-110 opacity-0';
            case 'fade-in': return 'opacity-0';
            default: return 'translate-y-16 opacity-0';
        }
    };

    // Define final states
    const getFinalStyle = () => {
        switch (animation) {
            case 'zoom-in':
            case 'zoom-out':
                return 'scale-100 opacity-100';
            case 'fade-left':
            case 'fade-right':
                return 'translate-x-0 opacity-100';
            case 'fade-up':
            case 'fade-down':
                return 'translate-y-0 opacity-100';
            case 'fade-in': return 'opacity-100';
            default: return 'translate-y-0 opacity-100';
        }
    };

    return (
        <div
            ref={domRef}
            className={`transition-all cubic-bezier(0.22, 1, 0.36, 1) ${isVisible ? getFinalStyle() : getInitialStyle()} ${className}`}
            style={{ 
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`
            }}
        >
            {children}
        </div>
    );
};

const StatsCard: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  return (
    <div className="lp-outer w-[280px] h-[230px] sm:w-[300px] sm:h-[250px] rounded-[10px] p-[1px] relative shrink-0 transition-transform hover:scale-105 duration-300">
      <div className="lp-dot absolute w-[5px] aspect-square bg-white rounded-full z-[2] shadow-[0_0_10px_#ffffff]"></div>
      <div className="lp-card z-[1] w-full h-full rounded-[9px] border border-[#202222] bg-[#0c0d0d] flex flex-col items-center justify-center relative text-white overflow-hidden">
        <div className="lp-ray w-[220px] h-[45px] rounded-[100px] absolute bg-[#c7c7c7] opacity-40 blur-[10px] shadow-[0_0_50px_#fff] origin-[10%] top-0 left-0 -rotate-40"></div>
        <div className="lp-text font-black text-5xl sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-[#444] via-[#fff] to-[#444] bg-[length:200%_auto] animate-shine">{value}</div>
        <div className="text-slate-400 font-mono mt-2 tracking-widest uppercase text-sm">{label}</div>
        <div className="lp-line lp-topl h-[1px] w-full absolute top-[10%] bg-gradient-to-r from-transparent via-[#888888] to-[#1d1f1f] opacity-50"></div>
        <div className="lp-line lp-leftl w-[1px] h-full absolute left-[10%] bg-gradient-to-b from-transparent via-[#747474] to-[#222424] opacity-50"></div>
        <div className="lp-line lp-bottoml h-[1px] w-full absolute bottom-[10%] bg-[#2c2c2c]"></div>
        <div className="lp-line lp-rightl w-[1px] h-full absolute right-[10%] bg-[#2c2c2c]"></div>
      </div>
    </div>
  );
};

const Footer: React.FC<{ onAction: () => void; onShowCopyright: () => void }> = ({ onAction, onShowCopyright }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
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
    // Simulate network request
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
        { "path": "#/mywork", "name": "My Work / Portfolio", "type": "protected" },
        { "path": "#/resources", "name": "Resources Hub", "type": "protected" },
        { "path": "#/kali", "name": "Kali Linux Integration", "type": "protected" },
        { "path": "#/docs", "name": "Documentation", "type": "protected" }
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
    <footer className="bg-[#151515] text-[#808080] font-sans pt-24 pb-12 border-t border-white/5 relative overflow-hidden z-10" id="footer">
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
                  <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-indigo-500 transition-colors text-left">Overview</button></li>
                  <li><button onClick={onAction} className="hover:text-indigo-500 transition-colors text-left">Features</button></li>
                  <li><button onClick={onAction} className="hover:text-indigo-500 transition-colors text-left">Community</button></li>
                  <li><button onClick={onAction} className="hover:text-indigo-500 transition-colors text-left">Resources</button></li>
                  <li><button onClick={() => window.open("https://htwth.vercel.app/", "_blank")} className="hover:text-indigo-500 transition-colors text-left">HTWTH Vercel</button></li>
                  <li><button onClick={onShowCopyright} className="hover:text-indigo-500 transition-colors text-left">Legal & Copyright</button></li>
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
                <div className="version-shimmer text-xs tracking-widest uppercase">
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
}

// Define Feature Data Structure
interface Feature {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    purpose: string;
    color: string;
    bg: string;
    hoverBg: string;
    animation: AnimationType;
    delay: number;
}

const FEATURES: Feature[] = [
    {
        id: 'writeups',
        title: 'Smart Writeups',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
        description: 'Document vulnerabilities with precision using our powerful markdown editor. Leverage integrated AI to analyze your content.',
        purpose: 'Streamline your reporting process. Our AI engine analyzes your findings in real-time, suggesting severity levels (CVSS) and auto-tagging your reports for better organization. Perfect for bug bounty hunters who need speed and accuracy.',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/30',
        hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/50',
        animation: 'fade-right',
        delay: 0
    },
    {
        id: 'community',
        title: 'Live Community',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        description: 'Connect with fellow researchers in real-time. Share insights, debug findings together, and build your network.',
        purpose: 'Never hack alone. Join a vibrant chat room where you can share payloads, debug issues, and collaborate on CTFs. Real-time presence indicators show who is online to help immediately.',
        color: 'text-pink-600 dark:text-pink-400',
        bg: 'bg-pink-50 dark:bg-pink-900/30',
        hoverBg: 'hover:bg-pink-100 dark:hover:bg-pink-900/50',
        animation: 'fade-up',
        delay: 150
    },
    {
        id: 'portfolio',
        title: 'Pro Portfolio',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        description: 'Create a stunning portfolio showcasing your experience, certifications, and best finds. Auto-generate a professional PDF CV.',
        purpose: 'Build your personal brand. Automatically generate a professional CV PDF from your profile data. Showcase your skills, certifications, and project history in a clean, shareable format to recruiters.',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
        animation: 'fade-left',
        delay: 300
    },
    {
        id: 'kali',
        title: 'Kali Integration',
        icon: <KaliIcon className="w-7 h-7" />,
        description: 'Seamlessly connect to your remote Kali Linux instance. Perform penetration testing directly from your browser.',
        purpose: 'No more heavy VMs slowing down your laptop. Access a full Kali Linux environment directly in your browser. Run tools like Nmap and Burp Suite via our secure VNC tunnel integration.',
        color: 'text-slate-800 dark:text-slate-200',
        bg: 'bg-slate-100 dark:bg-slate-800',
        hoverBg: 'hover:bg-slate-200 dark:hover:bg-slate-700',
        animation: 'fade-right',
        delay: 100
    },
    {
        id: 'security',
        title: 'Bank-Grade Security',
        icon: <LockIcon className="w-7 h-7" />,
        description: 'Protect your research with advanced security features including Two-Factor Authentication (2FA) and backup codes.',
        purpose: 'Your data is sacred. We use industry-standard encryption, Row Level Security (RLS), and offer Two-Factor Authentication (2FA) with backup codes to ensure your vulnerability findings remain yours and yours alone.',
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/30',
        hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-900/50',
        animation: 'fade-up',
        delay: 250
    },
    {
        id: 'resource',
        title: 'Resource Hub',
        icon: <ResourcesIcon className="w-7 h-7" />,
        description: 'Access a curated library of payloads, cheatsheets, and learning materials. Stay ahead of the curve.',
        purpose: 'Stop searching, start hacking. Get instant access to premium payloads (XSS, SQLi), cheat sheets, and open-source tool repositories. A centralized knowledge base at your fingertips.',
        color: 'text-cyan-600 dark:text-cyan-400',
        bg: 'bg-cyan-50 dark:bg-cyan-900/30',
        hoverBg: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/50',
        animation: 'fade-left',
        delay: 400
    },
    {
        id: 'ai-assistant',
        title: 'AI Assistant',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
        description: 'Leverage AI to analyze vulnerabilities, suggest fixes, and generate comprehensive reports automatically.',
        purpose: 'Save hours of manual work. Our AI assistant helps you understand complex vulnerabilities and provides actionable remediation steps instantly.',
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-50 dark:bg-violet-900/30',
        hoverBg: 'hover:bg-violet-100 dark:hover:bg-violet-900/50',
        animation: 'fade-right',
        delay: 0
    },
    {
        id: 'collaboration',
        title: 'Real-time Collaboration',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        description: 'Work together with your team on reports and findings in real-time, just like Google Docs.',
        purpose: 'Eliminate version control issues. Collaborate seamlessly with your team members on the same document simultaneously.',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/50',
        animation: 'fade-up',
        delay: 150
    },
    {
        id: 'templates',
        title: 'Custom Templates',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        description: 'Create and reuse custom report templates to standardize your documentation process.',
        purpose: 'Maintain consistency across all your reports. Build templates for different types of vulnerabilities and reuse them with a single click.',
        color: 'text-fuchsia-600 dark:text-fuchsia-400',
        bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30',
        hoverBg: 'hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/50',
        animation: 'fade-left',
        delay: 300
    },
    {
        id: 'api-access',
        title: 'API Access',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
        description: 'Integrate your existing tools and workflows with our comprehensive REST API.',
        purpose: 'Automate your workflow. Connect your favorite scanners and tools directly to our platform to automatically import findings.',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/30',
        hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/50',
        animation: 'fade-right',
        delay: 450
    },
    {
        id: 'analytics',
        title: 'Advanced Analytics',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        description: 'Track your progress, analyze your findings, and identify trends with detailed analytics.',
        purpose: 'Make data-driven decisions. Understand which types of vulnerabilities you find most often and track your success rate over time.',
        color: 'text-teal-600 dark:text-teal-400',
        bg: 'bg-teal-50 dark:bg-teal-900/30',
        hoverBg: 'hover:bg-teal-100 dark:hover:bg-teal-900/50',
        animation: 'fade-up',
        delay: 600
    },
    {
        id: 'tracking',
        title: 'Vulnerability Tracking',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
        description: 'Manage the lifecycle of your findings from discovery to remediation.',
        purpose: 'Never lose track of a bug. Monitor the status of your reports, track bounties, and manage communication with security teams.',
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-900/30',
        hoverBg: 'hover:bg-rose-100 dark:hover:bg-rose-900/50',
        animation: 'fade-left',
        delay: 750
    },
    {
        id: 'bounty-tracker',
        title: 'Bounty Tracker',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        description: 'Track your payouts, manage tax forms, and analyze your earnings across different platforms.',
        purpose: 'Keep your finances organized. Automatically sync your earnings from HackerOne, Bugcrowd, and Intigriti to see your total income in one dashboard.',
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/30',
        hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900/50',
        animation: 'fade-right',
        delay: 0
    },
    {
        id: 'automated-scans',
        title: 'Automated Scans',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
        description: 'Schedule and run automated vulnerability scans on your target scope.',
        purpose: 'Find low-hanging fruit while you sleep. Set up recurring scans using Nuclei, Nmap, and other open-source tools directly from our cloud infrastructure.',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/50',
        animation: 'fade-up',
        delay: 150
    },
    {
        id: 'payload-generator',
        title: 'Payload Generator',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
        description: 'Generate custom, obfuscated payloads for XSS, SQLi, SSRF, and more.',
        purpose: 'Bypass WAFs with ease. Our payload generator creates highly customized and encoded payloads tailored to your specific target environment.',
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/30',
        hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-900/50',
        animation: 'fade-left',
        delay: 300
    },
    {
        id: 'dark-web',
        title: 'Dark Web Monitor',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
        description: 'Monitor leaked credentials and data breaches related to your target.',
        purpose: 'Gain an edge in your reconnaissance. Get instant alerts when employee credentials or sensitive data related to your target appear on dark web forums.',
        color: 'text-slate-800 dark:text-slate-200',
        bg: 'bg-slate-100 dark:bg-slate-800',
        hoverBg: 'hover:bg-slate-200 dark:hover:bg-slate-700',
        animation: 'fade-right',
        delay: 450
    },
    {
        id: 'custom-domains',
        title: 'Custom Domains',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
        description: 'Host your hacker portfolio and writeups on your own custom domain.',
        purpose: 'Look professional. Connect your own domain (e.g., hackername.com) to your HTWTH portfolio with automatic SSL certificate provisioning.',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/30',
        hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/50',
        animation: 'fade-up',
        delay: 600
    },
    {
        id: 'team-workspaces',
        title: 'Team Workspaces',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        description: 'Dedicated, isolated workspaces for red teams and security consultancies.',
        purpose: 'Keep client data separated. Create isolated environments for different engagements, manage team permissions, and collaborate securely on sensitive findings.',
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/30',
        hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/50',
        animation: 'fade-left',
        delay: 750
    },
    {
        id: 'export-reports',
        title: 'Export to PDF/Word',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        description: 'Export your writeups and reports in multiple formats including PDF and DOCX.',
        purpose: 'Deliver professional reports to clients. Generate beautifully formatted, branded PDF or Word documents from your markdown writeups with a single click.',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/30',
        hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/50',
        animation: 'fade-right',
        delay: 0
    },
    {
        id: 'webhooks',
        title: 'Webhook Integrations',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
        description: 'Connect HTWTH with your favorite tools like Slack, Discord, and Jira.',
        purpose: 'Automate your notifications. Get instantly alerted in your team\'s Slack channel when a new vulnerability is found or a report is updated.',
        color: 'text-cyan-600 dark:text-cyan-400',
        bg: 'bg-cyan-50 dark:bg-cyan-900/30',
        hoverBg: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/50',
        animation: 'fade-up',
        delay: 150
    },
    {
        id: 'mfa',
        title: 'Advanced MFA & SSO',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
        description: 'Enterprise-grade security with Multi-Factor Authentication and Single Sign-On.',
        purpose: 'Meet compliance requirements. Secure your account with hardware security keys (YubiKey), authenticator apps, or integrate with your company\'s SAML/SSO provider.',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
        animation: 'fade-left',
        delay: 300
    }
];

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50 overflow-hidden mb-3">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <span className="text-sm">{q}</span>
                <ChevronDownIcon className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 pt-0 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 mt-1">
                    {a}
                </div>
            </div>
        </div>
    );
};

const ContactSection: React.FC<{ onSendMessage: (name: string, email: string, msg: string) => Promise<any> }> = ({ onSendMessage }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !email || !message) return;
        setStatus('sending');
        await onSendMessage(name, email, message);
        setTimeout(() => {
             setStatus('sent');
             setName('');
             setEmail('');
             setMessage('');
             setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-20 max-w-6xl mx-auto px-6">
            <div className="space-y-6">
                <div className="mb-8">
                     <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Frequently Asked Questions</h2>
                     <p className="text-slate-500 dark:text-slate-400">Can't find the answer you're looking for? Reach out to our team.</p>
                </div>
                <div className="space-y-2">
                    <FAQItem q="Is this platform free to use?" a="Yes, HtWtH is completely free for educational purposes and ethical hacking practice." />
                    <FAQItem q="How do I get admin access?" a="Admin access is restricted. However, you can request 'Writeup Access' to contribute content." />
                    <FAQItem q="What is the Kali Linux integration?" a="It allows you to run a remote Kali Linux desktop directly within your browser for pentesting tasks." />
                    <FAQItem q="Is my data secure?" a="We use industry-standard encryption and Row Level Security (RLS) to ensure your findings remain private." />
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Get in Touch</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Name</label>
                         <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" placeholder="Your Name" required />
                     </div>
                     <div>
                         <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
                         <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" placeholder="you@example.com" required />
                     </div>
                     <div>
                         <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Message</label>
                         <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white h-32 resize-none" placeholder="How can we help?" required></textarea>
                     </div>
                     <div className="pt-2">
                        {status === 'sent' ? (
                            <div className="w-full py-3 bg-green-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                                <CheckIcon className="w-5 h-5"/> Message Sent
                            </div>
                        ) : (
                            <AnimatedSendButton 
                                isSending={status === 'sending'} 
                                disabled={status !== 'idle'} 
                                style={{
                                    '--asb-width': '100%',
                                    '--asb-height': '48px'
                                } as React.CSSProperties}
                            />
                        )}
                     </div>
                 </form>
            </div>
        </div>
    );
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn, onContactAdmin, allUsers = MOCK_USERS }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [showCopyright, setShowCopyright] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'features' | 'community' | 'resources' | 'pricing' | 'resumeai'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State for Innovation Fade Open
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null);

  const handleSendAdminMessage = async (name: string, email: string, message: string): Promise<{success: boolean}> => {
      // Mock success
      onContactAdmin(
          { name, email, avatar: `https://i.pravatar.cc/150?u=${email}`, role: 'user' },
          message
      );
      return { success: true };
  };
  
  // Ensure we have a list that includes the admin for the profile viewer
  const getUsersForProfile = () => {
      const users = allUsers || [];
      if (users.some(u => u.email === ADMIN_EMAIL)) return users;
      const mockAdmin = MOCK_USERS.find(u => u.email === ADMIN_EMAIL);
      return mockAdmin ? [...users, mockAdmin] : users;
  };
  


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden relative">
      <style>{`
        .lp-outer {
          background: radial-gradient(circle 230px at 0% 0%, #ffffff, #0c0d0d);
        }
        .lp-card {
          background: radial-gradient(circle 280px at 0% 0%, #444444, #0c0d0d);
        }
        .lp-dot {
          right: 10%;
          top: 10%;
          animation: moveDot 6s linear infinite;
        }
        @keyframes moveDot {
          0%, 100% { top: 10%; right: 10%; }
          25% { top: 10%; right: calc(100% - 35px); }
          50% { top: calc(100% - 30px); right: calc(100% - 35px); }
          75% { top: calc(100% - 30px); right: 10%; }
        }
        @keyframes shine {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
        }
        .animate-shine {
            animation: shine 5s linear infinite;
        }
        
        /* VERSION SHIMMER EFFECT */
        .version-shimmer {
            background: linear-gradient(
                to right, 
                #ffffff 0%, 
                #a1a1a1 20%,
                #ffd700 40%, 
                #000000 50%, 
                #ffd700 60%, 
                #a1a1a1 80%,
                #ffffff 100%
            );
            background-size: 200% auto;
            color: #fff;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: versionShine 4s linear infinite;
            font-weight: 900;
        }
        @keyframes versionShine {
            to {
                background-position: 200% center;
            }
        }
        
        /* Epic Logo Styles */
        .epic-logo-container {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 1.5rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          position: relative;
          display: inline-block;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .epic-logo-text {
          position: relative;
          z-index: 10;
          color: #333;
          transition: color 0.3s ease, text-shadow 0.3s ease;
        }
        .dark .epic-logo-text {
           color: #fff;
           text-shadow: 0 0 10px rgba(99, 102, 241, 0.3); 
        }
        
        /* Stable Premium Glow on Hover (No Glitch/Shift) */
        .epic-logo-container:hover .epic-logo-text {
           color: #6366f1; /* Indigo-500 */
           text-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
        }
        .dark .epic-logo-container:hover .epic-logo-text {
           color: #fff;
           text-shadow: 0 0 25px rgba(99, 102, 241, 0.8), 0 0 10px rgba(236, 72, 153, 0.5);
        }
        
        .epic-logo-container::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140%;
          height: 140%;
          background: radial-gradient(circle, rgba(79,70,229,0.2) 0%, rgba(0,0,0,0) 70%);
          z-index: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .epic-logo-container:hover::before {
          opacity: 1;
        }

        /* PREMIUM FLAME TEXT ANIMATION */
        .premium-flame-text {
          background: linear-gradient(
            to right, 
            #ef4444, /* Red */
            #f97316, /* Orange */
            #eab308, /* Yellow */
            #22c55e, /* Green */
            #3b82f6, /* Blue */
            #a855f7, /* Purple */
            #ec4899, /* Pink */
            #ef4444  /* Loop Red */
          );
          background-size: 200% auto;
          color: #000;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: premium-shine 4s linear infinite;
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.1));
        }
        
        @keyframes premium-shine {
          to {
            background-position: 200% center;
          }
        }
        
        /* PREMIUM LOGO RING ROTATION */
        @keyframes ring-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-ring-spin {
            animation: ring-spin 4s linear infinite;
        }
        
        /* LOGO ONE TIME ROTATION ON HOVER */
        @keyframes spin-once {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        /* Applied via group hover to the image */
        .group:hover .animate-spin-once-on-hover {
            animation: spin-once 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* RACING TEXT ANIMATION */
        @keyframes race-slide {
            0% { transform: translateY(-50%) translateX(150%) skewX(-20deg); opacity: 0; }
            10% { transform: translateY(-50%) translateX(0) skewX(-20deg); opacity: 1; }
            40% { transform: translateY(-50%) translateX(0) skewX(-20deg); opacity: 1; }
            50% { transform: translateY(-50%) translateX(-150%) skewX(20deg); opacity: 0; }
            100% { transform: translateY(-50%) translateX(-150%) skewX(20deg); opacity: 0; }
        }

        .racing-word {
            position: absolute;
            left: 0;
            top: 50%;
            width: 100%;
            transform: translateY(-50%) translateX(150%);
            opacity: 0;
            white-space: nowrap;
            font-weight: 900;
            font-style: italic;
            text-transform: uppercase;
            text-align: center;
        }
        
        .racing-sequence-1 { animation: race-slide 2s linear infinite; animation-delay: 0s; }
        .racing-sequence-2 { animation: race-slide 2s linear infinite; animation-delay: 0.5s; }
        .racing-sequence-3 { animation: race-slide 2s linear infinite; animation-delay: 1.0s; }
        .racing-sequence-4 { animation: race-slide 2s linear infinite; animation-delay: 1.5s; }
        
        .group:hover .racing-sequence-1,
        .group:hover .racing-sequence-2,
        .group:hover .racing-sequence-3,
        .group:hover .racing-sequence-4 {
            animation-play-state: running;
        }
      `}</style>

      <ParticlesBackground />

      {/* Navigation */}
      <RevealOnScroll animation="fade-down" duration={1000} className="fixed top-0 left-0 right-0 z-50">
        <nav className="transition-all duration-300 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 supports-[backdrop-filter]:bg-white/50">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex justify-between items-center h-20">
                {/* Logo Area */}
                <div className="flex items-center gap-4 cursor-pointer group select-none" onClick={() => setActiveTab('home')}>
                
                <div className="relative w-14 h-14 flex items-center justify-center">
                    {/* The Rotating Rings (Visible on Hover) */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <svg className="w-full h-full animate-ring-spin" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
                                <stop offset="50%" stopColor="#ec4899" /> {/* Pink */}
                                <stop offset="100%" stopColor="#f59e0b" /> {/* Amber/Gold */}
                            </linearGradient>
                        </defs>
                        {/* Outer Ring with clear stroke caps */}
                        <circle cx="50" cy="50" r="48" fill="none" stroke="url(#premiumGradient)" strokeWidth="2" strokeLinecap="round" strokeDasharray="40 10 40 10" />
                        </svg>
                    </div>
                    
                    {/* Static Glow Background */}
                    <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500"></div>

                    {/* The Logo Image - Circular & Rotating Once on Hover */}
                    <div className="relative z-10 w-10 h-10 rounded-full overflow-hidden shadow-lg group-hover:scale-90 transition-transform duration-500">
                        <img 
                        src={LOGO_SRC} 
                        alt="Logo" 
                        className="w-full h-full object-cover animate-spin-once-on-hover" 
                        />
                    </div>
                </div>
                
                <div className="epic-logo-container relative h-10 w-32 overflow-hidden flex items-center justify-center">
                    {/* Default Text - Moves up on hover */}
                    <span className="epic-logo-text absolute transition-all duration-300 group-hover:-translate-y-[150%] group-hover:opacity-0 w-full text-center">HTWTH</span>
                    
                    {/* Racing Texts - Visible on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full h-full">
                        <span className="racing-word racing-sequence-1 text-red-500">EAT</span>
                        <span className="racing-word racing-sequence-2 text-green-500">HACK</span>
                        <span className="racing-word racing-sequence-3 text-blue-500">SLEEP</span>
                        <span className="racing-word racing-sequence-4 text-purple-500">REPEAT</span>
                    </div>
                </div>
                </div>
                
                {/* Center Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    <button onClick={() => setActiveTab('features')} className={`text-sm font-bold transition-colors ${activeTab === 'features' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Features</button>
                    <button onClick={() => setActiveTab('community')} className={`text-sm font-bold transition-colors ${activeTab === 'community' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Community</button>
                    <button onClick={() => setActiveTab('resources')} className={`text-sm font-bold transition-colors ${activeTab === 'resources' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Resources</button>
                    <button onClick={() => setActiveTab('pricing')} className={`text-sm font-bold transition-colors ${activeTab === 'pricing' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Pricing</button>
                    <button onClick={() => setActiveTab('resumeai')} className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'resumeai' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                        ResumeAI <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-wider">New</span>
                    </button>
                </div>

                {/* Actions Area */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <SignInButton onClick={onSignIn} />
                    </div>
                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>
            
            {/* Mobile Menu Dropdown */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100 border-t border-slate-200/60 dark:border-white/5' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col py-4 gap-4 px-2">
                    <button onClick={() => { setActiveTab('features'); setMobileMenuOpen(false); }} className={`text-left text-sm font-bold transition-colors ${activeTab === 'features' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>Features</button>
                    <button onClick={() => { setActiveTab('community'); setMobileMenuOpen(false); }} className={`text-left text-sm font-bold transition-colors ${activeTab === 'community' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>Community</button>
                    <button onClick={() => { setActiveTab('resources'); setMobileMenuOpen(false); }} className={`text-left text-sm font-bold transition-colors ${activeTab === 'resources' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>Resources</button>
                    <button onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }} className={`text-left text-sm font-bold transition-colors ${activeTab === 'pricing' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>Pricing</button>
                    <button onClick={() => { setActiveTab('resumeai'); setMobileMenuOpen(false); }} className={`text-left text-sm font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'resumeai' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
                        ResumeAI <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-wider">New</span>
                    </button>
                    <div className="pt-4 border-t border-slate-200/60 dark:border-white/5">
                        <SignInButton onClick={() => { onSignIn(); setMobileMenuOpen(false); }} />
                    </div>
                </div>
            </div>
            </div>
        </nav>
      </RevealOnScroll>

      {/* Main Content */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 min-h-[80vh]">
        
        {activeTab === 'home' && (
        <div className="animate-fade-in">
        <div className="text-center max-w-4xl mx-auto">
          <RevealOnScroll animation="fade-down" duration={1000}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 border border-indigo-100 dark:border-indigo-500/20">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
              The Ultimate Workspace for Hackers
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1]">
                Elevate Your <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                  Security Research
                </span>
            </h1>
          </RevealOnScroll>

          <RevealOnScroll animation="fade-up" delay={200} duration={1000}>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Streamline your bug bounty workflow. Write professional reports with AI assistance, collaborate in real-time, and showcase your achievements in a stunning portfolio.
            </p>
          </RevealOnScroll>
          
          <RevealOnScroll animation="zoom-in" delay={400} duration={800}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={onGetStarted}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Start Hacking Free
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
                <button 
                  onClick={() => setShowAdminProfile(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  View Creator Profile
                </button>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No credit card required • Free community access</p>
          </RevealOnScroll>
        </div>

        {/* Dashboard Preview Mockup */}
        <RevealOnScroll animation="fade-up" delay={600} duration={1200} className="mt-20 relative max-w-5xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] blur-2xl opacity-20 transition duration-1000"></div>
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-2xl bg-white dark:bg-slate-900">
            {/* Mockup Header */}
            <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="mx-auto px-4 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 shadow-sm">
                <LockIcon className="w-3 h-3" /> app.htwth.com
              </div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=2070&auto=format&fit=crop" 
              alt="Platform Interface" 
              className="w-full aspect-[16/10] sm:aspect-[16/9] object-cover opacity-90"
            />
          </div>
        </RevealOnScroll>

        {/* Stats Section */}
        <div className="mt-32 mb-20 border-y border-slate-200 dark:border-slate-800 py-12 bg-slate-50/50 dark:bg-slate-900/20" id="features">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-5xl mx-auto px-4">
                <RevealOnScroll animation="fade-up" delay={0}>
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2">20+</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pro Features</div>
                </RevealOnScroll>
                <RevealOnScroll animation="fade-up" delay={100}>
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2">500+</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Hackers</div>
                </RevealOnScroll>
                <RevealOnScroll animation="fade-up" delay={200}>
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2">100+</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Writeups</div>
                </RevealOnScroll>
                <RevealOnScroll animation="fade-up" delay={300}>
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2">24/7</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Live Community</div>
                </RevealOnScroll>
            </div>
        </div>
        </div>
        )}

        {(activeTab === 'home' || activeTab === 'features') && (
        <div className="animate-fade-in">
        {/* 20+ Features Section */}
        <div className="mt-32 mb-24">
            <RevealOnScroll animation="fade-up">
                 <div className="text-center max-w-3xl mx-auto mb-16">
                   <h2 className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wide uppercase text-sm mb-3">Everything you need</h2>
                   <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">20+ Powerful Features</h3>
                   <p className="text-slate-600 dark:text-slate-400 text-lg">A complete ecosystem designed specifically for security researchers and ethical hackers.</p>
                 </div>
            </RevealOnScroll>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURES.map((feature, index) => {
                    const isExpanded = expandedFeatureId === feature.id;

                    return (
                        <RevealOnScroll key={feature.id} animation="fade-up" delay={index * 50}>
                             <div 
                                className={`relative rounded-2xl border transition-all duration-300 flex flex-col group overflow-hidden cursor-pointer ${
                                   isExpanded 
                                   ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-xl ring-1 ring-indigo-500/50' 
                                   : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700'
                                }`}
                                onClick={() => setExpandedFeatureId(isExpanded ? null : feature.id)}
                             >
                                <div className="p-6 relative z-10 flex flex-col h-full">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${feature.bg} ${feature.color}`}>
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                                    </div>
                                    
                                    <p className={`text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-90 line-clamp-2'}`}>
                                        {feature.description}
                                    </p>

                                    {/* Expandable Section */}
                                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                        <div className="overflow-hidden">
                                            <div className={`pt-4 border-t border-slate-100 dark:border-slate-800 opacity-0 transition-opacity duration-300 delay-100 ${isExpanded ? 'opacity-100' : ''}`}>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Why It Matters</h4>
                                                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                                    {feature.purpose}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`mt-auto pt-4 flex items-center text-sm font-semibold transition-colors ${isExpanded ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                                        {isExpanded ? 'Show less' : 'Learn more'} 
                                        <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : '-rotate-90'}`} />
                                    </div>
                                </div>
                            </div>
                        </RevealOnScroll>
                    );
                })}
            </div>
        </div>
        </div>
        )}

        {activeTab === 'home' && (
        <div className="animate-fade-in">
        {/* CTA Section */}
        <RevealOnScroll animation="zoom-in" className="mb-24">
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 py-16 px-6 sm:px-12 text-center border border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to upgrade your workflow?</h2>
                    <p className="text-slate-300 mb-8 text-lg">Join hundreds of ethical hackers who are already using HTWTH to document, collaborate, and succeed.</p>
                    <button 
                        onClick={onGetStarted}
                        className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Create Your Free Account
                    </button>
                </div>
            </div>
        </RevealOnScroll>

        {/* Support & Contact Section */}
        <RevealOnScroll animation="fade-up" delay={100} className="mb-24">
            <ContactSection onSendMessage={handleSendAdminMessage} />
        </RevealOnScroll>
        </div>
        )}

        {activeTab === 'community' && (
            <div className="animate-fade-in text-center py-20">
                <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">Join the Elite Hacker Community</h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto">Connect, collaborate, and learn with top security researchers around the globe.</p>
                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <div className="text-left space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex-shrink-0"></div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white">0xAlice</div>
                                <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">Just found a critical IDOR! Anyone want to collaborate on the impact?</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-pink-500 rounded-full flex-shrink-0"></div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white">BobTheBuilder</div>
                                <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">Nice find! I have a payload that might escalate that to RCE.</div>
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={onGetStarted} className="mt-12 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">Join the Chat</button>
            </div>
        )}

        {activeTab === 'resources' && (
            <div className="animate-fade-in text-center py-20">
                <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">Hacker Resource Hub</h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto">Access our curated library of payloads, cheatsheets, and methodologies.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg hover:-translate-y-1 transition-transform">
                        <h3 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Payload Library</h3>
                        <p className="text-slate-600 dark:text-slate-400">Over 5,000+ tested payloads for XSS, SQLi, SSRF, and more.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg hover:-translate-y-1 transition-transform">
                        <h3 className="text-2xl font-bold mb-4 text-pink-600 dark:text-pink-400">Cheat Sheets</h3>
                        <p className="text-slate-600 dark:text-slate-400">Quick reference guides for Nmap, Burp Suite, Metasploit, and more.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg hover:-translate-y-1 transition-transform">
                        <h3 className="text-2xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">Methodologies</h3>
                        <p className="text-slate-600 dark:text-slate-400">Step-by-step guides for approaching different types of targets.</p>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'pricing' && (
            <div className="animate-fade-in py-24 max-w-7xl mx-auto px-6 relative">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
                
                <div className="text-center mb-20 relative z-10">
                    <h2 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-6 tracking-tight">Pricing Plans</h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Choose the plan that fits your hacking journey. Upgrade anytime as your skills grow.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 items-center">
                    {[
                        { 
                            name: 'Free', 
                            price: '$0', 
                            period: 'forever',
                            description: 'Perfect for beginners starting their journey.',
                            features: ['Basic Writeups', 'Community Access', 'Limited Portfolio', 'Standard Support'],
                            buttonText: 'Get Started',
                            highlight: false,
                            tag: 'Starter',
                            tagClass: 'bg-indigo-50/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50'
                        },
                        { 
                            name: 'Pro', 
                            price: 'Soon', 
                            period: 'coming',
                            description: 'For active hunters needing more power.',
                            features: ['Advanced Analytics', 'Unlimited Writeups', 'PDF Export', 'Priority Support'],
                            buttonText: 'Coming Soon',
                            highlight: false,
                            tag: 'Advanced',
                            tagClass: 'bg-indigo-50/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50'
                        },
                        { 
                            name: 'Hacker', 
                            price: 'Soon', 
                            period: 'coming',
                            description: 'The ultimate toolkit for serious professionals.',
                            features: ['Kali Integration', 'Automated Scans', 'Payload Generator', 'API Access'],
                            buttonText: 'Coming Soon',
                            highlight: true,
                            tag: 'Most Popular',
                            tagClass: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/50'
                        },
                        { 
                            name: 'Enterprise', 
                            price: 'Soon', 
                            period: 'coming',
                            description: 'Custom solutions for security teams.',
                            features: ['Team Workspaces', 'SSO/MFA', 'Dedicated Support', 'Custom Domains'],
                            buttonText: 'Coming Soon',
                            highlight: false,
                            tag: 'Ultimate',
                            tagClass: 'bg-indigo-50/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50'
                        },
                    ].map((plan, idx) => (
                        <div 
                            key={idx} 
                            className={`group relative flex flex-col p-8 rounded-3xl transition-all duration-500 ease-out hover:-translate-y-2 ${
                                plan.highlight 
                                    ? 'bg-gradient-to-b from-indigo-900/90 to-slate-900/90 dark:from-indigo-950/90 dark:to-slate-950/90 border border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.3)] lg:-mt-8 lg:mb-8 z-10 backdrop-blur-xl' 
                                    : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-[0_10px_40px_rgba(99,102,241,0.15)] hover:border-indigo-500/50'
                            }`}
                        >
                            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                                <h3 className={`text-2xl font-bold transition-colors duration-300 ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>{plan.name}</h3>
                                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest py-1 px-2 sm:px-3 rounded-full whitespace-nowrap ${plan.tagClass}`}>
                                    {plan.tag}
                                </span>
                            </div>
                            
                            <p className={`text-sm mb-6 h-10 ${plan.highlight ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>{plan.description}</p>
                            
                            <div className="mb-8 flex items-baseline gap-2">
                                <span className={`text-4xl sm:text-5xl font-black tracking-tight ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                    {plan.price}
                                </span>
                                <span className={`text-xs sm:text-sm font-medium uppercase tracking-wider ${plan.highlight ? 'text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>
                                    /{plan.period}
                                </span>
                            </div>
                            
                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-start">
                                        <div className={`mt-1 mr-3 shrink-0 rounded-full p-1 ${plan.highlight ? 'bg-indigo-500/20 text-indigo-300' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                                            <CheckIcon className="w-3 h-3" />
                                        </div>
                                        <span className={`text-sm font-medium ${plan.highlight ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            
                            <button 
                                onClick={onGetStarted} 
                                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${
                                    plan.highlight 
                                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]' 
                                        : plan.price === 'Soon'
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg hover:shadow-xl'
                                }`}
                                disabled={plan.price === 'Soon'}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'resumeai' && (
            <div className="animate-fade-in text-center py-24 max-w-4xl mx-auto">
                <RevealOnScroll animation="fade-down">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-8 shadow-2xl shadow-purple-500/30 animate-pulse">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                </RevealOnScroll>
                
                <RevealOnScroll animation="fade-up" delay={100}>
                    <h2 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-6">
                        ResumeAI
                    </h2>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                        Coming Soon: The Grand Launch
                    </h3>
                    <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Get ready for one of our beast products. ResumeAI will revolutionize how you present your skills, automatically tailoring your hacker portfolio into ATS-beating resumes.
                    </p>
                </RevealOnScroll>

                <RevealOnScroll animation="zoom-in" delay={200}>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-2xl">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                                <div>
                                    <div className="w-12 h-12 mx-auto bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">AI-Powered</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Smart keyword optimization</p>
                                </div>
                                <div>
                                    <div className="w-12 h-12 mx-auto bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">ATS-Friendly</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Beat the resume robots</p>
                                </div>
                                <div>
                                    <div className="w-12 h-12 mx-auto bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">1-Click Export</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">PDF and Word formats</p>
                                </div>
                            </div>
                            
                            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <a href="/resume.html" className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg w-full sm:w-auto flex items-center justify-center gap-2 mx-auto inline-flex">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    Launch ResumeAI
                                </a>
                            </div>
                        </div>
                    </div>
                </RevealOnScroll>
            </div>
        )}

      </main>

      <Footer onAction={onSignIn} onShowCopyright={() => setShowCopyright(true)} />
      {/* SupportBot Removed as per request to hide it on Landing Page */}
      <CookieCard />
      
      {lightboxImage && <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />}

      {/* Feature Detail Modal is removed in favor of in-card expansion */}

      {showAdminProfile && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 animate-fade-in flex flex-col">
            <button 
                onClick={() => setShowAdminProfile(false)}
                className="absolute top-4 right-4 z-50 p-3 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors backdrop-blur-md group"
                title="Close Profile"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-800 dark:text-white group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>

            <MyWorkPage 
                user={GUEST_VIEWER}
                allUsers={getUsersForProfile()}
                writeups={[]}
                blogPosts={[]}
                profileUserEmail={ADMIN_EMAIL}
            />
        </div>
      )}

      {showCopyright && (
        <div 
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center sm:p-4 animate-fade-in"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setShowCopyright(false);
                }
            }}
        >
            <div className="bg-white dark:bg-slate-900 w-full h-full sm:h-[90vh] sm:max-w-4xl sm:rounded-2xl shadow-2xl relative flex flex-col overflow-hidden animate-slide-up border-0 sm:border border-slate-200 dark:border-slate-800">
                <div className="flex-1 overflow-hidden">
                    <CopyrightPage onClose={() => setShowCopyright(false)} />
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;

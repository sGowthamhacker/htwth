
import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { GlobalNotification, User, Post } from '../types';
import PostCard from '../components/PostCard';

// Lazy load complex sections/components
const BlogPostViewer = lazy(() => import('./BlogPostViewer'));
const MyWorkPage = lazy(() => import('./MyWorkPage'));
const CopyrightPage = lazy(() => import('./CopyrightPage'));
const ParticlesBackground = lazy(() => import('../components/ParticlesBackground'));

import SignInButton from '../components/SignInButton';
import CookieCard from '../components/CookieCard';
import { MOCK_USERS } from '../data/users';
import ImageLightbox from '../components/ImageLightbox';
import { getCloudinaryUrl } from '../utils/imageService';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import LockIcon from '../components/icons/LockIcon';
import KaliIcon from '../components/icons/KaliIcon';
import ResourcesIcon from '../components/icons/ResourcesIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import AnimatedSendButton from '../components/AnimatedSendButton';
import Footer from '../components/Footer';
import MicrochipLoader from '../components/MicrochipLoader';
import RevealOnScroll, { AnimationType } from '../components/RevealOnScroll';
import { Menu, X, Cloud, CircleHelp, Rocket, Send, Search, Command, Terminal, Zap, Cpu, Sparkles, ArrowRight } from 'lucide-react';
import { sanitizeUrl } from '../utils/sanitizeUrl';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onContactAdmin: (from: GlobalNotification['from'], message: string) => void;
  allUsers?: User[];
  blogPosts?: Post[];
  onPostInteraction?: () => void;
}

// Premium Icon-Only Logo: Cyber Shield with Core Node (No Letters)
const LOGO_SRC = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSI2NCIgZmlsbD0idXJsKCNnKSIvPjxwYXRoIGQ9Ik02NCAzMkM0NCAzMiAzNCAzNyAzNCA0MFY2NEMzNCA4NiA2NCAxMDAgNjQgMTAwQzY0IDEwMCA5NCA4NiA5NCA2NFY0MEM5NCAzNyA4NCAzMiA2NCAzMloiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PGNpcmNsZSBjeD0iNjQiIGN5PSI2MiIgcj0iMTAiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTY0IDcyVjgyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMTI4IiB5Mj0iMTI4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzRGNDZFNSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0VDNDg5OSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==";

const getGuestId = () => {
    let gid = localStorage.getItem('guest_uuid');
    if (!gid || !gid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        try { 
            gid = window.crypto.randomUUID(); 
        } catch (e) {
            // Bulletproof fallback using Math.random if crypto is completely unavailable or throws
            gid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        localStorage.setItem('guest_uuid', gid);
    }
    return gid;
};

const GUEST_VIEWER: User = {
    id: getGuestId(),
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
    },
    {
        id: 'exploit-sandbox',
        title: 'Exploit Sandbox',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.631.315a6 6 0 01-3.86.517l-2.387-.477a2 2 0 00-1.022.547l-1.16 1.16a2 2 0 000 2.828l1.16 1.16a2 2 0 001.022.547l2.387.477a6 6 0 003.86-.517l.631-.315a6 6 0 013.86-.517l2.387.477a2 2 0 001.022-.547l1.16-1.16a2 2 0 000-2.828l-1.16-1.16z" /></svg>,
        description: 'Safe container environment for testing payloads and debugging exploits without risk to your local system.',
        purpose: 'Test with confidence. Execute untrusted payloads in an isolated, temporary container environment. Perfect for analyzing malware or fine-tuning complex XSS/SQLi strings.',
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/30',
        hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-900/50',
        animation: 'fade-right',
        delay: 450
    },
    {
        id: 'cve-mapping',
        title: 'Auto-CVE Mapping',
        icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
        description: 'Automatically link your findings to the global CVE database for enhanced vulnerability intelligence.',
        purpose: 'Stay compliant and informed. Our engine automatically cross-references your findings with the NVD database, providing instant context, CVSS scores, and known remediation data.',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/30',
        hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/50',
        animation: 'fade-up',
        delay: 600
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-20 max-w-7xl mx-auto px-6">
            <div className="space-y-6">
                <div className="mb-8">
                     <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Frequently Asked Questions</h2>
                     <p className="text-slate-500 dark:text-slate-400">Can't find the answer you're looking for? Reach out to our team.</p>
                </div>
                <div className="space-y-2">
                    <FAQItem q="Is this platform free to use?" a="Yes, HtWtH is completely free for educational purposes and ethical hacking practice." />
                    <FAQItem q="How do I get admin access?" a="Admin access is restricted. However, you can request 'Writeup Access' to contribute content." />
                    <FAQItem q="What is the Kali Linux integration?" a="It allows you to run a remote Kali Linux desktop directly within your browser for pentesting tasks." />
                    <FAQItem q="How do I enable 2FA?" a="You can secure your account by navigating to Settings > Security once logged in. We support both TOTP (Authenticator App) and Magic Link 2FA." />
                    <FAQItem q="Can I collaborate with my team?" a="Absolutely. Our Pro Features include real-time collaboration, allowing multiple researchers to work on the same report simultaneously." />
                    <FAQItem q="Is my data secure?" a="We use industry-standard encryption and Row Level Security (RLS) to ensure your findings remain private. All vulnerability data is encrypted at rest." />
                    <FAQItem q="What happens if I delete my account?" a="We respect your privacy. Upon deletion, all your personal data, writeups, and findings are permanently purged from our primary databases." />
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

const LiveCodePreview: React.FC<{ type: string; isVisible: boolean }> = ({ type, isVisible }) => {
    const [lines, setLines] = useState<string[]>([]);
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        if (!isVisible) {
            setLines([]);
            setStatus('idle');
            return;
        }

        const scannerLogs = [
            "> Initializing neural vulnerability engine...",
            "> loading deep_learning_model_v4.bin",
            "> scanning target context: htwth.io",
            "> analyzing buffer overflows...",
            "> [!] HIGH: Potential heap corruption in module_auth.so",
            "> [!] MED: Outdated dependency detected in package.json",
            "> compiling threat report...",
            "> SCAN COMPLETE: 2 VULNERABILITIES FOUND"
        ];

        const blockchainLogs = [
            "> connecting to p2p node network...",
            "> verifying block 4,821,092...",
            "> auditing remediation transaction [0xaf8e...]",
            "> checkpoint reached: hash_valid",
            "> ledger integrity verified [100.00%]",
            "> SYNCED"
        ];

        const logs = type.includes('AI') ? scannerLogs : blockchainLogs;
        setStatus('running');

        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setLines(prev => [...prev, logs[i]]);
                i++;
            } else {
                setStatus('completed');
                clearInterval(interval);
            }
        }, 600);

        return () => clearInterval(interval);
    }, [isVisible, type]);

    if (!isVisible) return null;

    return (
        <div className="mt-4 bg-black rounded-xl p-4 font-mono text-[10px] border border-white/10 shadow-inner overflow-hidden max-h-[150px] relative">
            <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase tracking-widest">{type} CONSOLE</span>
                <span className={`px-1.5 py-0.5 rounded ${status === 'running' ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-green-500/20 text-green-400'}`}>
                    {status === 'running' ? 'RUNNING' : 'DONE'}
                </span>
            </div>
            <div className="space-y-1.5 h-[100px] overflow-y-auto custom-scrollbar">
                {lines.map((line, idx) => (
                    <div key={idx} className={(line?.startsWith('>') ?? false) ? 'text-indigo-400/80' : (line?.includes('[!]') ?? false) ? 'text-red-400' : 'text-slate-400'}>
                        {line}
                    </div>
                ))}
                {status === 'running' && <div className="text-white animate-pulse">_</div>}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
    );
};

const CommandPalette: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (tab: any) => void;
    onShowInnovation: () => void;
    onSelectPost: (post: Post) => void;
    onSignIn: () => void;
    blogPosts: Post[];
}> = ({ isOpen, onClose, onNavigate, onShowInnovation, onSelectPost, onSignIn, blogPosts }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            const timer = setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const staticActions = [
        { id: 'innovation', title: 'Open Innovation Lab', icon: <Cpu className="w-4 h-4" />, action: onShowInnovation, category: 'App' },
        { id: 'features', title: 'Explore Platform Features', icon: <Zap className="w-4 h-4" />, action: () => onNavigate('features'), category: 'App' },
        { id: 'community', title: 'Join Community Hub', icon: <Sparkles className="w-4 h-4" />, action: () => onNavigate('community'), category: 'App' },
        { id: 'signin', title: 'Sign In / Account', icon: <LockIcon className="w-4 h-4" />, action: onSignIn, category: 'Auth' },
    ];

    const filteredActions = query 
        ? staticActions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()))
        : staticActions;

    const filteredPosts = query 
        ? (blogPosts || []).filter(p => p?.title?.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
        : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[2000] flex items-start justify-center pt-[15vh] px-4"
                    style={{ pointerEvents: 'auto' }}
                >
                    <motion.div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    
                    <motion.div 
                        className="w-full max-w-2xl bg-[#0e0e11] rounded-2xl border border-white/10 shadow-[0_0_80px_-20px_rgba(0,0,0,1)] flex flex-col h-auto min-h-[300px] relative z-10"
                        initial={{ scale: 0.92, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Input Area */}
                        <div className="flex items-center gap-3 p-5 border-b border-white/10 bg-white/[0.01]">
                            <Search className="w-5 h-5 text-indigo-500" />
                            <input 
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cognitive Search..."
                                className="bg-transparent border-none outline-none text-white text-lg flex-1 placeholder:text-white/20 font-sans"
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/60 font-mono">
                                <Command className="w-3 h-3" />
                                <span>K</span>
                            </div>
                        </div>

                        {/* Results Area */}
                        <div className="flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar p-2">
                            {filteredActions.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400 opacity-60">Operations</div>
                                    <div className="space-y-1">
                                        {filteredActions.map(action => (
                                            <button 
                                                key={action.id}
                                                onClick={() => {
                                                    action.action();
                                                    onClose();
                                                }}
                                                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.04] group transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                        {action.icon}
                                                    </div>
                                                    <span className="text-[15px] font-medium text-slate-100 group-hover:text-white">{action.title}</span>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-white/5 group-hover:text-white/40 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filteredPosts.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-black text-emerald-400 opacity-60">Archive Intel</div>
                                    <div className="space-y-1">
                                        {filteredPosts.map(post => (
                                            <button 
                                                key={post.id}
                                                onClick={() => {
                                                    onSelectPost(post);
                                                    onClose();
                                                }}
                                                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.04] group transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                        <Terminal className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[15px] font-medium text-slate-100 group-hover:text-white truncate max-w-[400px]">{post?.title}</span>
                                                </div>
                                                <span className="text-[10px] font-black tracking-widest text-emerald-500/40 group-hover:text-emerald-500 transition-colors uppercase">Execute</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {query && filteredActions.length === 0 && filteredPosts.length === 0 && (
                                <div className="py-24 text-center flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center">
                                        <Search className="w-8 h-8 text-white/10" />
                                    </div>
                                    <p className="text-sm text-white/20 font-mono tracking-tighter">NULL_DATA_MATCH: "{query}"</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Area */}
                        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center text-[10px] text-white/40">
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2">
                                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-mono">ESC</kbd> 
                                    <span>CLOSE</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-mono">↵</kbd> 
                                    <span>SELECT</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/20 font-mono">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                <span>TERMINAL_OS:v1.0.6</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn, onContactAdmin, allUsers = MOCK_USERS, blogPosts = [], onPostInteraction }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [showCopyright, setShowCopyright] = useState(false);
  const [showInnovation, setShowInnovation] = useState(false);
  const [activeIdeaIndex, setActiveIdeaIndex] = useState<number | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'features' | 'community' | 'resources' | 'pricing' | 'blog' | 'resumeai'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<Post | null>(null);

  // Handle URL Hash for Shareable Links (e.g., /#/blog, /#/pricing)
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace(/^#\/?/, '').split('/');
      const section = currentHash[0] as any;
      const subId = currentHash[1];

      const validTabs = ['home', 'features', 'community', 'resources', 'pricing', 'blog', 'writeup'];
      if (validTabs.includes(section)) {
        if (section === 'writeup') {
            setActiveTab('blog'); // Writeups are viewed in blog tab on landing page
        } else {
            setActiveTab(section);
        }
        
        // Deep linking for specific blog posts or writeups
        if ((section === 'blog' || section === 'writeup') && subId) {
          const post = blogPosts.find(p => p.id === subId);
          if (post) {
            setSelectedBlogPost(post);
          }
        } else if (!subId) {
          setSelectedBlogPost(null);
        }
      } else if (currentHash[0] === '' || currentHash[0] === '#') {
          setActiveTab('home');
          setSelectedBlogPost(null);
      }
    };

    handleHashChange(); // Run on mount
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [blogPosts]);

  // Helper to handle tab changes with URL updates
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSelectedBlogPost(null);
    window.location.hash = `#/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // Helper to handle post selection with URL updates
  const handleSelectPost = (post: Post) => {
    setSelectedBlogPost(post);
    window.location.hash = `#/${post.type}/${post.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync selected blog post to reflect external updates (like count, comments)
  useEffect(() => {
    if (selectedBlogPost) {
      const latest = blogPosts.find(p => p.id === selectedBlogPost.id);
      if (latest && JSON.stringify(latest) !== JSON.stringify(selectedBlogPost)) {
        setSelectedBlogPost(latest);
      }
    }
  }, [blogPosts, selectedBlogPost]);

  // Command Palette Global Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent rapid toggling if key is held down
      if (e.repeat) return;

      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // State for Innovation Fade Open
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-indigo-500 selection:text-white overflow-clip relative w-full">
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

      <Suspense fallback={<div className="fixed inset-0 bg-slate-950 z-[-1]" />}>
        <ParticlesBackground />
      </Suspense>

      {/* Navigation */}
      <RevealOnScroll animation="fade-down" duration={1000} className="fixed top-0 left-0 right-0 z-50">
        <nav className="transition-all duration-300 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 supports-[backdrop-filter]:bg-white/50">
            <div className="w-full px-4 sm:px-12 lg:px-16">
            <div className="flex justify-between items-center h-20">
                {/* Logo Area */}
                <div className="flex items-center gap-4 cursor-pointer group select-none" onClick={() => handleTabChange('home')}>
                
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
                        alt="HTWTH Application Logo" 
                        title="HTWTH Icon"
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
                    <button onClick={() => handleTabChange('features')} className={`text-sm font-bold transition-colors ${activeTab === 'features' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Features</button>
                    <button onClick={() => handleTabChange('community')} className={`text-sm font-bold transition-colors ${activeTab === 'community' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Community</button>
                    <button onClick={() => handleTabChange('resources')} className={`text-sm font-bold transition-colors ${activeTab === 'resources' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Resources</button>
                    <button onClick={() => handleTabChange('pricing')} className={`text-sm font-bold transition-colors ${activeTab === 'pricing' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Pricing</button>
                    <button onClick={() => handleTabChange('blog')} className={`text-sm font-bold transition-colors ${activeTab === 'blog' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Blog</button>
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
                    <button onClick={() => handleTabChange('features')} className={`text-left text-sm font-bold transition-colors ${activeTab === 'features' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>Features</button>
                    <button onClick={() => handleTabChange('community')} className={`text-left text-sm font-bold transition-colors ${activeTab === 'community' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>Community</button>
                    <button onClick={() => handleTabChange('resources')} className={`text-left text-sm font-bold transition-colors ${activeTab === 'resources' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>Resources</button>
                    <button onClick={() => handleTabChange('pricing')} className={`text-left text-sm font-bold transition-colors ${activeTab === 'pricing' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>Pricing</button>
                    <button onClick={() => handleTabChange('blog')} className={`text-left text-sm font-bold transition-colors ${activeTab === 'blog' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>Blog</button>
                    <div className="pt-4 border-t border-slate-200/60 dark:border-white/5">
                        <SignInButton onClick={() => { onSignIn(); setMobileMenuOpen(false); }} />
                    </div>
                </div>
            </div>
            </div>
        </nav>
      </RevealOnScroll>

      {/* Main Content */}
      <main className={`${activeTab === 'blog' ? 'pt-28 px-4 sm:px-6 lg:px-12' : 'pt-32 sm:pt-40 px-4 sm:px-12 lg:px-24'} pb-16 sm:pb-24 lg:pb-32 w-full relative z-10 min-h-[80vh]`}>
        
        {activeTab === 'blog' && (
            <div className="pt-4 pb-12">
                {/* News Marquee - Positioned with a balanced gap from the top */}
                <div className="mb-10 overflow-hidden relative bg-slate-100/50 dark:bg-slate-800/30 py-3.5 border-y border-slate-200 dark:border-slate-700/50 rounded-xl backdrop-blur-sm shadow-sm">
                    <div className="absolute left-0 top-0 bottom-0 px-4 animate-blink-red-white flex items-center justify-center font-bold text-[10px] uppercase tracking-widest z-20 shadow-[4px_0_10px_rgba(0,0,0,0.1)] gap-2">
                        <Cloud className="w-3.5 h-3.5" />
                        Latest News
                        <CircleHelp className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center pl-44 animate-marquee z-10">
                        {(blogPosts && blogPosts.filter(p => p.is_visible).length > 0) ? (
                            blogPosts.filter(p => p.is_visible).slice(0, 5).map((post) => (
                                <div key={post.id} className="flex items-center gap-4 mr-16 flex-shrink-0">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                        New Blog Posted: <span className="text-indigo-600 dark:text-indigo-400">"{post.title}"</span> by {post.author.name} — <span className="text-slate-500">{new Date(post.created_at).toLocaleDateString()}</span>
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center gap-4 mr-16 flex-shrink-0">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Stay tuned for upcoming security insights and community updates!
                                </span>
                            </div>
                        )}
                        {/* Duplicate for seamless infinite loop */}
                        <div className="flex items-center gap-4 opacity-50 flex-shrink-0">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">End of Latest news scroll • Refresh for updates</span>
                        </div>
                    </div>
                </div>

                {selectedBlogPost ? (
                    <div className="relative">
                        <div className="sticky top-24 z-40 mb-8 flex items-center">
                            <button 
                                onClick={() => handleTabChange('blog')} 
                                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-5 py-2.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all font-bold animate-fade-in group hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800/80"
                            >
                                <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                Back to Blog Posts
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-8 items-start animate-fade-in">
                            {/* Innovation Idea: Left Sidebar - Post Details & Author */}
                            <div className="hidden lg:block space-y-6 animate-fade-right">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">Post Details</h3>
                                    </div>
                                    
                                    <div className="space-y-4 font-sans text-[12px]">
                                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                            <div className="text-slate-400 dark:text-slate-500 uppercase mb-1 font-bold text-[10px]">Author</div>
                                            <div className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedBlogPost.author.name}</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                            <div className="text-slate-400 dark:text-slate-500 uppercase mb-1 font-bold text-[10px]">Published On</div>
                                            <div className="text-slate-700 dark:text-slate-200">{new Date(selectedBlogPost.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                            <div className="text-slate-400 dark:text-slate-500 uppercase mb-1 font-bold text-[10px]">Access Level</div>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${selectedBlogPost.is_protected ? 'bg-amber-500' : 'bg-green-500 animate-pulse'}`}></span>
                                                <span className={`${selectedBlogPost.is_protected ? 'text-amber-500' : 'text-green-500'} font-bold`}>
                                                    {selectedBlogPost.is_protected ? 'LOCKED CONTENT' : 'PUBLIC ACCESS'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                            <div className="text-slate-400 dark:text-slate-500 uppercase mb-1 font-bold text-[10px]">Status</div>
                                            <div className="text-slate-700 dark:text-slate-200 flex flex-col gap-1">
                                                <div className="flex justify-between items-center">
                                                    <span>Verified Post</span>
                                                    <CheckIcon className="w-3 h-3 text-green-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                                    <Rocket className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/20 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                                    <h4 className="font-black text-lg mb-2 relative z-10 italic uppercase tracking-tighter">Ready to Hacker?</h4>
                                    <p className="text-indigo-100 text-xs mb-4 relative z-10 leading-relaxed font-medium">Join our community to access premium research and tools.</p>
                                    <button 
                                        onClick={onGetStarted}
                                        className="w-full py-2.5 bg-white text-indigo-600 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors relative z-10 shadow-lg shadow-indigo-900/40"
                                    >
                                        Create Free Account
                                    </button>
                                </div>
                            </div>

                            {/* Main Content Viewer */}
                            <div className="relative">
                                <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all ${selectedBlogPost.is_protected ? 'max-h-[600px] overflow-hidden' : ''}`}>
                                    <Suspense fallback={<div className="h-[400px] flex items-center justify-center"><SpinnerIcon className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
                                        <BlogPostViewer post={selectedBlogPost} onUpdate={onPostInteraction} />
                                    </Suspense>
                                    
                                    {selectedBlogPost.is_protected && (
                                        <div className="absolute inset-x-0 bottom-0 top-[300px] bg-gradient-to-t from-white dark:from-slate-950 via-white/95 dark:via-slate-950/95 to-transparent z-20 flex flex-col items-center justify-end pb-16 px-6 text-center">
                                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full animate-fade-up">
                                                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                    <LockIcon className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Locked Prototype Report</h3>
                                                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                                    This detailed write-up is reserved for verified researchers. Please sign in or create an account to view the full technical analysis.
                                                </p>
                                                <div className="flex flex-col gap-3">
                                                    <button 
                                                        onClick={onSignIn}
                                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25"
                                                    >
                                                        Sign In to Read
                                                    </button>
                                                    <button 
                                                        onClick={onGetStarted}
                                                        className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold transition-all"
                                                    >
                                                        Sign Up for Full Access
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Innovation Idea: Right Sidebar - Related Content */}
                            <div className="hidden lg:block space-y-6 animate-fade-left">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">Related Content</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {blogPosts && blogPosts.filter(p => p.id !== selectedBlogPost.id && p.is_visible && p.type === selectedBlogPost.type).slice(0, 4).map(post => (
                                            <button 
                                                key={post.id}
                                                onClick={() => {
                                                    handleSelectPost(post);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="w-full text-left group"
                                            >
                                                <div className="p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-widest">{post.type}</div>
                                                        {post.is_protected && <LockIcon className="w-3 h-3 text-amber-500" />}
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 transition-colors">{post.title}</div>
                                                </div>
                                            </button>
                                        ))}
                                        
                                        {blogPosts.filter(p => p.id !== selectedBlogPost.id && p.is_visible && p.type === selectedBlogPost.type).length === 0 && (
                                            <div className="text-center py-8 text-slate-400 dark:text-slate-600 italic text-xs leading-relaxed">
                                                No other related {selectedBlogPost.type}s found.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
                                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MailIcon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Technical Newsletter</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 px-2">Weekly security intel delivered directly to your inbox.</p>
                                    <button 
                                        onClick={() => {
                                            const footer = document.querySelector('#footer');
                                            footer?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Subscribe Below
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {blogPosts && blogPosts.filter(p => p.is_visible).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                                {blogPosts.filter(p => p.is_visible).map(post => (
                                    <div key={post.id} className="transition-transform duration-300 hover:-translate-y-2">
                                        <PostCard 
                                            post={post} 
                                            currentUser={GUEST_VIEWER} 
                                            onClick={() => handleSelectPost(post)} 
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center mb-16">
                                <p className="text-xl text-slate-500 dark:text-slate-400">Exciting insights and updates coming soon!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        )}

        {activeTab === 'home' && (
        <div className="animate-fade-in">
        <div className="text-center max-w-7xl mx-auto px-4">
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
        <RevealOnScroll animation="fade-up" delay={600} duration={1200} className="mt-20 relative max-w-7xl mx-auto px-4">
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
              alt="HTWTH Ethical Hacking Platform Interface Preview" 
              title="Dashboard Workspace Preview"
              className="w-full aspect-[16/10] sm:aspect-[16/9] object-cover opacity-90"
              loading="lazy"
            />
          </div>
        </RevealOnScroll>
        </div>
        )}

        {(activeTab === 'home' || activeTab === 'features') && (
        <div className="animate-fade-in">
        {/* Features Section */}
        <div className="mt-32 mb-24">
            <RevealOnScroll animation="fade-up">
                 <div className="text-center max-w-3xl mx-auto mb-16">
                   <h2 className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wide uppercase text-sm mb-3">Everything you need</h2>
                   <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
                     {showAllFeatures ? 'All Powerful Features' : 'Top Security Features'} for Professionals
                   </h2>
                   <p className="text-slate-600 dark:text-slate-400 text-lg">A complete ecosystem designed specifically for security researchers and ethical hackers. HTWTH provides an integrated environment to document complex vulnerabilities, automate reporting, map CVEs, and collaborate in real-time, helping you secure the digital world faster and more efficiently.</p>
                 </div>
            </RevealOnScroll>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURES.slice(0, showAllFeatures ? FEATURES.length : 10).map((feature, index) => {
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

            {!showAllFeatures && FEATURES.length > 10 && (
                <div className="mt-12 text-center">
                    <button 
                        onClick={() => setShowAllFeatures(true)}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 group"
                    >
                        View More Features
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Explore all 20+ power tools in our ecosystem</p>
                </div>
            )}
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

        {/* Community Buzz section */}
        </div>
        )}

        {activeTab === 'community' && (
            <div className="animate-fade-in text-center py-20">
                <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">Join the Elite Hacker Community</h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto">Connect, collaborate, and learn with top security researchers around the globe.</p>
                <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl px-4">
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
            <div className="animate-fade-in py-24 w-full px-6 sm:px-12 relative">
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
            <div className="animate-fade-in text-center py-24 max-w-7xl mx-auto px-4">
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

      <Footer 
        onAction={onSignIn} 
        onShowCopyright={() => setShowCopyright(true)} 
        onShowInnovation={() => setShowInnovation(true)} 
        onSetTab={handleTabChange}
      />

      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)}
        onNavigate={handleTabChange}
        onShowInnovation={() => {
            setShowInnovation(true);
            setShowCommandPalette(false);
        }}
        blogPosts={blogPosts}
        onSelectPost={(post) => {
            handleSelectPost(post);
            setShowCommandPalette(false);
        }}
        onSignIn={() => {
            onSignIn();
            setShowCommandPalette(false);
        }}
      />
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

            <Suspense fallback={<MicrochipLoader />}>
                <MyWorkPage 
                    user={GUEST_VIEWER}
                    allUsers={getUsersForProfile()}
                    writeups={[]}
                    blogPosts={[]}
                    profileUserEmail={ADMIN_EMAIL}
                />
            </Suspense>
        </div>
      )}

      {showInnovation && (
        <div 
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fade-in"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setShowInnovation(false);
                }
            }}
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
            >
                {/* Modal Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Cloud className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold">Innovation Lab</h2>
                            <p className="text-sm text-indigo-100 opacity-80">Forging the future of cybersecurity</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowInnovation(false)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar bg-slate-50 dark:bg-[#0c0c0e]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {/* Innovation Radar Element */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0 overflow-hidden">
                             <div className="w-full h-full rounded-full border border-indigo-500 animate-ping pb-20"></div>
                             <div className="absolute inset-0 w-full h-full rounded-full border border-indigo-500 scale-75 animate-ping [animation-delay:1s]"></div>
                        </div>

                        {[
                            {
                                title: "AI-Driven Vulnerability Scanner",
                                description: "Next-gen code analysis using deep learning models to predict zero-day vulnerabilities in real-time.",
                                icon: <LockIcon className="w-6 h-6" />,
                                tags: ["AI", "Security", "ML"],
                                status: "BETA ACCESS"
                            },
                            {
                                title: "Blockchain Audit Ledger",
                                description: "An immutable, decentralized ledger for logging security audits and vulnerability remediation steps.",
                                icon: <KaliIcon className="w-6 h-6" />,
                                tags: ["Blockchain", "Auditing"],
                                status: "RESEARCH"
                            },
                            {
                                title: "Holographic Pentest Dashboard",
                                description: "AR/VR environment mapping for visualizing network topologies and active attack vectors.",
                                icon: <ResourcesIcon className="w-6 h-6" />,
                                tags: ["AR/VR", "Visualisation"],
                                status: "PROTOTYPE"
                            },
                            {
                                title: "Decentralized Bounty Pool",
                                description: "Smart-contract based bug bounty ecosystem ensuring instant, automated payouts for verified exploits.",
                                icon: <CheckIcon className="w-5 h-5" />,
                                tags: ["Web3", "Economy"],
                                status: "ALPHA"
                            }
                        ].map((idea, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setActiveIdeaIndex(activeIdeaIndex === i ? null : i)}
                                className={`group p-6 rounded-3xl bg-white dark:bg-[#151518] border transition-all relative z-10 overflow-hidden cursor-pointer ${
                                    activeIdeaIndex === i 
                                        ? 'border-indigo-500 shadow-2xl ring-1 ring-indigo-500/20' 
                                        : 'border-slate-200 dark:border-white/5 hover:border-indigo-500/50 hover:shadow-xl'
                                }`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-150 transition-transform duration-500 text-indigo-500">
                                    {idea.icon}
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className={`p-4 rounded-2xl shadow-sm border transition-all flex-shrink-0 ${
                                        activeIdeaIndex === i 
                                            ? 'bg-indigo-600 text-white border-indigo-500 scale-110' 
                                            : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-indigo-100 dark:border-indigo-500/10 group-hover:scale-110'
                                    }`}>
                                        {idea.icon}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{idea.title}</h3>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ml-2 whitespace-nowrap tracking-wider ${
                                                activeIdeaIndex === i ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
                                            }`}>{idea.status}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{idea.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {idea.tags.map(tag => (
                                                <span key={tag} className="text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <LiveCodePreview type={idea.title} isVisible={activeIdeaIndex === i} />
                                        
                                        {activeIdeaIndex !== i && (
                                           <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                               <Terminal className="w-3 h-3" />
                                               RUN REAL-TIME SIMULATION
                                           </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Innovation CTA */}
                    <div className="mt-12 p-10 rounded-[2.5rem] bg-[#0c0c0e] text-white text-center relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                             <Cloud className="w-40 h-40" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-4">Have a Disruptive Idea?</h3>
                            <p className="max-w-xl mx-auto mb-8 opacity-90">Our lab is always looking for the next breakthrough in security technology. Pitch your idea or collaborate with our research team.</p>
                            <button 
                                onClick={onSignIn}
                                className="px-8 py-3 bg-white text-indigo-600 rounded-full font-bold hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                Submit Proposal
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
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
                    <Suspense fallback={<MicrochipLoader />}>
                        <CopyrightPage onClose={() => setShowCopyright(false)} />
                    </Suspense>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;

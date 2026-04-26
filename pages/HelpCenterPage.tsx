import React, { useState, useMemo } from 'react';
import SupportBot from '../components/SupportBot';
import { ChevronDown, Search, ArrowLeft, Book, Shield, MessageSquare, Code, Terminal, Zap, LayoutGrid, Mail, Send, Github, Twitter, Globe, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Page } from '../types';
import { addContactRequest } from '../services/database';

import Footer from '../components/Footer';

interface HelpCenterPageProps {
  onNavigateHome: () => void;
  onNavigate: (page: Page) => void;
  user: any;
  onAction?: () => void;
  onShowCopyright?: () => void;
}

const faqs = [
  // Getting Started (10)
  { category: "Getting Started", q: "What is HTWTH?", a: "HTWTH (Hack To Write To Hack) is an ecosystem for security researchers to collaborate, share vulnerabilities, and document findings." },
  { category: "Getting Started", q: "How do I create an account?", a: "Click the 'Sign Up' button on the landing page, enter your email, username, and password. Confirm your email to get started." },
  { category: "Getting Started", q: "Is HTWTH free to use?", a: "Yes, the core platform is completely free for researchers. Premium features may be added in the future." },
  { category: "Getting Started", q: "What browser should I use?", a: "HTWTH functions best on modern browsers like Chrome, Firefox, Safari, and Edge." },
  { category: "Getting Started", q: "How do I update my profile?", a: "Navigate to Dashboard > Settings (gear icon) to update your bio, avatar, and social links." },
  { category: "Getting Started", q: "What are the rules of the community?", a: "No illegal activities, no harassment, always respect disclosure guidelines, and keep conversations professional." },
  { category: "Getting Started", q: "How do I log out?", a: "Click your avatar in the top right and select 'Sign Out'." },
  { category: "Getting Started", q: "Can I use HTWTH on mobile?", a: "Yes, the platform is responsive and works on mobile devices." },
  { category: "Getting Started", q: "How do I delete my account?", a: "Go to Settings > Danger Zone and click 'Delete Account'." },
  { category: "Getting Started", q: "Where can I report a bug?", a: "Use the Support Bot or reach out to an admin in the general chat." },

  // Account & Security (10)
  { category: "Account & Security", q: "How do I enable 2FA?", a: "Go to Settings > Security and toggle 'Two-Factor Authentication'. Follow the steps to link your authenticator app." },
  { category: "Account & Security", q: "I lost my backup codes, what do I do?", a: "If you lose your authenticator and backup codes, please contact support via email for identity verification." },
  { category: "Account & Security", q: "How do I change my password?", a: "Go to Settings, under 'Sign-in Methods' click 'Change' next to Password." },
  { category: "Account & Security", q: "How do I change my email?", a: "Go to Settings, under 'Sign-in Methods' click 'Change' next to Email Address. Verification required." },
  { category: "Account & Security", q: "What happens if I forget my password?", a: "Use the 'Forgot Password' link on the login page to receive a reset code." },
  { category: "Account & Security", q: "Can I use external auth providers?", a: "Currently we support Google and GitHub authentication." },
  { category: "Account & Security", q: "Is my data encrypted?", a: "Yes, all data in transit and at rest is secured according to industry standards." },
  { category: "Account & Security", q: "Who can see my profile?", a: "By default, any registered user can view your public profile." },
  { category: "Account & Security", q: "How are sessions managed?", a: "Sessions expire automatically after inactivity, or you can revoke all sessions in Settings." },
  { category: "Account & Security", q: "Can I have multiple accounts?", a: "No, users are restricted to one account to maintain a trusting environment." },

  // Chat & Collaboration (10)
  { category: "Chat & Collaboration", q: "How do I send a direct message?", a: "Click on a user's name in global chat or their profile and select 'Message'." },
  { category: "Chat & Collaboration", q: "Can I create group chats?", a: "Not at the moment, but you can participate in the Global Chat room." },
  { category: "Chat & Collaboration", q: "How do I share a snippet in chat?", a: "Use the markdown code block syntax (```) to share code snippets safely." },
  { category: "Chat & Collaboration", q: "Why are my messages pending?", a: "If the connection is unstable, messages will queue until connectivity is restored." },
  { category: "Chat & Collaboration", q: "Can I delete a message?", a: "Yes, hover over your message and click the trash icon." },
  { category: "Chat & Collaboration", q: "Are chats encrypted?", a: "Direct messages are securely stored in our database, but end-to-end encryption is planned for V2." },
  { category: "Chat & Collaboration", q: "How do I report a user in chat?", a: "Click the flag icon next to their message to notify moderators." },
  { category: "Chat & Collaboration", q: "Can I send files?", a: "At this time, only image links are supported to prevent malware distribution." },
  { category: "Chat & Collaboration", q: "What is the chat history limit?", a: "The Global Chat retains the last 1000 messages. Direct messages have no strict limit." },
  { category: "Chat & Collaboration", q: "How do I mention someone?", a: "Use the @ symbol followed by their username to ping them." },

  // Writeups & Findings (10)
  { category: "Writeups & Findings", q: "How do I publish a writeup?", a: "Go to 'My Work' -> 'New Writeup'. Fill in the vulnerable URL, description, and steps to reproduce." },
  { category: "Writeups & Findings", q: "What is markdown support?", a: "You can format your writeups using standard markdown (bold, italic, lists, code blocks)." },
  { category: "Writeups & Findings", q: "Can I keep a writeup private?", a: "Yes, you can save it as a draft before publishing it to the community." },
  { category: "Writeups & Findings", q: "How do I link a CVE?", a: "In the writeup editor, there's a field for related CVE IDs. Ensure the format is CVE-XXXX-XXXXX." },
  { category: "Writeups & Findings", q: "Who reviews my writeups?", a: "Writeups are peer-reviewed by the community. Highly rated writeups are featured on the home page." },
  { category: "Writeups & Findings", q: "Can I earn bounties through HTWTH?", a: "We are an educational and sharing platform. For bounties, submit your findings to the respective program." },
  { category: "Writeups & Findings", q: "How do I edit a published writeup?", a: "Go to your Profile or 'My Work', find the writeup, and click 'Edit'." },
  { category: "Writeups & Findings", q: "Can others comment on my writeup?", a: "Yes, authenticated users can leave comments and upvote." },
  { category: "Writeups & Findings", q: "Are attachments supported?", a: "Currently, we advise using external image hosts like Imgur and embedding them via Markdown." },
  { category: "Writeups & Findings", q: "What should I NOT share?", a: "Never share live exploits targeting unpatched vulnerabilities in unauthorized systems." },

  // Platform & Tools (10)
  { category: "Platform & Tools", q: "What is the 'Tools' view?", a: "The Tools section contains a suite of simulated environment utilities like a terminal and command palette." },
  { category: "Platform & Tools", q: "How do I use the Web Browser?", a: "Navigate to the Web Browser app to safely inspect simulated web requests." },
  { category: "Platform & Tools", q: "What is Sleep Mode?", a: "A screensaver mode that activates to hide your screen when you step away." },
  { category: "Platform & Tools", q: "Can I change the theme?", a: "Yes, use the moon/sun icon in the taskbar or top right to switch between dark and light modes." },
  { category: "Platform & Tools", q: "What is the Innovation Lab?", a: "An experimental area showcasing upcoming features and platform capabilities." },
  { category: "Platform & Tools", q: "How do I customize the Taskbar?", a: "Right-click the taskbar to pin or unpin apps (coming soon)." },
  { category: "Platform & Tools", q: "Is there a desktop app?", a: "We offer a Progressive Web App (PWA). Click 'Install App' in your browser address bar." },
  { category: "Platform & Tools", q: "Where are my notifications?", a: "Click the bell icon in the taskbar to view all alerts and messages." },
  { category: "Platform & Tools", q: "What does the 'Focus Mode' do?", a: "It hides all UI elements except the active window to maximize your workspace." },
  { category: "Platform & Tools", q: "How do I access RSS feeds?", a: "Our platform aggregates security news in the 'News' or 'Resources' tab depending on your layout." },
  { category: "Platform & Tools", q: "Can I use HTWTH offline?", a: "Some basic functionality is cached via PWA, but you need an internet connection to chat and sync features." },
  { category: "Platform & Tools", q: "How do I report an issue with the platform?", a: "Use the Support Bot on this page or email support directly." },
  { category: "Platform & Tools", q: "Is the platform open source?", a: "The core platform is proprietary, but we regularly open-source useful security utilities and scripts." }
];

const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ onNavigateHome, onNavigate, user, onAction, onShowCopyright }) => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === 'dark';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return faqs;
    const lowerQuery = searchQuery.toLowerCase();
    return faqs.filter(faq => 
      faq.q.toLowerCase().includes(lowerQuery) || 
      faq.a.toLowerCase().includes(lowerQuery) ||
      faq.category.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  const categories = Array.from(new Set(faqs.map(f => f.category)));

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: user?.username || '', email: user?.email || '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addContactRequest({
        name: contactForm.name,
        email: contactForm.email,
        message: `[Subject: ${contactForm.subject}] ${contactForm.message}`
      });
      setIsSubmitting(false);
      setSubmitStatus('success');
      setContactForm({ ...contactForm, subject: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsSubmitting(false);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const handleSupportMessage = async (name: string, email: string, message: string) => {
    return new Promise<{success: boolean}>((resolve) => setTimeout(() => resolve({success: true}), 1000));
  };

  return (
    <div className={`min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300 text-slate-900 dark:text-slate-100 ${isDarkMode ? 'dark' : ''}`}>
      <header className="sticky top-0 w-full px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50">
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return</span>
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Shield className="w-3 h-3 text-indigo-500" />
            Support Hub
          </div>
        </div>
      </header>

      <main className="flex-grow pt-8 sm:pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 animate-fade-in">
            Help Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
             Everything you need to master the HTWTH ecosystem. Browse FAQs, search tools, and find collaboration tips.
          </p>
          
          {/* Search Bar */}
          <div className="relative mt-8 group animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] text-base"
              placeholder="How can we help you today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {/* Nav - Mobile & Desktop */}
            <div className="lg:w-72 flex-shrink-0">
                <div className="lg:sticky lg:top-28">
                  <h3 className="hidden lg:block font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-[0.2em] opacity-50">Categories</h3>
                  
                  {/* Category List */}
                  <div className="relative lg:static">
                    <ul className="flex flex-row overflow-x-auto lg:flex-col gap-2 pb-4 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-nowrap w-full -mx-4 px-4 lg:mx-0 lg:px-0">
                        <li className="flex-shrink-0 lg:flex-shrink">
                            <button 
                              onClick={() => setSearchQuery('')} 
                              className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${!searchQuery ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg shadow-indigo-500/10' : 'bg-slate-100 text-slate-600 dark:bg-slate-900/80 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-transparent dark:border-slate-800'}`}
                            >
                              <div className="flex items-center gap-3">
                                <LayoutGrid className={`w-4 h-4 ${!searchQuery ? 'opacity-100' : 'opacity-50'}`} />
                                <span>All Topics</span>
                              </div>
                            </button>
                        </li>
                        {categories.map(cat => {
                          let Icon = Book;
                          if (cat === "Account & Security") Icon = Shield;
                          else if (cat === "Chat & Collaboration") Icon = MessageSquare;
                          else if (cat === "Platform & Tools") Icon = Terminal;
                          else if (cat === "Writeups & Findings") Icon = Code;

                          const active = searchQuery === cat;

                          return (
                            <li key={cat} className="flex-shrink-0 lg:flex-shrink">
                                <button 
                                  onClick={() => setSearchQuery(cat)} 
                                  className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${active ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg shadow-indigo-500/10' : 'bg-slate-100 text-slate-600 dark:bg-slate-900/80 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-transparent dark:border-slate-800'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Icon className={`w-4 h-4 ${active ? 'opacity-100' : 'opacity-50'}`} />
                                    <span className="whitespace-nowrap">{cat}</span>
                                  </div>
                                </button>
                            </li>
                          )
                        })}
                    </ul>
                  </div>

                  <div className="hidden lg:block mt-10 p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white shadow-xl shadow-indigo-500/20">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <Zap className="w-5 h-5 text-yellow-300" />
                          </div>
                          <h4 className="font-bold text-sm">Priority Support</h4>
                      </div>
                      <p className="text-sm text-indigo-50/80 mb-0 leading-relaxed font-medium">
                          Can't find what you need? Our AI Assistant is standing by in the bottom corner of your screen.
                      </p>
                  </div>
                </div>
            </div>

            {/* FAQ List */}
            <div className="flex-1 min-w-0">
                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-20 px-4 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Search className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No matches found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">We couldn't find any articles matching your search query. Try different keywords.</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-8 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                        >
                            Reset Search
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFaqs.map((faq, index) => {
                            const isExpanded = expandedIndex === index;

                            return (
                                <div 
                                    key={index} 
                                    className={`bg-white dark:bg-slate-900/40 rounded-2xl transition-all duration-300 overflow-hidden border ${isExpanded ? 'border-slate-300 dark:border-slate-700 shadow-xl bg-slate-50/50 dark:bg-slate-800/30' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md'}`}
                                >
                                    <button
                                        onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                        className="w-full flex items-center justify-between p-5 sm:p-7 text-left focus:outline-none group"
                                    >
                                        <div className="pr-4">
                                            <h3 className={`text-[15px] sm:text-base font-bold transition-colors ${isExpanded ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>{faq.q}</h3>
                                            {!searchQuery && (
                                              <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
                                                  {faq.category}
                                                </span>
                                              </div>
                                            )}
                                        </div>
                                        <div className={`p-1.5 sm:p-2 rounded-xl transition-all duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180 bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </button>
                                    
                                    <div 
                                      className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 pb-5 sm:pb-8' : 'max-h-0 opacity-0 pb-0'}`}
                                    >
                                        <div className="px-5 sm:px-7 text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-[15px] border-t border-slate-100 dark:border-slate-800/30 pt-5 sm:pt-6">
                                            <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base font-medium">
                                                {faq.a}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>

        {/* Admin Contact Form Section */}
        <section className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800/50">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Still have questions?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                If you couldn't find the answer in our FAQ, please feel free to contact our administration team directly. We typically respond within 24-48 hours.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                    <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Direct Email</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">ragow49@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-2xl">
                    <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Community Chat</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Join our #support channel in global chat.</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl mt-8">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Quick Tip</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    Providing your account ID and detailed steps of your issue helps us resolve your query much faster!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-slate-200/20 dark:shadow-none">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Name</label>
                    <input 
                      type="text" 
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      placeholder="Your name"
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Email</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      placeholder="your@email.com"
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    placeholder="What can we help you with?"
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'success'}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    submitStatus === 'success' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : submitStatus === 'success' ? (
                    'Message Sent Successfully!'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer 
        onAction={onAction} 
        onShowCopyright={onShowCopyright} 
      />
      
      {/* Absolute positioning for SupportBot */}
      <div className="fixed bottom-6 right-6 z-50">
        <SupportBot onSendAdminMessage={handleSupportMessage} />
      </div>
    </div>
  );
};

export default HelpCenterPage;


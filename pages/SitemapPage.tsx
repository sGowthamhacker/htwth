import React from 'react';
import { ArrowLeft, Map, ExternalLink } from 'lucide-react';
import Footer from '../components/Footer';

interface SitemapPageProps {
  onNavigateHome: () => void;
  onAction?: () => void;
  onShowCopyright?: () => void;
}

const SitemapPage: React.FC<SitemapPageProps> = ({ onNavigateHome, onAction, onShowCopyright }) => {
  const sections = [
    {
      title: "Core Ecosystem",
      links: [
        { name: "Platform Overview", hash: "#/", description: "The central hub of the HTWTH research environment." },
        { name: "Innovation Lab", hash: "#/innovation", description: "Experimental features and upcoming platform capabilities." },
        { name: "Global Chat", hash: "#/auth", description: "Real-time collaboration for security researchers worldwide." }
      ]
    },
    {
      title: "Knowledge & Resources",
      links: [
        { name: "Hack Intelligence Blog", hash: "#/blog", description: "Deep dives into critical vulnerabilities and zero-day research." },
        { name: "Vulnerability Database", hash: "#/auth", description: "A comprehensive collection of documented security findings." },
        { name: "Hacker Toolkits", hash: "#/auth", description: "Essential utilities and scripts for offensive and defensive operations." }
      ]
    },
    {
      title: "Support & Legal",
      links: [
        { name: "Help Center", hash: "#/helpcenter", description: "Comprehensive guides, FAQs, and support documentation." },
        { name: "Privacy Policy", hash: "#/privacy", description: "How we protect and manage your research data." },
        { name: "Terms of Service", hash: "#/terms", description: "The legal framework for using the HTWTH platform." },
        { name: "Security Policy", hash: "#/security", description: "Our commitment to platform integrity and responsible disclosure." },
        { name: "Legal Index", hash: "#/legal", description: "Central repository for all compliance and legal documents." }
      ]
    }
  ];

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 w-full px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50">
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return</span>
        </button>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Map className="w-3 h-3 text-indigo-500" />
          Index Engine
        </div>
      </header>

      <main className="flex-grow pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
            Ecosystem Sitemap
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            A comprehensive mapping of all accessible modules and documentation within the HTWTH architecture.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 sm:gap-16">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-8 animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 border-b border-indigo-500/10 pb-4">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.links.map((link, lIdx) => (
                  <button 
                    key={lIdx}
                    onClick={() => navigateTo(link.hash)}
                    className="group flex flex-col text-left hover:translate-x-1 transition-transform"
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                      <span>{link.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {link.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer 
        onAction={onAction}
        onShowCopyright={onShowCopyright}
      />
    </div>
  );
};

export default SitemapPage;

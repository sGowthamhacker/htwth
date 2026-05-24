import React from 'react';
import { Shield, HelpCircle, Sparkles } from 'lucide-react';

const FEATURE_DATA = [
    { title: "Smart Writeups", desc: "AI-powered vulnerability documentation and auto-tagging." },
    { title: "Remote Kali", desc: "Secure Kali Linux access directly via your browser." },
    { title: "Bank-Grade Security", desc: "Industry-standard RLS and 2FA protection for findings." }
];

const FAQ_DATA = [
     { q: "What is this platform?", a: "A professional hub for ethical hackers and bug bounty researchers." },
     { q: "How do I get help?", a: "Use the contact form here, or reach our support team directly via email." },
     { q: "Is it free to use?", a: "Yes, our core pentesting and portfolio tools are free for educational use." }
];

const LegalSupport = () => {
    return (
        <section className="py-20 px-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">Legal & Support</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {/* Features */}
                   <div>
                       <div className="flex items-center gap-3 mb-6">
                           <Sparkles className="w-6 h-6 text-indigo-500" />
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Features</h3>
                       </div>
                       <div className="space-y-4">
                           {FEATURE_DATA.map((f, i) => (
                               <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                   <h4 className="font-bold text-indigo-600 dark:text-indigo-400">{f.title}</h4>
                                   <p className="text-sm text-slate-700 dark:text-slate-400">{f.desc}</p>
                               </div>
                           ))}
                       </div>
                   </div>
                   {/* FAQ */}
                   <div>
                       <div className="flex items-center gap-3 mb-6">
                           <HelpCircle className="w-6 h-6 text-emerald-500" />
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h3>
                       </div>
                       <div className="space-y-4">
                           {FAQ_DATA.map((f, i) => (
                               <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                   <h4 className="font-bold text-slate-900 dark:text-slate-100">{f.q}</h4>
                                   <p className="text-sm text-slate-700 dark:text-slate-400">{f.a}</p>
                               </div>
                           ))}
                       </div>
                   </div>
                </div>
            </div>
        </section>
    );
};
export default LegalSupport;

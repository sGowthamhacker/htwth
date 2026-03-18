
import React, { useRef, useState } from 'react';
import ScaleIcon from '../components/icons/ScaleIcon';
import DownloadIcon from '../components/icons/DownloadIcon';
import MenuIcon from '../components/icons/MenuIcon';
import XCircleIcon from '../components/icons/XCircleIcon';

// Local icon definition to ensure self-containment
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

interface CopyrightPageProps {
    onClose?: () => void;
}

const CopyrightPage: React.FC<CopyrightPageProps> = ({ onClose }) => {
  const currentYear = new Date().getFullYear();
  // Formats the date as: Tuesday, December 16, 2025
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'intro', title: '1. Introduction', color: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'definitions', title: '2. Definitions', color: 'text-blue-600 dark:text-blue-400' },
    { id: 'acceptance', title: '3. Acceptance of Terms', color: 'text-cyan-600 dark:text-cyan-400' },
    { id: 'ethical-hacking', title: '4. Ethical Hacking Mandates', color: 'text-red-600 dark:text-red-400' },
    { id: 'account', title: '5. Account Security', color: 'text-violet-600 dark:text-violet-400' },
    { id: 'intellectual-property', title: '6. Intellectual Property', color: 'text-amber-600 dark:text-amber-400' },
    { id: 'user-content', title: '7. User Content License', color: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'prohibited', title: '8. Prohibited Conduct', color: 'text-rose-600 dark:text-rose-400' },
    { id: 'disclaimer', title: '9. Warranties Disclaimer', color: 'text-orange-600 dark:text-orange-400' },
    { id: 'liability', title: '10. Limitation of Liability', color: 'text-slate-600 dark:text-slate-400' },
    { id: 'privacy', title: '11. Privacy & Data', color: 'text-teal-600 dark:text-teal-400' },
    { id: 'termination', title: '12. Termination', color: 'text-fuchsia-600 dark:text-fuchsia-400' },
    { id: 'governing-law', title: '13. Governing Law', color: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'contact', title: '14. Contact Us', color: 'text-sky-600 dark:text-sky-400' },
  ];

  const mainScrollRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setMobileMenuOpen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-100 dark:bg-black text-slate-800 dark:text-slate-200 font-sans overflow-hidden relative">
        
        {/* Mobile Header - Visible only on small screens */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-black flex-shrink-0 z-20">
             <div className="flex items-center gap-2">
                {onClose && (
                    <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                )}
                {/* Visual pill for title on mobile */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 py-1.5 px-3 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
                    <ScaleIcon className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Legal Center</span>
                </div>
             </div>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <MenuIcon className="w-5 h-5" />
             </button>
        </div>

        {/* Sidebar Navigation */}
        <aside className={`
            fixed md:relative inset-y-0 left-0 z-30 w-72 bg-slate-50/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 backdrop-blur-xl md:backdrop-blur-none transition-transform duration-300 ease-in-out flex flex-col h-full
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 hidden md:block">
                <div className="flex items-center gap-3 font-bold text-slate-900 dark:text-white mb-1">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <ScaleIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xl tracking-tight">Legal Center</span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-2 ml-1">Ref: HTWTH-LEGAL-{currentYear}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
                <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">Table of Contents</p>
                {sections.map(section => (
                    <button 
                        key={section.id} 
                        onClick={() => scrollToSection(section.id)}
                        className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all flex items-center justify-between group"
                    >
                        <span>{section.title}</span>
                        <ChevronRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center flex-shrink-0 bg-slate-100 dark:bg-slate-900/50">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                    &copy; {currentYear} HackToWriteToHack
                </p>
            </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
        )}

        {/* Main Content Wrapper */}
        <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden md:bg-white md:dark:bg-slate-950">
            
            {/* The Scrollable Area / Card */}
            {/* On mobile: margins, rounded corners, white bg. On desktop: full width/height, white bg. */}
            <div 
                ref={mainScrollRef} 
                className="flex-1 overflow-y-auto scroll-smooth bg-white dark:bg-slate-950 md:rounded-none md:m-0 mx-3 mb-3 rounded-2xl shadow-sm md:shadow-none border md:border-0 border-slate-200 dark:border-slate-800"
            >
                <div className="max-w-4xl mx-auto p-5 sm:p-10 md:p-16 pb-24 md:pb-32">
                    
                    {/* Header */}
                    <header className="mb-10 md:mb-16 border-b border-slate-200 dark:border-slate-800 pb-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                            <span className="self-start px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                Effective Date: {todayDate}
                            </span>
                            <button 
                                onClick={handlePrint}
                                className="self-start sm:self-auto flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                <span>Save as PDF</span>
                            </button>
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                            Terms of Service & <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Legal Disclaimers</span>
                        </h1>
                        
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                            Please read these terms carefully before accessing or using the HackToWriteToHack (HTWTH) platform. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
                        </p>
                    </header>

                    {/* Content Sections */}
                    <div className="space-y-16">
                        
                        {/* 1. Introduction */}
                        <section id="intro" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-indigo-600 dark:text-indigo-400 opacity-50">01.</span>
                                Introduction
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Welcome to HackToWriteToHack ("HTWTH", "we", "our", or "us"). HTWTH provides an online Operating System simulation environment designed for cybersecurity education, vulnerability reporting documentation ("Writeups"), and professional portfolio management (the "Service").
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                By registering for, accessing, or using our Service, you agree to enter into a legally binding contract with HTWTH based on these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must not access or use the Service.
                            </p>
                        </section>

                        {/* 2. Definitions */}
                        <section id="definitions" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-blue-600 dark:text-blue-400 opacity-50">02.</span>
                                Definitions
                            </h2>
                            <ul className="space-y-4">
                                <li className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <strong className="block text-slate-900 dark:text-slate-200 mb-1">"User"</strong>
                                    <span className="text-slate-600 dark:text-slate-400 text-sm">Refers to any individual who creates an account or accesses the Service.</span>
                                </li>
                                <li className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <strong className="block text-slate-900 dark:text-slate-200 mb-1">"Content"</strong>
                                    <span className="text-slate-600 dark:text-slate-400 text-sm">Refers to text, images, code snippets, writeups, portfolio data, and other materials uploaded, posted, or stored by Users on the Service.</span>
                                </li>
                                <li className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <strong className="block text-slate-900 dark:text-slate-200 mb-1">"Ethical Hacking"</strong>
                                    <span className="text-slate-600 dark:text-slate-400 text-sm">Refers to the authorized practice of detecting vulnerabilities in an application, system, or organization's infrastructure.</span>
                                </li>
                            </ul>
                        </section>

                        {/* 3. Acceptance of Terms */}
                        <section id="acceptance" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-cyan-600 dark:text-cyan-400 opacity-50">03.</span>
                                Acceptance of Terms
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                The Service is offered subject to your acceptance without modification of all of the terms and conditions contained herein and all other operating rules, policies, and procedures that may be published from time to time on this Site by HTWTH.
                            </p>
                        </section>

                        {/* 4. Ethical Hacking Mandates */}
                        <section id="ethical-hacking" className="scroll-mt-24">
                            <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-6 rounded-r-xl">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                    <span className="text-red-600 dark:text-red-400 opacity-50">04.</span>
                                    Ethical Hacking Mandates
                                </h2>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 font-medium">
                                    This platform provides tools (including but not limited to payloads, cheat sheets, and Kali Linux integrations) strictly for educational and defensive purposes.
                                </p>
                                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 list-disc pl-5">
                                    <li>You agree to use the provided tools and resources <strong>only</strong> on systems you own or have explicit written permission to test.</li>
                                    <li>Any unauthorized use of these tools to attack, compromise, or disrupt systems without permission is illegal and strictly prohibited.</li>
                                    <li>HTWTH is not responsible for any damage caused by the misuse of the information or tools provided.</li>
                                    <li>Users found engaging in malicious activities will have their accounts terminated immediately and may be reported to relevant authorities.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 5. Account Security */}
                        <section id="account" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-violet-600 dark:text-violet-400 opacity-50">05.</span>
                                Account Security
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                You are responsible for safeguarding the password and Two-Factor Authentication (2FA) codes that you use to access the Service and for any activities or actions under your password.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                You agree not to disclose your password or backup codes to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                            </p>
                        </section>

                        {/* 6. Intellectual Property */}
                        <section id="intellectual-property" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-amber-600 dark:text-amber-400 opacity-50">06.</span>
                                Intellectual Property
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of HTWTH and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of HTWTH.
                            </p>
                        </section>

                        {/* 7. User Content License */}
                        <section id="user-content" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-emerald-600 dark:text-emerald-400 opacity-50">07.</span>
                                User Content License
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights.
                            </p>
                        </section>

                        {/* 8. Prohibited Conduct */}
                        <section id="prohibited" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-rose-600 dark:text-rose-400 opacity-50">08.</span>
                                Prohibited Conduct
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                You agree not to use the Service:
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <li className="flex gap-2">
                                    <span className="text-rose-500">•</span> In any way that violates any applicable national or international law.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-rose-500">•</span> To exploit, harm, or attempt to exploit or harm minors in any way.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-rose-500">•</span> To send, knowingly receive, upload, download, use, or re-use any material which does not comply with our content standards.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-rose-500">•</span> To transmit, or procure the sending of, any advertising or promotional material (spam).
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-rose-500">•</span> To impersonate or attempt to impersonate HTWTH, a HTWTH employee, another user, or any other person.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-rose-500">•</span> To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service.
                                </li>
                            </ul>
                        </section>

                        {/* 9. Warranties Disclaimer */}
                        <section id="disclaimer" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-orange-600 dark:text-orange-400 opacity-50">09.</span>
                                Warranties Disclaimer
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed uppercase font-medium text-xs tracking-wide border p-4 border-slate-200 dark:border-slate-800 rounded-lg">
                                YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. THE SERVICE IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT OR COURSE OF PERFORMANCE.
                            </p>
                        </section>

                        {/* 10. Limitation of Liability */}
                        <section id="liability" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-slate-600 dark:text-slate-400 opacity-50">10.</span>
                                Limitation of Liability
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                In no event shall HTWTH, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                            </p>
                        </section>

                        {/* 11. Privacy & Data */}
                        <section id="privacy" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-teal-600 dark:text-teal-400 opacity-50">11.</span>
                                Privacy & Data
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Our Privacy Policy governs the collection, use, and disclosure of your personal information. By using the Service, you consent to the collections and use of information as set forth in the Privacy Policy. We utilize secure encryption for passwords and 2FA secrets, and industry-standard security measures to protect your data.
                            </p>
                        </section>

                        {/* 12. Termination */}
                        <section id="termination" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-fuchsia-600 dark:text-fuchsia-400 opacity-50">12.</span>
                                Termination
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                            </p>
                        </section>

                        {/* 13. Governing Law */}
                        <section id="governing-law" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-indigo-600 dark:text-indigo-400 opacity-50">13.</span>
                                Governing Law
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                            </p>
                        </section>

                        {/* 14. Contact */}
                        <section id="contact" className="scroll-mt-24 pb-20">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-sky-600 dark:text-sky-400 opacity-50">14.</span>
                                Contact Us
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                If you have any questions about these Terms, please contact the administrator.
                            </p>
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6">
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</span>
                                    <a href="mailto:ragow49@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">ragow49@gmail.com</a>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Developer</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-semibold">Gowtham S</span>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};

export default CopyrightPage;

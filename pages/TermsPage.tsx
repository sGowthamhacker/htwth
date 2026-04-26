import React from 'react';
import { ArrowLeft, Scale, Gavel, CheckCircle, AlertTriangle, FileCheck, Terminal, Info } from 'lucide-react';
import { motion } from 'motion/react';

import Footer from '../components/Footer';

interface TermsPageProps {
  onNavigateHome: () => void;
  isDarkMode?: boolean;
  onAction?: () => void;
  onShowCopyright?: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onNavigateHome, isDarkMode, onAction, onShowCopyright }) => {
  return (
    <div className={`min-h-screen bg-white dark:bg-[#0a0a0a] font-sans transition-colors duration-300 text-slate-900 dark:text-slate-100 ${isDarkMode ? 'dark' : ''}`}>
      <header className="sticky top-0 w-full px-4 sm:px-8 py-4 flex justify-between items-center z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50">
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return</span>
        </button>
        
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider opacity-50">Legal Guidelines</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <Info className="w-3 h-3" />
            Last Updated: April 25, 2026
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6">
            Terms of Service
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
            By accessing the HTWTH platform, you agree to abide by these terms. We maintain a high standard of ethics for our security community.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-20">
            <div className="p-8 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-900/40 relative overflow-hidden group">
                <CheckCircle className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/5 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-green-500" />
                   The Dos
                </h3>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 flex-shrink-0" />
                        Always practice responsible and ethical disclosure.
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 flex-shrink-0" />
                        Respect intellectual property and original credit.
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 flex-shrink-0" />
                        Maintain a professional and inclusive environment.
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 flex-shrink-0" />
                        Verify authorship of your shared findings.
                    </li>
                </ul>
            </div>

            <div className="p-8 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-900/40 relative overflow-hidden group">
                <AlertTriangle className="absolute -right-4 -bottom-4 w-32 h-32 text-red-500/5 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                   <AlertTriangle className="w-5 h-5 text-red-500" />
                   The Don'ts
                </h3>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 flex-shrink-0" />
                        No sharing of live, unpatched zero-day exploits.
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 flex-shrink-0" />
                        No harassment, bullying, or hate speech.
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 flex-shrink-0" />
                        No unauthorized testing on HTWTH infrastructure.
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 flex-shrink-0" />
                        No distribution of malware or malicious payloads.
                    </li>
                </ul>
            </div>
        </div>

        <article className="prose dark:prose-invert max-w-none space-y-12 text-slate-600 dark:text-slate-400 font-medium">
          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-indigo-500" />
                </div>
                1. Acceptance of Terms and Lifecycle of Agreement
            </h2>
            <p className="mt-4 leading-relaxed">
               By accessing, browsing, or utilizing the HackToWriteToHack (HTWTH) digital ecosystem, including all subdomains, integrated tools, and community forums (cumulatively, the "Platform"), you signify your absolute and irrevocable agreement to be bound by these Terms of Service (the "Terms"). These Terms constitute a legally binding contractual agreement between you (the "User") and HTWTH.
            </p>
            <p className="mt-4 leading-relaxed text-sm">
               <strong>Eligibility and Registration:</strong> You must be at least 18 years of age, or the legal age of majority in your specific jurisdiction, to create an account and interact with the non-public sections of HTWTH. If you are using the Platform on behalf of a corporate entity, government body, or non-profit organization, you represent and warrant that you have the explicit legal authority to bind that entity to these Terms. HTWTH reserves the right to request proof of eligibility or authentication at any time and may suspend or terminate accounts that fail to meet these criteria without prior notice.
            </p>
            <p className="mt-4 leading-relaxed text-sm">
               <strong>Modification:</strong> We reserve the right to modify these Terms at any time. Significant changes will be communicated via the platform notifications or email. Your continued use of the platform after such modifications constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-indigo-500" />
                </div>
                2. Code of Professional Conduct and Operational Boundaries
            </h2>
            <p className="mt-4 leading-relaxed">
              HTWTH is a sanctuary for cybersecurity professionals, bug bounty hunters, and enthusiasts focused on ethical research. To maintain the integrity and safety of our community, all users must adhere to the following professional code of conduct:
            </p>
            <div className="mt-6 space-y-4 text-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-l-4 border-indigo-500">
                <h4 className="font-bold mb-1">Ethical Boundary Enforcements</h4>
                <p>Knowledge acquired, shared, or demonstrated on this platform must never be used to facilitate unauthorized access or cause intentional harm to third-party systems. Users found utilizing HTWTH resources for illicit "Black Hat" activities, including but not limited to ransomware distribution, unauthorized data exfiltration, or denial-of-service attacks, will face permanent expulsion and potential referral to global law enforcement agencies.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-l-4 border-indigo-500">
                <h4 className="font-bold mb-1">Infrastructure Integrity and Anti-Abuse</h4>
                <p>Under no circumstances are users permitted to perform stress testing, fuzzing, or vulnerability scanning against the HTWTH infrastructure itself without explicit, written authorization from our Security Operations Center (SOC). Our platform includes safety mechanisms to detect and block abusive technical behavior. Repeated attempts to bypass these security controls will result in account suspension and blacklisting of associated network identifiers.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-l-4 border-indigo-500">
                <h4 className="font-bold mb-1">Collaborative Professionalism</h4>
                <p>HTWTH is committed to a harassment-free experience for everyone. We strictly prohibit discrimination, hate speech, bullying, or targeted harassment based on technical proficiency, background, gender identity, or personal origin. Our community thrives on mutual respect and the free exchange of legitimate security insights.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <FileCheck className="w-4 h-4 text-indigo-500" />
                </div>
                3. Intellectual Sovereignty and Content Licensing
            </h2>
            <p className="mt-4 leading-relaxed">
              We respect your intellectual property rights. When you create content—including writeups, security tools, analysis scripts, or personal notes—on HTWTH, you retain full ownership of that content. However, to operate the Platform effectively and reliably, we require certain non-exclusive permissions:
            </p>
            <p className="mt-4 leading-relaxed text-sm">
              <strong>License Grant to HTWTH:</strong> By submitting or publishing content on the Platform, you grant HTWTH a perpetual, non-exclusive, sub-licensable, worldwide, and royalty-free license to host, cache, store, and display your content strictly for the purpose of operating, maintaining, and protecting the Platform. This license does not grant us the right to sell your research content as standalone products without your express written consent.
            </p>
            <p className="mt-4 leading-relaxed text-sm italic">
              <strong>Authorship and Warranty:</strong> You represent that you have all necessary rights to grant this license and that your content does not infringe upon any third-party intellectual property or confidentiality agreements (e.g., NDA-protected bug bounty findings). You agree to indemnify HTWTH against any claims arising from your breach of third-party IP rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-indigo-500" />
                </div>
                4. Disclaimers, Warranties, and Limitation of Liability
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed">
              <p>
                <strong>"As-Is" Service Standard:</strong> THE PLATFORM AND ALL RELATED TOOLS AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. HTWTH DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT THE PLATFORM WILL ALWAYS BE SECURE, ERROR-FREE, OR UNINTERRUPTED.
              </p>
              <p>
                <strong>Inherent Research Risks:</strong> CYBERSECURITY RESEARCH INVOLVES INHERENT RISKS TO SYSTEMS AND DATA. HTWTH SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM THE USE OF INFORMATION, TOOLS, OR PAYLOADS SHARED ON THE PLATFORM, INCLUDING BUT NOT LIMITED TO DATA LOSS, SYSTEM COMPROMISE, OR LEGAL REPERCUSSIONS INCURRED BY THE USER IN EXTERNAL OR UNAUTHORIZED ENVIRONMENTS. YOU USE THE PLATFORM AT YOUR OWN RISK.
              </p>
              <p>
                <strong>Liability Ceiling:</strong> TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, HTWTH\'S TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE USE OF THE PLATFORM SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY THE USER TO HTWTH IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR $100.00 USD, WHICHEVER IS GREATER.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-indigo-500" />
                </div>
                5. DMCA and Intellectual Property Protection
            </h2>
            <p className="mt-4 leading-relaxed text-sm">
                HTWTH complies with the Digital Millennium Copyright Act (DMCA). If you believe that any content on our platform infringes upon your copyright, please submit a formal takedown notice to our registered agent at <span className="text-indigo-600 dark:text-indigo-400 font-bold">ragow49@gmail.com</span>. Your notice must include a physical or electronic signature, identification of the infringed work, and your contact information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-indigo-500" />
                </div>
                6. Governing Law, Jurisdiction, and Arbitration
            </h2>
            <p className="mt-4 leading-relaxed text-sm">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which HTWTH is headquartered, without regard to its conflict of law principles. You agree that any dispute arising out of these terms shall be settled through binding individual arbitration, and you waive your right to participate in a class-action lawsuit.
            </p>
          </section>

          <section className="p-8 bg-indigo-600 rounded-[2.5rem] text-white relative overflow-hidden">
            <Gavel className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10" />
            <h2 className="text-2xl font-black mb-4">Termination Logic</h2>
            <p className="text-indigo-100 leading-relaxed mb-6 font-medium">
              HTWTH reserves the unilateral right, in its sole discretion and without prior notice, to terminate your access to the platform and associated services for any reason, particularly for material breaches of these Terms or for conduct that threatens the safety of our users or infrastructure.
            </p>
            <button 
               onClick={onNavigateHome}
               className="px-6 py-3 bg-white text-indigo-600 rounded-xl text-sm font-bold shadow-xl shadow-indigo-900/20 active:scale-95 transition-all"
            >
                Accept and Continue
            </button>
          </section>
        </article>
      </main>

      <Footer 
        onAction={onAction}
        onShowCopyright={onShowCopyright}
      />
    </div>
  );
};

export default TermsPage;

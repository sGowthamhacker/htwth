import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText, Globe, Mail, Clock } from 'lucide-react';
import { motion } from 'motion/react';

import Footer from '../components/Footer';

interface PrivacyPageProps {
  onNavigateHome: () => void;
  isDarkMode?: boolean;
  onAction?: () => void;
  onShowCopyright?: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigateHome, isDarkMode, onAction, onShowCopyright }) => {
  console.log("PrivacyPage onAction:", onAction);
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
          <Shield className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider opacity-50">Trust & Safety</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <Clock className="w-3 h-3" />
            Last Updated: April 25, 2026
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6">
            Privacy Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
            Your data is your property. At HTWTH, we build with security and transparency at our core. This policy explains what happens to your information when you use our ecosystem.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-20 text-center">
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem]">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Eye className="w-6 h-6 text-indigo-500" />
                </div>
                <h4 className="font-bold text-sm mb-2">Full Transparency</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Strict disclosure of all data processing activities.</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem]">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Lock className="w-6 h-6 text-indigo-500" />
                </div>
                <h4 className="font-bold text-sm mb-2">Encryption First</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">End-to-end security for your sensitive research.</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem]">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Globe className="w-6 h-6 text-indigo-500" />
                </div>
                <h4 className="font-bold text-sm mb-2">Global Rights</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Honoring GDPR, CCPA, and global privacy standards.</p>
            </div>
        </div>

        <article className="prose dark:prose-invert max-w-none space-y-12 text-slate-600 dark:text-slate-400 font-medium">
          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-indigo-500" />
                </div>
                1. Full Spectrum of Information Collection
            </h2>
            <p className="mt-4 leading-relaxed">
              At HackToWriteToHack (HTWTH), we adhere to the principle of data minimization. We only collect the information that is strictly necessary to provide our innovative research ecosystem services. This information collection is categorized into primary pillars that ensure transparency and user control.
            </p>
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2">A. Personal Identification Data</h3>
                <p className="text-sm leading-relaxed">
                  When you register for an account, we collect your name, email address, and authentication credentials. These are used uniquely for account management and security verification. We utilize industry-standard authentication providers like Google and GitHub to ensure your passwords and sensitive access tokens are never stored directly on our servers in readable formats. By using these third-party OIDC providers, we reduce our footprint on your sensitive data while maintaining a high security bar.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2">B. Professional and Research Content</h3>
                <p className="text-sm leading-relaxed">
                  Your writeups, findings, payloads, and research metadata are the core of your experience. While you retain full ownership of your intellectual property, we store this data to facilitate your access across multiple devices and to allow for collaborative features like shared workspaces and peer review. Any content you mark as "Private" remains encrypted and inaccessible to other users. We use Row-Level Security (RLS) on our databases to ensure that even a software bug cannot leak your private findings to other users.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2">C. Technical and Usage Telemetry</h3>
                <p className="text-sm leading-relaxed">
                  To maintain the security and performance of our infrastructure, we automatically collect certain technical data through server logs and integrated diagnostics. This includes your IP address, browser type, operating system, and interaction logs. This information is critical for identifying potential security threats, such as brute-force attacks, credential stuffing, or unauthorized scraping attempts, and for optimizing the platform\'s user interface based on user flow analysis.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-indigo-500" />
                </div>
                2. Data Processing and Optimization Strategies
            </h2>
            <p className="mt-4 leading-relaxed">
              We process your data primarily to fulfill our contractual obligations to you and to pursue our legitimate interest in providing a secure, reliable research platform. We do not sell your data to third parties, nor do we use your research findings for target advertising.
            </p>
            <ul className="list-disc pl-6 space-y-3 mt-4 text-sm">
              <li><strong>Service Provisioning:</strong> Ensuring your dashboard, private notes, and published writeups are synchronized and available whenever you need them across our globally distributed edge nodes.</li>
              <li><strong>Ecosystem Security:</strong> Implementing advanced threat detection algorithms that analyze usage patterns to prevent account takeovers and protect our user community from malicious actors.</li>
              <li><strong>Product Evolution:</strong> Analyzing aggregated, non-identifiable usage data to understand which tools are most valuable and where we should focus our future development efforts to improve the hacker experience.</li>
              <li><strong>Communication:</strong> Sending critical security alerts, such as multi-factor authentication codes, recovery keys, or notifications of login attempts from unrecognized locations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-indigo-500" />
                </div>
                3. Your Sovereign Privacy Rights (GDPR & CCPA)
            </h2>
            <p className="mt-4 leading-relaxed">
              Irrespective of your location, HTWTH respects your rights to control your digital footprint. We align our practices with the highest global standards, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
            </p>
            <div className="grid sm:grid-cols-2 gap-6 mt-8">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">The Right to Access</h4>
                <p className="text-xs leading-relaxed">You have the right to request a full disclosure of the data categories we collect and a portable copy of your specific data. We provide self-service tools in the settings menu to facilitate this.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">The Right to Correction</h4>
                <p className="text-xs leading-relaxed">Accuracy is paramount. You can update your profile information, research content, and communication preferences at any time. If you find data that is incorrigible by self-service, our DPO is available to help.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">The Right to Deletion</h4>
                <p className="text-xs leading-relaxed">You have the "right to be forgotten." Upon request, we will permanently delete your account and all associated research content, purging it from our primary databases and backup cycles.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Processing Restrictions</h4>
                <p className="text-xs leading-relaxed">You have the right to object to or restrict certain types of data processing, particularly those related to optional telemetry or non-essential communications.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-indigo-500" />
                </div>
                4. Data Retention and International Transfers
            </h2>
            <p className="mt-4 leading-relaxed">
              We retain your personal data only for as long as is necessary to provide you with our services. If your account remains inactive for a period exceeding 24 months, we will reach out to verify if you wish to keep your data alive. By default, writeups that contribute to the community knowledge base are retained unless you choose to delete them upon account closure.
            </p>
            <p className="mt-4 leading-relaxed">
              HTWTH operates using a distributed cloud infrastructure. Consequently, your data may be transferred to and processed in countries other than your own. We ensure that appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs), to guarantee that your data receives a level of protection equivalent to that of your home jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-indigo-500" />
                </div>
                5. Cookie Policy and Web Storage
            </h2>
            <p className="mt-4 leading-relaxed">
              To provide a seamless experience, especially for our desktop-in-browser interface, we use Local Storage and Cookies. These are divided into:
            </p>
            <ul className="list-disc pl-6 space-y-3 mt-4 text-sm">
              <li><strong>Essential:</strong> Used for authentication, session management, and remembering your layout preferences (window positions, theme).</li>
              <li><strong>Functional:</strong> Used to temporarily cache your work-in-progress writeups to prevent data loss in case of a network failure.</li>
              <li><strong>Analytics:</strong> Optional cookies that help us understand platform performance. You can opt-out of these in the "Security & Privacy" tab of the platform settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-indigo-500" />
                </div>
                6. Security of Your Information
            </h2>
            <p className="mt-4 leading-relaxed">
              We implement a multi-layered security approach to protect your data. This includes:
            </p>
            <div className="mt-4 p-6 border border-indigo-500/20 rounded-2xl bg-indigo-500/5 text-sm leading-relaxed">
              All data transmitted between your browser and our servers is encrypted using Transport Layer Security (TLS 1.3). At rest, your data is encrypted using AES-256 standards. We conduct regular penetration tests on our own infrastructure to identify and patch vulnerabilities before they can be exploited. Furthermore, we encourage our community to report any security findings through our coordinated disclosure program.
            </div>
          </section>

          <section className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" />
                Contact Our Privacy Team
            </h2>
            <p className="text-sm leading-relaxed mb-6">
              If you have any remaining questions about how we handle your data, or if you wish to exercise your legal rights regarding your personal information, please reach out to our dedicated privacy desk. We aim to respond to all formal requests within 72 business hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:ragow49@gmail.com" className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform text-center">
                    ragow49@gmail.com
                </a>
                <button 
                  onClick={onNavigateHome}
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
                >
                    Submit DSR Request
                </button>
            </div>
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

export default PrivacyPage;

import React from 'react';
import { ArrowLeft, Shield, Lock, Zap, Cpu, Server, Fingerprint, Eye, EyeOff, Key } from 'lucide-react';
import { motion } from 'motion/react';

import Footer from '../components/Footer';

interface SecurityPageProps {
  onNavigateHome: () => void;
  isDarkMode?: boolean;
  onAction?: () => void;
  onShowCopyright?: () => void;
}

const SecurityPage: React.FC<SecurityPageProps> = ({ onNavigateHome, isDarkMode }) => {
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
          <Zap className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider opacity-50">Hardened Infra</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-16 sm:mb-24">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/40 transform -rotate-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-7xl font-black tracking-tighter mb-6">
            Our Security Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
            Security isn't a feature; it's our foundation. We employ multi-layered defenses to protect your research and identity.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
           {[
             { title: 'Data Encryption', desc: 'AES-256 for data at rest and TLS 1.3 for data in transit.', icon: Key },
             { title: 'Identity Guard', desc: 'Secure auth via Firebase with optional TOTP MFA.', icon: Fingerprint },
             { title: 'Real-time Audit', desc: 'Every administrative action is logged and audited.', icon: Eye },
             { title: 'Zero Privilege', desc: 'Strict RBAC to ensure minimal access to sensitive data.', icon: Lock },
             { title: 'Network Armor', desc: 'DDoS protection and hardened CDN edge cases.', icon: Server },
             { title: 'Privacy Tech', desc: 'Pseudonymization of research metadata by default.', icon: EyeOff },
           ].map((pillar, i) => (
             <div key={i} className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm">
                   <pillar.icon className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">{pillar.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{pillar.desc}</p>
             </div>
           ))}
        </div>

        <section className="space-y-16">
          <div className="bg-slate-900 dark:bg-white rounded-[3rem] p-8 sm:p-16 text-white dark:text-slate-900 relative overflow-hidden">
             <div className="max-w-xl relative z-10">
                <h2 className="text-3xl sm:text-4xl font-black mb-6">Security Incident Response Protocol</h2>
                <p className="text-slate-400 dark:text-slate-500 text-sm mb-8 leading-relaxed">
                  We maintain a rigorous Incident Response (IR) plan designed to contain, investigate, and remediate any potential security breaches with maximum efficiency. Our team follows the NIST Cybersecurity Framework (SP 800-61), ensuring that we are prepared to <strong>Identify, Protect, Detect, Respond, and Recover</strong> from any adversary action. In the event of a suspected vulnerability or breach, our distributed SOC is alerted instantly to begin the containment phase.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="mailto:ragow49@gmail.com" className="px-8 py-4 bg-indigo-600 dark:bg-indigo-500 rounded-2xl font-bold hover:scale-105 transition-transform text-center shadow-lg shadow-indigo-500/30">
                    Report Vulnerability
                  </a>
                  <button 
                    onClick={onNavigateHome}
                    className="px-8 py-4 bg-white/10 dark:bg-slate-100 rounded-2xl font-bold hover:bg-white/20 dark:hover:bg-slate-200 transition-colors"
                  >
                    Vulnerability Policy
                  </button>
                </div>
             </div>
             <Shield className="absolute -right-12 -bottom-12 w-96 h-96 opacity-10" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center px-4">
             <div>
                <h2 className="text-2xl font-bold mb-4">Hardened Infrastructure Architecture</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  Our ecosystem is built upon a "Defense in Depth" philosophy. We don\'t rely on a single defensive layer; instead, we implement overlapping security controls at every level of our stack, from our edge ingress points down to our cold-storage database layers. Every component is treated as untrusted until validated.
                </p>
                <ul className="space-y-4">
                   {[
                     'Identity-Aware Proxy (IAP) for administrative interface access to prevent credential theft.',
                     'End-to-end TLS 1.3 encryption for all data movement within our internal VPC network.',
                     'Immutable infrastructure patterns where servers are replaced rather than updated manually.',
                     'Automated daily dependency scanning for known CVEs using integrated supply-chain analysis.',
                     'Serverless execution environments providing hardware-level process isolation for user scripts.',
                     'Strict Content Security Policies (CSP) to mitigate Cross-Site Scripting (XSS) and data injection.',
                     'Regular automated static analysis (SAST) and dynamic analysis (DAST) in our CI/CD pipelines.'
                   ].map((item, i) => (
                     <li key={i} className="flex items-start gap-3 text-sm font-medium">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                     </li>
                   ))}
                 </ul>
             </div>
             <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[3rem] relative overflow-hidden flex items-center justify-center aspect-square shadow-inner transition-transform hover:rotate-3 duration-1000">
                <div className="relative z-10 text-center">
                  <Cpu className="w-24 h-24 text-indigo-500 mx-auto mb-4 animate-[pulse_3s_infinite]" />
                  <p className="text-[10px] font-mono text-indigo-400 dark:text-indigo-600 uppercase tracking-widest font-bold">Hardened Kernel Isolation v5</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                <div className="absolute top-0 right-0 p-8">
                   <Lock className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <h2 className="text-2xl font-bold text-center">Secure Software Development Lifecycle (SDLC)</h2>
             <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
               We treat code as our most vital asset. Before any line of code reaches production, it undergoes a multi-stage verification process including peer review, automated security testing, and integration validation.
             </p>
             <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-8 border border-slate-100 dark:border-slate-800 rounded-3xl group hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                   <Key className="w-8 h-8 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h4 className="font-bold mb-2">Advanced Multi-Factor Authentication</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      We support modern authentication methods including WebAuthn (Security Keys), TOTP (Authenticator Apps), and SMS-based 2FA. We strongly recommend that all security researchers enable hardware-based MFA for the highest level of account protection against phishing and session duplication.
                   </p>
                </div>
                <div className="p-8 border border-slate-100 dark:border-slate-800 rounded-3xl group hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                   <Fingerprint className="w-8 h-8 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h4 className="font-bold mb-2">Cryptographic Integrity and Hashing</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      We never store plain-text passwords or sensitive keys. All authentication data is processed using salted, compute-intensive hashing algorithms like Argon2 or scrypt, ensuring that even in the unlikely event of a database compromise, user credentials remain secure against brute-force attacks.
                   </p>
                </div>
             </div>
          </div>

          <div className="p-12 bg-indigo-50 dark:bg-indigo-500/5 rounded-[4rem] border border-indigo-100 dark:border-indigo-500/20 text-center">
              <h2 className="text-2xl font-black mb-4">Continuance and Compliance</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
                Our commitment to security is ongoing. We conduct annual third-party audits and maintain compliance with industry standards relevant to cloud infrastructure and data privacy. Your trust is our most valuable asset, and we work tirelessly to deserve it every day.
              </p>
              <div className="flex justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                  <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700">SOC 2 TYPE II COMPLIANT</div>
                  <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700">ISO 27001 READY</div>
              </div>
          </div>
        </section>
      </main>

      <Footer 
        onAction={onAction}
        onShowCopyright={onShowCopyright}
      />
    </div>
  );
};

const CheckCircle = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default SecurityPage;

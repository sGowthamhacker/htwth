import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';

interface LandingPricingSectionProps {
  onGetStarted: () => void;
}

export const LandingPricingSection: React.FC<LandingPricingSectionProps> = ({ onGetStarted }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      name: 'Community Free',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      period: 'forever',
      badge: 'Starter',
      description: 'Ideal for researchers drafting public vulnerability writeups & portfolios.',
      features: [
        'Interactive Writeup Studio',
        'Public Portfolio Hosting',
        'Community Forum Access',
        'Standard PDF Export',
        'CVSS v3.1 Score Calculator'
      ],
      buttonText: 'Get Started Free',
      highlight: false,
      ctaAction: onGetStarted
    },
    {
      name: 'Researcher Pro',
      monthlyPrice: '$19',
      yearlyPrice: '$15',
      period: 'per month',
      badge: 'Popular',
      description: 'For active bug hunters needing automated AI writeup enhancement & templates.',
      features: [
        'Everything in Free',
        'AI Remediation Assistant',
        'Unlimited Private Writeups',
        'Custom Domain Binding',
        'Export to Word & PDF',
        'Priority Support'
      ],
      buttonText: 'Start 14-Day Free Trial',
      highlight: true,
      ctaAction: onGetStarted
    },
    {
      name: 'Red Team Squad',
      monthlyPrice: '$49',
      yearlyPrice: '$39',
      period: 'per month',
      badge: 'Pro Toolkit',
      description: 'Advanced real-time collaborative workspace for pentest agencies and security teams.',
      features: [
        'Everything in Pro',
        'Cloud Kali Terminal Sync',
        'Automated Payload Library',
        'Real-time Multi-user Canvas',
        'API & Webhook Integrations',
        'Team Member Access Controls'
      ],
      buttonText: 'Upgrade to Squad',
      highlight: false,
      ctaAction: onGetStarted
    },
    {
      name: 'Enterprise / RedSec',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      period: 'tailored',
      badge: 'Enterprise',
      description: 'Dedicated isolated cloud deployment with SAML SSO, SLA, and audit logs.',
      features: [
        'Dedicated On-Prem or Cloud Isolation',
        'SAML SSO / Hardware MFA Keys',
        'Custom Executive SLA & Support',
        'Automated NVD & CVE Sync',
        'Custom Branding & Contracts'
      ],
      buttonText: 'Contact Security Team',
      highlight: false,
      ctaAction: onGetStarted
    }
  ];

  return (
    <div className="animate-fade-in py-20 w-full px-4 sm:px-6 max-w-7xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-full border border-indigo-100 dark:border-indigo-900/40">
          [ TRANSPARENT PRICING ]
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Flexible Plans for Every Researcher
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Scale your security workspace effortlessly. Cancel or switch plans anytime.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span
            className={`text-xs font-bold ${
              billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'
            }`}
          >
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 bg-indigo-600 rounded-full p-1 relative transition-colors focus:outline-none"
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-bold ${
                billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}
            >
              Annual Billing
            </span>
            <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/40">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative flex flex-col p-6 rounded-3xl border transition-all duration-300 ${
              plan.highlight
                ? 'bg-slate-900 dark:bg-slate-950 text-white border-indigo-500 shadow-2xl ring-2 ring-indigo-500/50 scale-[1.02]'
                : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Most Popular
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  plan.highlight
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {plan.badge}
              </span>
            </div>

            <p
              className={`text-xs mb-6 min-h-[36px] leading-relaxed ${
                plan.highlight ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {plan.description}
            </p>

            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight">
                {billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
              </span>
              <span
                className={`text-xs font-mono ${
                  plan.highlight ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                /{plan.period}
              </span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-start text-xs font-medium">
                  <Check
                    className={`w-4 h-4 shrink-0 mr-2.5 mt-0.5 ${
                      plan.highlight ? 'text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  />
                  <span className={plan.highlight ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={plan.ctaAction}
              className={`w-full py-3 rounded-2xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${
                plan.highlight
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30 shadow-lg'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
              }`}
            >
              <span>{plan.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPricingSection;

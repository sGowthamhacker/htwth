export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    category: string;
    description: string;
    format: 'html' | 'markdown';
    body: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'blog_showcase',
        name: 'Latest Blog Posts Showcase 📰',
        subject: '📰 Latest Tech & Security Blogs from HackToWriteToHack',
        category: 'Blog & Research',
        description: 'Dynamically fetches and displays the latest 3 published blog posts from the platform.',
        format: 'html',
        body: `<div style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 22px 18px; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 22px 20px; border-radius: 10px; color: #ffffff; text-align: left; margin-bottom: 20px;">
    <div style="display: inline-block; background-color: rgba(99, 102, 241, 0.2); border: 1px solid #6366f1; color: #a5b4fc; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; margin-bottom: 8px;">
      BLOG DISPATCH
    </div>
    <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 6px 0; color: #ffffff;">Latest Insights & Research Blogs</h1>
    <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5;">Handpicked articles and technical commentary from our research engineering team.</p>
  </div>

  <!-- Dynamic Blog List Placeholder -->
  <div style="margin-bottom: 20px;">
    [BLOG_LIST]
  </div>

  <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
    <a href="[APP_URL]/#/blogs" style="background-color: #4f46e5; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 24px; border-radius: 6px; display: inline-block;">
      Browse All Blogs on Platform &rarr;
    </a>
  </div>
</div>`
    },
    {
        id: 'writeup_roundup',
        name: 'Security Writeup Roundup 📝',
        subject: '📝 Fresh Security Writeups & Exploit Reports Released',
        category: 'Blog & Research',
        description: 'Dynamically fetches the latest 3 vulnerability writeups and exploit reports from the database.',
        format: 'html',
        body: `<div style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 22px 18px; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">
  <!-- Header -->
  <div style="background-color: #0f172a; padding: 22px 20px; border-radius: 10px; color: #ffffff; margin-bottom: 20px;">
    <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; margin-bottom: 8px;">
      WRITEUP DISPATCH
    </div>
    <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 6px 0; color: #ffffff;">Newly Published Security Writeups</h1>
    <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5;">Detailed vulnerability breakdowns, PoC analysis, and defensive remediations.</p>
  </div>

  <!-- Dynamic Writeups Placeholder -->
  <div style="margin-bottom: 20px;">
    [WRITEUP_LIST]
  </div>

  <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
    <a href="[APP_URL]/#/writeups" style="background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 24px; border-radius: 6px; display: inline-block;">
      Explore Full Writeups Archive &rarr;
    </a>
  </div>
</div>`
    },
    {
        id: 'monthly_platform_newsletter',
        name: 'Community Newsletter Dispatch 📧',
        subject: '📧 HackToWriteToHack Monthly Community Newsletter',
        category: 'Newsletter & Content',
        description: 'Combines latest blogs, recent writeups, and live platform metrics in one comprehensive issue.',
        format: 'html',
        body: `<div style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 22px 18px; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">
  <!-- Newsletter Banner -->
  <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 24px 20px; border-radius: 10px; color: #ffffff; text-align: center; margin-bottom: 20px;">
    <div style="color: #a5b4fc; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">MONTHLY EDITION</div>
    <h1 style="font-size: 21px; font-weight: 800; margin: 0 0 6px 0; color: #ffffff;">Security Community Bulletin</h1>
    <p style="font-size: 13px; color: #c7d2fe; margin: 0;">Stay informed with curations from our research network.</p>
  </div>

  <!-- Platform Stats Block -->
  <div style="margin-bottom: 20px;">
    [APP_STATS]
  </div>

  <!-- Section Title -->
  <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 20px 0 12px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
    🔥 Featured Blog Research
  </h3>
  <div style="margin-bottom: 20px;">
    [BLOG_LIST]
  </div>

  <!-- Section Title -->
  <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 24px 0 12px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
    🛡️ Verified Exploit Writeups
  </h3>
  <div style="margin-bottom: 20px;">
    [WRITEUP_LIST]
  </div>

  <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 20px;">
    <a href="[APP_URL]" style="background-color: #4f46e5; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 26px; border-radius: 6px; display: inline-block;">
      Launch Security Research Hub &rarr;
    </a>
  </div>
</div>`
    },
    {
        id: 'cyberpunk_dark',
        name: 'Cyberpunk Security Briefing 🛡️',
        subject: '🔒 Urgent Intelligence Briefing: Platform Advisory',
        category: 'Security & Ops',
        description: 'Dark-mode high-tech layout with glowing accents, metric cards, and primary CTA button.',
        format: 'html',
        body: `<div style="background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 22px 18px; color: #e2e8f0; border-radius: 12px; border: 1px solid #1e293b;">
  <!-- Header Banner -->
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
    <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.5px;">SECURITY RESEARCH HUB</h1>
    <p style="color: #e0e7ff; font-size: 12px; margin: 0; font-weight: 500;">Threat Intelligence & Vulnerability Dispatch</p>
  </div>

  <!-- Body Content -->
  <div style="padding: 4px 8px;">
    <div style="display: inline-block; background-color: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #f87171; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">
      CRITICAL ADVISORY
    </div>
    
    <h2 style="color: #f8fafc; font-size: 17px; font-weight: 700; margin: 0 0 10px 0;">Infrastructure Security Sync Complete</h2>
    
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 18px 0;">
      Our automated defense sensors detected elevated reconnaissance traffic targeting perimeter API endpoints. Countermeasures have been activated successfully across all regional clusters.
    </p>

    <!-- Metric Card Grid -->
    [APP_STATS]

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 20px 0 16px 0;">
      <a href="[APP_URL]/#/admin" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 24px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);">
        View System Logs &rarr;
      </a>
    </div>
  </div>
</div>`
    },
    {
        id: 'glassmorphic_update',
        name: 'Modern Platform Release 🚀',
        subject: '🚀 Platform Release v2.5: AI Sandbox & HTML Live Preview',
        category: 'Updates & Features',
        description: 'Sleek indigo card design with feature checklists, code badges, and call-to-action button.',
        format: 'html',
        body: `<div style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 22px 18px; color: #334155; border-radius: 12px; border: 1px solid #e2e8f0;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 22px 20px; border-radius: 10px; text-align: left; color: #ffffff; margin-bottom: 20px;">
    <div style="display: inline-block; background-color: rgba(99, 102, 241, 0.25); border: 1px solid #6366f1; color: #a5b4fc; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-bottom: 8px;">
      MAJOR RELEASE
    </div>
    <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 6px 0; color: #ffffff;">Version 2.5 is Official!</h1>
    <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">Powerful new tools and live preview capabilities are active on your workspace.</p>
  </div>

  <!-- Content -->
  <div style="padding: 4px 8px;">
    <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Key Feature Highlights:</h3>
    
    <div style="margin-bottom: 12px;">
      <strong style="color: #1e293b; font-size: 13px;">✓ Interactive HTML & CSS Sandbox:</strong>
      <p style="margin: 2px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">Live rendering engine for custom templates, web badges, and interactive components.</p>
    </div>

    <div style="margin-bottom: 12px;">
      <strong style="color: #1e293b; font-size: 13px;">✓ Instant Markdown Live Preview:</strong>
      <p style="margin: 2px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">Supports GitHub Flavored Markdown, soft breaks, and real-time word stats.</p>
    </div>

    <div style="margin-bottom: 18px;">
      <strong style="color: #1e293b; font-size: 13px;">✓ Refined Responsive Themes:</strong>
      <p style="margin: 2px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">Smooth theme transitions, dark mode support, and mobile-optimized layouts.</p>
    </div>

    <div style="background-color: #f1f5f9; border-left: 3px solid #4f46e5; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 18px;">
      <p style="margin: 0; color: #475569; font-size: 12px; line-height: 1.5; font-style: italic;">
        "This update brings developer productivity tools right inside the research workspace."
      </p>
    </div>

    <div style="text-align: center; margin-top: 18px;">
      <a href="[APP_URL]/#/tools" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 6px; display: inline-block;">
        Open Innovation Lab Tools &rarr;
      </a>
    </div>
  </div>
</div>`
    },
    {
        id: 'executive_advisory',
        name: 'Executive Security Advisory ⚠️',
        subject: '⚠️ Security Advisory: Action Required for Account Administrators',
        category: 'Security & Ops',
        description: 'Clean executive warning layout with alert banner, vulnerability details table, and compliance checklist.',
        format: 'html',
        body: `<div style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px 16px; color: #1e293b; border-radius: 12px; border: 1px solid #cbd5e1;">
  <div style="background-color: #fef2f2; border-bottom: 2px solid #ef4444; padding: 16px 18px; border-radius: 8px 8px 0 0; margin-bottom: 16px;">
    <div style="color: #dc2626; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px;">HIGH SEVERITY ADVISORY</div>
    <h1 style="color: #991b1b; font-size: 17px; font-weight: 700; margin: 0;">Multi-Factor Authentication Policy Upgrade</h1>
  </div>

  <div style="padding: 4px 8px;">
    <p style="color: #334155; font-size: 13px; line-height: 1.6; margin: 0 0 12px 0;">
      Dear Administrator,
    </p>
    <p style="color: #334155; font-size: 13px; line-height: 1.6; margin: 0 0 16px 0;">
      As part of our commitment to maintaining strict zero-trust standards, all privileged accounts are scheduled for an upgraded security verification audit.
    </p>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 16px; font-size: 12px;">
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-weight: bold; color: #475569; width: 35%;">Affected Scope:</td>
        <td style="padding: 8px 12px; color: #0f172a;">Admin & Researcher Portals</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-weight: bold; color: #475569;">Recommended Action:</td>
        <td style="padding: 8px 12px; color: #0f172a;">Verify 2FA TOTP secret key</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-weight: bold; color: #475569;">Effective Date:</td>
        <td style="padding: 8px 12px; color: #dc2626; font-weight: bold;">Immediate Activation</td>
      </tr>
    </table>

    <div style="margin: 18px 0 12px 0; text-align: left;">
      <a href="[APP_URL]/#/settings" style="background-color: #dc2626; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 9px 18px; border-radius: 6px; display: inline-block;">
        Review Security Settings &rarr;
      </a>
    </div>

    <p style="color: #64748b; font-size: 11px; margin-top: 18px; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
      If you did not expect this notice, please contact the Security Operations Center at gowlearner04@gmail.com immediately.
    </p>
  </div>
</div>`
    },
    {
        id: 'vip_verification',
        name: 'VIP Researcher Gold Verification 🏆',
        subject: '🏆 Account Status Upgraded: Verified Security Researcher Badge',
        category: 'Account & VIP',
        description: 'Gold-accented luxury template with verified researcher seal, unlocked access checklist, and portal access key.',
        format: 'html',
        body: `<div style="background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px 16px; color: #c9d1d9; border-radius: 12px; border: 1px solid #30363d;">
  <div style="text-align: center; padding: 12px 8px;">
    <div style="display: inline-block; background-color: rgba(245, 158, 11, 0.15); border: 2px solid #f59e0b; border-radius: 50%; width: 56px; height: 56px; line-height: 52px; font-size: 26px; margin-bottom: 12px;">
      🏆
    </div>

    <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 6px 0;">Researcher Verification Confirmed!</h1>
    <p style="color: #8b949e; font-size: 13px; margin: 0 0 20px 0;">Your profile has been elevated to <strong style="color: #f59e0b;">Verified Security Specialist</strong> status.</p>

    <div style="background-color: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 16px; text-align: left; margin-bottom: 20px;">
      <h4 style="color: #f59e0b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px 0;">Unlocked Privilege Tier:</h4>
      
      <div style="color: #e6edf3; font-size: 12px; margin-bottom: 8px;">
        <span style="color: #10b981; font-weight: bold; margin-right: 6px;">✦</span> Restricted Bounty Submissions & Exploit Intelligence
      </div>
      <div style="color: #e6edf3; font-size: 12px; margin-bottom: 8px;">
        <span style="color: #10b981; font-weight: bold; margin-right: 6px;">✦</span> Interactive HTML & CSS Live Tool Dispatchers
      </div>
      <div style="color: #e6edf3; font-size: 12px;">
        <span style="color: #10b981; font-weight: bold; margin-right: 6px;">✦</span> Direct Priority Communication with Hub Core Team
      </div>
    </div>

    <a href="[APP_URL]/#/writeups" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000; font-size: 13px; font-weight: 800; text-decoration: none; padding: 10px 26px; border-radius: 6px; display: inline-block;">
      Enter Verified Portal &rarr;
    </a>
  </div>
</div>`
    },
    {
        id: 'system_maintenance',
        name: 'Scheduled Infrastructure Maintenance 🛠️',
        subject: '🛠️ Scheduled System Maintenance Window',
        category: 'Maintenance & Operations',
        description: 'Clean amber maintenance layout with timeline breakdown and status details.',
        format: 'html',
        body: `<div style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px 16px; color: #334155; border-radius: 12px; border: 1px solid #e2e8f0;">
  <div style="background-color: #fffbeb; border-bottom: 2px solid #f59e0b; padding: 14px 18px; border-radius: 8px 8px 0 0; margin-bottom: 16px;">
    <h2 style="color: #b45309; font-size: 16px; font-weight: 800; margin: 0 0 2px 0;">Scheduled Infrastructure Upgrade</h2>
    <p style="color: #d97706; font-size: 12px; margin: 0;">Planned Database & API Maintenance Window</p>
  </div>

  <div style="padding: 4px 8px;">
    <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">
      We will be performing routine database optimizations and SSL certificate renewals during the maintenance window below:
    </p>

    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 12px;">
      <div style="margin-bottom: 6px;"><strong>📅 Scheduled Window:</strong> Saturday, 02:00 UTC - 02:45 UTC</div>
      <div style="margin-bottom: 6px;"><strong>⏱️ Duration:</strong> ~45 Minutes</div>
      <div><strong>⚡ Affected Services:</strong> Live Sandbox Execution & Real-time Sockets</div>
    </div>

    <p style="font-size: 12px; color: #64748b; margin: 0;">
      No writeups, blogs, or user data will be impacted. Thank you for your patience!
    </p>
  </div>
</div>`
    },
    {
        id: 'bug_bounty_payout',
        name: 'Bug Bounty Vulnerability Report Accepted 🐞',
        subject: '🐞 Vulnerability Report Accepted - Bug Bounty Awarded!',
        category: 'Security & Ops',
        description: 'Bounty acceptance notification with severity rating, payout amount, and thank you message.',
        format: 'html',
        body: `<div style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px 16px; color: #1e293b; border-radius: 12px; border: 1px solid #cbd5e1;">
  <div style="background-color: #f0fdf4; border-bottom: 2px solid #22c55e; padding: 16px 18px; border-radius: 8px 8px 0 0; margin-bottom: 16px;">
    <div style="color: #15803d; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px;">BOUNTY CONFIRMED</div>
    <h1 style="color: #166534; font-size: 17px; font-weight: 700; margin: 0;">Vulnerability Report Triaged & Resolved</h1>
  </div>

  <div style="padding: 4px 8px;">
    <p style="color: #334155; font-size: 13px; line-height: 1.6; margin: 0 0 14px 0;">
      Thank you for submitting your security research to HackToWriteToHack! Our security engineering team has triaged and verified your submission.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 12px;">
      <div style="margin-bottom: 6px;"><strong>Report Title:</strong> IDOR in API User Endpoint</div>
      <div style="margin-bottom: 6px;"><strong>Severity Level:</strong> <span style="color: #dc2626; font-weight: bold;">High (CVSS 8.2)</span></div>
      <div style="margin-bottom: 6px;"><strong>Reward Amount:</strong> <span style="color: #16a34a; font-weight: 800;">$500 USD / Hall of Fame Credit</span></div>
      <div><strong>Status:</strong> <span style="color: #2563eb; font-weight: bold;">Patched & Verified</span></div>
    </div>

    <p style="color: #475569; font-size: 12px; margin: 0 0 14px 0;">
      Your name has been added to our official <strong>Hall of Fame</strong> writeup board.
    </p>

    <div style="text-align: center; margin-top: 16px;">
      <a href="[APP_URL]/#/writeups" style="background-color: #16a34a; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 9px 20px; border-radius: 6px; display: inline-block;">
        View Hall of Fame &rarr;
      </a>
    </div>
  </div>
</div>`
    },
    {
        id: 'zeroday_alert',
        name: 'Zero-Day Vulnerability Alert ⚡',
        subject: '⚡ Urgent Zero-Day Vulnerability Advisory: Mitigations Required',
        category: 'Security & Ops',
        description: 'Urgent red alert template for critical zero-day threats with immediate remediation steps.',
        format: 'html',
        body: `<div style="background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px 16px; color: #f3f4f6; border-radius: 12px; border: 1px solid #374151;">
  <div style="background-color: #7f1d1d; border: 1px solid #991b1b; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
    <span style="color: #fca5a5; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">CRITICAL THREAT WARNING</span>
    <h2 style="color: #ffffff; font-size: 16px; font-weight: 800; margin: 4px 0 0 0;">Zero-Day Exploit Intelligence Dispatch</h2>
  </div>

  <p style="color: #d1d5db; font-size: 13px; line-height: 1.6; margin: 0 0 14px 0;">
    A zero-day remote code execution vulnerability has been disclosed affecting widespread authentication packages. Immediate validation is required across server deployments.
  </p>

  <div style="background-color: #1f2937; border-left: 3px solid #ef4444; padding: 12px; border-radius: 0 6px 6px 0; margin-bottom: 16px; font-size: 12px;">
    <div style="color: #f87171; font-weight: bold; margin-bottom: 4px;">Immediate Mitigation Actions:</div>
    <ul style="margin: 0; padding-left: 18px; color: #9ca3af; line-height: 1.5;">
      <li>Update dependency packages to patch release immediately</li>
      <li>Restrict external access to untrusted API callers</li>
      <li>Enable WAF rule set 409-RCE</li>
    </ul>
  </div>

  <div style="text-align: center; margin-top: 16px;">
    <a href="[APP_URL]/#/admin" style="background-color: #ef4444; color: #ffffff; font-size: 12px; font-weight: 800; text-decoration: none; padding: 9px 20px; border-radius: 6px; display: inline-block;">
      Access Security Center &rarr;
    </a>
  </div>
</div>`
    },
    {
        id: 'ctf_challenge_launch',
        name: 'CTF & Lab Challenge Announcement 🎯',
        subject: '🎯 New CTF Security Challenge Live: Test Your Skills!',
        category: 'Labs & Events',
        description: 'Interactive gamified announcement card with challenge difficulty, flags, and leaderboards.',
        format: 'html',
        body: `<div style="background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px 16px; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
  <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 18px; border-radius: 8px; text-align: center; margin-bottom: 16px;">
    <div style="font-size: 28px; margin-bottom: 4px;">🎯</div>
    <h1 style="color: #ffffff; font-size: 18px; font-weight: 800; margin: 0 0 4px 0;">CTF Security Challenge Unlocked!</h1>
    <p style="color: #e0f2fe; font-size: 12px; margin: 0;">Topic: Cryptographic Hash Collisions & JWT Misconfigurations</p>
  </div>

  <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 12px;">
    <div style="margin-bottom: 6px;"><strong>Level:</strong> <span style="color: #f59e0b; font-weight: bold;">Intermediate / Hard</span></div>
    <div style="margin-bottom: 6px;"><strong>Flags Available:</strong> 3 Hidden Flag Tokens</div>
    <div><strong>Reward Points:</strong> 250 XP + Profile Trophy Badge</div>
  </div>

  <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0 0 16px 0;">
    Solve the challenge in our online sandbox before Sunday 23:59 UTC to claim your spot on the regional leaderboard!
  </p>

  <div style="text-align: center;">
    <a href="[APP_URL]/#/tools" style="background-color: #0284c7; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 9px 22px; border-radius: 6px; display: inline-block;">
      Start CTF Challenge &rarr;
    </a>
  </div>
</div>`
    },
    {
        id: 'article_published_confirmation',
        name: 'Blog Article Published Confirmation 🚀',
        subject: '🚀 Your Writeup is Live on Security Research Hub!',
        category: 'Blog & Research',
        description: 'Author confirmation email when a user writeup or blog post goes live.',
        format: 'html',
        body: `<div style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px 16px; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">
  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px 16px; border-radius: 8px; margin-bottom: 16px;">
    <span style="color: #166534; font-size: 11px; font-weight: 800; text-transform: uppercase;">PUBLICATION SUCCESS</span>
    <h2 style="color: #14532d; font-size: 16px; font-weight: 800; margin: 4px 0 0 0;">Congratulations! Your Article is Live</h2>
  </div>

  <p style="color: #334155; font-size: 13px; line-height: 1.6; margin: 0 0 14px 0;">
    Your technical writeup has passed review and is now published on the main HackToWriteToHack feed for thousands of security researchers to read.
  </p>

  <!-- Latest Published Writeup Container -->
  [WRITEUP_LIST]

  <div style="text-align: left; margin-top: 16px;">
    <a href="[APP_URL]/#/writeups" style="background-color: #16a34a; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 9px 18px; border-radius: 6px; display: inline-block;">
      View Published Article &rarr;
    </a>
  </div>
</div>`
    },
    {
        id: 'welcome_researcher_onboarding',
        name: 'Welcome Security Researcher Onboarding 👋',
        subject: '👋 Welcome to HackToWriteToHack Security Community!',
        category: 'Account & VIP',
        description: 'Friendly onboarding welcome email introducing tools, writeup guidelines, and community links.',
        format: 'html',
        body: `<div style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px 16px; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 20px; border-radius: 10px; color: #ffffff; text-align: center; margin-bottom: 18px;">
    <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 4px 0;">Welcome aboard, Researcher! 👋</h1>
    <p style="font-size: 12px; color: #e0e7ff; margin: 0;">You are now part of the HackToWriteToHack Research Hub.</p>
  </div>

  <div style="padding: 4px 8px;">
    <p style="color: #334155; font-size: 13px; line-height: 1.6; margin: 0 0 14px 0;">
      Here is what you can do right away on the platform:
    </p>

    <ul style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0 0 18px 0; padding-left: 20px;">
      <li><strong>Explore Writeups:</strong> Learn from real-world vulnerability reports.</li>
      <li><strong>Live Tool Sandbox:</strong> Test HTML, CSS, and Markdown payloads securely.</li>
      <li><strong>Submit Research:</strong> Earn badges and community recognition.</li>
    </ul>

    <!-- Quick Stats -->
    [APP_STATS]

    <div style="text-align: center; margin-top: 18px;">
      <a href="[APP_URL]" style="background-color: #4f46e5; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 24px; border-radius: 6px; display: inline-block;">
        Launch Workspace &rarr;
      </a>
    </div>
  </div>
</div>`
    },
    {
        id: 'two_factor_verification_code',
        name: '2FA Verification Code / Security Key 🔐',
        subject: '🔐 Your One-Time Security Code for Sign-In',
        category: 'Account & VIP',
        description: 'Clean high-contrast OTP verification card with copyable code display.',
        format: 'html',
        body: `<div style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px 16px; color: #1e293b; border-radius: 12px; border: 1px solid #cbd5e1; text-align: center;">
  <div style="font-size: 28px; margin-bottom: 6px;">🔐</div>
  <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">Two-Factor Authentication Code</h2>
  <p style="color: #64748b; font-size: 12px; margin: 0 0 16px 0;">Use the 6-digit verification code below to complete sign in:</p>

  <div style="background-color: #f1f5f9; border: 2px dashed #6366f1; border-radius: 10px; padding: 14px 24px; display: inline-block; margin-bottom: 16px;">
    <span style="font-family: 'Courier New', monospace; font-size: 26px; font-weight: 900; letter-spacing: 6px; color: #4f46e5;">849-201</span>
  </div>

  <p style="color: #94a3b8; font-size: 11px; margin: 0;">
    This code will expire in 10 minutes. Do not disclose this code to anyone.
  </p>
</div>`
    },
    {
        id: 'community_contributor_award',
        name: 'Community Contributor Award 🎖️',
        subject: '🎖️ Congratulations! Top Security Contributor Award Granted',
        category: 'Community & Spotlight',
        description: 'Award certificate layout thanking active community writers and researchers.',
        format: 'html',
        body: `<div style="background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px 16px; color: #f8fafc; border-radius: 12px; border: 1px solid #334155; text-align: center;">
  <div style="font-size: 32px; margin-bottom: 8px;">🎖️</div>
  <h1 style="color: #38bdf8; font-size: 19px; font-weight: 800; margin: 0 0 6px 0;">Top Security Contributor Award</h1>
  <p style="color: #94a3b8; font-size: 13px; margin: 0 0 18px 0;">For outstanding technical writeups and community research contributions this month.</p>

  <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; text-align: left; margin-bottom: 18px; font-size: 12px;">
    <div style="color: #e2e8f0; margin-bottom: 6px;"><strong>Award Tier:</strong> Master Researcher 2026</div>
    <div style="color: #e2e8f0; margin-bottom: 6px;"><strong>Perks:</strong> Verified Gold Badge + Swag Kit Access</div>
    <div style="color: #e2e8f0;"><strong>Featured Profile:</strong> Front Page Showcase</div>
  </div>

  <a href="[APP_URL]/#/writeups" style="background-color: #0284c7; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 9px 22px; border-radius: 6px; display: inline-block;">
    Claim Badge & Profile Feature &rarr;
  </a>
</div>`
    },
    {
        id: 'markdown_hybrid',
        name: 'Clean Markdown + HTML Hybrid 📄',
        subject: '📄 Important Platform Update & Guidelines',
        category: 'Standard',
        description: 'Clean Markdown typography with embedded HTML CTA buttons and alert callouts.',
        format: 'markdown',
        body: `## Platform Intelligence Briefing

Welcome to the **Security Research Hub** update dispatch.

### Latest Published Research & Writeups
[WRITEUP_LIST]

<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
  <strong style="color: #1d4ed8;">Note:</strong> You can edit this email in <b>Markdown</b> or <b>HTML</b> and preview it live instantly.
</div>

<div style="text-align: center; margin: 24px 0;">
  <a href="[APP_URL]" style="background-color: #2563eb; color: #ffffff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">Explore Workspace &rarr;</a>
</div>

Best regards,  
*HTWTH Engineering Team*`
    }
];

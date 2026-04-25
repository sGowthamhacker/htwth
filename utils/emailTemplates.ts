
export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'maintenance',
        name: 'Maintenance 🛠️',
        subject: 'System Maintenance Window 🛠️',
        category: 'System',
        body: `<p>The Innovation Lab is undergoing a scheduled maintenance period to upgrade local security protocols and server stability.</p><p>Access to research archives may be limited during this window.</p><p>Thank you for your understanding.</p>`,
    },
    {
        id: 'update',
        name: 'New Update 🚀',
        subject: 'New stuff is live! 🚀',
        category: 'Update',
        body: `<p>Hey!</p><p>We just updated the app. It's now faster and better.</p><p>Go check it out!</p>`,
    },
    {
        id: 'new_writeup',
        name: 'Writeup 📄',
        subject: 'New writeup is ready 📄',
        category: 'Content',
        body: `<p>New security writeup is out now. Read the latest ones here:</p><div style="margin-top: 20px;">[POST_LIST]</div>`,
    },
    {
        id: 'new_blog',
        name: 'New Blog ✍️',
        subject: 'New blog post! ✍️',
        category: 'Content',
        body: `<p>I just posted new blogs. Take a look:</p><div style="margin-top: 20px;">[BLOG_LIST]</div>`,
    },
    {
        id: 'interaction',
        name: 'New Like ❤️',
        subject: 'People like your post! ❤️',
        category: 'Social',
        body: `<p>Nice! Your post is getting likes and views. Keep it up!</p>`,
    },
    {
        id: 'verification',
        name: 'Verified ✅',
        subject: 'You are verified! ✅',
        category: 'Account',
        body: `<p>Good news! Your account is now verified. You can use all features now.</p>`,
    },
    {
        id: 'security_alert',
        name: 'Safety Check ⚠️',
        subject: 'Important safety alert ⚠️',
        category: 'System',
        body: `<p>Someone just logged into your account. If it wasn't you, please change your password now.</p>`,
    },
    {
        id: 'innovation_lab',
        name: 'Lab Test 🧪',
        subject: 'New test in the hub 🧪',
        category: 'Content',
        body: `<p>I added a new security test in the hub. Come try it and tell me what you think!</p>`,
    },
    {
        id: 'newsletter',
        name: 'Weekly News 📰',
        subject: 'Weekly news roundup 📰',
        category: 'Social',
        body: `<p>Here is what happened this week on the portal. Stay updated with us!</p>`,
    },
    {
        id: 'custom_html',
        name: 'Custom HTML 💻',
        subject: 'Custom Layout Dispatch',
        category: 'Expert',
        body: `<div style="background: #1e293b; padding: 20px; border-left: 4px solid #4f46e5; border-radius: 8px;">\n  <h3 style="margin: 0; color: #ffffff;">Custom Content Title</h3>\n  <p style="margin: 15px 0 0; color: #cbd5e1;">You can use <b>HTML</b> and <span style="color: #4f46e5; font-weight: bold;">CSS</span> classes here.</p>\n</div>`,
    },
];

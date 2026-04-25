export const faqData: Record<string, string> = {
  // Account & Login
  "I forgot my password, how do I reset it?": "No panic, happens to everyone 😅\nHere’s how you can reset it in under a minute:\n[Go to Sign-in Page](https://writeupportalos.netlify.app/#/auth)\n\n👉 Click “Forgot password?” under the password field.\n📧 Enter your email → hit Send Reset Link.\n📬 Open your inbox → click the link → create a new password.\n💡 Tip: Didn’t get the email? Check your Spam or Promotions folder.",
  "How do I create a new account?": "✨ Super simple setup:\n\nHead to the [Sign-up Page](https://writeupportalos.netlify.app/#/auth).\n\nClick Sign Up → fill your name, email, and password.\n\nYou’ll get a verification email — click Verify Email to activate your account.\n🎉 You’re in!",
  "I'm not receiving the verification email.": "📩 Sometimes it hides — try this:\n\nCheck Spam, Junk, or Promotions folders.\n\nStill missing? Go back to the Verify Email screen and tap Resend Link.\n🔁 Boom — a fresh one’s sent.",
  "My login link expired, what do I do?": "⏳ These links are time-limited for your safety.\nJust restart the process:\n\nForgot Password → [Reset here](https://writeupportalos.netlify.app/#/auth).\n\nFor 2FA / Magic link → request a new one or use another backup code.\n✅ You’ll get a new link instantly.",
  "Can I change my email address?": "Of course 🧩\n⚙️ Go to **Settings > Account**\n✏️ Enter your new email → confirm via link sent to that inbox.\n🔒 You’ll need to verify your password for extra security.",

  // Profile & Settings
  "How do I change my profile picture?": "📷 Go to **Settings > Profile**\nHover over your current photo → click Change → upload a new pic.\n💅 Keep it sharp — it’s your first impression!",
  "How do I edit my portfolio?": "💼 Open the **Portfolio App** → click **Edit Portfolio**.\nThere you can update:\n\n🧠 Bio & tagline\n\n⚒️ Skills & experience\n\n✨ “What I Do” section\n🎯 Hit save — it updates instantly!",
  "What does 'Make Profile Private' do?": "🔒 Privacy Mode ON = Control what others see.\n✅ Friends → can view full profile.\n🚫 Others → only see your name + avatar.",
  "How can I change the app theme?": "🎨 Customize your vibe:\nGo to **Settings > Appearance** → choose between\n🌞 Light / 🌚 Dark mode, 💻 Windows / 🍎 macOS layout, or change your wallpaper.\nMake it your workspace!",
  "Where can I find my backup codes for 2FA?": "🔐 Go to **Settings > Account > Two-Factor Authentication (2FA)**.\nClick **View Codes** → enter your password to unlock them.\n💾 Save these codes somewhere safe (notes app or password manager).",

  // NEW: Kali & Remote Desktop
  "How do I set up the Kali Linux connection?": "🖥️ To connect your local Kali instance:\n1. In Kali terminal, run: `vncserver :1 -geometry 1280x720` followed by `websockify -D --web=/usr/share/novnc 6080 0.0.0.0:5901`.\n2. Start an Ngrok tunnel: `ngrok http 6080`.\n3. Copy the **HTTPS** URL from Ngrok and paste it into the **Kali App** in the dashboard.\n🚀 You're now controlling Kali from your browser!",
  "Why is my Kali connection refused?": "❌ This usually happens if `websockify` isn't running or the Ngrok URL is incorrect. Make sure you are using the **HTTPS** version of the Ngrok link. Check the **Setup Guide** inside the Kali App for the exact commands.",

  // NEW: Resource Hub & Payloads
  "What is the difference between Open Source and Premium resources?": "🔓 **Open Source**: Curated links to free community tools like HTB, TryHackMe, and PortSwigger.\n💎 **Premium**: Exclusive, high-impact payloads (XSS, SQLi, RCE) verified by our team. Premium content may be restricted based on your account status.",
  "How can I suggest a new payload for the hub?": "💡 We love community contributions! Use the **Contact Admin** option in this bot or email us directly with your payload and a brief description of its impact.",

  // NEW: System & Customization
  "What is 'Sleep Mode'?": "💤 The red/green toggle on your taskbar is **Sleep Mode**. \n🔴 **Red**: System is in Sleep Mode to save resources and provide a focus screen. \n🟢 **Green**: Active Work Mode. Tap the clock or toggle the switch to wake the system!",
  "Are my desktop icon positions saved?": "💾 Yes! HtWtH features **Persistent Desktop**. When you drag an icon to a new spot, the position is saved to your profile and will be restored exactly where you left it next time you log in.",
  "How do I refresh a specific application window?": "🔄 Every window in **Windows Mode** has a refresh icon (circular arrow) in the title bar. Click it to reload just that specific app without refreshing the whole OS.",
  "Where is the technical manual for this OS?": "📚 Open the **Docs App** on your desktop. It contains extensive documentation on the system architecture, kernel logic, and network protocols used to build HtWtH.",

  // NEW: My Work & Portfolio
  "How do I reorder items in my portfolio?": "↕️ In the **My Work** editor, you can use the **Up/Down arrows** on each item to reorder them. On desktop, you can also use the **Drag Handle** (cross icon) to move items freely.",
  "Can I add images to my internships or certifications?": "🖼️ Yes! When editing your profile, look for the **Upload** button in the Internships or Certifications tabs. You can upload images to Cloudinary, and they will appear in a lightbox when clicked on your public profile.",
  "How do I highlight my achievements?": "🏆 Go to **My Work > Edit > Achievements**. List your competition wins, bug bounties, or hall-of-fame mentions. These are displayed prominently with a trophy icon to grab recruiter attention.",

  // NEW: Messaging & Social
  "How do I reply to a specific chat message?": "💬 Hover over any message in the **Community Chat** and click the **Reply Arrow**. This creates a threaded context so others know exactly which message you are responding to.",
  "How do I react to messages with emojis?": "😀 Hover over a message and click the **Smiley Face** icon. You can choose from common reactions like ❤️, 👍, or 😂. Click a reaction again to remove it.",
  "Where can I see my friend requests?": "🔔 You can see pending requests in the **Notification Center** (bell icon on taskbar) or by going to **Settings > Friends**. You can accept or decline them directly from either location.",

  // Features
  "How do I create a new write-up?": "📝 Easy-peasy:\n\nOpen the **Writeups App**\n\nClick **New** (top-left)\n\nFill in title, description, tags, and severity (Low–Critical).\n🚀 Hit save — it’s added to your list!",
  "What is AI-powered analysis?": "🤖 It’s your smart helper powered by Gemini AI.\nIt’ll:\n\nRead your write-up\n\nSuggest the severity level 🔥\n\nAuto-tag relevant keywords\n💡 Saves time and keeps your reports accurate.",
  "How do I add a friend?": "👥 Go to **Settings > Friends**\nSearch by name/email → click **Add Friend**.\n💌 They’ll get a friend request notification!",
  "How do I use the Notes app?": "🗒️ Open **Notes App** → click **Add Note** → start typing.\n✅ Everything auto-saves in your browser — no save button needed.\nPerfect for quick thoughts or reminders.",
  "What does the 'Live Conversation' app do?": "🎤 It’s a voice chat feature with Sparky, your AI assistant.\nYou talk → it listens → replies in voice.\n⚠️ Still experimental — expect the occasional lag.\n💬 Great for hands-free convos.",

  // Two-Factor Authentication (2FA)
  "What is two-factor authentication?": "🛡️ Two-Factor Authentication = double protection.\nAfter your password, you’ll need a backup code to log in.\nEven if someone knows your password, they can’t break in without the code. 💪",
  "How do I enable 2FA?": "🔧 Go to **Settings > Account**\nFind the 2FA section → toggle ON.\nYou’ll instantly get 3 backup codes — save them!\n💾 Store them safely, offline if possible.",
  "I lost my backup codes.": "😬 No worries!\nGo to **Settings > Account > 2FA section** → click **Regenerate System Codes**.\n⚠️ This disables your old codes.\nYou can regenerate up to 3 times a day.",
  "Can I reuse my backup codes?": "🌀 Yes — in this demo, you can reuse them.\nBut in real-world apps, codes are single-use only for better security 🔥",
  "How do I disable 2FA?": "⚙️ Go to **Settings > Account > 2FA** → toggle OFF.\n🧠 You’ll be asked for your password before confirming.",

  // General
  "Is this platform free to use?": "💸 Totally free!\nUse it for demo projects, portfolio builds, and learning — no hidden fees.",
  "How do I report a bug with the platform?": "🐞 Found a bug or have a suggestion?\n\nOpen the **Support Bot** (bottom-right chat icon).\n\nSelect **Contact Admin** and send your message directly.",
  "Who is the administrator?": "👨‍💻 Gowtham S. — main dev & admin behind the project.\nCheck out his work via the **Portfolio App**.",
  "Can I delete my account?": "⚠️ Yup, but once deleted — it’s gone forever.\nGo to **Settings > Account** → scroll down → click **Delete This Account**.\n🗑️ Your data will be wiped permanently.",
  "How can I download my portfolio as a PDF?": "📄 Open the **Portfolio App** → click **Download PDF**.\nIt instantly exports your portfolio into a clean, professional resume format.\n📥 Perfect for sharing anywhere!",
  "I need to speak to an administrator.": "Please use the contact form.",
  "Can I collaborate with my team?": "Absolutely. Our **Pro Features** include real-time collaboration, allowing multiple researchers to work on the same report simultaneously, ensuring seamless team workflows.",
  "What happens if I delete my account?": "We respect your privacy. Upon deletion, all your personal data, writeups, and findings are permanently purged from our primary databases in accordance with GDPR principles."
};

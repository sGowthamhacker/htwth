import { Post } from '../types';
import { MOCK_USERS } from './users';

const adminUser = MOCK_USERS.find(u => u.role === 'admin') || MOCK_USERS[0];

const existingPosts: Post[] = [
    {
        id: 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
        type: 'blog',
        title: 'Welcome to the New Highlevel Platform!',
        author: adminUser,
        content: "We're thrilled to launch the new version of the Highlevel Innovation platform. This release brings a completely redesigned user interface, a powerful new blogging system, and enhanced security features. Explore the new writeups section and join the community chat to connect with fellow researchers!",
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        comments: [],
        tags: ['launch', 'announcement', 'platform'],
        liked_by: [],
    },
    {
        id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
        type: 'blog',
        title: 'Introducing AI-Powered Writeup Assistance',
        author: adminUser,
        content: "Our new writeup editor is now supercharged with Gemini AI! You can now get AI-powered analysis of your vulnerability descriptions to suggest severity and tags. This helps standardize reports and saves you time. Just click the 'Analyze with AI' button in the editor to try it out.",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        comments: [],
        tags: ['feature', 'ai', 'gemini', 'writeups'],
        liked_by: [],
    }
];

const newPosts: Post[] = [
    {
        id: 'b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3',
        type: 'blog',
        title: 'Your First CTF: Enna Pannanum, Epdi Pannanum?',
        author: adminUser,
        content: `Hacking kathukanum nu aasa iruka? Aana enga start panradhu nu therilaya? Textbooks padikradhu bore adikudha? Practical-a, hands-on-a skills develop panna, CTF thaan best வழி. Inga CTF-na enna, adha epdi approach panradhu nu paapom.

## CTF-na Enna Bro? 🤔
Capture The Flag (CTF) - idhu oru game maari thaan. Oru cybersecurity competition. Ungalukku challenges kudupanga, neenga adha solve panni 'flag' edukanum. Indha flag oru secret code maari irukum (\`flag{th1s_1s_a_s3cr3t}\`). Indha game vilayadradhu மூலமா, namma practical-a neraya hacking concepts kathukalam.

College la irukura ellarum, time kedaikumbodhu CTF vilayadanum. Adhu unga resume-ku romba periya plus!

![A person working on a laptop with code on the screen in a dark room.](https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop)

### First Step: Oru Nalla Team Form Pannunga! 🤝
Thaniya CTF vilayaduradha vida, oru team-a serndhu vilayadradhu romba better. 
- **Skill Diversity:** Team la different skills irukura friends-a serunga. Oruத்தர் web security-la strong-a irukalam, innoruthar crypto-la, etc.
- **Brainstorming:** Oru challenge stuck aagumbodhu, team-oda discuss panna new ideas kedaikum. Romba neram waste aagadhu.
- **Learning:** Team members kitta irundhu neraya kathukalam. Knowledge sharing is key! Oru challenge-a solve panna aprom, unga approach-a team kooda share pannunga.

### CTF la Enna Maari Challenges Irukum?
CTF la പലவிதமான categories irukum. Sila common ones:
- **Web:** Website la irukura XSS, SQLi, IDOR maari vulnerabilities-a exploit panradhu.
- **Cryptography:** Encrypted messages-a decrypt panradhu. Cipher algorithms-a break panradhu.
- **Reverse Engineering:** Oru compiled program (like .exe) oda source code illama, adhu epdi work aagudhu nu analyze panradhu.
- **Forensics:** Oru image file, network packet capture (pcap) la irundhu hidden information-a edukuradhu.
- **Pwn / Binary Exploitation:** Oru program oda memory-a corrupt panni, adha control panradhu. Buffer overflow maari attacks.

## Enga Start Pannuradhu?
CTF vilayada neraya platforms iruku. For beginners, inga start pannunga:
1.  **OverTheWire:** Idhu romba famous. Wargames concept la irukum. Bandit level la start panni, step-by-step-a advanced concepts cover pannuvanga.
2.  **TryHackMe:** Idhu super user-friendly. Guided learning paths (rooms) irukum. Theory + practical labs serndhu varum. Romba engaging-a irukum.
3.  **Hack The Box:** Konjam advanced, but avanga 'Starting Point' machines beginners-ku romba helpful-a irukum.
4.  **picoCTF:** Idhu beginners-kagaவே create panna oru platform. Annual competition-um nadathuvanga.

### Mukkiamana Sila Tools 🧰
CTF-ku ready aagumbodhu, indha tools ellam konjam familiarise pannikonga:
- **Kali Linux / Parrot OS:** Hacking-kaana pre-installed tools oda varum. VM la install pannikonga.
- **Burp Suite:** Web application testing-ku idhu dhaan king. Intercepting requests, modifying them, ellaame pannalam.
- **Nmap:** Network scanning and enumeration-ku use aagum.
- **Wireshark:** Network traffic-a analyze panna.
- **Ghidra / IDA Pro:** Reverse engineering challenges-ku.
- **CyberChef:** "The Cyber Swiss Army Knife". Encoding, decoding, encryption, decryption-ku romba useful-aana tool.

## Final Thoughts: Porumai Romba Mukkiyam! 🙏
First CTF-la எல்லாத்தையும் solve pannanum nu nenaikadheenga. Neraya thadava stuck aagum. Adhellam normal thaan. Writeups padiunga, vera teams epdi solve pannanga nu thedi paarunga. Jeyikratha vida, kathukuradhu thaan inga main goal. So, chill pannitu, enjoy panni vilayadunga. All the best, macha! 💪`,
        created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
        comments: [],
        tags: ['ctf', 'hacking', 'beginners', 'college', 'cybersecurity'],
        liked_by: [],
    },
    {
        id: 'b4b4b4b4-b4b4-b4b4-b4b4-b4b4b4b4b4b4',
        type: 'blog',
        title: 'XSS Hunting: Oru Simple Trick to Find More Bugs',
        author: adminUser,
        content: `## XSS-na Short-a Sollunga! 
Cross-Site Scripting (XSS) nu sonna, oru attacker, victim-oda browser la avanoda JavaScript code-a execute panradhu. Idhu மூலமா cookies-a thirudalam, user actions-a control pannalam, neraya sensitive information-a edukkalam. Bug bounty la XSS romba common-a kandupudikura oru vulnerability. But adhukunu easy-nu nenaichidadheenga!

### The "Hidden" Parameters Trick ✨
Namma ellarum normal-a input fields, search bars, URL parameters la thaan XSS payload try pannuvom. But developers neraya parameters-a hidden-a vechirupanga. Adha kandupudikuradhu epdi?

**Step 1: Discover Hidden Parameters**
Burp Suite la site-a browse pannumbodhu, unga scope la irukura ella requests-um history la save aagum. But adha mattum paathadhu. Namma innum deep-a thedanum.
- **JS Files:** JavaScript files-a open panni 'param', 'var', 'const', 'let', '=', '&' maari keywords use panni search pannunga. Sometimes developers API endpoints and parameters-a hardcode pannirupanga.
- **Wayback Machine:** Archive.org la poi, target website oda old versions-a paarunga. Appo use panna parameters, ippo kuda backend la active-a iruka chance iruku.
- **Param Miner (Burp Extension):** Indha tool super! Oru request-a right-click panni, 'Guess GET/POST parameters' kudutha, adhuve common parameter names-a vechi brute force panni kandupudichidum.

![A code editor showing JavaScript code with highlighted parameters.](https://images.unsplash.com/photo-1629904853716-f0bc64219b1b?q=80&w=2070&auto=format&fit=crop)

**Step 2: Test the Discovered Parameters**
Ippo ungaluku oru list of potential hidden parameters kedaichirukum. Example: \`debug\`, \`redirect_url\`, \`user_id\`, \`profile_color\`, \`utm_source\`.
- **GET parameters:** URL la append panni test pannunga. \`https://example.com/profile?debug=<script>alert(1)</script>\`
- **POST parameters:** Burp Repeater la poi, request body la indha parameters-a add panni send pannunga.
- **JSON Body:** API request body la JSON irundha, angaum indha new keys-a add panni test pannunga. \`{"username":"test", "new_param":"<payload>"}\`

### Why does this work? 🤔
Neraya time developers oru feature-a remove panniruvanga, but adha handle panra backend code-a apdiye vitruvanga. Or, some parameters are used only for internal debugging or analytics. Indha parameters-ku proper validation irukadhu. So namma payload easy-a reflect aagum.

### XSS Impact: Chinna Bug, Periya Aabathu!
Oru simple alert box thaan varudhu nu nenaikadheenga. Oru attacker XSS use panni enna laam panna mudiyum theriyuma?
- **Session Hijacking:** Victim-oda session cookie-a thirudi, avanga account-a login pannalam.
- **Keylogging:** Victim type panra ellaathayum (passwords, credit card details) record pannalam.
- **Phishing:** Original website maariye oru fake login page-a kaati, credentials-a vaangalam.
- **Defacement:** Website oda content-a maathi, company peru-a kedukalam.

Indha simple trick use panni, naan neraya hidden XSS vulnerabilities kandupudichirken. Neengalum try panni paarunga. Remember, bug hunting is all about looking where others don't. Happy hunting! 🕵️‍♂️`,
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        comments: [],
        tags: ['xss', 'bughunting', 'hacking', 'websecurity', 'tanglish'],
        liked_by: [],
    },
    {
        id: 'b5b5b5b5-b5b5-b5b5-b5b5-b5b5b5b5b5b5',
        type: 'blog',
        title: 'College vs. Skills: Balance Pannurathu Epdi?',
        author: adminUser,
        content: `## College Life-la Oru Periya Dilemma! 😥
Namma college la padikumbodhu, ellarukum vara oru common question idhu thaan: "CGPA mukkiyama, illa skills mukkiyama?". Rendumey mukkiyam thaan, but adha epdi balance panradhu? Romba simple-a solren, kelunga.

### CGPA Yen Mukkiyam?
First, let's be clear. CGPA is not everything, but it is something. Oru nalla CGPA (8.0+ ideal-a) vechirukradhu, unga first filter-a clear panna help pannum.
- **Placements:** Neraya big companies (product-based) oru CGPA cutoff vechirupanga. 7.5+ or 8.0+ illana, neenga online test-ke eligible aaga maateenga.
- **Higher Studies:** Neenga MS, M.Tech panna plan pannirundha, CGPA romba critical.
- **First Impression:** Oru nalla CGPA, ungaluku subject knowledge iruku, neenga discipline-aana student-nu oru nalla impression create pannum.

Adhukaga 24/7 padichite irukanuma? Avasyame illa. Smart work panna podhum. Important concepts-a purinjikitu padichaale, easy-a score pannalam.

![A balancing scale with books on one side and a glowing brain on the other.](https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop)

### Skills Yen "Romba" Mukkiyam? 🚀
CGPA is your entry ticket, but skills are what will get you the job and help you grow in your career.
- **Practical Knowledge:** Neenga class la padikradha vida, oru project panni kathukuradhu 100 times better.
- **Industry Relevance:** College syllabus often outdated-a irukum. But neenga online-a new technologies (React, Docker, Cloud) kathukumbodhu, industry-ku ready aagureenga.
- **Problem-Solving Ability:** CTF, LeetCode, Hackathons la participate pannumbodhu, unga problem-solving skills develop aagum. Interview la idhu thaan main-a a paapanga.

### Time Management Tips for Balancing Both 
Okay, renduமே mukkiyam nu therinjiduchu. But time enga iruku? Inga thaan time management varudhu.
1.  **The 80/20 Rule:** Unga time la 20% college academics-ku focus pannunga (attend classes, prepare for exams smartly). Meedhi 80% time-a skill development-ku use pannunga.
2.  **Daily Oru Habit:** Dinamum 1 hour skill development-ku time odhukunga. Oru coding problem solve pannunga, oru new concept kathukonga, oru చిన్న project pannunga. Consistency is more important than intensity.
3.  **Weekends are Gold:** Weekends la thaan neenga periya projects, hackathons, CTFs la focus pannanum. Oru weekend la 5-6 hours spend panna kooda, periya progress theriyum.
4.  **Learn in Public:** Oru blog start pannunga. Neenga kathukuradha weekly oru article-a ezhudhunga. Idhu unga knowledge-a solidify pannum, and ungaluku oru online presence create pannum.
5.  **Say 'No':** Ellarukum 'yes' solladheenga. Unnecessary events, parties-a thavirkka kathukonga. Unga time unga goal-ku dhaan.

Final-a onnu solren, CGPA-vum venum, skills-um venum. But rendu layum perfect-a irukanum nu avasyam illa. Oru decent CGPA maintain pannitu, skills la strong-a irundha, unga future bright-a irukum! Keep hustling! ✨`,
        created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
        comments: [],
        tags: ['collegelife', 'student', 'skills', 'cgpa', 'career'],
        liked_by: [],
    },
    {
        id: 'b6b6b6b6-b6b6-b6b6-b6b6-b6b6b6b6b6b6',
        type: 'blog',
        title: 'Thoovi Ponaalum, Don\'t Give Up! Your Comeback Story',
        author: adminUser,
        content: `## Life is Not a Straight Line 📉📈
Namma life la, career la, padipu la, ellathulayume ups and downs irukum. Oru interview la reject aagalam, oru exam la fail aagalam, oru bug bounty la duplicate report vaangalam. Indha maari nerathula, "ശ്ശே, namakku idhu varadhu" nu nenaikradhu sagajam.

But remember this: **Failure is not the opposite of success, it's a part of success.**

### Michael Jordan Sonnadhu Enna Theriyuma?
"I've missed more than 9000 shots in my career. I've lost almost 300 games. 26 times, I've been trusted to take the game-winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed."

Basketball-oda G.O.A.T. avare ivlo failures paathirukaaru na, namma ellam evlo? So, oru tholvi vandhadhum, give up pannidadheenga.

![A single person standing on a mountain peak looking at a beautiful sunrise.](https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop)

### How to Bounce Back Stronger? 💪
Failure-a paathu bayapadama, adha oru learning opportunity-a maathunga.
1.  **Analyze Pannunga, Don't Criticize:** Yen fail aaneenga? Interview-la technical round weak-a? Communication skills problem-a? Bug report detail-a illaya? Root cause-a kandupudichi, adha fix panna work pannunga. Ungala neengale thittikama, situation-a analyze pannunga.
2.  **Chin up, Chest out:** Oru failure unga identity illa. Adhu just oru event. "Naan oru failure" nu nenaikama, "Naan indha vishayathula fail aayiten, next time better-a pannuven" nu nenainga. The mindset shift is everything.
3.  **Take a Real Break:** Romba stress-a irundha, konja neram break eduthukonga. Phone use panradhu break illa. Ezhundhu nadakkuka. Konja neram veliya poi, fresh air-a swasichitu vanga. Music kelunga. Gym ponga. Mind fresh aana aprom, pudhu energy oda start pannunga.
4.  **Chinna Chinna Wins:** Periya goal-a achieve panna mudilanu feel pannadheenga. Adha chinna chinna tasks-a odaichikonga. Ovvoru chinna task-a mudikum bodhum, ungaluke oru confidence varum. Adha celebrate pannunga.

## Your Comeback is Loading...
Every setback is a setup for a comeback. Unga life-la vara ovvoru tholviyum, ungaluku edho oru paadam kathukuduka varudhu. Adha kathukitu, munnadi ponga. Indha journey la neenga thaniya illa. Unga maari neraya peru daily struggle pannitu thaan irukanga.

So, next time you feel down, remember: **It's okay to fall. Just make sure you get back up, stronger and wiser.** Nambikkaiyoda irunga, unga time kandipa varum. ✨`,
        created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
        comments: [],
        tags: ['motivation', 'failure', 'comeback', 'success', 'life'],
        liked_by: [],
    },
    {
        id: 'b7b7b7b7-b7b7-b7b7-b7b7-b7b7b7b7b7b7',
        type: 'blog',
        title: "Recon is King: The Art of Information Gathering",
        author: adminUser,
        content: `## Hacking-la First & Most Important Step! 🕵️‍♀️
Neenga oru building-a attack pannanum na, first enna pannuveenga? Straight-a போய் கதவ ஒடைப்பீங்களா? Illa. Andha building la ethanai peru irukanga, enga cameras iruku, security guard enga nikraru nu information collect pannuveenga la? Adhu thaan recon.

Hacking la 80% success unga recon-la thaan iruku. Nalla recon pannaale, பாதி bug kandupudicha maari!

![A digital world map with network connections glowing across it.](https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop)

### Passive vs Active Recon
**Passive Recon:** Target system-oda direct-a interact pannama information collect panradhu. Idhu legal and safe.
- **Whois Lookup:** Domain owner details, registration date.
- **Google Dorking:** Google la advanced search operators use panni, sensitive files, login pages, subdomains kandupudikradhu. (Example: \`site:example.com -inurl:www filetype:pdf\`)
- **Shodan.io:** "Hacker's Google". Internet-la connect aagirukura devices (servers, cameras, routers) pathina information edukkalam.
- **GitHub Recon:** Target company oda public repositories la sensitive information (API keys, passwords) leak aagiruka nu thedradhu. Tools like GitGuardian can help.

**Active Recon:** Target system-oda direct-a interact panni information collect panradhu. Permission illama panna, idhu illegal.
- **Nmap Scans:** Open ports, services running, OS detection. (\`nmap -sV -A target.com\`)
- **Subdomain Brute-forcing:** Tools like \`subfinder\`, \`amass\`, \`ffuf\` use panni, hidden subdomains-a kandupudikradhu. (\`api.example.com\`, \`dev.example.com\`, \`staging.example.com\`). Neraya bugs inga thaan irukum!
- **Directory Busting:** Tools like \`dirb\`, \`gobuster\`, \`feroxbuster\` use panni, website la irukura hidden files and directories-a kandupudikradhu. (\`/admin\`, \`/.git\`, \`/backup.zip\`).
- **Visual Recon:** Tools like \`aquatone\` or \`gowsiness\` use panni, kandupudicha ella subdomains-ayum screenshot eduthu, easy-a interesting pages-a paakuradhu.

### Why are Subdomains a Goldmine? 💎
Periya companies-ku aayir கணக்குல subdomains irukum. Main website (\`www.example.com\`) romba secure-a vechirupanga. But avanga test panra \`dev.api.example.com\` or marandhu pona \`old-blog.example.com\` maari subdomains la security weak-a irukum. Anga thaan namma easy-a bugs kandupudikalam.

So, unga recon process la subdomain enumeration-ku neraya time spend pannunga. Oru nalla recon process-a automate panna, bash script ezhudhi vechikonga.

### Conclusion
Oru nalla hacker-ku porumai romba mukkiyam. Recon process konjam boring-a irukalam. But "dig deeper, find more" dhaan mantra. Avசரப்பட்டு attack pannaama, thevayana alavu information collect pannitu plan panna, unga success rate kandipa adhigam aagum. Keep digging!`,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        comments: [],
        tags: ['recon', 'hacking', 'infosec', 'bughunting', 'informationgathering'],
        liked_by: [],
    },
    {
        id: 'b8b8b8b8-b8b8-b8b8-b8b8-b8b8b8b8b8b8',
        type: 'blog',
        title: "IDOR: The 'Easy' Bug with Critical Impact",
        author: adminUser,
        content: `## IDOR na enna pa?
Insecure Direct Object Reference (IDOR). Peru thaan perusa irukum, aana concept romba simple. 

Imagine, neenga unga profile page-a paakureenga. URL ippidi iruku: \`https://example.com/profile?user_id=123\`. Inga \`123\` unga ID. Ippo neenga antha \`123\`-a \`124\`-a maathuna, vera yarodavo profile-a paaka mudinja, adhu thaan IDOR!

Basically, server unga kitta vara request la irukura ID ungaluku sondhamanadha nu check panna marandhudradhu.

![A chain with a broken link, symbolizing a security flaw.](https://images.unsplash.com/photo-1550567716-6c265a03bf25?q=80&w=2070&auto=format&fit=crop)

### Why is it so Dangerous? 😱
IDOR paaka simple-a irundhalum, idhoda impact romba critical-a irukum.
- **Viewing Private Data:** Aduthavanga messages, photos, financial details-a paakuradhu.
- **Modifying Data:** Aduthavanga password-a change panradhu, profile-a edit panradhu.
- **Deleting Data:** Vera user-oda account-a delete panradhu.
- **Taking over an account:** Sometimes, password reset function la IDOR irundha, antha user account-aவே namma control-ku kondu varalam.

### Epdi Kandupudikradhu?
IDOR thedradhu oru detective velai maari.
1.  **Look for IDs:** URL la, request body la, headers la enga lam IDs (\`user_id\`, \`message_id\`, \`file_id\`, \`order_id\`) varudho, adha note pannikonga. Indha IDs numbers-a irukalam, UUIDs-a irukalam (\`a1b2c3d4-...\`), illa base64 encoded strings-a kuda irukalam.
2.  **Open Two Accounts:** Rendu different browsers or browser profiles la, rendu different accounts open pannikonga (Attacker & Victim).
3.  **Perform Actions:** Victim account la oru action pannunga (e.g., change profile picture). Burp Suite la antha request-a capture pannunga.
4.  **Swap IDs:** Ippo antha request la irukura victim-oda ID-a eduthutu, attacker-oda ID-a podunga. Unga attacker browser-la irundhu antha request-a send pannunga (cookie/session maathradhukaga).
5.  **Check the Result:** Attacker-oda session-la irundhu, victim-oda data va maatha mudinjidha? Appo, you found an IDOR!

### Where to Look?
- Profile settings (\`/api/v1/users/me\`)
- Messaging features (\`/api/v1/messages/567\`)
- File upload/download endpoints (\`/download?file_id=abc\`)
- Shopping cart / order history (\`/orders/998\`)
- Password reset functionality

IDOR is a classic example of "Broken Access Control". Developers often focus on new features and forget to implement proper authorization checks. Namma velai, antha mistakes-a kandupudikradhu thaan. So, next time neenga oru app-a test pannumbodhu, always ask: **"Am I supposed to see this?"**.`,
        created_at: new Date(Date.now() - 86400000 * 11).toISOString(),
        comments: [],
        tags: ['idor', 'bughunting', 'accesscontrol', 'websecurity', 'owasp'],
        liked_by: [],
    },
    {
        id: 'b9b9b9b9-b9b9-b9b9-b9b9-b9b9b9b9b9b9',
        type: 'blog',
        title: "Imposter Syndrome-a Overcome Pannunga!",
        author: adminUser,
        content: `## "Naan fraud-u, kandupudichiduvangalo?" 😨
Indha feeling ungaluku vandhiruka? Neenga evlo thaan achieve pannalum, "Namma idhuku thagudhi illayo? Namma luck la pass aayitom, namma fraud-nu ellarum kandupudichiduvaangalo?" nu oru bayam. Adhu per thaan **Imposter Syndrome**.

Trust me, neenga thaniya illa. Even Albert Einstein had this feeling! Tech field la, especially cybersecurity la, idhu romba common. Yen na, daily pudhu pudhu vishayam vandhute irukum, namakku onnume therilayo nu thonum.

![A person looking into a mirror and seeing a different, more confident version of themselves.](https://images.unsplash.com/photo-1594499456952-25836a65b383?q=80&w=1974&auto=format&fit=crop)

### Yen Indha Feeling Varudhu?
- **Comparison:** Social media la aduthavanga achievements-a paathu (LinkedIn posts!), namma avlo worth illa nu compare pannikradhu.
- **Perfectionism:** Ellathayum 100% perfect-a pannanum nu nenaikradhu. Oru chinna thappu pannalum, namma waste nu feel panradhu.
- **Fear of Failure:** Thothu poita, aduthavanga enna nenaipaanga nu bayapadradhu.

### How to Fight Back? 🥊
Imposter syndrome-a muzhusa olikka mudiyadhu, but adha manage panna kathukalam.
1.  **Acknowledge and Share:** First, "Okay, I'm feeling like an imposter" nu accept pannikonga. Unga close friends kitta, mentors kitta share pannunga. Avangalum adhe maari feel pannirupanga nu solluvanga. You are not alone!
2.  **Track Your Achievements:** Oru chinna diary la, neenga pannuna chinna chinna achievements-a kuda ezhudhi veinga. "Indha CTF challenge solve pannen", "Indha concept kathukiten". Neenga down-a feel pannumbodhu, adha eduthu padichi paarunga.
3.  **Stop Comparing:** Remember, social media is a highlight reel. Neenga paakuradhu avanga success-a mattum thaan, avanga struggles-a illa. Unga journey-a, aduthavanga journey kooda compare pannadheenga.
4.  **Embrace "I Don't Know":** Ellame therinja யாரும் inga illa. Oru vishayam therilana, "theriyadhu, but I can learn" nu solradhula thappe illa. Adhu thaan growth mindset.
5.  **Teach What You Know:** Ungaluku therinja oru chinna vishayatha, unga juniors-ku solli kudunga. Appo thaan, ungaluke evlo theriyum nu oru confidence varum.

## You Belong Here.
Neenga indha field-ku vandhadhu unga hard work-ala thaan, luck-ala illa. You've earned your spot. So, chin up. Unga skills-a nambunga. Kathukite irunga, valarndukondirikkuka. The more you learn, the more you realize how much you don't know, and that's perfectly okay. Adhu thaan oru nalla learner-ku azhagu.`,
        created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        comments: [],
        tags: ['motivation', 'impostersyndrome', 'mentalhealth', 'career', 'selfhelp'],
        liked_by: [],
    },
    {
        id: 'ba101010-ba10-ba10-ba10-ba10101010ba',
        type: 'blog',
        title: "Internship Thedal: Oru Painful but Worthy Journey",
        author: adminUser,
        content: `## College la irukumbodhe experience venuma?
Ama bro, venum! Antha experience per thaan internship. Oru company la போய், real-world projects la work panni, industry epdi function aagudhu nu kathukuradhu thaan internship. Unga resume la oru nalla internship irundha, placement la ungaluku priority adhigam.

Aana, andha internship thedradhu iruke... sssaba! Adhu oru periya kadhai.

### Resume: Your First Weapon ⚔️
First, unga resume-a sharp-a ready pannunga.
- **One Page Rule:** Oru page-ku mela pogave koodadhu. Recruiters only spend 6-10 seconds on a resume.
- **Keywords:** Job description la irukura keywords-a (e.g., "Penetration Testing", "React", "AWS") unga resume la use pannunga.
- **Projects >>>> Grades:** Unga projects-a highlight panni kaatunga. Oru chinna project pannirundhaalum, adha ezhudhunga. Adhula neenga enna problem-a solve panneenga, enna technology use panneenga nu mention pannunga. GitHub link kandipa add pannunga.
- **No Lies:** Theriyadha vishayatha resume la podadheenga. Interview la maatikiteenga na, avlo thaan.

![A person working at a modern office desk with a laptop and coffee.](https://images.unsplash.com/photo-1552664730-d3077884978e?q=80&w=2070&auto=format&fit=crop)

### Enga Theduradhu?
1.  **LinkedIn:** No.1 platform. HRs, company founders-a direct-a connect panna mudiyum. Daily neraya internship openings post pannuvanga. Unga profile-a professional-a vechikonga.
2.  **Internshala / Wellfound (formerly AngelList Talent):** Especially for startups. Neraya opportunities irukum.
3.  **Company Career Pages:** Ungaluku pudicha companies oda career page-a regular-a check pannunga.
4.  **Referrals:** Idhu thaan most powerful. Unga seniors, friends yaaravadhu company la work pannanga na, avanga kitta referral kettu apply pannunga. Chance of getting shortlisted is very high.

### The "No Reply" Phase 😔
Neenga 100 company-ku apply pannirupeenga, but 5 company kitta irundhu kooda reply varadhu. Idhulaam romba normal. Manasu thalara koodadhu.
- **Customize Pannunga:** Ovvoru company-kum apply pannumbodhu, resume and cover letter-a antha job description-kuetha maari konjam maathunga.
- **Follow Up:** Apply panni one week aana aprom, antha company HR-ku LinkedIn la oru chinna follow-up message anupunga.
- **Keep Learning:** Reply varalaye nu feel panni, skill development-a stop pannidadheenga. Keep learning, keep building projects.

## The Interview Call 📞
Oru வழியா, interview call vandhuduchu. Ippo enna panradhu?
- **Research:** Antha company enna panranga, avanga products enna nu research pannikonga.
- **Prepare:** Job description la poturukura skills-a revise pannunga. Basics la romba strong-a irunga.
- **Be Confident:** Theriyadha question-a kooda, "I'm not sure, but here's how I would approach it..." nu unga thought process-a explain pannunga.

Internship theduradhu oru marathon, sprint illa. Romba patience venum. But kandipa unga hard work-ku palan kedaikum. So, keep applying and keep learning! All the best!`,
        created_at: new Date(Date.now() - 86400000 * 13).toISOString(),
        comments: [],
        tags: ['internship', 'collegelife', 'career', 'jobhunt', 'resume'],
        liked_by: [],
    },
    {
        id: 'bb111111-bb11-bb11-bb11-bb11111111bb',
        type: 'blog',
        title: "Reporting Your First Bug: Oru Professional Guide",
        author: adminUser,
        content: `## Bug Kandupudichachu! Aduthu Enna? 🎉
Congratulations! Neenga oru security vulnerability kandupudichiteenga. Idhu periya vishayam. Aana, unga velai inga mudiyala. Inime thaan mukkiamana part-e varudhu: Reporting.

Neenga evlo critical-aana bug kandupudichalum, adha sariya report pannalana, company adha purinjikama, unga report-a 'Informative' or 'Not Applicable' nu close panniduvanga. So, oru professional report epdi ezhudhradhu nu paapom.

![A person writing detailed notes in a notebook with a laptop nearby.](https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop)

### A Good Report Has 5 Parts
1.  **Title:** Clear and concise-a irukanum. Vulnerability type and location-a mention pannunga.
    - *Bad Title:* XSS bug
    - *Good Title:* Stored XSS on Profile Page via 'firstName' parameter
2.  **Vulnerability Details:** Indha vulnerability enna, idhoda impact enna nu short-a explain pannunga. Technical-a illama, business impact-a focus panni ezhudhunga.
    - *Example:* "This vulnerability allows an attacker to steal user session cookies by injecting malicious JavaScript into the profile page. This could lead to unauthorized account access for any user who views the malicious profile, potentially exposing their private data and allowing the attacker to perform actions on their behalf."
3.  **Steps to Reproduce (PoC):** Idhu thaan report-odaye heart! Neenga pannuna ovvoru step-ayum, number pottu theliva ezhudhunga. Oru non-technical person kooda, unga steps-a follow panna antha bug-a reproduce panna mudiyanum.
    - \`1. Go to https://example.com/profile\`
    - \`2. Enter <script>alert(document.cookie)</script> in the name field.\`
    - \`3. Click Save.\`
    - \`4. Refresh the page and observe the alert.\`
4.  **Proof of Concept (PoC):** Screenshots and videos are your best friends. Ovvoru step-kum screenshot eduthu, important parts-a highlight panni kaatunga. Oru chinna screen recording panni adha attach panna, innum super!
5.  **Impact & Mitigation:** Indha bug-ala enna badhipu varum nu detail-a sollunga. Ungaluku therinja, idhuku enna fix pannalam nu oru chinna suggestion kudukalam (e.g., "Implement context-aware output encoding on all user-supplied data", "Use parameterized queries to prevent SQL injection").

### Do's and Don'ts
- **DO** be professional and polite. "Unga site la periya security oattai iruku" nu sollama, "I have discovered a potential security vulnerability" nu aarambinga.
- **DON'T** demand a bounty. Adhu company policy poruthu. Neenga nalla report kudutha, avangale ungaluku reward pannuvanga.
- **DO** give them enough time to fix it. Public-a disclose panradhuku munnadi, company kitta permission kelunga.
- **DON'T** test out of scope. Company oda bug bounty policy-a nalla padichi, enna lam test panna koodadhu nu therinjikonga.

Oru nalla report, ungalukum company-kum naduvula oru nalla relationship-a build pannum. Future la avanga unga reports-ku priority kudupanga. So, take your time, and write a report that makes you proud. Happy reporting!`,
        created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
        comments: [],
        tags: ['bughunting', 'reporting', 'infosec', 'communication', 'professionalism'],
        liked_by: [],
    },
     {
      id: 'bc121212-bc12-bc12-bc12-bc12121212bc',
      type: 'blog',
      title: 'Consistency is Key: Daily Oru Step',
      author: adminUser,
      content: `## Periya Malai-a Paathu Bayam Vendaam! 🏔️
Namma career la periya goal vechirupom. "Naan Google la work pannanum", "Naan oru top bug bounty hunter aaganum". Aana, andha goal-a achieve panna evlo velai seiyanum nu nenaikum bodhu, bayam varum. "Ivlo kathukanuma? Nammalaala mudiyuma?" nu thonum.

Idhuku solution enna theriyuma? **Consistency.** Periya malai-a paakama, adutha oru adi-a mattum paathu veinga.

![A single plant sprout growing through cracked dry earth.](https://images.unsplash.com/photo-1455219452464-703b26a629ec?q=80&w=2070&auto=format&fit=crop)

### The Power of 1%
James Clear, 'Atomic Habits' book la solra maari, neenga dinamum 1% better aana, oru varushathula neenga **37 times** better aagiruveenga! Adhe, neenga dinamum 1% worse aana, almost zero-ku poiduveenga.

- 1.01 ^ 365 = 37.78
- 0.99 ^ 365 = 0.03

Andha 1% improvement perusa theriyalam. Adhu just 15-30 minutes of focused work every day.
- Daily oru coding problem.
- Daily oru security article.
- Daily 10 pages of a technical book.

### Motivation vs. Discipline
Motivation oru alai maari. Iniku irukum, naalaiku pogum. Neenga motivation-a nambi unga velaiya seiya aarmbicha, continuous-a panna maateenga.

Aana discipline apdi illa. Adhu oru habit. Pudichalum pudikalanalum, "naan indha nerathula idha pannanum" nu oru system create panradhu thaan discipline.
- **Schedule Your Time:** Unga calendar la, "5 PM to 6 PM - LeetCode" nu block pannunga. Adha oru meeting maari treat pannunga.
- **Don't Break the Chain:** Oru habit-a start panna, adha daily pannunga. Calendar la 'X' mark pannite vanga. Andha chain-a break panna manasu varakoodadhu. Miss pannaalum, adutha naale continue pannunga.
- **Start Small:** Daily 1 hour padikradhu kashtama? Paravalla. 15 minutes la start pannunga. But daily pannunga. Konjam konjam-a time-a increase pannunga.

### Boredom is a Good Sign
Oru vishayatha thirumba thirumba seiyum bodhu, bore adikum. Aana andha boredom-a thaandi varavanga thaan professionals aaguranga.
- A musician practices the same scale for hours.
- An athlete does the same drill for years.
- A great programmer solves thousands of problems.

The goal is not just to learn something new, but to master it. And mastery comes from repetition.

## Small Steps, Big Results
So, unga periya goal-a paathu malachu nikadheenga. Adha chinna chinna daily tasks-a maathunga. Andha chinna task-a mattum daily focus panni mudinga. Oru varusham kalichi, neenga enga irupeenga nu ungaluke theriyadhu.

Remember, the secret to getting ahead is getting started. Iniku, ippo, oru chinna step eduthu veinga. Trust the process. 🙏`,
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      comments: [],
      tags: ['motivation', 'consistency', 'habits', 'discipline', 'self-improvement'],
      liked_by: [],
    },
    {
      id: 'bd131313-bd13-bd13-bd13-bd13131313bd',
      type: 'blog',
      title: "Project Pannalama? Ideas & Execution Tips",
      author: adminUser,
      content: `## Resume-la Project Illaya? Appo Velai Konjam Kashtam!
College students-a interview pannumbodhu, HRs and technical leads paakura mukkiamana vishayam, "Indha paiyan/ponnu project pannirukangala?". Yen na, adhu thaan unga practical knowledge-a kaatum. Neenga 10 subjects la 'S' grade vechirundhalum, oru nalla project illana, unga resume weight-kammi thaan.

So, project pannuradhu romba romba mukkiyam. Aana enna project panradhu? Epdi start panradhu?

![A desk with a laptop, sticky notes, and a person's hands sketching out a user interface.](https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974&auto=format&fit=crop)

### Project Ideas Enga Theduradhu?
"Bro, enaku idea-ve varala" nu solra aala neenga? Inga sila tips:
1.  **Solve Your Own Problem:** Ungaluku daily life la edhavadhu oru prachanai iruka? Adha solve panna oru app create pannunga. (e.g., A simple expense tracker, a to-do list app with special features).
2.  **Clone and Add Features:** Oru famous app-a (Instagram, Twitter, Swiggy) clone pannunga. But apdiye pannama, ungaloda oru pudhu feature-a add pannunga.
3.  **Use Public APIs:** Neraya free APIs iruku (Weather API, Movies API, NASA API). Adha use panni oru interesting web app create pannunga.
4.  **Cybersecurity Projects:**
    - A simple keylogger in Python.
    - A port scanner tool.
    - A web application firewall (WAF) prototype.
    - A phishing detection browser extension.

### The Tech Stack Dilemma
"Naan enna technology kathukitu project panradhu?"
- **Web Development:** Idhu thaan easy-a start panna mudiyum, and results-um seekiram theriyum.
  - **Frontend:** HTML, CSS, JavaScript. Adhula konjam strong aana aprom, React or Vue.js kathukonga.
  - **Backend:** Node.js (JavaScript therinja easy) or Python (Django/Flask).
  - **Database:** PostgreSQL or MongoDB.
- **Mobile App Development:** Flutter (Dart) or React Native (JavaScript).
- **Cybersecurity:** Python is the king.

Romba yosikama, edhavadhu onna select panni, YouTube tutorials paathu start pannunga. Pooga pooga ungaluke puriyum.

### Execution Plan: The 4-Week Challenge
Oru project-a plan panni, 4 weeks la mudika try pannunga.
- **Week 1: Planning & UI Design:** Project-la enna features irukanum nu ezhudhunga. Figma-la simple-a UI design pannunga.
- **Week 2: Core Functionality:** Main feature-a build panna start pannunga. Login, data display maari basic vishayatha mudinga.
- **Week 3: Advanced Features & Backend:** Adutha features-a build pannunga. Database-oda connect pannunga.
- **Week 4: Testing, Bug Fixing & Deployment:** Unga project-a test panni, bugs-a fix pannunga. Netlify (for frontend), Heroku or Render (for backend) la free-a deploy pannunga.

## Done is Better Than Perfect
Unga first project perfect-a irukanum nu edhirpaakadheenga. Adhula neraya mistakes irukum. Aana paravalla. Oru project-a mudichathuku aprom kedaikura confidence, aduthu 10 project panna motivation kudukum.

So, inime "idea illa, time illa" nu solladheenga. Oru chinna idea eduthukonga, inike start pannunga. Unga GitHub profile-a projects-ala nerappunga! Happy coding! 💻`,
      created_at: new Date(Date.now() - 86400000 * 16).toISOString(),
      comments: [],
      tags: ['projects', 'collegelife', 'development', 'career', 'student'],
      liked_by: [],
    },
    {
      id: 'be141414-be14-be14-be14-be14141414be',
      type: 'blog',
      title: "Web Security Basics: OWASP Top 10 Simplified",
      author: adminUser,
      content: `## OWASP Top 10-na Adhu Enna Periya Vada Suttiya?
Neenga web security field-kulla enter aagureenga na, kandipa indha vaarthaiya kelvi paturpeenga. OWASP (Open Web Application Security Project) oru non-profit organization. Avanga web security awareness create panranga.

Avanga 10 most critical web application security risks-a list pottu, adha thaan "OWASP Top 10" nu solranga. Idhu thaan web security-oda "ABCD".

![A shield icon protecting a globe, representing web security.](https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=2069&auto=format&fit=crop)

### Let's Simplify It (Tanglish Style!)
1.  **Broken Access Control:** Idhu thaan IDOR-oda periya family. Ungaluku permission illadha oru page-a access panradhu, vera user-oda data-va paakuradhu, idhellam indha category la varum. (Example: \`user_id=123\`-a \`124\`-a maathradhu).
2.  **Cryptographic Failures:** Sensitive data-va (passwords, credit card numbers) sariya encrypt pannama, plain text-a save panradhu. Data breach aana, aparam govinda thaan!
3.  **Injection:** User input-a nambama, adha apdiye database query-layo, OS command-layo serkuradhu. SQL Injection, Command Injection-lam idhula varum.
4.  **Insecure Design:** Application-a design pannumbodhe, security-a yosikama design panradhu. Business logic flaws-lam inga varum.
5.  **Security Misconfiguration:** Server-la, database-la, framework-la default settings-a apdiye vitradhu. Unnecessary ports-a open la vekradhu, error messages la sensitive information-a kaatradhu.
6.  **Vulnerable and Outdated Components:** Neenga use panra libraries, frameworks-oda old version-a use panradhu. Adhula irukura therinja vulnerabilities-a vechi, hacker unga system-kulla varalam.
7.  **Identification and Authentication Failures:** Password policy weak-a irukradhu, brute force attack-a thadukama irukradhu, session management sariya illadhadhu.
8.  **Software and Data Integrity Failures:** Software updates-a verify pannama install panradhu, untrusted sources la irundhu data-va eduthu use panradhu.
9.  **Security Logging and Monitoring Failures:** Oru attack nadandha, adha kandupudika aal illama, log-e pannama irukradhu. Thirudan veetukulla vandhu poitana apram theriyum!
10. **Server-Side Request Forgery (SSRF):** Attacker unga server-a use panni, vera oru internal server-kooda (or external) pesa vekradhu. Idhu மூலமா internal network-a scan pannalam, cloud metadata-va access pannalam.

### Conclusion
Indha Top 10-a neenga purinjikitaale, oru web application-oda security posture-a analyze panna start pannidalam. Ovvoru category-layum innum neraya sub-topics iruku. Adha thedi thedi padinga. PortSwigger Web Security Academy is the best place to learn these practically.

So, next time oru website-a paakumbodhu, just oru user-a paakama, oru hacker-a yosichi paarunga! 😉`,
      created_at: new Date(Date.now() - 86400000 * 17).toISOString(),
      comments: [],
      tags: ['owasp', 'websecurity', 'hacking', 'cybersecurity', 'beginners'],
      liked_by: [],
    },
    {
      id: 'bf151515-bf15-bf15-bf15-bf15151515bf',
      type: 'blog',
      title: "Thinking Out of the Box: Logic Flaws Hunting",
      author: adminUser,
      content: `## Technical Bugs vs. Logic Bugs
XSS, SQLi, CSRF... idhellam technical vulnerabilities. Indha bugs-a kandupudika, namakku technical knowledge venum, and tools-um help pannum.

Aana, logic flaws apdi illa. Idhuku tools use aagadhu. Unga moolai-a thaan use pannanum. Oru application oda business logic-a purinjikitu, adha epdi abuse panna mudiyum nu yosikradhu thaan logic bug hunting.

Idhu thaan romba creative and interesting-aana part!

![A lightbulb made of gears and cogs, representing creative thinking.](https://images.unsplash.com/photo-1518057111172-46a7821381b1?q=80&w=1974&auto=format&fit=crop)

### Oru Sila Examples
Logic flaws ku end-ey kidayadhu. Ovvoru application-kum unique-a irukum. Inga sila common patterns:
1.  **E-commerce Price Manipulation:**
    - Oru product-a cart la add pannumbodhu, quantity-a -1 (minus one) nu maathi anupuna enna aagum? Sometimes, ungaluku refund kedaika chance iruku!
    - Two items-a ore nerathula cart la add pannumbodhu, race condition use panni, oru item-oda price-la rendu item-ayum vaanga mudiyuma?
2.  **Password Reset Abuse:**
    - Oru user-ku password reset link anupumbodhu, antha link-a guess panna mudiyuma?
    - "Forgot Password" page-a 1000 thadava request panna, antha user ku 1000 emails anupi, avanga inbox-a flood panna mudiyuma? (Email bombing)
3.  **Coupon/Referral Abuse:**
    - Oru coupon code-a multiple times use panna mudiyuma?
    - Ungaluke neenga referral pannikitu, referral bonus-a adaiya mudiyuma?
4.  **Rating/Review Abuse:**
    - Oru product-ku negative rating kuduka mudiyadha maari functionality iruka? (e.g., Only 4 or 5 stars allowed).
    - Rate limit illama, oru review-ku aayiram thadava like pottu, adha top-ku kondu vara mudiyuma?

### How to Find Logic Flaws?
- **Understand the Business:** First, application-oda purpose enna nu nalla purinjikonga. Avanga epdi panam sambadhikuranga? User journey epdi iruku?
- **Ask "What if?":** Ovvoru feature-ayum use pannumbodhu, "What if I do this instead?" nu yosinga. "What if I skip this step?", "What if I send this request twice?".
- **Think Like a Criminal:** Neenga oru thirudana irundha, indha system-a epdi cheat pannuveenga nu yosinga. The goal is to break the rules that the developer assumed you would follow.
- **Map the Application:** Burp Suite use panni, application-oda ella endpoints-ayum map pannunga. User flow-a visualise panni paarunga. Enga weak points iruku nu kandupudikalam.

Logic bug hunting requires a different mindset. It's less about code and more about creativity and curiosity. Indha bugs kandupudikradhu konjam kashtam, aana kedaikura satisfaction-um, bounty-um adhigama irukum. So, put on your thinking cap! 🧠`,
      created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
      comments: [],
      tags: ['logicflaws', 'bughunting', 'creativehacking', 'websecurity', 'mindset'],
      liked_by: [],
    },
    {
      id: 'c0161616-c016-c016-c016-c016161616c0',
      type: 'blog',
      title: "Burnout-a Avoid Pannunga: Self-Care for Hackers",
      author: adminUser,
      content: `## Screen-a Paathu Paathu Kannu Valikudha? 😫
Hacking, coding, bug hunting... idhellam romba interesting-aana vishayangal. Aana, adhe nerathula romba mentally draining-um kooda. Mani kanak-a computer munnadi ukandhu, chinna chinna vishayatha theditu irukum bodhu, easy-a burnout aagalam.

Burnout-na enna? Adhu just tiredness illa. Adhu oru state of complete physical, mental, and emotional exhaustion. "Inime ennala mudiyadhu" nu thonum.

### Signs of Burnout
- Constant tiredness, even after sleeping
- No motivation to work or learn
- Feeling cynical about your work
- Headaches, eye strain, back pain
- Getting irritated easily

Indha symptoms irundha, be careful. It's time to take a step back.

![A person relaxing in a hammock between two trees in a peaceful forest.](https://images.unsplash.com/photo-1528819622765-d6bcf132f793?q=80&w=2070&auto=format&fit=crop)

### Self-Care is Not Selfish. It's Necessary.
Unga health thaan unga biggest asset. Adha paathukonga.
1.  **The 20-20-20 Rule:** Ovvoru 20 nimishathukum, 20 feet thoorathula irukura oru porula, 20 seconds paakanum. Idhu unga eye strain-a korakum.
2.  **Take Real Breaks:** Break-na phone use panradhu illa. Ezhundhu nadakkuka. Konja neram veliya poi, fresh air-a swasichitu vanga. Music kelunga.
3.  **Hydration is Key:** Thanni neraya kudinga. Dehydration will make you feel tired and lose focus.
4.  **Nalla Thoongunga:** Minimum 7-8 hours of quality sleep romba mukkiyam. Thoonguradhuku 1 hour munnadi screens-a avoid pannunga.
5.  **Exercise Pannunga:** Daily oru 30 minutes exercise. Walking, jogging, gym... edhavadhu onnu. Physical activity will boost your mental energy.
6.  **Have a Hobby:** Hacking-a thavira, ungaluku pudicha vera edhavadhu oru hobby vechikonga. Sports, music, drawing, reading... anything that takes your mind off screens.

### It's a Marathon, Not a Sprint
Cybersecurity field romba vast-aana field. Ellathayum ore naal la kathuka mudiyadhu. Porumaiya, consistency-a kathukonga. Aduthavanga kooda compare panni, ungaluku neengale pressure pottukadheenga.

Unga mental and physical health is more important than any bug or any bounty. Remember to log off. Unga life computer-ku veliyayum iruku. Adhayum enjoy pannunga. Take care, fam! ❤️`,
      created_at: new Date(Date.now() - 86400000 * 19).toISOString(),
      comments: [],
      tags: ['burnout', 'mentalhealth', 'selfcare', 'motivation', 'worklifebalance'],
      liked_by: [],
    },
    {
      id: 'c1171717-c117-c117-c117-c117171717c1',
      type: 'blog',
      title: "Password Cracking 101: From Brute Force to Rainbow Tables",
      author: adminUser,
      content: `## 'Password123' - Still a Thing?
Aama, unfortunately. Weak passwords thaan neraya security breaches-ku kaaranam. Oru hacker oru system-kulla varanumna, avanoda first attempt-a password-a crack panradha thaan irukum. Epdi panranga nu therinjikita thaan, namma epdi strong-aana password vekanum nu puriyum.

### Method 1: Brute Force Attack (The Dumb Way)
Idhu thaan simplest method. 'a', 'b', 'c', 'aa', 'ab'... nu possible aana ella combinations-ayum try panradhu. Oru 4-digit PIN-a crack panna (0000 to 9999), 10,000 attempts podhum. Aana oru 8-character password with uppercase, lowercase, numbers, and symbols-a brute force panna, years aagum! So, idhu chinna passwords-ku mattum thaan work aagum.

![A digital padlock with binary code flowing around it.](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop)

### Method 2: Dictionary Attack (The Smarter Way)
Most people use common words as passwords. Hacker-unga oru periya wordlist (dictionary) vechirupanga. Adhula irukura ovvoru word-ayum try panni paapanga.
- \`password\`
- \`qwerty\`
- \`iloveyou\`
- \`monkey\`
Indha wordlist-oda numbers and symbols-ayum serthu try pannuvanga. (e.g., \`monkey123\`, \`Password!\`). Tools like **John the Ripper** and **Hashcat** idhula romba powerful.

### Method 3: Rainbow Table Attack (The Fastest Way)
Indha method-a purinjikuradhuku munnadi, 'hashing'-na enna nu theriyanum. Namma password-a database la apdiye save panna maatanga. Adha oru hash function (like SHA-256) kulla anupi, oru fixed-length string-a maathi thaan save pannuvanga.
- \`password123\` -> \`ef92b778bafe771e89245b89ecbc08a44a4e166c066ce9f4d45ba84d\`

Rainbow table-na enna na, pre-computed hashes oda oru periya list. Hacker database la irundhu hash-a eduthu, antha hash avanoda rainbow table la iruka nu theduvaan. Match aana, password kandupudichidalam. Idhu romba fast-aana method.

Aana, 'salting' nu oru technique use panna, rainbow tables work aagadhu. Salt-na oru random string, adha password-oda serthu hash pannuvanga. Ovvoru user-kum different salt use panradhala, pre-computed tables waste aayidum.

### How to Protect Yourself?
- **Long Passwords are Key:** 12 characters-ku mela irukura password use pannunga. Length is more important than complexity. Oru simple sentence kooda use pannalam. (\`ilovemychennaicity!\`)
- **Use a Password Manager:** LastPass, Bitwarden maari password managers use pannunga. Adhuve ungaluku strong, unique passwords generate panni, save pannikum. Neenga oru master password-a mattum nyabagam vecha podhum.
- **Enable 2FA:** Two-Factor Authentication kandipa enable pannunga. Adhu thaan unga ultimate protection. Password thiruda ponaalum, unga phone illama login panna mudiyadhu.

So, inime weak-aana password vekadheenga. Be smart, be secure! 🛡️`,
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
      comments: [],
      tags: ['passwordcracking', 'hacking', 'cybersecurity', 'basics', 'securityawareness'],
      liked_by: [],
    }
];


export const MOCK_BLOG_POSTS: Post[] = [...existingPosts, ...newPosts];
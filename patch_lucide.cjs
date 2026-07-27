const fs = require('fs');
let content = fs.readFileSync('pages/AdminDashboardPage.tsx', 'utf8');

content = content.replace("import { Server } from 'lucide-react';", "import { Server, Monitor as MonitorIcon, Smartphone as SmartphoneIcon, UserPlus as UserPlusIcon, FileText as DocumentTextIcon, Megaphone as MegaphoneIcon, Settings2 as Settings2Icon, Activity as ActivityIcon, Inbox as InboxIcon } from 'lucide-react';");

fs.writeFileSync('pages/AdminDashboardPage.tsx', content, 'utf8');

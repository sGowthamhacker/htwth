


import { User } from '../types';

export const MOCK_USERS: User[] = [
  { 
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    name: 'Gowtham S', 
    email: 'ragow49@gmail.com', 
    avatar: `https://i.pravatar.cc/150?u=ragow49@gmail.com`, 
    role: 'admin', 
    writeup_access: 'write',
    bio: "Final-year CSE student passionate about cybersecurity and full-stack development. Skilled in ethical hacking, web app security, and building resilient systems. Always learning and ready for the next challenge.",
    gender: 'Male',
    skills: ['Kali Linux', 'Wireshark', 'Burp Suite', 'Metasploit', 'Nmap', 'React', 'TypeScript', 'Node.js', 'Git', 'GitHub'],
    is_profile_private: false,
    friends: [],
    friend_requests: [],
    created_at: '2024-01-15T10:00:00.000Z',
    status: 'verified',
    verified_at: '2024-01-15T10:01:00.000Z',
    admin_verified: true,
    doc_access: true,
    welcome_email_sent: true,
    is_2fa_enabled: false,
    backup_codes: ['123456', '789012', '345678'],
  }
];
import { Post } from '../types';
import { MOCK_USERS } from './users';

const gowtham = MOCK_USERS.find(u => u.email === 'ragow49@gmail.com') || MOCK_USERS[0];

export const MOCK_POSTS: Post[] = [
  {
    id: '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a',
    type: 'writeup',
    title: 'Stored XSS on User Profile Page via Nickname',
    author: gowtham,
    content: '## Summary\nA stored Cross-Site Scripting (XSS) vulnerability was discovered on the user profile page. An attacker can set a malicious payload as their nickname, which gets executed in the browser of any user visiting their profile, potentially leading to session hijacking.\n\n## Steps to Reproduce\n1. Log in to an attacker account.\n2. Navigate to the profile settings page.\n3. In the "Nickname" field, enter the payload: `<script>alert(document.cookie)</script>`.\n4. Save the profile.\n5. Log in with a victim account and visit the attacker\'s profile page.\n6. Observe the alert box executing the payload.',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    comments: [],
    tags: ['xss', 'stored-xss', 'profile', 'javascript'],
    severity: 'High',
    liked_by: [],
    reward: 'bounty',
  },
  {
    id: '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b',
    type: 'writeup',
    title: 'Insecure Direct Object Reference (IDOR) in Document Access',
    author: gowtham,
    content: '## Summary\nA critical IDOR vulnerability allows any authenticated user to access sensitive documents belonging to other users by manipulating a document ID parameter in the URL. The backend fails to verify if the requesting user is authorized to view the requested document.\n\n## Impact\nThis vulnerability exposes all user-uploaded documents, including potentially confidential information, leading to a massive data breach.',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    comments: [],
    tags: ['idor', 'authorization', 'broken-access-control'],
    severity: 'Critical',
    liked_by: [],
  },
  {
    id: '3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c',
    type: 'writeup',
    title: 'SQL Injection via Search Parameter',
    author: gowtham,
    content: '## Summary\nThe main search functionality is vulnerable to SQL Injection. By injecting malicious SQL queries into the search parameter, an attacker can bypass authentication and extract sensitive information from the database, including user credentials.\n\n## Technical Details\nThe vulnerable parameter is `q` in the `/api/search` endpoint. The backend concatenates this parameter directly into a SQL query without proper sanitization or use of prepared statements.',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
    comments: [],
    tags: ['sql-injection', 'database', 'authentication-bypass'],
    severity: 'Critical',
    liked_by: [],
    reward: 'bounty',
  },
];
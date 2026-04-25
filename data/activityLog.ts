import { ActivityLog } from '../types';
import { MOCK_USERS } from './users';

// Helper function to find users safely
const findUser = (email: string) => MOCK_USERS.find(u => u.email === email)!;

// NOTE: This is fallback data. In a real scenario, this would be fetched from the database.
export const MOCK_ACTIVITY_LOG: ActivityLog[] = [
    {
        id: 1,
        user: findUser('ragow49@gmail.com'),
        action: 'logged in',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
        id: 2,
        user: findUser('ragow49@gmail.com'),
        action: 'created a new post titled',
        target: 'Stored XSS on User Profile Page via Nickname',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
    },
    {
        id: 3,
        user: findUser('ragow49@gmail.com'),
        action: 'updated their profile',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
];

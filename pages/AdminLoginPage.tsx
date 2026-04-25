import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { getUserByFirebaseUid, getGlobalSettings } from '../services/database';

const AdminLoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userProfile = await getUserByFirebaseUid(userCredential.user.uid);
            
            const settings = await getGlobalSettings();
            if (settings && settings.isMaintenanceMode && userProfile?.role !== 'admin') {
                await signOut(auth);
                setError('System is under maintenance. Please try again later.');
                setIsLoading(false);
                return;
            }

            if (!userProfile || userProfile.role !== 'admin') {
                await signOut(auth);
                setError('Access denied. Admin only.');
                setIsLoading(false);
                return;
            }
            
            window.location.hash = '#/';
        } catch (err) {
            setError('Invalid email or password.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
            <form onSubmit={handleLogin} className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 w-96">
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Admin Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-3 mb-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    required
                    disabled={isLoading}
                />
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-3 mb-6 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    required
                    disabled={isLoading}
                />
                <button type="submit" className="w-full p-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors mb-4 disabled:opacity-50" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <button 
                    type="button" 
                    onClick={() => window.location.hash = '#/'}
                    className="w-full p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm transition-colors"
                    disabled={isLoading}
                >
                    Back to Home
                </button>
            </form>
        </div>
    );
};

export default AdminLoginPage;

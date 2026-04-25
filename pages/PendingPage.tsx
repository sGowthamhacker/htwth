import React from 'react';
import ClockIcon from '../components/icons/ClockIcon';

interface PendingPageProps {
  onLogout: () => void;
  isExiting: boolean;
}

const PendingPage: React.FC<PendingPageProps> = ({ onLogout, isExiting }) => {
    return (
        <div className={`w-full max-w-md bg-slate-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-8 md:p-10 text-center text-white ${isExiting ? 'animate-slide-down-and-fade' : 'animate-slide-up'}`}>
            <ClockIcon className="w-16 h-16 mx-auto mb-6 text-indigo-400" />
            <h2 className="text-3xl font-extrabold mb-2">Pending Approval</h2>
            <p className="text-slate-400 mb-8">
                Your email has been verified successfully. An administrator will review your account shortly. You will be able to log in once your account is approved.
            </p>
            <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
                Logout
            </button>
        </div>
    );
};

export default PendingPage;
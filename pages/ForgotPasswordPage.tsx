import React, { useState, useEffect } from 'react';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import MailIcon from '../components/icons/MailIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';

interface ForgotPasswordPageProps {
  onSendResetLink: (email: string) => Promise<string | void>;
  onGoToLogin: () => void;
  isExiting: boolean;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onSendResetLink, onGoToLogin, isExiting }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const errorMessage = await onSendResetLink(email);
        setLoading(false);
        if (errorMessage) {
            setError(errorMessage);
        } else {
            setSuccess(true);
        }
    };

    return (
        <div className={`container is-forgot-password-page ${isVisible ? 'is-visible' : ''} ${isExiting ? 'animate-slide-down-and-fade' : ''}`} style={{ height: 'auto', minHeight: '500px', maxWidth: '800px' }}>
            <div className="forms-container">
                <div className="signin-signup" style={{ left: '75%', top: '50%', width: '50%' }}>
                    <div className="flex flex-col items-center justify-center w-full px-4 sm:px-8">
                        {success ? (
                            <div className="text-center">
                                <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500 dark:text-green-400" />
                                <h2 className="title !text-2xl">Check Your Email</h2>
                                <p className="text-slate-500 dark:text-slate-400 my-4 text-sm">
                                    If an account with <strong className="text-slate-800 dark:text-slate-200">{email}</strong> exists, we've sent instructions to reset your password.
                                </p>
                                <button
                                    onClick={onGoToLogin}
                                    className="btn mt-4"
                                >
                                    Return to Login
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="w-full text-center">
                                <h2 className="title">Forgot Password?</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                                    No worries. Enter your email and we'll send you a reset link.
                                </p>
                                <div className="auth-input-field">
                                    <input id="reset-email" type="email" placeholder=" " value={email} onChange={e => setEmail(e.target.value)} required />
                                    <label htmlFor="reset-email">Your Email Address</label>
                                    <MailIcon />
                                </div>
    
                                {error && <p className="text-xs text-red-500 dark:text-red-400 mt-2">{error}</p>}
    
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn mt-4 w-full"
                                >
                                    {loading ? <SpinnerIcon className="w-6 h-6" /> : 'Send Reset Link'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <div className="panels-container">
                <div className="panel left-panel">
                    <div className="content">
                        <h3>Remembered password?</h3>
                        <p>
                            Great! You can head back to the sign-in page now.
                        </p>
                        <button className="btn transparent" id="sign-in-btn" onClick={onGoToLogin}>
                            Sign in
                        </button>
                    </div>
                </div>
                {/* Empty right panel is needed to keep the left panel on the left side during mobile view transitions */}
                <div className="panel right-panel" style={{pointerEvents: 'none'}}>
                    <div className="content" style={{transform: 'translateX(800px)'}}>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
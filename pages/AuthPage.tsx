
import React, { useState, FC, useEffect, useRef } from 'react';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import MailIcon from '../components/icons/MailIcon';
import LockIcon from '../components/icons/LockIcon';
import UserIcon from '../components/icons/UserIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import KeyIcon from '../components/icons/KeyIcon';
import EnvelopeOpenIcon from '../components/icons/EnvelopeOpenIcon';
import { GlobalNotification } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import EyeIcon from '../components/icons/EyeIcon';
import EyeSlashIcon from '../components/icons/EyeSlashIcon';
import SupportBot from '../components/SupportBot';

type AuthMode = 'signin' | 'signup' | 'verify' | '2fa' | '2fa-magic-link' | 'forgot-password';

interface AuthPageProps {
  initialMode?: AuthMode;
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<string | void>;
  onSignup: (name: string, email: string, password: string) => Promise<string | void>;
  onSocialLogin: (provider: 'google' | 'github') => Promise<string | void>;
  onForgotPassword: (email: string) => Promise<string | void>;
  isExiting: boolean;
  email: string | null;
  onResend: () => void;
  onGoToLogin: () => void;
  onCheckStatus: () => void;
  isResending: boolean;
  resendCooldown: number;
  onResendMagicLink: () => void;
  onVerify2FACode: (code: string) => Promise<void>;
  isVerifying2FACode: boolean;
  twoFACodeError: string | null;
  twoFAAttemptFailed: number;
  onClear2FAError: () => void;
  onContactAdmin: (from: GlobalNotification['from'], message: string) => void;
  onBackToHome: () => void;
}

const VisitorCounter: React.FC = () => {
  const [visits, setVisits] = useState<string>('...');

  useEffect(() => {
    // Simple local storage counter simulation
    const key = 'site_visitor_count';
    const stored = localStorage.getItem(key);
    let count = stored ? parseInt(stored, 10) : 14205; // Start from a nice number
    
    const sessionKey = 'visit_counted';
    if (!sessionStorage.getItem(sessionKey)) {
        count++;
        localStorage.setItem(key, count.toString());
        sessionStorage.setItem(sessionKey, 'true');
    }
    
    setVisits(count.toLocaleString());
  }, []);

  return (
    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-full shadow-lg z-50 pointer-events-none animate-fade-in select-none">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
        <span className="text-xs font-medium text-slate-200 whitespace-nowrap">
            Visitors: <span className="font-bold text-white">{visits}</span>
        </span>
    </div>
  );
};

const AuthPage: FC<AuthPageProps> = ({ 
    initialMode = 'signin',
    onLogin, onSignup, onSocialLogin, onForgotPassword, isExiting,
    email, onResend, onGoToLogin, onCheckStatus, isResending, resendCooldown,
    onResendMagicLink,
    onVerify2FACode,
    isVerifying2FACode,
    twoFACodeError,
    twoFAAttemptFailed,
    onClear2FAError,
    onContactAdmin,
    onBackToHome
}) => {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    
    // State to track if virtual keyboard is likely open (mobile only)
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const initialHeight = useRef(typeof window !== 'undefined' ? window.innerHeight : 0);

    // Password visibility states
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    // Keyboard Detection Logic to hide bottom elements
    useEffect(() => {
        const handleResize = () => {
            // Only apply this logic on mobile/tablet widths
            if (window.innerWidth <= 1024) {
                const currentHeight = window.innerHeight;
                // If height shrinks by more than 20% compared to initial load, assume keyboard is open
                const threshold = initialHeight.current * 0.20;
                if (initialHeight.current - currentHeight > threshold) {
                    setIsKeyboardOpen(true);
                } else {
                    setIsKeyboardOpen(false);
                }
            } else {
                setIsKeyboardOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    // Signup State
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);
    const [signupError, setSignupError] = useState<string | null>(null);

    // Forgot Password State
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState<string | null>(null);
    const [forgotSuccess, setForgotSuccess] = useState(false);
    
    // 2FA Code State
    const [twoFACode, setTwoFACode] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const twoFAAttemptRef = useRef(twoFAAttemptFailed);

    useEffect(() => {
        if (twoFAAttemptFailed > twoFAAttemptRef.current) {
            twoFAAttemptRef.current = twoFAAttemptFailed;
            setIsShaking(true);
            setTwoFACode(''); // Clear the input on failure
            const timer = setTimeout(() => setIsShaking(false), 500); // Match animation duration
            return () => clearTimeout(timer);
        }
    }, [twoFAAttemptFailed]);

    const handleSupportBotContact = async (name: string, email: string, message: string) => {
        // Optimistic UI update via notification callback
        onContactAdmin({ name, email, avatar: '', role: 'user' }, message);
        
        // Mock success
        return { success: true };
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError(null);
        try {
            const errorMessage = await onLogin(loginEmail, loginPassword, rememberMe);
            if (errorMessage) {
                setLoginError(errorMessage);
            }
        } catch (err: any) {
            console.error("An unexpected error occurred during login:", err);
            setLoginError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupLoading(true);
        setSignupError(null);
        const errorMessage = await onSignup(signupName, signupEmail, signupPassword);
        setSignupLoading(false);
        if (errorMessage) setSignupError(errorMessage);
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotError(null);
        setForgotSuccess(false);
        const errorMessage = await onForgotPassword(forgotEmail);
        setForgotLoading(false);
        if (errorMessage) {
            setForgotError(errorMessage);
        } else {
            setForgotSuccess(true);
        }
    };

    const handle2FASubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify2FACode(twoFACode);
    };

    const handle2FACodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onClear2FAError();
        setTwoFACode(e.target.value);
    };
    
    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        // Clear errors and form fields on mode switch
        setLoginError(null); setSignupError(null); onClear2FAError();
        setLoginEmail(''); setLoginPassword(''); setRememberMe(false);
        setSignupName(''); setSignupEmail(''); setSignupPassword('');
        setForgotEmail(''); setForgotError(null); setForgotSuccess(false);
        setTwoFACode('');
        setShowLoginPassword(false);
        setShowSignupPassword(false);
    }

    const containerClasses = [
        'container',
        mode === 'signup' ? 'sign-up-mode' : '',
        mode === 'verify' ? 'verify-email-mode' : '',
        mode === 'forgot-password' ? 'forgot-password-mode' : '',
        mode === '2fa' ? 'two-fa-mode' : '',
        mode === '2fa-magic-link' ? 'two-fa-magic-link-mode' : '',
        isExiting ? 'animate-slide-down-and-fade' : 'animate-slide-up',
    ].filter(Boolean).join(' ');


    return (
      <>
        <button 
            onClick={onBackToHome}
            className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full"
        >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium leading-none pt-0.5">Back</span>
        </button>
        <div className={containerClasses}>
          <div className="forms-container">
              <div className="signin-signup">
                  {/* Sign In Form */}
                  <form onSubmit={handleLoginSubmit} className="sign-in-form" aria-label="Sign-in form">
                      <h2 className="title">Sign in</h2>
                      <div className="auth-input-field">
                          <input id="login-email" type="email" placeholder=" " value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required autoComplete="username" />
                          <label htmlFor="login-email">Email</label>
                          <MailIcon />
                      </div>
                      <div className="auth-input-field">
                          <input 
                            id="login-password" 
                            type={showLoginPassword ? "text" : "password"} 
                            placeholder=" " 
                            value={loginPassword} 
                            onChange={e => setLoginPassword(e.target.value)} 
                            required 
                            autoComplete="current-password" 
                          />
                          <label htmlFor="login-password">Password</label>
                          {showLoginPassword ? (
                              <EyeSlashIcon className="cursor-pointer" onClick={() => setShowLoginPassword(false)} />
                          ) : (
                              <EyeIcon className="cursor-pointer" onClick={() => setShowLoginPassword(true)} />
                          )}
                      </div>
                      <div className="form-options">
                          <label className="remember-me">
                              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                              <span>Remember me</span>
                          </label>
                          <button type="button" onClick={() => switchMode('forgot-password')} className="forgot-password">
                              Forgot password?
                          </button>
                      </div>
                      {loginError && <p className="text-xs text-red-500 mt-2">{loginError}</p>}
                      <button type="submit" disabled={loginLoading} className="btn solid btn-full">
                           {loginLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Login'}
                      </button>
                  </form>
  
                  {/* Sign Up Form */}
                  <form onSubmit={handleSignupSubmit} className="sign-up-form" aria-label="Sign-up form">
                      <h2 className="title">Sign up</h2>
                      <div className="auth-input-field">
                          <input id="signup-name" type="text" placeholder=" " value={signupName} onChange={e => setSignupName(e.target.value)} required autoComplete="username" />
                          <label htmlFor="signup-name">Username</label>
                          <UserIcon />
                      </div>
                      <div className="auth-input-field">
                          <input id="signup-email" type="email" placeholder=" " value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required autoComplete="email" />
                          <label htmlFor="signup-email">Email</label>
                          <MailIcon />
                      </div>
                      <div className="auth-input-field">
                           <input 
                                id="signup-password" 
                                type={showSignupPassword ? "text" : "password"} 
                                placeholder=" " 
                                value={signupPassword} 
                                onChange={e => setSignupPassword(e.target.value)} 
                                required 
                                minLength={6} 
                                autoComplete="new-password" 
                           />
                          <label htmlFor="signup-password">Password</label>
                          {showSignupPassword ? (
                              <EyeSlashIcon className="cursor-pointer" onClick={() => setShowSignupPassword(false)} />
                          ) : (
                              <EyeIcon className="cursor-pointer" onClick={() => setShowSignupPassword(true)} />
                          )}
                      </div>
                      {signupError && <p className="text-xs text-red-500 mt-2">{signupError}</p>}
                      <button type="submit" disabled={signupLoading} className="btn btn-full">
                          {signupLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Sign Up'}
                      </button>
                  </form>
  
                   {/* Verify Email Form */}
                  <form className="verify-email-form flex flex-col items-center" aria-label="Verify email form">
                      <h2 className="title">Almost there!</h2>
                      <p className="text-slate-500 dark:text-slate-400 mt-2 text-center text-sm">
                          A verification link has been sent to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>. Please check your inbox and click the link to continue.
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-4 text-center text-xs font-semibold">
                          You must log in after verifying.
                      </p>
                      <div className="mt-6 space-y-4 w-full max-w-sm flex flex-col items-center">
                          <div className="flex gap-4 w-full">
                              <button type="button" onClick={onGoToLogin} className="btn flex-1 !m-0">
                                  Log In
                              </button>
                              <button 
                                  type="button" 
                                  onClick={onResend} 
                                  disabled={isResending || resendCooldown > 0}
                                  // Force white background and indigo text explicitly to ensure visibility
                                  style={{ backgroundColor: 'white', color: '#4f46e5', backgroundImage: 'none' }}
                                  className={`flex-1 flex items-center justify-center h-[49px] rounded-[49px] uppercase font-semibold text-sm border-2 border-indigo-500 hover:bg-indigo-50 transition-all duration-200 shadow-sm ${resendCooldown > 0 ? 'cursor-not-allowed opacity-80' : ''}`}
                              >
                                  {isResending ? (
                                    <SpinnerIcon className="w-5 h-5 animate-spin text-indigo-600" />
                                  ) : resendCooldown > 0 ? (
                                    <span className="font-mono font-bold" style={{ color: '#4f46e5' }}>Retry in {resendCooldown}s</span>
                                  ) : (
                                    <span className="font-semibold" style={{ color: '#4f46e5' }}>Resend Link</span>
                                  )}
                              </button>
                          </div>
                      </div>
                  </form>
  
                  {/* Forgot Password Form */}
                  <form onSubmit={handleForgotSubmit} className="forgot-password-form" aria-label="Forgot password form">
                      {forgotSuccess ? (
                          <div className="text-center">
                              <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
                              <h2 className="title">Check Your Inbox</h2>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">If an account with <strong>{forgotEmail}</strong> exists, a password reset link has been sent.</p>
                          </div>
                      ) : (
                          <>
                              <h2 className="title">Reset Password</h2>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">
                                  Enter your email and we'll send you a link to reset your password.
                              </p>
                              <div className="auth-input-field">
                                  <input id="forgot-email" type="email" placeholder=" " value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required autoFocus autoComplete="email" />
                                  <label htmlFor="forgot-email">Email</label>
                                  <MailIcon />
                              </div>
                              {forgotError && <p className="text-xs text-red-500 mt-2">{forgotError}</p>}
                              <button type="submit" disabled={forgotLoading} className="btn mt-4">
                                  {forgotLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Send Reset Link'}
                              </button>
                          </>
                      )}
                  </form>
  
                  {/* 2FA Code Entry Form */}
                  <form onSubmit={handle2FASubmit} className="two-fa-form" aria-label="Two-factor code entry form">
                      <h2 className="title">Enter Code</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 text-center">
                          Please enter the 6-digit code from your authenticator app or one of your 6-character backup codes.
                      </p>
                      <div className={`auth-input-field ${isShaking ? 'animate-shake' : ''}`}>
                          <input id="2fa-code" type="text" placeholder=" " value={twoFACode} onChange={handle2FACodeChange} required maxLength={8} autoFocus autoComplete="off" />
                          <label htmlFor="2fa-code">Verification Code</label>
                          <KeyIcon />
                      </div>
                      {twoFACodeError && <p className="text-xs text-red-500 mt-2">{twoFACodeError}</p>}
                      <button type="submit" disabled={isVerifying2FACode || !twoFACode.trim()} className="btn mt-4 btn-full">
                          {isVerifying2FACode ? <SpinnerIcon className="w-5 h-5" /> : 'Verify Code'}
                      </button>
                  </form>
                  
                   {/* 2FA Magic Link Form */}
                  <form className="two-fa-magic-link-form flex flex-col items-center" aria-label="Check email for 2FA link form">
                      <EnvelopeOpenIcon className="w-16 h-16 mb-4 text-indigo-500 dark:text-indigo-400" />
                      <h2 className="title">Check Your Inbox</h2>
                      <p className="text-slate-500 dark:text-slate-400 mt-2 text-center text-sm">
                          We've sent a secure login link to <strong className="text-slate-800 dark:text-slate-200">{email}</strong> to complete your sign-in.
                      </p>
                      <div className="mt-8 flex justify-center gap-4">
                          <button type="button" onClick={onGoToLogin} className="btn transparent">
                              Back to Login
                          </button>
                          <button type="button" onClick={onResendMagicLink} className="btn transparent">
                              Use another code
                          </button>
                      </div>
                  </form>
              </div>
          </div>
  
          <div className="panels-container">
              <div className="panel left-panel">
                   <div className="content content-signin stagger-children">
                      <h3>New here?</h3>
                      <p>Join us today and discover a world of possibilities. Create your account in seconds!</p>
                      <button className="btn transparent" id="sign-up-btn" onClick={() => switchMode('signup')}>Sign up</button>
                  </div>
                  <div className="content content-verify stagger-children">
                      <h3>Almost there...</h3>
                      <p>A verification link has been sent to your email. Click it to activate your account, then return to sign in.</p>
                      <button className="btn transparent" onClick={onGoToLogin}>Back to Sign In</button>
                  </div>
              </div>
              <div className="panel right-panel">
                  <div className="content content-signup stagger-children">
                      <h3>One of us?</h3>
                      <p>Welcome back! Sign in to continue your journey with us.</p>
                      <button className="btn transparent" id="sign-in-btn" onClick={() => switchMode('signin')}>Sign in</button>
                  </div>
                  <div className="content content-forgot stagger-children">
                      <h3>Remembered It?</h3>
                      <p>Great! Click here to go back to the sign-in page.</p>
                      <button className="btn transparent" onClick={() => switchMode('signin')}>Sign in</button>
                  </div>
                  <div className="content content-two-fa stagger-children">
                      <h3>Enter Your Code</h3>
                      <p>One last step to secure your account. Enter one of your backup codes.</p>
                      <button className="btn transparent" onClick={() => switchMode('signin')}>Back to Sign In</button>
                  </div>
                  <div className="content content-two-fa-magic-link stagger-children">
                      <h3>Security First</h3>
                      <p>For your security, a unique sign-in link has been sent to your email address.</p>
                      <button className="btn transparent" onClick={onGoToLogin}>Back to Sign In</button>
                  </div>
              </div>
          </div>
        </div>
        
        {/* Hide bottom elements when virtual keyboard is open on mobile to prevent clutter and jumping */}
        {!isKeyboardOpen && (
            <>
                <VisitorCounter />
                <SupportBot onSendAdminMessage={handleSupportBotContact} />
            </>
        )}
      </>
    );
};

export default AuthPage;

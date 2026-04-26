
import React, { useState, useCallback, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { useTime } from './contexts/TimeContext';

// Keep critical path components static
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import MicrochipLoader from './components/MicrochipLoader';
import ElevenLabsWidget from './components/ElevenLabsWidget';

// Lazy load secondary pages
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const StatusPage = lazy(() => import('./pages/StatusPage'));
import { User, ThemeStyle, ThemeMode, Notification, Post, Comment, GlobalNotification, Page } from './types';
import { NotificationProvider } from './contexts/NotificationContext';
import useLocalStorage from './hooks/useLocalStorage';
import { MOCK_USERS } from './data/users';
import { MOCK_POSTS } from './data/posts';
import { auth, googleProvider, githubProvider, firebaseConfig } from './firebaseConfig';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  getAuth,
  deleteUser as deleteFirebaseUser,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  sendSignInLinkToEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
  onIdTokenChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
    getAllUsers, addUser, updateUser, getPosts, addPost, updatePost, deletePost, likePost, addCommentToPost, 
    getUserByFirebaseUid, isUsingMockData, addActivityLog, deleteUser, sendMagicLinkWithBrevo,
    getNotificationsForUser, addNotificationToDb, updateNotificationInDb, deleteNotificationFromDb, deleteAllNotificationsForUser, markAllNotificationsAsReadForUser,
    sendGlobalNotifications, sanitizePost, getInitError, getGlobalSettings, subscribeToGlobalSettings, updateGlobalSettings
} from './services/database';
import { GlobalSettings } from './types';
import { sendWelcomeEmail } from './services/emailService';
const WelcomeAnimation = lazy(() => import('./components/WelcomeAnimation'));
const DeletionAnimation = lazy(() => import('./components/DeletionAnimation'));
const NotificationContainer = lazy(() => import('./components/NotificationContainer'));
import XCircleIcon from './components/icons/XCircleIcon';
import { verifyTOTP } from './utils/totp';

const wittyVerificationMessages = [
  "Still not verified. Did you check the spam folder? 🤔",
  "Nope, not yet. Maybe try a little dance while you wait? 💃",
  "Third time's the charm? Not this time, it seems.",
  "Are you sure you clicked the link? The *actual* link?",
  "Still waiting... The server is getting lonely.",
  "I admire your persistence. The email, however, does not.",
  "Perhaps the verification email is on a coffee break. ☕",
  "It's not verified. Don't make me turn this car around.",
];

const funnyRateLimitMessages = [
    "Whoa there! Our mail pigeon is exhausted. Give it a minute. 🐦",
    "Spamming the button won't make the email fly faster 🚀",
    "Hold your horses! The internet is trying its best. 🐎",
    "Did you check the spam folder? Hitting resend isn't magic ✨",
    "The server is feeling a bit overwhelmed by your enthusiasm. 😅",
    "Cool down, speed racer! Try again in a bit. 🏎️",
    "Our email servers are taking a coffee break. ☕",
    "Clicking harder doesn't send it faster. Patience, young padawan. 🧘"
];

const mapDbNotificationToApp = (dbNotif: any): Notification => {
    return {
        ...dbNotif,
        userId: dbNotif.user_id,
        sourceType: dbNotif.source_type,
        fromUser: dbNotif.from_user,
        isRead: dbNotif.is_read,
        targetId: dbNotif.target_id,
        targetType: dbNotif.target_type,
    }
}

// Helper to ensure real-time payloads don't crash the app with null arrays
const sanitizeUserPayload = (user: any): User => {
    return {
        ...user,
        friends: user.friends || [],
        friend_requests: user.friend_requests || [],
        skills: user.skills || [],
        backup_codes: user.backup_codes || [],
        desktop_preferences: user.desktop_preferences || {},
    };
};

// Use the sanitized version from database service to be consistent
const sanitizePostPayload = sanitizePost;

const AnimatedBackground = () => (
  <div className="animated-gradient-background" />
);


const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET_PATH || 'admin-login';
const ADMIN_LOGIN_PATH = `#/${ADMIN_SECRET}`;

const App: React.FC = () => {
  const { themeStyle, setThemeStyle, themeMode, setThemeMode, selectedBackground, setSelectedBackground, selectedFont, setSelectedFont } = useTheme();
  const { timeFormat, setTimeFormat, visibleTimezones, setVisibleTimezones } = useTime();
  
  // Initialize showLanding based on URL hash
  const [showLanding, setShowLanding] = useState<boolean>(() => {
      return !window.location.hash.includes('auth');
  });

  // Initialize authPage state based on URL hash
  const [authPage, setAuthPage] = useState<'auth' | null>(() => {
      return window.location.hash.includes('auth') ? 'auth' : null;
  });
  
  const [is404, setIs404] = useState<boolean>(false);
  const [showMaintenance, setShowMaintenance] = useState<boolean>(false);
  const [showSitemap, setShowSitemap] = useState<boolean>(() => {
      return window.location.hash === '#/sitemap';
  });
  const [showHelpCenterPage, setShowHelpCenterPage] = useState<boolean>(() => {
      return window.location.hash === '#/helpcenter';
  });
  const [showPrivacy, setShowPrivacy] = useState<boolean>(() => window.location.hash === '#/privacy');
  const [showTerms, setShowTerms] = useState<boolean>(() => window.location.hash === '#/terms');
  const [showSecurity, setShowSecurity] = useState<boolean>(() => window.location.hash === '#/security');
  const [showStatus, setShowStatus] = useState<boolean>(() => window.location.hash === '#/status');

  // Helper to check if maintenance is active based on settings and time
  const isMaintenanceActive = useCallback((settings: GlobalSettings | null) => {
    if (!settings || !settings.isMaintenanceMode) return false;
    
    // Scheduled maintenance check
    const now = new Date();
    const start = settings.maintenanceStartTime ? new Date(settings.maintenanceStartTime) : null;
    const end = settings.maintenanceEndTime ? new Date(settings.maintenanceEndTime) : null;
    
    const isStartValid = start && !isNaN(start.getTime());
    const isEndValid = end && !isNaN(end.getTime());
    
    // If no valid timing is set but the master toggle is ON, maintenance is active immediately
    if (!isStartValid && !isEndValid) return true;
    
    // If timing is set, it MUST be met
    if (isStartValid && isEndValid) {
        return now >= start && now <= end;
    }
    if (isStartValid) {
        return now >= start;
    }
    if (isEndValid) {
        return now <= end;
    }
    
    return false;
  }, []);

  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup' | 'verify' | '2fa' | '2fa-magic-link' | 'forgot-password'>('signin');
  const [appUser, setAppUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [isInitialAuthLoading, setIsInitialAuthLoading] = useState(true);
  const [isAuthExiting, setAuthExiting] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [userForWelcome, setUserForWelcome] = useState<User | null>(null);
  const [showDeletionAnimation, setShowDeletionAnimation] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationCheckCount, setVerificationCheckCount] = useState(0);
  const [emailFor2FA, setEmailFor2FA] = useState<string | null>(null);
  const [pending2FAUser, setPending2FAUser] = useState<User | null>(null);
  const [isChecking2FA, setIsChecking2FA] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFAAttemptFailed, setTwoFAAttemptFailed] = useState(0);
  const is2FASignOutRef = useRef(false);
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const isSigningUpRef = useRef(false);
  
  // NEW: Login orchestration guard to prevent listener races
  const isPerformingLoginRef = useRef(false);

  const authBodyRef = useRef<HTMLDivElement>(null);
  
  // Ref to track the current user to avoid re-triggering login flow on profile updates.
  const appUserRef = useRef(appUser);
  appUserRef.current = appUser;
  
  // --- Centralized State Management ---
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [writeups, setWriteups] = useState<Post[]>([]);
  const [blogPosts, setBlogPosts] = useState<Post[]>([]);
  const [isDbLoading, setDbLoading] = useState(true);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null);
  
  // --- Notification State Management ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [queuedNotifications, setQueuedNotifications] = useState<Notification[]>([]);

  // Ref to provide a stable reference to notifications in effects that shouldn't re-run when notifications change.
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;
  
  // Use a ref to queue notifications during the welcome animation, preventing race conditions.
  const isWelcomeAnimationRunning = useRef(false);

  // Ref to provide stable access to allUsers in callbacks without re-triggering effects.
  const allUsersRef = useRef(allUsers);
  allUsersRef.current = allUsers;

  // Force loading to finish after 2 seconds to provide a consistent visual experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setDbLoading(false);
      setIsInitialAuthLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Sync wallpaper and theme preferences from user profile to ThemeContext
  useEffect(() => {
    // Wait until initial auth check is complete before syncing or resetting preferences
    // This prevents premature resets to defaults while we are still figuring out if the user is logged in
    if (isInitialAuthLoading) return;

    if (appUser?.wallpaper && appUser.wallpaper !== selectedBackground) {
        setSelectedBackground(appUser.wallpaper);
    }
    
    if (appUser?.desktop_preferences) {
        if (appUser.desktop_preferences.theme_style) {
            if (appUser.desktop_preferences.theme_style !== themeStyle) {
                setThemeStyle(appUser.desktop_preferences.theme_style, true);
            }
        } else if (themeStyle !== 'windows') {
            setThemeStyle('windows', true);
        }

        if (appUser.desktop_preferences.theme_mode) {
            if (appUser.desktop_preferences.theme_mode !== themeMode) {
                setThemeMode(appUser.desktop_preferences.theme_mode, true);
            }
        } else {
            const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultMode = systemDark ? 'dark' : 'light';
            if (themeMode !== defaultMode) {
                setThemeMode(defaultMode, true);
            }
        }

        if (appUser.desktop_preferences.selectedFont) {
            if (appUser.desktop_preferences.selectedFont !== selectedFont) {
                setSelectedFont(appUser.desktop_preferences.selectedFont);
            }
        } else if (selectedFont !== 'Inter') {
            setSelectedFont('Inter');
        }

        if (appUser.desktop_preferences.timeFormat) {
            if (appUser.desktop_preferences.timeFormat !== timeFormat) {
                setTimeFormat(appUser.desktop_preferences.timeFormat);
            }
        } else if (timeFormat !== '12hr') {
            setTimeFormat('12hr');
        }

        if (appUser.desktop_preferences.visibleTimezones) {
            if (JSON.stringify(appUser.desktop_preferences.visibleTimezones) !== JSON.stringify(visibleTimezones)) {
                setVisibleTimezones(appUser.desktop_preferences.visibleTimezones);
            }
        } else if (JSON.stringify(visibleTimezones) !== JSON.stringify(['local'])) {
            setVisibleTimezones(['local']);
        }
    } else {
        // If no desktop_preferences exist at all, reset to all defaults
        if (themeStyle !== 'windows') setThemeStyle('windows', true);
        const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (themeMode !== (systemDark ? 'dark' : 'light')) setThemeMode(systemDark ? 'dark' : 'light', true);
        if (selectedFont !== 'Inter') setSelectedFont('Inter');
        if (timeFormat !== '12hr') setTimeFormat('12hr');
        if (JSON.stringify(visibleTimezones) !== JSON.stringify(['local'])) setVisibleTimezones(['local']);
    }
  }, [appUser, isInitialAuthLoading, selectedBackground, themeStyle, themeMode, selectedFont, timeFormat, visibleTimezones, setSelectedBackground, setThemeStyle, setThemeMode, setSelectedFont, setTimeFormat, setVisibleTimezones]);

  // 404 and Maintenance Route Checker
  useEffect(() => {
    const checkRoute = () => {
        const hash = window.location.hash;
        const maintenanceActive = isMaintenanceActive(globalSettings);
        
        // Auto-cleanup: If maintenance is ON but the end time has passed, turn it OFF in the DB
        // Only an admin should perform this cleanup to avoid unnecessary DB writes from all users
        if (globalSettings?.isMaintenanceMode && globalSettings.maintenanceEndTime && appUser?.role === 'admin') {
            const now = new Date();
            const end = new Date(globalSettings.maintenanceEndTime);
            if (!isNaN(end.getTime()) && now > end) {
                updateGlobalSettings({ ...globalSettings, isMaintenanceMode: false });
            }
        }

        if (maintenanceActive && appUser?.role !== 'admin' && !hash.startsWith(ADMIN_LOGIN_PATH)) {
            setShowMaintenance(true);
            setShowLanding(false);
            setAuthPage(null);
            setIs404(false);
            setShowSitemap(false);
            setShowHelpCenterPage(false);
            return;
        }
        setShowMaintenance(false);

        // Remove the early return for logged-in users to allow them to view and dismiss legal/status pages
        // if (appUser) return; 
        
        const cleanHash = hash.replace(/^#\/?/, ''); 
        const validRoots = ['', '#', '#/', '#/sitemap', '#/helpcenter', '#/privacy', '#/terms', '#/security', '#/status'];
        
        const validProtectedApps = ['home', 'writeup', 'blog', 'chat', 'notes', 'todolist', 'settings', 'search', 'start', 'admin', 'notifications', 'mywork', 'resources', 'kali', 'docs', 'resumeai', 'features', 'community', 'pricing'];
        
        const currentApp = cleanHash.split('/')[0];
        
        const isAuthRoute = cleanHash.startsWith('auth');
        const isRootRoute = validRoots.includes(hash) || cleanHash === '';
        // 'writeup' is also a valid root for landing page deep links
        const isProtectedAppRoute = (validProtectedApps.includes(currentApp) || currentApp === 'writeup') && currentApp !== '';

        if (!isAuthRoute && !isRootRoute && !isProtectedAppRoute) {
            setIs404(true);
            setShowLanding(false);
            setAuthPage(null);
            setShowSitemap(false);
            setShowHelpCenterPage(false);
            setShowPrivacy(false);
            setShowTerms(false);
            setShowSecurity(false);
            setShowStatus(false);
        } else if (isProtectedAppRoute) {
            setIs404(false);
            // If user is logged in, and we are on a protected app route, we should NOT show landing
            setShowLanding(!appUser);
            setAuthPage(null);
            setShowSitemap(false);
            setShowHelpCenterPage(false);
            setShowPrivacy(false);
            setShowTerms(false);
            setShowSecurity(false);
        } else {
            setIs404(false);
            setAuthPage(isAuthRoute ? 'auth' : null);
            // Allow logged in users to see the landing page if they are on the root hash.
            // This satisfies the "dont show dashboard" request by not forcing the dashboard app upon login.
            setShowLanding(!isAuthRoute && (hash === '' || hash === '#' || hash === '#/') && !appUser);
            setShowSitemap(hash === '#/sitemap');
            setShowHelpCenterPage(hash === '#/helpcenter');
            setShowPrivacy(hash === '#/privacy');
            setShowTerms(hash === '#/terms');
            setShowSecurity(hash === '#/security');
            setShowStatus(hash === '#/status');
        }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    
    // Re-check every 30 seconds to handle scheduled maintenance transitions
    const interval = setInterval(checkRoute, 30000);

    return () => {
        window.removeEventListener('hashchange', checkRoute);
        clearInterval(interval);
    };
  }, [globalSettings, appUser, isMaintenanceActive]);

  // Effect to prevent body scroll on mobile when dashboard is active
  useEffect(() => {
    const rootEl = document.documentElement; 
    if (authPage === null && appUser) {
      rootEl.classList.add('dashboard-active');
      document.body.classList.add('dashboard-active');
    } else {
      rootEl.classList.remove('dashboard-active');
      document.body.classList.remove('dashboard-active');
    }

    return () => {
      rootEl.classList.remove('dashboard-active');
      document.body.classList.remove('dashboard-active');
    };
  }, [authPage, appUser]);

  const refreshPosts = useCallback(async () => {
    try {
        const [w, b] = await Promise.all([getPosts('writeup'), getPosts('blog')]);
        setWriteups(w);
        setBlogPosts(b);
    } catch (e) {
        console.error("Failed to refresh posts:", e);
    }
  }, []);

  // Force refresh when user changes to ensure visibility of data
  useEffect(() => {
      if (appUser) {
          refreshPosts();
      }
  }, [appUser, refreshPosts]);

  // Effect to sync post authors with updated user data
  useEffect(() => {
    const syncAuthors = (setPosts: React.Dispatch<React.SetStateAction<Post[]>>) => {
      setPosts(prev => {
        let changed = false;
        const next = prev.map(post => {
          const user = allUsers.find(u => u.id === post.author.id);
          // Check if we have better user data than what's in the post (or if post has placeholder)
          if (user && (post.author.name === 'Loading...' || JSON.stringify(user) !== JSON.stringify(post.author))) {
            changed = true;
            return { ...post, author: user };
          }
          return post;
        });
        return changed ? next : prev;
      });
    };

    if (allUsers.length > 0) {
        syncAuthors(setWriteups);
        syncAuthors(setBlogPosts);
    }
  }, [allUsers]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'userId'>) => {
    const newNotificationStub: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        ...notification,
    };

    const shouldShowToast = notification.showToast === undefined ? true : notification.showToast;

    if (shouldShowToast) {
        if (isWelcomeAnimationRunning.current) {
            setQueuedNotifications(prev => [...prev, newNotificationStub]);
        } else {
            setToasts(prev => [...prev, newNotificationStub]);
        }
    }

    if (notification.persist) {
        if (!appUserRef.current) return;
        const newNotificationForDb = {
            userId: appUserRef.current.id,
            title: notification.title,
            message: notification.message,
            type: notification.type || 'info',
            sourceType: notification.sourceType,
            fromUser: notification.fromUser,
            actions: notification.actions,
            persist: true,
            targetId: notification.targetId,
            targetType: notification.targetType,
        };
        
        addNotificationToDb(newNotificationForDb)
            .catch(error => {
                console.error("Failed to save notification to database:", error);
                const errorToast: Omit<Notification, 'id' | 'timestamp' | 'isRead'> = {
                    title: "Sync Error",
                    message: "Could not save notification to your account.",
                    type: 'error',
                    persist: false, 
                };
                setToasts(prev => [...prev, { ...errorToast, id: crypto.randomUUID(), timestamp: new Date().toISOString(), isRead: false }]);
            });
    }
  }, []);

  useEffect(() => {
    const handleOffline = () => {
        localStorage.setItem('offlineTimestamp', Date.now().toString());
        addNotification({
            title: "You're Offline",
            message: "Your connection was lost. Some features may be unavailable.",
            type: 'warning',
            duration: 7000,
        });
    };

    const handleOnline = () => {
        const offlineStart = localStorage.getItem('offlineTimestamp');
        if (offlineStart) {
            const offlineDuration = Date.now() - parseInt(offlineStart, 10);
            localStorage.removeItem('offlineTimestamp');

            const OFFLINE_THRESHOLD = 30 * 1000; 

            if (offlineDuration > OFFLINE_THRESHOLD) {
                addNotification({
                    title: "Welcome Back Online!",
                    message: "For a better experience next time, consider installing our app to use it offline.",
                    type: 'info',
                    duration: 10000,
                    persist: true,
                });
            } else {
                 addNotification({
                    title: "Connection Restored",
                    message: "You are back online.",
                    type: 'success',
                    duration: 5000,
                });
            }
        }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
    };
}, [addNotification]);

  const logActivity = useCallback((action: string, target?: string) => {
    if (appUserRef.current) {
        addActivityLog(appUserRef.current.id, action, target);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Parallelize all initial data fetches
        const [users, settings] = await Promise.all([
          getAllUsers(),
          getGlobalSettings(),
          refreshPosts()
        ]);
        
        setAllUsers(users.length > 0 ? users : MOCK_USERS);
        setGlobalSettings(settings);
      } catch (e) {
        console.error("Initial data fetch error:", e);
      }
      
      if (isUsingMockData()) {
          const initError = getInitError();
          const errorMessage = initError instanceof Error ? initError.message : String(initError || 'Unknown error');
          addNotification({
              title: "Offline Mode Active",
              message: `Could not connect to database: ${errorMessage}. Using sample data. App is functional for demonstration.`,
              type: 'warning',
              duration: 10000,
          });
      }
    };

    fetchInitialData();

    // Subscribe to global settings changes
    const unsubscribe = subscribeToGlobalSettings((settings) => {
        setGlobalSettings(settings);
    });

    // Fallback polling for global settings (every 30 seconds)
    const pollInterval = setInterval(async () => {
        try {
            const settings = await getGlobalSettings();
            setGlobalSettings(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(settings)) {
                    return settings;
                }
                return prev;
            });
        } catch (e) {}
    }, 30000);

    return () => {
        unsubscribe();
        clearInterval(pollInterval);
    };
  }, [addNotification, refreshPosts]);

  // Cooldown timers
  useEffect(() => {
    if (resendCooldown > 0) {
      const timerId = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendCooldown]);

  const handleWelcomeAnimationEnd = useCallback(() => {
    isWelcomeAnimationRunning.current = false;
    setShowWelcomeAnimation(false);
    
    // Ensure the login flag is removed so subsequent refreshes skip animation
    sessionStorage.removeItem('isNewLogin');

    if (userForWelcome) {
        const details = userForWelcome.role === 'admin' ? 'Admin access granted.' :
                        userForWelcome.status === 'pending' ? 'Your account is pending approval.' : '';

        addNotification({ 
            title: `Successfully Logged In`, 
            message: `Welcome back, ${userForWelcome.name}! ${details}`.trim(), 
            type: 'success',
            persist: true
        });

        logActivity('logged in');
        
        // FIX: Force one more refresh after animation to ensure everything is visible.
        refreshPosts();
    }
    
    if (queuedNotifications.length > 0) {
        setToasts(prevToasts => [...prevToasts, ...queuedNotifications]);
        setQueuedNotifications([]);
    }
    
    setUserForWelcome(null);
    
    // Release guard lock after a short delay to ensure UI has settled
    setTimeout(() => {
        isPerformingLoginRef.current = false;
    }, 100);
}, [addNotification, logActivity, queuedNotifications, userForWelcome, setToasts, setQueuedNotifications, refreshPosts]);

// OPTIMIZED: performLogin with forced refresh
const performLogin = useCallback(async (newUser: User, firebaseUserFromAuth: FirebaseUser | null): Promise<void> => {
    return new Promise(async (resolve) => {
        isPerformingLoginRef.current = true;

        setShowLanding(false);
        setIs404(false); 
        
        // CRITICAL FIX: Refresh posts immediately so we fetch data with the new user's authorized token
        await refreshPosts();

        const isFreshLogin = sessionStorage.getItem('isNewLogin') === 'true';
        
        let shouldShowAnimation = false;
        if (isFreshLogin) {
            try {
                const settings = await getGlobalSettings();
                shouldShowAnimation = settings.isWelcomeAnimationEnabled;
            } catch (e) {
                console.error("Failed to fetch global settings for welcome animation", e);
                shouldShowAnimation = true; // Default to true if fetch fails
            }
        }
        
        if (shouldShowAnimation) {
            // 1. Set Animation State FIRST
            isWelcomeAnimationRunning.current = true;
            setUserForWelcome(newUser);
            setShowWelcomeAnimation(true);
            
            setAuthPage(null); 
            setAuthExiting(true);
            setIsInitialAuthLoading(false); // Disable global loader immediately so animation can mount

            // 2. Delay setting appUser to ensure Animation mounts and takes over the view BEFORE dashboard tries to render
            setTimeout(async () => {
                setAppUser(newUser);
                
                // Background tasks
                if (firebaseUserFromAuth?.emailVerified && !newUser.welcome_email_sent && newUser.role !== 'admin') {
                    sendWelcomeEmail(newUser);
                    updateUser(newUser.email, { welcome_email_sent: true });
                }
                
                const userNotifications = await getNotificationsForUser(newUser.id);
                setNotifications(userNotifications);

                setAuthLoading(false);
                resolve();
            }, 500); // INCREASED to 500ms to prioritize animation render and prevent flicker
        } else {
            // CRITICAL FIX: If welcome animation is running (due to race condition), abort this path
            // to prevent immediate dashboard render from overriding animation.
            if (isWelcomeAnimationRunning.current) {
                resolve();
                return;
            }

            setAuthPage(null); 
            setAuthExiting(true);
            setAuthLoading(true); // Show loader
            setIsInitialAuthLoading(false); // Unblock main render so loader takes over properly

            // Delay setting appUser to show loader for a brief moment
            setTimeout(async () => {
                // Direct update for non-fresh logins
                setAppUser(newUser);

                // Background tasks for fresh login without animation
                if (isFreshLogin) {
                    sessionStorage.removeItem('isNewLogin');
                    if (firebaseUserFromAuth?.emailVerified && !newUser.welcome_email_sent && newUser.role !== 'admin') {
                        sendWelcomeEmail(newUser);
                        updateUser(newUser.email, { welcome_email_sent: true });
                    }
                    
                    const details = newUser.role === 'admin' ? 'Admin access granted.' :
                                    newUser.status === 'pending' ? 'Your account is pending approval.' : '';

                    addNotification({ 
                        title: `Successfully Logged In`, 
                        message: `Welcome back, ${newUser.name}! ${details}`.trim(), 
                        type: 'success',
                        persist: true
                    });

                    logActivity('logged in');
                    refreshPosts();
                }

                const userNotifications = await getNotificationsForUser(newUser.id);
                setNotifications(userNotifications);

                setAuthLoading(false);
                resolve();

                setTimeout(() => {
                    isPerformingLoginRef.current = false;
                }, 1000);
            }, 800); // 800ms delay for loader
        }
    });
}, [setAppUser, setAuthExiting, setAuthLoading, setAuthPage, setNotifications, refreshPosts]);


  // --- Firebase Auth State Listener ---
  useEffect(() => {
    if (isDbLoading) return;

    let unsubscribe: (() => void) | undefined;

    const setupAuthListener = async () => {
        if (!auth) {
            console.error("Firebase auth object is not initialized. Cannot set up auth state listener.");
            addNotification({ title: "Initialization Error", message: "Authentication service failed to load. Please refresh.", type: "error" });
            setAuthLoading(false);
            setIsInitialAuthLoading(false);
            return;
        }
        
        await (auth as any).authStateReady();

        unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (isSigningUpRef.current) {
                // Guard: let handleSignup manage the UI during the signup process.
                return;
            }

            if (user) {
                if (isPerformingLoginRef.current) {
                    // If login is already being performed, don't interfere.
                    // The listener firing here is expected as part of the login process.
                }

                setShowLanding(false);
                setIs404(false);
                
                const redirectPath = localStorage.getItem('redirectAfterLogin');
                localStorage.removeItem('redirectAfterLogin'); 

                if (redirectPath && redirectPath !== '#' && !redirectPath.startsWith('#/auth')) {
                    window.location.hash = redirectPath;
                } else if (window.location.hash.startsWith('#/auth') || window.location.hash === '' || window.location.hash === '#') {
                    window.location.hash = '#/home';
                }
            } else {
                const currentPath = window.location.hash;
                const cleanPath = currentPath.replace(/^#\/?/, '');
                const isPublicPage = currentPath.startsWith("#/auth");
                const isRoot = currentPath === '' || currentPath === '#' || currentPath === '#/' || 
                              ['#/sitemap', '#/helpcenter', '#/privacy', '#/terms', '#/security', '#/status'].includes(currentPath);
                
                const validProtectedApps = ['home', 'writeup', 'blog', 'chat', 'notes', 'todolist', 'settings', 'search', 'start', 'admin', 'notifications', 'mywork', 'resources', 'kali', 'docs', 'resumeai', 'features', 'community', 'pricing'];
                const currentApp = cleanPath.split('/')[0];
                const isProtectedAppRoute = validProtectedApps.includes(currentApp) || currentApp === 'writeup';

                if (!isPublicPage && !isRoot && !isProtectedAppRoute) {
                    setIs404(true);
                    setShowLanding(false);
                    setAuthPage(null);
                    setShowSitemap(false);
                    setShowHelpCenterPage(false);
                    setShowPrivacy(false);
                    setShowTerms(false);
                    setShowSecurity(false);
                    setShowStatus(false);
                } else {
                    setIs404(false);
                    setShowSitemap(currentPath === '#/sitemap');
                    setShowHelpCenterPage(currentPath === '#/helpcenter');
                    setShowPrivacy(currentPath === '#/privacy');
                    setShowTerms(currentPath === '#/terms');
                    setShowSecurity(currentPath === '#/security');
                    setShowStatus(currentPath === '#/status');
                    if (!isPublicPage) {
                        if (currentPath && currentPath !== '#' && currentPath !== '#/') {
                            if (isProtectedAppRoute) {
                                 localStorage.setItem('redirectAfterLogin', currentPath);
                            }
                        }
                        
                        if (currentPath.startsWith('#/auth')) {
                            setShowLanding(false);
                            setAuthPage('auth');
                        } else {
                            if (!is2FASignOutRef.current && !isPerformingLoginRef.current && !isSigningUpRef.current) {
                                setShowLanding(true);
                                setAuthPage(null); 
                                // Removed forceful redirect to #/ to allow shareable URLs for landing page sections
                            } else {
                                setShowLanding(false);
                                setAuthPage('auth');
                            }
                        }
                    } else if (currentPath.startsWith('#/auth')) {
                        setShowLanding(false);
                        setAuthPage('auth');
                    }
                }
            }

            if (isChecking2FA) {
                setIsInitialAuthLoading(false);
                return;
            }

            if (user) {
                try {
                    await user.reload();
                } catch (error) {
                    console.error("Error reloading user (possibly offline):", error);
                    // We continue with the existing user object if reload fails
                }
                const freshUser = auth.currentUser || user; 

                if (!freshUser) {
                    setFirebaseUser(null);
                    setAppUser(null);
                    setNotifications([]);
                    setToasts([]);
                    setShowLanding(true);
                    setIs404(false);
                    setAuthPage(null);
                    setAuthInitialMode('signin');
                    setAuthExiting(false);
                    setAuthLoading(false);
                    setIsInitialAuthLoading(false);
                    return;
                }
                
                setFirebaseUser(freshUser);
        
                if (appUserRef.current && appUserRef.current.email === freshUser.email) {
                    const profileFromState = allUsersRef.current.find(u => u.email === freshUser.email);
                    if (profileFromState && JSON.stringify(appUserRef.current) !== JSON.stringify(profileFromState)) {
                        setAppUser(profileFromState);
                    }
                    setAuthLoading(false);
                    setIsInitialAuthLoading(false);
                    return;
                }
        
                const profileFromDb = await getUserByFirebaseUid(freshUser.uid);

                if (profileFromDb && freshUser.email && profileFromDb.email.toLowerCase() !== freshUser.email.toLowerCase()) {
                    console.log(`Email mismatch found. Auth: ${freshUser.email}, DB: ${profileFromDb.email}. Syncing...`);
                    setIsSyncingProfile(true);
                    try {
                        const updatedProfileInDb = await updateUser(profileFromDb.email, { email: freshUser.email });
                        if (updatedProfileInDb) {
                            setAllUsers(prev => prev.map(u => u.id === updatedProfileInDb.id ? updatedProfileInDb : u));
                            await performLogin(updatedProfileInDb, freshUser);
                            addNotification({ title: 'Email Updated', message: `Your email has been successfully changed to ${freshUser.email}.`, type: 'success' });
                        } else {
                            addNotification({ title: 'Sync Error', message: 'Could not update your email in our records. Please contact support.', type: 'error' });
                            signOut(auth);
                        }
                    } finally {
                        setIsSyncingProfile(false);
                    }
                    setIsInitialAuthLoading(false);
                    return;
                }

                const adminEmail = import.meta.env.VITE_SMTP_USER?.toLowerCase() || 'ragow49@gmail.com';
                if (freshUser.email?.toLowerCase() === adminEmail) {
                    let adminProfile = await getUserByFirebaseUid(freshUser.uid);
                    
                    // Fallback to local construct if DB fetch fails intermittently during refresh
                    if (!adminProfile) {
                        console.warn("Admin profile fetch returned null. Checking local memory or creating fallback to prevent logout.");
                        const localAdmin = allUsersRef.current.find(u => u.email?.toLowerCase() === adminEmail);
                        adminProfile = localAdmin || {
                            id: freshUser.uid,
                            name: freshUser.displayName || 'Admin',
                            email: freshUser.email!,
                            avatar: freshUser.photoURL || `https://i.pravatar.cc/150?u=${freshUser.email}`,
                            role: 'admin',
                            writeup_access: 'write',
                            status: 'verified',
                            created_at: new Date().toISOString(),
                            admin_verified: true,
                        };
                    }
                    
                    await performLogin(adminProfile, freshUser);
                    setIsInitialAuthLoading(false);
                    return;
                }
        
                if (!freshUser.emailVerified) {
                    setVerificationEmail(freshUser.email);
                    setAppUser(null);
                    setNotifications([]);
                    setToasts([]);
                    setShowLanding(false); 
                    setIs404(false);
                    setAuthPage('auth');
                    setAuthInitialMode('verify');
                    setAuthLoading(false);
                    setIsInitialAuthLoading(false);
                    return;
                }
        
                if (profileFromDb) {
                    // 2FA Check Logic (Multi-tab resilient with 24-hour expiration)
                    const saved2FATime = localStorage.getItem(`2fa_verified_${profileFromDb.email}`);
                    const is2FAVerified = saved2FATime && (Date.now() - parseInt(saved2FATime, 10) < 24 * 60 * 60 * 1000);
                    
                    if (profileFromDb.is_2fa_enabled && !is2FAVerified) {
                        console.log("2FA Enabled for user, interrupting login flow.");
                        setPending2FAUser(profileFromDb);
                        setEmailFor2FA(profileFromDb.email);
                        
                        setAppUser(null); // Ensure no access yet
                        setAuthPage('auth');
                        setAuthInitialMode('2fa');
                        
                        setIsChecking2FA(false);
                        setAuthLoading(false);
                        setIsInitialAuthLoading(false);
                        return;
                    }

                    switch (profileFromDb.status) {
                        case 'verified':
                        case 'pending':
                            await performLogin(profileFromDb, freshUser);
                            break;
                        case 'unverified': {
                            const updates: Partial<User> = { 
                                status: 'pending', 
                                verified_at: new Date().toISOString(),
                            };
                            const updatedProfile = await updateUser(profileFromDb.email, updates);
                            if (updatedProfile) {
                                setAllUsers(prev => prev.map(u => u.id === updatedProfile.id ? updatedProfile : u));
                                await performLogin(updatedProfile, freshUser);
                                addNotification({ title: 'Verification Successful', message: 'Your account is pending admin approval for full access.', type: 'success' });
                            } else {
                                addNotification({ title: 'Update Error', message: 'Could not update your account status.', type: 'error' });
                                signOut(auth);
                            }
                            setAuthLoading(false);
                            break;
                        }
                        default: 
                            addNotification({ title: 'Access Denied', message: 'Your account is not active.', type: 'error' });
                            signOut(auth);
                            break;
                    }
                } else {
                    if (freshUser.email) {
                        const newUser: User = {
                            id: freshUser.uid,
                            name: freshUser.displayName || freshUser.email.split('@')[0],
                            email: freshUser.email,
                            avatar: freshUser.photoURL || `https://i.pravatar.cc/150?u=${freshUser.email}`,
                            role: 'user',
                            writeup_access: 'none',
                            status: freshUser.emailVerified ? 'pending' : 'unverified',
                            created_at: new Date().toISOString(),
                            admin_verified: false,
                            welcome_email_sent: false,
                        };
                        const addedUser = await addUser(newUser);
                        if (addedUser) {
                            setAllUsers(prev => [...prev, addedUser]);
                            if (!freshUser.emailVerified) {
                                setVerificationEmail(freshUser.email);
                                setShowLanding(false);
                                setIs404(false);
                                setAuthPage('auth');
                                setAuthInitialMode('verify');
                                setAuthLoading(false);
                            } else {
                                await performLogin(addedUser, freshUser);
                            }
                        } else {
                            addNotification({ title: 'Profile Creation Failed', message: 'Could not create your user profile.', type: 'error' });
                            signOut(auth);
                        }
                    } else {
                        addNotification({ title: 'Login Error', message: 'User profile not found and could not be created (missing email).', type: 'error' });
                        signOut(auth);
                    }
                }
            } else {
                if (appUserRef.current && !is2FASignOutRef.current) {
                    addNotification({ title: 'Logout Successful', message: 'You have been successfully signed out.', type: 'info' });
                }

                const signOutReason = localStorage.getItem('lastSignOutReason');
                if (signOutReason === 'token_expired') {
                    setTimeout(() => {
                        addNotification({
                            title: 'Session Expired',
                            message: 'For your security, please sign in again.',
                            type: 'info',
                            duration: 7000,
                        });
                    }, 500);
                    localStorage.removeItem('lastSignOutReason');
                }
                
                if (is2FASignOutRef.current) {
                    is2FASignOutRef.current = false;
                    setAuthLoading(false);
                    setIsInitialAuthLoading(false);
                    return;
                }
                
                setFirebaseUser(null);
                setAppUser(null);
                setNotifications([]);
                
                if (window.location.hash.startsWith('#/auth')) {
                    setShowLanding(false);
                    setIs404(false);
                    setAuthPage('auth');
                } else if (is404) {
                    setShowLanding(false);
                    setAuthPage(null);
                } else {
                    if (!isPerformingLoginRef.current && !isSigningUpRef.current) {
                        setShowLanding(true);
                        setIs404(false);
                        setAuthPage(null);
                    }
                }
                
                setAuthInitialMode('signin');
                setAuthExiting(false);
                setAuthLoading(false);
            }
            setIsInitialAuthLoading(false);
        });
    };

    setupAuthListener();
  
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
}, [isDbLoading, addNotification, isChecking2FA, performLogin, refreshPosts]);


  // Cooldown timers
  useEffect(() => {
    if (resendCooldown > 0) {
      const timerId = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendCooldown]);
  
  // ... (Rest of the component remains unchanged)
  const removeNotification = useCallback(async (id: string) => {
    const success = await deleteNotificationFromDb(id);
    if (!success) {
        addNotification({
            title: 'Sync Error',
            message: 'Could not remove notification permanently. It might reappear on refresh.',
            type: 'error',
        });
    }
  }, [addNotification]);
  
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    const success = await updateNotificationInDb(id, { isRead: true });
    if (!success) {
        addNotification({
            title: 'Update Failed',
            message: 'Could not mark notification as read.',
            type: 'error',
        });
    }
  }, [addNotification]);

  const markAllAsRead = useCallback(async () => {
      if (!appUser) return;
      const unreadCount = notificationsRef.current.filter(n => !n.isRead).length;
      if (unreadCount === 0) return;
      
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      const success = await markAllNotificationsAsReadForUser(appUser.id);
      if (!success) {
          // Revert/Refetch on failure
          const fresh = await getNotificationsForUser(appUser.id);
          setNotifications(fresh);
          
          addNotification({
              title: 'Update Failed',
              message: 'Could not mark all notifications as read. Please try again.',
              type: 'error',
          });
      }
  }, [appUser, addNotification]);

  const clearAll = useCallback(async () => {
      if (!appUser) return;
      
      // Optimistic update
      setNotifications([]);
      setToasts([]);

      const success = await deleteAllNotificationsForUser(appUser.id);
      if (!success) {
        // Revert/Refetch on failure
        const fresh = await getNotificationsForUser(appUser.id);
        setNotifications(fresh);
        addNotification({ title: 'Error', message: 'Could not clear all notifications.', type: 'error' });
      }
  }, [appUser, addNotification]);
  
  const handleProfileUpdate = useCallback(async (email: string, updatedData: Partial<User>, silent: boolean = false) => {
    let finalUpdate = { ...updatedData };

    // Deep merge desktop_preferences to prevent silent updates from being completely dropped 
    // when SettingsPage sends down a stale profile payload
    if (updatedData.desktop_preferences) {
        const existingData = allUsersRef.current.find(u => u.email === email);
        if (existingData?.desktop_preferences) {
            finalUpdate.desktop_preferences = {
                ...existingData.desktop_preferences,
                ...updatedData.desktop_preferences
            };
        }
    }

    const updatedUserFromDb = await updateUser(email, finalUpdate);
    if (updatedUserFromDb) {
        setAllUsers(prev => {
            const userToUpdate = prev.find(u => u.email === email);
            if (!userToUpdate) return [...prev, updatedUserFromDb];

            const { desktop_preferences: oldPrefs, ...oldUserRest } = userToUpdate;
            const { desktop_preferences: newPrefs, ...newUserRest } = updatedUserFromDb;

            if (silent && JSON.stringify(oldUserRest) === JSON.stringify(newUserRest)) {
                return prev; // Return original array reference
            }
            return prev.map(u => (u.email === email ? updatedUserFromDb : u));
        });
        
        if (appUserRef.current && appUserRef.current.email === email) {
            if (!silent) {
                setAppUser(updatedUserFromDb);
            }
        }
            
        if (!silent) {
            const message = (appUserRef.current && appUserRef.current.email === email)
                ? 'Your profile has been updated.'
                : `${updatedUserFromDb.name}'s profile has been updated.`;
                
            addNotification({ title: 'Profile Updated', message, type: 'success' });
            if (appUserRef.current && appUserRef.current.email === email) {
                logActivity('updated their profile');
            }
        }
    } else {
        if (!silent) {
            addNotification({ title: 'Update Failed', message: 'Could not save your changes.', type: 'error' });
        }
    }
  }, [addNotification, logActivity]);
  
  // Handlers
  const handleReceivedGlobalNotification = useCallback((notif: any, isOfflineCatchup: boolean) => {
      const fromUser = notif.from_user;
      const commonProps = {
        fromUser,
        persist: true,
        targetId: notif.target_id,
        targetType: notif.target_type,
      };
      
      switch (notif.type) {
          case 'friend_request':
              addNotification({
                  ...commonProps,
                  title: 'New Friend Request',
                  message: isOfflineCatchup ? `${fromUser.name} sent you a request while you were away.` : `${fromUser.name} has sent you a friend request.`,
                  type: 'info',
                  sourceType: 'friend_request',
                  showToast: false, 
                  actions: [
                      { label: 'Accept', actionType: 'accept_friend_request', type: 'primary' },
                      { label: 'Reject', actionType: 'reject_friend_request', type: 'secondary' },
                  ]
              });
              break;
            case 'friend_request_accepted':
               addNotification({
                  ...commonProps,
                  title: 'Friend Request Accepted',
                  message: `${fromUser.name} accepted your friend request.`,
                  type: 'success',
                  sourceType: 'friend_request_accepted',
               });
               break;
            case 'writeup_access_request':
                if (appUserRef.current?.role === 'admin') {
                   addNotification({
                      ...commonProps,
                      title: 'Writeup Access Request',
                      message: `${fromUser.name} has requested writeup access.`,
                      type: 'info',
                      sourceType: 'writeup_access_request',
                      actions: [
                          { label: 'Approve', actionType: 'approve_writeup_access', type: 'primary' },
                          { label: 'Reject', actionType: 'reject_writeup_access', type: 'secondary' },
                      ]
                   });
                }
                break;
           default:
              if (notif.type) {
                 addNotification({
                  ...commonProps,
                  title: notif.title || 'Notification',
                  message: notif.message,
                  type: 'info',
                  sourceType: notif.type as any,
                 });
              }
      }
  }, [addNotification]);

  const handleSendFriendRequest = useCallback(async (fromUser: User, toUserEmail: string) => {
    if (!appUserRef.current) return;
    
    // 1. Check if user exists
    const targetUser = allUsersRef.current.find(u => u.email === toUserEmail);
    if (!targetUser) {
        addNotification({ title: 'Error', message: 'User not found.', type: 'error' });
        return;
    }

    // 2. Validation
    if (targetUser.email === fromUser.email) {
        addNotification({ title: 'Error', message: "You can't add yourself.", type: 'error' });
        return;
    }
    if (targetUser.friends?.includes(fromUser.email)) {
        addNotification({ title: 'Info', message: "You are already friends.", type: 'info' });
        return;
    }
    if (targetUser.friend_requests?.includes(fromUser.email)) {
        addNotification({ title: 'Info', message: "Friend request already sent.", type: 'info' });
        return;
    }

    // 3. Update Target User
    const currentRequests = targetUser.friend_requests || [];
    const updatedRequests = [...currentRequests, fromUser.email];
    
    try {
        await updateUser(targetUser.email, { friend_requests: updatedRequests });
        
        // 4. Send Notification
        const notification: GlobalNotification = {
            id: crypto.randomUUID(),
            to: targetUser.email,
            from: {
                email: fromUser.email,
                name: fromUser.name,
                avatar: fromUser.avatar,
                role: fromUser.role
            },
            type: 'friend_request',
            title: 'New Friend Request',
            message: `${fromUser.name} sent you a friend request.`
        };
        await sendGlobalNotifications([notification]);

        addNotification({ title: 'Success', message: `Friend request sent to ${targetUser.name}.`, type: 'success' });
        logActivity('sent a friend request to', targetUser.name);

    } catch (error) {
        console.error("Failed to send friend request:", error);
        addNotification({ title: 'Error', message: "Failed to send request.", type: 'error' });
    }
  }, [addNotification, logActivity]);

  const handleAcceptFriendRequest = useCallback(async (requestor: { email: string; name: string }) => {
      if (!appUserRef.current) return;
      const currentUser = appUserRef.current;

      // 1. Update Current User: Add friend, remove request
      const myNewFriends = [...(currentUser.friends || []), requestor.email];
      const myNewRequests = (currentUser.friend_requests || []).filter(email => email !== requestor.email);
      
      // 2. Update Requestor: Add friend
      const requestorUser = allUsersRef.current.find(u => u.email === requestor.email);
      if (!requestorUser) {
           // Fallback if not in current view, fetch logic inside updateUser handles it
      }
      const theirNewFriends = [...(requestorUser?.friends || []), currentUser.email];

      try {
          // Parallel updates
          await Promise.all([
              updateUser(currentUser.email, { friends: myNewFriends, friend_requests: myNewRequests }),
              updateUser(requestor.email, { friends: theirNewFriends })
          ]);
          
          // Notify Requestor
           const notification: GlobalNotification = {
            id: crypto.randomUUID(),
            to: requestor.email,
            from: {
                email: currentUser.email,
                name: currentUser.name,
                avatar: currentUser.avatar,
                role: currentUser.role
            },
            type: 'friend_request_accepted',
            title: 'Friend Request Accepted',
            message: `${currentUser.name} accepted your friend request.`
        };
        await sendGlobalNotifications([notification]);

        addNotification({ title: 'Success', message: `You are now friends with ${requestor.name}.`, type: 'success' });
        logActivity('became friends with', requestor.name);

      } catch (error) {
          addNotification({ title: 'Error', message: "Failed to accept request.", type: 'error' });
      }
  }, [addNotification, logActivity]);

  const handleRejectFriendRequest = useCallback(async (requestor: { email: string; name: string; }) => {
      if (!appUserRef.current) return;
      const currentUser = appUserRef.current;
      
      const myNewRequests = (currentUser.friend_requests || []).filter(email => email !== requestor.email);
      
      try {
          await updateUser(currentUser.email, { friend_requests: myNewRequests });
          addNotification({ title: 'Ignored', message: `Friend request from ${requestor.name} ignored.`, type: 'info' });
          
          // Notify Requestor (Optional)
           const notification: GlobalNotification = {
            id: crypto.randomUUID(),
            to: requestor.email,
            from: {
                email: currentUser.email,
                name: currentUser.name,
                avatar: currentUser.avatar,
                role: currentUser.role
            },
            type: 'friend_request_rejected',
            title: 'Friend Request Rejected',
            message: `${currentUser.name} rejected your friend request.`
        };
        await sendGlobalNotifications([notification]);

      } catch (error) {
           addNotification({ title: 'Error', message: "Failed to reject request.", type: 'error' });
      }
  }, [addNotification]);

  const handleRemoveFriend = useCallback(async (friendToRemove: { email: string; name: string }) => {
      if (!appUserRef.current) return;
      const currentUser = appUserRef.current;

      const myNewFriends = (currentUser.friends || []).filter(email => email !== friendToRemove.email);
      
      const friendUser = allUsersRef.current.find(u => u.email === friendToRemove.email);
      // Even if not found in local state, update user by email
      const theirNewFriends = (friendUser?.friends || []).filter(email => email !== currentUser.email);

      try {
          await Promise.all([
              updateUser(currentUser.email, { friends: myNewFriends }),
              updateUser(friendToRemove.email, { friends: theirNewFriends }) // Using passed email
          ]);
          addNotification({ title: 'Removed', message: `${friendToRemove.name} removed from friends.`, type: 'success' });
      } catch (error) {
           addNotification({ title: 'Error', message: "Failed to remove friend.", type: 'error' });
      }
  }, [addNotification]);

  const handleRequestWriteupAccess = useCallback(async () => {
    if (!appUserRef.current) return;
    try {
        await updateUser(appUserRef.current.email, { has_requested_writeup_access: true });
        // Notify Admins
        const admins = allUsersRef.current.filter(u => u.role === 'admin');
        const notificationsToSend: GlobalNotification[] = admins.map(admin => ({
            id: crypto.randomUUID(),
            to: admin.email,
            from: {
                email: appUserRef.current!.email,
                name: appUserRef.current!.name,
                avatar: appUserRef.current!.avatar,
                role: appUserRef.current!.role
            },
            type: 'writeup_access_request',
            title: 'Writeup Access Request',
            message: `${appUserRef.current!.name} has requested writeup access.`
        }));
        await sendGlobalNotifications(notificationsToSend);
        
        setAppUser(prev => prev ? ({...prev, has_requested_writeup_access: true}) : null);
        addNotification({ title: 'Request Sent', message: 'Admin has been notified.', type: 'success' });
    } catch (e) {
        addNotification({ title: 'Error', message: 'Failed to send request.', type: 'error' });
    }
  }, [addNotification]);

  const handleApproveWriteupAccess = useCallback(async (requestor: { email: string; name: string; }) => {
     try {
        await updateUser(requestor.email, { writeup_access: 'write', has_requested_writeup_access: false });
        
        // Notify User
        const notification: GlobalNotification = {
            id: crypto.randomUUID(),
            to: requestor.email,
            from: {
                 email: appUserRef.current!.email, // Admin
                 name: appUserRef.current!.name,
                 avatar: appUserRef.current!.avatar,
                 role: 'admin'
            },
            type: 'admin_message', 
            title: 'Access Granted',
            message: 'Your request for writeup access has been approved.'
        };
        await sendGlobalNotifications([notification]);
        
        addNotification({ title: 'Approved', message: `Access granted to ${requestor.name}`, type: 'success' });
    } catch (e) {
        addNotification({ title: 'Error', message: 'Failed to approve.', type: 'error' });
    }
  }, [addNotification]);

  const handleRejectWriteupAccess = useCallback(async (requestor: { email: string; name: string; }) => {
      try {
        await updateUser(requestor.email, { has_requested_writeup_access: false });
        
        // Notify User
        const notification: GlobalNotification = {
            id: crypto.randomUUID(),
            to: requestor.email,
            from: {
                 email: appUserRef.current!.email, // Admin
                 name: appUserRef.current!.name,
                 avatar: appUserRef.current!.avatar,
                 role: 'admin'
            },
            type: 'writeup_access_rejected',
            title: 'Access Rejected',
            message: 'Your request for writeup access has been rejected.'
        };
        await sendGlobalNotifications([notification]);

        addNotification({ title: 'Rejected', message: `Request from ${requestor.name} rejected.`, type: 'info' });
      } catch (e) {
          addNotification({ title: 'Error', message: 'Failed to reject.', type: 'error' });
      }
  }, [addNotification]);

  const handleNotificationAction = useCallback(async (notificationId: string, actionType: 'accept_friend_request' | 'reject_friend_request' | 'approve_writeup_access' | 'reject_writeup_access') => {
      if (!appUserRef.current) return;
      
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      // Optimistically mark as handled/deleted
      removeNotification(notificationId); 

      if (actionType === 'accept_friend_request') {
          if (notification.fromUser) {
              await handleAcceptFriendRequest(notification.fromUser);
          }
      } else if (actionType === 'reject_friend_request') {
          if (notification.fromUser) {
              await handleRejectFriendRequest(notification.fromUser);
          }
      } else if (actionType === 'approve_writeup_access') {
           if (notification.fromUser) {
               await handleApproveWriteupAccess(notification.fromUser);
           }
      } else if (actionType === 'reject_writeup_access') {
           if (notification.fromUser) {
               await handleRejectWriteupAccess(notification.fromUser);
           }
      }
  }, [notifications, handleAcceptFriendRequest, handleRejectFriendRequest, handleApproveWriteupAccess, handleRejectWriteupAccess, removeNotification]);

  const createPostNotification = useCallback((post: Post, liker: User, type: 'like_post' | 'comment_post', message: string) => {
      if (post.author.email === liker.email) return; // Don't notify self

      const notification: GlobalNotification = {
          id: crypto.randomUUID(),
          to: post.author.email,
          from: {
              email: liker.email,
              name: liker.name,
              avatar: liker.avatar,
              role: liker.role
          },
          type: type,
          title: type === 'like_post' ? 'New Like' : 'New Comment',
          message: message,
          targetId: post.id,
          targetType: post.type
      };
      sendGlobalNotifications([notification]);
  }, []);
  
  const notificationContextValue = useMemo(() => ({
    notifications, toasts, addNotification, dismissToast, markAsRead, markAllAsRead, clearAll,
    handleAction: handleNotificationAction,
    removeNotification
  }), [notifications, toasts, addNotification, dismissToast, markAsRead, markAllAsRead, clearAll, handleNotificationAction, removeNotification]);
  
  // Auth Handlers - Full Implementation
  const handleLogin = async (email: string, password: string, rememberMe: boolean): Promise<string | void> => {
      setIsChecking2FA(true);
      isPerformingLoginRef.current = true;
      setShowLanding(false);
      setIs404(false);
      sessionStorage.setItem('isNewLogin', 'true');
      
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email, password);
        // The onAuthStateChanged listener handles the rest
        setIsChecking2FA(false);
      } catch (error: any) {
          console.error("Login Error:", error);
          setIsChecking2FA(false);
          sessionStorage.removeItem('isNewLogin');
          isPerformingLoginRef.current = false;
          
          if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
              return "Invalid email or password.";
          }
          return error.message;
      }
  };

  const handleSignup = async (name: string, email: string, password: string): Promise<string | void> => {
      isSigningUpRef.current = true;
      try {
          // 1. Create Auth User
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // 2. Send Verification Email
          await sendEmailVerification(user);

          // 3. Create DB Profile
          const newUser: User = {
              id: user.uid,
              name: name,
              email: email,
              avatar: `https://i.pravatar.cc/150?u=${email}`,
              role: 'user',
              writeup_access: 'none',
              status: 'unverified',
              created_at: new Date().toISOString(),
              admin_verified: false,
              welcome_email_sent: false,
          };

          const addedUser = await addUser(newUser);

          if (!addedUser) {
              // Rollback auth if DB fails
              await deleteFirebaseUser(user);
              throw new Error("Failed to create user profile. Please try again.");
          }

          // 4. Update State to Verify Screen
          setVerificationEmail(email);
          setAppUser(null);
          setAuthPage('auth');
          setAuthInitialMode('verify');
          setShowLanding(false);
          setIs404(false);

      } catch (error: any) {
          console.error("Signup Error:", error);
          if (error.code === 'auth/email-already-in-use') {
              return "That email address is already in use.";
          }
          return error.message || "Signup failed.";
      } finally {
           isSigningUpRef.current = false;
      }
  };

  const handleSocialLogin = async (providerName: 'google' | 'github'): Promise<string | void> => {
      isPerformingLoginRef.current = true;
      setShowLanding(false);
      setIs404(false);
      sessionStorage.setItem('isNewLogin', 'true');
      
      try {
          const provider = providerName === 'google' ? googleProvider : githubProvider;
          await signInWithPopup(auth, provider);
          // onAuthStateChanged handles the rest (creating profile if missing, etc.)
      } catch (error: any) {
          console.error("Social Login Error:", error);
          isPerformingLoginRef.current = false;
          sessionStorage.removeItem('isNewLogin');
          return error.message;
      }
  };

  const handleForgotPassword = async (email: string): Promise<string | void> => {
      try {
          await sendPasswordResetEmail(auth, email);
      } catch (error: any) {
          console.error("Forgot Password Error:", error);
          return error.message;
      }
  };

  const handleVerify2FACode = async (code: string): Promise<void> => {
     setIsVerifying2FA(true);
     setTwoFAError(null);
     
     // 1. Check Backup Codes (existing logic)
     const userToCheck = pending2FAUser || appUserRef.current;
     const isBackupCode = userToCheck && userToCheck.backup_codes && userToCheck.backup_codes.includes(code);
     
     // 2. Check TOTP Code (new logic)
     let isTotpValid = false;
     try {
         isTotpValid = await verifyTOTP(code, userToCheck?.totp_secret);
     } catch (e) {
         console.error("TOTP Verification Error", e);
     }

     if (isBackupCode || isTotpValid) {
         if (userToCheck) {
             localStorage.setItem(`2fa_verified_${userToCheck.email}`, Date.now().toString());
             // Invalidate used backup code
             if (isBackupCode && userToCheck.backup_codes) {
                 const updatedCodes = userToCheck.backup_codes.filter(c => c !== code);
                 await updateUser(userToCheck.email, { backup_codes: updatedCodes });
                 userToCheck.backup_codes = updatedCodes; // Update local ref
             }
         }
         await performLogin(userToCheck!, firebaseUser);
         setPending2FAUser(null);
         setAuthPage(null);
         setAuthExiting(true);
     } else {
         setTwoFAError("Invalid code. Please try again.");
         setTwoFAAttemptFailed(prev => prev + 1);
     }
     setIsVerifying2FA(false);
  };
  
  const handleResendMagicLink = async () => { 
      const userToUse = pending2FAUser || appUserRef.current;
      if (!userToUse || !userToUse.backup_codes || userToUse.backup_codes.length === 0) {
          setTwoFAError("No backup codes available to verify. Please contact support.");
          return;
      }
      // Send magic link using the first backup code as token for simplicity in this demo
      // Real implementation would generate a temporary token
      const result = await sendMagicLinkWithBrevo(userToUse.email, userToUse.backup_codes[0]);
      if (result.success) {
          setAuthInitialMode('2fa-magic-link');
      } else {
          setTwoFAError(result.error || "Failed to send magic link.");
      }
  };

  const handleResendVerification = async () => { 
      if (firebaseUser) {
          setIsResending(true);
          try {
              await sendEmailVerification(firebaseUser);
              setResendCooldown(60);
              addNotification({ title: 'Email Sent', message: 'Verification email resent.', type: 'success' });
          } catch (error: any) {
               if (error.code === 'auth/too-many-requests') {
                   const randomMsg = funnyRateLimitMessages[Math.floor(Math.random() * funnyRateLimitMessages.length)];
                   addNotification({ title: 'Chill Out!', message: randomMsg, type: 'warning' });
               } else {
                   addNotification({ title: 'Error', message: error.message, type: 'error' });
               }
          } finally {
              setIsResending(false);
          }
      }
  };
  
  const checkVerificationStatus = async () => { 
       if (firebaseUser) {
           await firebaseUser.reload();
           if (firebaseUser.emailVerified) {
               // The auth listener handles the rest
           } else {
               const msg = wittyVerificationMessages[verificationCheckCount % wittyVerificationMessages.length];
               setVerificationCheckCount(prev => prev + 1);
               addNotification({ title: 'Status', message: msg, type: 'info' });
           }
       } else {
            await refreshPosts();
       }
  };
  
  const handleLogout = async () => { 
      if (appUserRef.current) {
          localStorage.removeItem(`2fa_verified_${appUserRef.current.email}`);
      }
      signOut(auth); 
      is2FASignOutRef.current = false;
  };
  
  const handlePostDeletionAnimation = useCallback(() => { setShowDeletionAnimation(false); }, []);
  
  const handleDeleteAccount = useCallback(async (): Promise<string | void> => { 
      if (!appUserRef.current) return;
      
      setShowDeletionAnimation(true);
      // Actual deletion logic happens after animation in a real app, 
      // but here we trigger DB delete then wait for animation
      const success = await deleteUser(appUserRef.current.id);
      
      if (success && auth.currentUser) {
          await deleteFirebaseUser(auth.currentUser);
      }
      // Animation component handles redirect/UI cleanup visually
  }, []);

  const handleVerifyPassword = useCallback(async (password: string): Promise<boolean> => { 
      if (!auth.currentUser || !auth.currentUser.email) return false;
      try {
          const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
          await reauthenticateWithCredential(auth.currentUser, credential);
          return true;
      } catch (e) {
          return false;
      }
  }, []);

  const handleEmailChange = useCallback(async (newEmail: string): Promise<string | void> => { 
       if (!auth.currentUser) return "No user logged in.";
       try {
           await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
           return; // Success (email sent)
       } catch (error: any) {
           return error.message;
       }
  }, []);
  
  const handleContactAdmin = useCallback((from: GlobalNotification['from'], message: string) => { 
      // This is handled via database service primarily, but we can add local notification
      addNotification({ title: 'Message Sent', message: 'Your message has been sent to the admin.', type: 'success' });
  }, [addNotification]);

  // Post Handlers
  const handleSavePost = useCallback(async (postData: any, type: 'writeup' | 'blog') => { 
      // Ensure the author is attached to the post data if it's missing (e.g. new post)
      if (!postData.author && appUserRef.current) {
          postData = { ...postData, author: appUserRef.current };
      }
      
      let result;
      if (postData.id) {
          // Strip comments and liked_by so they are not overwritten when saving a post edit
          const { comments, liked_by, ...updateData } = postData;
          result = await updatePost(postData.id, updateData);
      } else {
          // Let database defaults handle likes and comments for fresh posts
          const { comments, liked_by, ...insertData } = postData;
          result = await addPost(insertData);
      }

      // Refresh posts to ensure state is in sync with database
      await refreshPosts();
      
      return result;
  }, [refreshPosts]);

  const handleDeletePost = useCallback(async (postId: string, type: 'writeup' | 'blog') => { 
      await deletePost(postId); 
      
      // Refresh posts to ensure state is in sync with database
      await refreshPosts();
  }, [refreshPosts]);
  
  // OPTIMISTIC UPDATE
  const handleLikePost = useCallback(async (post: Post, liker: User) => { 
      const isLiked = post.liked_by.includes(liker.id);
      const newLikes = isLiked ? post.liked_by.filter(id => id !== liker.id) : [...post.liked_by, liker.id];
      const optimisticPost = { ...post, liked_by: newLikes };
      
      const updater = post.type === 'writeup' ? setWriteups : setBlogPosts;
      updater(prev => prev.map(p => p.id === post.id ? optimisticPost : p));
      
      await likePost(post.id, post, liker.id); 
      
      if (!isLiked) {
          createPostNotification(post, liker, 'like_post', `${liker.name} liked your ${post.type}.`);
      }
  }, [createPostNotification]);
  
  const handleAddCommentToPost = useCallback(async (post: Post, commentText: string) => {
      const newComment = { id: crypto.randomUUID(), author: appUser!, text: commentText, created_at: new Date().toISOString() };
      const updated = await addCommentToPost(post.id, post, newComment);
      if (updated) {
          await refreshPosts();
          createPostNotification(post, appUser!, 'comment_post', `${appUser!.name} commented on your ${post.type}.`);
      }
  }, [appUser, refreshPosts, createPostNotification]);
  
  const handleDeleteCommentFromPost = useCallback(async (post: Post, commentId: string) => { 
       // Implementation requires backend support for specific comment deletion, 
       // currently mapped to updating post comments array
       const updatedComments = post.comments.filter(c => c.id !== commentId);
       const updatedPost = await updatePost(post.id, { comments: updatedComments });
       if (updatedPost) {
           await refreshPosts();
           addNotification({ title: 'Deleted', message: 'Comment deleted.', type: 'success' });
       }
  }, [refreshPosts, addNotification]);

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: (authPage || showLanding || is404 || isInitialAuthLoading || isDbLoading || isAuthLoading || !appUser) ? 'none' : `url(${selectedBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
  
  const LoadingScreen = ({ showLabel = true }: { showLabel?: boolean }) => (
    <div style={backgroundStyle} className={`min-h-screen font-sans flex items-center justify-center`}>
        <div className="text-center">
            <MicrochipLoader />
            {showLabel && <h1 className="text-xl font-bold text-slate-800 dark:text-white mt-4">Loading workspace...</h1>}
        </div>
    </div>
  );

  if (isInitialAuthLoading || isDbLoading || (isAuthLoading && !appUser)) {
    return <LoadingScreen />;
  }

  const handleNavigateToAuth = (mode: 'signin' | 'signup') => {
      setShowLanding(false);
      setAuthPage('auth');
      setAuthInitialMode(mode);
      window.location.hash = '#/auth';
  };

  const handleBackToLanding = () => {
      setShowLanding(true);
      setAuthPage(null);
      setShowHelpCenterPage(false);
      setShowPrivacy(false);
      setShowTerms(false);
      setShowSecurity(false);
      setShowStatus(false);
      window.location.hash = "#/";
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleBackToLanding();
    }
  };

  const handleNavigate = (page: Page) => {
    // Reset all special pages
    setShowHelpCenterPage(false);
    setShowPrivacy(false);
    setShowTerms(false);
    setShowSecurity(false);
    setShowStatus(false);
    setShowLanding(false);
    setAuthPage(null);
    setIs404(false);

    switch(page) {
      case 'home': 
        setShowLanding(true); 
        window.location.hash = '#/';
        break;
      case 'chat':
      case 'writeup':
      case 'blog':
      case 'settings':
      case 'about':
      case 'dashboard':
        if (appUser) {
          // DashboardPage handles internal routing
          window.location.hash = '#/dashboard';
        } else {
          setShowLanding(true);
          window.location.hash = '#/';
        }
        break;
      case 'login':
        setAuthPage('auth');
        setAuthInitialMode('signin');
        window.location.hash = '#/auth';
        break;
      case 'signup':
        setAuthPage('auth');
        setAuthInitialMode('signup');
        window.location.hash = '#/auth';
        break;
      case 'privacy':
        setShowPrivacy(true);
        window.location.hash = '#/privacy';
        break;
      case 'terms':
        setShowTerms(true);
        window.location.hash = '#/terms';
        break;
      case 'security':
        setShowSecurity(true);
        window.location.hash = '#/security';
        break;
      case 'status':
        setShowStatus(true);
        window.location.hash = '#/status';
        break;
      default:
        setShowLanding(true);
        window.location.hash = '#/';
    }
  };

  if (window.location.hash === ADMIN_LOGIN_PATH) {
      return (
        <Suspense fallback={<LoadingScreen showLabel={false} />}>
          <div style={backgroundStyle} className={`min-h-screen font-sans`}>
              <AdminLoginPage />
          </div>
        </Suspense>
      );
  }

  if (showMaintenance) {
      return (
        <Suspense fallback={<LoadingScreen showLabel={false} />}>
          <div style={backgroundStyle} className={`min-h-screen font-sans`}>
              <MaintenancePage settings={globalSettings} />
          </div>
        </Suspense>
      );
  }

  if (showSitemap) {
      return (
        <Suspense fallback={<LoadingScreen showLabel={false} />}>
          <div style={backgroundStyle} className={`min-h-screen font-sans`}>
              <SitemapPage onNavigateHome={handleBackToLanding} />
          </div>
        </Suspense>
      );
  }

  if (showHelpCenterPage) {
      return (
        <Suspense fallback={<LoadingScreen showLabel={false} />}>
          <HelpCenterPage 
              onNavigateHome={handleBackToLanding}
              onNavigate={handleNavigate}
              user={appUser}
          />
        </Suspense>
      );
  }

  if (showPrivacy) {
    return (
      <Suspense fallback={<LoadingScreen showLabel={false} />}>
        <PrivacyPage onNavigateHome={handleBackToLanding} isDarkMode={themeMode === 'dark'} onAction={() => handleNavigate('home')} onShowCopyright={() => { }} />
      </Suspense>
    );
  }

  if (showTerms) {
    return (
      <Suspense fallback={<LoadingScreen showLabel={false} />}>
        <TermsPage onNavigateHome={handleBackToLanding} isDarkMode={themeMode === 'dark'} onAction={() => handleNavigate('home')} onShowCopyright={() => { }} />
      </Suspense>
    );
  }

  if (showSecurity) {
    return (
      <Suspense fallback={<LoadingScreen showLabel={false} />}>
        <SecurityPage onNavigateHome={handleBackToLanding} isDarkMode={themeMode === 'dark'} onAction={() => handleNavigate('home')} onShowCopyright={() => { }} />
      </Suspense>
    );
  }

  if (showStatus) {
    return (
      <Suspense fallback={<LoadingScreen showLabel={false} />}>
        <StatusPage onNavigateHome={handleBackToLanding} isDarkMode={themeMode === 'dark'} />
      </Suspense>
    );
  }

  if (is404) {
      return (
        <Suspense fallback={<LoadingScreen showLabel={false} />}>
          <div style={backgroundStyle} className={`min-h-screen font-sans`}>
              <NotFoundPage />
          </div>
        </Suspense>
      );
  }

  return (
    <NotificationProvider value={notificationContextValue}>
      <Suspense fallback={<LoadingScreen showLabel={false} />}>
        <div style={backgroundStyle} className={`${(authPage === null && appUser) ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'} font-sans relative`}>
          {appUser && !showLanding && <AnimatedBackground />}
          <NotificationContainer />
          {(!appUser && showLanding && !authPage) && <ElevenLabsWidget />}
          
          {(showWelcomeAnimation || isWelcomeAnimationRunning.current) && userForWelcome ? (
               <WelcomeAnimation onComplete={handleWelcomeAnimationEnd} username={userForWelcome.name.split(' ')[0]} />
          ) : (
              <>
                  {appUser && !showLanding && (
                    <main className="h-full w-full overflow-hidden">
                      <DashboardPage 
                        user={appUser} 
                        allUsers={allUsers}
                        writeups={writeups}
                        blogPosts={blogPosts}
                        setAllUsers={setAllUsers} 
                        onLogout={handleLogout} 
                        onSendFriendRequest={handleSendFriendRequest} 
                        onAcceptFriendRequest={handleAcceptFriendRequest}
                        onRejectFriendRequest={handleRejectFriendRequest}
                        onRemoveFriend={handleRemoveFriend} 
                        onProfileUpdate={handleProfileUpdate}
                        onSavePost={handleSavePost}
                        onDeletePost={handleDeletePost}
                        onLikePost={handleLikePost}
                        onAddCommentToPost={handleAddCommentToPost}
                        onDeleteCommentFromPost={handleDeleteCommentFromPost}
                        onRequestWriteupAccess={handleRequestWriteupAccess}
                        onApproveWriteupAccess={handleApproveWriteupAccess}
                        onRejectWriteupAccess={handleRejectWriteupAccess}
                        onDeleteAccount={handleDeleteAccount}
                        onVerifyPassword={handleVerifyPassword}
                        onEmailChange={handleEmailChange}
                        isSyncingProfile={isSyncingProfile}
                      />
                    </main>
                  )}
                  
                  {!appUser && showLanding && !authPage && !isPerformingLoginRef.current && !userForWelcome && (
                      <LandingPage 
                          onGetStarted={() => handleNavigateToAuth('signup')}
                          onSignIn={() => handleNavigateToAuth('signin')}
                          onContactAdmin={handleContactAdmin}
                          allUsers={allUsers}
                          blogPosts={blogPosts}
                          onPostInteraction={refreshPosts}
                      />
                  )}

                  {authPage && !appUser && !userForWelcome && (
                    <div ref={authBodyRef} className="fixed inset-0 z-50 transition-opacity duration-300 auth-body">
                      <AuthPage 
                        isExiting={isAuthExiting}
                        initialMode={authInitialMode}
                        onLogin={handleLogin}
                        onSignup={handleSignup}
                        onSocialLogin={handleSocialLogin}
                        onForgotPassword={handleForgotPassword}
                        email={verificationEmail || emailFor2FA}
                        onResend={handleResendVerification}
                        onGoToLogin={() => { 
                          if (auth.currentUser) {
                            signOut(auth); 
                          }
                          setAuthInitialMode('signin');
                        }}
                        isResending={isResending}
                        resendCooldown={resendCooldown}
                        onCheckStatus={checkVerificationStatus}
                        onResendMagicLink={handleResendMagicLink}
                        onVerify2FACode={handleVerify2FACode}
                        isVerifying2FACode={isVerifying2FA}
                        twoFACodeError={twoFAError}
                        twoFAAttemptFailed={twoFAAttemptFailed}
                        onClear2FAError={() => setTwoFAError(null)}
                        onContactAdmin={handleContactAdmin}
                        onBackToHome={handleBackToLanding} 
                      />
                    </div>
                  )}
                  
              </>
          )}
          
          {showDeletionAnimation && (
              <DeletionAnimation onAnimationEnd={handlePostDeletionAnimation} />
          )}
        </div>
      </Suspense>
    </NotificationProvider>
  );
};

export default App;


import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, ThemeStyle, ThemeMode, TaskbarPosition, DesktopIconSize, TimeFormat, Timezone } from '../types';
import { 
  Palette, 
  Layout, 
  Monitor, 
  Sun, 
  Moon, 
  ArrowLeft, 
  Check, 
  User as LucideUser, 
  Shield, 
  Users, 
  Wrench,
  Clock,
  Scaling,
  Globe,
  Bell,
  Eye,
  EyeOff,
  Copy,
  Mail,
  Loader2,
  Trash2,
  Pencil,
  CheckCircle,
  XCircle,
  Smartphone,
  AppWindow,
  MonitorSmartphone,
  Key,
  Menu,
  Image,
  ChevronLeft,
  Type,
  Languages,
  Search,
  UserPlus,
  UserMinus,
  UserCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotificationState } from '../contexts/NotificationContext';
import { useTheme, BackgroundCategory } from '../contexts/ThemeContext';
import { useTime } from '../contexts/TimeContext';
import { getCloudinaryUrl, uploadToCloudinary } from '../utils/imageService';
import { DEFAULT_TOTP_SECRET, generateTOTPSecret, verifyTOTP } from '../utils/totp';
import ConfirmationModal from '../components/ConfirmationModal';
import { generateAlphanumericCode } from '../services/database';
import ParticlesBackground from '../components/ParticlesBackground';
import { updatePassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Compatibility Aliases for existing components in this file
const PaletteIcon = Palette;
const WindowsIcon = Layout;
const SunIcon = Sun;
const MoonIcon = Moon;
const ArrowLeftIcon = ArrowLeft;
const UserIcon = LucideUser;
const ShieldIcon = Shield;
const UsersIcon = Users;
const ToolboxIcon = Wrench;
const PencilIcon = Pencil;
const SpinnerIcon = Loader2;
const CheckIcon = Check;
const XCircleIcon = XCircle;
const CheckCircleIcon = CheckCircle;
const KeyIcon = Key;
const MenuIcon = Menu;
const ImageIcon = Image;
const GlobeIcon = Globe;
const BellIcon = Bell;
const EyeIcon = Eye;
const EyeSlashIcon = EyeOff;
const CopyIcon = Copy;
const EmailIcon = Mail;

const TypeIcon = Type;
const LanguagesIcon = Languages;

// EyeIcon for View Profile
// (Removed manual SVG blocks since we switched to Lucide)

interface SettingsPageProps {
  user: User | null;
  allUsers: User[];
  setAllUsers: (users: User[] | ((currentUsers: User[]) => User[])) => void;
  taskbarPosition: TaskbarPosition;
  setTaskbarPosition: (position: TaskbarPosition) => void;
  desktopIconSize: DesktopIconSize;
  setDesktopIconSize: (size: DesktopIconSize) => void;
  onAcceptFriendRequest: (requestor: { email: string; name: string; }) => void;
  onRejectFriendRequest: (requestor: { email: string; name: string; }) => void;
  onRemoveFriend: (friendToRemove: { email: string; name: string; }) => void;
  onSendFriendRequest: (fromUser: User, toUserEmail: string) => void;
  onOpenApp?: (appId: string, props?: Record<string, any>) => void;
  onLogout: () => void;
  onProfileUpdate: (updatedData: Partial<User>, silent?: boolean) => Promise<void>;
  onDeleteAccount: () => Promise<string | void>;
  onVerifyPassword: (password: string) => Promise<boolean>;
  onEmailChange: (newEmail: string) => Promise<string | void>;
  deepLinkInfo?: string | null;
  onNavigateWithinApp?: (path: string) => void;
}

type SettingsSection = 'profile' | 'appearance' | 'tools' | 'friends' | 'account';

const colorClasses = [
  'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
];

const isNewDay = (timestamp1: number, timestamp2: number): boolean => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.getFullYear() !== date2.getFullYear() ||
           date1.getMonth() !== date2.getMonth() ||
           date1.getDate() !== date2.getDate();
};

interface RegenInfo {
  count: number;
  lastReset: number; // timestamp
}

const getRegenInfo = (userEmail: string): RegenInfo => {
  const key = `2fa-regen-info-${userEmail}`;
  try {
    const item = localStorage.getItem(key);
    if (!item) return { count: 0, lastReset: Date.now() };
    
    const info: RegenInfo = JSON.parse(item);
    const now = Date.now();

    if (isNewDay(info.lastReset, now)) {
        const newInfo = { count: 0, lastReset: now };
        localStorage.setItem(key, JSON.stringify(newInfo));
        return newInfo;
    }
    return info;
  } catch (e) {
    return { count: 0, lastReset: Date.now() };
  }
};

const updateRegenInfo = (userEmail: string, info: RegenInfo) => {
    const key = `2fa-regen-info-${userEmail}`;
    localStorage.setItem(key, JSON.stringify(info));
};

const SettingsNavItem: React.FC<{
  label: string;
  icon: React.ReactElement;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <li className="flex-shrink-0">
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
        isActive
          ? 'bg-slate-200 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/60'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5 flex-shrink-0' })}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  </li>
);

const SettingsCard: React.FC<{title: string, description?: string, children: React.ReactNode, footer?: React.ReactNode}> = ({title, description, children, footer}) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            {children}
        </div>
        {footer && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                {footer}
            </div>
        )}
    </div>
);

const FieldSection: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    saveState: 'idle' | 'saving' | 'saved';
    children: React.ReactNode;
}> = ({ title, description, icon, isEditing, onEdit, onCancel, onSave, saveState, children }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                    </div>
                </div>
                {!isEditing ? (
                    <button onClick={onEdit} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 flex-shrink-0">
                        <PencilIcon className="w-4 h-4" /> Edit
                    </button>
                ) : (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={onCancel} disabled={saveState !== 'idle'} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button onClick={onSave} disabled={saveState !== 'idle'} className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-2 min-w-[100px] ${saveState === 'saved' ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90'}`}>
                            {saveState === 'idle' && 'Save'}
                            {saveState === 'saving' && <SpinnerIcon className="w-4 h-4" />}
                            {saveState === 'saved' && <CheckIcon className="w-4 h-4" />}
                        </button>
                    </div>
                )}
            </div>
            <div className={`transition-all duration-300 ${isEditing ? 'opacity-100' : 'opacity-90'}`}>
                {children}
            </div>
        </div>
    );
};

const getSkillColor = (skill: string) => {
    const colors = [
        'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
        'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
        'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
        'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
        'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
        'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30',
        'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30',
        'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 dark:border-fuchsia-500/30'
    ];
    let hash = 0;
    for (let i = 0; i < skill.length; i++) {
        hash = skill.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const ProfileSettings: React.FC<{user: User, onSave: (updatedUser: Partial<User>, silent?: boolean) => Promise<void>, onOpenApp: (appId: string, props?: Record<string, any>) => void}> = ({ user, onSave, onOpenApp }) => {
    const { addNotification } = useNotificationState();

    // Independent Edit States
    const [editSection, setEditSection] = useState<'none' | 'basic' | 'bio' | 'skills' | 'identity'>('none');
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Basic Info State
    const [displayName, setDisplayName] = useState(user.name);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Bio State
    const [bio, setBio] = useState(user.bio || '');

    // Skills State
    const [skills, setSkills] = useState(user.skills || []);
    const [skillInput, setSkillInput] = useState('');

    // Identity & Privacy State
    const [gender, setGender] = useState<User['gender']>(user.gender || 'Other');
    const [isPrivate, setIsPrivate] = useState(user.is_profile_private || false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAvatarUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            await onSave({ avatar: imageUrl }, true);
            addNotification({ title: 'Success', message: 'Profile picture updated!', type: 'success' });
        } catch (error) {
            addNotification({ title: 'Upload Failed', message: 'Could not upload profile picture.', type: 'error' });
        } finally {
            setIsAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    const handleSaveSection = async (section: 'basic' | 'bio' | 'skills' | 'identity') => {
        setSaveState('saving');
        
        let updateData: Partial<User> = {};
        
        if (section === 'basic') {
            if (!displayName.trim()) {
                addNotification({ title: 'Invalid Name', message: 'Display name cannot be empty.', type: 'error' });
                setSaveState('idle');
                return;
            }
            updateData = { name: displayName };
        } else if (section === 'bio') {
            updateData = { bio };
        } else if (section === 'skills') {
            updateData = { skills };
        } else if (section === 'identity') {
            updateData = { gender, is_profile_private: isPrivate };
        }

        await onSave(updateData);
        setSaveState('saved');
        
        setTimeout(() => {
            setSaveState('idle');
            setEditSection('none');
        }, 1000);
    };

    const handleCancelSection = (section: 'basic' | 'bio' | 'skills' | 'identity') => {
        if (section === 'basic') setDisplayName(user.name);
        else if (section === 'bio') setBio(user.bio || '');
        else if (section === 'skills') {
            setSkills(user.skills || []);
            setSkillInput('');
        }
        else if (section === 'identity') {
            setGender(user.gender || 'Other');
            setIsPrivate(user.is_profile_private || false);
        }
        setEditSection('none');
    };

    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === 'Enter' || e.key === ',') && skillInput.trim() && skills.length < 10) {
        e.preventDefault();
        const newSkill = skillInput.trim();
        if (!skills.includes(newSkill)) setSkills([...skills, newSkill]);
        setSkillInput('');
      }
    };

    return (
        <div className="max-w-3xl mx-auto pb-16 space-y-8 animate-fade-in-up">
            
            <div className="mb-4">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Profile Settings</h2>
                <p className="text-base text-slate-500 dark:text-slate-400 mt-2">Manage your personal information and how others see you.</p>
            </div>

            {/* 1. Basic Info Section */}
            <FieldSection 
                title="Basic Information" 
                description="Your photo, name, and primary email address."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                isEditing={editSection === 'basic'}
                onEdit={() => setEditSection('basic')}
                onCancel={() => handleCancelSection('basic')}
                onSave={() => handleSaveSection('basic')}
                saveState={editSection === 'basic' ? saveState : 'idle'}
            >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 py-2">
                    <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                        <img src={getCloudinaryUrl(user.avatar, { width: 120, height: 120, radius: 'max' })} alt={user.name} className="w-full h-full object-cover" />
                        {editSection === 'basic' && (
                            <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 hover:bg-black/60 flex flex-col items-center justify-center text-white transition-opacity opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                                {isAvatarUploading ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                                </>}
                            </button>
                        )}
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} hidden accept="image/*" />
                    </div>
                    <div className="w-full space-y-5">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Display Name</label>
                            {editSection === 'basic' ? (
                                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white" />
                            ) : (
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
                            <div className="flex items-center gap-3">
                                <p className="text-base text-slate-600 dark:text-slate-300 font-medium">{user.email}</p>
                                <div className="relative overflow-hidden flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-amber-500/40 bg-gradient-to-r from-slate-900 via-black to-slate-900 shadow-[0_0_10px_rgba(251,191,36,0.15)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-[10px] uppercase font-bold tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent z-10">Verified</span>
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" style={{ animation: 'shimmerSweep 2.5s infinite' }}></div>
                                    <style>{`
                                        @keyframes shimmerSweep {
                                            0% { transform: translateX(-150%) skewX(-15deg); }
                                            100% { transform: translateX(250%) skewX(-15deg); }
                                        }
                                    `}</style>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </FieldSection>

            {/* 2. Biography Section */}
            <FieldSection 
                title="Biography" 
                description="A brief description of yourself shown on your profile."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                isEditing={editSection === 'bio'}
                onEdit={() => setEditSection('bio')}
                onCancel={() => handleCancelSection('bio')}
                onSave={() => handleSaveSection('bio')}
                saveState={editSection === 'bio' ? saveState : 'idle'}
            >
                {editSection === 'bio' ? (
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Passionate developer building things out of pixels..." className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white resize-y min-h-[120px]" />
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50">
                        {user.bio ? (
                            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{user.bio}</p>
                        ) : (
                            <p className="text-slate-400 dark:text-slate-500 italic">No biography written yet.</p>
                        )}
                    </div>
                )}
            </FieldSection>

            {/* 3. Capabilities Section */}
            <FieldSection 
                title="Top Capabilities" 
                description="List your primary technical skills or professional attributes."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                isEditing={editSection === 'skills'}
                onEdit={() => setEditSection('skills')}
                onCancel={() => handleCancelSection('skills')}
                onSave={() => handleSaveSection('skills')}
                saveState={editSection === 'skills' ? saveState : 'idle'}
            >
                {editSection === 'skills' ? (
                    <div className="space-y-4 bg-slate-50 dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-wrap gap-2">
                            {skills.length === 0 && <span className="text-slate-400 text-sm py-1">No skills added yet</span>}
                            {skills.map((skill) => (
                                <div key={skill} className={`flex items-center gap-1.5 text-sm font-semibold pl-3 pr-2 py-1.5 rounded-lg shadow-sm border ${getSkillColor(skill)}`}>
                                    {skill}
                                    <button onClick={() => setSkills(skills.filter(s => s !== skill))} className="opacity-60 hover:opacity-100 transition-opacity ml-1">
                                        <XCircleIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} placeholder={skills.length < 10 ? "Type a skill and press Enter..." : "Limit reached (10)"} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white mt-2" disabled={skills.length >= 10} />
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {user.skills && user.skills.length > 0 ? (
                            user.skills.map(skill => (
                                <span key={skill} className={`text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm border ${getSkillColor(skill)}`}>
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic text-sm">No capabilities listed.</span>
                        )}
                    </div>
                )}
            </FieldSection>

            {/* 4. Identity & Privacy Section */}
            <FieldSection 
                title="Identity & Visibility" 
                description="Control how your profile is identified and who can see it."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>}
                isEditing={editSection === 'identity'}
                onEdit={() => setEditSection('identity')}
                onCancel={() => handleCancelSection('identity')}
                onSave={() => handleSaveSection('identity')}
                saveState={editSection === 'identity' ? saveState : 'idle'}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                    {/* Gender Setup */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Gender Identity</label>
                        {editSection === 'identity' ? (
                            <div className="flex flex-col gap-2">
                                {(['Male', 'Female', 'Other'] as const).map(g => (
                                    <button key={g} onClick={() => setGender(g)} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${gender === g ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                        {g}
                                        {gender === g && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-800 dark:text-slate-200 font-medium">{user.gender || 'Not specified'}</p>
                        )}
                    </div>

                    {/* Privacy Setup */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Profile Visibility</label>
                        {editSection === 'identity' ? (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">Make Profile Private</span>
                                    <button onClick={() => setIsPrivate(!isPrivate)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPrivate ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`}/>
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    When enabled, your entire profile including your bio and skills will be hidden from public view and only accessible to approved friends.
                                </p>
                            </div>
                        ) : (
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border ${user.is_profile_private ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'}`}>
                                {user.is_profile_private ? (
                                    <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Private Account</>
                                ) : (
                                    <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Public Account</>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </FieldSection>

        </div>
    );
};

const ToolsSettings: React.FC<{
    user: User;
    onProfileUpdate: (data: Partial<User>) => Promise<void>;
}> = ({ user, onProfileUpdate }) => {
    const { selectedFont, setSelectedFont, triggerTransition } = useTheme();
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const handleSelectedFontChange = (font: string) => {
        triggerTransition(() => setSelectedFont(font));
        onProfileUpdate({ desktop_preferences: { selectedFont: font } });
    };

    const fonts = [
        { name: 'Inter', family: 'Inter, sans-serif' },
        { name: 'Lexend', family: 'Lexend, sans-serif' },
        { name: 'Roboto Slab', family: '"Roboto Slab", serif' },
        { name: 'Source Code Pro', family: '"Source Code Pro", monospace' },
        { name: 'Playfair Display', family: '"Playfair Display", serif' },
    ];

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
        { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
    ];

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in-up space-y-8">
            <div className="mb-6 px-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t('tools')}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Configure your workspace tools and regional settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Language Settings Bento */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 transform transition-all hover:shadow-md">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <LanguagesIcon className="w-5 h-5 text-indigo-500" />
                                {t('language_settings')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('language_desc')}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {languages.map((lang, idx) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                style={{ animationDelay: `${idx * 100}ms` }}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 animate-slide-up ${
                                    i18n.language === lang.code 
                                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-500/10 shadow-sm ring-1 ring-indigo-500/20' 
                                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
                                        i18n.language === lang.code
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                        {lang.nativeName.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-semibold ${i18n.language === lang.code ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {lang.nativeName}
                                        </div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {lang.name}
                                        </div>
                                    </div>
                                </div>
                                {i18n.language === lang.code && (
                                    <div className="flex-shrink-0 text-indigo-600 dark:text-indigo-400 animate-pop-in">
                                        <CheckCircleIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Premium Fonts Bento */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 transform transition-all hover:shadow-md">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <TypeIcon className="w-5 h-5 text-indigo-500" />
                                {t('premium_fonts')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('premium_fonts_desc')}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 h-[400px] overflow-y-auto pr-2 hide-scrollbar">
                        {fonts.map((font, idx) => (
                            <button
                                key={font.name}
                                onClick={() => handleSelectedFontChange(font.name)}
                                style={{ animationDelay: `${(idx * 50) + 200}ms` }}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 animate-slide-up ${
                                    selectedFont === font.name 
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm' 
                                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`font-semibold text-lg ${selectedFont === font.name ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'}`} style={{ fontFamily: font.family }}>{font.name}</span>
                                    {selectedFont === font.name && <CheckCircleIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 animate-pop-in" />}
                                </div>
                                <p className={`text-sm ${selectedFont === font.name ? 'text-indigo-700/80 dark:text-indigo-300/80' : 'text-slate-500 dark:text-slate-400'}`} style={{ fontFamily: font.family }}>The quick brown fox jumps over the lazy dog.</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AppearanceSettings: React.FC<{
    user: User;
    taskbarPosition: TaskbarPosition;
    setTaskbarPosition: (position: TaskbarPosition) => void;
    desktopIconSize: DesktopIconSize;
    setDesktopIconSize: (size: DesktopIconSize) => void;
    onProfileUpdate: (updatedData: Partial<User>) => Promise<void>;
}> = ({ user, taskbarPosition, setTaskbarPosition, desktopIconSize, setDesktopIconSize, onProfileUpdate }) => {
    const { themeStyle, setThemeStyle, themeMode, setThemeMode, selectedBackground, setSelectedBackground, backgroundCategories, triggerTransition } = useTheme();
    const { timeFormat, setTimeFormat, visibleTimezones, setVisibleTimezones } = useTime();
    const [activeCategory, setActiveCategory] = useState<BackgroundCategory | null>(null);

    const timezoneOptions: { id: Timezone, label: string }[] = [
        { id: 'local', label: 'Local Time' },
        { id: 'IST', label: 'Indian Standard Time (IST)' },
        { id: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    ];

    const handleTaskbarPositionChange = (pos: TaskbarPosition) => {
        setTaskbarPosition(pos);
        onProfileUpdate({ desktop_preferences: { taskbarPosition: pos } });
    };

    const handleDesktopIconSizeChange = (size: DesktopIconSize) => {
        setDesktopIconSize(size);
        onProfileUpdate({ desktop_preferences: { desktopIconSize: size } });
    };

    const handleTimeFormatChange = (format: TimeFormat) => {
        setTimeFormat(format);
        onProfileUpdate({ desktop_preferences: { timeFormat: format } });
    };

    const handleTimezoneChange = (tzId: Timezone) => {
        setVisibleTimezones(current => {
            let next: Timezone[];
            if (current.includes(tzId)) {
                if (current.length === 1) return current; // Prevent removing the last one
                next = current.filter(id => id !== tzId);
            } else {
                next = [...current, tzId];
            }
            onProfileUpdate({ desktop_preferences: { visibleTimezones: next } });
            return next;
        });
    };

    const handleWallpaperChange = (url: string) => {
        triggerTransition(() => setSelectedBackground(url));
        onProfileUpdate({ wallpaper: url });
    };

    const handleThemeStyleChange = (style: ThemeStyle) => {
        triggerTransition(() => setThemeStyle(style));
        onProfileUpdate({ desktop_preferences: { theme_style: style } });
    };

    const handleThemeModeChange = (mode: ThemeMode) => {
        triggerTransition(() => setThemeMode(mode));
        onProfileUpdate({ desktop_preferences: { theme_mode: mode } });
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in-up space-y-8">
            <div className="mb-6 px-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Appearance</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Personalize your workspace experience.</p>
            </div>

            {/* Core Theme Bento Box */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Theme & Interface</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select the operational style and lighting.</p>
                    </div>
                    <Palette className="w-8 h-8 text-indigo-500 opacity-20" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* OS Style */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interface Layout</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleThemeStyleChange('windows')}
                                className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 isolate overflow-hidden group ${themeStyle === 'windows' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
                            >
                                {themeStyle === 'windows' && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent -z-10 animate-fade-in"></div>}
                                <div className={`flex items-center gap-3 mb-3 ${themeStyle === 'windows' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    <Layout className="w-7 h-7 transition-transform group-hover:scale-110" />
                                    <span className="font-bold">Windows</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bottom taskbar, angular UI, start menu.</p>
                                {themeStyle === 'windows' && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500" />}
                            </button>
                            <button
                                onClick={() => handleThemeStyleChange('mac')}
                                className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 isolate overflow-hidden group ${themeStyle === 'mac' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
                            >
                                {themeStyle === 'mac' && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent -z-10 animate-fade-in"></div>}
                                <div className={`flex items-center gap-3 mb-3 ${themeStyle === 'mac' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    <Monitor className="w-7 h-7 transition-transform group-hover:scale-110" />
                                    <span className="font-bold">macOS</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Floating dock, rounded corners, top menu.</p>
                                {themeStyle === 'mac' && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500" />}
                            </button>
                        </div>
                    </div>

                    {/* Color Mode */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Color Mode</label>
                        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full h-[124px]">
                            <button 
                                onClick={() => handleThemeModeChange('light')} 
                                className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-300 ${themeMode === 'light' ? 'bg-white shadow-sm ring-1 ring-slate-200 text-slate-900' : 'text-slate-500 hover:bg-white/40 dark:hover:bg-slate-700'}`}
                            >
                                <Sun className="h-8 w-8 text-amber-500" />
                                <span className="font-bold text-sm">Light</span>
                            </button>
                            <button 
                                onClick={() => handleThemeModeChange('dark')} 
                                className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-300 ${themeMode === 'dark' ? 'bg-slate-900 shadow-sm ring-1 ring-slate-700 text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >
                                <Moon className="h-8 w-8 text-indigo-400" />
                                <span className="font-bold text-sm">Dark</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Display & Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Taskbar Box */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                <MonitorSmartphone className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">Dock Position</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Anchor the main navigation bar.</p>
                            </div>
                        </div>
                    </div>
                        
                    <div className="grid grid-cols-2 gap-3 relative">
                        {/* Monitor mock */}
                        <div className="absolute inset-0 m-auto w-16 h-12 border-2 border-slate-300 dark:border-slate-600 rounded-md pointer-events-none z-10 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-slate-400">SCREEN</span>
                        </div>

                        {(['top', 'left', 'right', 'bottom'] as TaskbarPosition[]).map(pos => (
                            <button 
                                key={pos} 
                                onClick={() => handleTaskbarPositionChange(pos)} 
                                className={`relative p-3 h-16 rounded-xl border-2 flex items-center justify-center gap-2 transition-all group ${taskbarPosition === pos ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                <span className={`font-bold capitalize text-xs transition-colors ${taskbarPosition === pos ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500'}`}>{pos}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Desktop Size & Time Format */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 space-y-6 flex flex-col justify-between">
                    <div>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                <Scaling className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">Scale & Format</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Adjust desktop elements and timestamps.</p>
                            </div>
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Icon Scale</label>
                                <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    {(['small', 'medium', 'large'] as DesktopIconSize[]).map(size => (
                                        <button 
                                            key={size} 
                                            onClick={() => handleDesktopIconSizeChange(size)} 
                                            className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${desktopIconSize === size ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Time Format</label>
                                <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    <button 
                                        onClick={() => handleTimeFormatChange('12hr')} 
                                        className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${timeFormat === '12hr' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        12-Hour
                                    </button>
                                    <button 
                                        onClick={() => handleTimeFormatChange('24hr')} 
                                        className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${timeFormat === '24hr' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        24-Hour
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallpaper Selection Container */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <ImageIcon className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Wallpaper Selection</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activeCategory ? activeCategory.name : "Choose a category to find your perfect background."}</p>
                        </div>
                    </div>
                    {activeCategory && (
                        <button 
                            onClick={() => setActiveCategory(null)} 
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    )}
                </div>

                {!activeCategory ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                        {backgroundCategories.map(category => (
                            <button
                                key={category.name}
                                onClick={() => setActiveCategory(category)}
                                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-md focus:outline-none transition-all duration-300 group ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-indigo-300"
                            >
                                <img src={getCloudinaryUrl(category.cover, { width: 300, height: 225, crop: 'fill' })} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                                    <span className="text-white font-bold text-sm drop-shadow-md transform translate-y-1 group-hover:translate-y-0 transition-transform">{category.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                        {activeCategory.images.map(imgUrl => (
                            <button
                                key={imgUrl}
                                onClick={() => handleWallpaperChange(imgUrl)}
                                className={`relative aspect-video rounded-2xl overflow-hidden shadow-sm focus:outline-none transition-all duration-300 group ${selectedBackground === imgUrl ? 'ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-[0.98]' : 'ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-indigo-300 hover:shadow-md'}`}
                            >
                                <img src={getCloudinaryUrl(imgUrl, { width: 300, height: 168, crop: 'fill' })} alt="Wallpaper option" className="w-full h-full object-cover" />
                                {selectedBackground === imgUrl && (
                                    <div className="absolute inset-0 bg-indigo-500/30 flex items-center justify-center backdrop-blur-[2px] animate-fade-in">
                                        <div className="bg-white rounded-full p-2 shadow-lg">
                                            <Check className="w-5 h-5 text-indigo-600" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Timezones (Supplementary) */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Globe className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">Global Clocks</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Select which timezones to display in the system tray.</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {timezoneOptions.map(tz => (
                        <button
                            key={tz.id}
                            onClick={() => handleTimezoneChange(tz.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${visibleTimezones.includes(tz.id) ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${visibleTimezones.includes(tz.id) ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                {visibleTimezones.includes(tz.id) && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="font-bold text-sm">{tz.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


interface FriendManagementProps {
  user: User;
  allUsers: User[];
  onAccept: (requestor: { email: string; name: string; }) => void;
  onReject: (requestor: { email: string; name: string; }) => void;
  onRemoveFriend: (friendToRemove: { email: string; name: string; }) => void;
  onSendFriendRequest: (fromUser: User, toUserEmail: string) => void;
  onOpenApp: (appId: string, props?: Record<string, any>) => void;
}

const FriendManagement: React.FC<FriendManagementProps> = ({ user, allUsers, onAccept, onReject, onRemoveFriend, onSendFriendRequest, onOpenApp }) => {
    const friendRequests = user.friend_requests?.map(email => allUsers.find(u => u.email === email)).filter(Boolean) as User[] || [];
    const friends = user.friends?.map(email => allUsers.find(u => u.email === email)).filter(Boolean) as User[] || [];
    const [searchQuery, setSearchQuery] = useState('');

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) {
            return [];
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return allUsers.filter(u =>
            u.email !== user.email &&
            (u.name.toLowerCase().includes(lowercasedQuery) ||
             u.email.toLowerCase().includes(lowercasedQuery))
        );
    }, [searchQuery, allUsers, user.email]);

    const handleAddFriend = (toUserEmail: string) => {
        onSendFriendRequest(user, toUserEmail);
    };
    
    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in-up space-y-8">
            <div className="mb-6 px-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Friends Network</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your connections and discover people.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search & Discover Bento Box */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 transform transition-all hover:shadow-md h-fit">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Search className="w-5 h-5 text-indigo-500" />
                                Find Users
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Search for users by name or email.</p>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="search"
                            placeholder="Type a name or email..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {searchQuery.trim() && (
                        <div className="mt-6 space-y-3 max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
                            {searchResults.length > 0 ? (
                                searchResults.map((foundUser, idx) => {
                                    const isFriend = user.friends?.includes(foundUser.email);
                                    const requestSent = foundUser.friend_requests?.includes(user.email);
                                    const requestReceived = user.friend_requests?.includes(foundUser.email);
                                    
                                    return (
                                        <div 
                                            key={foundUser.email} 
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/80 animate-slide-up hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <img src={getCloudinaryUrl(foundUser.avatar, { width: 44, height: 44, radius: 'max' })} alt={foundUser.name} className="w-11 h-11 rounded-full shadow-sm" />
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm">{foundUser.name}</p>
                                                        {foundUser.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 14, height: 14 })} alt="Admin verified" className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{foundUser.email}</p>
                                                </div>
                                            </div>
                                            <div>
                                                {isFriend ? (
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
                                                        <UserCheck className="w-3.5 h-3.5" />
                                                        Friends
                                                    </div>
                                                ) : requestSent ? (
                                                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">
                                                        Request Sent
                                                    </div>
                                                ) : requestReceived ? (
                                                    <button
                                                        onClick={() => onAccept(foundUser)}
                                                        className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                                                    >
                                                        <UserPlus className="w-3.5 h-3.5" />
                                                        Accept
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddFriend(foundUser.email)}
                                                        className="px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 rounded-lg transition-all active:scale-95 flex items-center gap-1.5"
                                                    >
                                                        <UserPlus className="w-3.5 h-3.5" />
                                                        Add Friend
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No users found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Friend Requests Bento Box */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 transform transition-all hover:shadow-md h-fit">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-500" />
                            Friend Requests
                            {friendRequests.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-full font-bold">
                                    {friendRequests.length}
                                </span>
                            )}
                        </h3>
                    </div>
                    
                    {friendRequests.length > 0 ? (
                        <div className="space-y-4">
                            {friendRequests.map((requestingUser, idx) => (
                                <div 
                                    key={requestingUser.email} 
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 animate-slide-up"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <img src={getCloudinaryUrl(requestingUser.avatar, { width: 40, height: 40, radius: 'max' })} alt={requestingUser.name} className="w-10 h-10 rounded-full shadow-sm" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{requestingUser.name}</span>
                                                {requestingUser.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 14, height: 14 })} alt="Admin verified" className="w-3 h-3 flex-shrink-0" />}
                                            </div>
                                            <p className="text-[11px] text-slate-500 truncate">{requestingUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <button 
                                            onClick={() => onReject(requestingUser)} 
                                            className="flex-1 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold text-xs transition-colors border border-red-200 dark:border-red-500/20"
                                        >
                                            Decline
                                        </button>
                                        <button 
                                            onClick={() => onAccept(requestingUser)} 
                                            className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-xs transition-colors shadow-sm"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <span className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6 text-slate-400" />
                            </span>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No pending requests.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Friends List Bento Box */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 transform transition-all hover:shadow-md">
                 <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        My Friends ({friends.length})
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your current connections.</p>
                </div>
                
                {friends.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {friends.map((friend, idx) => (
                            <div 
                                key={friend.email} 
                                style={{ animationDelay: `${idx * 50}ms` }}
                                className="group bg-slate-50 dark:bg-slate-800/30 p-4 border border-slate-200 dark:border-slate-700/50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-white dark:hover:bg-slate-800 animate-slide-up flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <img src={getCloudinaryUrl(friend.avatar, { width: 56, height: 56, radius: 'max' })} alt={friend.name} className="w-14 h-14 rounded-full shadow-sm border-2 border-white dark:border-slate-800" />
                                    <div className="overflow-hidden">
                                        <div className="flex items-center gap-1.5">
                                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{friend.name}</p>
                                            {friend.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 14, height: 14 })} alt="Admin verified" className="w-3.5 h-3.5 flex-shrink-0" />}
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">{friend.role}</p>
                                    </div>
                                </div>
                                <div className="mt-auto flex gap-2">
                                    <button 
                                        onClick={() => onOpenApp('about', { profileUserEmail: friend.email })} 
                                        className="flex-1 flex justify-center items-center gap-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Profile
                                    </button>
                                    <button 
                                        onClick={() => onRemoveFriend(friend)} 
                                        className="flex-none p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-100 dark:border-red-500/10" 
                                        title="Remove Friend"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white text-lg mb-1">Look around you</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Use the search area above to find friends.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const PasswordInput: React.FC<{id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, show: boolean, onToggle: () => void, autoFocus?: boolean}> = ({id, label, value, onChange, show, onToggle, autoFocus = false}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <div className="relative">
            <input 
                id={id} 
                type={show ? 'text' : 'password'} 
                value={value} 
                onChange={onChange} 
                className="modern-input pr-12" 
                autoFocus={autoFocus} 
            />
            <button 
                type="button" 
                onClick={onToggle} 
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none" 
                aria-label={show ? 'Hide password' : 'Show password'}
            >
                {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
        </div>
    </div>
);

const AccountSettings: React.FC<{
  user: User;
  onLogout: () => void;
  onDeleteAccount: () => Promise<string | void>;
  onProfileUpdate: (updates: Partial<User>) => Promise<void>;
  onVerifyPassword: (password: string) => Promise<boolean>;
  onEmailChange: (newEmail: string) => Promise<string | void>;
}> = ({ user, onLogout, onDeleteAccount, onProfileUpdate, onVerifyPassword, onEmailChange }) => {
    const { addNotification } = useNotificationState();

    // Email Change State
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [emailChangeStep, setEmailChangeStep] = useState(1);
    const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [emailPasswordError, setEmailPasswordError] = useState('');
    const [emailChangeLoading, setEmailChangeLoading] = useState(false);
    const [showEmailCurrent, setShowEmailCurrent] = useState(false);

    // Password Change State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordChangeStep, setPasswordChangeStep] = useState(1);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Delete Account State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // 2FA State
    const [codesVisible, setCodesVisible] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationPassword, setVerificationPassword] = useState('');
    const [showVerificationPwd, setShowVerificationPwd] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState<'view' | 'regenerate' | 'disable' | null>(null);
    const [isPasswordInputShaking, setIsPasswordInputShaking] = useState(false);
    const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
    const verificationFormRef = useRef<HTMLFormElement>(null);
    
    // QR Code Modal State
    const [showQRCodeModal, setShowQRCodeModal] = useState(false);
    const [setupTOTPCode, setSetupTOTPCode] = useState('');
    const [isVerifyingSetup, setIsVerifyingSetup] = useState(false);
    const [setupError, setSetupError] = useState<string | null>(null);
    const [tempSecret, setTempSecret] = useState<string | null>(null);
    const [tempBackupCodes, setTempBackupCodes] = useState<string[]>([]);

    // Handlers

    // --- Email Change Logic ---
    const handleEmailStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailChangeLoading(true);
        setEmailPasswordError('');
        
        const isValid = await onVerifyPassword(emailCurrentPassword);
        if (isValid) {
            setEmailChangeStep(2);
            setEmailPasswordError('');
        } else {
            setEmailPasswordError('Incorrect password.');
        }
        setEmailChangeLoading(false);
    };

    const handleEmailStep2 = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !newEmail.includes('@')) {
             setEmailPasswordError('Please enter a valid email.');
             return;
        }
        setEmailChangeStep(3);
        setEmailPasswordError('');
    };

    const handleEmailStep3 = async () => {
        setEmailChangeLoading(true);
        const error = await onEmailChange(newEmail);
        if (error) {
            setEmailPasswordError(typeof error === 'string' ? error : 'Failed to update email.');
        } else {
            addNotification({ title: 'Check your Inbox', message: `Verification email sent to ${newEmail}.`, type: 'success' });
            setIsChangingEmail(false);
            setNewEmail('');
            setEmailCurrentPassword('');
            setEmailChangeStep(1);
        }
        setEmailChangeLoading(false);
    };

    // --- Password Change Logic ---
    const handlePasswordStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordError('');

        const isValid = await onVerifyPassword(currentPassword);
        if (isValid) {
             setPasswordChangeStep(2);
             setPasswordError('');
        } else {
             setPasswordError("Incorrect current password.");
        }
        setPasswordLoading(false);
    };

    const handlePasswordStep2 = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
             setPasswordError("Password must be at least 6 characters.");
             return;
        }
        setPasswordChangeStep(3);
        setPasswordError('');
    };

    const handlePasswordStep3 = async () => {
        setPasswordLoading(true);
        try {
            if (auth.currentUser) {
                await updatePassword(auth.currentUser, newPassword);
                addNotification({ title: 'Success', message: 'Password updated successfully.', type: 'success' });
                setIsChangingPassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordChangeStep(1);
            } else {
                setPasswordError("No active session found.");
            }
        } catch (err: any) {
            setPasswordError(err.message || "Failed to update password.");
        } finally {
            setPasswordLoading(false);
        }
    };
    
    const toggle2FA = async () => {
        if (!user.is_2fa_enabled) {
            // Start 2FA Setup - Generate temp secret and codes
            const secret = generateTOTPSecret();
            const codes = Array.from({ length: 3 }, () => generateAlphanumericCode(6));
            setTempSecret(secret);
            setTempBackupCodes(codes);
            setSetupTOTPCode('');
            setSetupError(null);
            setShowQRCodeModal(true);
        } else {
            // Disable 2FA - Require password
            setActionToConfirm('disable');
            setVerificationError(null);
            setVerificationPassword('');
            setShowVerificationModal(true);
        }
    };

    const handleVerifySetup = async () => {
        if (!tempSecret) return;
        setIsVerifyingSetup(true);
        setSetupError(null);
        
        try {
            const isValid = await verifyTOTP(setupTOTPCode, tempSecret);
            if (isValid) {
                await onProfileUpdate({
                    is_2fa_enabled: true,
                    totp_secret: tempSecret,
                    backup_codes: tempBackupCodes
                });
                addNotification({ title: '2FA Enabled', message: 'Two-Factor Authentication has been successfully enabled.', type: 'success' });
                setShowQRCodeModal(false);
                setTempSecret(null);
                setTempBackupCodes([]);
            } else {
                setSetupError('Invalid verification code. Please try again.');
            }
        } catch (error) {
            setSetupError('Verification failed. Please try again.');
        } finally {
            setIsVerifyingSetup(false);
        }
    };

    const handleVerificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        setVerificationError(null);

        const isValid = await onVerifyPassword(verificationPassword);
        
        if (isValid) {
            setShowVerificationModal(false);
            if (actionToConfirm === 'view') {
                setCodesVisible(true);
            } else if (actionToConfirm === 'regenerate') {
                await performRegenerate();
            } else if (actionToConfirm === 'disable') {
                await performDisable2FA();
            }
            setVerificationPassword('');
        } else {
            setVerificationError('Incorrect password');
            setIsPasswordInputShaking(true);
            setTimeout(() => setIsPasswordInputShaking(false), 500);
        }
        setIsVerifying(false);
    };

    const performDisable2FA = async () => {
        await onProfileUpdate({ is_2fa_enabled: false, backup_codes: [] });
        addNotification({ title: 'Success', message: 'Two-Factor Authentication disabled.', type: 'warning' });
    };

    const performRegenerate = async () => {
        const info = getRegenInfo(user.email);
        if (info.count >= 3) {
            addNotification({ title: 'Limit Reached', message: 'You can only regenerate codes 3 times per day.', type: 'error' });
            return;
        }

        const newCodes = Array.from({ length: 3 }, () => generateAlphanumericCode(6));
        await onProfileUpdate({ backup_codes: newCodes });
        updateRegenInfo(user.email, { count: info.count + 1, lastReset: info.lastReset });
        addNotification({ title: 'Success', message: 'New backup codes generated.', type: 'success' });
        setCodesVisible(true); // Show new codes
    };

    const handleCopyCode = (code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setCopiedCodeIndex(index);
        setTimeout(() => setCopiedCodeIndex(null), 2000);
    };

    // Helper to render timeline progress
    const TimelineHeader = ({ step, title1, title2, title3 }: { step: number; title1: string; title2: string; title3: string }) => {
        const isStep1Completed = step > 1;
        const isStep2Completed = step > 2;
        const isStep3Completed = step > 3; 

        // Helper for node classes
        const getNodeClasses = (stepNum: number) => {
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            
            if (isCompleted) return 'bg-emerald-500 border-emerald-500 text-white transition-colors duration-[1500ms]';
            if (isActive) return 'bg-emerald-500 border-emerald-500 text-white ring-4 ring-emerald-500/20 transition-all duration-300 delay-[1000ms]';
            return 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 transition-colors duration-300';
        };

        const getTextClasses = (stepNum: number) => {
            const isActiveOrCompleted = step >= stepNum;
            return isActiveOrCompleted ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 font-medium';
        };

        return (
            <div className="w-full px-2 mb-10">
                <div className="flex items-center w-full">
                    {/* Step 1 */}
                    <div className="relative flex flex-col items-center group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 ${getNodeClasses(1)}`}>
                            {isStep1Completed ? <CheckIcon className="w-4 h-4 stroke-[3]" /> : '1'}
                        </div>
                        <div className={`absolute -bottom-6 w-32 text-center text-[10px] uppercase tracking-wider transition-colors duration-300 ${getTextClasses(1)}`}>
                            {title1}
                        </div>
                    </div>

                    {/* Connector 1-2 */}
                    <div className="flex-1 h-1 mx-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative isolate">
                        <div 
                            className={`absolute inset-0 bg-emerald-500 origin-left transition-transform duration-[1500ms] ease-in-out ${step > 1 ? 'scale-x-100' : 'scale-x-0'}`}
                        ></div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex flex-col items-center group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 ${getNodeClasses(2)}`}>
                            {isStep2Completed ? <CheckIcon className="w-4 h-4 stroke-[3]" /> : '2'}
                        </div>
                        <div className={`absolute -bottom-6 w-32 text-center text-[10px] uppercase tracking-wider transition-colors duration-300 ${getTextClasses(2)}`}>
                            {title2}
                        </div>
                    </div>

                    {/* Connector 2-3 */}
                    <div className="flex-1 h-1 mx-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative isolate">
                         <div 
                            className={`absolute inset-0 bg-emerald-500 origin-left transition-transform duration-[1500ms] ease-in-out ${step > 2 ? 'scale-x-100' : 'scale-x-0'}`}
                         ></div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative flex flex-col items-center group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 ${getNodeClasses(3)}`}>
                             {step > 3 ? <CheckIcon className="w-4 h-4 stroke-[3]" /> : '3'}
                        </div>
                        <div className={`absolute -bottom-6 w-32 text-center text-[10px] uppercase tracking-wider transition-colors duration-300 ${getTextClasses(3)}`}>
                            {title3}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in-up space-y-8">
            <div className="mb-6 px-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Security & Account</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your sign-in methods, security, and data.</p>
            </div>
            
            <ConfirmationModal
                isOpen={showVerificationModal}
                onClose={() => { setShowVerificationModal(false); setVerificationPassword(''); }}
                onConfirm={() => { if(verificationFormRef.current) verificationFormRef.current.requestSubmit(); }}
                title="Verify Identity"
                confirmText="Verify"
                confirmButtonClass="bg-indigo-600 hover:bg-indigo-700"
            >
                <form ref={verificationFormRef} onSubmit={handleVerificationSubmit}>
                    <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                        Please enter your password to continue.
                    </p>
                    <div className={`relative ${isPasswordInputShaking ? 'animate-shake' : ''}`}>
                        <input
                            type={showVerificationPwd ? "text" : "password"}
                            value={verificationPassword}
                            onChange={(e) => setVerificationPassword(e.target.value)}
                            className="modern-input w-full"
                            placeholder="Password"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowVerificationPwd(!showVerificationPwd)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                            {showVerificationPwd ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    {verificationError && <p className="text-xs text-red-500 mt-2">{verificationError}</p>}
                </form>
            </ConfirmationModal>
            
            {/* QR Code Modal */}
            <ConfirmationModal
                isOpen={showQRCodeModal}
                onClose={() => { setShowQRCodeModal(false); setTempSecret(null); }}
                onConfirm={user.is_2fa_enabled ? () => setShowQRCodeModal(false) : handleVerifySetup}
                title={user.is_2fa_enabled ? "Authenticator Setup" : "Enable 2FA"}
                confirmText={user.is_2fa_enabled ? "Done" : "Verify & Enable"}
                cancelText="Close"
                loading={isVerifyingSetup}
                disabled={!user.is_2fa_enabled && setupTOTPCode.length !== 6}
            >
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="bg-white p-2 rounded-lg shadow-sm mb-4">
                         <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`otpauth://totp/HtWtH:${user.email}?secret=${tempSecret || user.totp_secret || DEFAULT_TOTP_SECRET}&issuer=HtWtH`)}`} 
                            alt="2FA QR Code" 
                            className="w-40 h-40"
                        />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        {user.is_2fa_enabled ? "Authenticator App" : "Step 1: Scan QR Code"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
                        Scan this code with Google Authenticator or any TOTP app to generate verification codes.
                    </p>
                    
                    {!user.is_2fa_enabled && (
                        <div className="w-full space-y-4">
                            <div className="text-left">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Step 2: Enter 6-digit code</label>
                                <input 
                                    type="text"
                                    value={setupTOTPCode}
                                    onChange={(e) => setSetupTOTPCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="modern-input w-full text-center text-2xl tracking-[0.5em] font-mono"
                                    maxLength={6}
                                />
                                {setupError && <p className="text-xs text-red-500 mt-1">{setupError}</p>}
                            </div>
                            
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-900/30 text-left">
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                                    <ShieldIcon className="w-3 h-3"/> Important
                                </p>
                                <p className="text-[10px] text-amber-600 dark:text-amber-500 leading-relaxed">
                                    Enabling 2FA will require a code from your app for every login. Make sure you can generate codes before proceeding.
                                </p>
                            </div>
                        </div>
                    )}

                    {(tempSecret || user.totp_secret) && (
                        <div className="mt-4 p-2 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 w-full">
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Manual Entry Key</p>
                            <p className="text-sm font-mono text-indigo-600 dark:text-indigo-400 break-all">{tempSecret || user.totp_secret}</p>
                        </div>
                    )}
                </div>
            </ConfirmationModal>

            {/* Sign-in Methods Bento Box */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 transform transition-all hover:shadow-md">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-500" />
                        Sign-in Methods
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your email and password.</p>
                </div>

                <div className="space-y-4">
                    {/* Email Row */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Email Address</p>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{user.email}</p>
                            </div>
                        </div>
                        {!isChangingEmail && (
                            <button onClick={() => setIsChangingEmail(true)} className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-500/30 transition-colors">Change</button>
                        )}
                    </div>
                    
                    {/* Email Change Form */}
                    {isChangingEmail && (
                        <div className="relative p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl animate-fade-in overflow-visible ml-16">
                            {/* Decorative Background Blur */}
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

                            <TimelineHeader step={emailChangeStep} title1="Verify" title2="New Email" title3="Confirm" />

                            <div className="relative z-10">
                                {/* Step 1 Content */}
                                 {emailChangeStep === 1 && (
                                    <form onSubmit={handleEmailStep1} className="space-y-4 animate-slide-in-right">
                                        <div className="text-center">
                                             <h4 className="text-lg font-bold text-slate-900 dark:text-white">Verify it's you</h4>
                                             <p className="text-sm text-slate-500 dark:text-slate-400">Enter your current password to continue.</p>
                                        </div>
                                        <div className="max-w-xs mx-auto">
                                            <PasswordInput 
                                                id="email-verify-pw" 
                                                label="" 
                                                value={emailCurrentPassword} 
                                                onChange={e => setEmailCurrentPassword(e.target.value)} 
                                                show={showEmailCurrent} 
                                                onToggle={() => setShowEmailCurrent(!showEmailCurrent)} 
                                                autoFocus 
                                            />
                                        </div>
                                         {emailPasswordError && (
                                            <div className="flex justify-center mt-4">
                                                 <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full text-xs font-medium">
                                                    <XCircleIcon className="w-4 h-4" />
                                                    {emailPasswordError}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex justify-center gap-3 mt-6">
                                            <button 
                                                type="button" 
                                                onClick={() => { setIsChangingEmail(false); setEmailChangeStep(1); setEmailCurrentPassword(''); setNewEmail(''); setEmailPasswordError(''); }} 
                                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                disabled={emailChangeLoading} 
                                                className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center gap-2"
                                            >
                                                {emailChangeLoading ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : 'Next Step'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Step 2 Content */}
                                {emailChangeStep === 2 && (
                                    <form onSubmit={handleEmailStep2} className="space-y-4 animate-slide-in-right">
                                         <div className="text-center">
                                             <h4 className="text-lg font-bold text-slate-900 dark:text-white">New Address</h4>
                                             <p className="text-sm text-slate-500 dark:text-slate-400">Enter the email you want to switch to.</p>
                                        </div>
                                        <div className="max-w-xs mx-auto">
                                            <input 
                                                type="email" 
                                                value={newEmail} 
                                                onChange={e => setNewEmail(e.target.value)} 
                                                className="modern-input w-full text-center font-medium" 
                                                placeholder="new.email@example.com"
                                                autoFocus 
                                                required 
                                            />
                                        </div>
                                         {emailPasswordError && (
                                            <div className="flex justify-center mt-4">
                                                 <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full text-xs font-medium">
                                                    <XCircleIcon className="w-4 h-4" />
                                                    {emailPasswordError}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex justify-center gap-3 mt-6">
                                            <button 
                                                type="button" 
                                                onClick={() => { setEmailChangeStep(1); setEmailPasswordError(''); }} 
                                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                                            >
                                                Next Step
                                            </button>
                                        </div>
                                    </form>
                                )}
                                
                                {/* Step 3 Content */}
                                {emailChangeStep === 3 && (
                                     <div className="space-y-6 animate-slide-in-right text-center">
                                         <div>
                                             <h4 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Change</h4>
                                             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We will send a verification link to your new address.</p>
                                        </div>
                                        
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 inline-block text-left w-full max-w-xs">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase">Current</span>
                                                <span className="text-sm font-mono text-slate-600 dark:text-slate-300">{user.email}</span>
                                            </div>
                                            <div className="flex justify-center my-1 text-slate-300 dark:text-slate-600">↓</div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-400 uppercase">New</span>
                                                <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400 font-bold">{newEmail}</span>
                                            </div>
                                        </div>

                                        {emailPasswordError && (
                                            <div className="flex justify-center mt-2">
                                                 <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full text-xs font-medium">
                                                    <XCircleIcon className="w-4 h-4" />
                                                    {emailPasswordError}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-center gap-3">
                                            <button 
                                                type="button" 
                                                onClick={() => setEmailChangeStep(2)} 
                                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                onClick={handleEmailStep3}
                                                disabled={emailChangeLoading} 
                                                className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg shadow-lg hover:shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center gap-2"
                                            >
                                                {emailChangeLoading ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : 'Send Verification Link'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Password Row */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 animate-slide-up" style={{ animationDelay: '150ms' }}>
                         <div className="flex items-center gap-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                <Key className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Password</p>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">••••••••</p>
                            </div>
                        </div>
                        {!isChangingPassword && (
                            <button onClick={() => setIsChangingPassword(true)} className="px-4 py-1.5 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-lg border border-purple-200 dark:border-purple-500/30 transition-colors">Change</button>
                        )}
                    </div>

                    {/* Password Change Form */}
                     {isChangingPassword && (
                         <div className="relative p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl animate-fade-in overflow-visible ml-16">
                             {/* Decorative Background Blur */}
                             <div className="absolute top-0 left-0 -mt-4 -ml-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
                             <div className="absolute bottom-0 right-0 -mb-4 -mr-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                             <TimelineHeader step={passwordChangeStep} title1="Verify" title2="New Password" title3="Submit" />

                             <div className="relative z-10">
                                {/* Step 1: Verify Current Password */}
                                {passwordChangeStep === 1 && (
                                    <form onSubmit={handlePasswordStep1} className="space-y-4 animate-slide-in-right">
                                        <div className="text-center">
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Security Check</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Enter your current password.</p>
                                        </div>
                                        <div className="max-w-xs mx-auto">
                                            <PasswordInput id="current-pw" label="" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} autoFocus />
                                        </div>
                                         {passwordError && (
                                            <div className="flex justify-center mt-4">
                                                 <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full text-xs font-medium">
                                                    <XCircleIcon className="w-4 h-4" />
                                                    {passwordError}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex justify-center gap-3 mt-6">
                                            <button 
                                                type="button" 
                                                onClick={() => { setIsChangingPassword(false); setPasswordChangeStep(1); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); }} 
                                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                disabled={passwordLoading}
                                                className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center gap-2"
                                            >
                                                {passwordLoading ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : 'Next Step'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Step 2: New Password Inputs */}
                                {passwordChangeStep === 2 && (
                                    <form onSubmit={handlePasswordStep2} className="space-y-4 animate-slide-in-right">
                                         <div className="text-center">
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Create New Password</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Make it strong and secure.</p>
                                        </div>
                                        <div className="max-w-sm mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <PasswordInput id="new-pw" label="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} show={showNew} onToggle={() => setShowNew(!showNew)} autoFocus />
                                            <PasswordInput id="confirm-pw" label="Confirm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                                        </div>
                                         {passwordError && (
                                            <div className="flex justify-center mt-4">
                                                 <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full text-xs font-medium">
                                                    <XCircleIcon className="w-4 h-4" />
                                                    {passwordError}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex justify-center gap-3 mt-6">
                                            <button 
                                                type="button" 
                                                onClick={() => { setPasswordChangeStep(1); setPasswordError(''); }} 
                                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                                            >
                                                Next Step
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Step 3: Confirmation */}
                                {passwordChangeStep === 3 && (
                                    <div className="space-y-6 animate-slide-in-right text-center">
                                         <div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Ready to Update?</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This will change your password immediately.</p>
                                        </div>
                                        
                                         {passwordError && (
                                            <div className="flex justify-center mt-2">
                                                 <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full text-xs font-medium">
                                                    <XCircleIcon className="w-4 h-4" />
                                                    {passwordError}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-center gap-3">
                                            <button 
                                                type="button" 
                                                onClick={() => setPasswordChangeStep(2)} 
                                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                onClick={handlePasswordStep3}
                                                disabled={passwordLoading}
                                                className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center gap-2"
                                            >
                                                {passwordLoading ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : 'Update Password'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                             </div>
                         </div>
                     )}
                </div>
            </div>
            
            {/* 2FA Settings Bento Box */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 transform transition-all hover:shadow-md animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Extra security for your account.</p>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-4">
                             <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Authenticator App</p>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Secure your account with TOTP codes.</p>
                            </div>
                        </div>
                        <button 
                            onClick={toggle2FA}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-800 ${user.is_2fa_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <span aria-hidden="true" className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${user.is_2fa_enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
                        </button>
                    </div>

                    {user.is_2fa_enabled && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 animate-fade-in shadow-sm ml-14">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <KeyIcon className="w-4 h-4"/> Backup Codes
                                </h4>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setShowQRCodeModal(true)}
                                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Show QR Code
                                    </button>
                                    {!codesVisible ? (
                                        <button 
                                            onClick={() => { setActionToConfirm('view'); setVerificationError(null); setVerificationPassword(''); setShowVerificationModal(true); }}
                                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            View Codes
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setCodesVisible(false)}
                                            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                        >
                                            Hide
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => { setActionToConfirm('regenerate'); setVerificationError(null); setVerificationPassword(''); setShowVerificationModal(true); }}
                                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Regenerate
                                    </button>
                                </div>
                            </div>
                            
                            {codesVisible ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {user.backup_codes?.map((code, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                                            <span className="font-mono text-sm tracking-widest">{code}</span>
                                            <button 
                                                onClick={() => handleCopyCode(code, index)}
                                                className="text-slate-400 hover:text-indigo-500 transition-colors"
                                                title="Copy code"
                                            >
                                                {copiedCodeIndex === index ? <CheckIcon className="w-4 h-4 text-green-500"/> : <CopyIcon className="w-4 h-4"/>}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                    <ShieldIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2"/>
                                    <p className="text-xs text-slate-500">Codes are hidden for security</p>
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mt-3">
                                ⚠️ Save these codes in a safe place. You can use each code once to log in if you lose access to your account.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone Bento Box */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-red-200 dark:border-red-900/30 p-8 transform transition-all hover:shadow-md animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        Danger Zone
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Irreversible account actions.</p>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-900 dark:text-red-200">Delete Account</h4>
                            <p className="text-sm font-medium text-red-700 dark:text-red-400/80">Permanently remove your account and all data.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 whitespace-nowrap"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => { onDeleteAccount(); setIsDeleteModalOpen(false); }}
                title="Delete Account"
                confirmText="Yes, delete my account"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            >
                <p>Are you absolutely sure? This action cannot be undone. All your data will be permanently lost.</p>
            </ConfirmationModal>
        </div>
    );
};

const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  allUsers,
  setAllUsers,
  taskbarPosition,
  setTaskbarPosition,
  desktopIconSize,
  setDesktopIconSize,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onRemoveFriend,
  onSendFriendRequest,
  onOpenApp,
  onLogout,
  onProfileUpdate,
  onDeleteAccount,
  onVerifyPassword,
  onEmailChange,
  deepLinkInfo
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state

  // Handle deep link navigation
  useEffect(() => {
      if (deepLinkInfo) {
          if (['profile', 'appearance', 'tools', 'friends', 'account'].includes(deepLinkInfo)) {
              setActiveSection(deepLinkInfo as SettingsSection);
          }
      }
  }, [deepLinkInfo]);

  const { t } = useTranslation();

  const navigationItems = [
    { id: 'profile', label: t('profile'), icon: <UserIcon size={20} /> },
    { id: 'appearance', label: t('appearance'), icon: <Palette size={20} /> },
    { id: 'tools', label: t('tools'), icon: <ToolboxIcon size={20} /> },
    { id: 'friends', label: t('friends'), icon: <UsersIcon size={20} /> },
    { id: 'account', label: t('account'), icon: <ShieldIcon size={20} /> },
  ];

  const renderSection = () => {
    // If no user (e.g. somehow navigated here while logged out, or loading), 
    // we can show a loader or just nothing.
    // However, Dashboard typically ensures user exists.
    if (!user) return null;

    switch (activeSection) {
      case 'profile': return <ProfileSettings user={user} onSave={onProfileUpdate} onOpenApp={onOpenApp || (() => {})} />;
      case 'appearance': return <AppearanceSettings user={user} taskbarPosition={taskbarPosition} setTaskbarPosition={setTaskbarPosition} desktopIconSize={desktopIconSize} setDesktopIconSize={setDesktopIconSize} onProfileUpdate={onProfileUpdate} />;
      case 'tools': return <ToolsSettings user={user} onProfileUpdate={onProfileUpdate} />;
      case 'friends': return <FriendManagement user={user} allUsers={allUsers} onAccept={onAcceptFriendRequest} onReject={onRejectFriendRequest} onRemoveFriend={onRemoveFriend} onSendFriendRequest={onSendFriendRequest} onOpenApp={onOpenApp || (() => {})} />;
      case 'account': return <AccountSettings user={user} onLogout={onLogout} onDeleteAccount={onDeleteAccount} onProfileUpdate={onProfileUpdate} onVerifyPassword={onVerifyPassword} onEmailChange={onEmailChange} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      <ParticlesBackground />
      {/* Mobile Sidebar Toggle - Only visible on small screens when sidebar is closed */}
      {/* Removed old floating button to use proper header */}

      {/* Sidebar */}
      <aside className={`
          absolute inset-y-0 left-0 z-30 w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-slate-700">
              <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <SettingsNavItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeSection === item.id}
                onClick={() => { setActiveSection(item.id as SettingsSection); setSidebarOpen(false); }}
              />
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
          <div className="absolute inset-0 z-20 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        
        {/* NEW MOBILE HEADER */}
        <div className="md:hidden flex items-center p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
            <button 
                onClick={() => setSidebarOpen(true)} 
                className="p-2 -ml-2 mr-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white capitalize">Settings</h1>
        </div>

        <div className="max-w-4xl mx-auto p-6 md:p-10">
          {activeSection !== 'profile' && activeSection !== 'appearance' && (
              <header className="mb-8 hidden md:block">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{activeSection} Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your {activeSection} preferences and configuration.</p>
              </header>
          )}
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;

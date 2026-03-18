
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, ThemeStyle, ThemeMode, TaskbarPosition, DesktopIconSize, TimeFormat, Timezone } from '../types';
import UserIcon from '../components/icons/UserIcon';
import ShieldIcon from '../components/icons/ShieldIcon';
import UsersIcon from '../components/icons/UsersIcon';
import { useNotificationState } from '../contexts/NotificationContext';
import XCircleIcon from '../components/icons/XCircleIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import { useTheme, BackgroundCategory } from '../contexts/ThemeContext';
import { useTime } from '../contexts/TimeContext';
import PaletteIcon from '../components/icons/PaletteIcon';
import WindowsIcon from '../components/icons/WindowsIcon';
import EmailIcon from '../components/icons/EmailIcon';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import { getCloudinaryUrl, uploadToCloudinary } from '../utils/imageService';
import { DEFAULT_TOTP_SECRET, generateTOTPSecret, verifyTOTP } from '../utils/totp';
import PencilIcon from '../components/icons/PencilIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import KeyIcon from '../components/icons/KeyIcon';
import CheckIcon from '../components/icons/CheckIcon';
import { generateAlphanumericCode } from '../services/database';
import ToolboxIcon from '../components/icons/ToolboxIcon';
import ParticlesBackground from '../components/ParticlesBackground';
import { updatePassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import MenuIcon from '../components/icons/MenuIcon';

// EyeIcon for View Profile
const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
    </svg>
);

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.375a2.25 2.25 0 012.25-2.25h6.375a2.25 2.25 0 01-2.25 2.25H9.75" />
  </svg>
);

const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

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
      {React.cloneElement(icon, { className: 'w-5 h-5 flex-shrink-0' })}
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

const ProfileSettings: React.FC<{user: User, onSave: (updatedUser: Partial<User>, silent?: boolean) => Promise<void>, onOpenApp: (appId: string, props?: Record<string, any>) => void}> = ({ user, onSave, onOpenApp }) => {
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const { addNotification } = useNotificationState();

    const [isEditingName, setIsEditingName] = useState(false);
    const [displayName, setDisplayName] = useState(user.name);
    const [displayNameSaveState, setDisplayNameSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

    const [bio, setBio] = useState(user.bio || '');
    const [bioSaveState, setBioSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
    
    const [gender, setGender] = useState<User['gender']>(user.gender || 'Other');
    const [skills, setSkills] = useState(user.skills || []);
    const [skillInput, setSkillInput] = useState('');
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
            const message = error instanceof Error ? error.message : 'Could not upload profile picture.';
            addNotification({ 
                title: 'Upload Failed', 
                message: `Upload failed: ${message}. Please ensure you have created an unsigned upload preset named 'Photosimagees'.`, 
                type: 'error',
                duration: 10000 
            });
        } finally {
            setIsAvatarUploading(false);
        }
    };

    const handleSaveDisplayName = async () => {
        if (!displayName.trim()) {
            addNotification({ title: 'Invalid Name', message: 'Display name cannot be empty.', type: 'error' });
            return;
        }
        setDisplayNameSaveState('saving');
        await onSave({ name: displayName });
        setDisplayNameSaveState('saved');
        setIsEditingName(false);
        setTimeout(() => setDisplayNameSaveState('idle'), 2000);
    };

    const handleSaveBio = async () => {
        setBioSaveState('saving');
        await onSave({ bio: bio });
        setBioSaveState('saved');
        setTimeout(() => setBioSaveState('idle'), 2000);
    };

    const handleGenderChange = async (newGender: User['gender']) => {
        setGender(newGender);
        await onSave({ gender: newGender }, true);
    };

    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === 'Enter' || e.key === ',') && skillInput.trim() && skills.length < 10) {
        e.preventDefault();
        const newSkill = skillInput.trim();
        if (!skills.includes(newSkill)) {
            const newSkills = [...skills, newSkill];
            setSkills(newSkills);
            onSave({ skills: newSkills }, true);
        }
        setSkillInput('');
      }
    };
    
    const handleRemoveSkill = (skillToRemove: string) => {
        const newSkills = skills.filter(skill => skill !== skillToRemove);
        setSkills(newSkills);
        onSave({ skills: newSkills }, true);
    };

    const handlePrivacyToggle = async () => {
        const newIsPrivate = !isPrivate;
        setIsPrivate(newIsPrivate);
        await onSave({ is_profile_private: newIsPrivate }, true);
        addNotification({ title: 'Privacy Updated', message: `Profile is now ${newIsPrivate ? 'private' : 'public'}.`, type: 'success', duration: 3000 });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex items-center gap-4 sm:gap-5">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 group flex-shrink-0">
                    <img src={getCloudinaryUrl(user.avatar, { width: 128, height: 128, radius: 'max' })} alt={displayName} className="w-full h-full rounded-full shadow-md" />
                    <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} hidden accept="image/*" />
                    <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isAvatarUploading}
                        className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Change profile picture"
                    >
                        {isAvatarUploading ? <SpinnerIcon className="w-8 h-8 animate-spin" /> : <>
                            <PencilIcon className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Change</span>
                        </>}
                    </button>
                </div>
                <div className="flex-1 w-full">
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Display Name"
                                className="modern-input !p-2 flex-grow !text-lg lg:!text-xl !font-bold !text-slate-800 dark:!text-slate-100 bg-slate-100 dark:bg-slate-700"
                                autoFocus
                                onKeyDown={(e) => { if(e.key === 'Enter') handleSaveDisplayName(); if(e.key === 'Escape') { setIsEditingName(false); setDisplayName(user.name); }}}
                            />
                            <button onClick={() => { setIsEditingName(false); setDisplayName(user.name); }} className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"><XCircleIcon className="w-5 h-5"/></button>
                            <button onClick={handleSaveDisplayName} disabled={displayNameSaveState !== 'idle'} className={`p-2 rounded-md text-white transition-colors w-10 h-10 flex items-center justify-center ${displayNameSaveState === 'saved' ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                {displayNameSaveState === 'saving' ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 group/name">
                             <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{displayName}</h2>
                             <button onClick={() => setIsEditingName(true)} className="p-1.5 rounded-full text-slate-400 dark:text-slate-500 opacity-0 group-hover/name:opacity-100 transition-opacity hover:bg-slate-200 dark:hover:bg-slate-700"><PencilIcon className="w-4 h-4"/></button>
                        </div>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-400 break-all mt-1">{user.email}</p>
                </div>
            </div>

            {/* Details Card */}
            <SettingsCard title="Details">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="bio-settings" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                        <textarea id="bio-settings" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a little about yourself..." className="modern-textarea w-full" rows={4}/>
                        <div className="flex justify-end mt-2">
                            <button onClick={handleSaveBio} disabled={bioSaveState !== 'idle' || bio === (user.bio || '')} className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-all duration-300 flex items-center justify-center gap-2 w-28 h-10 ${bioSaveState === 'saved' ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-70 disabled:cursor-not-allowed`}>
                                {bioSaveState === 'idle' && 'Save Bio'}
                                {bioSaveState === 'saving' && <SpinnerIcon className="w-5 h-5" />}
                                {bioSaveState === 'saved' && <><CheckIcon className="w-5 h-5"/> Saved!</>}
                            </button>
                        </div>
                    </div>
                     <hr className="border-slate-200 dark:border-slate-700" />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                        <div className="flex items-center gap-1 rounded-lg p-1 bg-slate-200 dark:bg-slate-700 max-w-xs" role="radiogroup">
                            {(['Male', 'Female', 'Other'] as const).map(g => (
                                <button key={g} type="button" role="radio" aria-checked={gender === g} onClick={() => handleGenderChange(g)} className={`flex-1 p-2 text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 ${gender === g ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50'}`}>
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsCard>
            
            {/* Skills Card */}
             <SettingsCard title="Skills">
                 <div>
                    <label htmlFor="skills-settings" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Skills</label>
                    <div className="modern-input flex items-center flex-wrap gap-2 !p-2 min-h-[44px]" onClick={() => document.getElementById('skills-settings')?.focus()}>
                        {skills.map((skill, index) => (
                            <div key={skill} className={`flex items-center gap-1.5 text-sm font-medium pl-3 pr-2 py-1 rounded-full ${colorClasses[index % colorClasses.length]}`}>
                                {skill}
                                <button onClick={() => handleRemoveSkill(skill)} className="text-current opacity-70 hover:opacity-100" aria-label={`Remove skill ${skill}`}><XCircleIcon className="w-4 h-4" /></button>
                            </div>
                        ))}
                        <input id="skills-settings" type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} placeholder={skills.length < 10 ? "Add a skill..." : "Limit reached"} className="bg-transparent flex-1 focus:outline-none min-w-[100px]" disabled={skills.length >= 10}/>
                    </div>
                     <p className="text-xs text-slate-400 mt-1">Press Enter or comma to add a skill (max 10).</p>
                </div>
            </SettingsCard>

            {/* Privacy Card */}
            <SettingsCard title="Privacy Settings">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100" id="privacy-label">Make Profile Private</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400" id="privacy-description">When enabled, only your friends can see your full profile.</p>
                    </div>
                    <button type="button" role="switch" aria-checked={isPrivate} aria-labelledby="privacy-label" onClick={handlePrivacyToggle} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 ${isPrivate ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <span aria-hidden="true" className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${isPrivate ? 'translate-x-5' : 'translate-x-0'}`}/>
                    </button>
                </div>
            </SettingsCard>
        </div>
    );
};

import { useTranslation } from 'react-i18next';

const ToolsSettings: React.FC = () => {
    const { selectedFont, setSelectedFont } = useTheme();
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
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
        <div className="space-y-8">
            <SettingsCard
                title={t('language_settings')}
                description={t('language_desc')}
            >
                <div className="flex flex-col gap-3">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                                i18n.language === lang.code 
                                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                    i18n.language === lang.code
                                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                }`}>
                                    {lang.nativeName.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <div className={`font-semibold ${i18n.language === lang.code ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {lang.nativeName}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        {lang.name}
                                    </div>
                                </div>
                            </div>
                            {i18n.language === lang.code && (
                                <div className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                                    <CheckCircleIcon className="w-6 h-6" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </SettingsCard>

            <SettingsCard
                title={t('premium_fonts')}
                description={t('premium_fonts_desc')}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fonts.map((font) => (
                        <button
                            key={font.name}
                            onClick={() => setSelectedFont(font.name)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${selectedFont === font.name ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}
                        >
                            <span className="font-semibold text-lg" style={{ fontFamily: font.family }}>{font.name}</span>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2" style={{ fontFamily: font.family }}>The quick brown fox jumps over the lazy dog.</p>
                        </button>
                    ))}
                </div>
            </SettingsCard>
        </div>
    );
};

const AppearanceSettings: React.FC<{
    taskbarPosition: TaskbarPosition;
    setTaskbarPosition: (position: TaskbarPosition) => void;
    desktopIconSize: DesktopIconSize;
    setDesktopIconSize: (size: DesktopIconSize) => void;
    onProfileUpdate: (updatedData: Partial<User>) => Promise<void>;
}> = ({ taskbarPosition, setTaskbarPosition, desktopIconSize, setDesktopIconSize, onProfileUpdate }) => {
    const { themeStyle, setThemeStyle, themeMode, setThemeMode, selectedBackground, setSelectedBackground, backgroundCategories } = useTheme();
    const { timeFormat, setTimeFormat, visibleTimezones, setVisibleTimezones } = useTime();
    const [activeCategory, setActiveCategory] = useState<BackgroundCategory | null>(null);

    const timezoneOptions: { id: Timezone, label: string }[] = [
        { id: 'local', label: 'Local Time' },
        { id: 'IST', label: 'Indian Standard Time (IST)' },
        { id: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    ];

    const handleTimezoneChange = (tzId: Timezone) => {
        setVisibleTimezones(current => {
            if (current.includes(tzId)) {
                if (current.length === 1) return current; // Prevent removing the last one
                return current.filter(id => id !== tzId);
            } else {
                return [...current, tzId];
            }
        });
    };

    const handleWallpaperChange = (url: string) => {
        setSelectedBackground(url);
        onProfileUpdate({ wallpaper: url });
    };

    return (
        <div className="space-y-8">
            <SettingsCard
                title="Theme & Mode"
                description="Customize the look and feel of the OS."
            >
                <div>
                    <h4 className="text-base font-semibold mb-2">Theme</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => setThemeStyle('windows')}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${themeStyle === 'windows' ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <WindowsIcon className="w-6 h-6" />
                                <span className="font-semibold">Windows</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">The classic, familiar look with a full-width taskbar and sharp corners.</p>
                        </button>
                        <button
                            onClick={() => setThemeStyle('mac')}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${themeStyle === 'mac' ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12.35 0C6.98 0 2.51.91 2.51 6.5c0 2.89 1.34 5.61 3.4 7.23-.23.11-2.4 1.25-2.4 4.02 0 3.25 2.52 3.75 4.88 3.75 1.5 0 2.52-.94 4.01-.94s2.51.94 4.01.94c2.36 0 4.88-.5 4.88-3.75 0-2.77-2.17-3.91-2.4-4.02 2.06-1.62 3.4-4.34 3.4-7.23C22.19.91 17.72 0 12.35 0zm.01 2.02c1.34 0 2.53.84 2.94 2.04-.1.02-2.19.92-3.13-1.45-.37-.92.06-2.11.19-2.59z"/></svg>
                                <span className="font-semibold">macOS</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">A modern, elegant feel with a central dock, rounded corners, and traffic-light controls.</p>
                        </button>
                    </div>
                </div>

                 {/* Theme Mode: Light vs Dark */}
                <div className="mt-6">
                    <h4 className="text-base font-semibold mb-2">Mode</h4>
                    <div className="flex gap-2 rounded-lg p-1 bg-slate-200 dark:bg-slate-700 max-w-xs">
                        <button onClick={() => setThemeMode('light')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition-all ${themeMode === 'light' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-white/50'}`}>Light</button>
                        <button onClick={() => setThemeMode('dark')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition-all ${themeMode === 'dark' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:bg-slate-600/50'}`}>Dark</button>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Desktop Background"
                description={activeCategory ? activeCategory.name : "Choose a category for your desktop wallpaper."}
            >
                {!activeCategory ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in">
                        {backgroundCategories.map(category => (
                            <button
                                key={category.name}
                                onClick={() => setActiveCategory(category)}
                                className="relative aspect-video rounded-lg overflow-hidden focus:outline-none transition-transform duration-200 group hover:scale-105"
                            >
                                <img src={getCloudinaryUrl(category.cover, { width: 200, height: 112, crop: 'fill' })} alt={category.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2">
                                    <span className="text-white font-bold text-center drop-shadow-lg text-sm">{category.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <button onClick={() => setActiveCategory(null)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-4 hover:underline">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
                            Back to Categories
                        </button>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {activeCategory.images.map(imgUrl => (
                                <button
                                    key={imgUrl}
                                    onClick={() => handleWallpaperChange(imgUrl)}
                                    className={`relative aspect-video rounded-lg overflow-hidden focus:outline-none transition-all duration-200 group ${selectedBackground === imgUrl ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-800' : 'hover:ring-2 hover:ring-indigo-300'}`}
                                >
                                    <img src={getCloudinaryUrl(imgUrl, { width: 200, height: 112, crop: 'fill' })} alt="Desktop background option" className="w-full h-full object-cover" />
                                    {selectedBackground === imgUrl && (
                                        <div className="absolute inset-0 bg-indigo-500/60 flex items-center justify-center">
                                            <CheckIcon className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </SettingsCard>

            <SettingsCard
                title="Taskbar Position"
                description="Change where the taskbar appears on your screen."
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(['bottom', 'top', 'left', 'right'] as TaskbarPosition[]).map(pos => (
                        <button key={pos} onClick={() => setTaskbarPosition(pos)} className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${taskbarPosition === pos ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}>
                            <div className="w-16 h-10 bg-slate-200 dark:bg-slate-700 rounded-sm relative">
                                <div className={`absolute bg-indigo-400 rounded-sm ${
                                    pos === 'bottom' ? 'h-1.5 bottom-0.5 left-0.5 right-0.5' :
                                    pos === 'top' ? 'h-1.5 top-0.5 left-0.5 right-0.5' :
                                    pos === 'left' ? 'w-1.5 top-0.5 bottom-0.5 left-0.5' :
                                    'w-1.5 top-0.5 bottom-0.5 right-0.5'
                                }`}></div>
                            </div>
                            <span className="font-semibold capitalize text-sm">{pos}</span>
                        </button>
                    ))}
                </div>
            </SettingsCard>
            
            <SettingsCard
                title="Desktop Icon Size"
                description="Adjust the size of the icons on your desktop."
            >
                <div className="flex items-center gap-2 rounded-lg p-1 bg-slate-200 dark:bg-slate-700 max-w-xs">
                    {(['small', 'medium', 'large'] as DesktopIconSize[]).map(size => (
                        <button key={size} onClick={() => setDesktopIconSize(size)} className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors capitalize ${desktopIconSize === size ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10'}`}>{size}</button>
                    ))}
                </div>
            </SettingsCard>

            <SettingsCard
                title="Time Management"
                description="Customize how time is displayed on your desktop."
            >
                <div className="space-y-6">
                    <div>
                        <h4 className="text-base font-semibold mb-2">Time Format</h4>
                        <div className="flex gap-2 rounded-lg p-1 bg-slate-200 dark:bg-slate-700 max-w-xs">
                            <button onClick={() => setTimeFormat('12hr')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition-all ${timeFormat === '12hr' ? 'bg-white dark:bg-slate-900 shadow text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-white/5 dark:hover:bg-slate-600/50'}`}>12-Hour</button>
                            <button onClick={() => setTimeFormat('24hr')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition-all ${timeFormat === '24hr' ? 'bg-white dark:bg-slate-900 shadow text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-white/5 dark:hover:bg-slate-600/50'}`}>24-Hour</button>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-base font-semibold mb-2">Visible Clocks</h4>
                        <div className="space-y-3">
                            {timezoneOptions.map(tz => (
                                <label key={tz.id} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={visibleTimezones.includes(tz.id)}
                                        onChange={() => handleTimezoneChange(tz.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium">{tz.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsCard>
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
        <div className="space-y-8">
            <SettingsCard title="Friend Management" description="Search for users and manage your connections.">
                <input
                    type="search"
                    placeholder="Search for users by name or email..."
                    className="modern-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery.trim() && (
                    <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                        {searchResults.length > 0 ? (
                            searchResults.map(foundUser => {
                                const isFriend = user.friends?.includes(foundUser.email);
                                const requestSent = foundUser.friend_requests?.includes(user.email);
                                const requestReceived = user.friend_requests?.includes(foundUser.email);
                                
                                return (
                                    <div key={foundUser.email} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md animate-fade-in">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <img src={getCloudinaryUrl(foundUser.avatar, { width: 40, height: 40, radius: 'max' })} alt={foundUser.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                                            <div className="overflow-hidden">
                                                <div className="flex items-center gap-1">
                                                    <p className="font-semibold truncate">{foundUser.name}</p>
                                                    {foundUser.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 14, height: 14 })} alt="Admin verified" className="w-3.5 h-3.5" />}
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{foundUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 ml-2">
                                            {isFriend ? (
                                                <span className="text-xs font-medium text-green-600 dark:text-green-400 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40">Friends</span>
                                            ) : requestSent ? (
                                                <span className="text-xs font-medium text-slate-500 px-3 py-1">Request Sent</span>
                                            ) : requestReceived ? (
                                                <button
                                                    onClick={() => onAccept(foundUser)}
                                                    className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
                                                >
                                                    Accept
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAddFriend(foundUser.email)}
                                                    className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                                >
                                                    Add Friend
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">No users found.</p>
                        )}
                    </div>
                )}
            </SettingsCard>
            <SettingsCard title="Friend Requests" description="Accept or decline requests to connect.">
                {friendRequests.length > 0 ? (
                    <div className="space-y-4">
                        {friendRequests.map(requestingUser => (
                            <div key={requestingUser.email} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                                <div className="flex items-center gap-3">
                                    <img src={getCloudinaryUrl(requestingUser.avatar, { width: 40, height: 40, radius: 'max' })} alt={requestingUser.name} className="w-10 h-10 rounded-full" />
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold">{requestingUser.name}</span>
                                        {requestingUser.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 14, height: 14 })} alt="Admin verified" className="w-3.5 h-3.5" />}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onReject(requestingUser)} className="p-2 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30" title="Reject"><XCircleIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onAccept(requestingUser)} className="p-2 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30" title="Accept"><CheckCircleIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">You have no pending friend requests.</p>
                )}
            </SettingsCard>
             <SettingsCard title="Friends List" description="Your current connections.">
                {friends.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {friends.map(friend => (
                            <div key={friend.email} className="group relative h-full rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500/50 flex items-center gap-4">
                                <img src={getCloudinaryUrl(friend.avatar, { width: 48, height: 48, radius: 'max' })} alt={friend.name} className="w-12 h-12 rounded-full flex-shrink-0" />
                                <div className="flex-1 overflow-hidden min-w-0">
                                    <div className="flex items-center gap-1">
                                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{friend.name}</p>
                                        {friend.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 14, height: 14 })} alt="Admin verified" className="w-3.5 h-3.5" />}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{friend.role}</p>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button 
                                        onClick={() => onOpenApp('about', { profileUserEmail: friend.email })} 
                                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" 
                                        title="View Profile"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => onRemoveFriend(friend)} 
                                        className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40" 
                                        title="Remove Friend"
                                    >
                                        <XCircleIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <UsersIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="font-semibold text-slate-700 dark:text-slate-200">Your friends list is empty</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Connect with others to see them here.</p>
                    </div>
                )}
            </SettingsCard>
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
        <div className="space-y-8">
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

            {/* Sign-in Methods Card */}
            <SettingsCard title="Sign-in Methods">
                <div className="space-y-6">
                    {/* Email Row */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                        {!isChangingEmail && (
                            <button onClick={() => setIsChangingEmail(true)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Change</button>
                        )}
                    </div>
                    
                    {/* Email Change Form */}
                    {isChangingEmail && (
                        <div className="relative mt-4 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl animate-fade-in overflow-visible">
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
                    
                    <hr className="border-slate-200 dark:border-slate-700" />
                    
                    {/* Password Row */}
                    <div className="flex items-center justify-between">
                         <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">••••••••</p>
                        </div>
                        {!isChangingPassword && (
                            <button onClick={() => setIsChangingPassword(true)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Change</button>
                        )}
                    </div>

                    {/* Password Change Form */}
                     {isChangingPassword && (
                         <div className="relative mt-4 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl animate-fade-in overflow-visible">
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
            </SettingsCard>

            {/* 2FA Settings Card */}
            <SettingsCard title="Two-Factor Authentication (2FA)">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">Enable 2FA</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Secure your account with backup codes.</p>
                        </div>
                        <button 
                            onClick={toggle2FA}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 ${user.is_2fa_enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <span aria-hidden="true" className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${user.is_2fa_enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
                        </button>
                    </div>

                    {user.is_2fa_enabled && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
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
            </SettingsCard>

            {/* Danger Zone */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-4">Danger Zone</h3>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-medium text-red-900 dark:text-red-200">Delete Account</h4>
                        <p className="text-sm text-red-700 dark:text-red-300/70">Permanently remove your account and all data.</p>
                    </div>
                    <button 
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
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
    { id: 'profile', label: t('profile'), icon: <UserIcon /> },
    { id: 'appearance', label: t('appearance'), icon: <PaletteIcon /> },
    { id: 'tools', label: t('tools'), icon: <ToolboxIcon /> },
    { id: 'friends', label: t('friends'), icon: <UsersIcon /> },
    { id: 'account', label: t('account'), icon: <ShieldIcon /> },
  ];

  const renderSection = () => {
    // If no user (e.g. somehow navigated here while logged out, or loading), 
    // we can show a loader or just nothing.
    // However, Dashboard typically ensures user exists.
    if (!user) return null;

    switch (activeSection) {
      case 'profile': return <ProfileSettings user={user} onSave={onProfileUpdate} onOpenApp={onOpenApp || (() => {})} />;
      case 'appearance': return <AppearanceSettings taskbarPosition={taskbarPosition} setTaskbarPosition={setTaskbarPosition} desktopIconSize={desktopIconSize} setDesktopIconSize={setDesktopIconSize} onProfileUpdate={onProfileUpdate} />;
      case 'tools': return <ToolsSettings />;
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
          <header className="mb-8 hidden md:block">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{activeSection} Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your {activeSection} preferences and configuration.</p>
          </header>
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { User, Post, WorkProfile } from '../types';
import { getCloudinaryUrl, uploadToCloudinary } from '../utils/imageService';
import TwitterIcon from '../components/icons/TwitterIcon';
import GithubIcon from '../components/icons/GithubIcon';
import LinkedInIcon from '../components/icons/LinkedInIcon';
import InstagramIcon from '../components/icons/InstagramIcon';
import MailIcon from '../components/icons/MailIcon';
import { getWorkProfile, updateWorkProfile, updateUser, isUsingMockData } from '../services/database';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import PencilIcon from '../components/icons/PencilIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';
import MoveIcon from '../components/icons/MoveIcon';
import { useNotificationState } from '../contexts/NotificationContext';
import ImageLightbox from '../components/ImageLightbox';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import BriefcaseIcon from '../components/icons/BriefcaseIcon';
import BadgeCheckIcon from '../components/icons/BadgeCheckIcon';
import CodeBracketIcon from '../components/icons/CodeBracketIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import ChevronUpIcon from '../components/icons/ChevronUpIcon';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import { createPortal } from 'react-dom';
import DownloadIcon from '../components/icons/DownloadIcon';
import ResumeButton from '../components/ResumeButton';
import BuildingOfficeIcon from '../components/icons/BuildingOfficeIcon';
import TrophyIcon from '../components/icons/TrophyIcon';
import PlusButton from '../components/PlusButton';
import ClockIcon from '../components/icons/ClockIcon';
import UserIcon from '../components/icons/UserIcon';

// --- Helper Components ---

interface MyWorkPageProps {
  user: User;
  allUsers: User[];
  writeups: Post[];
  blogPosts: Post[];
  profileUserEmail?: string;
  onOpenApp?: (appId: string, props?: Record<string, any>, e?: React.MouseEvent<HTMLElement>) => void;
}

const FadeInSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (domRef.current) observer.unobserve(domRef.current);
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    
    return () => {
        if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 cubic-bezier(0.25, 0.46, 0.45, 0.94) transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 shadow-lg rounded-2xl transition-all duration-300 ${className}`}
    >
        {children}
    </div>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-700/50">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            {icon}
        </div>
        {title}
    </h2>
);

// Expanded Color Palette for diverse tags
const colorPalette = [
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 group-hover:shadow-indigo-500/30',
    'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800 group-hover:shadow-sky-500/30',
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 group-hover:shadow-emerald-500/30',
    'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 group-hover:shadow-rose-500/30',
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 group-hover:shadow-amber-500/30',
    'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800 group-hover:shadow-violet-500/30',
    'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800 group-hover:shadow-fuchsia-500/30',
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 group-hover:shadow-cyan-500/30',
];

const getColorClass = (index: number) => colorPalette[index % colorPalette.length];

// --- Editor Component ---

const MyWorkEditor: React.FC<{ 
    profile: WorkProfile; 
    user: User;
    onClose: () => void; 
    onSave: (data: Partial<WorkProfile>) => Promise<void>;
    isAdmin: boolean;
}> = ({ profile, user, onClose, onSave, isAdmin }) => {
    const [formData, setFormData] = useState<WorkProfile>(profile);
    const [gender, setGender] = useState<User['gender']>(user.gender || 'Other');
    // activeTab type extended to include 'portfolio'
    const [activeTab, setActiveTab] = useState<'basic' | 'services' | 'journey' | 'internships' | 'projects' | 'achievements' | 'certs' | 'portfolio'>('basic');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addNotification } = useNotificationState();

    const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Define available tabs based on permissions
    const availableTabs = useMemo(() => {
        if (isAdmin) {
            return ['basic', 'services', 'journey', 'internships', 'projects', 'achievements', 'certs'];
        } else {
            // STRICT REQUIREMENT: Only Profile Info + Portfolio (Services/Projects/Achievements)
            return ['basic', 'portfolio'];
        }
    }, [isAdmin]);

    // Drag State
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [draggedItemType, setDraggedItemType] = useState<string | null>(null);

    const handleChange = (field: keyof WorkProfile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (network: keyof NonNullable<WorkProfile['social_links']>, value: string) => {
        setFormData(prev => ({
            ...prev,
            social_links: { ...prev.social_links, [network]: value }
        }));
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
        handleChange('skills', skillsArray);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            handleChange('avatar_url', url);
        } catch (error) {
            addNotification({ title: 'Upload Failed', message: 'Could not upload image.', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    // ... (item management functions remain same: addItem, removeItem, updateItem, moveItem)
    const addItem = (field: 'education' | 'experience' | 'projects' | 'certifications' | 'services' | 'internships' | 'achievements') => {
        const newItem = { id: crypto.randomUUID() };
        handleChange(field, [newItem, ...(formData[field] || [])]);
    };

    const removeItem = (field: 'education' | 'experience' | 'projects' | 'certifications' | 'services' | 'internships' | 'achievements', index: number) => {
        const list = [...(formData[field] || [])];
        list.splice(index, 1);
        handleChange(field, list);
    };

    const updateItem = (field: 'education' | 'experience' | 'projects' | 'certifications' | 'services' | 'internships' | 'achievements', index: number, key: string, value: any) => {
        const list = [...(formData[field] || [])];
        list[index] = { ...list[index], [key]: value };
        handleChange(field, list);
    };

    const moveItem = (field: 'education' | 'experience' | 'projects' | 'certifications' | 'services' | 'internships' | 'achievements', index: number, direction: 'up' | 'down') => {
        const list = [...(formData[field] as any[])];
        if (direction === 'up' && index > 0) {
            [list[index], list[index - 1]] = [list[index - 1], list[index]];
        } else if (direction === 'down' && index < list.length - 1) {
            [list[index], list[index + 1]] = [list[index + 1], list[index]];
        }
        handleChange(field, list);
    };

    const handleInternshipUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        addNotification({ title: 'Uploading...', message: 'Please wait while the image uploads.', type: 'info', duration: 2000 });

        try {
            const url = await uploadToCloudinary(file);
            updateItem('internships', index, 'imageUrl', url);
            addNotification({ title: 'Success', message: 'Certificate uploaded successfully.', type: 'success' });
        } catch (error) {
            addNotification({ title: 'Upload Failed', message: 'Could not upload image.', type: 'error' });
        }
    };

    const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        addNotification({ title: 'Uploading...', message: 'Please wait while the image uploads.', type: 'info', duration: 2000 });

        try {
            const url = await uploadToCloudinary(file);
            updateItem('certifications', index, 'imageUrl', url);
            addNotification({ title: 'Success', message: 'Certificate uploaded successfully.', type: 'success' });
        } catch (error) {
            addNotification({ title: 'Upload Failed', message: 'Could not upload image.', type: 'error' });
        }
    };

    // Drag and Drop Handlers (Desktop)
    const handleDragStart = (e: React.DragEvent, index: number, type: string) => {
        if (!(e.target as HTMLElement).closest('.drag-handle')) {
            e.preventDefault();
            return;
        }
        setDraggedItemIndex(index);
        setDraggedItemType(type);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number, type: string) => {
        e.preventDefault();
        if (draggedItemType !== type || draggedItemIndex === null) return;
        if (draggedItemIndex === dropIndex) return;

        const field = type as keyof WorkProfile;
        const list = [...(formData[field] as any[])];
        
        const [item] = list.splice(draggedItemIndex, 1);
        list.splice(dropIndex, 0, item);
        
        handleChange(field, list);
        setDraggedItemIndex(null);
        setDraggedItemType(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Save User-level data (Gender) separately
        if (gender !== user.gender) {
            await updateUser(user.email, { gender });
        }

        // Save WorkProfile data
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };

    // Common draggable item wrapper style
    const getItemClass = (idx: number, type: string) => 
        `p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative group transition-all flex flex-col ${
            draggedItemIndex === idx && draggedItemType === type 
            ? 'opacity-40 border-dashed border-indigo-500 bg-slate-50 dark:bg-slate-800/50' 
            : ''
        }`;

    const renderItemHeader = (field: any, idx: number, total: number, label: string) => (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <MoveIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{label} {idx + 1}</span>
            </div>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => moveItem(field, idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                >
                    <ChevronUpIcon className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => moveItem(field, idx, 'down')}
                    disabled={idx === total - 1}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                >
                    <ChevronDownIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button type="button" onClick={() => removeItem(field, idx)} className="text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-md transition-colors" title="Remove">
                    <TrashIcon className="w-4 h-4"/>
                </button>
            </div>
        </div>
    );
    
    // --- Modular Renderers for the Portfolio Tab ---
    const renderServicesList = () => (
        <div className="space-y-6">
            {(formData.services || []).map((svc, idx) => (
                <div 
                    key={svc.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx, 'services')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx, 'services')}
                    className={getItemClass(idx, 'services')}
                >
                    {renderItemHeader('services', idx, formData.services!.length, "SERVICE")}
                    <div className="mb-3">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Service Title</label>
                        <input type="text" value={svc.title || ''} onChange={e => updateItem('services', idx, 'title', e.target.value)} className="modern-input font-bold" placeholder="e.g. Web Development" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
                        <textarea value={svc.description || ''} onChange={e => updateItem('services', idx, 'description', e.target.value)} className="modern-textarea text-sm" rows={3} placeholder="Brief description of the service..." />
                    </div>
                </div>
            ))}
        </div>
    );
    
    const renderProjectsList = () => (
        <div className="space-y-6">
            {(formData.projects || []).map((proj, idx) => (
                <div 
                    key={proj.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx, 'projects')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx, 'projects')}
                    className={getItemClass(idx, 'projects')}
                >
                    {renderItemHeader('projects', idx, formData.projects!.length, "PROJECT")}
                    <div className="mb-3">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Project Title</label>
                        <input type="text" value={proj.title || ''} onChange={e => updateItem('projects', idx, 'title', e.target.value)} className="modern-input font-bold" placeholder="e.g. Portfolio Website" />
                    </div>
                    <div className="mb-3">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
                        <textarea value={proj.description || ''} onChange={e => updateItem('projects', idx, 'description', e.target.value)} className="modern-textarea text-sm" rows={3} placeholder="What did you build? How does it work?" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Link</label>
                            <input type="text" value={proj.link || ''} onChange={e => updateItem('projects', idx, 'link', e.target.value)} className="modern-input" placeholder="https://github.com/..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tech Stack</label>
                            <input type="text" value={proj.tech?.join(', ') || ''} onChange={e => updateItem('projects', idx, 'tech', e.target.value.split(',').map((t: string) => t.trim()))} className="modern-input" placeholder="React, Node.js, etc." />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
    
    const renderAchievementsList = () => (
         <div className="space-y-6">
            {(formData.achievements || []).map((ach, idx) => (
                <div 
                    key={ach.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx, 'achievements')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx, 'achievements')}
                    className={getItemClass(idx, 'achievements')}
                >
                    {renderItemHeader('achievements', idx, formData.achievements!.length, "ACHIEVEMENT")}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Title</label>
                            <input type="text" value={ach.title || ''} onChange={e => updateItem('achievements', idx, 'title', e.target.value)} className="modern-input font-bold" placeholder="e.g. 1st Place CTF" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Year</label>
                            <input type="text" value={ach.year || ''} onChange={e => updateItem('achievements', idx, 'year', e.target.value)} className="modern-input" placeholder="e.g. 2023" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
                        <textarea value={ach.description || ''} onChange={e => updateItem('achievements', idx, 'description', e.target.value)} className="modern-textarea text-sm" rows={2} placeholder="Brief details about the achievement..." />
                    </div>
                </div>
            ))}
        </div>
    );


    const content = (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 backdrop-blur-md sm:p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[100dvh] sm:h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col border-x-0 sm:border border-slate-200 dark:border-slate-700 overflow-hidden">
                <header className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900 z-20 sticky top-0">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Edit Profile</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Close editor"
                    >
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex gap-2 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto justify-start sm:justify-center hide-scrollbar flex-shrink-0">
                    {availableTabs.map(tab => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                        >
                            {tab === 'basic' ? 'Profile Info' : tab}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-900/50 pb-20 sm:pb-8">
                    {activeTab === 'basic' && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="flex flex-col items-center gap-4">
                                <GlassCard className="relative w-28 h-28 group cursor-pointer rounded-full p-0 overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-[3px]">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-[2px]">
                                            <img src={getCloudinaryUrl(formData.avatar_url || '', { width: 128, height: 128, radius: 'max' })} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                        {isUploading ? <SpinnerIcon className="w-8 h-8 text-white animate-spin"/> : <PencilIcon className="w-8 h-8 text-white"/>}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} hidden accept="image/*" />
                                </GlassCard>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tap to update photo</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Display Name</label>
                                    <input type="text" value={formData.display_name || ''} onChange={e => handleChange('display_name', e.target.value)} className="modern-input" placeholder="Your Name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Role / Title</label>
                                    <input type="text" value={formData.role_title || ''} onChange={e => handleChange('role_title', e.target.value)} className="modern-input" placeholder="e.g. Security Researcher" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Joined Date</label>
                                    <div className="modern-input bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed">
                                        {joinDate}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Gender</label>
                                    <select 
                                        value={gender} 
                                        onChange={e => setGender(e.target.value as any)} 
                                        className="modern-input modern-select"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Short Bio</label>
                                <textarea value={formData.bio || ''} onChange={e => handleChange('bio', e.target.value)} className="modern-textarea" rows={2} placeholder="One liner about yourself..." />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Professional Summary</label>
                                <textarea value={formData.summary || ''} onChange={e => handleChange('summary', e.target.value)} className="modern-textarea" rows={4} placeholder="Detailed summary of your career and goals..." />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Skills</label>
                                <input type="text" defaultValue={formData.skills?.join(', ') || ''} onBlur={handleSkillsChange} className="modern-input" placeholder="e.g. React, Node.js, Pentesting (comma separated)" />
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Social Links</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {['twitter', 'github', 'linkedin', 'instagram', 'whatsapp', 'email'].map(net => (
                                        <div key={net} className="flex items-center gap-2">
                                            <span className="text-xs font-semibold uppercase text-slate-400 w-20">{net}</span>
                                            <input 
                                                type="text" 
                                                value={(formData.social_links as any)?.[net] || ''} 
                                                onChange={e => handleSocialChange(net as any, e.target.value)} 
                                                className="modern-input text-sm flex-1" 
                                                placeholder={`${net} URL`} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* --- CONSOLIDATED PORTFOLIO TAB FOR NORMAL USERS --- */}
                    {activeTab === 'portfolio' && (
                        <div className="space-y-10 animate-slide-up">
                            {/* Services Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                        <SparklesIcon className="w-5 h-5"/> Services
                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{formData.services?.length || 0}</span>
                                    </h3>
                                    <PlusButton onClick={() => addItem('services')} title="Add Service" />
                                </div>
                                {renderServicesList()}
                                {(!formData.services || formData.services.length === 0) && (
                                    <p className="text-center text-sm text-slate-400 py-4 italic">No services added yet.</p>
                                )}
                            </div>

                             {/* Projects Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <CodeBracketIcon className="w-5 h-5"/> Projects
                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{formData.projects?.length || 0}</span>
                                    </h3>
                                    <PlusButton onClick={() => addItem('projects')} title="Add Project" />
                                </div>
                                {renderProjectsList()}
                                {(!formData.projects || formData.projects.length === 0) && (
                                    <p className="text-center text-sm text-slate-400 py-4 italic">No projects added yet.</p>
                                )}
                            </div>

                             {/* Achievements Section */}
                             <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                        <TrophyIcon className="w-5 h-5"/> Achievements
                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{formData.achievements?.length || 0}</span>
                                    </h3>
                                    <PlusButton onClick={() => addItem('achievements')} title="Add Achievement" />
                                </div>
                                {renderAchievementsList()}
                                {(!formData.achievements || formData.achievements.length === 0) && (
                                    <p className="text-center text-sm text-slate-400 py-4 italic">No achievements added yet.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- INDIVIDUAL TABS FOR ADMINS --- */}
                    {isAdmin && activeTab === 'services' && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Services</h3>
                                <PlusButton onClick={() => addItem('services')} title="Add Service" text="Add Service" />
                            </div>
                            {renderServicesList()}
                        </div>
                    )}
                    {isAdmin && activeTab === 'journey' && (
                         <div className="space-y-8 animate-slide-up">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold">Experience</h3>
                                    <PlusButton onClick={() => addItem('experience')} title="Add Experience" />
                                </div>
                                <div className="space-y-4">
                                    {(formData.experience || []).map((exp, idx) => (
                                        <div 
                                            key={exp.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, idx, 'experience')}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, idx, 'experience')}
                                            className={getItemClass(idx, 'experience')}
                                        >
                                            {renderItemHeader('experience', idx, formData.experience!.length, "EXPERIENCE")}
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <input type="text" value={exp.role || ''} onChange={e => updateItem('experience', idx, 'role', e.target.value)} className="modern-input font-bold" placeholder="Role (e.g. Senior Dev)" />
                                                <input type="text" value={exp.company || ''} onChange={e => updateItem('experience', idx, 'company', e.target.value)} className="modern-input" placeholder="Company Name" />
                                            </div>
                                            <input type="text" value={exp.duration || ''} onChange={e => updateItem('experience', idx, 'duration', e.target.value)} className="modern-input mb-3" placeholder="Duration (e.g. Jan 2020 - Present)" />
                                            <textarea value={exp.description || ''} onChange={e => updateItem('experience', idx, 'description', e.target.value)} className="modern-textarea text-sm" rows={3} placeholder="Responsibilities..." />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold">Education</h3>
                                    <PlusButton onClick={() => addItem('education')} title="Add Education" />
                                </div>
                                <div className="space-y-4">
                                    {(formData.education || []).map((edu, idx) => (
                                        <div 
                                            key={edu.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, idx, 'education')}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, idx, 'education')}
                                            className={getItemClass(idx, 'education')}
                                        >
                                            {renderItemHeader('education', idx, formData.education!.length, "EDUCATION")}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                                <input type="text" value={edu.institution || ''} onChange={e => updateItem('education', idx, 'institution', e.target.value)} className="modern-input font-bold" placeholder="Institution Name" />
                                                <input type="text" value={edu.degree || ''} onChange={e => updateItem('education', idx, 'degree', e.target.value)} className="modern-input" placeholder="Degree / Certificate" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" value={edu.year || ''} onChange={e => updateItem('education', idx, 'year', e.target.value)} className="modern-input" placeholder="Year (e.g. 2022)" />
                                                <input type="text" value={edu.percentage || ''} onChange={e => updateItem('education', idx, 'percentage', e.target.value)} className="modern-input" placeholder="Grade/Percentage" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {isAdmin && activeTab === 'internships' && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Internships</h3>
                                <PlusButton onClick={() => addItem('internships')} title="Add Internship" text="Add Internship" />
                            </div>
                            <div className="space-y-4">
                                {(formData.internships || []).map((intern, idx) => (
                                    <div 
                                        key={intern.id} 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx, 'internships')}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, idx, 'internships')}
                                        className={getItemClass(idx, 'internships')}
                                    >
                                        {renderItemHeader('internships', idx, formData.internships!.length, "INTERNSHIP")}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                            <input type="text" value={intern.role || ''} onChange={e => updateItem('internships', idx, 'role', e.target.value)} className="modern-input font-bold" placeholder="Role (e.g. Security Intern)" />
                                            <input type="text" value={intern.company || ''} onChange={e => updateItem('internships', idx, 'company', e.target.value)} className="modern-input" placeholder="Company Name" />
                                        </div>
                                        <input type="text" value={intern.duration || ''} onChange={e => updateItem('internships', idx, 'duration', e.target.value)} className="modern-input mb-3" placeholder="Duration (e.g. Summer 2023)" />
                                        <textarea value={intern.description || ''} onChange={e => updateItem('internships', idx, 'description', e.target.value)} className="modern-textarea text-sm mb-3" rows={3} placeholder="What did you learn?" />
                                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <span className="text-xs font-bold uppercase text-slate-400">Certificate Image</span>
                                            <input type="file" onChange={(e) => handleInternshipUpload(e, idx)} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept="image/*" />
                                            {intern.imageUrl && <span className="text-xs text-green-500 font-bold flex items-center gap-1"><BadgeCheckIcon className="w-4 h-4"/> Uploaded</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {isAdmin && activeTab === 'projects' && (
                         <div className="space-y-6 animate-slide-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Projects</h3>
                                <PlusButton onClick={() => addItem('projects')} title="Add Project" text="Add Project" />
                            </div>
                            {renderProjectsList()}
                        </div>
                    )}
                    {isAdmin && activeTab === 'achievements' && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Achievements</h3>
                                <PlusButton onClick={() => addItem('achievements')} title="Add Achievement" text="Add Achievement" />
                            </div>
                            {renderAchievementsList()}
                        </div>
                    )}
                    {isAdmin && activeTab === 'certs' && (
                         <div className="space-y-6 animate-slide-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Certifications</h3>
                                <PlusButton onClick={() => addItem('certifications')} title="Add Certification" text="Add Certification" />
                            </div>
                            <div className="space-y-4">
                                {(formData.certifications || []).map((cert, idx) => (
                                    <div 
                                        key={cert.id} 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx, 'certifications')}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, idx, 'certifications')}
                                        className={getItemClass(idx, 'certifications')}
                                    >
                                        {renderItemHeader('certifications', idx, formData.certifications!.length, "CERTIFICATE")}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                            <input type="text" value={cert.name || ''} onChange={e => updateItem('certifications', idx, 'name', e.target.value)} className="modern-input font-bold" placeholder="Certificate Name" />
                                            <input type="text" value={cert.issuer || ''} onChange={e => updateItem('certifications', idx, 'issuer', e.target.value)} className="modern-input" placeholder="Issuing Organization" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                            <input type="text" value={cert.year || ''} onChange={e => updateItem('certifications', idx, 'year', e.target.value)} className="modern-input" placeholder="Year Issued" />
                                            <input type="text" value={cert.link || ''} onChange={e => updateItem('certifications', idx, 'link', e.target.value)} className="modern-input" placeholder="Credential URL" />
                                        </div>
                                        {/* Certificate Image Upload */}
                                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <span className="text-xs font-bold uppercase text-slate-400">Certificate Image</span>
                                            <input type="file" onChange={(e) => handleCertUpload(e, idx)} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept="image/*" />
                                            {cert.imageUrl && <span className="text-xs text-green-500 font-bold flex items-center gap-1"><BadgeCheckIcon className="w-4 h-4"/> Uploaded</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </form>
                <footer className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-slate-900 sticky bottom-0 z-20">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2">
                        {isSaving ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : 'Save Changes'}
                    </button>
                </footer>
            </div>
        </div>
    );

    const portalTarget = document.getElementById('root') || document.body;
    return createPortal(content, portalTarget);
};

// --- Main Page Component ---

const MyWorkPage: React.FC<MyWorkPageProps> = ({ user, allUsers, writeups, blogPosts, profileUserEmail }) => {
  const [workProfile, setWorkProfile] = useState<WorkProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { addNotification } = useNotificationState();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Determine who owns the profile being viewed
  const profileOwner = useMemo(() => {
      // 1. If a specific email is passed (viewing a friend/other user), use that.
      if (profileUserEmail) {
          const found = allUsers.find(u => u.email === profileUserEmail);
          return found || user; // Fallback to current user if email not found
      }
      // 2. Otherwise (default "My Work" app behavior), show the current user's own profile.
      return user;
  }, [allUsers, user, profileUserEmail]);

  const isOwner = user.id === profileOwner.id;

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const profile = await getWorkProfile(profileOwner.id);
            if (profile) {
                setWorkProfile(profile);
            } else {
                // Default structure if no profile exists
                setWorkProfile({
                    user_id: profileOwner.id,
                    display_name: profileOwner.name,
                    avatar_url: profileOwner.avatar,
                    role_title: profileOwner.role === 'admin' ? 'Administrator' : 'Member',
                    bio: profileOwner.bio || `Hello! I'm ${profileOwner.name}, a member of the HtWtH community.`,
                    skills: profileOwner.skills || [],
                    social_links: { email: profileOwner.email },
                    education: [],
                    experience: [],
                    internships: [],
                    projects: [],
                    achievements: [],
                    certifications: [],
                    services: [],
                    summary: '',
                    what_i_do: ''
                });
            }
        } catch (error) {
            console.error("Failed to fetch work profile:", error);
        } finally {
            setLoading(false);
        }
    };
    if (profileOwner) fetchProfile();
  }, [profileOwner]);

  // Real-time Sync for MyWork Profile logic removed.
  useEffect(() => {
    if (!profileOwner || isUsingMockData()) return;
    // In a real Firebase app, you would use onSnapshot here.
  }, [profileOwner]);

  const handleSave = async (updatedData: Partial<WorkProfile>) => {
      try {
          const updatedProfile = await updateWorkProfile(profileOwner.id, updatedData);
          if (updatedProfile) {
              setWorkProfile(updatedProfile);
              addNotification({ title: 'Success', message: 'Work profile updated.', type: 'success' });
          }
      } catch (error) {
          addNotification({ title: 'Error', message: 'Failed to update profile.', type: 'error' });
      }
  };

  const handleDownloadCV = async () => {
      const cvUrl = "https://htwth.pages.dev/Gowtham_S_Cv_2026.pdf";
      const filename = `${workProfile?.display_name?.replace(/\s+/g, '_') || 'Resume'}_CV.pdf`;
      try {
          const response = await fetch(cvUrl);
          if (!response.ok) throw new Error('Download failed');
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
      } catch (error) {
          window.open(cvUrl, '_blank');
      }
  };

  if (loading) return <div className="h-full w-full flex items-center justify-center"><SpinnerIcon className="w-12 h-12 text-indigo-500 animate-spin" /></div>;
  if (!workProfile) return null;

  const { display_name, role_title, avatar_url, bio, summary, services, social_links, skills, education, experience, internships, projects, achievements, certifications } = workProfile;
  const isAdminVerified = profileOwner.role === 'admin';
  const joinDate = new Date(profileOwner.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const gender = profileOwner.gender || 'Not specified';
  const isUserRole = profileOwner.role === 'user'; // Check if standard user

  const socialLinksData = [
    { key: 'twitter', url: social_links?.twitter, icon: <TwitterIcon className="w-5 h-5"/>, color: 'hover:bg-[#1DA1F2]', shadow: 'hover:shadow-[#1DA1F2]/50' },
    { key: 'github', url: social_links?.github, icon: <GithubIcon className="w-5 h-5"/>, color: 'hover:bg-[#333]', shadow: 'hover:shadow-black/50' },
    { key: 'linkedin', url: social_links?.linkedin, icon: <LinkedInIcon className="w-5 h-5"/>, color: 'hover:bg-[#0077b5]', shadow: 'hover:shadow-[#0077b5]/50' },
    { key: 'instagram', url: social_links?.instagram, icon: <InstagramIcon className="w-5 h-5"/>, color: 'hover:bg-pink-600', shadow: 'hover:shadow-pink-600/50' },
    { key: 'email', url: social_links?.email ? `mailto:${social_links.email}` : null, icon: <MailIcon className="w-5 h-5"/>, color: 'hover:bg-red-500', shadow: 'hover:shadow-red-500/50' },
  ];

  const hasServices = services && services.length > 0;

  return (
    <div className="h-full w-full relative overflow-hidden bg-white dark:bg-black">
        {isEditing && isOwner && <MyWorkEditor profile={workProfile} user={profileOwner} onClose={() => setIsEditing(false)} onSave={handleSave} isAdmin={profileOwner.role === 'admin'} />}
        {lightboxImage && <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />}

        <div className="absolute inset-0 z-10 overflow-y-auto scroll-smooth">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    
                    {/* LEFT SIDEBAR */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="lg:sticky lg:top-4 space-y-6">
                            <FadeInSection delay={100}>
                                <GlassCard className="p-6 text-center relative overflow-hidden group">
                                    {isOwner && (
                                        <button 
                                            onClick={() => setIsEditing(true)} 
                                            className="absolute top-3 right-3 p-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300 transition-colors z-20"
                                        >
                                            <PencilIcon className="w-4 h-4"/>
                                        </button>
                                    )}
                                    
                                    <div className="relative w-32 h-32 mx-auto mb-4">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                                        <img
                                            src={getCloudinaryUrl(avatar_url || '', { width: 200, height: 200, radius: 'max' })}
                                            alt={display_name}
                                            className="relative w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-800"
                                        />
                                        {isAdminVerified && (
                                            <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-md" title="Verified Admin">
                                                <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 20, height: 20 })} className="w-5 h-5" alt="Verified" />
                                            </div>
                                        )}
                                    </div>

                                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1 break-words">{display_name}</h1>
                                    <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest mb-4 break-words">{role_title}</p>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed italic break-words whitespace-pre-wrap">
                                        {bio}
                                    </p>

                                    {/* --- ADDED: Additional Profile Info --- */}
                                    <div className="flex justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                        <div className="flex flex-col items-center gap-1">
                                            <ClockIcon className="w-4 h-4 text-slate-400" />
                                            <span className="font-semibold">{joinDate}</span>
                                            <span className="text-[10px] uppercase tracking-wide opacity-70">Joined</span>
                                        </div>
                                        <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                                        <div className="flex flex-col items-center gap-1">
                                            <UserIcon className="w-4 h-4 text-slate-400" />
                                            <span className="font-semibold">{gender}</span>
                                            <span className="text-[10px] uppercase tracking-wide opacity-70">Gender</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                                        <ResumeButton onClick={handleDownloadCV} />
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-2">
                                        {socialLinksData.map(item => item.url && (
                                            <a 
                                                key={item.key} 
                                                href={item.url} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className={`p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all duration-300 hover:text-white hover:scale-110 hover:shadow-lg ${item.color} ${item.shadow}`}
                                            >
                                                {item.icon}
                                            </a>
                                        ))}
                                    </div>
                                </GlassCard>
                            </FadeInSection>

                            <FadeInSection delay={200}>
                                {skills && skills.length > 0 && (
                                    <GlassCard className="p-6">
                                        <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-4 tracking-wider">Skills & Tech</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill, i) => (
                                                <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-shadow duration-300 hover:shadow-md ${getColorClass(i)}`}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </GlassCard>
                                )}
                            </FadeInSection>

                            {/* Only show simplified services in sidebar for Admin, for Normal Users it's main content */}
                            {!isUserRole && hasServices && (
                                <FadeInSection delay={300}>
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold uppercase text-indigo-500 dark:text-indigo-400 mb-1 tracking-wider px-1">Services</h3>
                                        {services.map((service) => (
                                            <GlassCard key={service.id} className="p-4 group border-l-4 border-l-indigo-500 hover:border-l-purple-500 transition-all duration-300 hover:-translate-y-1">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words">{service.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap break-words">{service.description}</p>
                                            </GlassCard>
                                        ))}
                                    </div>
                                </FadeInSection>
                            )}
                        </div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="lg:col-span-8 space-y-10">
                        {summary && (
                            <FadeInSection delay={400}>
                                <section>
                                    <SectionTitle icon={<AcademicCapIcon className="w-6 h-6"/>} title="About" />
                                    <GlassCard className="p-6">
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base whitespace-pre-wrap break-words">
                                            {summary}
                                        </p>
                                    </GlassCard>
                                </section>
                            </FadeInSection>
                        )}
                        
                        {/* --- NORMAL USER VIEW: Consolidated Portfolio --- */}
                        {isUserRole ? (
                            <>
                                {hasServices && (
                                    <FadeInSection delay={500}>
                                        <section>
                                            <SectionTitle icon={<SparklesIcon className="w-6 h-6 text-indigo-500"/>} title="Services" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {services.map((service) => (
                                                    <GlassCard key={service.id} className="p-5 border-t-4 border-t-indigo-500 hover:-translate-y-1 transition-all duration-300">
                                                        <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 break-words">{service.title}</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">{service.description}</p>
                                                    </GlassCard>
                                                ))}
                                            </div>
                                        </section>
                                    </FadeInSection>
                                )}
                                {projects && projects.length > 0 && (
                                    <FadeInSection delay={600}>
                                        <section>
                                            <SectionTitle icon={<CodeBracketIcon className="w-6 h-6 text-emerald-500"/>} title="Projects" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {projects.map((proj, idx) => (
                                                    <a 
                                                        key={idx} 
                                                        href={proj.link} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className={`block h-full group ${!proj.link ? 'pointer-events-none' : ''}`}
                                                    >
                                                        <GlassCard className="h-full p-5 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-l-4 border-l-emerald-500 flex flex-col relative overflow-hidden">
                                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors break-words">{proj.title}</h3>
                                                                {proj.link && <div className="text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0 ml-2"><GithubIcon className="w-5 h-5"/></div>}
                                                            </div>
                                                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-1 break-words whitespace-pre-wrap relative z-10">{proj.description}</p>
                                                            <div className="flex flex-wrap gap-2 mt-auto relative z-10">
                                                                {proj.tech?.slice(0, 3).map((t, i) => (
                                                                    <span key={i} className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded transition-shadow duration-300 group-hover:shadow-md ${getColorClass(i)}`}>{t}</span>
                                                                ))}
                                                            </div>
                                                        </GlassCard>
                                                    </a>
                                                ))}
                                            </div>
                                        </section>
                                    </FadeInSection>
                                )}
                                {achievements && achievements.length > 0 && (
                                    <FadeInSection delay={700}>
                                        <section>
                                            <SectionTitle icon={<TrophyIcon className="w-6 h-6 text-yellow-500"/>} title="Achievements" />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {achievements.map((ach, idx) => (
                                                    <GlassCard key={ach.id} className="p-5 border-l-4 border-l-yellow-500 hover:-translate-y-1 transition-all duration-300 group">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors break-words">{ach.title}</h3>
                                                            <span className="text-[10px] font-bold uppercase tracking-wide bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded whitespace-nowrap shadow-sm ml-2 flex-shrink-0">{ach.year}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">{ach.description}</p>
                                                    </GlassCard>
                                                ))}
                                            </div>
                                        </section>
                                    </FadeInSection>
                                )}
                            </>
                        ) : (
                            /* --- ADMIN / FULL VIEW (Existing Logic) --- */
                            <>
                                {(experience?.length || education?.length) ? (
                                    <FadeInSection delay={500}>
                                        <section>
                                            <SectionTitle icon={<BriefcaseIcon className="w-6 h-6"/>} title="Journey" />
                                            <GlassCard className="p-6">
                                                <div className="relative pl-8 ml-3 space-y-12 border-l-2 border-slate-200 dark:border-slate-700/50">
                                                    {experience?.map((exp, idx) => (
                                                        <div key={idx} className="relative group">
                                                            <div className="absolute -left-[41px] top-1.5 h-5 w-5 rounded-full border-4 border-slate-50 dark:border-slate-900 bg-indigo-500 group-hover:scale-125 transition-transform duration-300 shadow-md"></div>
                                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white break-words">{exp.role}</h3>
                                                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider whitespace-nowrap shadow-sm ${getColorClass(idx)}`}>{exp.duration}</span>
                                                            </div>
                                                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2 break-words">{exp.company}</p>
                                                            {exp.description && <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed break-words whitespace-pre-wrap">{exp.description}</p>}
                                                        </div>
                                                    ))}
                                                    
                                                    {education?.map((edu, idx) => (
                                                        <div key={`edu-${idx}`} className="relative group">
                                                            <div className="absolute -left-[41px] top-1.5 h-5 w-5 rounded-full border-4 border-slate-50 dark:border-slate-900 bg-pink-500 group-hover:scale-125 transition-transform duration-300 shadow-md"></div>
                                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white break-words">{edu.institution}</h3>
                                                                <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                                                                    {edu.percentage && (
                                                                        <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                                                            {edu.percentage}
                                                                        </span>
                                                                    )}
                                                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider whitespace-nowrap shadow-sm ${getColorClass(idx + (experience?.length || 0))}`}>{edu.year}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-pink-600 dark:text-pink-400 font-semibold break-words">{edu.degree}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </GlassCard>
                                        </section>
                                    </FadeInSection>
                                ) : null}

                                {internships && internships.length > 0 && (
                                    <FadeInSection delay={550}>
                                        <section>
                                            <SectionTitle icon={<BuildingOfficeIcon className="w-6 h-6"/>} title="Internships" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {internships.map((intern, idx) => (
                                                    <GlassCard 
                                                        key={intern.id} 
                                                        className="group overflow-hidden flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer p-0"
                                                        onClick={() => intern.imageUrl && setLightboxImage(intern.imageUrl)}
                                                    >
                                                        <div className="aspect-[3/2] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-700">
                                                            {intern.imageUrl ? (
                                                                <>
                                                                    <img 
                                                                        src={getCloudinaryUrl(intern.imageUrl, { width: 500, crop: 'fill' })} 
                                                                        alt={`${intern.company} Certificate`} 
                                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">View Certificate</span>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center p-6 text-center">
                                                                    <div className="opacity-30 flex flex-col items-center">
                                                                        <BuildingOfficeIcon className="w-12 h-12 mb-2"/>
                                                                        <span className="text-xs font-bold uppercase tracking-widest">{intern.company}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="p-5 flex-1 flex flex-col">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors break-words">{intern.role}</h3>
                                                                <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded whitespace-nowrap ml-2 flex-shrink-0">{intern.duration}</span>
                                                            </div>
                                                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 break-words">{intern.company}</p>
                                                            {intern.description && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-words whitespace-pre-wrap flex-1">{intern.description}</p>}
                                                        </div>
                                                    </GlassCard>
                                                ))}
                                            </div>
                                        </section>
                                    </FadeInSection>
                                )}

                                {projects && projects.length > 0 && (
                                    <FadeInSection delay={600}>
                                        <section>
                                            <SectionTitle icon={<CodeBracketIcon className="w-6 h-6"/>} title="Projects" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {projects.map((proj, idx) => (
                                                    <a 
                                                        key={idx} 
                                                        href={proj.link} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className={`block h-full group ${!proj.link ? 'pointer-events-none' : ''}`}
                                                    >
                                                        <GlassCard className="h-full p-5 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-t-4 border-t-indigo-500 dark:border-t-indigo-500 flex flex-col relative overflow-hidden">
                                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words">{proj.title}</h3>
                                                                {proj.link && <div className="text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0 ml-2"><GithubIcon className="w-5 h-5"/></div>}
                                                            </div>
                                                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-1 break-words whitespace-pre-wrap relative z-10">{proj.description}</p>
                                                            <div className="flex flex-wrap gap-2 mt-auto relative z-10">
                                                                {proj.tech?.slice(0, 3).map((t, i) => (
                                                                    <span key={i} className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded transition-shadow duration-300 group-hover:shadow-md ${getColorClass(i)}`}>{t}</span>
                                                                ))}
                                                            </div>
                                                        </GlassCard>
                                                    </a>
                                                ))}
                                            </div>
                                        </section>
                                    </FadeInSection>
                                )}

                                {achievements && achievements.length > 0 && (
                                    <FadeInSection delay={650}>
                                        <section>
                                            <SectionTitle icon={<TrophyIcon className="w-6 h-6 text-yellow-500"/>} title="Achievements" />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {achievements.map((ach, idx) => (
                                                    <GlassCard key={ach.id} className="p-5 border-t-4 border-t-yellow-500 dark:border-t-yellow-500 hover:-translate-y-1 transition-all duration-300 group">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors break-words">{ach.title}</h3>
                                                            <span className="text-[10px] font-bold uppercase tracking-wide bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded whitespace-nowrap shadow-sm ml-2 flex-shrink-0">{ach.year}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">{ach.description}</p>
                                                    </GlassCard>
                                                ))}
                                            </div>
                                        </section>
                                    </FadeInSection>
                                )}

                                {certifications && certifications.length > 0 && (
                                    <FadeInSection delay={700}>
                                        <section>
                                            <SectionTitle icon={<BadgeCheckIcon className="w-6 h-6"/>} title="Certifications" />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {certifications.map((cert, idx) => (
                                                    <GlassCard 
                                                        key={idx} 
                                                        className="group cursor-pointer overflow-hidden flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all p-0"
                                                        onClick={() => cert.imageUrl && setLightboxImage(cert.imageUrl)}
                                                    >
                                                        <div className="aspect-[3/2] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-700">
                                                            {cert.imageUrl ? (
                                                                <>
                                                                    <img 
                                                                        src={getCloudinaryUrl(cert.imageUrl, { width: 400, crop: 'fill' })} 
                                                                        alt={cert.name} 
                                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">View Certificate</span>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center p-4 text-center">
                                                                    <div className="opacity-30 flex flex-col items-center">
                                                                        <BadgeCheckIcon className="w-12 h-12 mb-2"/>
                                                                        <span className="text-xs font-bold uppercase tracking-widest">{cert.issuer}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="p-5 flex-1 flex flex-col">
                                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words">{cert.name}</h3>
                                                            <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                                                                <span className="text-sm text-slate-600 dark:text-slate-400 truncate">{cert.issuer}</span>
                                                                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded whitespace-nowrap shadow-sm ml-2 flex-shrink-0">{cert.year}</span>
                                                            </div>
                                                        </div>
                                                    </GlassCard>
                                                ))}
                                            </div>
                                        </section>
                                    </FadeInSection>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MyWorkPage;

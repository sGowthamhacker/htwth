
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Post, Severity, User, RewardType, Comment } from '../types';
import { analyzeWriteupDetails } from '../services/geminiService';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import { useNotificationState } from '../contexts/NotificationContext';
import CommentSection from '../components/CommentSection';
import MoneyIcon from '../components/icons/MoneyIcon';
import ShirtIcon from '../components/icons/ShirtIcon';
import GiftIcon from '../components/icons/GiftIcon';
import ShareIcon from '../components/icons/ShareIcon';
import { getCloudinaryUrl } from '../utils/imageService';
import HeartIcon from '../components/icons/HeartIcon'; 
import ConfirmationModal from '../components/ConfirmationModal';
import ChatBubbleLeftRightIcon from '../components/icons/ChatBubbleLeftRightIcon';
import DotsVerticalIcon from '../components/icons/DotsVerticalIcon';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import AnimatedHeartCheckbox from '../components/AnimatedHeartCheckbox';
import PlusButton from '../components/PlusButton';
import RetroSearchInput from '../components/RetroSearchInput';
import ParticlesBackground from '../components/ParticlesBackground';

// Add declaration for the 'marked' library loaded from CDN
declare var marked: { parse: (markdown: string) => string };

const tagColorClasses = [
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
];

const severityClassesConfig: Record<Severity, { text: string; bg: string }> = {
    'Critical': { text: 'text-red-500', bg: 'bg-red-500/10' },
    'High': { text: 'text-orange-500', bg: 'bg-orange-500/10' },
    'Medium': { text: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    'Low': { text: 'text-sky-500', bg: 'bg-sky-500/10' },
};

// START ICONS
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);
const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
);
// END ICONS

const MarkdownHelp: React.FC = () => (
    <div className="mt-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-md text-sm space-y-4 animate-fade-in border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
        <h4 className="font-bold text-base mb-2 text-slate-800 dark:text-slate-100">Markdown Quick Guide</h4>
        <div className="space-y-3 text-xs sm:text-sm">
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded"># H1</code> → <h1 className="inline text-xl font-bold">H1</h1></div>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">## H2</code> → <h2 className="inline text-lg font-bold">H2</h2></div>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">### H3</code> → <h3 className="inline text-base font-bold">H3</h3></div>
            <hr className="border-slate-200 dark:border-slate-700"/>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">**Bold**</code> → <strong>Bold</strong></div>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">*Italic*</code> → <em>Italic</em></div>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">`Inline code`</code></div>
            <hr className="border-slate-200 dark:border-slate-700"/>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">1. Ordered</code></div>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">- Unordered</code></div>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">&gt; Blockquote</code></div>
        </div>
    </div>
);

const WriteupPreviewPanel: React.FC<{ post: Post | any, currentUser: User }> = ({ post, currentUser }) => {
    const author = post.author || currentUser;
    
    // Fallback for when we are creating a new post and author might be undefined in post object
    const displayAuthor = author || { name: 'Anonymous', avatar: '', role: 'user' };

    const parsedContent = useMemo(() => {
        return (typeof post.content === 'string' && post.content) 
            ? marked.parse(post.content) 
            : '<p class="text-slate-400 italic">Start typing to see your writeup...</p>';
    }, [post.content]);

    return (
        <div className="h-full w-full overflow-y-auto bg-white dark:bg-slate-900 relative">
            <div className="sticky top-0 bg-indigo-600/90 backdrop-blur-sm text-white text-center text-sm font-semibold z-10 py-1.5 animate-fade-in shadow-sm">
                Live Preview
            </div>
            <div className="max-w-5xl mx-auto p-6 sm:p-8">
                <header className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white break-words">
                        {post.title || <span className="text-slate-300 dark:text-slate-600">Untitled Writeup</span>}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-3">
                           <img src={getCloudinaryUrl(displayAuthor.avatar || 'https://i.pravatar.cc/150?u=anonymous', { width: 36, height: 36, radius: 'max' })} alt={displayAuthor.name || 'Anonymous'} className="w-9 h-9 rounded-full" />
                           <div className="flex items-center gap-1">
                               <span className="font-semibold text-slate-700 dark:text-slate-200">{displayAuthor.name || 'Anonymous'}</span>
                               {displayAuthor.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 16, height: 16 })} alt="Admin verified" className="w-4 h-4" />}
                           </div>
                        </div>
                        <span className="hidden sm:inline">&middot;</span>
                        <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className={`inline-flex items-center gap-2 text-sm font-bold p-2 rounded-md ${severityClassesConfig[post.severity as Severity || 'Medium'].bg} ${severityClassesConfig[post.severity as Severity || 'Medium'].text}`}>
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                            {post.severity || 'Medium'} Severity
                        </div>
                        {post.reward && (
                            <div className="inline-flex items-center gap-2 text-sm font-bold p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {post.reward === 'bounty' && <MoneyIcon className="w-4 h-4 text-green-500" />}
                                {post.reward === 't-shirt' && <ShirtIcon className="w-4 h-4 text-blue-500" />}
                                {post.reward === 'gift' && <GiftIcon className="w-4 h-4 text-purple-500" />}
                                <span className="capitalize">{post.reward}</span>
                            </div>
                        )}
                        {(post.tags || []).map((tag: string) => (
                            <span key={tag} className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </header>

                <div className="prose prose-lg dark:prose-invert max-w-none break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: parsedContent }} />
            </div>
        </div>
    );
};

const WriteupEditor: React.FC<{ 
    onClose: () => void; 
    onSavePost: (post: Omit<Post, 'id' | 'created_at' | 'author' | 'comments' | 'liked_by'> | Post) => void; 
    postData: Post | Omit<Post, 'id' | 'created_at' | 'author' | 'comments' | 'liked_by'>;
    onPostDataChange: (data: any) => void;
    isClosing: boolean; 
}> = ({ onClose, onSavePost, postData, onPostDataChange, isClosing }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { addNotification } = useNotificationState();
    const [animateIn, setAnimateIn] = useState(false);
    const [isMarkdownHelpOpen, setMarkdownHelpOpen] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

    useEffect(() => {
        const timer = setTimeout(() => setAnimateIn(true), 10);
        return () => clearTimeout(timer);
    }, []);
    
    const handleFieldChange = (updates: Partial<typeof postData>) => {
        onPostDataChange({ ...postData, ...updates });
    };

    const handleRemoveTag = (tagToRemove: string) => {
        handleFieldChange({ tags: postData.tags.filter(tag => tag !== tagToRemove) });
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/,/g, '');
            if (newTag && !postData.tags.includes(newTag)) {
                handleFieldChange({ tags: [...postData.tags, newTag] });
            }
            setTagInput('');
        } else if (e.key === 'Backspace' && tagInput === '' && postData.tags.length > 0) {
            handleRemoveTag(postData.tags[postData.tags.length - 1]);
        }
    };

    const handleAnalyze = async () => {
      if (!postData.content?.trim()) {
        addNotification({ title: 'Analysis Error', message: 'Please write a description first.', type: 'warning' });
        return;
      }
      setIsAnalyzing(true);
      try {
        const result = await analyzeWriteupDetails(postData.content);
        handleFieldChange({ severity: result.severity as Severity, tags: [...new Set([...postData.tags, ...result.tags])] });
        addNotification({ title: 'Analysis Complete', message: 'Severity and tags have been suggested.', type: 'success' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        addNotification({ title: 'Analysis Failed', message, type: 'error' });
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleSubmit = () => {
      if (!postData.title.trim() || !postData.content.trim()) {
        addNotification({ title: 'Submission Error', message: 'Title and description are required.', type: 'warning' });
        return;
      }
      onSavePost(postData);
      onClose();
    };

    const severityButtonClasses: Record<Severity, { text: string; bg: string; dot: string; ring: string; }> = {
        'Low': { text: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-100 dark:bg-sky-900/40', dot: 'bg-sky-500', ring: 'ring-sky-500' },
        'Medium': { text: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/40', dot: 'bg-yellow-500', ring: 'ring-yellow-500' },
        'High': { text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/40', dot: 'bg-orange-500', ring: 'ring-orange-500' },
        'Critical': { text: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/40', dot: 'bg-red-500', ring: 'ring-red-500' },
    };
    
    const rewardOptions: {
        type: RewardType;
        label: string;
        icon: React.ReactElement;
        classes: {
            text: string;
            ring: string;
            border: string;
            selectedBg: string;
        };
    }[] = [
        {
            type: 'bounty', label: 'Bounty', icon: <MoneyIcon />,
            classes: { text: 'text-green-600 dark:text-green-400', ring: 'focus:ring-green-500', border: 'border-green-500', selectedBg: 'bg-green-50 dark:bg-green-900/30' },
        },
        {
            type: 't-shirt', label: 'T-shirt', icon: <ShirtIcon />,
            classes: { text: 'text-blue-600 dark:text-blue-400', ring: 'focus:ring-blue-500', border: 'border-blue-500', selectedBg: 'bg-blue-50 dark:bg-blue-900/30' },
        },
        {
            type: 'gift', label: 'Gift', icon: <GiftIcon />,
            classes: { text: 'text-purple-600 dark:text-purple-400', ring: 'focus:ring-purple-500', border: 'border-purple-500', selectedBg: 'bg-purple-50 dark:bg-purple-900/30' },
        },
    ];

    const formHeader = (
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <h2 className="text-lg font-bold">{'id' in postData ? 'Edit Write-up' : 'New Write-up'}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
            </button>
        </header>
    );

    const formContent = (
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
            <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                <input id="title" type="text" value={postData.title} onChange={e => handleFieldChange({ title: e.target.value })} placeholder="e.g., Stored XSS on Profile Page" className="modern-input" />
            </div>
             <div>
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="description" className="block text-sm font-medium">Description</label>
                    
                    {/* Tab Switcher - Hidden on Desktop as we have live preview panel */}
                    <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1 gap-1 md:hidden">
                        <button
                            type="button"
                            onClick={() => setActiveTab('write')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === 'write' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Write
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preview')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === 'preview' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Preview
                        </button>
                    </div>
                </div>
                
                {/* Editor Area - Visible if write tab active OR on desktop (where split view exists) */}
                <div className={activeTab === 'write' ? 'block' : 'hidden md:block'}>
                    <textarea id="description" value={postData.content} onChange={e => handleFieldChange({ content: e.target.value })} rows={12} className="modern-textarea font-mono text-sm h-full" placeholder="## Summary&#10;...&#10;## Steps to Reproduce&#10;..."></textarea>
                    <div className="flex justify-end mt-1">
                        <button onClick={() => setMarkdownHelpOpen(prev => !prev)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Markdown Help
                        </button>
                    </div>
                    {isMarkdownHelpOpen && <MarkdownHelp />}
                </div>

                {/* Preview Area - Visible only if preview tab active AND on mobile */}
                <div className={activeTab === 'preview' ? 'block md:hidden' : 'hidden'}>
                    <div className="modern-textarea min-h-[300px] prose prose-sm dark:prose-invert max-w-none overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
                        {postData.content ? (
                            <div dangerouslySetInnerHTML={{ __html: marked.parse(postData.content) }} />
                        ) : (
                            <p className="text-slate-400 italic">Nothing to preview yet...</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="pt-2">
                <button onClick={handleAnalyze} disabled={isAnalyzing} className="flex items-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-violet-100 to-indigo-100 text-indigo-700 dark:from-violet-500/20 dark:to-indigo-500/20 dark:text-indigo-300 rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity w-full sm:w-auto justify-center sm:justify-start">
                  {isAnalyzing ? <SpinnerIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                  Analyze with AI (Severity & Tags)
                </button>
            </div>
            <div>
                  <label className="block text-sm font-medium mb-2">Severity</label>
                  <div role="radiogroup" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(severityButtonClasses) as Severity[]).map(level => {
                        const style = severityButtonClasses[level];
                        const isSelected = postData.severity === level;
                        return (
                        <button key={level} role="radio" aria-checked={isSelected} onClick={() => handleFieldChange({ severity: level })}
                            className={`flex items-center justify-center gap-2 p-2 text-sm font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                            isSelected ? `${style.bg} ${style.text} ring-2 ${style.ring}` : `bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600`
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                            {level}
                        </button>
                        )
                    })}
                  </div>
              </div>
              <div>
                  <label htmlFor="tags-input" className="block text-sm font-medium mb-1">Tags</label>
                  <div className="modern-input flex items-center flex-wrap gap-2 !p-2" onClick={() => document.getElementById('tags-input')?.focus()}>
                      {postData.tags.map((tag, index) => (
                          <div key={tag} className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full animate-fade-in ${tagColorClasses[index % tagColorClasses.length]}`}>
                              <span>{tag}</span>
                              <button type="button" onClick={() => handleRemoveTag(tag)} className="text-current opacity-70 hover:opacity-100" aria-label={`Remove tag ${tag}`}>
                                  <XCircleIcon className="w-4 h-4" />
                              </button>
                          </div>
                      ))}
                      <input 
                          id="tags-input"
                          type="text"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={handleTagInputKeyDown}
                          placeholder={postData.tags.length > 0 ? "Add another..." : "Add tags..."}
                          className="bg-transparent flex-1 focus:outline-none min-w-[100px]"
                          aria-label="Add a new tag"
                      />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Press Enter or comma to add. Backspace on empty input to remove.</p>
              </div>
            <div>
                <label className="block text-sm font-medium mb-2">Reward Suggestion (Optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {rewardOptions.map(opt => {
                        const isSelected = postData.reward === opt.type;
                        return (
                        <button
                            key={opt.type}
                            onClick={() => handleFieldChange({ reward: isSelected ? undefined : opt.type })}
                            className={`flex items-center justify-center gap-2 p-2 text-sm font-semibold rounded-lg transition-all duration-150 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${opt.classes.text} ${opt.classes.ring} ${
                                isSelected 
                                    ? `${opt.classes.selectedBg} ${opt.classes.border}` 
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            {React.cloneElement(opt.icon, { className: 'w-5 h-5' })}
                            <span>{opt.label}</span>
                        </button>
                        )
                    })}
                </div>
            </div>
        </main>
    );

    const formFooter = (
        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 flex-shrink-0 bg-white dark:bg-slate-900 sticky bottom-0 z-10">
            <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90">{'id' in postData ? 'Save Changes' : 'Publish Write-up'}</button>
        </footer>
    );

    return (
        <div 
            className={`fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col md:relative md:inset-auto md:z-auto md:h-full md:w-[36rem] lg:md:w-[42rem] md:flex-shrink-0 md:border-l md:border-slate-200 md:dark:border-slate-700 md:shadow-lg transform transition-all duration-300 ease-in-out ${(animateIn && !isClosing) ? 'translate-y-0 md:translate-x-0 opacity-100' : 'translate-y-full md:translate-y-0 md:translate-x-full opacity-0'}`}
            aria-modal="true" role="dialog"
        >
            {formHeader}
            {formContent}
            {formFooter}
        </div>
    );
};

const RequestAccessView: React.FC<{ user: User; onRequestAccess: () => void; }> = ({ user, onRequestAccess }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <LockClosedIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Required</h1>
            <p className="max-w-md text-slate-500 dark:text-slate-400 mb-6">
                You need permission to view and submit write-ups. Request access from an administrator to get started.
            </p>
            <button
                onClick={onRequestAccess}
                disabled={user.has_requested_writeup_access}
                className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
                {user.has_requested_writeup_access ? 'Request Sent' : 'Request Writeup Access'}
            </button>
        </div>
    );
};

interface WriteupPageProps {
  user: User;
  posts: Post[];
  onSavePost: (post: Post | Omit<Post, 'id' | 'created_at' | 'author' | 'comments' | 'liked_by'>) => Promise<Post | null>;
  onDeletePost: (postId: string, type: 'writeup' | 'blog') => Promise<void>;
  onLikePost: (post: Post, user: User) => Promise<void>;
  onAddCommentToPost: (post: Post, commentText: string) => Promise<void>;
  onDeleteCommentFromPost: (post: Post, commentId: string) => Promise<void>;
  onRequestAccess: () => void;
  deepLinkInfo?: string | null;
  onNavigateWithinApp?: (path: string) => void;
}

interface ListPanelProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: 'created_at' | 'liked_by' | 'comments';
  setSortBy: (s: 'created_at' | 'liked_by' | 'comments') => void;
  filteredAndSortedPosts: Post[];
  onSelectPost: (id: string) => void;
  selectedPostId: string | null;
  onNewPost: () => void;
  canWrite: boolean;
  currentUser: User;
}

const ListPanel: React.FC<ListPanelProps> = ({
  searchQuery, setSearchQuery, sortBy, setSortBy, filteredAndSortedPosts, onSelectPost, selectedPostId, onNewPost, canWrite, currentUser
}) => {
    const severityClasses: Record<Severity, { text: string }> = {
        'Critical': { text: 'text-red-500' },
        'High': { text: 'text-orange-500' },
        'Medium': { text: 'text-yellow-500' },
        'Low': { text: 'text-sky-500' },
    };

    return (
        <aside className="w-full md:w-[320px] lg:w-[360px] flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative z-10">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Write-ups</h2>
                     {canWrite && (
                        <PlusButton onClick={onNewPost} title="Create a new write-up" />
                    )}
                </div>
                {/* Flex container for alignment */}
                <div className="flex items-center w-full">
                    <RetroSearchInput 
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search..."
                        width="100%"
                    />
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="modern-select modern-input-sm">
                  <option value="created_at">Sort by Newest</option>
                  <option value="liked_by">Sort by Likes</option>
                  <option value="comments">Sort by Comments</option>
                </select>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredAndSortedPosts.map(post => (
                    <button key={post.id} onClick={() => onSelectPost(post.id)} className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 transition-colors relative ${selectedPostId === post.id ? 'bg-white dark:bg-slate-800 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                        {selectedPostId === post.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full animate-fade-in"></div>}
                        <div className={`font-semibold ${severityClasses[post.severity as Severity].text}`}>{post.severity}</div>
                        <h3 className="font-semibold text-base leading-tight truncate text-slate-800 dark:text-slate-100 mt-1">{post.title}</h3>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                                <span>{post.author?.name || 'Anonymous'}</span>
                                {post.author?.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 12, height: 12 })} alt="Admin verified" className="w-3 h-3" />}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <AnimatedHeartCheckbox 
                                        checked={post.liked_by.includes(currentUser.id)} 
                                        onChange={() => {}} 
                                        id={`list-heart-${post.id}`}
                                        className="pointer-events-none"
                                    />
                                    <span>{post.liked_by.length}</span>
                                </div>
                                <div className="flex items-center gap-1"><ChatBubbleLeftRightIcon className="w-3.5 h-3.5" /> {post.comments.length}</div>
                            </div>
                        </div>
                    </button>
                ))}
                {filteredAndSortedPosts.length === 0 && (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        No write-ups found.
                    </div>
                )}
            </div>
        </aside>
    );
}

const WriteupPage: React.FC<WriteupPageProps> = ({ user, posts, onSavePost, onDeletePost, onLikePost, onAddCommentToPost, onDeleteCommentFromPost, onRequestAccess, deepLinkInfo, onNavigateWithinApp = (path: string) => {} }) => {
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [isModalClosing, setModalClosing] = useState(false);
    const [draftPost, setDraftPost] = useState<Post | Omit<Post, 'id' | 'created_at' | 'author' | 'comments' | 'liked_by'> | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'created_at' | 'liked_by' | 'comments'>('created_at');
    const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean; postId: string | null}>({isOpen: false, postId: null});
    const [deleteCommentModalState, setDeleteCommentModalState] = useState<{isOpen: boolean; commentId: string | null}>({isOpen: false, commentId: null});
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [isOptionsMenuOpen, setOptionsMenuOpen] = useState(false);
    const { addNotification } = useNotificationState();
    const optionsMenuRef = useRef<HTMLDivElement>(null);
    const detailContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (detailContainerRef.current) {
            detailContainerRef.current.scrollTop = 0;
        }
    }, [selectedPostId]);

    useEffect(() => {
        setSelectedPostId(deepLinkInfo || null);
    }, [deepLinkInfo]);

    const selectedPost = useMemo(() => posts.find(p => p.id === selectedPostId), [posts, selectedPostId]);
    
    const canModify = useMemo(() => {
        if (!user || !selectedPost) return false;
        if (user.role === 'admin') return true;
        if (selectedPost.author && user.id === selectedPost.author.id) return true;
        return false;
    }, [user, selectedPost]);

    const filteredAndSortedPosts = useMemo(() => {
        return posts
            .filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
            .sort((a, b) => {
                if (sortBy === 'liked_by') return b.liked_by.length - a.liked_by.length;
                if (sortBy === 'comments') return b.comments.length - a.comments.length;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
    }, [posts, searchQuery, sortBy]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
                setOptionsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
      // On desktop (md and up), if a post is selected but is no longer in the filtered list (e.g., after a search),
      // clear the selection to avoid showing stale content. This prevents auto-selecting a new post.
      if (window.innerWidth >= 768 && selectedPostId && !filteredAndSortedPosts.some(p => p.id === selectedPostId)) {
        onNavigateWithinApp('writeup');
      }
    }, [filteredAndSortedPosts, selectedPostId, onNavigateWithinApp]);

    const openModal = (postToEdit?: Post) => {
        if (user.writeup_access !== 'write') {
            addNotification({ title: 'Access Denied', message: 'You do not have permission to create or edit write-ups.', type: 'warning' });
            return;
        }
        if (postToEdit) {
            setDraftPost(postToEdit);
        } else {
            setDraftPost({
                type: 'writeup', title: '', content: '',
                tags: [], severity: 'Medium', reward: undefined,
            });
        }
        setModalClosing(false);
    };

    const closeModal = () => {
        setModalClosing(true);
        setTimeout(() => {
            setDraftPost(null);
        }, 300);
    };
    
    const handleSavePost = async (postData: Post | Omit<Post, 'id' | 'created_at' | 'author' | 'comments' | 'liked_by'>) => {
      const savedPost = await onSavePost(postData);
      if (savedPost) {
        addNotification({ title: 'Success!', message: `Your write-up has been ${'id' in postData ? 'updated' : 'published'}.`, type: 'success' });
        // Navigate to the new/updated post to ensure the URL is correct and the view is updated.
        onNavigateWithinApp('writeup/' + savedPost.id);
      }
    };

    const handleDeletePost = (postId: string) => {
        setDeleteModalState({isOpen: true, postId});
    };

    const confirmDeletePost = () => {
        const { postId } = deleteModalState;
        if (postId) {
            onDeletePost(postId, 'writeup');
            if (selectedPostId === postId) {
                onNavigateWithinApp('writeup');
            }
        }
        setDeleteModalState({isOpen: false, postId: null});
    };
    
    const handleAddComment = (text: string) => {
        if (!selectedPost) return;
        onAddCommentToPost(selectedPost, text);
    };

    const handleDeleteComment = (commentId: string) => {
        setDeleteCommentModalState({ isOpen: true, commentId });
    };

    const confirmDeleteComment = () => {
        if (deleteCommentModalState.commentId && selectedPost) {
            setDeletingCommentId(deleteCommentModalState.commentId);
            setTimeout(() => {
                onDeleteCommentFromPost(selectedPost, deleteCommentModalState.commentId!);
                setDeletingCommentId(null);
            }, 300);
        }
        setDeleteCommentModalState({ isOpen: false, commentId: null });
    };
      
    const handleShare = async (e: React.MouseEvent) => {
        if (!selectedPost) return;

        e.stopPropagation();
        e.preventDefault();

        const shareData = {
          title: selectedPost.title,
          text: `Check out this writeup: "${selectedPost.title}" by ${selectedPost.author?.name || 'Anonymous'}`,
          url: `${window.location.origin}${window.location.pathname}#writeup/${selectedPost.id}`
        };

        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            console.log('Share was cancelled or failed.', err);
          }
        } else {
          try {
            await navigator.clipboard.writeText(shareData.url);
            addNotification({
              title: 'Link Copied!',
              message: 'The writeup link has been copied to your clipboard.',
              type: 'success'
            });
          } catch (err) {
            addNotification({
              title: 'Copy Failed',
              message: 'Could not copy the link to the clipboard.',
              type: 'error'
            });
          }
        }
    };
    
    const handleSelectPost = (postId: string) => {
        onNavigateWithinApp(`writeup/${postId}`);
    };

    if (user.writeup_access === 'none') {
        return <RequestAccessView user={user} onRequestAccess={onRequestAccess} />;
    }

    if (draftPost) {
        return (
            <div className="flex flex-col md:flex-row h-full w-full bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
                 <ConfirmationModal
                    isOpen={deleteModalState.isOpen}
                    onClose={() => setDeleteModalState({isOpen: false, postId: null})}
                    onConfirm={confirmDeletePost}
                    title="Delete Writeup"
                    confirmText="Delete"
                >
                    <p>Are you sure you want to delete this writeup? This action cannot be undone.</p>
                </ConfirmationModal>

                {/* Desktop: Live Preview Panel */}
                <div className="hidden md:flex flex-1 h-full overflow-hidden border-r border-slate-200 dark:border-slate-800">
                    <WriteupPreviewPanel post={draftPost} currentUser={user} />
                </div>

                {/* Editor Component (Modal on mobile, Side Panel on desktop) */}
                <WriteupEditor 
                    onClose={closeModal} 
                    onSavePost={handleSavePost} 
                    postData={draftPost} 
                    onPostDataChange={setDraftPost} 
                    isClosing={isModalClosing}
                />
            </div>
        );
    }

    return (
        <div className="flex h-full w-full bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
             <ParticlesBackground />
             <ConfirmationModal
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({isOpen: false, postId: null})}
                onConfirm={confirmDeletePost}
                title="Delete Writeup"
                confirmText="Delete"
            >
                <p>Are you sure you want to delete this writeup? This action cannot be undone.</p>
            </ConfirmationModal>
            
            <ConfirmationModal
                isOpen={deleteCommentModalState.isOpen}
                onClose={() => setDeleteCommentModalState({isOpen: false, commentId: null})}
                onConfirm={confirmDeleteComment}
                title="Delete Comment"
                confirmText="Delete"
            >
                <p>Are you sure you want to permanently delete this comment?</p>
            </ConfirmationModal>

             <ListPanel 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filteredAndSortedPosts={filteredAndSortedPosts}
                onSelectPost={handleSelectPost}
                selectedPostId={selectedPostId}
                onNewPost={() => openModal()}
                canWrite={user.writeup_access === 'write' || user.role === 'admin'}
                currentUser={user}
             />
             
             {/* Detail Panel Container */}
             <div className={`flex-1 h-full transition-transform duration-300 absolute md:relative z-10 w-full md:w-auto bg-white dark:bg-slate-900 ${selectedPostId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                
                {/* Scroll Container */}
                <div ref={detailContainerRef} className="h-full overflow-y-auto relative scroll-smooth bg-white dark:bg-slate-900">
                    
                    {/* Mobile Sticky Back Button */}
                    <header className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 border-b border-slate-200 dark:border-slate-800 z-20 md:hidden flex items-center gap-2">
                        <button onClick={() => onNavigateWithinApp('writeup')} className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
                            Back to List
                        </button>
                    </header>

                    {selectedPost ? (
                        <div className="flex flex-col min-h-full">
                            <header className="p-4 sm:p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-white break-words">{selectedPost.title}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-3">
                                       <img src={getCloudinaryUrl(selectedPost.author?.avatar || 'https://i.pravatar.cc/150?u=anonymous', { width: 36, height: 36, radius: 'max' })} alt={selectedPost.author?.name || 'Anonymous'} className="w-9 h-9 rounded-full" />
                                       <div className="flex items-center gap-1">
                                           <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedPost.author?.name || 'Anonymous'}</span>
                                           {selectedPost.author?.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 16, height: 16 })} alt="Admin verified" className="w-4 h-4" />}
                                       </div>
                                    </div>
                                    <span className="hidden sm:inline">&middot;</span>
                                    <span>{new Date(selectedPost.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                     {canModify && selectedPost && (
                                        <>
                                            <span className="hidden sm:inline">&middot;</span>
                                            <div className="relative" ref={optionsMenuRef}>
                                                <button 
                                                    onClick={() => setOptionsMenuOpen(prev => !prev)} 
                                                    className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                                    aria-label="More options"
                                                >
                                                    <DotsVerticalIcon className="w-5 h-5" />
                                                </button>
                                                {isOptionsMenuOpen && (
                                                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-20 animate-fade-in py-1">
                                                        <button 
                                                            onClick={() => { openModal(selectedPost); setOptionsMenuOpen(false); }} 
                                                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => { handleDeletePost(selectedPost.id); setOptionsMenuOpen(false); }} 
                                                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className={`inline-flex items-center gap-2 text-sm font-bold p-2 rounded-md ${severityClassesConfig[selectedPost.severity || 'Medium'].bg} ${severityClassesConfig[selectedPost.severity || 'Medium'].text}`}>
                                        <div className="w-2 h-2 rounded-full bg-current"></div>
                                        {selectedPost.severity} Severity
                                    </div>
                                    {selectedPost.reward && (
                                        <div className="inline-flex items-center gap-2 text-sm font-bold p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                            {selectedPost.reward === 'bounty' && <MoneyIcon className="w-4 h-4 text-green-500" />}
                                            {selectedPost.reward === 't-shirt' && <ShirtIcon className="w-4 h-4 text-blue-500" />}
                                            {selectedPost.reward === 'gift' && <GiftIcon className="w-4 h-4 text-purple-500" />}
                                            <span className="capitalize">{selectedPost.reward}</span>
                                        </div>
                                    )}
                                    {(selectedPost.tags || []).map(tag => (
                                        <span key={tag} className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </header>

                            <div className="p-4 sm:p-6 md:p-8 w-full max-w-5xl mx-auto">
                                <div
                                    className="prose prose-lg dark:prose-invert max-w-none break-words overflow-hidden"
                                    dangerouslySetInnerHTML={{ __html: marked.parse(selectedPost.content) }}
                                />
                            </div>

                            <div className="mt-auto px-4 sm:px-6 md:px-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-10">
                                <div className="flex items-center justify-between gap-2 py-4">
                                     <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <AnimatedHeartCheckbox 
                                                checked={selectedPost.liked_by.includes(user.id)} 
                                                onChange={() => onLikePost(selectedPost, user)} 
                                                id={`writeup-like-${selectedPost.id}`} 
                                            />
                                            <span className="font-semibold text-lg">{selectedPost.liked_by.length}</span>
                                        </div>
                                        <span className="flex items-center gap-2"><ChatBubbleLeftRightIcon className="w-6 h-6 text-slate-400" /><span className="font-semibold">{selectedPost.comments.length}</span></span>
                                        <button onClick={handleShare} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors" title="Share">
                                            <ShareIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <CommentSection 
                                    comments={selectedPost.comments} 
                                    currentUser={user} 
                                    onAddComment={(text) => handleAddComment(text)} 
                                    onDeleteComment={handleDeleteComment} 
                                    deletingCommentId={deletingCommentId} 
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
                            <div className="text-center">
                                <p className="mb-2 text-lg font-medium">Select a writeup to read</p>
                                <p className="text-sm">Choose from the list on the left</p>
                            </div>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

export default React.memo(WriteupPage);

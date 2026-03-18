
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Post, User, Comment } from '../types';
import { useNotificationState } from '../contexts/NotificationContext';
import { getCloudinaryUrl } from '../utils/imageService';
import ConfirmationModal from '../components/ConfirmationModal';
import CommentSection from '../components/CommentSection';
import HeartIcon from '../components/icons/HeartIcon'; // Kept for PostCard list view
import PostCard from '../components/PostCard';
import DotsVerticalIcon from '../components/icons/DotsVerticalIcon';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import PlusIcon from '../components/icons/PlusIcon';
import SearchIcon from '../components/icons/SearchIcon';
import ChatBubbleLeftRightIcon from '../components/icons/ChatBubbleLeftRightIcon';
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
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">~~Strikethrough~~</code> → <del>Strikethrough</del></div>
            <hr className="border-slate-200 dark:border-slate-700"/>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">`Inline code`</code></div>
            <pre className="p-2 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono overflow-x-auto"><code>{"```js\nconsole.log('Hello');\n```"}</code></pre>
            <hr className="border-slate-200 dark:border-slate-700"/>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">1. Ordered</code></div>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">- Unordered</code></div>
            <hr className="border-slate-200 dark:border-slate-700"/>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">&gt; Blockquote</code></div>
            <div><code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">[Link](url)</code></div>
        </div>
    </div>
);

const BlogEditor: React.FC<{ 
    onClose: () => void; 
    onSavePost: (post: Omit<Post, 'id' | 'created_at' | 'author' | 'comments' | 'liked_by'> | Post) => void; 
    postData: Post | Omit<Post, 'id' | 'created_at' | 'author' | 'comments' | 'liked_by'>;
    onPostDataChange: (data: any) => void;
    isClosing: boolean; 
}> = ({ onClose, onSavePost, postData, onPostDataChange, isClosing }) => {
    const { addNotification } = useNotificationState();
    const [animateIn, setAnimateIn] = useState(false);
    const [isMarkdownHelpOpen, setMarkdownHelpOpen] = useState(false);
    const [tagInput, setTagInput] = useState('');

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

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!postData.title.trim() || !postData.content.trim()) {
        addNotification({ title: 'Submission Error', message: 'Title and content are required.', type: 'warning' });
        return;
      }
      onSavePost(postData);
    };
    
    const formHeader = (
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <h2 className="text-lg font-bold">{'id' in postData ? 'Edit Blog Post' : 'New Blog Post'}</h2>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><XCircleIcon className="w-6 h-6 text-slate-500" /></button>
        </header>
    );

    const formContent = (
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
            <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                <input id="title" type="text" value={postData.title} onChange={e => handleFieldChange({ title: e.target.value })} placeholder="e.g., Platform Update v1.2" className="modern-input" />
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="content" className="block text-sm font-medium">Content</label>
                    <button type="button" onClick={() => setMarkdownHelpOpen(prev => !prev)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Markdown Help</button>
                </div>
                <textarea id="content" value={postData.content} onChange={e => handleFieldChange({ content: e.target.value })} rows={12} className="modern-textarea font-mono text-sm" placeholder="## Welcome!&#10;..."></textarea>
                {isMarkdownHelpOpen && <MarkdownHelp />}
            </div>
            <div>
                <label htmlFor="tags-input-editor" className="block text-sm font-medium mb-1">Tags</label>
                <div className="modern-input flex items-center flex-wrap gap-2 !p-2" onClick={() => document.getElementById('tags-input-editor')?.focus()}>
                    {postData.tags.map((tag, index) => (
                        <div key={tag} className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full animate-fade-in ${tagColorClasses[index % tagColorClasses.length]}`}>
                            <span>{tag}</span>
                            <button type="button" onClick={() => handleRemoveTag(tag)} className="text-current opacity-70 hover:opacity-100"><XCircleIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                    <input id="tags-input-editor" type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagInputKeyDown} placeholder="Add tags..." className="bg-transparent flex-1 focus:outline-none min-w-[100px]" />
                </div>
            </div>
        </main>
    );

    const formFooter = (
        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90">{'id' in postData ? 'Save Changes' : 'Publish Post'}</button>
        </footer>
    );

    return (
        <div
            className={`fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col md:relative md:inset-auto md:z-auto md:h-full md:w-[36rem] lg:md:w-[42rem] md:flex-shrink-0 md:border-l md:border-slate-200 md:dark:border-slate-700 md:shadow-lg transform transition-all duration-300 ease-in-out ${(animateIn && !isClosing) ? 'translate-y-0 md:translate-x-0 opacity-100' : 'translate-y-full md:translate-y-0 md:translate-x-full opacity-0'}`}
            aria-modal="true" role="dialog"
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                {formHeader}
                {formContent}
                {formFooter}
            </form>
        </div>
    );
};

const BlogPostPreviewPanel: React.FC<{ post: Post | Omit<Post, 'id'|'created_at'|'author'|'comments'|'liked_by'>, currentUser: User }> = ({ post, currentUser }) => {
    const author = ('author' in post ? post.author : currentUser);

    const parsedContent = useMemo(() => {
        return (typeof post.content === 'string' && post.content) 
            ? marked.parse(post.content) 
            : '<p class="text-slate-400">Start typing in the editor to see your post take shape...</p>';
    }, [post.content]);

    return (
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 h-full relative">
            <div className="sticky top-0 bg-cyan-600/90 backdrop-blur-sm text-white text-center text-sm font-semibold z-10 py-1.5 animate-fade-in">
                Live Preview
            </div>
            <article className="max-w-4xl mx-auto">
                 <header className="p-4 sm:p-6 md:p-8">
                    <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white break-words">
                        {post.title || <span className="text-slate-400">[Your Title Here]</span>}
                    </h1>
                    <div className="flex items-center gap-4 mb-6">
                        <img src={getCloudinaryUrl(author.avatar, { width: 56, height: 56, radius: 'max' })} alt={author.name} className="w-14 h-14 rounded-full" />
                        <div>
                            <div className="flex items-center gap-1">
                                <p className="font-semibold text-slate-700 dark:text-slate-200 text-base">{author.name}</p>
                                {author.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 16, height: 16 })} alt="Admin verified" className="w-4 h-4" />}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {(post.tags || []).map((tag, index) => (
                            <span key={tag} className={`px-3 py-1 rounded-full text-xs font-medium ${tagColorClasses[index % tagColorClasses.length]}`}>#{tag}</span>
                        ))}
                    </div>
                </header>
                <div className="p-4 sm:p-6 md:p-8 border-t border-slate-200 dark:border-slate-800">
                    <div className="prose prose-lg dark:prose-invert max-w-none break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: parsedContent }}/>
                </div>
            </article>
        </main>
    );
};

interface BlogPageProps {
  user: User;
  posts: Post[];
  onSavePost: (post: Post | Omit<Post, 'id' | 'created_at' | 'author' | 'comments' | 'liked_by'>) => Promise<Post | null>;
  onDeletePost: (postId: string, type: 'writeup' | 'blog') => Promise<void>;
  onLikePost: (post: Post, user: User) => Promise<void>;
  onAddCommentToPost: (post: Post, commentText: string) => Promise<void>;
  onDeleteCommentFromPost: (post: Post, commentId: string) => Promise<void>;
  deepLinkInfo?: string | null;
  onNavigateWithinApp?: (path: string) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ user, posts, onSavePost, onDeletePost, onLikePost, onAddCommentToPost, onDeleteCommentFromPost, deepLinkInfo, onNavigateWithinApp = (path: string) => {} }) => {
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditorClosing, setEditorClosing] = useState(false);
    const [draftPost, setDraftPost] = useState<Post | Omit<Post, 'id' | 'created_at' | 'author' | 'comments' | 'liked_by'> | null>(null);
    const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean; postId: string | null}>({isOpen: false, postId: null});
    const [deleteCommentModalState, setDeleteCommentModalState] = useState<{isOpen: boolean; commentId: string | null}>({isOpen: false, commentId: null});
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [isOptionsMenuOpen, setOptionsMenuOpen] = useState(false);
    const { addNotification } = useNotificationState();
    const optionsMenuRef = useRef<HTMLDivElement>(null);

    const sortedPosts = useMemo(() => {
        return [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [posts]);
    
    useEffect(() => {
        setSelectedPostId(deepLinkInfo || null);
    }, [deepLinkInfo]);

    const filteredPosts = useMemo(() => {
        if (!searchQuery) return sortedPosts;
        const lowercasedQuery = searchQuery.toLowerCase();
        return sortedPosts.filter(post => 
            post.title.toLowerCase().includes(lowercasedQuery) || 
            post.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery))
        );
    }, [sortedPosts, searchQuery]);

    const selectedPost = useMemo(() => posts.find(p => p.id === selectedPostId), [posts, selectedPostId]);
    const canModify = useMemo(() => user.role === 'admin', [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
                setOptionsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const openEditor = (postToEdit?: Post) => {
        if (!canModify) return;
        setDraftPost(postToEdit || { type: 'blog', title: '', content: '', tags: [] });
        setEditorClosing(false);
    };

    const closeEditor = () => {
        setEditorClosing(true);
        setTimeout(() => {
            setDraftPost(null);
        }, 300);
    };
    
    const handleSavePost = async (postData: Post | Omit<Post, 'id' | 'created_at' | 'author' | 'comments' | 'liked_by'>) => {
      const savedPost = await onSavePost(postData);
      if (savedPost) {
        addNotification({ title: 'Success!', message: `Your post has been ${'id' in postData ? 'updated' : 'published'}.`, type: 'success' });
        onNavigateWithinApp('blog/' + savedPost.id);
        closeEditor();
      }
    };

    const handleDeletePost = (postId: string) => setDeleteModalState({isOpen: true, postId});
    const confirmDeletePost = () => {
        if (deleteModalState.postId) {
            onDeletePost(deleteModalState.postId, 'blog');
            onNavigateWithinApp('blog');
        }
        setDeleteModalState({isOpen: false, postId: null});
    };

    const confirmDeleteComment = () => {
        if (deleteCommentModalState.commentId && selectedPost) {
            setDeletingCommentId(deleteCommentModalState.commentId);
            setTimeout(() => {
                onDeleteCommentFromPost(selectedPost, deleteCommentModalState.commentId!);
                setDeletingCommentId(null);
            }, 300);
        }
        setDeleteCommentModalState({isOpen: false, commentId: null});
    };

    const ListView = (
      <>
        <header className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">The Blog</h1>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    {/* Explicitly align items center in this container and ensure width constraint */}
                    <div className="relative flex items-center flex-1 sm:flex-none w-full sm:w-[250px]">
                        <RetroSearchInput 
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search..."
                            width="100%"
                        />
                    </div>
                    {canModify && (
                        <PlusButton onClick={() => openEditor()} title="New Post" />
                    )}
                </div>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {filteredPosts.length > 0 ? (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {filteredPosts.map(post => (
                        <PostCard key={post.id} post={post} currentUser={user} onClick={() => onNavigateWithinApp(`blog/${post.id}`)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <SearchIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">No Posts Found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or check back later.</p>
                </div>
            )}
        </main>
      </>
    );

    if (draftPost) {
        return (
            <div className="flex flex-col md:flex-row h-full w-full bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
                <ParticlesBackground />
                <ConfirmationModal isOpen={deleteModalState.isOpen} onClose={() => setDeleteModalState({isOpen: false, postId: null})} onConfirm={confirmDeletePost} title="Delete Post"><p>Are you sure you want to delete this post? This action cannot be undone.</p></ConfirmationModal>
                <div className="md:hidden h-full w-full flex flex-col relative z-10">{ListView}</div>
                <div className="hidden md:flex flex-1 relative z-10"><BlogPostPreviewPanel post={draftPost} currentUser={user} /></div>
                
                <div className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden ${isEditorClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={closeEditor} />
                <BlogEditor onSavePost={handleSavePost} onClose={closeEditor} postData={draftPost} onPostDataChange={setDraftPost} isClosing={isEditorClosing} />
            </div>
        );
    }

    if (selectedPostId && selectedPost) {
        return (
            <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-900 relative">
                 <ParticlesBackground />
                 <ConfirmationModal isOpen={deleteModalState.isOpen} onClose={() => setDeleteModalState({isOpen: false, postId: null})} onConfirm={confirmDeletePost} title="Delete Post"><p>Are you sure you want to delete this post? This action cannot be undone.</p></ConfirmationModal>
                <ConfirmationModal isOpen={deleteCommentModalState.isOpen} onClose={() => setDeleteCommentModalState({isOpen: false, commentId: null})} onConfirm={confirmDeleteComment} title="Delete Comment"><p>Are you sure you want to permanently delete this comment?</p></ConfirmationModal>
                
                <main className="flex-1 overflow-y-auto relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="p-4 sm:p-6 sticky top-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <button onClick={() => onNavigateWithinApp('blog')} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
                                Back to all posts
                            </button>
                            {canModify && (
                                <div className="relative" ref={optionsMenuRef}>
                                    <button 
                                        onClick={() => setOptionsMenuOpen(prev => !prev)} 
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                        Options <DotsVerticalIcon className="w-4 h-4" />
                                    </button>
                                    {isOptionsMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-20 animate-fade-in py-1">
                                            <button onClick={() => { openEditor(selectedPost); setOptionsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <PencilIcon className="w-4 h-4" /> Edit
                                            </button>
                                            <button onClick={() => { handleDeletePost(selectedPost.id); setOptionsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <TrashIcon className="w-4 h-4" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <article className="animate-fade-in break-words overflow-hidden">
                            <header className="p-4 sm:p-6 md:p-8">
                                <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white break-words">{selectedPost.title}</h1>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={getCloudinaryUrl(selectedPost.author.avatar, { width: 56, height: 56, radius: 'max' })} alt={selectedPost.author.name} className="w-14 h-14 rounded-full" />
                                    <div className="text-left">
                                        <div className="flex items-center gap-1">
                                            <p className="font-semibold text-slate-700 dark:text-slate-200 text-base">{selectedPost.author.name}</p>
                                            {selectedPost.author.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 16, height: 16 })} alt="Admin verified" className="w-4 h-4" />}
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(selectedPost.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {selectedPost.tags.map((tag, index) => (
                                        <span key={tag} className={`px-3 py-1 rounded-full text-xs font-medium ${tagColorClasses[index % tagColorClasses.length]}`}>#{tag}</span>
                                    ))}
                                </div>
                            </header>
                            
                            <div className="p-4 sm:p-6 md:p-8 border-t border-slate-200 dark:border-slate-800">
                                <div className="prose prose-lg dark:prose-invert max-w-none break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: marked.parse(selectedPost.content) }} />
                            </div>

                            <div className="px-4 sm:px-6 md:px-8 pt-0">
                                <div className="flex items-center justify-between gap-2 py-4 border-t border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <AnimatedHeartCheckbox 
                                                checked={selectedPost.liked_by.includes(user.id)} 
                                                onChange={() => onLikePost(selectedPost, user)} 
                                                id={`blog-like-${selectedPost.id}`} 
                                            />
                                            <span className="font-semibold text-lg">{selectedPost.liked_by.length}</span>
                                        </div>
                                        <span className="flex items-center gap-2"><ChatBubbleLeftRightIcon className="w-6 h-6 text-slate-400" /><span className="font-semibold">{selectedPost.comments.length}</span></span>
                                    </div>
                                </div>
                            </div>
                            <CommentSection comments={selectedPost.comments} currentUser={user} onAddComment={(text) => onAddCommentToPost(selectedPost, text)} onDeleteComment={(id) => setDeleteCommentModalState({isOpen: true, commentId: id})} deletingCommentId={deletingCommentId} />
                        </article>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex flex-col bg-slate-100 dark:bg-slate-900 relative">
            <ParticlesBackground />
            <ConfirmationModal isOpen={deleteModalState.isOpen} onClose={() => setDeleteModalState({isOpen: false, postId: null})} onConfirm={confirmDeletePost} title="Delete Post"><p>Are you sure you want to delete this post? This action cannot be undone.</p></ConfirmationModal>
            <div className="flex flex-col h-full relative z-10">{ListView}</div>
        </div>
    );
};

export default React.memo(BlogPage);

import React, { useState, useEffect } from 'react';
import { Post, Comment } from '../types';
import HeartIcon from '../components/icons/HeartIcon';
import SocialShareButtons from '../components/SocialShareButtons';
import { likePost, addCommentToPost } from '../services/database';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { translateText } from '../services/translationService';

interface BlogPostViewerProps {
    post?: Post;
    onUpdate?: () => void;
}

const BlogPostViewer: React.FC<BlogPostViewerProps> = ({ post, onUpdate }) => {
    // Basic hooks at top
    const [likes, setLikes] = useState<string[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    
    // Comment box logic
    const [newComment, setNewComment] = useState('');
    const [captchaQuestion, setCaptchaQuestion] = useState({ q: '2 + 2', a: '4' });
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [captchaError, setCaptchaError] = useState('');

    // Translation state
    const [targetLanguage, setTargetLanguage] = useState<string>('English');
    const [translatedContent, setTranslatedContent] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState('');

    const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi', 'Tamil'];

    // Ensure we init from `post` if it changes
    useEffect(() => {
        if (post) {
            setLikes(post.liked_by || []);
            setComments(post.comments || []);
        }
    }, [post]);

    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptchaQuestion({ q: `${num1} + ${num2}`, a: (num1 + num2).toString() });
        setCaptchaAnswer('');
        setCaptchaError('');
    }

    useEffect(() => { 
        generateCaptcha(); 
    }, []);

    if (!post) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500 p-8">
                <p>Could not load the blog post. Please close this window and try again.</p>
            </div>
        );
    }

    const getGuestId = () => {
        let gid = localStorage.getItem('guest_uuid');
        if (!gid || !gid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // Generate a valid UUID fallback if randomUUID fails or old invalid one exists
            try {
                gid = window.crypto.randomUUID();
            } catch (e) {
                gid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
            localStorage.setItem('guest_uuid', gid);
        }
        return gid;
    };

    const guestId = getGuestId();
    const isLiked = likes.includes(guestId);

    const handleLike = async () => {
        const userId = guestId;
        const wasLiked = isLiked;

        // Optimistic UI Update
        if (wasLiked) {
            setLikes(likes.filter(id => id !== userId));
        } else {
            setLikes([...likes, userId]);
        }

        try {
            // DB Update
            const updatedPost = await likePost(post.id, post, userId);
            if (updatedPost) {
                setLikes(updatedPost.liked_by || []);
                onUpdate?.(); // Notify parent to refresh the card view behind the scenes
            }
        } catch (error) {
            console.error("Failed to update likes in DB:", error);
            // Revert if failed
            if (wasLiked) {
                setLikes([...likes, userId]);
            } else {
                setLikes(likes.filter(id => id !== userId));
            }
        }
    };

    const handleTranslate = async (lang: string) => {
        if (lang === 'English') {
            setTranslatedContent(null);
            setTargetLanguage('English');
            return;
        }

        setIsTranslating(true);
        setTranslationError('');
        try {
            const translated = await translateText(post!.content, lang);
            setTranslatedContent(translated);
            setTargetLanguage(lang);
        } catch (error) {
            setTranslationError('Translation failed. Please try again later.');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newComment.trim()) return;

        if (captchaAnswer.trim() !== captchaQuestion.a) {
            setCaptchaError("Incorrect CAPTCHA answer. Please try again.");
            generateCaptcha();
            return;
        }

        const newC: Comment = {
            id: window.crypto.randomUUID ? window.crypto.randomUUID() : (Math.random().toString() + Date.now().toString()),
            author: { 
                id: guestId, 
                name: 'Guest User', 
                email: 'guest@example.com', 
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest', 
                role: 'user', 
                writeup_access: 'none', 
                status: 'unverified', 
                created_at: new Date().toISOString(), 
                admin_verified: false 
            },
            text: newComment,
            created_at: new Date().toISOString()
        };
        
        // Optimistic update
        setComments([...comments, newC]);
        setNewComment('');
        generateCaptcha();

        try {
            // DB Update
            const updatedPost = await addCommentToPost(post.id, post, newC);
            if (updatedPost) {
                setComments(updatedPost.comments || []);
                onUpdate?.(); // Notify parent to refresh the card view behind the scenes
            }
        } catch (error) {
            console.error("Failed to add comment to DB:", error);
        }
    };


    return (
        <div className="h-full w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <article>
                    <header className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200">{post.author.name}</p>
                                    <p>{new Date(post.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            {/* Heart Count */}
                            <button 
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-medium ${
                                    isLiked 
                                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400'
                                }`}
                            >
                                <HeartIcon filled={isLiked} className="w-5 h-5" />
                                <span>{likes.length}</span>
                            </button>
                        </div>
                    </header>

                    <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                        <div className="flex justify-end gap-3 mb-4">
                            <select 
                                value={targetLanguage} 
                                onChange={(e) => handleTranslate(e.target.value)}
                                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm text-slate-700 dark:text-slate-200"
                                disabled={isTranslating}
                            >
                                {languages.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                            {isTranslating && <span className="text-sm text-slate-500 animate-pulse">Translating...</span>}
                        </div>
                        {translationError && <p className="text-red-500 text-sm mb-4">{translationError}</p>}
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                            {translatedContent || post.content}
                        </ReactMarkdown>
                    </div>

                    {/* Social Share Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 gap-4 mb-12 shadow-sm animate-fade-in">
                        <SocialShareButtons 
                            title={post.title} 
                            url={`${window.location.origin}${window.location.pathname}#blog/${post.id}`} 
                        />
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span>{new Date().toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{Math.ceil(post.content.length / 500)} min read</span>
                        </div>
                    </div>
                </article>

                {/* Comments Section */}
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                        Comments ({comments.length})
                    </h2>

                    {/* Comment Form */}
                    <form onSubmit={handleComment} className="mb-10 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Leave a comment</h3>
                        
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your comment here..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-y min-h-[100px] mb-4"
                            required
                        />

                        {/* CAPTCHA Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                    Security Check: What is {captchaQuestion.q}?
                                </span>
                                <input
                                    type="text"
                                    value={captchaAnswer}
                                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                                    placeholder="Answer"
                                    className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || !captchaAnswer.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                            >
                                Post Comment
                            </button>
                        </div>
                        {captchaError && (
                            <p className="text-red-500 text-sm">{captchaError}</p>
                        )}
                    </form>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {comments.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No comments yet. Be the first to start the discussion!</p>
                        ) : (
                            [...comments].reverse().map((comment, index) => (
                                <div key={`${comment.id}-${index}`} className="flex gap-4">
                                    <img src={comment.author.avatar} alt={comment.author.name} className="w-10 h-10 rounded-full shrink-0" />
                                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{comment.author.name}</h4>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(comment.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPostViewer;
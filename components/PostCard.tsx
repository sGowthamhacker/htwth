
import React, { useState } from 'react';
import { Post, RewardType, Severity, User } from '../types';
import HeartIcon from './icons/HeartIcon';
import LockIcon from './icons/LockIcon';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon';
import MoneyIcon from './icons/MoneyIcon';
import ShirtIcon from './icons/ShirtIcon';
import GiftIcon from './icons/GiftIcon';
import { useNotificationState } from '../contexts/NotificationContext';
import { getCloudinaryUrl } from '../utils/imageService';
import AnimatedHeartCheckbox from './AnimatedHeartCheckbox';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onUpdatePost?: (post: Post) => Promise<void>;
}

const severityClasses: Record<Severity, { text: string; bg: string; dot: string; }> = {
    'Critical': { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40', dot: 'bg-red-500' },
    'High': { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/40', dot: 'bg-orange-500' },
    'Medium': { text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/40', dot: 'bg-yellow-500' },
    'Low': { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/40', dot: 'bg-sky-500' },
};

const rewardIcons: Record<RewardType, React.ReactElement> = {
    bounty: <MoneyIcon className="w-5 h-5 text-green-500" />,
    't-shirt': <ShirtIcon className="w-5 h-5 text-blue-500" />,
    gift: <GiftIcon className="w-5 h-5 text-purple-500" />,
};

const tagColorClasses = [
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
];

const AnimatedShareButton: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({ onClick }) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setClicked(true);
    onClick(e);
    // Reset state after 2 seconds to allow re-sharing/copying
    setTimeout(() => setClicked(false), 2000);
  };

  return (
    <div onClick={handleClick} className="group/share relative flex justify-center items-center text-zinc-600 text-sm font-bold cursor-pointer z-10 w-fit">
      {/* Tooltip Container - Pops up on hover of THIS button only */}
      <div className={`absolute opacity-0 group-hover/share:opacity-100 group-hover/share:-translate-y-[160%] -translate-y-[300%] duration-500 group-hover/share:delay-500 skew-y-[20deg] group-hover/share:skew-y-0 shadow-md z-20 pointer-events-none transition-all ease-out`}>
        <div className={`${clicked ? 'bg-emerald-300 text-emerald-900' : 'bg-lime-300 text-zinc-800'} flex items-center gap-1 p-2 rounded-md transition-colors duration-300`}>
          {clicked ? (
             // Check icon for success state
             <svg fill="none" viewBox="0 0 24 24" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg" className="stroke-current stroke-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
             </svg>
          ) : (
             // Clean standard Share Icon (replacing broken path)
             <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-zinc-800"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
          )}
          <span className="whitespace-nowrap">{clicked ? 'Copied!' : 'Copy Link'}</span>
        </div>
        {/* Triangle Pointer */}
        <div className={`shadow-md ${clicked ? 'bg-emerald-300' : 'bg-lime-300'} absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 rotate-45 p-1 transition-colors duration-300`}></div>
      </div>

      {/* Main Button Pill */}
      <div className={`shadow-md flex items-center gap-0 bg-gradient-to-br ${clicked ? 'from-emerald-300 to-green-300 gap-2' : 'from-lime-300 to-yellow-300'} p-3 rounded-full cursor-pointer duration-300 transition-all hover:brightness-105`}>
        {clicked ? (
             <svg fill="none" viewBox="0 0 24 24" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg" className="stroke-zinc-700 stroke-2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
             </svg>
        ) : (
            // Clean standard Share Icon in button
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-zinc-700"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
        )}
      </div>
    </div>
  );
};

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onClick, onUpdatePost }) => {
  const { addNotification } = useNotificationState();

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const shareData = {
      title: post.title,
      text: `Check out this writeup: "${post.title}" by ${post.author.name}`,
      url: `${window.location.origin}${window.location.pathname}#${post.type}/${post.id}`
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
          message: 'The post link has been copied to your clipboard.',
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

  // Safe check for author display
  const author = post.author || { name: 'Anonymous', avatar: '', role: 'user', id: 'deleted' };

  return (
    <div
      onClick={onClick}
      role="button"
      className="group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-visible hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full text-left w-full max-w-full"
    >
      {/* Author & Meta */}
      <div className="p-5 flex-1 w-full">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 min-w-0">
                <img 
                    src={getCloudinaryUrl(author.avatar || 'https://i.pravatar.cc/150?u=anonymous', { width: 40, height: 40, radius: 'max' })} 
                    alt={author.name} 
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 flex-shrink-0"
                    loading="lazy"
                />
                <div className="min-w-0 overflow-hidden">
                    <div className="flex items-center gap-1">
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{author.name}</p>
                        {author.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 14, height: 14 })} alt="Admin verified" className="w-3.5 h-3.5 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            {post.is_protected && (
                <div className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 backdrop-blur-md" title="Protected Content">
                    <LockIcon className="w-4 h-4" />
                </div>
            )}
            {post.severity && (
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider flex-shrink-0 ml-2 ${severityClasses[post.severity as Severity].bg} ${severityClasses[post.severity as Severity].text}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${severityClasses[post.severity as Severity].dot}`}></span>
                    {post.severity}
                </span>
            )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 break-words group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {post.title}
        </h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 break-words">
            {post.content ? post.content.replace(/[#*`]/g, '').slice(0, 150) : 'No description provided.'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
            {(post.tags || []).slice(0, 3).map((tag, i) => (
                <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${tagColorClasses[i % tagColorClasses.length]}`}>
                    #{tag}
                </span>
            ))}
            {(post.tags?.length || 0) > 3 && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    +{post.tags.length - 3}
                </span>
            )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-y-3 gap-x-2 rounded-b-2xl">
        {/* Left Side: Likes & Comments */}
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5" title="Likes">
               <AnimatedHeartCheckbox 
                  checked={post.liked_by.includes(currentUser.id)} 
                  onChange={() => {}} // Read-only in list view
                  id={`card-like-${post.id}`}
                  className="pointer-events-none" 
               />
               <span className="text-xs font-semibold">{post.liked_by.length}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Comments">
               <ChatBubbleLeftRightIcon className="w-4 h-4" />
               <span className="text-xs font-semibold">{post.comments.length}</span>
            </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
           {post.reward && (
             <div className="flex items-center gap-1.5 bg-white dark:bg-slate-700 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm" title={`Reward: ${post.reward}`}>
                {rewardIcons[post.reward]}
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">{post.reward}</span>
             </div>
           )}
           {currentUser.role === 'admin' && (
             <button 
               onClick={async (e) => { e.stopPropagation(); if (onUpdatePost) await onUpdatePost({...post, is_visible: !post.is_visible}); }}
               className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${post.is_visible ? 'bg-indigo-600' : 'bg-slate-300'}`}
               title={post.is_visible ? "Hide from landing" : "Show on landing"}
             >
               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${post.is_visible ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
           )}
            <div onClick={(e) => e.stopPropagation()}>
             <AnimatedShareButton onClick={handleShare} />
           </div>
           
           <div className="ml-2 py-1.5 px-3 bg-indigo-600 rounded-lg text-white text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
              {post.is_protected ? 'Locked' : 'Execute'}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

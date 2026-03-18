import React, { useState } from 'react';
import { Comment, User } from '../types';
import SendIcon from './icons/SendIcon';
import { getCloudinaryUrl } from '../utils/imageService';
import TrashIcon from './icons/TrashIcon';

interface CommentSectionProps {
  comments: Comment[];
  currentUser: User;
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
  deletingCommentId?: string | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, currentUser, onAddComment, onDeleteComment, deletingCommentId }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-100/30 dark:bg-slate-800/20 border-t border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Comments ({comments.length})</h3>

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="flex items-start space-x-3 mb-8">
        <img src={getCloudinaryUrl(currentUser.avatar, { width: 40, height: 40, radius: 'max' })} alt={currentUser.name} className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Join the conversation..."
            className="modern-textarea w-full bg-white/60 dark:bg-slate-900/40"
            rows={3}
            aria-label="Add a comment"
          />
          <div className="flex justify-end mt-2">
            <button 
              type="submit" 
              disabled={!newComment.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Comment
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length > 0 ? comments.map((comment) => {
          const canDelete = currentUser.id === comment.author.id || currentUser.role === 'admin';
          return (
            <div key={comment.id} className={`group flex items-start space-x-4 ${deletingCommentId === comment.id ? 'animate-fade-out' : ''}`}>
              <img src={getCloudinaryUrl(comment.author.avatar, { width: 40, height: 40, radius: 'max' })} alt={comment.author.name} className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{comment.author.name}</span>
                      {comment.author.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 16, height: 16 })} alt="Admin verified" className="w-4 h-4" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(comment.created_at).toLocaleString()}</span>
                    {canDelete && (
                      <button 
                        onClick={() => onDeleteComment(comment.id)}
                        className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete comment"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          )
        }) : (
          <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Be the first to comment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
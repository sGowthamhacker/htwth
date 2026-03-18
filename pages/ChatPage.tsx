
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, ChatMessage } from '../types';
import SendIcon from '../components/icons/SendIcon';
import ChatIcon from '../components/icons/ChatIcon';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ReplyIcon from '../components/icons/ReplyIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import FaceSmileIcon from '../components/icons/FaceSmileIcon';
import { getCloudinaryUrl } from '../utils/imageService';
import ConfirmationModal from '../components/ConfirmationModal';
import CheckIcon from '../components/icons/CheckIcon';
import ParticlesBackground from '../components/ParticlesBackground';

interface ChatPageProps {
  user: User;
  allUsers: User[];
  messages: ChatMessage[];
  onSendMessage: (text: string, replyToMessage?: ChatMessage) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onClearChat: () => void;
  onOpenApp?: (appId: string, props?: Record<string, any>, e?: React.MouseEvent<HTMLElement>) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  user, allUsers, messages, onSendMessage, onEditMessage, onDeleteMessage, onReaction, onClearChat,
  onOpenApp = (appId, props, e) => {}
}) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [reactionPickerOpenFor, setReactionPickerOpenFor] = useState<string | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, messageId: string | null}>({isOpen: false, messageId: null});
  const [isClearChatModalOpen, setIsClearChatModalOpen] = useState(false);
  const prevMessageCount = useRef(messages.length);

  const EMOJIS = ['👍', '❤️', '😂', '🎉', '🤔', '😢'];
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        if (!(event.target as HTMLElement).closest('[title="React"]')) {
          setReactionPickerOpenFor(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 100;
        const lastMessage = messages[messages.length - 1];
        
        if (lastMessage?.author.email === user.email || isScrolledToBottom) {
             scrollToBottom('smooth');
        }
    }
  }, [messages, user.email]);

  useEffect(() => {
    prevMessageCount.current = messages.length;
  }, [messages.length]);
  
  const handleScrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('message-highlight');
      setTimeout(() => {
        element.classList.remove('message-highlight');
      }, 1500); // Duration of the animation
    }
  };


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input, replyingTo || undefined);
    setInput('');
    setReplyingTo(null);
  };
  
  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessage(message);
  };
  
  const handleCancelEdit = () => {
    setEditingMessage(null);
  };
  
  const handleSaveEdit = (newText: string) => {
    if (editingMessage && newText.trim()) {
      onEditMessage(editingMessage.id, newText.trim());
    }
    setEditingMessage(null);
  };
  
  const handleDelete = (messageId: string) => {
    setDeleteModalState({ isOpen: true, messageId });
  };

  const confirmDeleteMessage = () => {
    if (deleteModalState.messageId) {
        onDeleteMessage(deleteModalState.messageId);
    }
    setDeleteModalState({ isOpen: false, messageId: null });
  };
  
  const handleStartReply = (message: ChatMessage) => {
      setReplyingTo(message);
  }

  const handleReactionClick = (messageId: string, emoji: string) => {
    onReaction(messageId, emoji);
    setReactionPickerOpenFor(null);
  };

  return (
    <div className="flex h-full flex-col items-center bg-stone-100 dark:bg-stone-900 relative">
      <ParticlesBackground />
      <div className="grid h-full w-full max-w-4xl grid-rows-[auto_1fr_auto] relative z-10 bg-stone-100/50 dark:bg-stone-900/50 backdrop-blur-[1px]">
       <ConfirmationModal
          isOpen={deleteModalState.isOpen}
          onClose={() => setDeleteModalState({ isOpen: false, messageId: null })}
          onConfirm={confirmDeleteMessage}
          title={t('chat_delete_title')}
          confirmText={t('chat_delete_confirm')}
      >
          <p>{t('chat_delete_message')}</p>
      </ConfirmationModal>

       <ConfirmationModal
            isOpen={isClearChatModalOpen}
            onClose={() => setIsClearChatModalOpen(false)}
            onConfirm={() => {
                onClearChat();
                setIsClearChatModalOpen(false);
            }}
            title={t('chat_clear_title')}
            confirmText={t('chat_clear_confirm')}
        >
            <p>{t('chat_clear_message')}</p>
        </ConfirmationModal>

       <header className="row-start-1 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-stone-100/90 dark:bg-stone-900/90 backdrop-blur-sm">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2"><ChatIcon className="w-5 h-5 text-emerald-500" /> {t('chat_title')}</h2>
          {user.role === 'admin' && (
            <button 
                onClick={() => setIsClearChatModalOpen(true)}
                className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                title={t('chat_clear_title')}
            >
                <TrashIcon className="w-5 h-5" />
            </button>
          )}
      </header>
      <div ref={messagesContainerRef} className="row-start-2 overflow-y-auto p-2 sm:p-4 space-y-4 min-h-0 pt-20">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.author.email === user.email;
          const isAdmin = user.role === 'admin';
          const canEdit = isCurrentUser;
          const canDelete = isCurrentUser || isAdmin;
          
          const isEditing = editingMessage?.id === msg.id;
          const isSending = msg.status === 'sending';
          const didFail = msg.status === 'failed';
          const isSent = msg.status === 'sent';

          const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => {
              if (msg.author.email !== user.email && msg.author.email !== 'system@local') {
                  onOpenApp('about', { profileUserEmail: msg.author.email }, e);
              }
          };

          const isNew = index >= prevMessageCount.current;

          return (
            <div 
              key={msg.id} 
              id={`message-${msg.id}`}
              className={`relative flex items-start gap-3 py-2 rounded-md ${isCurrentUser ? 'justify-end' : ''} ${isSending || didFail ? 'opacity-70' : ''} ${isNew ? 'animate-message-in' : ''}`}
            >
              {!isCurrentUser && (
                <button 
                  onClick={handleAvatarClick} 
                  className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full disabled:cursor-default"
                  disabled={msg.author.email === 'system@local'}
                  title={msg.author.email !== 'system@local' ? t('chat_view_profile', { name: msg.author.name }) : ''}
                >
                    <img src={getCloudinaryUrl(msg.author.avatar, { width: 32, height: 32, radius: 'max' })} alt={msg.author.name} className="w-8 h-8 rounded-full" />
                </button>
              )}
              
              <div className="group relative">
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-xs sm:max-w-md md:max-w-lg p-3 rounded-lg ${isCurrentUser ? 'bg-indigo-100/80 dark:bg-indigo-900/60 backdrop-blur-md text-indigo-800 dark:text-indigo-200' : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-md'}`}>
                        {!isCurrentUser && (
                            <div className="flex items-center gap-1 mb-1">
                                <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400">{msg.author.name}</p>
                                {msg.author.role === 'admin' && <img src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 14, height: 14 })} alt="Admin verified" className="w-3.5 h-3.5" />}
                            </div>
                        )}
                        
                        {msg.reply_to && (
                        <button
                          onClick={() => handleScrollToMessage(msg.reply_to!.id)}
                          className="w-full text-left p-2 mb-2 border-l-2 border-slate-400/50 bg-black/10 dark:bg-white/10 rounded-md hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                          title="Go to original message"
                        >
                            <p className="text-xs font-semibold opacity-80">{msg.reply_to.authorName}</p>
                            <p className="text-xs opacity-70 line-clamp-2">{msg.reply_to.text}</p>
                        </button>
                        )}

                        {isEditing ? (
                        <EditMessageForm initialText={msg.text} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
                        ) : (
                        <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                        )}

                        <div className={`text-xs mt-1 opacity-70 text-right flex items-center justify-end gap-1.5 ${isCurrentUser ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>
                            {didFail && <span className="italic text-red-400 font-semibold">{t('chat_failed')} ·</span>}
                            {isSending && <span className="italic">{t('chat_sending')}</span>}
                            {!isSending && !didFail && msg.edited_timestamp && <span className="italic">{t('chat_edited')} ·</span>}
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isCurrentUser && isSent && <CheckIcon className="w-4 h-4 text-current" />}
                        </div>
                    </div>

                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="mt-1 flex items-center gap-1">
                            {Object.entries(msg.reactions).map(([emoji, usersValue]) => {
                                const users = usersValue as string[];
                                if (users.length === 0) return null;
                                const userReacted = users.includes(user.email);
                                const userNames = users.map(email => allUsers.find(u => u.email === email)?.name || email).join(', ');

                                return (
                                    <button 
                                        key={emoji}
                                        onClick={() => onReaction(msg.id, emoji)}
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border transition-colors shadow-sm ${
                                            userReacted 
                                                ? 'bg-indigo-100 dark:bg-indigo-500/30 border-indigo-300 dark:border-indigo-500/50' 
                                                : 'bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600/50 hover:bg-slate-100 dark:hover:bg-slate-600'
                                        }`}
                                        title={userNames}
                                    >
                                        <span className="text-xs">{emoji}</span>
                                        <span className={`text-xs font-semibold ${userReacted ? 'text-indigo-600 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-300'}`}>{users.length}</span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
                
                {(canEdit || canDelete || !isCurrentUser) && !isEditing && (
                    <div className={`
                        absolute z-10
                        bottom-full mb-1 sm:top-1/2 sm:bottom-auto sm:mb-0 sm:-translate-y-1/2
                        ${isCurrentUser ? 'right-0 sm:left-auto sm:right-[calc(100%+0.5rem)]' : 'left-0 sm:right-auto sm:left-[calc(100%+0.5rem)]'}
                    `}>
                        {reactionPickerOpenFor === msg.id && (
                          <div ref={pickerRef} className={`
                              absolute z-20 flex items-center gap-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full shadow-lg
                              bottom-full mb-1
                              ${isCurrentUser ? 'right-0 origin-bottom-right' : 'left-0 origin-bottom-left'}
                              animate-pop-in
                          `}>
                              {EMOJIS.map(emoji => (
                                  <button 
                                      key={emoji}
                                      onClick={() => handleReactionClick(msg.id, emoji)}
                                      className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-lg transform transition-transform hover:scale-125"
                                  >
                                      {emoji}
                                  </button>
                              ))}
                          </div>
                        )}
                        <div className={`
                            flex items-center gap-0.5 p-1 bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600/50 rounded-full shadow-md backdrop-blur-sm
                            opacity-0 group-hover:opacity-100 focus-within:opacity-100 transform scale-95 group-hover:scale-100 focus-within:scale-100 transition-all duration-150
                        `}>
                            <button onClick={() => setReactionPickerOpenFor(p => p === msg.id ? null : msg.id)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" title={t('chat_react')}>
                                <FaceSmileIcon className="w-4 h-4 text-slate-600 dark:text-slate-300"/>
                            </button>
                            <button onClick={() => handleStartReply(msg)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" title={t('chat_reply')}>
                                <ReplyIcon className="w-4 h-4 text-slate-600 dark:text-slate-300"/>
                            </button>
                            {canEdit && (
                                <button onClick={() => handleStartEdit(msg)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" title={t('chat_edit')}>
                                    <PencilIcon className="w-4 h-4 text-slate-600 dark:text-slate-300"/>
                                </button>
                            )}
                            {canDelete && (
                                <button onClick={() => handleDelete(msg.id)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" title={t('chat_delete')}>
                                    <TrashIcon className="w-4 h-4 text-red-500"/>
                                </button>
                            )}
                        </div>
                    </div>
                )}
              </div>
              
              {isCurrentUser && <img src={getCloudinaryUrl(msg.author.avatar, { width: 32, height: 32, radius: 'max' })} alt={msg.author.name} className="w-8 h-8 rounded-full flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      <div className="row-start-3 p-2 sm:p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/80 backdrop-blur-md">
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${replyingTo ? 'max-h-24 mb-2' : 'max-h-0'}`}>
            {replyingTo && (
                <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-md flex justify-between items-center text-sm">
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-600 dark:text-slate-300">{t('chat_replying_to', { name: replyingTo.author.name })}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{replyingTo.text}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-1 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600">
                        <XCircleIcon className="w-5 h-5 text-slate-500"/>
                    </button>
                </div>
            )}
        </div>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat_placeholder')}
            className="flex-1 modern-input"
            aria-label={t('chat_send_aria')}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-md p-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label={t('chat_send_aria')}
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

const EditMessageForm: React.FC<{initialText: string, onSave: (newText: string) => void, onCancel: () => void}> = ({ initialText, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [text, setText] = useState(initialText);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if(textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSave(text);
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className="space-y-2 text-slate-800 dark:text-slate-200">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                rows={1}
            />
            <div className="text-xs">
                {t('chat_edit_instruction', { cancel: t('chat_edit_cancel'), save: t('chat_edit_save') })}
            </div>
        </div>
    )
}

export default React.memo(ChatPage);

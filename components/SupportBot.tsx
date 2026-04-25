import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSupportBotResponse } from '../services/geminiService';
import { ChatTurn } from '../types';
import { faqData } from '../data/faq';
import ChatBubbleOvalLeftEllipsisIcon from './icons/ChatBubbleOvalLeftEllipsisIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import SendIcon from './icons/SendIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import HandThumbUpIcon from './icons/HandThumbUpIcon';
import HandThumbDownIcon from './icons/HandThumbDownIcon';
import AnimatedSendButton from './AnimatedSendButton';

import DOMPurify from 'dompurify';

const renderMessageContent = (text: string) => {
    // First safely escape any raw HTML tags the user might have typed
    const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Then apply our safe markdown-like formatting
    let html = safeText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline">$1</a>');
    
    // Final pass with DOMPurify just to be absolutely sure
    html = DOMPurify.sanitize(html);
    return { __html: html };
};

const TypingMessage: React.FC<{ text: string; onUpdate: () => void; onFinished: () => void; }> = ({ text, onUpdate, onFinished }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let currentText = '';
        let isCancelled = false;
        
        const intervalId = setInterval(() => {
            if (isCancelled) {
                clearInterval(intervalId);
                return;
            }

            currentText = text.substring(0, currentText.length + 1);
            setDisplayedText(currentText);
            onUpdate();

            if (currentText.length === text.length) {
                clearInterval(intervalId);
                onFinished();
            }
        }, 20); // Typing speed in ms

        return () => {
            isCancelled = true;
            clearInterval(intervalId);
        };
    }, [text, onUpdate, onFinished]);
    
    return <p className="text-sm" dangerouslySetInnerHTML={renderMessageContent(displayedText)} />;
};

interface Message extends ChatTurn {
    id: string;
    isTyping?: boolean;
    meta?: {
        show_categories_on_finish?: boolean;
        show_feedback_on_finish?: boolean;
    }
}

const initialGreetingText = "Hello! 👋 I'm a support bot. How can I help you with your account today? Please select a category below or type your question.";
const GREETING_CONTINUE = "Great! How can I help? Please select a category.";
const GREETING_CLARIFY = "I think your question is about the application, but I'm not sure which topic. Can you select a category below?";

const initialGreetingMessage: Message = {
    id: crypto.randomUUID(),
    role: 'model',
    text: initialGreetingText,
    isTyping: true,
    meta: {
        show_categories_on_finish: true,
    }
};

interface FaqCategory {
  category: string;
  questions: string[];
}

const faqCategories: FaqCategory[] = [
  {
    category: "Account & Login",
    questions: [
      "I forgot my password, how do I reset it?",
      "How do I create a new account?",
      "I'm not receiving the verification email.",
      "My login link expired, what do I do?",
      "Can I change my email address?",
    ],
  },
  {
    category: "Profile & Settings",
    questions: [
      "How do I change my profile picture?",
      "How do I edit my portfolio?",
      "What does 'Make Profile Private' do?",
      "How can I change the app theme?",
      "Where can I find my backup codes for 2FA?",
    ],
  },
  {
    category: "Kali & Remote",
    questions: [
        "How do I set up the Kali Linux connection?",
        "Why is my Kali connection refused?",
        "What does the 'Live Conversation' app do?",
    ],
  },
  {
    category: "Resource Hub",
    questions: [
        "What is the difference between Open Source and Premium resources?",
        "How can I suggest a new payload for the hub?",
        "Where is the technical manual for this OS?",
    ],
  },
  {
    category: "System & Desktop",
    questions: [
        "What is 'Sleep Mode'?",
        "Are my desktop icon positions saved?",
        "How do I refresh a specific application window?",
    ],
  },
  {
    category: "Portfolio & Social",
    questions: [
        "How do I reorder items in my portfolio?",
        "Can I add images to my internships or certifications?",
        "How do I highlight my achievements?",
        "How do I reply to a specific chat message?",
        "How do I react to messages with emojis?",
        "Where can I see my friend requests?",
    ],
  },
  {
    category: "General",
    questions: [
      "Is this platform free to use?",
      "How do I report a bug with the platform?",
      "Who is the administrator?",
      "Can I delete my account?",
      "How can I download my portfolio as a PDF?",
    ],
  },
  {
    category: "Contact Admin",
    questions: ["I need to speak to an administrator."]
  },
];

type FlowState = 'idle' | 'awaiting_out_of_scope_response' | 'awaiting_feedback' | 'awaiting_continue' | 'awaiting_rating' | 'contact_form';

interface SupportBotProps {
    onSendAdminMessage: (name: string, email: string, message: string) => Promise<{success: boolean}>;
}

const SupportBot: React.FC<SupportBotProps> = ({ onSendAdminMessage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [messages, setMessages] = useState<Message[]>([initialGreetingMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [flowState, setFlowState] = useState<FlowState>('idle');
    const [selectedCategory, setSelectedCategory] = useState<FaqCategory | null>(null);
    const [showFaqCategories, setShowFaqCategories] = useState(false);
    const [faqSuggestions, setFaqSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // State for the contact form
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactMessage, setContactMessage] = useState('');

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const handleTypingFinished = useCallback((messageId: string) => {
        setMessages(prevMessages => {
            const finishedMessage = prevMessages.find(m => m.id === messageId);
            if (finishedMessage?.meta?.show_categories_on_finish) {
                setShowFaqCategories(true);
            }
            if (finishedMessage?.meta?.show_feedback_on_finish) {
                setFlowState('awaiting_feedback');
            }
            return prevMessages.map(m => (m.id === messageId ? { ...m, isTyping: false } : m));
        });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, selectedCategory, flowState, faqSuggestions, scrollToBottom]);
    
    const handleToggle = () => {
        if (isOpen) {
            setIsClosing(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsClosing(false);
            }, 400); // Animation duration
        } else {
            setIsOpen(true);
        }
    };
    
    const handleClearChat = () => {
        setMessages([initialGreetingMessage]);
        setFlowState('idle');
        setSelectedCategory(null);
        setShowFaqCategories(false);
        setFaqSuggestions([]);
        setInput('');
        setIsLoading(false);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
    };

    const sendMessage = async (history: ChatTurn[]) => {
        setIsLoading(true);
        setShowFaqCategories(false);
        try {
            const botResponse = await getSupportBotResponse(history);
    
            if (botResponse.direct_response) {
                const botMessage: Message = { 
                    id: crypto.randomUUID(), 
                    role: 'model', 
                    text: botResponse.direct_response, 
                    isTyping: true,
                    meta: { show_categories_on_finish: botResponse.show_categories }
                };
                setMessages(prev => [...prev, botMessage]);
            } else if (botResponse.is_related_to_faq) {
                if (botResponse.suggested_questions && botResponse.suggested_questions.length > 0) {
                    const suggestionMessage: Message = { id: crypto.randomUUID(), role: 'model', text: "I found a few topics related to your question. Please choose one:", isTyping: true };
                    setMessages(prev => [...prev, suggestionMessage]);
                    setFaqSuggestions(botResponse.suggested_questions);
                } else {
                    const clarificationMessage: Message = { id: crypto.randomUUID(), role: 'model', text: GREETING_CLARIFY, isTyping: true, meta: { show_categories_on_finish: true } };
                    setMessages(prev => [...prev, clarificationMessage]);
                }
            } else {
                const outOfScopeMessage: Message = { id: crypto.randomUUID(), role: 'model', text: "I am the HtWtH 24/7 support system. I can help with questions about our platform. Do you need help with anything else?", isTyping: true };
                setMessages(prev => [...prev, outOfScopeMessage]);
            }

            if (botResponse.next_flow_state) {
                setFlowState(botResponse.next_flow_state);
            }
        } catch (error) {
            console.error("Support bot error:", error);
            const errorMessage: Message = { id: crypto.randomUUID(), role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later.", isTyping: true };
            setMessages(prev => [...prev, errorMessage]);
            setFlowState('idle');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;
    
        const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: trimmedInput };
        const newHistory = [...messages, userMessage];
    
        setMessages(newHistory);
        setInput('');
        setSelectedCategory(null);
        setShowFaqCategories(false);
        setFaqSuggestions([]);
    
        const allFaqEntries = Object.entries(faqData);
        const lowercasedInput = trimmedInput.toLowerCase();
        
        const matchingQuestions = allFaqEntries
            .filter(([question, answer]) => 
                question.toLowerCase().includes(lowercasedInput) || 
                answer.toLowerCase().includes(lowercasedInput)
            )
            .map(([question]) => question);
    
        if (matchingQuestions.length > 0 && flowState === 'idle') {
            const suggestionMessage: Message = { id: crypto.randomUUID(), role: 'model', text: `Here are some topics related to "${trimmedInput}":`, isTyping: true };
            setMessages(prev => [...prev, suggestionMessage]);
            setFaqSuggestions(matchingQuestions);
            return;
        }
        
        sendMessage(newHistory);
    };
    
    const handleFaqClick = (question: string) => {
        if (question === "I need to speak to an administrator.") {
            const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: question };
            const botMessage: Message = { id: crypto.randomUUID(), role: 'model', text: "Of course. Please fill out the form below to send a message to the administrator.", isTyping: true };
            setMessages(prev => [...prev, userMessage, botMessage]);
            setFlowState('contact_form');
            setSelectedCategory(null);
            setShowFaqCategories(false);
            setFaqSuggestions([]);
            return;
        }

        const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: question };
        const answer = faqData[question];
    
        if (answer) {
            const modelMessage: Message = { 
                id: crypto.randomUUID(), 
                role: 'model', 
                text: answer, 
                isTyping: true,
                meta: { show_feedback_on_finish: true }
            };
            setMessages(prev => [...prev, userMessage, modelMessage]);
        } else {
            const newHistory = [...messages, userMessage];
            setMessages(newHistory);
            sendMessage(newHistory);
        }
        
        setSelectedCategory(null);
        setShowFaqCategories(false);
        setFaqSuggestions([]);
    };

    const handleContactFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

        setIsLoading(true);
        
        const minAnimationTime = new Promise(resolve => setTimeout(resolve, 2500));
        const apiCall = onSendAdminMessage(contactName, contactEmail, contactMessage);
        
        // Wait for both minimum animation time and API call
        const [_, result] = await Promise.all([minAnimationTime, apiCall]);
        
        let confirmationMessageText: string;
        if (result.success) {
            confirmationMessageText = "Thank you! Your message has been sent. The administrator will get back to you via email if a response is needed.";
        } else {
            confirmationMessageText = "Sorry, there was an error sending your message. Please try again later.";
        }
        
        const confirmationMessage: Message = { id: crypto.randomUUID(), role: 'model', text: confirmationMessageText, isTyping: true };
        const continueMessage: Message = { id: crypto.randomUUID(), role: 'model', text: "Is there anything else I can help you with?", isTyping: true };
        setMessages(prev => [...prev, confirmationMessage, continueMessage]);
        
        // Reset form state and flow
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setFlowState('awaiting_continue');
        setIsLoading(false);
    };

    const handleOutOfScopeResponse = (wantsHelp: boolean) => {
        const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: wantsHelp ? "Yes" : "No" };
        if (wantsHelp) {
            const botMessage: Message = { id: crypto.randomUUID(), role: 'model', text: GREETING_CONTINUE, isTyping: true, meta: { show_categories_on_finish: true } };
            setMessages(prev => [...prev, userMessage, botMessage]);
            setFlowState('idle');
            setShowFaqCategories(false);
            setSelectedCategory(null);
            setFaqSuggestions([]);
        } else {
            const ratingRequestMessage: Message = { id: crypto.randomUUID(), role: 'model', text: "Thank you for your time. Was this conversation helpful?", isTyping: true };
            setMessages(prev => [...prev, userMessage, ratingRequestMessage]);
            setFlowState('awaiting_rating');
        }
    };
    
    const handleFeedback = (isUseful: boolean) => {
        const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: isUseful ? "👍 Useful" : "👎 Not useful" };
        const botGreeting = isUseful ? "Glad I could help!" : "Thanks for the feedback. I'm still learning.";
        const continueMessage: Message = { id: crypto.randomUUID(), role: 'model', text: "Do you have any other questions?", isTyping: true };
        setMessages(prev => [...prev, userMessage, { id: crypto.randomUUID(), role: 'model', text: botGreeting, isTyping: true }, continueMessage]);
        setFlowState('awaiting_continue');
    };

    const handleContinue = (wantsToContinue: boolean) => {
        const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: wantsToContinue ? "Yes" : "No" };
        if (wantsToContinue) {
            const botMessage: Message = { id: crypto.randomUUID(), role: 'model', text: GREETING_CONTINUE, isTyping: true, meta: { show_categories_on_finish: true } };
            setMessages(prev => [...prev, userMessage, botMessage]);
            setFlowState('idle');
            setShowFaqCategories(false);
            setSelectedCategory(null);
            setFaqSuggestions([]);
        } else {
            const botMessage: Message = { id: crypto.randomUUID(), role: 'model', text: "Thanks for reaching out! Have a great day. 👋", isTyping: true };
            setMessages(prev => [...prev, userMessage, botMessage]);
            setFlowState('idle');
        }
    };
    
    const handleRating = (rating: 'good' | 'bad') => {
        const thankYouMessage: Message = { id: crypto.randomUUID(), role: 'model', text: "Thanks for your feedback! If you need anything else, just ask.", isTyping: true };
        setMessages(prev => [...prev, thankYouMessage]);
        setFlowState('idle');
    };

    if (!isOpen) {
        return (
            <button
                onClick={handleToggle}
                className="fixed bottom-6 right-6 z-[9999] w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center transform transition-transform duration-200 hover:scale-110 hover:shadow-indigo-500/50"
                aria-label="Open support chat"
            >
                <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
            </button>
        );
    }
    
    const showFaqSection = showFaqCategories && flowState === 'idle';
    const isInputDisabled = isLoading || flowState !== 'idle';

    return (
        <div className={`support-bot-window fixed bottom-6 right-6 z-[9999] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 ${!isClosing ? 'animate-window-slide-up' : 'animate-slide-down-and-fade'}`}>
            <header className="flex-shrink-0 p-3 bg-slate-100 dark:bg-slate-900/50 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                       <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Support Bot</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Powered by HtWtH</p>
                    </div>
                </div>
                 <div className="flex items-center gap-1">
                    <button onClick={handleClearChat} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title="Clear chat">
                        <ArrowPathIcon className="w-5 h-5 text-slate-600 dark:text-slate-300"/>
                    </button>
                    <button onClick={handleToggle} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <ChevronDownIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>
            </header>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                    const shouldAnimate = msg.role === 'model' && msg.isTyping;
                    return (
                        <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                           <div className={`max-w-[85%] px-3 py-2 rounded-xl animate-message-in ${msg.role === 'user' ? 'user-message' : 'bot-message text-slate-800 dark:text-slate-200'}`}>
                               {shouldAnimate ? (
                                   <TypingMessage 
                                        text={msg.text} 
                                        onUpdate={scrollToBottom} 
                                        onFinished={() => handleTypingFinished(msg.id)} 
                                   />
                               ) : (
                                   <p className="text-sm" dangerouslySetInnerHTML={renderMessageContent(msg.text)}></p>
                               )}
                           </div>
                        </div>
                    );
                })}
                
                {showFaqSection && (
                    <div className="pt-2 space-y-2 animate-message-in">
                        {selectedCategory ? (
                            <>
                                <button onClick={() => setSelectedCategory(null)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">&larr; Back to Categories</button>
                                {selectedCategory.questions.map(faq => (
                                    <button key={faq} onClick={() => handleFaqClick(faq)} className="w-full text-left text-sm p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-medium">
                                        {faq}
                                    </button>
                                ))}
                            </>
                        ) : (
                            faqCategories.map(cat => (
                                <button key={cat.category} onClick={() => setSelectedCategory(cat)} className="w-full text-left text-sm p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">
                                    {cat.category}
                                </button>
                            ))
                        )}
                    </div>
                )}

                {faqSuggestions.length > 0 && flowState === 'idle' && (
                    <div className="pt-2 space-y-2 animate-message-in">
                        {faqSuggestions.map(faq => (
                            <button key={faq} onClick={() => handleFaqClick(faq)} className="w-full text-left text-sm p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-medium">
                                {faq}
                            </button>
                        ))}
                    </div>
                )}
                
                {isLoading && (
                    <div className="flex items-start gap-1">
                        <div className="bot-message px-3 py-2 rounded-xl animate-message-in">
                            <SpinnerIcon className="w-5 h-5 text-slate-500" />
                        </div>
                    </div>
                )}
                
                {flowState === 'awaiting_out_of_scope_response' && !isLoading && (
                    <div className="flex items-center justify-center gap-3 pt-2 animate-message-in">
                        <button onClick={() => handleOutOfScopeResponse(true)} className="px-4 py-1.5 text-sm font-semibold rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-green-200 dark:hover:bg-green-700 transition-colors">
                            Yes
                        </button>
                        <button onClick={() => handleOutOfScopeResponse(false)} className="px-4 py-1.5 text-sm font-semibold rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-200 dark:hover:bg-red-700 transition-colors">
                            No
                        </button>
                    </div>
                )}

                {flowState === 'awaiting_feedback' && !isLoading && (
                    <div className="flex items-center justify-center gap-3 pt-2 animate-message-in">
                        <button onClick={() => handleFeedback(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-green-200 dark:hover:bg-green-700 transition-colors">
                            <HandThumbUpIcon className="w-4 h-4" /> Useful
                        </button>
                        <button onClick={() => handleFeedback(false)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-200 dark:hover:bg-red-700 transition-colors">
                            <HandThumbDownIcon className="w-4 h-4" /> Not useful
                        </button>
                    </div>
                )}
                
                {flowState === 'awaiting_continue' && !isLoading && (
                    <div className="flex items-center justify-center gap-3 pt-2 animate-message-in">
                        <button onClick={() => handleContinue(true)} className="px-4 py-1.5 text-sm font-semibold rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-green-200 dark:hover:bg-green-700 transition-colors">
                            Yes
                        </button>
                        <button onClick={() => handleContinue(false)} className="px-4 py-1.5 text-sm font-semibold rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-200 dark:hover:bg-red-700 transition-colors">
                            No
                        </button>
                    </div>
                )}

                {flowState === 'awaiting_rating' && !isLoading && (
                    <div className="flex items-center justify-center gap-3 pt-2 animate-message-in">
                        <button onClick={() => handleRating('good')} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-green-200 dark:hover:bg-green-700 transition-colors">
                            <HandThumbUpIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button onClick={() => handleRating('bad')} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-200 dark:hover:bg-red-700 transition-colors">
                            <HandThumbDownIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-3 border-t border-slate-200 dark:border-slate-700">
                {flowState === 'contact_form' ? (
                    <form onSubmit={handleContactFormSubmit} className="space-y-3 animate-message-in">
                        <div>
                            <label className="text-xs font-medium text-slate-500">Name</label>
                            <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="modern-input modern-input-sm mt-1" required />
                        </div>
                        <div>
                             <label className="text-xs font-medium text-slate-500">Email</label>
                            <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="modern-input modern-input-sm mt-1" required />
                        </div>
                        <div>
                             <label className="text-xs font-medium text-slate-500">Message</label>
                            <textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)} className="modern-textarea mt-1" rows={3} required></textarea>
                        </div>
                        <div className="flex justify-center mt-3 w-full">
                            <AnimatedSendButton 
                                isSending={isLoading} 
                                disabled={isLoading}
                                style={{
                                    '--asb-min-width': '0px',
                                    '--asb-width': '100%', // Full width
                                    '--asb-height': '40px', // Compact height matching inputs
                                    '--asb-padding': '0 12px', 
                                    '--asb-font-size': '13px', 
                                    '--asb-icon-padding': '20px',
                                    '--asb-icon-size': '14px',
                                    '--asb-icon-scale': '1.0', // No Zoom
                                    '--asb-radius': '8px' // Match chat input radius
                                } as React.CSSProperties}
                                className="w-full"
                            />
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 modern-input !py-2"
                            disabled={isInputDisabled}
                        />
                        <button type="submit" disabled={!input.trim() || isInputDisabled} className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-indigo-600 text-white rounded-lg disabled:opacity-50 transition">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                )}
            </footer>
        </div>
    );
};

export default SupportBot;

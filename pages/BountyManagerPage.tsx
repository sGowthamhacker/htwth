import React, { useState, useEffect } from 'react';
import { User, Bounty, BountyComment } from '../types';
import { Plus, X, Search } from 'lucide-react';
import { getBounties, addBounty, deleteBountyDb, updateBounty } from '../services/database';

interface BountyManagerPageProps {
    user: User;
}

const BountyManagerPage: React.FC<BountyManagerPageProps> = ({ user }) => {
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
    const [commentText, setCommentText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [summary, setSummary] = useState('');
    const [image, setImage] = useState('');
    const [message, setMessage] = useState('');
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadBounties();
    }, []);

    const loadBounties = async () => {
        setIsLoading(true);
        try {
            const result = await getBounties();
            if (result) {
                const uniqueBounties = (result as Bounty[]).filter(
                    (b, index, self) => self.findIndex(ub => ub.id === b.id) === index
                );
                uniqueBounties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setBounties(uniqueBounties);
            }
        } catch (e) {
            console.error('Failed to load bounties', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const newBounty = {
                title,
                company,
                summary,
                image,
                message,
                createdAt: new Date(reportDate).toISOString(),
                likes: 0,
                isLiked: false,
                comments: []
            };
            const added = await addBounty(newBounty);
            if (added) {
                setBounties(prev => {
                    const merged = [added, ...prev];
                    const unique = merged.filter((b, index, self) => self.findIndex(ub => ub.id === b.id) === index);
                    unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    return unique;
                });
            }
            setTitle('');
            setCompany('');
            setSummary('');
            setImage('');
            setMessage('');
            setReportDate(new Date().toISOString().split('T')[0]);
            setIsAdding(false);
        } catch (error) {
            console.error('Failed to post bounty', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setBounties(bounties.filter(b => b.id !== id));
        await deleteBountyDb(id);
        if (selectedBounty && selectedBounty.id === id) {
            setSelectedBounty(null);
        }
    };

    const handleLike = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        
        const bToUpdate = bounties.find(b => b.id === id);
        if (!bToUpdate) return;
        
        const currentLikes = bToUpdate.likes || 0;
        const currentlyLiked = bToUpdate.isLiked || false;
        const newLikes = currentlyLiked ? currentLikes - 1 : currentLikes + 1;
        const newLikedState = !currentlyLiked;

        setBounties(bounties.map(b => b.id === id ? { ...b, likes: newLikes, isLiked: newLikedState } : b));
        
        if (selectedBounty && selectedBounty.id === id) {
            setSelectedBounty({ ...selectedBounty, likes: newLikes, isLiked: newLikedState });
        }
        
        await updateBounty(id, { likes: newLikes, isLiked: newLikedState });
    };

    const handleAddComment = async (e: React.FormEvent, bountyId: string) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        
        const bToUpdate = bounties.find(b => b.id === bountyId);
        if (!bToUpdate) return;
        
        const newComment: BountyComment = {
            id: Date.now().toString(),
            text: commentText,
            authorName: user.name,
            createdAt: new Date().toISOString()
        };

        const updatedComments = [...(bToUpdate.comments || []), newComment];
        
        setBounties(bounties.map(b => b.id === bountyId ? { ...b, comments: updatedComments } : b));
        
        if (selectedBounty && selectedBounty.id === bountyId) {
            setSelectedBounty({ ...selectedBounty, comments: updatedComments });
        }
        
        await updateBounty(bountyId, { comments: updatedComments });
        
        setCommentText('');
    };

    if (user.role !== 'admin') {
        return (
            <div className="p-8 text-center text-slate-500">
                You do not have permission to view this page.
            </div>
        );
    }

    const filteredBounties = bounties.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto p-4 sm:p-8">
            <div className="w-full mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bounty Manager</h1>
                        <p className="text-slate-500 dark:text-slate-400">Post and manage bounty achievements</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full sm:w-64 flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search bounties..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button 
                            onClick={() => setIsAdding(!isAdding)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                        >
                            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {isAdding ? 'Cancel' : 'Post New Bounty'}
                        </button>
                    </div>
                </div>

                {isAdding && (
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Achievement</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="modern-input" placeholder="e.g. Critical RCE Found" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                                <input type="text" required value={company} onChange={e => setCompany(e.target.value)} className="modern-input" placeholder="e.g. Google" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Report Date</label>
                                <input type="date" required value={reportDate} onChange={e => setReportDate(e.target.value)} className="modern-input" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Summary</label>
                            <input type="text" required value={summary} onChange={e => setSummary(e.target.value)} className="modern-input" placeholder="Brief summary of the bounty..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message / Comments</label>
                            <textarea required value={message} onChange={e => setMessage(e.target.value)} className="modern-textarea modern-input min-h-[100px]" placeholder="Add a short message..."></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload Image Proof</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="modern-input p-2" />
                            {image && <img src={image} alt="Preview" className="mt-2 h-32 object-contain bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-1" />}
                        </div>
                        <div className="flex justify-end pt-2">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Posting...
                                    </>
                                ) : (
                                    'Post Bounty'
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredBounties.length === 0 && !isAdding && (
                        <div className="text-center p-12 col-span-1 md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                            <p className="text-slate-500 dark:text-slate-400">No bounties found.</p>
                        </div>
                    )}
                    {filteredBounties.map(bounty => (
                        <div 
                            key={bounty.id} 
                            onClick={() => setSelectedBounty(bounty)}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col relative cursor-pointer hover:shadow-md transition-shadow group"
                        >
                            <button onClick={e => { e.stopPropagation(); handleDelete(bounty.id); }} className="absolute top-4 right-4 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 p-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded z-10 transition-all">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            {bounty.image && (
                                <div className="w-full h-48 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-2 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <img src={bounty.image} alt={bounty.title} className="w-full h-full object-contain rounded" />
                                </div>
                            )}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-500">{bounty.company}</div>
                                    <div className="text-xs text-slate-400">{new Date(bounty.createdAt).toLocaleDateString()}</div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{bounty.title}</h3>
                                <p className="text-slate-600 dark:text-slate-300 mb-4 font-medium line-clamp-2">{bounty.summary}</p>
                                
                                <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                                    <button 
                                        onClick={(e) => handleLike(e, bounty.id)}
                                        className={`flex items-center gap-1.5 transition-colors ${bounty.isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
                                    >
                                        <svg className={`w-5 h-5 ${bounty.isLiked ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                        <span className="text-sm font-medium">{bounty.likes || 0}</span>
                                    </button>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                        <span className="text-sm font-medium">{bounty.comments?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedBounty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedBounty(null)}>
                    <div 
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row transform animate-zoom-in"
                        onClick={e => e.stopPropagation()}
                    >
                        {selectedBounty.image ? (
                            <div className="md:w-1/2 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 min-h-[300px]">
                                <img src={selectedBounty.image} alt={selectedBounty.title} className="max-w-full max-h-full object-contain drop-shadow-xl" />
                            </div>
                        ) : (
                            <div className="md:w-1/2 bg-indigo-50 dark:bg-indigo-900/20 flex flex-col items-center justify-center p-12 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 min-h-[200px]">
                                <svg className="w-24 h-24 text-indigo-200 dark:text-indigo-800 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-indigo-400 font-medium">No Image Provided</span>
                            </div>
                        )}
                        <div className="md:w-1/2 md:max-w-1/2 flex flex-col max-h-[90vh] overflow-y-auto">
                            <div className="p-8 pb-4 flex-none shrink-0 border-b border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-sm font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">{selectedBounty.company}</div>
                                    <button onClick={() => setSelectedBounty(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-2 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedBounty.title}</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm font-medium">{new Date(selectedBounty.createdAt).toLocaleDateString()}</p>
                                
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Summary</h4>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{selectedBounty.summary}</p>
                                
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Researcher Notes</h4>
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
                                    <p className="text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap">{selectedBounty.message}</p>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={(e) => handleLike(e, selectedBounty.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${selectedBounty.isLiked ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                    >
                                        <svg className={`w-5 h-5 ${selectedBounty.isLiked ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                        <span className="font-semibold">{selectedBounty.likes || 0} Likes</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col p-8 pt-4 bg-slate-50/50 dark:bg-slate-900/50 min-h-[300px]">
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    Comments ({selectedBounty.comments?.length || 0})
                                </h4>
                                
                                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                                    {!selectedBounty.comments || selectedBounty.comments.length === 0 ? (
                                        <div className="text-center text-slate-500 dark:text-slate-400 py-8 italic bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">No comments yet. Be the first to congratulate!</div>
                                    ) : (
                                        selectedBounty.comments.map(c => (
                                            <div key={c.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                                <div className="flex justify-between items-center mb-1 text-sm">
                                                    <span className="font-bold text-slate-900 dark:text-white">{c.authorName}</span>
                                                    <span className="text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{c.text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                
                                <form onSubmit={(e) => handleAddComment(e, selectedBounty.id)} className="flex gap-2 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
                                    <input 
                                        type="text" 
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!commentText.trim()}
                                        className="bg-indigo-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BountyManagerPage;

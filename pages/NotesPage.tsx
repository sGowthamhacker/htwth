
import React, { useState, useEffect, useMemo } from 'react';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import { User, Note } from '../types';
import { getNotes, addNote, updateNote, deleteNote, isUsingMockData } from '../services/database';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import { useNotificationState } from '../contexts/NotificationContext';
import SearchIcon from '../components/icons/SearchIcon';

// Elegant pastel gradients for notes
const NOTE_THEMES = [
    { bg: 'bg-gradient-to-br from-[#fef3c7] to-[#fcd34d]', text: 'text-amber-900', border: 'border-amber-200/50', placeholder: 'placeholder-amber-700/50' }, // Warm Yellow
    { bg: 'bg-gradient-to-br from-[#fee2e2] to-[#fecaca]', text: 'text-red-900', border: 'border-red-200/50', placeholder: 'placeholder-red-700/50' }, // Soft Rose
    { bg: 'bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd]', text: 'text-sky-900', border: 'border-sky-200/50', placeholder: 'placeholder-sky-700/50' }, // Air Blue
    { bg: 'bg-gradient-to-br from-[#dcfce7] to-[#86efac]', text: 'text-emerald-900', border: 'border-emerald-200/50', placeholder: 'placeholder-emerald-700/50' }, // Mint
    { bg: 'bg-gradient-to-br from-[#f3e8ff] to-[#d8b4fe]', text: 'text-purple-900', border: 'border-purple-200/50', placeholder: 'placeholder-purple-700/50' }, // Lavender
    { bg: 'bg-gradient-to-br from-[#f1f5f9] to-[#cbd5e1]', text: 'text-slate-800', border: 'border-slate-200/50', placeholder: 'placeholder-slate-500' }, // Clean Slate
];

interface NotesPageProps {
    user: User;
}

const NotesPage: React.FC<NotesPageProps> = ({ user }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; noteId: string | null }>({ isOpen: false, noteId: null });
    const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
    const { addNotification } = useNotificationState();

    // Initial Fetch
    useEffect(() => {
        const fetchNotes = async () => {
            setIsLoading(true);
            try {
                const data = await getNotes(user.id);
                setNotes(data);
            } catch (error) {
                console.error("Failed to load notes:", error);
                addNotification({ title: 'Error', message: 'Could not load your notes.', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotes();
    }, [user.id, addNotification]);

    // Realtime Sync logic removed
    useEffect(() => {
        if (isUsingMockData()) return;
        // In a real Firebase app, you would use onSnapshot here.
    }, [user.id, addNotification]);

    const handleAddNote = async () => {
        const tempId = crypto.randomUUID();
        // Pick a random color index initially, or cycle through
        const colorIndex = notes.length % NOTE_THEMES.length;
        
        const newNote: Note = {
            id: tempId,
            user_id: user.id,
            content: '',
            color: colorIndex.toString(), // Storing index as string to map back to NOTE_THEMES
            created_at: new Date().toISOString(),
        };
        
        setNotes(prev => [newNote, ...prev]);

        try {
            const savedNote = await addNote({
                user_id: user.id,
                content: newNote.content,
                color: newNote.color
            });
            
            if (savedNote) {
                setNotes(prev => prev.map(n => n.id === tempId ? savedNote : n));
            }
        } catch (e) {
            console.error("Failed to add note", e);
            setNotes(prev => prev.filter(n => n.id !== tempId));
            addNotification({ title: 'Error', message: 'Could not save note. Please try again.', type: 'error' });
        }
    };

    const handleUpdateNoteContent = async (id: string, newContent: string) => {
        setNotes(prev => prev.map(note => (note.id === id ? { ...note, content: newContent } : note)));
        updateNote(id, newContent).catch(err => console.error("Failed to update note", err));
    };
    
    const handleDeleteNote = (noteId: string) => {
        setDeleteModalState({ isOpen: true, noteId });
    };

    const confirmDeleteNote = async () => {
        if (deleteModalState.noteId) {
            const id = deleteModalState.noteId;
            const originalNotes = [...notes];
            setNotes(prev => prev.filter(note => note.id !== id));
            try {
                await deleteNote(id);
            } catch (e) {
                console.error("Failed to delete note", e);
                setNotes(originalNotes);
                addNotification({ title: 'Error', message: 'Could not delete note.', type: 'error' });
            }
        }
        setDeleteModalState({ isOpen: false, noteId: null });
    };

    const filteredNotes = useMemo(() => {
        return notes.filter(n => n.content.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [notes, searchQuery]);

    const getTheme = (colorStr: string) => {
        const index = parseInt(colorStr, 10);
        // Fallback for legacy color strings (like "bg-yellow-200") or invalid indices
        if (isNaN(index) || index < 0 || index >= NOTE_THEMES.length) {
            return NOTE_THEMES[0];
        }
        return NOTE_THEMES[index];
    };

    return (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-900 flex flex-col relative overflow-hidden">
             <ConfirmationModal
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({isOpen: false, noteId: null})}
                onConfirm={confirmDeleteNote}
                title="Delete Note"
                confirmText="Delete"
            >
                <p>Are you sure you want to permanently delete this note?</p>
            </ConfirmationModal>

            {/* Elegant Header */}
            <header className="sticky top-0 z-30 px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
                 <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-3">
                         <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">My Notes</h1>
                         <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                             {notes.length}
                         </span>
                         {isRealtimeConnected && (
                             <span className="relative flex h-2 w-2">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                             </span>
                         )}
                     </div>

                     <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial group">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search notes..." 
                                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-400"
                            />
                        </div>
                        <button 
                            onClick={handleAddNote} 
                            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>Create</span>
                        </button>
                     </div>
                 </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <SpinnerIcon className="w-10 h-10 text-indigo-500 animate-spin" />
                            <p className="text-sm font-medium text-slate-500">Loading your thoughts...</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredNotes.map((note) => {
                            const theme = getTheme(note.color);
                            return (
                                <div 
                                    key={note.id} 
                                    className={`group relative flex flex-col h-64 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border ${theme.border} ${theme.bg}`}
                                >
                                    <textarea
                                        value={note.content}
                                        onChange={(e) => handleUpdateNoteContent(note.id, e.target.value)}
                                        className={`flex-grow w-full bg-transparent resize-none p-5 focus:outline-none text-base leading-relaxed ${theme.text} ${theme.placeholder} font-kalam`}
                                        style={{ fontFamily: '"Kalam", cursive' }} // Explicit fallback
                                        placeholder="Type your idea here..."
                                    />
                                    <div className="px-4 py-3 flex justify-between items-center bg-white/20 backdrop-blur-sm border-t border-black/5">
                                        <span className={`text-[10px] font-semibold uppercase tracking-wider opacity-70 ${theme.text}`}>
                                            {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                        <button 
                                            onClick={() => handleDeleteNote(note.id)} 
                                            className={`p-1.5 rounded-full bg-white/40 hover:bg-red-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 ${theme.text}`}
                                            title="Delete Note"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Only show the grid Add button if there are existing notes. If empty, show full empty state below. */}
                        {notes.length > 0 && (
                            <button 
                                onClick={handleAddNote}
                                className="group flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                    <PlusIcon className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">Create new note</span>
                            </button>
                        )}
                    </div>
                )}

                {!isLoading && filteredNotes.length === 0 && notes.length > 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No notes match your search.</p>
                        <button onClick={() => setSearchQuery('')} className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Clear search</button>
                    </div>
                )}

                {!isLoading && notes.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-0">
                        <button 
                            onClick={handleAddNote}
                            className="w-24 h-24 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-fade-in hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group shadow-md"
                            aria-label="Create first note"
                        >
                            <PlusIcon className="w-10 h-10 text-indigo-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-slate-400 transition-colors" />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Your canvas is empty</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Capture ideas, lists, and reminders. Tap the icon above to start.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesPage;

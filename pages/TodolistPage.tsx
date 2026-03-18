
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';
import { User } from '../types';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TodolistPageProps {
    user: User;
}

const TodolistPage: React.FC<TodolistPageProps> = ({ user }) => {
    // Use user.id in the key to ensure isolation
    const [tasks, setTasks] = useLocalStorage<Task[]>(`todolist-app-data-${user.id}`, []);
    const [newTaskText, setNewTaskText] = useState('');

    const pendingTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
    const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);

    const progress = useMemo(() => {
        if (tasks.length === 0) return 0;
        return (completedTasks.length / tasks.length) * 100;
    }, [tasks, completedTasks]);
    
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        const newTask: Task = {
            id: crypto.randomUUID(),
            text: newTaskText.trim(),
            completed: false,
        };
        setTasks([...tasks, newTask]);
        setNewTaskText('');
    };
    
    const toggleTask = (id: string) => {
        setTasks(tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task)));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const clearCompleted = () => {
        setTasks(tasks.filter(task => !task.completed));
    };

    return (
        <div className="h-full w-full bg-slate-100 dark:bg-slate-900 flex flex-col">
            <header className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">My To-Do List</h1>
                <div className="flex items-center gap-4">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{Math.round(progress)}%</span>
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <form onSubmit={handleAddTask} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Add a new task..."
                        className="modern-input flex-1"
                    />
                    <button type="submit" disabled={!newTaskText.trim()} className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </form>

                <section>
                    <h2 className="font-semibold text-slate-600 dark:text-slate-300 mb-2">To-Do ({pendingTasks.length})</h2>
                    <ul className="space-y-2">
                        {pendingTasks.map(task => (
                             <li key={task.id} className="todolist-item flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                                 <label className="todolist-checkbox-wrapper">
                                     <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="sr-only" />
                                     <div className="todolist-checkbox">
                                         <svg viewBox="0 0 24 24"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
                                     </div>
                                 </label>
                                 <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">{task.text}</span>
                                 <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                     <TrashIcon className="w-4 h-4" />
                                 </button>
                             </li>
                        ))}
                         {pendingTasks.length === 0 && tasks.length > 0 && (
                            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Nothing to do. Enjoy your day!</p>
                        )}
                    </ul>
                </section>
                
                 {completedTasks.length > 0 && (
                    <section>
                         <div className="flex justify-between items-center mb-2">
                            <h2 className="font-semibold text-slate-600 dark:text-slate-300">Completed ({completedTasks.length})</h2>
                            <button onClick={clearCompleted} className="text-xs font-semibold text-red-500 dark:text-red-400 hover:underline">Clear All</button>
                        </div>
                        <ul className="space-y-2">
                            {completedTasks.map(task => (
                                <li key={task.id} className="todolist-item completed flex items-center gap-3 bg-white/70 dark:bg-slate-800/70 p-3 rounded-lg">
                                    <label className="todolist-checkbox-wrapper">
                                        <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="sr-only" />
                                        <div className="todolist-checkbox">
                                            <svg viewBox="0 0 24 24"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
                                        </div>
                                    </label>
                                    <span className="flex-1 text-sm text-slate-400 dark:text-slate-500 line-through">{task.text}</span>
                                    <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                 {tasks.length === 0 && (
                    <div className="text-center py-10">
                        <svg className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto" viewBox="0 0 24 24" fill="currentColor"><path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M10,17H5v-2h5V17z M10,13H5v-2h5V13z M10,9H5V7h5V9z M14.8,17.5L12,14l-1.5,1.5L9,14l-2.1,2.1C6.6,16.4,6.3,16,6,16v-1.5c0.3,0,0.6-0.1,0.9-0.4L9,12l1.5,1.5L12,12l2.1,2.1c0.3,0.3,0.6,0.4,0.9,0.4V16C14.7,16,14.4,16.4,14.8,17.5z M19,17h-3v-2h3V17z M19,13h-3v-2h3V13z M19,9h-3V7h3V9z"/></svg>
                        <h2 className="mt-4 text-xl font-semibold text-slate-600 dark:text-slate-300">Start your day</h2>
                        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Add your first task to get started.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TodolistPage;

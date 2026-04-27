import React, { useState } from 'react';
import api from "@/lib/axiosInstance";



// Initial Mock Tasks (Empty to allow manual entry)
const INITIAL_TASKS: { id: string, title: string, assignedTo: string, colleagueEmail: string }[] = [];

interface HandoverChecklistProps {
    className?: string;
    onComplete?: () => void;
    employeeName?: string;
}

export function HandoverChecklist({ className = "", onComplete, employeeName = "Employee" }: HandoverChecklistProps) {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Check if all tasks have been assigned with both name and email
    const isAllAssigned = tasks.length > 0 && tasks.every(t => t.assignedTo !== '' && t.colleagueEmail !== '');

    const handleAssignColleague = (taskId: string, name: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedTo: name } : t));
    };

    const handleAssignEmail = (taskId: string, email: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, colleagueEmail: email } : t));
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const newTask = {
            id: `task-new-${Date.now()}`,
            title: newTaskTitle.trim(),
            assignedTo: '',
            colleagueEmail: ''
        };

        setTasks(prev => [...prev, newTask]);
        setNewTaskTitle('');
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const handleSubmitHandover = async () => {
        if (!isAllAssigned) return;
        
        setIsSubmitting(true);
        try {
            await api.post("/api/v1/notifications/handover", {
                employeeName: employeeName,
                tasks: tasks.map(t => ({
                    taskTitle: t.title,
                    colleagueName: t.assignedTo,
                    colleagueEmail: t.colleagueEmail
                }))
            });

            setIsSuccess(true);
            if (onComplete) onComplete();
        } catch (err) {
            console.error("Handover error:", err);
            alert("Failed to notify colleagues. Please try again.");
        } finally {
            setIsSubmitting(true); // Keep it submitting to show success state? No, setIsSuccess handles it.
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className={`bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-800 text-center shadow-sm ${className}`}>
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-emerald-600 dark:text-emerald-400">mark_email_read</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Handover Complete & Colleagues Notified!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    The system has successfully dispatched handover acknowledgement emails to your selected colleagues. Your leave preparations are fully complete.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">verified</span>
                    Leave Ready
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
            <div className="flex items-start gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex flex-shrink-0 items-center justify-center rounded-xl">
                    <span className="material-symbols-outlined text-2xl">assignment_ind</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart Handover Checklist</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        To ensure a smooth transition during your extended leave, please assign your active responsibilities to a colleague. They will be notified automatically via email.
                    </p>
                </div>
            </div>

            {/* List of Tasks */}
            <div className="space-y-4 mb-8">
                {tasks.map((task, index) => (
                    <div key={task.id} className="relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group transition-colors hover:border-blue-200 dark:hover:border-blue-800/50">
                        {/* Task Info */}
                        <div className="flex items-start gap-3 flex-grow">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${task.assignedTo ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                <span className="material-symbols-outlined text-[16px]">
                                    {task.assignedTo ? 'check_circle' : 'pending_actions'}
                                </span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{task.title}</h4>
                                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mt-1 inline-block">
                                    {task.id.startsWith('task-new') ? 'Added Dynamically' : 'Synced from System'}
                                </span>
                            </div>
                        </div>

                        {/* Assign Colleague Inputs */}
                        <div className="flex flex-col gap-2 sm:w-80 flex-shrink-0">
                            <div className="relative w-full">
                                <input 
                                    type="text"
                                    placeholder="Colleague Name"
                                    value={task.assignedTo}
                                    onChange={(e) => handleAssignColleague(task.id, e.target.value)}
                                    className={`w-full bg-white dark:bg-slate-900 border rounded-lg p-2 text-xs outline-none transition-colors ${task.assignedTo ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30' : 'border-slate-200 dark:border-slate-700'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-slate-300`}
                                />
                                <span className="material-symbols-outlined absolute right-3 top-2 text-slate-400 pointer-events-none text-sm">
                                    person
                                </span>
                            </div>
                            <div className="relative w-full">
                                <input 
                                    type="email"
                                    placeholder="Colleague Email"
                                    value={task.colleagueEmail}
                                    onChange={(e) => handleAssignEmail(task.id, e.target.value)}
                                    className={`w-full bg-white dark:bg-slate-900 border rounded-lg p-2 text-xs outline-none transition-colors ${task.colleagueEmail ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30' : 'border-slate-200 dark:border-slate-700'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-slate-300`}
                                />
                                <span className="material-symbols-outlined absolute right-3 top-2 text-slate-400 pointer-events-none text-sm">
                                    mail
                                </span>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            onClick={() => handleDeleteTask(task.id)}
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors self-center"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                        No active responsibilities to hand over. You can manually add some below.
                    </div>
                )}
            </div>

            {/* Add New Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-3 mb-8">
                <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="E.g., Client Alpha weekly reporting..."
                    className="flex-grow bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 sm:p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-slate-300"
                />
                <button 
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 sm:px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span className="hidden sm:inline">Add Task</span>
                </button>
            </form>

            {/* Submit Action */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    {tasks.filter(t => t.assignedTo).length} of {tasks.length} tasks assigned
                </div>
                
                <button
                    onClick={handleSubmitHandover}
                    disabled={!isAllAssigned || isSubmitting || tasks.length === 0}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                            Dispatching Emails...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[18px]">send</span>
                            Submit Handover & Notify
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

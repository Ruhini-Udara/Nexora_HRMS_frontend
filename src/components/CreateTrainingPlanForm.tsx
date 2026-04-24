"use client";

import React, { useState, useEffect } from 'react'; 
import { useRouter, useSearchParams } from 'next/navigation'; 
import axiosInstance from '@/lib/axios';

// create training plan form
export default function CreateTrainingPlanForm() {
    const [isConfirmingPublish, setIsConfirmingPublish] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [participants, setParticipants] = useState('');
    const [description, setDescription] = useState('');
    const [applyBefore, setApplyBefore] = useState('');
    const [location, setLocation] = useState('');
    const [budget, setBudget] = useState('');
    const [instructor, setInstructor] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('editId');

    // form validation logic
    const participantsNum = parseInt(participants);
    const budgetNum = parseFloat(budget);
    const isDateLogicValid = date && applyBefore ? new Date(applyBefore) < new Date(date) : true;
    const isParticipantsValid = participants.trim() !== '' && !isNaN(participantsNum) && participantsNum > 0;
    const isBudgetValid = budget === '' || (!isNaN(budgetNum) && budgetNum >= 0);

    const isFormValid = 
        title.trim() !== '' && 
        category !== '' && 
        isParticipantsValid && 
        isBudgetValid &&
        date !== '' && 
        applyBefore !== '' &&
        isDateLogicValid;

    // Fetch existing data if editing
    useEffect(() => {
        if (editId) {
            axiosInstance.get(`/training/events/${editId}`)
                .then(response => {
                    const eventToEdit = response.data;
                    if (eventToEdit) {
                        setTitle(eventToEdit.title || '');
                        setCategory(eventToEdit.category || '');
                        setDate(eventToEdit.proposedStartDate || '');
                        setTime(eventToEdit.time || '');
                        setParticipants(eventToEdit.expectedParticipants?.toString() || '');
                        setDescription(eventToEdit.description || '');
                        setApplyBefore(eventToEdit.applyBefore || '');
                        setLocation(eventToEdit.location || '');
                        setBudget(eventToEdit.budget?.toString() || '');
                        setInstructor(eventToEdit.instructor || '');
                    }
                })
                .catch(error => {
                    console.error("Failed to fetch training event", error);
                });
        }
    }, [editId]);

    // create training plan form
    return (
        <div className="p-8 max-w-5xl mx-auto w-full relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {editId ? 'Edit Training Plan' : 'Create Training Plan'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Design and schedule professional development programs for your teams.</p>
                </div>

            </div>
            <div className="space-y-8">
                {/* Basic Information */}
                <section className="bg-white dark:bg-[#1a1c23] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">info</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Training Programe Name <span className="text-red-500">*</span></label>
                            <input
                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4"
                                placeholder="e.g. Q3 Leadership Excellence Workshop"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Training Type <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select 
                                    className={`w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4 pr-10 appearance-none ${category === '' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="" disabled hidden>Choose External or Internal</option>
                                    <option value="Internal" className="text-gray-900 dark:text-white">Internal</option>
                                    <option value="External" className="text-gray-900 dark:text-white">External</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    expand_more
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Expected Participants <span className="text-red-500">*</span></label>
                            <input
                                className={`w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4 ${participants && !isParticipantsValid ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                placeholder="50"
                                type="number"
                                value={participants}
                                onChange={(e) => setParticipants(e.target.value)}
                            />
                            {participants && !isParticipantsValid && (
                                <p className="text-red-500 text-xs mt-1 font-medium">Participants must be at least 1</p>
                            )}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <textarea
                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4"
                                placeholder="Briefly describe the purpose of this training..."
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-2 gap-8">
                    {/* Schedule & Logistics */}
                    <section className="bg-white dark:bg-[#1a1c23] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">event</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Schedule &amp; Logistics</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Proposed Start Date <span className="text-red-500">*</span></label>
                                <input
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4"
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}  // disable past dates
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Proposed Time</label>
                                <input
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4"
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Apply Before (Date) <span className="text-red-500">*</span></label>
                                <input
                                    className={`w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4 ${applyBefore && date && !isDateLogicValid ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}  // disable past dates
                                    value={applyBefore}
                                    onChange={(e) => setApplyBefore(e.target.value)}
                                />
                                {applyBefore && date && !isDateLogicValid && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">Apply Before must be earlier than Start Date</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                <input
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4"
                                    placeholder="Enter location..."
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>
                    {/* Resources & Budget */}
                    <section className="bg-white dark:bg-[#1a1c23] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resources &amp; Budget</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Budget Allocation</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-xs">LKR</span>
                                    <input
                                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm ${budget && !isBudgetValid ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                        placeholder="5,000"
                                        type="number"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                    />
                                    {budget && !isBudgetValid && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">Budget cannot be negative</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Lead Instructor/Coach</label>
                                <input
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4"
                                    placeholder="External consultant or Dept Head"
                                    type="text"
                                    value={instructor}
                                    onChange={(e) => setInstructor(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>
                </div>

            </div>
            <div className="pt-8 mt-4 flex justify-end gap-4 pb-10">
                <button
                    disabled={!isFormValid || isLoading}
                    className={`px-8 py-3 rounded-xl font-bold transition-all shadow-sm ${
                        (isFormValid && !isLoading)
                        ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20' 
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                    onClick={() => setIsConfirmingPublish(true)}
                    title={!isFormValid ? "Please fill all required fields (*) before publishing" : ""}
                >
                    {editId ? 'Save Changes' : 'Publish'}
                </button>
            </div>

            {/* Confirmation Modal */}
            {isConfirmingPublish && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1a1c23] rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-2xl">campaign</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {editId ? 'Save Changes to Training Plan?' : 'Publish Training Plan?'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This will make the program visible to employees and start the enrollment process.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsConfirmingPublish(false)}
                                disabled={isLoading}
                                className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isLoading}
                                onClick={() => {
                                    setIsLoading(true);
                                    // Build payload
                                    const payload = {
                                        title: title,
                                        category: category,
                                        expectedParticipants: participantsNum,
                                        description: description || "No description provided.",
                                        proposedStartDate: date,
                                        time: time || "TBD",
                                        applyBefore: applyBefore,
                                        location: location || "TBA",
                                        budget: budgetNum || 0.0,
                                        instructor: instructor || "TBA",
                                        status: "Published"
                                    };

                                    // update training event
                                    if (editId) {
                                        axiosInstance.put(`/training/events/${editId}`, payload)
                                            .then(() => {
                                                setToast({ message: "Training plan updated successfully!", type: 'success' });
                                                setTimeout(() => {
                                                    setIsConfirmingPublish(false);
                                                    router.push('/hr/training/create-plan');
                                                }, 1500);
                                            })
                                            .catch(error => {
                                                setToast({ message: "Failed to update training plan. Please try again.", type: 'error' });
                                                console.error("Failed to update training event", error);
                                                setIsLoading(false);
                                            });
                                    } else {
                                        axiosInstance.post('/training/events', payload)
                                            .then(() => {
                                                setToast({ message: "Training plan published successfully!", type: 'success' });
                                                setTimeout(() => {
                                                    setIsConfirmingPublish(false);
                                                    router.push('/hr/training/create-plan');
                                                }, 1500);
                                            })
                                            .catch(error => {
                                                setToast({ message: "Failed to publish training plan. Please try again.", type: 'error' });
                                                console.error("Failed to create training event", error);
                                                setIsLoading(false);
                                            });
                                    }
                                }}
                                className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        {editId ? 'Saving...' : 'Publishing...'}
                                    </>
                                ) : (
                                    editId ? 'Yes, Save Changes' : 'Yes, Publish Now'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
        </div>
    );
}

import { Toast } from '@/components/ui/Toast';  

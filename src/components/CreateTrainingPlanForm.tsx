"use client";

import React, { useState } from 'react';

export default function CreateTrainingPlanForm() {
    const [isConfirmingPublish, setIsConfirmingPublish] = useState(false);

    return (
        <div className="p-8 max-w-5xl mx-auto w-full relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Create Training Plan</h1>
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
                            <input className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4" placeholder="e.g. Q3 Leadership Excellence Workshop" type="text" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Training Type <span className="text-red-500">*</span></label>
                            <select className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4 appearance-none">
                                <option>Soft Skills</option>
                                <option>Technical Training</option>
                                <option>Compliance &amp; Safety</option>
                                <option>Leadership Development</option>
                                <option>Onboarding</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Expected Participants <span className="text-red-500">*</span></label>
                            <input className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4" placeholder="50" type="number" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <textarea className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4" placeholder="Briefly describe the purpose of this training..." rows={4}></textarea>
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
                                <input className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4" type="date" min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Apply Before (Date) <span className="text-red-500">*</span></label>
                                <input className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4" type="date" min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                <input className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4" placeholder="Enter location..." type="text" />
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
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">$</span>
                                    <input className="w-full pl-8 pr-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm" placeholder="5,000" type="number" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Lead Instructor/Coach</label>
                                <input className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm py-3 px-4" placeholder="External consultant or Dept Head" type="text" />
                            </div>
                        </div>
                    </section>
                </div>

            </div>
            <div className="pt-8 mt-4 flex justify-end gap-4 pb-10">
                <button
                    className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
                    onClick={() => setIsConfirmingPublish(true)}
                >
                    Publish
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
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Publish Training Plan?</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This will make the program visible to employees and start the enrollment process.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsConfirmingPublish(false)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setIsConfirmingPublish(false);
                                    // TODO: Add actual publish logic here
                                    console.log("Publish confirmed");
                                }}
                                className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                            >
                                Yes, Publish Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

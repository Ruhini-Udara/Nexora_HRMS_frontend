import React from "react";

interface TrainingRequestPageProps {
    params: Promise<{ name: string }>;
}

export default async function TrainingRequestPage({ params }: TrainingRequestPageProps) {
    const { name } = await params;

    // Format the title: convert slug to Title Case
    const formattedTitle = name
        ? name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
        : "Training Request";

    return (
        <div className="max-w-[1400px] w-full mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">{formattedTitle}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please provide the necessary information to process your training attendance request.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                    <h2 className="font-bold text-slate-800 dark:text-white text-sm">Employee Information</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">John Doe</p>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Department</label>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sales & Marketing</p>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Employee ID</label>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">HR-8842</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
                    <h2 className="font-bold text-slate-800 dark:text-white text-sm">Application Details</h2>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Justification</label>
                            <p className="text-xs text-slate-400 mb-2">Explain how this training will benefit your current role and your professional growth at the company.</p>
                            <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm text-slate-600 dark:text-slate-300 p-3 h-32 outline-none" placeholder="I would like to attend this course because..."></textarea>
                            <p className="text-[10px] text-right text-slate-400 mt-1">0 / 1000 characters</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">attach_file</span>
                    <h2 className="font-bold text-slate-800 dark:text-white text-sm">Attachments</h2>
                </div>
                <div className="p-6">
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center min-h-[200px]">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-primary text-2xl">cloud_upload</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-400">PDF, DOC, PNG or JPG (Max. 10MB)</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pb-8">
                <button className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                </button>
                <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all">
                    Submit Application
                </button>
            </div>
        </div>
    );
}

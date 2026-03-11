"use client";

import React, { useState } from "react";

interface TrainingRequestPageProps {
    params: Promise<{ name: string }>;
}

export default function TrainingRequestPage({ params }: TrainingRequestPageProps) {
    // Note: Since this is now a client component, we unwrap params using React.use()
    const resolvedParams = React.use(params);
    const name = resolvedParams.name;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Format the title: convert slug to Title Case
    const formattedTitle = name
        ? name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
        : "Training Request";

    return (
        <div className="max-w-[1400px] w-full mx-auto space-y-8 relative">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Full Name</label>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">John Doe</p>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Department</label>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sales & Marketing</p>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Employee ID</label>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">HR-8842</p>
                        </div>
                        
                        {/* Writable Fields */}
                        <div className="lg:col-span-1 border-t border-slate-100 dark:border-slate-800 pt-6 lg:border-t-0 lg:pt-0">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">EPF Number <span className="text-red-500">*</span></label>
                            <input 
                                type="text"
                                placeholder="e.g. 12345"
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-[13px] text-slate-700 dark:text-slate-300 font-medium px-4 py-3 outline-none transition-colors border"
                            />
                        </div>
                        <div className="md:col-span-2 lg:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-6 lg:border-t-0 lg:pt-0">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Work Email <span className="text-red-500">*</span></label>
                            <input 
                                type="email"
                                placeholder="john.doe@nexora.com"
                                required
                                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                                title="Please enter a valid email address"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-[13px] text-slate-700 dark:text-slate-300 font-medium px-4 py-3 outline-none transition-colors border invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500 invalid:[&:not(:placeholder-shown):not(:focus)]:ring-red-500"
                            />
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
                    <label 
                        htmlFor="file-upload"
                        className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-colors ${
                            selectedFile || isDragging
                            ? "border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10" 
                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                        }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                setSelectedFile(e.dataTransfer.files[0]);
                            }
                        }}
                    >
                        {selectedFile ? (
                            <div className="w-full max-w-sm flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-4 truncate">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-500 shrink-0">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div className="text-left truncate">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedFile.name}</p>
                                        <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedFile(null);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                                    title="Remove file"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110">
                                    <span className="material-symbols-outlined text-primary text-2xl">
                                        {isDragging ? 'download' : 'cloud_upload'}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                                    {isDragging ? "Drop your file here" : "Click to upload or drag and drop"}
                                </p>
                                <p className="text-xs text-slate-400">PDF, DOC, PNG or JPG (Max. 10MB)</p>
                            </>
                        )}
                        <input 
                            id="file-upload" 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setSelectedFile(e.target.files[0]);
                                }
                            }}
                        />
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pb-8">
                <button className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={() => setIsConfirmingSubmit(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all">
                    Submit Application
                </button>
            </div>

            {/* Confirmation Modal */}
            {isConfirmingSubmit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-2xl">send</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Submit Request?</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your training request will be sent to your department manager for approval.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-end gap-3 mt-8">
                            <button 
                                onClick={() => setIsConfirmingSubmit(false)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setIsConfirmingSubmit(false);
                                    // TODO: Add actual submit logic here
                                    console.log("Application submitted");
                                }}
                                className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                            >
                                Confirm Submission
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

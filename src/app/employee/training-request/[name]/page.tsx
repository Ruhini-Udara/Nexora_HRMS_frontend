"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axiosInstance";
import { uploadDocument } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { formatTime, formatDateRange } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { Toast } from "@/components/ui/Toast";

interface TrainingEvent {
    id: number;
    title: string;
    trainingCode?: string;
    description: string;
    proposedStartDate?: string;
    proposedEndDate?: string;
    date?: string;
    time?: string;
    applyBefore?: string;
}

interface TrainingRequestPageProps {
    params: Promise<{ name: string }>;
}

export default function TrainingRequestPage({ params }: TrainingRequestPageProps) {
    const resolvedParams = React.use(params);
    const name = resolvedParams.name;
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventIdParam = searchParams.get('id');
    const { user } = useAuthStore();
    
    // File upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);

    // Submission flow state
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Training event data fetched from API
    const [events, setEvents] = useState<TrainingEvent[]>([]);

    // Form fields state
    const [justification, setJustification] = useState("");
    
    // Employee details state (pre-filled from logged-in user)
    const [employeeName, setEmployeeName] = useState("");
    const [epfNumber, setEpfNumber] = useState("");
    const [age, setAge] = useState("");
    const [department, setDepartment] = useState("");
    const [designation, setDesignation] = useState("");
    const [workEmail, setWorkEmail] = useState("");

    // Toast notifications (success/error feedback)
    const [toast, setToast] = useState<{ 
        message: string; 
        type: 'success' | 'error' | 'info' 
    } | null>(null);

    const decodedName = name ? decodeURIComponent(name) : "";
    const formattedTitle = decodedName
        ? decodedName.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
        : "Training Request";

    // Fetch training events from backend on page load    
    useEffect(() => {
        api.get('/api/training/events')
            .then(res => setEvents(res.data))
            .catch(err => console.error("Failed to fetch events", err));
    }, []);

    // Pre-fill user details and calculate age from profile
    useEffect(() => {
        if (user) {
            setEmployeeName(user.name || "");
            setWorkEmail(user.email || "");
            setDesignation(user.designation || "");
            setEpfNumber(user.epfNumber || "");
            setDepartment(user.department || "");

            // Fetch employee profile to obtain dateOfBirth for age calculation
            const empId = user.employeeId || user.id;
            if (empId) {
                api.get(`/api/employees/${empId}`)
                    .then(res => {
                        const dob = res.data?.dateOfBirth;
                        if (dob) {
                            const birthDate = new Date(dob);
                            if (!isNaN(birthDate.getTime())) {
                                const today = new Date();
                                let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                                const m = today.getMonth() - birthDate.getMonth();
                                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                    calculatedAge--;
                                }
                                setAge(calculatedAge.toString());
                            }
                        }
                    })
                    .catch(err => {
                        console.error("Failed to fetch employee profile for age calculation", err);
                    });
            }
        }
    }, [user]);

    const eventDetails = events.find(event => {
        if (eventIdParam && !isNaN(Number(eventIdParam))) {
            return event.id === Number(eventIdParam);
        }
        const cleanEventTitle = event.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanFormattedTitle = formattedTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanEventTitle === cleanFormattedTitle || event.title.toLowerCase() === formattedTitle.toLowerCase();
    });

    // Fallback UI object if event not yet loaded
    const displayEvent = eventDetails || {
        id: -1,
        title: formattedTitle,
        description: "Loading training details...",
        date: "TBD",
        time: "TBD",
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const isRegistrationClosed = displayEvent.applyBefore && displayEvent.applyBefore !== "TBD" ? displayEvent.applyBefore < todayStr : false;

    // Submit training request:
    // 1. Upload attachment (if any)
    // 2. Build payload
    // 3. Send request to backend
    // 4. Show toast + redirect
    const handleSubmit = async () => {
        if (!eventDetails || !user || isRegistrationClosed) return;
        
        setIsSubmitting(true);
        try {
            let attachmentPath = "";
            // Upload file to Supabase storage (if user attached one)
            if (selectedFile) {
                const path = await uploadDocument(selectedFile, 'training-requests');
                if (path) {
                    attachmentPath = path;
                }
            }

            const payload = {
                eventId: eventDetails.id,
                employeeId: user.id,
                employeeName,
                epfNumber,
                age: age ? parseInt(age, 10) : null,
                department,
                designation,
                workEmail,
                justification: justification,
                attachmentPath: attachmentPath,
                dateSubmitted: new Date().toISOString().split('T')[0]
            };

            await api.post('/api/training/requests', payload);
            setToast({ message: "Application submitted successfully!", type: 'success' });
            setTimeout(() => {
                router.push('/employee/training-request');
            }, 2000);
        } catch (error) {
            console.error("Submission failed", error);
            setToast({ message: "Failed to submit application. Please try again.", type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form 
            onSubmit={(e) => {
                e.preventDefault();
                setIsConfirmingSubmit(true);  // open confirmation modal instead of direct submit
            }}
            className="max-w-[1400px] w-full mx-auto space-y-8 relative"
        >
            <div className="mb-8 block">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{formattedTitle}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please provide the necessary information to process your training attendance request.</p>
                {isRegistrationClosed && (
                    <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 rounded-xl flex items-center gap-3 text-sm font-semibold">
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                        Registration for this training program has closed because the application deadline ({displayEvent.applyBefore}) has passed.
                    </div>
                )}
            </div>

            {/* Course Details Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800 p-6 rounded-xl border border-blue-100/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <span className="material-symbols-outlined text-8xl text-blue-600 dark:text-blue-400">school</span>
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">info</span>
                        <h2 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Course Details</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Training Scope & Description</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {displayEvent.description}
                            </p>
                        </div>
                        
                        <div className="col-span-1 bg-white/60 dark:bg-slate-900/40 p-4 rounded-lg border border-white/40 dark:border-slate-700/30 backdrop-blur-sm flex flex-col justify-center space-y-3">
                            {displayEvent.trainingCode && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                        <span className="material-symbols-outlined text-[16px]">qr_code</span>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Training Code</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{displayEvent.trainingCode}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Proposed Date</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatDateRange(displayEvent.proposedStartDate || displayEvent.date, displayEvent.proposedEndDate)}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Proposed Time</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatTime(displayEvent.time)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                    <h2 className="font-bold text-slate-800 dark:text-white text-sm">Employee Information</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Employee Details Inputs */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Employee Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={employeeName}
                                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-500 dark:text-slate-400 font-medium px-4 py-3 outline-none border cursor-not-allowed"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">EPF Number <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={epfNumber}
                                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-500 dark:text-slate-400 font-medium px-4 py-3 outline-none border cursor-not-allowed"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Age</label>
                            <input
                                type="text"
                                value={age ? `${age} years` : "N/A"}
                                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-500 dark:text-slate-400 font-medium px-4 py-3 outline-none border cursor-not-allowed"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Department <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={department}
                                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-500 dark:text-slate-400 font-medium px-4 py-3 outline-none border cursor-not-allowed"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Designation <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={designation}
                                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-500 dark:text-slate-400 font-medium px-4 py-3 outline-none border cursor-not-allowed"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Work Email <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                value={workEmail}
                                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-500 dark:text-slate-400 font-medium px-4 py-3 outline-none border cursor-not-allowed"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Application Details */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">assignment</span>
                        <h2 className="font-bold text-slate-800 dark:text-white text-sm">Application Details</h2>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1 flex flex-col">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Justification <span className="text-red-500">*</span></label>
                            <textarea 
                                required 
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                className="w-full flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm text-slate-600 dark:text-slate-300 p-3 outline-none min-h-[120px] resize-none" 
                                placeholder="I would like to attend this course because..."
                                maxLength={1000}
                            ></textarea>
                            <p className="text-[10px] text-right text-slate-400 mt-1">{justification.length} / 1000 characters</p>
                        </div>
                    </div>
                </div>

                {/* Attachments */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">attach_file</span>
                        <h2 className="font-bold text-slate-800 dark:text-white text-sm">Attachments</h2>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <label
                            htmlFor="file-upload"
                            className={`border-2 border-dashed rounded-xl p-4 text-center flex flex-col items-center justify-center flex-1 cursor-pointer transition-colors ${selectedFile || isDragging
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
                                        type="button"
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
            </div>

            <div className="flex justify-end gap-3 pb-8">
                <button type="button" className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || isRegistrationClosed}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
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
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your training request will be sent to the admin for approval.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-8">
                            <button
                                type="button"
                                onClick={() => setIsConfirmingSubmit(false)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsConfirmingSubmit(false);
                                    handleSubmit();
                                }}
                                className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                            >
                                Confirm Submission
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
        </form>
    );
}

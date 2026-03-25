"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLeaveDays } from "@/hooks/useLeaveDays";
import { LeaveApprovalTracker, ApprovalStep } from "@/components/ui/LeaveApprovalTracker";
import { HandoverChecklist } from "@/components/ui/HandoverChecklist";
import Confetti from "react-confetti";

const overseasSchema = z.object({
    epfNumber: z.string().regex(/^\d{4,6}$/, "EPF must be 4-6 digits"),
    branch: z.string().min(1, "Branch is required"),
    dateOfRequest: z.string().min(1),
    employeeName: z.string().min(1, "Employee Name is required"),
    designation: z.string().min(1, "Designation is required"),
    leaveReason: z.string().min(1, "Leave Request Reason is required"),
    startDate: z.string().min(1, "Start Date is required").refine((val) => {
        const today = new Date().toISOString().split("T")[0];
        return val >= today;
    }, "Start Date cannot be in the past"),
    endDate: z.string().min(1, "End Date is required"),
    passportNumber: z.string().min(1, "Passport Number is required"),
    passportExpDate: z.string().min(1, "Passport Expiry Date is required"),
    contactNumber: z.string().regex(/^\+?[0-9\s\-]{9,15}$/, "Invalid phone format"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    specialRemark: z.string().optional(),
    acknowledgement: z.boolean().refine(val => val === true, "You must acknowledge the terms to proceed.")
}).refine((data) => {
    if (!data.startDate || !data.endDate) return true;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
}, {
    message: "End Date must be the same as or after Start Date.",
    path: ["endDate"]
}).refine((data) => {
    if (!data.endDate || !data.passportExpDate) return true;
    const end = new Date(data.endDate);
    const exp = new Date(data.passportExpDate);
    const sixMonthsFromEnd = new Date(end.setMonth(end.getMonth() + 6));
    sixMonthsFromEnd.setHours(0,0,0,0);
    exp.setHours(0,0,0,0);
    return exp >= sixMonthsFromEnd;
}, {
    message: "Passport must be valid for at least 6 months beyond travel end date.",
    path: ["passportExpDate"]
});

type OverseasFormValues = z.infer<typeof overseasSchema>;

export default function OverseasLeaveRequestPage() {
    const { register, handleSubmit, control, getValues, setValue, trigger, reset, formState: { errors } } = useForm<OverseasFormValues>({
        resolver: zodResolver(overseasSchema),
        defaultValues: {
            dateOfRequest: new Date().toISOString().split("T")[0],
        }
    });

    const [files, setFiles] = useState({
        leaveLetter: null as File | null,
        passportCopy: null as File | null,
        visaCopy: null as File | null,
        confirmationLetter: null as File | null,
        flightTickets: null as File | null,
    });

    const [status, setStatus] = useState<"editing" | "draft" | "submitted">("editing");
    const [fileError, setFileError] = useState("");

    const [trackerStep, setTrackerStep] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    
    // Smart Parser States
    const [isParsingFlight, setIsParsingFlight] = useState(false);

    useEffect(() => {
        // Run after mount to avoid setting state synchronously during render
        const timer = setTimeout(() => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }, 0);
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        
        const draft = localStorage.getItem("overseasLeaveDraft");
        if (draft) {
            try {
                reset(JSON.parse(draft));
                setTimeout(() => setStatus("draft"), 0);
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        }
    }, [reset]);

    const noOfDays = useLeaveDays(control, "startDate", "endDate").toString();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof files) => {
        setFileError("");
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                setFileError(`File is too large. Maximum size is 5MB.`);
                e.target.value = '';
                return;
            }
            if (!file.type.match(/(pdf|jpeg|jpg|png)$/i)) {
                setFileError(`File must be a PDF, JPG, or PNG.`);
                e.target.value = '';
                return;
            }
            setFiles((prev) => ({ ...prev, [fieldName]: file }));
            
            // Smart Parsing for Flight Tickets
            if (fieldName === "flightTickets") {
                setIsParsingFlight(true);
                setTimeout(() => {
                    const departDate = new Date();
                    departDate.setDate(departDate.getDate() + 14); // Next 14 days
                    
                    const returnDate = new Date(departDate);
                    returnDate.setDate(returnDate.getDate() + 28); // 4-week trip
                    
                    setValue("startDate", departDate.toISOString().split("T")[0]);
                    setValue("endDate", returnDate.toISOString().split("T")[0]);
                    
                    setIsParsingFlight(false);
                    trigger(["startDate", "endDate"]);
                }, 2500); 
            }
        }
    };

    const handleSaveDraft = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.setItem("overseasLeaveDraft", JSON.stringify(getValues()));
        setStatus("draft");
        setFileError("");
    };

    const onSubmit = (data: OverseasFormValues) => {
        setFileError("");
        if (!files.passportCopy || !files.visaCopy || !files.confirmationLetter) {
            setFileError("Passport Copy, Visa Copy, and Confirmation Letter are mandatory for submission.");
            return;
        }
        setStatus("submitted");
        setTrackerStep(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isDisabled = status === "submitted";

    const handleSubmitAnother = () => {
        reset();
        setFiles({
            leaveLetter: null,
            passportCopy: null,
            visaCopy: null,
            confirmationLetter: null,
            flightTickets: null,
        });
        setStatus("editing");
        setTrackerStep(0);
        setShowConfetti(false);
        localStorage.removeItem("overseasLeaveDraft");
    };

    // Define the approval steps for Overseas Leave (Employee -> HR User -> Admin -> Director)
    const approvalSteps: ApprovalStep[] = [
        {
            id: 'hr_review',
            label: 'HR Verification',
            description: 'Checking documents and leave balances',
            icon: 'fact_check',
            status: trackerStep > 0 ? 'completed' : trackerStep === 0 ? 'current' : 'pending',
            date: trackerStep > 0 ? new Date().toLocaleDateString() : undefined,
            approverName: trackerStep > 0 ? 'Sarah Jenkins (HR)' : undefined
        },
        {
            id: 'admin_approval',
            label: 'Admin Approval',
            description: 'Initial review by System Administrator',
            icon: 'admin_panel_settings',
            status: trackerStep > 1 ? 'completed' : trackerStep === 1 ? 'current' : 'pending',
            date: trackerStep > 1 ? new Date().toLocaleDateString() : undefined,
            approverName: trackerStep > 1 ? 'Michael Chen (Admin)' : undefined
        },
        {
            id: 'director_approval',
            label: 'Director Approval',
            description: 'Final sign-off from the Director',
            icon: 'gavel',
            status: trackerStep > 2 ? 'completed' : trackerStep === 2 ? 'current' : 'pending',
            date: trackerStep > 2 ? new Date().toLocaleDateString() : undefined,
            approverName: trackerStep > 2 ? 'Robert Williams (Director)' : undefined
        },
        {
            id: 'approved',
            label: 'Request Approved',
            description: 'Leave confirmed',
            icon: 'verified',
            status: trackerStep > 2 ? 'completed' : 'pending'
        }
    ];

    const simulateNextStep = () => {
        if (trackerStep < approvalSteps.length - 1) {
            setTrackerStep(prev => prev + 1);
            if (trackerStep === approvalSteps.length - 2) {
                // If moving to the final 'approved' step
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-8 pb-12">
            <div className="col-span-12">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        href="/employee/leave-requests"
                        className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Apply for Overseas Leave</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Please provide all necessary details and mandatory documents for your overseas travel.
                        </p>
                    </div>
                </div>

                {/* Status Banners */}
                {status === "draft" && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl border border-amber-200 dark:border-amber-800/30 flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-amber-500">save</span>
                        <div className="text-sm font-medium">
                            Your request has been saved with a <strong className="font-bold">&quot;New&quot;</strong> status. You can continue editing or submit it later.
                        </div>
                    </div>
                )}

                {status === "submitted" && (
                    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8 overflow-hidden relative">
                        {showConfetti && (
                            <div className="absolute inset-0 pointer-events-none z-50">
                                <Confetti
                                    width={windowSize.width}
                                    height={windowSize.height}
                                    recycle={false}
                                    numberOfPieces={400}
                                    gravity={0.15}
                                />
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Tracking Status</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Track the approval progress of your overseas request.</p>
                                </div>
                            </div>

                            {/* Simulation Controls (For presentation purposes only) */}
                            {trackerStep < approvalSteps.length - 1 && (
                                <button
                                    onClick={simulateNextStep}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors animate-pulse"
                                >
                                    <span className="material-symbols-outlined text-sm">fast_forward</span>
                                    Simulate Approval ({trackerStep === 0 ? 'Admin' : trackerStep === 1 ? 'Director' : 'Complete'})
                                </button>
                            )}
                            {trackerStep === approvalSteps.length - 1 && (
                                <div className="flex gap-3">
                                    <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                                        <span className="material-symbols-outlined">celebration</span>
                                        Fully Approved
                                    </div>
                                    <button
                                        onClick={handleSubmitAnother}
                                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        New Request
                                    </button>
                                </div>
                            )}
                        </div>

                        <LeaveApprovalTracker 
                            steps={approvalSteps} 
                            currentStepIndex={trackerStep}
                            className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-6 border border-slate-100 dark:border-slate-700/50 mb-8"
                        />

                        {/* Handover Checklist - Only show when fully approved */}
                        {trackerStep === approvalSteps.length - 1 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <HandoverChecklist />
                            </div>
                        )}
                    </div>
                )}

                {fileError && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-xl border border-red-200 dark:border-red-800/30 flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <div className="text-sm font-medium">{fileError}</div>
                    </div>
                )}
            </div>

            <div className="col-span-12 lg:col-span-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                        {/* 1. Employee Details Section */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                Employee Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        EPF Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={isDisabled}
                                        {...register("epfNumber")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.epfNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="e.g. 12345"
                                        type="text"
                                    />
                                    {errors.epfNumber && <p className="text-red-500 text-xs mt-1">{errors.epfNumber.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Employee Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={isDisabled}
                                        {...register("employeeName")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.employeeName ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="Full name"
                                        type="text"
                                    />
                                    {errors.employeeName && <p className="text-red-500 text-xs mt-1">{errors.employeeName.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Designation <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={isDisabled}
                                        {...register("designation")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.designation ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="Your role"
                                        type="text"
                                    />
                                    {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Branch <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={isDisabled}
                                        {...register("branch")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.branch ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="e.g. Head Office"
                                        type="text"
                                    />
                                    {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={isDisabled}
                                        {...register("contactNumber")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.contactNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="+94 77 XXXXXXX"
                                        type="text"
                                    />
                                    {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        E-mail Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={isDisabled}
                                        {...register("email")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="your.email@example.com"
                                        type="email"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                </div>
                            </div>
                        </section>

                        {/* 2. Leave & Travel Details Section */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                Leave &amp; Travel Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Leave Request Reason <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        disabled={isDisabled}
                                        {...register("leaveReason")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-3 outline-none disabled:opacity-60 ${errors.leaveReason ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="Please elaborate on your travel plans..."
                                        rows={3}
                                    />
                                    {errors.leaveReason && <p className="text-red-500 text-xs mt-1">{errors.leaveReason.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={isDisabled || isParsingFlight}
                                        {...register("startDate")}
                                        min={new Date().toISOString().split("T")[0]}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 transition-colors ${errors.startDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        type="date"
                                    />
                                    {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={isDisabled || isParsingFlight}
                                        {...register("endDate")}
                                        min={new Date().toISOString().split("T")[0]}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 transition-colors ${errors.endDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        type="date"
                                    />
                                    {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date of Request</label>
                                    <input
                                        disabled
                                        {...register("dateOfRequest")}
                                        className="w-full bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 p-2.5 outline-none cursor-not-allowed"
                                        type="date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        No. of Requesting Dates
                                    </label>
                                    <input
                                        disabled
                                        value={noOfDays}
                                        className="w-full bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 p-2.5 outline-none font-bold"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Passport Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={isDisabled}
                                        {...register("passportNumber")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.passportNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="e.g. NXXXXXXX"
                                        type="text"
                                    />
                                    {errors.passportNumber && <p className="text-red-500 text-xs mt-1">{errors.passportNumber.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Passport Expired Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={isDisabled}
                                        {...register("passportExpDate")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.passportExpDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        type="date"
                                    />
                                    {errors.passportExpDate && <p className="text-red-500 text-xs mt-1">{errors.passportExpDate.message}</p>}
                                </div>
                            </div>
                        </section>

                        {/* 3. Document Upload Section */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                Mandatory Documents
                            </h2>

                            <div className="space-y-4">
                                {/* Flight Tickets / Itinerary (Smart Parse) */}
                                <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isParsingFlight ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                                    <div className="flex gap-4 items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${isParsingFlight ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 animate-pulse' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'}`}>
                                            <span className={`material-symbols-outlined ${isParsingFlight ? 'animate-spin' : ''}`}>
                                                {isParsingFlight ? 'document_scanner' : 'airplane_ticket'}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                                Flight Tickets / Itinerary <span className="text-red-500">*</span>
                                            </h4>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1">
                                                {isParsingFlight ? (
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">Running OCR & Extracting expected dates...</span>
                                                ) : (
                                                    <span>Upload PDF to auto-fill your travel dates</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {isDisabled ? (
                                            <span className="text-xs font-semibold text-slate-400">Locked</span>
                                        ) : isParsingFlight ? (
                                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                                Processing
                                            </span>
                                        ) : (
                                            <label className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-colors text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-bold shadow-sm">
                                                {files.flightTickets ? "Change File" : "Upload File"}
                                                <input type="file" className="hidden" accept=".pdf,.jpeg,.jpg,.png" onChange={(e) => handleFileChange(e, "flightTickets")} />
                                            </label>
                                        )}
                                        {files.flightTickets && !isParsingFlight && (
                                            <div className="mt-2 text-[10px] text-orange-600 text-right truncate max-w-[150px]">{files.flightTickets.name}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Passport Copy */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <span className="material-symbols-outlined">badge</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                                Copy of Passport <span className="text-red-500">*</span>
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Please upload the primary info page.</p>
                                        </div>
                                    </div>
                                    <div>
                                        {isDisabled ? (
                                            <span className="text-xs font-semibold text-slate-400">Locked</span>
                                        ) : (
                                            <label className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-colors text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-bold shadow-sm">
                                                {files.passportCopy ? "Change File" : "Upload File"}
                                                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, "passportCopy")} />
                                            </label>
                                        )}
                                        {files.passportCopy && (
                                            <div className="mt-2 text-[10px] text-emerald-600 text-right truncate max-w-[150px]">{files.passportCopy.name}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Visa Copy */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <span className="material-symbols-outlined">airplane_ticket</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                                Visa Copy <span className="text-red-500">*</span>
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Valid visa for the destination.</p>
                                        </div>
                                    </div>
                                    <div>
                                        {isDisabled ? (
                                            <span className="text-xs font-semibold text-slate-400">Locked</span>
                                        ) : (
                                            <label className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-colors text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-bold shadow-sm">
                                                {files.visaCopy ? "Change File" : "Upload File"}
                                                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, "visaCopy")} />
                                            </label>
                                        )}
                                        {files.visaCopy && (
                                            <div className="mt-2 text-[10px] text-blue-600 text-right truncate max-w-[150px]">{files.visaCopy.name}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Confirmation Letter */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                            <span className="material-symbols-outlined">verified</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                                Overseas Org. Confirmation <span className="text-red-500">*</span>
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Letter from the overseas organization.</p>
                                        </div>
                                    </div>
                                    <div>
                                        {isDisabled ? (
                                            <span className="text-xs font-semibold text-slate-400">Locked</span>
                                        ) : (
                                            <label className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-colors text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-bold shadow-sm">
                                                {files.confirmationLetter ? "Change File" : "Upload File"}
                                                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, "confirmationLetter")} />
                                            </label>
                                        )}
                                        {files.confirmationLetter && (
                                            <div className="mt-2 text-[10px] text-purple-600 text-right truncate max-w-[150px]">
                                                {files.confirmationLetter.name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Leave Letter (Optional) */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined">description</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Leave Request Letter</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Optional written or formal request letter.</p>
                                        </div>
                                    </div>
                                    <div>
                                        {isDisabled ? (
                                            <span className="text-xs font-semibold text-slate-400">Locked</span>
                                        ) : (
                                            <label className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-colors text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-bold shadow-sm">
                                                {files.leaveLetter ? "Change File" : "Upload File"}
                                                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, "leaveLetter")} />
                                            </label>
                                        )}
                                        {files.leaveLetter && (
                                            <div className="mt-2 text-[10px] text-slate-600 text-right truncate max-w-[150px]">{files.leaveLetter.name}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Special Remark */}
                        <section>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Special Remark</label>
                            <textarea
                                disabled={isDisabled}
                                {...register("specialRemark")}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-3 outline-none disabled:opacity-60"
                                placeholder="Any additional information..."
                                rows={2}
                            />
                        </section>

                        {/* Form Actions with Acknowledgment */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="mb-6">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-0.5">
                                        <input
                                            type="checkbox"
                                            disabled={isDisabled}
                                            {...register("acknowledgement")}
                                            className={`appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all peer ${errors.acknowledgement ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                                        />
                                        <span className="material-symbols-outlined absolute text-white text-[14px] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                                            check
                                        </span>
                                    </div>
                                    <span className={`text-sm ${isDisabled ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'} transition-colors leading-snug`}>
                                        I acknowledge that all provided details and mandatory documents are accurate.
                                        I understand that <strong className="text-slate-800 dark:text-slate-200">once submitted, this overseas leave request cannot be edited</strong> or modified.
                                    </span>
                                </label>
                                {errors.acknowledgement && <p className="text-red-500 text-xs mt-2 font-medium">{errors.acknowledgement.message}</p>}
                            </div>

                            <div className="flex items-center gap-4">
                                {!isDisabled && (
                                    <>
                                        {/* Submit: must be type="submit" so form onSubmit runs */}
                                        <button
                                            className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg font-bold shadow-sm shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            type="submit"
                                        >
                                            <span className="material-symbols-outlined text-sm">send</span>
                                            Submit Request
                                        </button>

                                        <button
                                            onClick={handleSaveDraft}
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 px-8 py-2.5 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                                            type="button"
                                            disabled={isDisabled}
                                        >
                                            <span className="material-symbols-outlined text-sm">save</span>
                                            Save as Draft
                                        </button>
                                    </>
                                )}
                                <Link
                                    href="/employee/leave-requests"
                                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium px-4 transition-colors"
                                >
                                    {isDisabled ? "Back to Dashboard" : "Cancel"}
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Guidelines Card */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">gavel</span>
                        Important Guidelines
                    </h3>
                    <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex gap-3">
                            <span className="material-symbols-outlined text-[16px] text-amber-500 mt-0.5">warning</span>
                            <span>All mandatory documents must be uploaded correctly. Incorrect documents will lead to rejection.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="material-symbols-outlined text-[16px] text-blue-500 mt-0.5">schedule</span>
                            <span>Submit the application at least 14 days prior to your travel date to ensure timely processing.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="material-symbols-outlined text-[16px] text-emerald-500 mt-0.5">verified_user</span>
                            <span>
                                Save as Draft will keep your information safely until you collect all documents. Once submitted, it cannot be edited.
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLeaveDays } from "@/hooks/useLeaveDays";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import { uploadDocument } from "@/lib/supabaseClient";
import api from "@/lib/axiosInstance";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import dynamic from 'next/dynamic';

const PdfPreviewModal = dynamic(() => import('@/components/ui/PdfPreviewModal').then(mod => mod.PdfPreviewModal), { ssr: false });

const normalLeaveSchema = z.object({
    leaveTypeId: z.string().min(1, "Please select a valid leave type"),
    startDate: z.string().min(1, "Start Date is required"),
    endDate: z.string().min(1, "End Date is required"),
    reason: z.string().min(1, "Reason is required"),
    branch: z.string().min(1, "Branch is required"),
    contactNumber: z.string().min(10, "Contact Number must be valid"),
}).refine((data) => {
    if (!data.startDate || !data.endDate) return true;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
}, {
    message: "End Date must be the same as or after Start Date.",
    path: ["endDate"]
});

type NormalLeaveValues = z.infer<typeof normalLeaveSchema>;

export default function NormalLeaveRequestPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [fileError, setFileError] = useState("");
    const [documentFile, setDocumentFile] = useState<File | null>(null);

    const currentYear = new Date().getFullYear();

    const { data: leaveBalance, isLoading: balanceLoading } = useQuery({
        queryKey: ['leaveBalance', user?.id, currentYear],
        queryFn: async () => {
            const res = await api.get(`/api/v1/leave-balance/employee/${user?.id}/year/${currentYear}`);
            return res.data;
        },
        enabled: !!user?.id
    });
    
    const { data: leaveTypes = [], isLoading: typesLoading } = useQuery({
        queryKey: ['leaveTypes'],
        queryFn: async () => {
            const res = await api.get('/api/v1/leave-types');
            return res.data;
        }
    });
    const normalLeaveTypes = leaveTypes.filter((t: { id: number; leaveTypeName: string }) => 
        t.leaveTypeName !== 'Maternity Leave' && t.leaveTypeName !== 'Overseas Leave'
    );

    const [previewFile, setPreviewFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm<NormalLeaveValues>({
        resolver: zodResolver(normalLeaveSchema),
    });

    const totalDays = useLeaveDays(control, "startDate", "endDate");

    const handleFileChange = (file: File | null) => {
        setFileError("");
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setFileError(`File is too large. Maximum size is 5MB.`);
                return;
            }
            if (!file.type.match(/(pdf|jpeg|jpg|png)$/i)) {
                setFileError(`File must be a PDF, JPG, JPEG or PNG.`);
                return;
            }
            setDocumentFile(file);
        } else {
            setDocumentFile(null);
        }
    };

    // Removed hardcoded getLeaveTypeId

    const submitMutation = useMutation({
        mutationFn: async (data: NormalLeaveValues) => {
            if (!user?.id) {
                throw new Error("User session not found. Please log in again.");
            }

            setFileError("Submitting your request...");
            
            let documentUrl: string | null = null;
            if (documentFile) {
                setFileError("Uploading document...");
                documentUrl = await uploadDocument(documentFile, "normal-leave");
                if (!documentUrl) {
                    throw new Error("Failed to upload document. Please try again.");
                }
            }

            const payload = {
                employeeId: user.id,
                leaveTypeId: Number(data.leaveTypeId),
                fromDate: data.startDate,
                endDate: data.endDate,
                totalDays: Number(totalDays),
                reason: data.reason,
                branch: data.branch,
                contactNumber: data.contactNumber,
            };

            const response = await api.post("/api/v1/leaves/normal", payload);
            const savedLeave = response.data;
            const leaveId: number = savedLeave.id;

            if (documentUrl) {
                await api.post("/api/v1/documents", {
                    refId: leaveId,
                    refType: "NORMAL_LEAVE",
                    documentType: "SUPPORTING_DOC",
                    filePathUrl: documentUrl,
                    description: "Supporting Document for Normal Leave",
                });
            }

            return savedLeave;
        },
        onSuccess: () => {
            setFileError("");
            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            queryClient.invalidateQueries({ queryKey: ['leaves', user?.id] });
        },
        onError: (error: Error) => {
            console.error("Submission error:", error);
            setFileError(error.message || "Submission failed. Please try again.");
        }
    });

    const onSubmit = (data: NormalLeaveValues) => {
        submitMutation.mutate(data);
    };

    const isDisabled = isSubmitted || submitMutation.isPending;

    return (
        <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-8">
            <div className="col-span-12">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/employee/leave-requests" className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Apply for Normal Leave</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please fill out the form below to submit a normal leave request.</p>
                    </div>
                </div>

                {fileError && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30 flex items-center gap-3 mb-6 mt-4">
                        <span className="material-symbols-outlined text-blue-500">info</span>
                        <div className="text-sm font-medium">{fileError}</div>
                    </div>
                )}
            </div>

            <div className="col-span-12 lg:col-span-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                    {isSubmitted ? (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-lg flex items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-800/30 font-semibold mb-6">
                            <span className="material-symbols-outlined">check_circle</span>
                            Leave request submitted successfully! Pending approval.
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Leave Type</label>
                                <select
                                    {...register("leaveTypeId")}
                                    className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none ${errors.leaveTypeId ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    disabled={isDisabled || typesLoading}
                                >
                                    <option value="">{typesLoading ? "Loading..." : "Select leave type"}</option>
                                    {normalLeaveTypes.map((type: { id: number; leaveTypeName: string }) => (
                                        <option key={type.id} value={type.id}>
                                            {type.leaveTypeName}
                                        </option>
                                    ))}
                                </select>
                                {errors.leaveTypeId && <p className="text-red-500 text-xs mt-1">{errors.leaveTypeId.message}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                                    <div className="relative">
                                        <input
                                            {...register("startDate")}
                                            className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none ${errors.startDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                                            type="date"
                                            disabled={isDisabled}
                                        />
                                        {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                                    <div className="relative">
                                        <input
                                            {...register("endDate")}
                                            className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none ${errors.endDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                                            type="date"
                                            disabled={isDisabled}
                                        />
                                        {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Branch</label>
                                    <input
                                        {...register("branch")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none ${errors.branch ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        type="text"
                                        placeholder="e.g. Colombo HQ"
                                        disabled={isDisabled}
                                    />
                                    {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Contact Number</label>
                                    <input
                                        {...register("contactNumber")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none ${errors.contactNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        type="text"
                                        placeholder="+94 77 123 4567"
                                        disabled={isDisabled}
                                    />
                                    {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Total Days</label>
                                <input className="w-full bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 dark:text-slate-500 p-2.5 outline-none" disabled type="text" value={`${totalDays} Days`} />
                                <p className="text-[11px] text-slate-400 mt-1.5">Automatically calculated based on date range.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Reason</label>
                                <textarea
                                    {...register("reason")}
                                    className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-3 outline-none ${errors.reason ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Briefly describe your reason for leave..."
                                    rows={4}
                                    disabled={isDisabled}
                                />
                                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Supporting Document (Optional)</label>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    {isDisabled ? (
                                        <span className="text-xs font-semibold text-slate-400">Upload Locked</span>
                                    ) : (
                                        <FileUploadDropzone
                                            onFileAccepted={handleFileChange}
                                            currentFile={documentFile}
                                            label="Upload Document"
                                        />
                                    )}
                                    {documentFile && (
                                        <button type="button" onClick={() => setPreviewFile(documentFile)} className="mt-3 text-xs text-primary font-semibold flex items-center justify-end w-full gap-1 hover:underline">
                                            <span className="material-symbols-outlined text-[14px]">visibility</span> Preview File
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-4">
                                <button disabled={isDisabled} className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg font-bold shadow-sm shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2" type="submit">
                                    {submitMutation.isPending ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Request
                                        </>
                                    )}
                                </button>
                                <Link href="/employee/leave-requests" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium px-4">
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-800 dark:text-white">Leave Balance</h2>
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-full">{currentYear} CYCLE</span>
                    </div>
                    {balanceLoading ? (
                        <div className="space-y-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="space-y-2 animate-pulse">
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-full"></div>
                                </div>
                            ))}
                        </div>
                    ) : leaveBalance ? (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-slate-500 dark:text-slate-400 uppercase">Annual Leave</span>
                                    <span className="text-slate-900 dark:text-white font-bold text-sm">
                                        {leaveBalance.annualLeaveUsed ?? 0}/{leaveBalance.annualLeaveQuota ?? 0} <span className="text-slate-400 text-xs font-normal">Days</span>
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${leaveBalance.annualLeaveQuota ? Math.min((leaveBalance.annualLeaveUsed / leaveBalance.annualLeaveQuota) * 100, 100) : 0}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-slate-500 dark:text-slate-400 uppercase">Medical Leave</span>
                                    <span className="text-slate-900 dark:text-white font-bold text-sm">
                                        {leaveBalance.medicalLeaveUsed ?? 0}/{leaveBalance.medicalLeaveQuota ?? 0} <span className="text-slate-400 text-xs font-normal">Days</span>
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${leaveBalance.medicalLeaveQuota ? Math.min((leaveBalance.medicalLeaveUsed / leaveBalance.medicalLeaveQuota) * 100, 100) : 0}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-slate-500 dark:text-slate-400 uppercase">Casual Leave</span>
                                    <span className="text-slate-900 dark:text-white font-bold text-sm">
                                        {leaveBalance.casualLeaveUsed ?? 0}/{leaveBalance.casualLeaveQuota ?? 0} <span className="text-slate-400 text-xs font-normal">Days</span>
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${leaveBalance.casualLeaveQuota ? Math.min((leaveBalance.casualLeaveUsed / leaveBalance.casualLeaveQuota) * 100, 100) : 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-sm text-slate-400 py-4">
                            <span className="material-symbols-outlined text-2xl mb-1 block">event_busy</span>
                            No leave balance data found for this year.
                        </div>
                    )}
                    <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex gap-3 border border-amber-100 dark:border-amber-900/30">
                        <span className="material-symbols-outlined text-amber-500 text-lg">info</span>
                        <p className="text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
                            Unused leaves expire on Dec 31st.
                        </p>
                    </div>
                </div>
            </div>
            
            <PdfPreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
        </div>
    );
}

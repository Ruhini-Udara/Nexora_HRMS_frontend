"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLeaveDays } from "@/hooks/useLeaveDays";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import { uploadDocument } from "@/lib/supabaseClient";
import dynamic from 'next/dynamic';
const PdfPreviewModal = dynamic(() => import('@/components/ui/PdfPreviewModal').then(mod => mod.PdfPreviewModal), { ssr: false });
import api from "@/lib/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TEMP_AUTH } from "@/lib/authConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


import { overseasSchema } from "@/lib/validations";

type OverseasFormValues = z.infer<typeof overseasSchema>;

export default function OverseasLeaveRequestPage() {
    const { register, handleSubmit, control, getValues, reset, formState: { errors } } = useForm<OverseasFormValues>({
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

    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    
    // Preview State
    const [previewFile, setPreviewFile] = useState<File | null>(null);

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

    const handleFileChange = (file: File | null, fieldName: keyof typeof files) => {
        setFileError("");
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setFileError(`File is too large. Maximum size is 5MB.`);
                return;
            }
            if (!file.type.match(/(pdf|jpeg|jpg|png)$/i)) {
                setFileError(`File must be a PDF, JPG, or PNG.`);
                return;
            }
            setFiles((prev) => ({ ...prev, [fieldName]: file }));
        }
    };

    const handleSaveDraft = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.setItem("overseasLeaveDraft", JSON.stringify(getValues()));
        setStatus("draft");
        setFileError("");
    };

    const queryClient = useQueryClient();

    const submitMutation = useMutation({
        mutationFn: async (data: OverseasFormValues) => {
            setFileError("Uploading documents to secure storage...");

            // Upload all documents to Supabase Storage in parallel
            const [leaveLetterUrl, passportCopyUrl, visaCopyUrl, confirmationLetterUrl, flightTicketsUrl] = await Promise.all([
                files.leaveLetter ? uploadDocument(files.leaveLetter, "overseas-leave") : Promise.resolve(null),
                uploadDocument(files.passportCopy!, "overseas-leave"),
                uploadDocument(files.visaCopy!, "overseas-leave"),
                uploadDocument(files.confirmationLetter!, "overseas-leave"),
                uploadDocument(files.flightTickets!, "overseas-leave"),
            ]);

            if (!passportCopyUrl || !visaCopyUrl || !confirmationLetterUrl || !flightTicketsUrl) {
                throw new Error("One or more files failed to upload. Please check your internet connection and try again.");
            }

            setFileError("Documents uploaded! Submitting your request...");

            const payload = {
                employee: { id: TEMP_AUTH.EMPLOYEE_ID }, // Centralized temporary auth config
                leaveType: { id: 1 },
                fromDate: data.startDate,
                endDate: data.endDate,
                totalDays: Number(noOfDays),
                reason: data.leaveReason,
                passportNumber: data.passportNumber,
                passportExpDate: data.passportExpDate,
                branch: data.branch,
                contactNumber: data.contactNumber,
                email: data.email,
                specialRemark: data.specialRemark,
            };

            const response = await api.post("/api/v1/leaves/overseas", payload);
            const savedLeave = response.data;
            const leaveId: number = savedLeave.id;

            // Save each uploaded document as a row in the documents table
            const docEntries: { path: string | null; type: string; description: string }[] = [
                { path: flightTicketsUrl, type: "FLIGHT_TICKETS",       description: "Flight Tickets / Itinerary" },
                { path: passportCopyUrl, type: "PASSPORT_COPY",         description: "Passport Copy" },
                { path: visaCopyUrl,     type: "VISA_COPY",             description: "Visa Copy" },
                { path: confirmationLetterUrl, type: "CONFIRMATION_LETTER", description: "Confirmation Letter" },
                { path: leaveLetterUrl,  type: "LEAVE_LETTER",          description: "Leave Letter" },
            ];

            await Promise.all(
                docEntries
                    .filter(d => d.path !== null)
                    .map(d =>
                        api.post("/api/v1/documents", {
                            refId: leaveId,
                            refType: "OVERSEAS_LEAVE",
                            documentType: d.type,
                            filePathUrl: d.path,
                            description: d.description,
                        })
                    )
            );
            return savedLeave;
        },
        onSuccess: () => {
            setFileError("");
            setStatus("submitted");
            localStorage.removeItem("overseasLeaveDraft");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Invalidate the 'leaves' query to refresh the dashboard
            queryClient.invalidateQueries({ queryKey: ['leaves', TEMP_AUTH.EMPLOYEE_ID] });
        },
        onError: (error: Error) => {
            console.error("Submission error:", error);
            setFileError(error.message || "Submission failed. Please try again.");
        }
    });

    const onSubmit = (data: OverseasFormValues) => {
        if (!files.passportCopy || !files.visaCopy || !files.confirmationLetter || !files.flightTickets) {
            setFileError("Flight Tickets, Passport Copy, Visa Copy, and Confirmation Letter are mandatory for submission.");
            return;
        }
        submitMutation.mutate(data);
    };

    const isDisabled = status === "submitted" || submitMutation.isPending;




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
                    <Card className="mb-8 overflow-hidden relative text-center py-8">
                        <CardContent>
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl">check_circle</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Overseas Leave Submitted!</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                Your request has been successfully received. 
                                You can track the approval status on your dashboard.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link 
                                    href="/employee/leave-requests"
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">dashboard</span>
                                    Go to Dashboard
                                </Link>
                                <Button
                                    onClick={() => {
                                        reset();
                                        setStatus("editing");
                                    }}
                                    variant="outline"
                                    className="px-6 py-2.5 font-bold transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Submit New Request
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
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
                                        disabled={isDisabled}
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
                                        disabled={isDisabled}
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
                                {/* Flight Tickets / Itinerary */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                            <span className="material-symbols-outlined">airplane_ticket</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                                Flight Tickets / Itinerary <span className="text-red-500">*</span>
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload your confirmed flight booking.</p>
                                        </div>
                                    </div>
                                    <div>
                                        {isDisabled ? (
                                            <span className="text-xs font-semibold text-slate-400">Locked</span>
                                        ) : (
                                            <FileUploadDropzone 
                                                onFileAccepted={(f) => handleFileChange(f, "flightTickets")}
                                                currentFile={files.flightTickets}
                                                label="Itinerary (PDF)"
                                            />
                                        )}
                                        {files.flightTickets && (
                                            <button type="button" onClick={() => setPreviewFile(files.flightTickets)} className="mt-2 text-xs text-primary font-semibold flex items-center justify-end w-full gap-1 hover:underline">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span> Preview File
                                            </button>
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
                                            <FileUploadDropzone 
                                                onFileAccepted={(f) => handleFileChange(f, "passportCopy")}
                                                currentFile={files.passportCopy}
                                                label="Passport Copy"
                                            />
                                        )}
                                        {files.passportCopy && (
                                            <button type="button" onClick={() => setPreviewFile(files.passportCopy)} className="mt-2 text-xs text-primary font-semibold flex items-center justify-end w-full gap-1 hover:underline">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span> Preview
                                            </button>
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
                                            <FileUploadDropzone 
                                                onFileAccepted={(f) => handleFileChange(f, "visaCopy")}
                                                currentFile={files.visaCopy}
                                                label="Visa Copy"
                                            />
                                        )}
                                        {files.visaCopy && (
                                            <button type="button" onClick={() => setPreviewFile(files.visaCopy)} className="mt-2 text-xs text-primary font-semibold flex items-center justify-end w-full gap-1 hover:underline">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span> Preview
                                            </button>
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
                                            <FileUploadDropzone 
                                                onFileAccepted={(f) => handleFileChange(f, "confirmationLetter")}
                                                currentFile={files.confirmationLetter}
                                                label="Confirmation Letter"
                                            />
                                        )}
                                        {files.confirmationLetter && (
                                            <button type="button" onClick={() => setPreviewFile(files.confirmationLetter)} className="mt-2 text-xs text-primary font-semibold flex items-center justify-end w-full gap-1 hover:underline">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span> Preview
                                            </button>
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
                                            <FileUploadDropzone 
                                                onFileAccepted={(f) => handleFileChange(f, "leaveLetter")}
                                                currentFile={files.leaveLetter}
                                                label="Leave Letter"
                                            />
                                        )}
                                        {files.leaveLetter && (
                                            <button type="button" onClick={() => setPreviewFile(files.leaveLetter)} className="mt-2 text-xs text-primary font-semibold flex items-center justify-end w-full gap-1 hover:underline">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span> Preview
                                            </button>
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
                                            disabled={submitMutation.isPending}
                                        >
                                            {submitMutation.isPending ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-sm">send</span>
                                                    Submit Request
                                                </>
                                            )}
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

            <PdfPreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
        </div>
    );
}
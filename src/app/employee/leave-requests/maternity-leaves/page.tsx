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
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


import { maternitySchema } from "@/lib/validations";

type MaternityFormValues = z.infer<typeof maternitySchema>;

export default function MaternityLeaveRequestPage() {
    const { employeeId } = useAuthStore();
    const { register, handleSubmit, control, getValues, reset, formState: { errors } } = useForm<MaternityFormValues>({
        resolver: zodResolver(maternitySchema),
        defaultValues: {
            dateOfRequest: new Date().toISOString().split("T")[0],
        }
    });

    const [files, setFiles] = useState({
        medicalCertificate: null as File | null,
        leaveLetter: null as File | null,
        supportingDocument: null as File | null,
    });

    const [status, setStatus] = useState<"editing" | "draft" | "submitted">("editing");
    const [fileError, setFileError] = useState("");

    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    useEffect(() => {
        // Run after mount to avoid setting state synchronously during render
        const timer = setTimeout(() => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }, 0);
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        
        const draft = localStorage.getItem("maternityLeaveDraft");
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
        } else {
            setFiles((prev) => ({ ...prev, [fieldName]: null }));
        }
    };



    const handleSaveDraft = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.setItem("maternityLeaveDraft", JSON.stringify(getValues()));
        setFileError("");
        setStatus("draft");
    };

    const queryClient = useQueryClient();

    const submitMutation = useMutation({
        mutationFn: async (data: MaternityFormValues) => {
            setFileError("Uploading documents to secure storage...");

            // Upload all documents to Supabase Storage in parallel
            const [medicalCertificateUrl, leaveLetterUrl, supportingDocumentUrl] = await Promise.all([
                uploadDocument(files.medicalCertificate!, "maternity-leave"),
                uploadDocument(files.leaveLetter!, "maternity-leave"),
                files.supportingDocument ? uploadDocument(files.supportingDocument, "maternity-leave") : Promise.resolve(null),
            ]);

            if (!medicalCertificateUrl || !leaveLetterUrl) {
                throw new Error("One or more files failed to upload. Please check your internet connection and try again.");
            }

            setFileError("Documents uploaded! Submitting your request...");

            const payload = {
                employee: { id: employeeId }, // Temporary until User Management integration
                leaveType: { id: 2 }, // Assuming ID 2 is for Maternity Leave
                fromDate: data.startDate,
                endDate: data.endDate,
                totalDays: Number(noOfDays),
                reason: data.leaveReason,
                childNumber: data.childNumber,
                employeeType: data.employeeType,
                branch: data.branch,
                contactNumber: data.contactNumber,
                email: data.email,
                specialRemark: data.specialRemark,
            };

            const response = await api.post("/api/v1/leaves/maternity", payload);
            const savedLeave = response.data;
            const leaveId: number = savedLeave.id;

            // Save document records in the backend
            const docEntries = [
                { path: leaveLetterUrl, type: "LEAVE_LETTER", description: "Maternity Leave Request Letter" },
                { path: medicalCertificateUrl, type: "MEDICAL_CERTIFICATE", description: "Medical Certificate" },
                { path: supportingDocumentUrl, type: "SUPPORTING_DOC", description: "Supporting Document" },
            ].filter(d => d.path !== null);

            await Promise.all(
                docEntries.map(d =>
                    api.post("/api/v1/documents", {
                        refId: leaveId,
                        refType: "MATERNITY_LEAVE",
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
            localStorage.removeItem("maternityLeaveDraft");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Invalidate the 'leaves' query to refresh the dashboard
            queryClient.invalidateQueries({ queryKey: ['leaves', employeeId] });
        },
        onError: (error: Error) => {
            console.error("Maternity submission error:", error);
            setFileError(error.message || "Submission failed. Please try again.");
        }
    });

    const onSubmit = (data: MaternityFormValues) => {
        if (!files.medicalCertificate || !files.leaveLetter) {
            setFileError("Medical Certificate and Leave Letter are mandatory for submission.");
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
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Apply for Maternity Leave</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Please provide all necessary details and mandatory documents for your maternity leave.
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
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted Successfully!</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                Your maternity leave request has been received and is now being processed by the HR department. 
                                You can track the live status on your dashboard.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link 
                                    href="/employee/leave-requests"
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">dashboard</span>
                                    Go to Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        reset();
                                        setStatus("editing");
                                    }}
                                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Submit New Request
                                </button>
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

            {!isDisabled && (
                <div className="contents">
                    {/* Left Column - Form fields */}
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
                                        placeholder="Enter EPF Number"
                                        type="text"
                                    />
                                    {errors.epfNumber && <p className="text-red-500 text-xs mt-1">{errors.epfNumber.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Branch <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={isDisabled}
                                        {...register("branch")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.branch ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="Enter Branch"
                                        type="text"
                                    />
                                    {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch.message}</p>}
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Employee Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        disabled={isDisabled}
                                        {...register("employeeType")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 appearance-none ${errors.employeeType ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    >
                                        <option value="" disabled>Select Type</option>
                                        <option value="Permanent">Permanent</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Probation">Probation</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* 2. Leave Details Section */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                Leave Details
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
                                        placeholder="Please elaborate on your leave request..."
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
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.startDate ? 'border-red-500 focus:ring-red-500' : ''}`}
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
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.endDate ? 'border-red-500 focus:ring-red-500' : ''}`}
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Child Number <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        disabled={isDisabled}
                                        {...register("childNumber")}
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 appearance-none ${errors.childNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    >
                                        <option value="" disabled>Select Child Number</option>
                                        <option value="1">1st Child</option>
                                        <option value="2">2nd Child</option>
                                        <option value="3">3rd Child</option>
                                        <option value="4+">4th Child or more</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* 3. Document Upload Section */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                Documents
                            </h2>

                            <div className="space-y-4">
                                {/* Maternity Leave Request Letter */}
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined">description</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                                Maternity Leave Request Letter <span className="text-red-500">*</span>
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Please upload your formal request letter.</p>
                                        </div>
                                    </div>
                                    <div>
                                        {!isDisabled && (
                                            <FileUploadDropzone 
                                                onFileAccepted={(f) => handleFileChange(f, "leaveLetter")}
                                                currentFile={files.leaveLetter}
                                                label="Request Letter"
                                            />
                                        )}
                                        {files.leaveLetter && (
                                            <button type="button" onClick={() => setPreviewFile(files.leaveLetter)} className="mt-2 text-xs text-primary font-semibold flex items-center justify-end w-full gap-1 hover:underline">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span> Preview Letter
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Medical Certificate */}
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined">medical_information</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                                Medical Certificate <span className="text-red-500">*</span>
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Certified document from your doctor.</p>
                                        </div>
                                    </div>
                                    <div>
                                        {!isDisabled && (
                                            <FileUploadDropzone 
                                                onFileAccepted={(f) => handleFileChange(f, "medicalCertificate")}
                                                currentFile={files.medicalCertificate}
                                                label="Medical Certificate"
                                            />
                                        )}
                                        {files.medicalCertificate && (
                                            <button type="button" onClick={() => setPreviewFile(files.medicalCertificate)} className="mt-2 text-xs text-primary font-semibold flex items-center justify-end w-full gap-1 hover:underline">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span> Preview Certificate
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Any supporting document */}
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined">attach_file</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Any supporting document</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Optional additional files.</p>
                                        </div>
                                    </div>
                                    <div>
                                        {!isDisabled && (
                                            <FileUploadDropzone 
                                                onFileAccepted={(f) => handleFileChange(f, "supportingDocument")}
                                                currentFile={files.supportingDocument}
                                                label="Supporting Doc"
                                            />
                                        )}
                                        {files.supportingDocument && (
                                            <button type="button" onClick={() => setPreviewFile(files.supportingDocument)} className="mt-2 text-xs text-primary font-semibold flex items-center justify-end w-full gap-1 hover:underline">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span> Preview Doc
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
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
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
                                        I understand that <strong className="text-slate-800 dark:text-slate-200">once submitted, this maternity leave request cannot be edited</strong> or modified.
                                    </span>
                                </label>
                                {errors.acknowledgement && <p className="text-red-500 text-xs mt-2 font-medium">{errors.acknowledgement.message}</p>}
                            </div>

                            <div className="flex items-center gap-4">
                                {!isDisabled && (
                                    <>
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
                            <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">looks_one</span>
                            <span><strong>First Level:</strong> 84 Working Day leaves with full salary.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">looks_two</span>
                            <span><strong>Second Level:</strong> Another 84 Calendar Day leaves with half (1/2) salary.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">looks_3</span>
                            <span><strong>Third Level:</strong> Another 84 Calendar Day leaves without salary.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="material-symbols-outlined text-[16px] text-rose-500 mt-0.5">child_care</span>
                            <span>If returning after the First Level, you are entitled to get Half an Hour (1/2Hrs) leave for both Morning &amp; Evening until the child reaches 5 Months (with salary).</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">description</span>
                            <span>Both Maternity Leave Request Letter and Medical Certificate are mandatory for the application.</span>
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
        )}
 
            <PdfPreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
        </div>
    );
}

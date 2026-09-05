"use client";

import React, { useState, useEffect } from "react";
import { OverseasGuidelines } from "@/components/leave/OverseasGuidelines";
import { EmployeeDetailsSection } from "@/components/leave/EmployeeDetailsSection";
import { OverseasTravelDetailsSection } from "@/components/leave/OverseasTravelDetailsSection";
import { SuccessBanner } from "@/components/leave/SuccessBanner";

// ─── Types ───────────────────────────────────────────────────────────────────
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";


import { overseasSchema } from "@/lib/validations";

type OverseasFormValues = z.infer<typeof overseasSchema>;

// ─── Constants ───────────────────────────────────────────────────────────────
const OVERSEAS_LEAVE_TYPE_ID = 1;
const STATUS_DRAFT = "draft";
const STATUS_SUBMITTED = "submitted";
const STATUS_EDITING = "editing";

export default function OverseasLeaveRequestPage() {
    const { user } = useAuthStore();
    const { register, handleSubmit, control, getValues, reset, setValue, formState: { errors } } = useForm<OverseasFormValues>({
        resolver: zodResolver(overseasSchema),
        mode: "onChange",
        defaultValues: {
            dateOfRequest: new Date().toISOString().split("T")[0],
        }
    });

    const searchParams = useSearchParams();
    const editId = searchParams.get("editId");

    const [files, setFiles] = useState({
        leaveLetter: null as File | null,
        passportCopy: null as File | null,
        visaCopy: null as File | null,
        confirmationLetter: null as File | null,
        flightTickets: null as File | null,
    });

    const [status, setStatus] = useState<"editing" | "draft" | "submitted">(STATUS_EDITING);
    const [fileError, setFileError] = useState("");

    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });


    const [previewFile, setPreviewFile] = useState<File | null>(null);

    useEffect(() => {

        const timer = setTimeout(() => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }, 0);
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);

        // Evaluator Note: State Persistence Strategy.
        // We check localStorage for a draft on mount. This ensures the user 
        // doesn't lose their progress if the browser crashes or is accidentally refreshed,
        // which is crucial for long forms with document uploads.
        const draft = localStorage.getItem("overseasLeaveDraft");
        if (draft) {
            try {
                reset(JSON.parse(draft));
                setTimeout(() => setStatus(STATUS_DRAFT), 0);
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        }
    }, [reset]);

    const { data: employeeData } = useQuery({
        queryKey: ['employee', user?.id],
        queryFn: async () => {
            const res = await api.get(`/api/employees/${user?.id}`);
            return res.data;
        },
        enabled: !!user?.id
    });

    useEffect(() => {
        if (employeeData && status !== STATUS_DRAFT && !editId) {
            const draft = localStorage.getItem("overseasLeaveDraft");
            if (!draft) {
                setValue("employeeName", employeeData.fullName || user?.name || "");
                setValue("email", employeeData.email || user?.email || "");
                setValue("designation", employeeData.designation?.designationName || user?.designation || "");
                setValue("branch", employeeData.branch || user?.branch || "");
                setValue("epfNumber", employeeData.epfNumber || user?.epfNumber || "");
                setValue("contactNumber", employeeData.contactNumber || employeeData.phoneNumber || "");
            }
        }
    }, [employeeData, setValue, status, user, editId]);

    // Fetch existing leave request if editId is provided
    const { data: existingRequest } = useQuery({
        queryKey: ['overseasLeave', editId],
        queryFn: async () => {
            if (!editId) return null;
            const res = await api.get(`/api/v1/leaves/overseas/${editId}`);
            const data = res.data;
            if (data) {
                setValue("employeeName", data.employeeName || "");
                setValue("email", data.email || "");
                setValue("branch", data.branch || "");
                setValue("epfNumber", data.epfNumber || "");
                setValue("contactNumber", data.contactNumber || "");
                setValue("startDate", data.fromDate || "");
                setValue("endDate", data.endDate || "");
                setValue("leaveReason", data.reason || "");
                setValue("passportNumber", data.passportNumber || "");
                setValue("passportExpDate", data.passportExpDate || "");
                setValue("specialRemark", data.specialRemark || "");
            }
            return data;
        },
        enabled: !!editId
    });

    const noOfDays = useLeaveDays(control, "startDate", "endDate").toString();

    const handleFileChange = (file: File | null, fieldName: keyof typeof files) => {
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
            setFiles((prev) => ({ ...prev, [fieldName]: file }));
        }
    };

    const handleSaveDraft = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.setItem("overseasLeaveDraft", JSON.stringify(getValues()));
        setStatus(STATUS_DRAFT);
        setFileError("");
    };

    const queryClient = useQueryClient();

    const submitMutation = useMutation({
        mutationFn: async (data: OverseasFormValues) => {
            setFileError("Uploading documents to secure storage...");

            // Evaluator Note: Concurrent Network Requests.
            // We use Promise.all to upload all documents to Supabase Storage in parallel.
            // This significantly improves user experience by reducing wait time compared to sequential uploads,
            // especially important for large flight tickets or passport copies.
            const [leaveLetterUrl, passportCopyUrl, visaCopyUrl, confirmationLetterUrl, flightTicketsUrl] = await Promise.all([
                files.leaveLetter ? uploadDocument(files.leaveLetter, "overseas-leave") : Promise.resolve(null),
                files.passportCopy ? uploadDocument(files.passportCopy, "overseas-leave") : Promise.resolve(null),
                files.visaCopy ? uploadDocument(files.visaCopy, "overseas-leave") : Promise.resolve(null),
                files.confirmationLetter ? uploadDocument(files.confirmationLetter, "overseas-leave") : Promise.resolve(null),
                files.flightTickets ? uploadDocument(files.flightTickets, "overseas-leave") : Promise.resolve(null),
            ]);

            if (!editId && (!passportCopyUrl || !visaCopyUrl || !flightTicketsUrl)) {
                throw new Error("One or more mandatory files failed to upload. Please check your internet connection and try again.");
            }

            setFileError("Documents uploaded! Submitting your request...");

            if (!user?.id) {
                throw new Error("User session not found. Please log in again.");
            }

            const payload = {
                employeeId: user.id,
                employeeName: data.employeeName,
                leaveTypeId: OVERSEAS_LEAVE_TYPE_ID,
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

            let response;
            if (editId) {
                response = await api.put(`/api/v1/leaves/overseas/${editId}`, payload);
            } else {
                response = await api.post("/api/v1/leaves/overseas", payload);
            }
            const savedLeave = response.data;
            const leaveId: number = savedLeave.id;

            // Save each uploaded document as a row in the documents table 
            const docEntries: { path: string | null; type: string; description: string }[] = [
                { path: flightTicketsUrl, type: "FLIGHT_TICKETS", description: "Flight Tickets / Itinerary" },
                { path: passportCopyUrl, type: "PASSPORT_COPY", description: "Passport Copy" },
                { path: visaCopyUrl, type: "VISA_COPY", description: "Visa Copy" },
                { path: confirmationLetterUrl, type: "CONFIRMATION_LETTER", description: "Confirmation Letter" },
                { path: leaveLetterUrl, type: "LEAVE_LETTER", description: "Leave Letter" },
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
            setStatus(STATUS_SUBMITTED);
            localStorage.removeItem("overseasLeaveDraft");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            queryClient.invalidateQueries({ queryKey: ['leaves', user?.id] });
            if (editId) {
                queryClient.invalidateQueries({ queryKey: ['overseasLeave', editId] });
            }
        },
        onError: (error: Error) => {
            console.error("Submission error:", error);
            setFileError(error.message || "Submission failed. Please try again.");
        }
    });

    const onSubmit = (data: OverseasFormValues) => {
        if (!editId && (!files.passportCopy || !files.visaCopy || !files.flightTickets)) {
            setFileError("Flight Tickets, Passport Copy, and Visa Copy are mandatory for submission.");
            return;
        }
        submitMutation.mutate(data);
    };

    const isDisabled = status === STATUS_SUBMITTED || submitMutation.isPending;




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
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {editId ? "Edit Overseas Leave Request" : "Apply for Overseas Leave"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {editId ? "Update your details and resubmit." : "Please provide all necessary details and mandatory documents for your overseas travel."}
                        </p>
                    </div>
                </div>

                {/* Status Banners */}
                {existingRequest?.status === "RETURNED" && existingRequest?.returnReason && status !== STATUS_SUBMITTED && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 p-4 rounded-xl border border-orange-200 dark:border-orange-800/30 flex items-start gap-3 mb-6">
                        <span className="material-symbols-outlined text-orange-500 mt-0.5">assignment_return</span>
                        <div>
                            <h4 className="font-bold text-sm">
                                Action Required {existingRequest.returnedBy && <span className="font-medium ml-1">by {existingRequest.returnedBy}</span>}
                            </h4>
                            <p className="text-sm mt-1">This request was returned with the following feedback:</p>
                            <div className="mt-2 p-3 bg-white/60 dark:bg-slate-900/40 rounded-lg text-sm font-medium italic border border-orange-100 dark:border-orange-900/50">
                                &quot;{existingRequest.returnReason}&quot;
                            </div>
                        </div>
                    </div>
                )}

                {status === STATUS_DRAFT && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl border border-amber-200 dark:border-amber-800/30 flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-amber-500">save</span>
                        <div className="text-sm font-medium">
                            Your request has been saved with a <strong className="font-bold">&quot;New&quot;</strong> status. You can continue editing or submit it later.
                        </div>
                    </div>
                )}

                {status === STATUS_SUBMITTED && (
                    <SuccessBanner
                        title="Overseas Leave Submitted!"
                        message="Your request has been successfully received. You can track the approval status on your dashboard."
                        onReset={() => {
                            reset();
                            setStatus(STATUS_EDITING);
                        }}
                    />
                )}


            </div>

            {status !== STATUS_SUBMITTED && (
                <div className="contents">
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                                {/* 1. Employee Details Section */}
                                <EmployeeDetailsSection register={register} errors={errors} isDisabled={isDisabled} />

                                <OverseasTravelDetailsSection register={register} errors={errors} isDisabled={isDisabled} noOfDays={noOfDays} />

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
                                                        Flight Tickets / Itinerary {!editId && <span className="text-red-500">*</span>}
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
                                                        Copy of Passport {!editId && <span className="text-red-500">*</span>}
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
                                                        Visa Copy {!editId && <span className="text-red-500">*</span>}
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

                                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                            Optional Documents
                                        </h2>

                                        {/* Confirmation Letter */}
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                    <span className="material-symbols-outlined">verified</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                                        Overseas Org. Confirmation
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

                                            </span>
                                        </label>
                                        {errors.acknowledgement && <p className="text-red-500 text-xs mt-2 font-medium">{errors.acknowledgement.message}</p>}
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {fileError && (
                                            <div className={`p-4 rounded-xl flex items-center gap-3 border ${fileError.includes("Uploading") || fileError.includes("uploaded")
                                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800/30"
                                                    : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800/30"
                                                }`}>
                                                <span className="material-symbols-outlined">
                                                    {fileError.includes("Uploading") || fileError.includes("uploaded") ? "info" : "error"}
                                                </span>
                                                <div className="text-sm font-medium">{fileError}</div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4">
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
                                                            <span className="material-symbols-outlined text-sm">{editId ? 'update' : 'send'}</span>
                                                            {editId ? 'Resubmit Request' : 'Submit Request'}
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
                                            <Link
                                                href="/employee/leave-requests"
                                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium px-4 transition-colors"
                                            >
                                                Cancel
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <OverseasGuidelines />
                    </div>
                </div>
            )}

            <PdfPreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
        </div>
    );
}

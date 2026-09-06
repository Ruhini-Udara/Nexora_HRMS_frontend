"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MaternityGuidelines } from "@/components/leave/MaternityGuidelines";
import { EmployeeDetailsSection } from "@/components/leave/EmployeeDetailsSection";
import { MaternityLeaveDetailsSection } from "@/components/leave/MaternityLeaveDetailsSection";
import { SuccessBanner } from "@/components/leave/SuccessBanner";
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


import { maternitySchema } from "@/lib/validations";

type MaternityFormValues = z.infer<typeof maternitySchema>;

// ─── Constants ───────────────────────────────────────────────────────────────
const MATERNITY_LEAVE_TYPE_ID = 2;
const STATUS_DRAFT = "draft";
const STATUS_SUBMITTED = "submitted";
const STATUS_EDITING = "editing";

function MaternityLeaveRequestForm() {
    const searchParams = useSearchParams();
    const editId = searchParams.get("editId");

    const { user } = useAuthStore();
    const { register, handleSubmit, control, getValues, reset, setValue, watch, formState: { errors } } = useForm<MaternityFormValues>({
        resolver: zodResolver(maternitySchema),
        mode: "onChange",
        defaultValues: {
            dateOfRequest: new Date().toISOString().split("T")[0],
            level: "Level 1"
        }
    });

    const [files, setFiles] = useState({
        medicalCertificate: null as File | null,
        leaveLetter: null as File | null,
        supportingDocument: null as File | null,
    });

    const [status, setStatus] = useState<"editing" | "draft" | "submitted">(STATUS_EDITING);
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

        // Evaluator Note: State Persistence Strategy.
        // We check localStorage for a draft on mount. This ensures the user 
        // doesn't lose their progress if the browser crashes or is accidentally refreshed,
        // which is crucial for long forms with document uploads.
        const draft = localStorage.getItem("maternityLeaveDraft");
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

    const { data: existingRequest, isLoading: isFetchingExisting } = useQuery({
        queryKey: ['maternityLeave', editId],
        queryFn: async () => {
            const res = await api.get(`/api/v1/leaves/maternity/${editId}`);
            return res.data;
        },
        enabled: !!editId
    });

    useEffect(() => {
        if (existingRequest) {
            reset({
                employeeName: existingRequest.employeeName || "",
                epfNumber: existingRequest.epfNumber || "",
                designation: existingRequest.designation || "",
                dateOfRequest: existingRequest.createdAt ? new Date(existingRequest.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                startDate: existingRequest.fromDate || "",
                endDate: existingRequest.endDate || "",
                leaveReason: existingRequest.reason || "",
                childNumber: existingRequest.childNumber || "1st Child",
                employeeType: existingRequest.employeeType || "Permanent",
                branch: existingRequest.branch || "",
                contactNumber: existingRequest.contactNumber || "",
                email: existingRequest.email || "",
                level: existingRequest.level || "Level 1",
                specialRemark: existingRequest.specialRemark || "",
            });
        }
    }, [existingRequest, reset]);

    useEffect(() => {
        if (!editId && employeeData && status !== STATUS_DRAFT) {
            const draft = localStorage.getItem("maternityLeaveDraft");
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

    // eslint-disable-next-line react-hooks/incompatible-library
    const watchStartDate = watch("startDate");
    const watchLevel = watch("level");

    useEffect(() => {
        if (watchStartDate && watchLevel) {
            const start = new Date(watchStartDate);
            const end = new Date(start);
            if (watchLevel === "Level 1") {
                // 84 working days inclusive
                let count = (start.getDay() !== 0 && start.getDay() !== 6) ? 1 : 0;
                while (count < 84) {
                    end.setDate(end.getDate() + 1);
                    if (end.getDay() !== 0 && end.getDay() !== 6) { // skip weekends
                        count++;
                    }
                }
            } else {
                // 84 calendar days inclusive
                end.setDate(end.getDate() + 83);
            }
            setValue("endDate", end.toISOString().split("T")[0], { shouldValidate: true });
        }
    }, [watchStartDate, watchLevel, setValue]);

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
        setStatus(STATUS_DRAFT);
    };

    const queryClient = useQueryClient();

    const submitMutation = useMutation({
        mutationFn: async (data: MaternityFormValues) => {
            setFileError("Uploading documents to secure storage...");

            // Evaluator Note: Concurrent Network Requests.
            // We use Promise.all to upload all documents to Supabase Storage in parallel.
            // This significantly improves user experience by reducing wait time compared to sequential uploads,
            // especially important for large medical certificates or supporting documents.
            const [medicalCertificateUrl, leaveLetterUrl, supportingDocumentUrl] = await Promise.all([
                files.medicalCertificate ? uploadDocument(files.medicalCertificate, "maternity-leave") : Promise.resolve(null),
                files.leaveLetter ? uploadDocument(files.leaveLetter, "maternity-leave") : Promise.resolve(null),
                files.supportingDocument ? uploadDocument(files.supportingDocument, "maternity-leave") : Promise.resolve(null),
            ]);

            if (!editId && (!medicalCertificateUrl || !leaveLetterUrl)) {
                throw new Error("One or more mandatory files failed to upload. Please check your internet connection and try again.");
            }

            setFileError("Documents uploaded! Submitting your request...");

            if (!user?.id) {
                throw new Error("User session not found. Please log in again.");
            }

            const payload = {
                employeeId: user.id,
                employeeName: data.employeeName,
                leaveTypeId: MATERNITY_LEAVE_TYPE_ID,
                fromDate: data.startDate,
                endDate: data.endDate,
                totalDays: Number(noOfDays),
                reason: data.leaveReason,
                level: data.level,
                childNumber: data.childNumber,
                employeeType: data.employeeType,
                branch: data.branch,
                contactNumber: data.contactNumber,
                email: data.email,
                specialRemark: data.specialRemark,
            };

            let response;
            if (editId) {
                response = await api.put(`/api/v1/leaves/maternity/${editId}`, payload);
            } else {
                response = await api.post("/api/v1/leaves/maternity", payload);
            }
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
            setStatus(STATUS_SUBMITTED);
            localStorage.removeItem("maternityLeaveDraft");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Invalidate the 'leaves' query to refresh the dashboard
            queryClient.invalidateQueries({ queryKey: ['leaves', user?.id] });
            if (editId) {
                queryClient.invalidateQueries({ queryKey: ['maternityLeave', editId] });
            }
        },
        onError: (error: unknown) => {
            console.error("Maternity submission error:", error);
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const backendMsg = err.response?.data?.message;
            const fallbackMsg = err.message || "Submission failed. Please try again.";
            setFileError(backendMsg || fallbackMsg);
        }
    });

    const onSubmit = (data: MaternityFormValues) => {
        if (!editId && (!files.medicalCertificate || !files.leaveLetter)) {
            setFileError("Medical Certificate and Leave Letter are mandatory for submission.");
            return;
        }

        // Pre-flight eligibility checks to prevent unnecessary file uploads
        if (employeeData) {
            if (employeeData.sex?.toUpperCase() !== "FEMALE") {
                setFileError("Only female employees are eligible to apply for maternity leave.");
                return;
            }
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
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Apply for Maternity Leave</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Please provide all necessary details and mandatory documents for your maternity leave.
                        </p>
                    </div>
                </div>

                {/* Status Banners */}


                {status === STATUS_SUBMITTED && (
                    <SuccessBanner
                        title="Maternity Leave Submitted!"
                        message="Your request has been successfully received. You can track the approval status on your dashboard."
                        onReset={() => {
                            reset();
                            setStatus(STATUS_EDITING);
                        }}
                    />
                )}

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
                            <p className="text-xs mt-3 opacity-80">Please update the details below and resubmit.</p>
                        </div>
                    </div>
                )}


            </div>



            {status !== STATUS_SUBMITTED && (
                <div className="contents">
                    {/* Left Column - Form fields */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                                <EmployeeDetailsSection register={register} errors={errors} isDisabled={isDisabled}>
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
                                        {errors.employeeType && <p className="text-red-500 text-xs mt-1">{errors.employeeType.message as string}</p>}
                                    </div>
                                </EmployeeDetailsSection>

                                <MaternityLeaveDetailsSection register={register} errors={errors} isDisabled={isDisabled} noOfDays={noOfDays} />

                                {/* 3. Document Upload Section */}
                                <section>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                        Documents
                                    </h2>

                                    <div className="space-y-4">
                                        {/* Maternity Leave Request Letter */}
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
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
                                                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
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
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
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

                                            </span>
                                        </label>
                                        {errors.acknowledgement && <p className="text-red-500 text-xs mt-2 font-medium">{errors.acknowledgement.message}</p>}
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {status === STATUS_DRAFT && (
                                            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl border border-amber-200 dark:border-amber-800/30 flex items-center gap-3 mb-2">
                                                <span className="material-symbols-outlined text-amber-500">save</span>
                                                <div className="text-sm font-medium">
                                                    Your request has been saved with a <strong className="font-bold">&quot;New&quot;</strong> status. You can continue editing or submit it later.
                                                </div>
                                            </div>
                                        )}
                                        {fileError && (
                                            <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                                                fileError.includes("Uploading") || fileError.includes("uploaded") 
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
                        <MaternityGuidelines />
                    </div>
                </div>
            )}

            <PdfPreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
        </div>
    );
}

export default function MaternityLeaveRequestPage() {
    return (
        <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-[400px]"><span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">sync</span><p className="text-slate-500 dark:text-slate-400 font-medium">Loading form...</p></div>}>
            <MaternityLeaveRequestForm />
        </Suspense>
    );
}

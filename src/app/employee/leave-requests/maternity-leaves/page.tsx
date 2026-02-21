"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

export default function MaternityLeaveRequestPage() {
    // Form state
    const [formData, setFormData] = useState({
        epfNumber: "",
        branch: "",
        dateOfRequest: new Date().toISOString().split("T")[0],
        employeeName: "",
        employeeType: "",
        designation: "",
        leaveReason: "",
        startDate: "",
        endDate: "",
        childNumber: "",
        contactNumber: "",
        email: "",
        specialRemark: "",
    });

    // File state
    const [files, setFiles] = useState({
        medicalCertificate: null as File | null,
        leaveLetter: null as File | null,
        supportingDocument: null as File | null,
    });

    // Status state
    const [status, setStatus] = useState<"editing" | "draft" | "submitted">("editing");
    const [error, setError] = useState("");

    // Derived: number of days (inclusive)
    const noOfDays = useMemo(() => {
        if (!formData.startDate || !formData.endDate) return "0";

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "0";
        if (end < start) return "0";

        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
        return diffDays.toString();
    }, [formData.startDate, formData.endDate]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle file changes
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof files) => {
        if (e.target.files && e.target.files[0]) {
            setFiles((prev) => ({ ...prev, [fieldName]: e.target.files![0] }));
        }
    };

    // Derived disabled state
    const isDisabled = status === "submitted";

    const handleSaveDraft = (e: React.MouseEvent) => {
        e.preventDefault();
        setError("");
        setStatus("draft");
        // In a real app, make an API call here to save draft state
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Basic validation for date range
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
                setError("End Date must be the same as or after Start Date.");
                return;
            }
        }

        // Mandatory documents validation
        if (!files.medicalCertificate || !files.leaveLetter) {
            setError("Medical Certificate and Maternity Leave Request Letter are mandatory for submission.");
            return;
        }

        setStatus("submitted");
        // In a real app, make an API call here to submit the final form
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
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maternity Leave Request</h1>
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
                            Your request has been saved as a draft. You can continue editing or submit it later.
                        </div>
                    </div>
                )}
                {status === "submitted" && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/30 flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        <div className="text-sm font-medium">
                            Your maternity leave request has been submitted successfully and is pending approval. Editing is now disabled.
                        </div>
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-xl border border-red-200 dark:border-red-800/30 flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <div className="text-sm font-medium">{error}</div>
                    </div>
                )}
            </div>

            {/* Left Column - Form fields */}
            <div className="col-span-12 lg:col-span-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <form className="space-y-8" onSubmit={handleSubmit}>
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
                                        required
                                        disabled={isDisabled}
                                        name="epfNumber"
                                        value={formData.epfNumber}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60"
                                        placeholder="e.g. 12345"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Employee Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        disabled={isDisabled}
                                        name="employeeName"
                                        value={formData.employeeName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60"
                                        placeholder="Full name"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Designation <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        disabled={isDisabled}
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60"
                                        placeholder="Your role"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Branch <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        disabled={isDisabled}
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60"
                                        placeholder="e.g. Head Office"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        disabled={isDisabled}
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60"
                                        placeholder="+94 77 XXXXXXX"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        E-mail Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        disabled={isDisabled}
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60"
                                        placeholder="your.email@example.com"
                                        type="email"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Employee Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        disabled={isDisabled}
                                        name="employeeType"
                                        value={formData.employeeType}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 appearance-none"
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
                                        required
                                        disabled={isDisabled}
                                        name="leaveReason"
                                        value={formData.leaveReason}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-3 outline-none disabled:opacity-60"
                                        placeholder="Please elaborate on your leave request..."
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        disabled={isDisabled}
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60"
                                        type="date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        disabled={isDisabled}
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60"
                                        type="date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date of Request</label>
                                    <input
                                        disabled
                                        name="dateOfRequest"
                                        value={formData.dateOfRequest}
                                        className="w-full bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 p-2.5 outline-none"
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
                                        required
                                        disabled={isDisabled}
                                        name="childNumber"
                                        value={formData.childNumber}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 appearance-none"
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
                                            <label className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">upload</span>
                                                {files.leaveLetter ? "Change File" : "Upload File"}
                                                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, "leaveLetter")} />
                                            </label>
                                        )}
                                        {files.leaveLetter && (
                                            <div className="mt-2 text-[10px] text-blue-600 text-right truncate max-w-[150px]">{files.leaveLetter.name}</div>
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
                                            <label className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">upload</span>
                                                {files.medicalCertificate ? "Change File" : "Upload File"}
                                                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, "medicalCertificate")} />
                                            </label>
                                        )}
                                        {files.medicalCertificate && (
                                            <div className="mt-2 text-[10px] text-rose-600 text-right truncate max-w-[150px]">{files.medicalCertificate.name}</div>
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
                                            <label className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">upload</span>
                                                {files.supportingDocument ? "Change File" : "Upload File"}
                                                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, "supportingDocument")} />
                                            </label>
                                        )}
                                        {files.supportingDocument && (
                                            <div className="mt-2 text-[10px] text-slate-600 text-right truncate max-w-[150px]">{files.supportingDocument.name}</div>
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
                                name="specialRemark"
                                value={formData.specialRemark}
                                onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-3 outline-none disabled:opacity-60"
                                placeholder="Any additional information..."
                                rows={2}
                            />
                        </section>

                        {/* Form Actions */}
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            {!isDisabled && (
                                <>
                                    <button
                                        className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg font-bold shadow-sm shadow-primary/20 transition-all flex items-center gap-2"
                                        type="submit"
                                    >
                                        <span className="material-symbols-outlined text-sm">send</span>
                                        Submit Request
                                    </button>

                                    <button
                                        onClick={handleSaveDraft}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 px-8 py-2.5 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2"
                                        type="button"
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
    );
}

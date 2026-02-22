import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// ── Zod Validation Schema ───────────────────────────────────────────
const transferRequestSchema = z.object({
    currentLocation: z.string().min(1, 'Current location is required'),
    targetLocation: z.string().min(1, 'Target location is required'),
    expectedDate: z.string().min(1, 'Expected date is required'),
    validReason: z.string().min(1, 'A valid reason is required'),
});

type TransferRequestFormData = z.infer<typeof transferRequestSchema>;

// ── Confirmation Modal ──────────────────────────────────────────────
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmSubmitModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8B3A00]">warning</span>
                        Confirm Submission
                    </h3>
                    <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        onClick={onClose}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        After submitting, this request cannot be edited as it will be sent for higher-level approvals. Do you wish to proceed?
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-8 py-2.5 bg-[#8B3A00] text-white text-sm font-bold rounded-lg hover:opacity-90 shadow-lg shadow-[#8B3A00]/20 transition-all cursor-pointer"
                        onClick={onConfirm}
                    >
                        Yes, Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────
const TransferRequestPage = () => {
    // File upload state (outside Zod — optional field)
    const [files, setFiles] = useState<File[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dynamic data
    const userProfile = {
        name: "Alex Rivera",
        department: "SALES DEPARTMENT",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWiWK6hMgU9EsbhRab9a6-uuAZEHdFU51oj4VcZI9GSFqGldPv8K8AHfbKnSr6xf4-L7YusDLpOpaFiYoix4eqg94QjCPfMmphbyGQ0VEfXoKugqzTHETLlUWi8INPP0i-VoteXCHcq_JfN_zvnwL7DmqsryOHiRcDgExolr0wShed36OpGX4HXluVrE4r2jEXuoelA_nO7AiRAacH41E-YQZg9nuEPtr_-SoG4Y0uy7UzDmettTH2L-cmOSDRZMARhxNO4WAzpA4"
    };

    const currentDepartment = "Operations Division - Level 4";

    // ── react-hook-form + Zod ───────────────────────────────────────
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<TransferRequestFormData>({
        resolver: zodResolver(transferRequestSchema),
        defaultValues: {
            currentLocation: '',
            targetLocation: '',
            expectedDate: '',
            validReason: '',
        },
    });

    // ── File handling ───────────────────────────────────────────────
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles((prev) => [...prev, ...droppedFiles]);
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...selectedFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // ── Build payload helper ────────────────────────────────────────
    const buildPayload = (data: TransferRequestFormData, isDraft: boolean) => ({
        transfer_type: 'General Transfer Request', // hardcoded
        current_location: data.currentLocation,
        target_location: data.targetLocation,
        expected_date: data.expectedDate,
        valid_reason: data.validReason,
        proof_documents: files.map((f) => f.name),
        is_draft: isDraft,
    });

    // ── Actions ─────────────────────────────────────────────────────
    const handleSaveAsDraft = () => {
        const values = getValues();
        const payload = buildPayload(values, true);
        // TODO: Replace with actual API call
        console.log('Draft saved:', payload);
    };

    const onSubmitValid = () => {
        // Form passed Zod validation → show confirmation modal
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = () => {
        const values = getValues();
        const payload = buildPayload(values, false);
        // TODO: Replace with actual API call
        console.log('Submitted:', payload);
        setShowConfirmModal(false);
    };

    // ── Helpers ─────────────────────────────────────────────────────
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const getFileIcon = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'picture_as_pdf';
        if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return 'image';
        return 'description';
    };

    const getFileIconColor = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'bg-red-50 text-red-500';
        if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return 'bg-blue-50 text-blue-500';
        return 'bg-slate-50 text-slate-500';
    };

    return (
        <div className="max-w-7xl w-full mx-auto">
            <h1 className="text-2xl font-bold text-[#8B3A00] mb-8">Transfer Request</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    <form onSubmit={handleSubmit(onSubmitValid)}>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 space-y-10">

                                {/* Form Fields */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Current Location <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('currentLocation')}
                                            className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 ${errors.currentLocation ? 'border-red-400' : 'border-slate-200'}`}
                                            placeholder="Enter current location"
                                        />
                                        {errors.currentLocation && (
                                            <p className="text-xs text-red-500 mt-1">{errors.currentLocation.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Target Location <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('targetLocation')}
                                            className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 ${errors.targetLocation ? 'border-red-400' : 'border-slate-200'}`}
                                            placeholder="Enter target location"
                                        />
                                        {errors.targetLocation && (
                                            <p className="text-xs text-red-500 mt-1">{errors.targetLocation.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Department</label>
                                        <input
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700"
                                            readOnly
                                            value={currentDepartment}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Expected Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            {...register('expectedDate')}
                                            className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 ${errors.expectedDate ? 'border-red-400' : 'border-slate-200'}`}
                                        />
                                        {errors.expectedDate && (
                                            <p className="text-xs text-red-500 mt-1">{errors.expectedDate.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Valid Reason */}
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Valid Reason <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        {...register('validReason')}
                                        rows={4}
                                        className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 resize-none ${errors.validReason ? 'border-red-400' : 'border-slate-200'}`}
                                        placeholder="Provide a detailed reason for your transfer request"
                                    />
                                    {errors.validReason && (
                                        <p className="text-xs text-red-500 mt-1">{errors.validReason.message}</p>
                                    )}
                                </div>

                                {/* Proof Documents (Optional) */}
                                <div className="space-y-4">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Proof Documents <span className="text-slate-400 normal-case font-normal">(Optional)</span>
                                    </label>
                                    <div
                                        className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-10 flex flex-col items-center justify-center group hover:border-[#8B3A00] transition-all cursor-pointer"
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        onClick={handleBrowseClick}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept=".pdf,.docx,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                        />
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                                            <span className="material-symbols-outlined text-slate-400 text-3xl">upload_file</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800">Drag & drop files here</h4>
                                        <p className="text-[11px] text-slate-400 mt-2">Maximum file size: 10MB (PDF, DOCX, JPG)</p>
                                        <button type="button" className="mt-4 px-5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:shadow-md transition-shadow">Browse Files</button>
                                    </div>

                                    {/* Uploaded File List */}
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                                            <div className={`w-12 h-12 rounded flex items-center justify-center ${getFileIconColor(file.name)}`}>
                                                <span className="material-symbols-outlined">{getFileIcon(file.name)}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-800">{file.name}</p>
                                                <p className="text-[11px] text-slate-400">{formatFileSize(file.size)} • Just added</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                                                onClick={() => handleRemoveFile(index)}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6">
                                    <h2 className="text-xl font-bold text-slate-900">Transfer Request Details</h2>
                                    <p className="text-sm text-slate-500 mt-1">Select your transfer reason and provide initial details.</p>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    type="button"
                                    className="px-8 py-3 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 text-sm hover:bg-slate-100 transition-all"
                                    onClick={handleSaveAsDraft}
                                >
                                    Save as Draft
                                </button>
                                <div className="flex items-center gap-3">
                                    <button type="button" className="px-8 py-3 border border-slate-200 rounded-lg font-bold text-slate-400 text-sm">
                                        Back
                                    </button>
                                    <button type="submit" className="px-10 py-3 bg-[#8B3A00] text-white rounded-lg font-bold text-sm hover:opacity-90 shadow-lg shadow-[#8B3A00]/10 transition-all">
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sidebar / Info Panel */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-[#FFF7F2] rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#8B3A00] text-xl">info</span>
                            </div>
                            <h2 className="font-bold text-slate-800 text-sm">Transfer Policy</h2>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Minimum Tenure</p>
                                    <p className="text-[11px] text-slate-500 mt-1">Must have completed at least 12 months in the current role.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Performance Rating</p>
                                    <p className="text-[11px] text-slate-500 mt-1">Require a rating of 3.5 or above in latest appraisal.</p>
                                </div>
                            </li>
                        </ul>
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <a href="#" className="text-[11px] font-bold text-[#8B3A00] flex items-center gap-1 hover:underline transition-all">
                                Read Full Policy Documents
                                <span className="material-symbols-outlined text-xs">open_in_new</span>
                            </a>
                        </div>
                    </div>

                    <div className="bg-[#FEF3EB] rounded-xl p-6 text-slate-800 shadow-sm border border-[#FDE6D5] relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-5">
                            <span className="material-symbols-outlined text-[100px] text-[#8B3A00]">help</span>
                        </div>
                        <h3 className="font-bold text-sm mb-3">Need Help?</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">Contact HR Operations if you have questions regarding regional availability or relocation benefits.</p>
                        <button className="w-full py-2 bg-[#FFC5C0] text-slate-800 font-bold rounded-lg text-xs hover:opacity-90 transition-colors">
                            Contact HR
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmSubmitModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmSubmit}
            />
        </div>
    );
};

export default TransferRequestPage;

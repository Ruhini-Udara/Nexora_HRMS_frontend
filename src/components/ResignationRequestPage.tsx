import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAllResignationRequests, createResignationRequest, updateResignationStatus, ResignationRequest as ApiResignationRequest } from '@/lib/api/resignationRequests';
import { useAuthStore } from '@/store/useAuthStore';
import { uploadHrmsDocument } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axiosInstance';

// We use ApiResignationRequest from @/lib/api/resignationRequests
type RequestStatus = ApiResignationRequest['status'];

interface DocumentSlot {
    key: 'resignationLetter' | 'clearanceLetter' | 'handoverChecklist';
    label: string;
    icon: string;
    mandatory: boolean;
    file: File | null;
    existingName?: string; // For draft editing — previously uploaded filename
}

export type ResignationRequest = ApiResignationRequest;

// ── Zod Validation Schema ───────────────────────────────────────────
const resignationSchema = z.object({
    resignationReason: z.string().min(1, 'Reason for resignation is required'),
    resignationDate: z.string().min(1, 'Resignation date is required'),
    lastWorkingDate: z.string().min(1, 'Last working date is required').refine((val) => {
        const today = new Date().toISOString().split('T')[0];
        return val >= today;
    }, {
        message: 'Resignation effective date cannot be in the past',
    }),
    obligationDetails: z.string().min(1, 'Obligation details are required'),
    specialRemark: z.string().optional(),
});

type ResignationFormData = z.infer<typeof resignationSchema>;

const defaultLeaveBalances = [
    { type: 'Annual Leave', total: 14, used: 0, remaining: 14, color: '#8B3A00', bg: '#FEF3EB' },
    { type: 'Sick Leave', total: 7, used: 0, remaining: 7, color: '#0D9488', bg: '#F0FDFA' },
    { type: 'Casual Leave', total: 7, used: 0, remaining: 7, color: '#6366F1', bg: '#EEF2FF' },
];

// ── Resignation Reason Options ──────────────────────────────────────
const resignationReasons = [
    'Career Growth',
    'Personal Reasons',
    'Better Opportunity',
    'Health Issues',
    'Relocation',
    'Other',
];

// ── Confirmation Modal ──────────────────────────────────────────────
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isUploading?: boolean;
}

const ConfirmSubmitModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-colors">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8B3A00]">warning</span>
                        Confirm Submission
                    </h3>
                    <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
                        onClick={onClose}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        After submission, the request cannot be edited as it is submitted for approvals.
                    </p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3 transition-colors">
                    <button
                        type="button"
                        className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors"
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

// ── Document Upload Card ────────────────────────────────────────────
interface DocUploadCardProps {
    slot: DocumentSlot;
    onUpload: (key: DocumentSlot['key'], file: File) => void;
    onRemove: (key: DocumentSlot['key']) => void;
    disabled?: boolean;
}

const DocUploadCard: React.FC<DocUploadCardProps> = ({ slot, onUpload, onRemove, disabled }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const hasFile = slot.file !== null || slot.existingName !== undefined;
    const fileName = slot.file?.name || slot.existingName || '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onUpload(slot.key, e.target.files[0]);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    return (
        <div className={`rounded-xl border p-5 transition-all ${hasFile ? 'border-green-200 dark:border-green-900/50 bg-green-50/30 dark:bg-green-900/10' : slot.mandatory ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900' : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50'}`}>
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={handleChange}
            />
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${hasFile ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <span className={`material-symbols-outlined text-lg ${hasFile ? 'text-green-600' : 'text-slate-400'}`}>
                        {hasFile ? 'check_circle' : slot.icon}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{slot.label}</p>
                        {slot.mandatory ? (
                            <span className="text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded uppercase">Required</span>
                        ) : (
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">Optional</span>
                        )}
                    </div>

                    {hasFile ? (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{fileName}</p>
                            {slot.file && (
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">({formatFileSize(slot.file.size)})</p>
                            )}
                            {!disabled && (
                                <button
                                    type="button"
                                    className="ml-auto text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
                                    onClick={() => onRemove(slot.key)}
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="mt-2 text-[11px] font-bold text-[#8B3A00] dark:text-orange-400 hover:underline flex items-center gap-1 disabled:opacity-40 disabled:no-underline cursor-pointer"
                            onClick={() => inputRef.current?.click()}
                            disabled={disabled}
                        >
                            <span className="material-symbols-outlined text-xs">upload</span>
                            Upload Document
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Active Request Banner ───────────────────────────────────────────
const ActiveRequestBanner: React.FC<{ request: ResignationRequest }> = ({ request }) => {
    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
        'NEW': { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
        'SUBMITTED': { label: 'Submitted', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        'VERIFIED_BY_HR': { label: 'Verified by HR', color: 'text-blue-600', bg: 'bg-blue-50' },
        'PENDING_ADMIN': { label: 'Pending Admin', color: 'text-purple-600', bg: 'bg-purple-50' },
        'REJECTED': { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50' },
        'Board Approved': { label: 'Board Approved', color: 'text-green-600', bg: 'bg-green-50' },
        'Board Rejected': { label: 'Board Rejected', color: 'text-red-700', bg: 'bg-red-100' },
    };
    const cfg = statusConfig[request.status] || { label: request.status, color: 'text-slate-600', bg: 'bg-slate-50' };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B3A00] dark:text-orange-500 text-[20px]">info</span>
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Active Resignation Request</h2>
            </div>
            <div className="p-8">
                <div className="flex items-center gap-4 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl transition-colors">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">pending_actions</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Active Resignation Request in Progress</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Request <span className="font-bold">{request.id}</span> is currently <span className={`font-bold ${cfg.color}`}>{cfg.label}</span>.
                            You can track its progress here while continuing to use the form below for any new submissions.
                        </p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                    </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resignation Date</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{request.resignationDate}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Working Date</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{request.lastWorkingDate}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{request.reason}</p>
                    </div>
                    {request.obligationDetails && (
                        <div className="col-span-2 space-y-1">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Obligation Details</p>
                            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{request.obligationDetails}</p>
                        </div>
                    )}
                    {request.specialRemark && (
                        <div className="col-span-2 space-y-1">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Special Remark</p>
                            <p className="text-sm text-slate-700 dark:text-slate-200">{request.specialRemark}</p>
                        </div>
                    )}
                </div>

                {/* Documents attached */}
                <div className="mt-6 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documents Submitted</p>
                    <div className="flex flex-wrap gap-2">
                        {request.documents.resignationLetter && (
                            <span className="text-[11px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-xs">check_circle</span> Resignation Letter
                            </span>
                        )}
                        {request.documents.clearanceLetter && (
                            <span className="text-[11px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-xs">check_circle</span> Obligations Clearance
                            </span>
                        )}
                        {request.documents.handoverChecklist && (
                            <span className="text-[11px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-xs">check_circle</span> Handover Checklist
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────
interface ResignationRequestPageProps {
    requests: ResignationRequest[];
    onRequestChange: (requests: ResignationRequest[]) => void;
    selectedRequest: ResignationRequest | null;
    onCancelEdit: () => void;
    isViewOnly?: boolean;
    isModal?: boolean;
}

const ResignationRequestPage: React.FC<ResignationRequestPageProps> = ({ 
    requests, 
    onRequestChange,
    selectedRequest,
    onCancelEdit,
    isViewOnly = false,
    isModal = false
}) => {
    const { user } = useAuthStore();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // ── Document slots state ────────────────────────────────────────
    const [docSlots, setDocSlots] = useState<DocumentSlot[]>([
        { key: 'resignationLetter', label: 'Resignation Letter', icon: 'description', mandatory: true, file: null },
        { key: 'clearanceLetter', label: 'Obligations Clearance Letter', icon: 'fact_check', mandatory: true, file: null },
        { key: 'handoverChecklist', label: 'Employee Handover Checklist', icon: 'checklist', mandatory: false, file: null },
    ]);

    // ── Dynamic Leave Balances from Database ────────────────────────
    const [leaveBalances, setLeaveBalances] = useState(defaultLeaveBalances);

    useEffect(() => {
        const fetchLeaveBalance = async () => {
            if (!user?.id) return;
            try {
                const currentYear = new Date().getFullYear();
                const response = await fetch(`/api/leave-balance?employeeId=${user.id}&year=${currentYear}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        const annualQuota = data.annualLeaveQuota ?? 14;
                        const annualUsed = data.annualLeaveUsed ?? 0;
                        const annualRem = data.annualLeaveRemaining ?? Math.max(0, annualQuota - annualUsed);

                        const sickQuota = data.medicalLeaveQuota ?? (data.sickLeaveQuota ?? 7);
                        const sickUsed = data.medicalLeaveUsed ?? (data.sickLeaveUsed ?? 0);
                        const sickRem = data.medicalLeaveRemaining ?? Math.max(0, sickQuota - sickUsed);

                        const casualQuota = data.casualLeaveQuota ?? 7;
                        const casualUsed = data.casualLeaveUsed ?? 0;
                        const casualRem = data.casualLeaveRemaining ?? Math.max(0, casualQuota - casualUsed);

                        setLeaveBalances([
                            { type: 'Annual Leave', total: annualQuota, used: annualUsed, remaining: annualRem, color: '#8B3A00', bg: '#FEF3EB' },
                            { type: 'Sick Leave', total: sickQuota, used: sickUsed, remaining: sickRem, color: '#0D9488', bg: '#F0FDFA' },
                            { type: 'Casual Leave', total: casualQuota, used: casualUsed, remaining: casualRem, color: '#6366F1', bg: '#EEF2FF' },
                        ]);
                    }
                }
            } catch (err) {
                // Silently fallback to default values without logging AxiosError
            }
        };
        fetchLeaveBalance();
    }, [user?.id]);

    // ── Determine form mode ────────────────────────────────────────
    const isEditing = !!selectedRequest;
    
    // Requests that are in progress (submitted but not finalized)
    const activeRequests = requests.filter((r) => 
        r.status !== 'NEW' && 
        r.status !== 'REJECTED' && 
        r.status !== 'Board Rejected' &&
        r.status !== 'Board Approved'
    );
    
    // Finalized requests to show in a different way or history
    const finalizedRequests = requests.filter((r) => 
        r.status === 'REJECTED' || 
        r.status === 'Board Rejected' ||
        r.status === 'Board Approved'
    );

    // ── Today's date helper ─────────────────────────────────────────
    const todayISO = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // ── react-hook-form + Zod ───────────────────────────────────────
    const {
        register,
        handleSubmit,
        getValues,
        reset,
        formState: { errors },
    } = useForm<ResignationFormData>({
        resolver: zodResolver(resignationSchema),
        defaultValues: {
            resignationReason: '',
            resignationDate: todayISO,
            lastWorkingDate: '',
            obligationDetails: '',
            specialRemark: '',
        },
    });

    // Reset form when selectedRequest changes
    React.useEffect(() => {
        if (selectedRequest) {
            reset({
                resignationReason: selectedRequest.reason || '',
                resignationDate: selectedRequest.resignationDate || todayISO,
                lastWorkingDate: selectedRequest.lastWorkingDate || '',
                obligationDetails: selectedRequest.obligationDetails || '',
                specialRemark: selectedRequest.specialRemark || '',
            });
            
            // Also update doc slots
            setDocSlots(prev => prev.map(slot => ({
                ...slot,
                file: null,
                existingName: selectedRequest.documents[slot.key as keyof typeof selectedRequest.documents] || undefined
            })));
        } else {
            reset({
                resignationReason: '',
                resignationDate: todayISO,
                lastWorkingDate: '',
                obligationDetails: '',
                specialRemark: '',
            });
            setDocSlots(prev => prev.map(slot => ({ ...slot, file: null, existingName: undefined })));
        }
    }, [selectedRequest, reset, todayISO]);

    // ── Doc handlers ────────────────────────────────────────────────
    const handleDocUpload = useCallback((key: DocumentSlot['key'], file: File) => {
        setDocSlots((prev) =>
            prev.map((slot) =>
                slot.key === key ? { ...slot, file, existingName: undefined } : slot
            )
        );
    }, []);

    const handleDocRemove = useCallback((key: DocumentSlot['key']) => {
        setDocSlots((prev) =>
            prev.map((slot) =>
                slot.key === key ? { ...slot, file: null, existingName: undefined } : slot
            )
        );
    }, []);

    // ── Mandatory docs check ────────────────────────────────────────
    const mandatoryDocsMissing = docSlots
        .filter((s) => s.mandatory)
        .some((s) => s.file === null && s.existingName === undefined);

    // ── Actions ─────────────────────────────────────────────────────
    
    const uploadDocs = async () => {
        const payloadDocs: any = {
            resignationLetter: undefined,
            clearanceLetter: undefined,
            handoverChecklist: undefined
        };
        for (const slot of docSlots) {
            if (slot.file) {
                const path = await uploadHrmsDocument(slot.file, 'resignation');
                if (path) {
                    payloadDocs[slot.key] = path;
                } else {
                    throw new Error('Upload failed for ' + slot.label);
                }
            } else if (slot.existingName) {
                payloadDocs[slot.key] = slot.existingName;
            }
        }
        return payloadDocs;
    };

    const handleSaveAsDraft = async () => {
        setIsUploading(true);
        const values = getValues();
        const uploadedDocs = await uploadDocs();
        const payload: Partial<ResignationRequest> = {
            employeeName: user?.name || '',
            epfNumber: user?.epfNumber || '',
            designation: user?.designation || '',
            branch: user?.department || '',
            resignationDate: values.resignationDate,
            lastWorkingDate: values.lastWorkingDate,
            reason: values.resignationReason,
            obligationDetails: values.obligationDetails,
            specialRemark: values.specialRemark,
            status: 'NEW',
            documents: uploadedDocs
        };

        try {
            await createResignationRequest(payload, user?.id || 1);
            // Refresh requests list in parent
            onCancelEdit(); // Clear editing mode
            window.location.reload(); 
        } catch (error) {
            console.error('Failed to save draft:', error);
        }
    };

    const onSubmitValid = () => {
        if (mandatoryDocsMissing) return; // safety guard
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        setIsUploading(true);
        const values = getValues();
        const uploadedDocs = await uploadDocs();
        const payload: Partial<ResignationRequest> = {
            employeeName: user?.name || '',
            epfNumber: user?.epfNumber || '',
            designation: user?.designation || '',
            branch: user?.department || '',
            resignationDate: values.resignationDate,
            lastWorkingDate: values.lastWorkingDate,
            reason: values.resignationReason,
            obligationDetails: values.obligationDetails,
            specialRemark: values.specialRemark,
            status: 'SUBMITTED',
            documents: uploadedDocs
        };

        try {
            await createResignationRequest(payload, user?.id || 1);
            setShowConfirmModal(false);
            window.location.reload();
        } catch (error) {
            console.error('Failed to submit:', error);
        }
    };

    // ── Render ─────────────────────────────────────────────────────
    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-8">
                    
                    {/* Active/Finalized requests hidden per user request */}

                    {/* Form Section: Always available for new requests, or for editing/viewing specific ones */}
                    <form onSubmit={handleSubmit(onSubmitValid)}>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#8B3A00] dark:text-orange-500 text-[20px]">assignment_late</span>
                                        <h2 className="font-bold text-slate-800 dark:text-white text-sm">
                                            {isViewOnly ? `View Request — ${selectedRequest?.id}` : isEditing ? `Edit Draft — ${selectedRequest?.id}` : 'Create Resign Request'}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {(isEditing || isViewOnly) && (
                                            <button 
                                                type="button"
                                                onClick={onCancelEdit}
                                                className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded uppercase tracking-wider transition-colors cursor-pointer"
                                            >
                                                {isViewOnly ? 'Close View' : 'Cancel Edit'}
                                            </button>
                                        )}
                                        {isEditing && !isViewOnly && (
                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded uppercase tracking-wider">
                                                Editing Draft
                                            </span>
                                        )}
                                        {isViewOnly && (
                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded uppercase tracking-wider">
                                                View Mode
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-8 space-y-8">

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Resignation Initiation Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                {...register('resignationDate')}
                                                disabled={isViewOnly}
                                                className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 dark:text-slate-100 ${errors.resignationDate ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} ${isViewOnly ? 'bg-slate-50 dark:bg-slate-800/60 opacity-80' : ''}`}
                                            />
                                            {errors.resignationDate && (
                                                <p className="text-xs text-red-500 mt-1">{errors.resignationDate.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Resignation Effective Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                {...register('lastWorkingDate')}
                                                min={todayISO}
                                                disabled={isViewOnly}
                                                className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 dark:text-slate-100 ${errors.lastWorkingDate ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} ${isViewOnly ? 'bg-slate-50 dark:bg-slate-800/60 opacity-80' : ''}`}
                                            />
                                            {errors.lastWorkingDate && (
                                                <p className="text-xs text-red-500 mt-1">{errors.lastWorkingDate.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Form Fields — Row 2: Reason for Resignation */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Reason for Resignation <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                {...register('resignationReason')}
                                                disabled={isViewOnly}
                                                className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-800 ${errors.resignationReason ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} ${isViewOnly ? 'bg-slate-50 dark:bg-slate-800/60 opacity-80' : ''}`}
                                            >
                                                <option value="">Select Reason</option>
                                                {resignationReasons.map((reason) => (
                                                    <option key={reason} value={reason}>{reason}</option>
                                                ))}
                                            </select>
                                            {errors.resignationReason && (
                                                <p className="text-xs text-red-500 mt-1">{errors.resignationReason.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Special Remark <span className="text-slate-400 normal-case font-normal">(Optional)</span>
                                            </label>
                                            <input
                                                {...register('specialRemark')}
                                                disabled={isViewOnly}
                                                placeholder="Any other specific comments"
                                                className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 dark:text-slate-100 ${isViewOnly ? 'bg-slate-50 dark:bg-slate-800/60 opacity-80' : ''}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Form Fields — Row 3: Obligation Details */}
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Direct and Indirect Obligations <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            {...register('obligationDetails')}
                                            disabled={isViewOnly}
                                            rows={4}
                                            placeholder="Detail any pending projects, assets to return, or other obligations..."
                                            className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 dark:text-slate-100 resize-none ${errors.obligationDetails ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} ${isViewOnly ? 'bg-slate-50 dark:bg-slate-800/60 opacity-80' : ''}`}
                                        />
                                        {errors.obligationDetails && (
                                            <p className="text-xs text-red-500 mt-1">{errors.obligationDetails.message}</p>
                                        )}
                                    </div>

                                    {/* Leave Balance Display */}
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leave Balance Details</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {leaveBalances.map((leave) => (
                                                <div
                                                    key={leave.type}
                                                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-colors"
                                                    style={{ backgroundColor: `${leave.color}10` }}
                                                >
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                            style={{ backgroundColor: `${leave.color}15` }}
                                                        >
                                                            <span
                                                                className="material-symbols-outlined text-base"
                                                                style={{ color: leave.color }}
                                                            >
                                                                event_available
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{leave.type}</p>
                                                    </div>
                                                    <div className="flex items-end justify-between">
                                                        <div>
                                                            <p className="text-2xl font-bold" style={{ color: leave.color }}>{leave.remaining}</p>
                                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Remaining</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                <span className="font-bold text-slate-600 dark:text-slate-300">{leave.used}</span> / {leave.total} used
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: `${(leave.used / leave.total) * 100}%`,
                                                                backgroundColor: leave.color,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Document Uploads */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Required Documents
                                            </label>
                                            {mandatoryDocsMissing && (
                                                <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">warning</span>
                                                    Upload mandatory documents to submit
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {docSlots.map((slot) => (
                                                <DocUploadCard
                                                    key={slot.key}
                                                    slot={slot}
                                                    onUpload={handleDocUpload}
                                                    onRemove={handleDocRemove}
                                                    disabled={isViewOnly}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                    {/* Footer Actions */}
                                    <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        {!isViewOnly ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                                    onClick={handleSaveAsDraft}
                                                >
                                                    {isEditing ? 'Update Draft' : 'Save as Draft'}
                                                </button>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="submit"
                                                        disabled={mandatoryDocsMissing}
                                                        className={`px-10 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${mandatoryDocsMissing
                                                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                                            : 'bg-[#8B3A00] text-white hover:opacity-90 shadow-lg shadow-[#8B3A00]/10'
                                                            }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">send</span>
                                                        Submit Request
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={onCancelEdit}
                                                    className="px-8 py-3 bg-[#8B3A00] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all cursor-pointer"
                                                >
                                                    Back to Status Table
                                                </button>
                                            </div>
                                        )}
                                    </div>
                            </div>
                        </form>
                </div>

                {/* Sidebar — Hide if in modal */}
                {!isModal && (
                    <div className="w-full lg:w-80 shrink-0 space-y-6">
                        <SidebarPanel />
                    </div>
                )}
            </div>

            <ConfirmSubmitModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmSubmit}
            />
        </div>
    );
};

// ── Sidebar Panel (extracted to avoid duplication) ──────────────────
const SidebarPanel = () => (
    <>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#FFF7F2] dark:bg-orange-950/40 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#8B3A00] dark:text-orange-500 text-xl">info</span>
                </div>
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Resignation Policy</h2>
            </div>
            <ul className="space-y-4">
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                    <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Notice Period</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">A minimum of 30 days notice period is required for all resignations.</p>
                    </div>
                </li>
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                    <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Knowledge Transfer</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Complete all assigned KT sessions before the last working day.</p>
                    </div>
                </li>
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                    <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Exit Interview</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">An HR representative will schedule a mandatory exit interview.</p>
                    </div>
                </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <a href="#" className="text-[11px] font-bold text-[#8B3A00] dark:text-orange-400 flex items-center gap-1 hover:underline transition-all">
                    Read Full Policy Documents
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
            </div>
        </div>

        <div className="bg-[#FEF3EB] dark:bg-orange-950/20 rounded-xl p-6 text-slate-800 dark:text-slate-200 shadow-sm border border-[#FDE6D5] dark:border-orange-900/30 relative overflow-hidden transition-colors">
            <div className="absolute -right-4 -bottom-4 opacity-5 dark:opacity-10">
                <span className="material-symbols-outlined text-[100px] text-[#8B3A00] dark:text-orange-400">help</span>
            </div>
            <h3 className="font-bold text-sm mb-3">Need Help?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">Contact HR Operations for queries regarding notice period, final settlement, or exit clearance process.</p>
            <button className="w-full py-2 bg-[#FFC5C0] dark:bg-orange-900/50 text-slate-800 dark:text-orange-200 font-bold rounded-lg text-xs hover:opacity-90 transition-colors cursor-pointer">
                Contact HR
            </button>
        </div>
    </>
);

export default ResignationRequestPage;

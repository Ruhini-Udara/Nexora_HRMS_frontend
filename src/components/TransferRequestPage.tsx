import React, { useState, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { createTransferRequest, updateTransferRequest, TransferRequest, TransferStatus } from '@/lib/api/transferRequests';
import { getDistinctBranches } from '@/lib/api/employeeApi';
import { useAuthStore } from '@/store/useAuthStore';
import { uploadHrmsDocument } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ───────────────────────────────────────────────────────────
// ── Types ───────────────────────────────────────────────────────────

interface DocumentSlot {
    key: 'justification_letter' | 'proof_documents';
    label: string;
    icon: string;
    mandatory: boolean;
    file: File | null;
    existingName?: string;
}

// TransferRequest interface is imported from API

// ── Zod Validation Schema ───────────────────────────────────────────
const transferSchema = z.object({
    currentLocation: z.string().min(1, 'Current location is required'),
    targetLocation: z.string().min(1, 'Target location is required'),
    expectedDate: z.string().min(1, 'Effective date is required').refine(date => new Date(date) >= new Date(new Date().setHours(0,0,0,0)), 'Date must be today or in the future'),
    validReason: z.string().min(1, 'Reason is required'),
});

type TransferFormData = z.infer<typeof transferSchema>;

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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
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
                <div className="p-6">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        After submission, the request cannot be edited as it is submitted for approvals.
                    </p>
                </div>
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
        <div className={`rounded-xl border p-5 transition-all ${hasFile ? 'border-green-200 dark:border-green-800/50 bg-green-50/30 dark:bg-green-950/20' : slot.mandatory ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60' : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30'}`}>
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={handleChange}
            />
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${hasFile ? 'bg-green-100 dark:bg-green-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <span className={`material-symbols-outlined text-lg ${hasFile ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {hasFile ? 'check_circle' : slot.icon}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{slot.label}</p>
                        {slot.mandatory ? (
                            <span className="text-[9px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded uppercase">Required</span>
                        ) : (
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">Optional</span>
                        )}
                    </div>

                    {hasFile ? (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">{fileName}</p>
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
const ActiveRequestBanner: React.FC<{ request: TransferRequest }> = ({ request }) => {
    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
        NEW: { label: 'Draft', color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
        SUBMITTED: { label: 'Pending Approval', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/40' },
        APPROVED: { label: 'Approved', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40' },
        REJECTED: { label: 'Rejected', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40' },
        VERIFIED_BY_HR: { label: 'Verified', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
        PENDING_ADMIN: { label: 'Pending Admin', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    };
    const cfg = statusConfig[request.status] || statusConfig.NEW;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B3A00] dark:text-orange-500 text-[20px]">info</span>
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Active Transfer Request</h2>
            </div>
            <div className="p-8">
                <div className="flex items-center gap-4 p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">pending_actions</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">You already have an active transfer request</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Request <span className="font-bold text-slate-700 dark:text-slate-200">{request.id}</span> is currently <span className={`font-bold ${cfg.color}`}>{cfg.label}</span>.
                            You cannot create a new request until the existing one is resolved.
                        </p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                    </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Location</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{request.currentBranch}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Location</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{request.targetBranch}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Effective Date</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{request.expectedDate}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{request.reason}</p>
                    </div>
                </div>

                {/* Documents attached */}
                <div className="mt-6 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documents Submitted</p>
                    <div className="flex flex-wrap gap-2">
                        {request.documents?.some(d => d.key === 'justification') && (
                            <span className="text-[11px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">check_circle</span> Transfer Justification
                            </span>
                        )}
                        {request.documents?.some(d => d.key === 'proof') && (
                            <span className="text-[11px] text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">description</span> Proof Documents
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────
interface TransferRequestPageProps {
    requests: TransferRequest[];
    onRequestChange: (requests: TransferRequest[]) => void;
}

export interface TransferRequestPageRef {
    setEditingDraft: (req: TransferRequest) => void;
}

const TransferRequestPage = forwardRef<TransferRequestPageRef, TransferRequestPageProps>(({ requests, onRequestChange }, ref) => {
    const todayISO = new Date().toISOString().split('T')[0];
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [editingDraft, setEditingDraft] = useState<TransferRequest | null>(null);
    const [availableBranches, setAvailableBranches] = useState<string[]>([]);

    React.useEffect(() => {
        const fetchBranches = async () => {
            try {
                const branches = await getDistinctBranches();
                setAvailableBranches(branches);
            } catch (error) {
                console.error("Failed to fetch branches:", error);
            }
        };
        fetchBranches();
    }, []);

    useImperativeHandle(ref, () => ({
        setEditingDraft: (req: TransferRequest) => {
            setEditingDraft(req);
        }
    }));

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // ── Document slots state ────────────────────────────────────────
    const [docSlots, setDocSlots] = useState<DocumentSlot[]>([
        { key: 'justification_letter', label: 'Transfer Justification Letter', icon: 'description', mandatory: true, file: null },
        { key: 'proof_documents', label: 'Proof Documents', icon: 'folder_open', mandatory: false, file: null },
    ]);

    const [pendingAction, setPendingAction] = useState<'draft' | 'submit' | null>(null);
    const [formKey, setFormKey] = useState(0);

    // Filter requests to find if there is a NEW draft (legacy check, but we now support multiple drafts)
    const isEditing = !!editingDraft;
    const submittedRequests = requests.filter(r => r.status !== 'NEW' && r.status !== 'DRAFT');



    const { user } = useAuthStore();

    // ── Dynamic data ────────────────────────────────────────────────
    const employeeProfile = {
        epfNumber: user?.epfNumber || "N/A",
        employeeName: user?.name || "N/A",
        designation: user?.designation || "N/A",
        branch: user?.department || "N/A"
    };

    const currentDepartment = employeeProfile.branch;

    // ── react-hook-form + Zod ───────────────────────────────────────
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<TransferFormData>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            currentLocation: user?.branch || '',
            targetLocation: '',
            expectedDate: '',
            validReason: '',
        },
    });

    // reset form whenever editingDraft changes
    React.useEffect(() => {
        if (editingDraft) {
            reset({
                currentLocation: editingDraft.currentBranch || user?.branch || '',
                targetLocation: editingDraft.targetBranch || '',
                expectedDate: editingDraft.expectedDate || '',
                validReason: editingDraft.reason || '',
            });
            setDocSlots(prev => prev.map(slot => ({
                ...slot,
                file: null,
                existingName: editingDraft.documents?.find(d =>
                    (slot.key === 'justification_letter' && d.key === 'justification') ||
                    (slot.key === 'proof_documents' && d.key === 'proof')
                )?.filename
            })));
        } else {
            reset({
                currentLocation: user?.branch || '',
                targetLocation: '',
                expectedDate: '',
                validReason: '',
            });
            setDocSlots([
                { key: 'justification_letter', label: 'Transfer Justification Letter', icon: 'description', mandatory: true, file: null },
                { key: 'proof_documents', label: 'Proof Documents', icon: 'folder_open', mandatory: false, file: null },
            ]);
        }
    }, [editingDraft, reset, user]);



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

    // ── Build payload helper ────────────────────────────────────────
    const buildPayload = async (data: TransferFormData, status: TransferStatus): Promise<Partial<TransferRequest>> => {
        const docs = [];
        
        for (const slot of docSlots) {
            let key: string = slot.key;
            if (slot.key === 'justification_letter') key = 'justification';
            if (slot.key === 'proof_documents') key = 'proof';

            if (slot.file) {
                const path = await uploadHrmsDocument(slot.file, 'transfer');
                if (path) {
                    docs.push({ key, label: slot.label, filename: path });
                }
            } else if (slot.existingName) {
                docs.push({ key, label: slot.label, filename: slot.existingName });
            }
        }

        return {
            status,
            currentBranch: data.currentLocation,
            targetBranch: data.targetLocation,
            expectedDate: data.expectedDate,
            reason: data.validReason,
            transferType: 'Requested by Employee',
            documents: docs,
            requestDate: new Date().toISOString().split('T')[0],
        };
    };

    // ── Actions ─────────────────────────────────────────────────────
    const resetForm = () => {
        setEditingDraft(null);
        setFormKey(prev => prev + 1);
        reset({
            currentLocation: user?.branch || '',
            targetLocation: '',
            expectedDate: '',
            validReason: '',
        });
        setDocSlots([
            { key: 'justification_letter', label: 'Transfer Justification Letter', icon: 'description', mandatory: true, file: null },
            { key: 'proof_documents', label: 'Proof Documents', icon: 'folder_open', mandatory: false, file: null },
        ]);
    };

    const triggerSaveAsDraft = () => {
        setPendingAction('draft');
    };

    const triggerSubmit = () => {
        setPendingAction('submit');
    };

    const onFormValid = async (data: TransferFormData) => {
        if (pendingAction === 'draft') {
            const payload = await buildPayload(data, 'NEW');
            try {
                if (editingDraft) {
                    const updated = await updateTransferRequest(editingDraft.id, payload);
                    onRequestChange(requests.map(r => r.id === updated.id ? updated : r));
                    showSuccess(`Draft ${updated.id} updated successfully`);
                } else {
                    const userDetails = user ? {
                        id: user.id,
                        name: user.name,
                        epfNumber: user.epfNumber,
                        designation: user.designation,
                        department: user.department
                    } : undefined;
                    const savedReq = await createTransferRequest(payload, userDetails);
                    onRequestChange([...requests, savedReq]);
                    showSuccess(`Draft ${savedReq.id} saved successfully`);
                    setEditingDraft(savedReq);
                }
            } catch (error) {
                console.error('Failed to save draft:', error);
            }
        } else if (pendingAction === 'submit') {
            if (mandatoryDocsMissing) {
                setPendingAction(null);
                return;
            }
            setShowConfirmModal(true);
        }
        setPendingAction(null);
    };

    const handleConfirmSubmit = async () => {
        setIsUploading(true);
        const values = getValues();
        const payload = await buildPayload(values, 'SUBMITTED');
        try {
            if (editingDraft) {
                const updated = await updateTransferRequest(editingDraft.id, payload);
                onRequestChange(requests.map(r => r.id === updated.id ? updated : r));
                showSuccess(`Request ${updated.id} submitted for approval`);
            } else {
                const userDetails = user ? {
                    id: user.id,
                    name: user.name,
                    epfNumber: user.epfNumber,
                    designation: user.designation,
                    department: user.department
                } : undefined;
                const savedReq = await createTransferRequest(payload, userDetails);
                onRequestChange([...requests, savedReq]);
                showSuccess(`Request ${savedReq.id} submitted for approval`);
            }
            setShowConfirmModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to submit request:', error);
        }
    };

    // ── Render ─────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl w-full mx-auto" key={formKey}>
            <h1 className="text-2xl font-bold text-[#8B3A00] dark:text-white mb-8">Transfer Request Management</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-8">
                    {/* Active submitted requests hidden per user request */}

                    <form onSubmit={handleSubmit(onFormValid)}>
                        {editingDraft && (
                            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#8B3A00] dark:text-orange-400 text-2xl">edit_note</span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            Editing Draft <span className="text-[#8B3A00] dark:text-orange-400 font-extrabold">{editingDraft.id}</span>
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Modify the details below and click &quot;Submit Request&quot; or update the draft.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancel Edit
                                </button>
                            </div>
                        )}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                            <div className="p-8 space-y-10">

                                {/* Transfer Request Details Header */}
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transfer Request Details</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Provide your transfer details and upload required documents.</p>
                                        </div>
                                        {isEditing && (
                                            <span className="text-[10px] font-bold text-[#8B3A00] dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 px-3 py-1 rounded uppercase tracking-wider">
                                                Editing Draft
                                            </span>
                                        )}
                                    </div>
                                    {/* Hidden — hardcoded General Transfer Request */}
                                    <input type="hidden" name="transfer_type" value="General Transfer Request" />
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Current Department
                                        </label>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                            readOnly
                                            value={currentDepartment}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Current Location <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('currentLocation')}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                                            readOnly
                                            placeholder="e.g. Colombo Branch"
                                        />
                                        {errors.currentLocation && (
                                            <p className="text-xs text-red-500 mt-1">{errors.currentLocation.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Target Location <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            value={watch('targetLocation') || ''}
                                            onValueChange={(val) => setValue('targetLocation', val, { shouldValidate: true })}
                                        >
                                            <SelectTrigger
                                                className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 h-11 text-sm text-slate-700 dark:text-slate-100 ${errors.targetLocation ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                                            >
                                                <SelectValue placeholder="Select Target Branch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableBranches.map((branch, index) => (
                                                    <SelectItem key={index} value={branch}>
                                                        {branch}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.targetLocation && (
                                            <p className="text-xs text-red-500 mt-1">{errors.targetLocation.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Effective Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            min={todayISO}
                                            {...register('expectedDate')}
                                            className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 dark:text-slate-100 ${errors.expectedDate ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                                        />
                                        {errors.expectedDate && (
                                            <p className="text-xs text-red-500 mt-1">{errors.expectedDate.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Valid Reason */}
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Reason <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        {...register('validReason')}
                                        rows={4}
                                        className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 dark:text-slate-100 resize-none ${errors.validReason ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                                        placeholder="Provide a detailed reason for your transfer request..."
                                    />
                                    {errors.validReason && (
                                        <p className="text-xs text-red-500 mt-1">{errors.validReason.message}</p>
                                    )}
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {docSlots.map((slot) => (
                                            <DocUploadCard
                                                key={slot.key}
                                                slot={slot}
                                                onUpload={handleDocUpload}
                                                onRemove={handleDocRemove}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                    onClick={triggerSaveAsDraft}
                                >
                                    {isEditing ? 'Update Draft' : 'Save as Draft'}
                                </button>
                                <div className="flex items-center gap-3 ml-auto">
                                    <div className="relative group">
                                        <button
                                            type="submit"
                                            onClick={triggerSubmit}
                                            disabled={mandatoryDocsMissing}
                                            className={`px-10 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${mandatoryDocsMissing
                                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                                : 'bg-[#8B3A00] text-white hover:opacity-90 shadow-lg shadow-[#8B3A00]/10'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">send</span>
                                            Submit Request
                                        </button>
                                        {mandatoryDocsMissing && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                Upload Transfer Justification Letter to submit
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sidebar / Info Panel */}
                <div className="w-full lg:w-80 space-y-6">
                    <SidebarPanel />
                </div>
            </div>

            <ConfirmSubmitModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmSubmit}
            />

            {/* Success Toast */}
            {successMessage && (
                <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg">check</span>
                        </div>
                        <p className="text-sm font-bold tracking-tight">{successMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
});

TransferRequestPage.displayName = "TransferRequestPage";

// ── Sidebar Panel ───────────────────────────────────────────────────
const SidebarPanel = () => (
    <>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#FFF7F2] dark:bg-orange-950/40 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#8B3A00] dark:text-orange-500 text-xl">info</span>
                </div>
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Transfer Policy</h2>
            </div>
            <ul className="space-y-4">
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                    <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Minimum Tenure</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Must have completed at least 12 months in the current role.</p>
                    </div>
                </li>
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                    <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Performance Rating</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Require a rating of 3.5 or above in latest appraisal.</p>
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
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">Contact HR Operations if you have questions regarding regional availability or relocation benefits.</p>
            <button className="w-full py-2 bg-[#FFC5C0] dark:bg-orange-900/50 text-slate-800 dark:text-orange-200 font-bold rounded-lg text-xs hover:opacity-90 transition-colors">
                Contact HR
            </button>
        </div>
    </>
);

export default TransferRequestPage;

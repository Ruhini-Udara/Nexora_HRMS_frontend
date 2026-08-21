"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { WelfareRequest, getAllWelfareRequests, getWelfareRequestsByEmployee, createWelfareRequest, updateWelfareRequest, RequestStatus } from "@/lib/api/welfareRequests";
import { useAuthStore } from "@/store/useAuthStore";

interface DocumentSlot {
    key: 'supporting_document';
    label: string;
    icon: string;
    mandatory: boolean;
    file: File | null;
    existingName?: string;
}

// ── Zod Validation Schema ───────────────────────────────────────────
const welfareSchema = z.object({
    welfareType: z.string().min(1, 'Welfare type is required'),
    employeeType: z.string().min(1, 'Employee type is required'),
    amount: z.string().min(1, 'Amount is required'),
    specialRemark: z.string().optional(),
});

type WelfareFormData = z.infer<typeof welfareSchema>;

// ── Status Badge Component ──────────────────────────────────────────
const StatusBadge = ({ status }: { status: RequestStatus }) => {
    const config: Record<RequestStatus, string> = {
        'NEW': 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
        'SUBMITTED': 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
        'APPROVED': 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        'REJECTED': 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config[status]}`}>
            {status === 'NEW' ? 'Saved' : status}
        </span>
    );
};

// ── Constants & Mocks ───────────────────────────────────────────────
const welfareTypes = [
    'Family Funeral',
    'Festival Advance',
    'Accident Claims'
];

const employeeTypes = [
    'Permanent',
    'Temporary',
    'Casual'
];

// employeeProfile is now handled dynamically inside the component

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
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
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
                        Please acknowledge: The Employee welfare Request cannot be edited after submitting.
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
                            className="mt-2 text-[11px] font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-40 disabled:no-underline cursor-pointer"
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


// ── Main Component ──────────────────────────────────────────────────
export default function WelfareRequestPage() {
    const [requests, setRequests] = useState<WelfareRequest[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingDraft, setEditingDraft] = useState<WelfareRequest | null>(null);
    const [viewRequest, setViewRequest] = useState<WelfareRequest | null>(null);
    const [formKey, setFormKey] = useState(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [pendingAction, setPendingAction] = useState<'draft' | 'submit' | null>(null);
    const { user } = useAuthStore();

    const employeeProfile = {
        epfNumber: user?.epfNumber || "N/A",
        employeeName: user?.name || "N/A",
        designation: user?.designation || "N/A",
        dateJoined: "N/A", // Not in auth store
        branch: user?.department || "N/A"
    };

    const [docSlots, setDocSlots] = useState<DocumentSlot[]>([
        { key: 'supporting_document', label: 'Supporting Document (e.g., Certificates, Bills)', icon: 'description', mandatory: true, file: null },
    ]);

    const {
        register,
        handleSubmit,
        getValues,
        reset,
        formState: { errors },
    } = useForm<WelfareFormData>({
        resolver: zodResolver(welfareSchema),
        defaultValues: {
            welfareType: '',
            employeeType: '',
            amount: '',
            specialRemark: '',
        },
    });

    const loadRequests = useCallback(async () => {
        if (!user?.id) return; // Prevent calling with id 0 or null during load

        try {
            const data = user.role === 'ROLE_ADMIN'
                ? await getAllWelfareRequests()
                : await getWelfareRequestsByEmployee(user.id);
            setRequests(data);
        } catch (error) {
            console.error("Failed to load requests", error);
        }
    }, [user]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadRequests();
    }, [loadRequests]);

    // When editingDraft changes, populate form with draft data
    useEffect(() => {
        if (editingDraft) {
            reset({
                welfareType: editingDraft.welfareType || '',
                employeeType: editingDraft.employeeType || '',
                amount: editingDraft.amount?.toString() || '',
                specialRemark: editingDraft.employeeRemarks || '',
            });
            // Also populate docSlots with existing document name
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDocSlots(prev => prev.map(slot => ({
                ...slot,
                file: null,
                existingName: editingDraft.documents.find(d => d.key === 'support')?.filename
            })));
        }
    }, [editingDraft, reset]);

    const resetForm = () => {
        setEditingDraft(null);
        reset({ welfareType: '', employeeType: '', amount: '', specialRemark: '' });
        setDocSlots([
            { key: 'supporting_document', label: 'Supporting Document (e.g., Certificates, Bills)', icon: 'description', mandatory: true, file: null },
        ]);
        setFormKey(prev => prev + 1);
    };

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

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

    const mandatoryDocsMissing = docSlots
        .filter((s) => s.mandatory)
        .some((s) => s.file === null && s.existingName === undefined);

    const buildPayload = (data: WelfareFormData, status: RequestStatus): Partial<WelfareRequest> => {
        const supportingDoc = docSlots.find(s => s.key === 'supporting_document');
        const docName = supportingDoc?.file?.name || supportingDoc?.existingName;

        return {
            status,
            welfareType: data.welfareType,
            employeeType: data.employeeType,
            amount: parseFloat(data.amount) || 0,
            employeeRemarks: data.specialRemark || '',
            documents: docName ? [{ key: 'support', label: 'Supporting Document', filename: docName }] : []
        };
    };

    const triggerSaveAsDraft = () => {
        setPendingAction('draft');
    };

    const triggerSubmit = () => {
        setPendingAction('submit');
    };

    // Called when form validation passes (for both draft save and submit)
    const onFormValid = async (data: WelfareFormData) => {
        if (pendingAction === 'draft') {
            const payload = buildPayload(data, 'NEW');
            try {
                if (editingDraft) {
                    const updated = await updateWelfareRequest(editingDraft.id, payload);
                    setRequests(prev => prev.map(r => r.id === editingDraft.id ? updated : r));
                    showSuccess(`Draft ${updated.id} updated successfully`);
                } else {
                    const userDetails = user ? { id: user.id, name: user.name, email: user.email } : undefined;
                    const savedReq = await createWelfareRequest(payload, userDetails);
                    setRequests(prev => [...prev, savedReq]);
                    showSuccess(`Draft ${savedReq.id} saved successfully`);
                }
                resetForm();
            } catch (error) {
                console.error("Failed to save draft", error);
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
        const values = getValues();
        const payload = buildPayload(values, 'SUBMITTED');
        try {
            if (editingDraft) {
                const updated = await updateWelfareRequest(editingDraft.id, payload);
                setRequests(prev => prev.map(r => r.id === editingDraft.id ? updated : r));
                showSuccess(`Request ${updated.id} submitted for certification`);
            } else {
                const userDetails = user ? { id: user.id, name: user.name, email: user.email } : undefined;
                const savedReq = await createWelfareRequest(payload, userDetails);
                setRequests(prev => [...prev, savedReq]);
                showSuccess(`Request ${savedReq.id} submitted for certification`);
            }
            setShowConfirmModal(false);
            resetForm();
        } catch (error) {
            console.error("Failed to submit request", error);
        }
    };

    const handleEditDraft = (req: WelfareRequest) => {
        setEditingDraft(req);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredRequests = requests.filter(req =>
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.welfareType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const draftCount = requests.filter(r => r.status === 'NEW').length;

    return (
        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-9 space-y-8">
                <h1 className="text-2xl font-bold text-primary dark:text-white">Welfare Request Management</h1>

                {/* Success Toast */}
                {successMessage && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <span className="material-symbols-outlined text-green-600">check_circle</span>
                        <p className="text-sm font-semibold text-green-700">{successMessage}</p>
                    </div>
                )}

                {/* Create/Edit Request Form */}
                <div key={formKey} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8 transition-colors">
                    <form onSubmit={handleSubmit(onFormValid)}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
                                <h2 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-tight">
                                    {editingDraft ? `Edit Draft — ${editingDraft.id}` : 'Create New Welfare Request'}
                                </h2>
                            </div>
                            {editingDraft && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded uppercase tracking-wider">
                                        Editing Draft
                                    </span>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                                        title="Cancel editing and start new"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Profile Display Info */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-6 transition-colors">
                                <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-tight">Employee Details</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">EPF Number</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{employeeProfile.epfNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Employee Name</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{employeeProfile.employeeName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Designation</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{employeeProfile.designation}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Date Joined</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{employeeProfile.dateJoined}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Branch</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{employeeProfile.branch}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields Matrix */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Welfare Type Selection <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('welfareType')}
                                        className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-800 ${errors.welfareType ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <option value="">Select Welfare Type</option>
                                        {welfareTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.welfareType && (
                                        <p className="text-xs text-red-500 mt-1">{errors.welfareType.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Employee Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('employeeType')}
                                        className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-800 ${errors.employeeType ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <option value="">Select Employee Type</option>
                                        {employeeTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.employeeType && (
                                        <p className="text-xs text-red-500 mt-1">{errors.employeeType.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Request Amount (LKR) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        {...register('amount')}
                                        className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-slate-700 dark:text-slate-100 ${errors.amount ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                                        placeholder="Special workplace allowance amount"
                                    />
                                    {errors.amount && (
                                        <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Special Remark
                                </label>
                                <textarea
                                    {...register('specialRemark')}
                                    rows={4}
                                    className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-slate-700 dark:text-slate-100 resize-none ${errors.specialRemark ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                                    placeholder="Add any special remarks regarding your request here..."
                                />
                                {errors.specialRemark && (
                                    <p className="text-xs text-red-500 mt-1">{errors.specialRemark.message}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Supporting Documents
                                    </label>
                                    {mandatoryDocsMissing && (
                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">warning</span>
                                            Upload supporting document to submit
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2">
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

                        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <button
                                type="submit"
                                onClick={triggerSaveAsDraft}
                                className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                            >
                                {editingDraft ? 'Update Draft' : 'Save as Draft'}
                            </button>
                            <div className="relative group">
                                <button
                                    type="submit"
                                    onClick={triggerSubmit}
                                    disabled={mandatoryDocsMissing}
                                    className={`px-10 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${mandatoryDocsMissing
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                        : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-orange-500/20'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                    Submit for Certification
                                </button>
                                {mandatoryDocsMissing && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        Upload a supporting document to submit
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Status Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight text-sm">Welfare Request Status</h2>
                            {draftCount > 0 && (
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">edit_note</span>
                                    {draftCount} draft{draftCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Search request ID or type..."
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Request ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Welfare Type</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Request Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${req.status === 'NEW' ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">{req.id}</td>
                                            <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{req.welfareType}</td>
                                            <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{req.dateOfRequest || '—'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <StatusBadge status={req.status as RequestStatus} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {req.status === 'NEW' && (
                                                        <button
                                                            onClick={() => handleEditDraft(req)}
                                                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${editingDraft?.id === req.id
                                                                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary'
                                                                }`}
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">
                                                                {editingDraft?.id === req.id ? 'edit_document' : 'edit'}
                                                            </span>
                                                            {editingDraft?.id === req.id ? 'Editing...' : 'Edit & Submit'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setViewRequest(req)}
                                                        className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                                            No requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Sidebar / Policies */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-full px-4 py-2 flex items-center gap-2 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-[11px] font-bold text-green-700 dark:text-green-400">Eligibility: Eligible for Welfare Benefits</span>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-1.5 bg-orange-50 dark:bg-orange-950/40 rounded-lg">
                            <span className="material-symbols-outlined text-primary text-lg">security</span>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-tight">Welfare Policies</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Processing Time</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Requests are typically reviewed within 7 working days.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Certification</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Your manager must certify your request before HR processing.</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 text-[10px] font-bold text-primary border-t border-slate-50 dark:border-slate-800 pt-4 flex items-center justify-center gap-1 hover:underline cursor-pointer">
                        Read Full Policy Documents <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-tight">Common Questions</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer">
                            How to tracking my status?
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer">
                            What documents are required?
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* View Welfare Request Modal */}
            {viewRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800 transition-colors">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">volunteer_activism</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Welfare Request Details</h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{viewRequest.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewRequest(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-400 cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Request Date</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{viewRequest.dateOfRequest || '—'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</p>
                                    <StatusBadge status={viewRequest.status as RequestStatus} />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Welfare Type</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{viewRequest.welfareType}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Amount Requested</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold text-primary">LKR {viewRequest.amount}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Employee Type</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{viewRequest.employeeType}</p>
                                </div>
                            </div>

                            {viewRequest.employeeRemarks && (
                                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Special Remark</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl italic">&quot;{viewRequest.employeeRemarks}&quot;</p>
                                </div>
                            )}

                            {viewRequest.documents.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Attached Documents</p>
                                    {viewRequest.documents.map((doc, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm max-w-sm transition-colors">
                                            <div className="w-8 h-8 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{doc.label}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{doc.filename}</p>
                                            </div>
                                            <button
                                                onClick={() => console.log('Downloading', doc.filename)}
                                                className="text-slate-300 dark:text-slate-500 hover:text-primary transition-colors cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-lg">download</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end border-t border-slate-100 dark:border-slate-800 transition-colors">
                            <button
                                onClick={() => setViewRequest(null)}
                                className="px-8 py-2.5 bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmSubmitModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmSubmit}
            />
        </div>
    );
}

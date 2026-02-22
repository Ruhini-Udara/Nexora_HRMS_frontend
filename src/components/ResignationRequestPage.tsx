import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// ── Types ───────────────────────────────────────────────────────────
type RequestStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

interface DocumentSlot {
    key: 'resignation_letter' | 'clearance_letter' | 'handover_checklist';
    label: string;
    icon: string;
    mandatory: boolean;
    file: File | null;
    existingName?: string; // For draft editing — previously uploaded filename
}

interface ResignationRequest {
    id: string;
    status: RequestStatus;
    reason: string;
    effectiveDate: string;
    remarks: string;
    documents: {
        resignation_letter?: string;
        clearance_letter?: string;
        handover_checklist?: string;
    };
    submittedAt?: string;
    createdAt: string;
}

// ── Zod Validation Schema ───────────────────────────────────────────
const resignationSchema = z.object({
    resignationReason: z.string().min(1, 'Reason for resignation is required'),
    effectiveDate: z.string().min(1, 'Resignation effective date is required'),
    remarks: z.string().optional(),
});

type ResignationFormData = z.infer<typeof resignationSchema>;

// ── Mock Leave Balance Data ─────────────────────────────────────────
const leaveBalances = [
    { type: 'Annual Leave', total: 14, used: 6, remaining: 8, color: '#8B3A00', bg: '#FEF3EB' },
    { type: 'Sick Leave', total: 7, used: 2, remaining: 5, color: '#0D9488', bg: '#F0FDFA' },
    { type: 'Casual Leave', total: 7, used: 4, remaining: 3, color: '#6366F1', bg: '#EEF2FF' },
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
        <div className={`rounded-xl border p-5 transition-all ${hasFile ? 'border-green-200 bg-green-50/30' : slot.mandatory ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50/30'}`}>
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={handleChange}
            />
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${hasFile ? 'bg-green-100' : 'bg-slate-100'}`}>
                    <span className={`material-symbols-outlined text-lg ${hasFile ? 'text-green-600' : 'text-slate-400'}`}>
                        {hasFile ? 'check_circle' : slot.icon}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800">{slot.label}</p>
                        {slot.mandatory ? (
                            <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase">Required</span>
                        ) : (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">Optional</span>
                        )}
                    </div>

                    {hasFile ? (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                            <p className="text-[11px] text-slate-600 truncate">{fileName}</p>
                            {slot.file && (
                                <p className="text-[10px] text-slate-400 flex-shrink-0">({formatFileSize(slot.file.size)})</p>
                            )}
                            {!disabled && (
                                <button
                                    type="button"
                                    className="ml-auto text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                    onClick={() => onRemove(slot.key)}
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="mt-2 text-[11px] font-bold text-[#8B3A00] hover:underline flex items-center gap-1 disabled:opacity-40 disabled:no-underline"
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
    const statusConfig: Record<RequestStatus, { label: string; color: string; bg: string }> = {
        DRAFT: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
        SUBMITTED: { label: 'Pending Approval', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        APPROVED: { label: 'Approved', color: 'text-green-600', bg: 'bg-green-50' },
        REJECTED: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50' },
    };
    const cfg = statusConfig[request.status];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B3A00] text-[20px]">info</span>
                <h2 className="font-bold text-slate-800 text-sm">Active Resignation Request</h2>
            </div>
            <div className="p-8">
                <div className="flex items-center gap-4 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-amber-600 text-2xl">pending_actions</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-sm">You already have an active resignation request</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Request <span className="font-bold">{request.id}</span> is currently <span className={`font-bold ${cfg.color}`}>{cfg.label}</span>.
                            You cannot create a new request until the existing one is resolved.
                        </p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                    </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reason</p>
                        <p className="text-sm text-slate-700">{request.reason}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Effective Date</p>
                        <p className="text-sm text-slate-700">{request.effectiveDate}</p>
                    </div>
                    {request.remarks && (
                        <div className="col-span-2 space-y-1">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remarks</p>
                            <p className="text-sm text-slate-700">{request.remarks}</p>
                        </div>
                    )}
                </div>

                {/* Documents attached */}
                <div className="mt-6 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Documents Submitted</p>
                    <div className="flex flex-wrap gap-2">
                        {request.documents.resignation_letter && (
                            <span className="text-[11px] text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">check_circle</span> Resignation Letter
                            </span>
                        )}
                        {request.documents.clearance_letter && (
                            <span className="text-[11px] text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">check_circle</span> Obligations Clearance
                            </span>
                        )}
                        {request.documents.handover_checklist && (
                            <span className="text-[11px] text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
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
}

const ResignationRequestPage: React.FC<ResignationRequestPageProps> = ({ requests, onRequestChange }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // ── Document slots state ────────────────────────────────────────
    const [docSlots, setDocSlots] = useState<DocumentSlot[]>([
        { key: 'resignation_letter', label: 'Resignation Letter', icon: 'description', mandatory: true, file: null },
        { key: 'clearance_letter', label: 'Obligations Clearance Letter', icon: 'fact_check', mandatory: true, file: null },
        { key: 'handover_checklist', label: 'Employee Handover Checklist', icon: 'checklist', mandatory: false, file: null },
    ]);

    // ── Determine active request & form mode ────────────────────────
    const activeRequest = requests.find((r) => r.status !== 'REJECTED');
    const draftRequest = requests.find((r) => r.status === 'DRAFT');
    const isEditing = draftRequest !== undefined;
    const showForm = !activeRequest || activeRequest.status === 'DRAFT';
    const submittedRequest = activeRequest && activeRequest.status !== 'DRAFT' ? activeRequest : null;

    // ── react-hook-form + Zod ───────────────────────────────────────
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<ResignationFormData>({
        resolver: zodResolver(resignationSchema),
        defaultValues: {
            resignationReason: draftRequest?.reason || '',
            effectiveDate: draftRequest?.effectiveDate || '',
            remarks: draftRequest?.remarks || '',
        },
    });

    // Initialize doc slots from draft if editing
    React.useEffect(() => {
        if (draftRequest) {
            setDocSlots((prev) =>
                prev.map((slot) => ({
                    ...slot,
                    existingName: draftRequest.documents[slot.key] || undefined,
                }))
            );
        }
    }, [draftRequest]);

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
    const buildPayload = (data: ResignationFormData, status: RequestStatus): ResignationRequest => ({
        id: draftRequest?.id || `RES-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
        status,
        reason: data.resignationReason,
        effectiveDate: data.effectiveDate,
        remarks: data.remarks || '',
        documents: {
            resignation_letter: docSlots.find((s) => s.key === 'resignation_letter')?.file?.name
                || docSlots.find((s) => s.key === 'resignation_letter')?.existingName,
            clearance_letter: docSlots.find((s) => s.key === 'clearance_letter')?.file?.name
                || docSlots.find((s) => s.key === 'clearance_letter')?.existingName,
            handover_checklist: docSlots.find((s) => s.key === 'handover_checklist')?.file?.name
                || docSlots.find((s) => s.key === 'handover_checklist')?.existingName,
        },
        createdAt: draftRequest?.createdAt || new Date().toISOString(),
        submittedAt: status === 'SUBMITTED' ? new Date().toISOString() : undefined,
    });

    // ── Actions ─────────────────────────────────────────────────────
    const handleSaveAsDraft = () => {
        const values = getValues();
        const payload = buildPayload(values, 'DRAFT');
        // TODO: Replace with actual API call
        console.log('Draft saved:', payload);

        // Update local state
        const updated = requests.filter((r) => r.id !== payload.id);
        updated.push(payload);
        onRequestChange(updated);
    };

    const onSubmitValid = () => {
        if (mandatoryDocsMissing) return; // safety guard
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = () => {
        const values = getValues();
        const payload = buildPayload(values, 'SUBMITTED');
        // TODO: Replace with actual API call
        console.log('Submitted:', payload);

        const updated = requests.filter((r) => r.id !== payload.id);
        updated.push(payload);
        onRequestChange(updated);
        setShowConfirmModal(false);
    };

    // ── Render: Active submitted request banner ─────────────────────
    if (submittedRequest) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <ActiveRequestBanner request={submittedRequest} />
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-80 space-y-6">
                        <SidebarPanel />
                    </div>
                </div>

                <ConfirmSubmitModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmSubmit}
                />
            </div>
        );
    }

    // ── Render: Form (new or edit draft) ────────────────────────────
    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    <form onSubmit={handleSubmit(onSubmitValid)}>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#8B3A00] text-[20px]">assignment_late</span>
                                    <h2 className="font-bold text-slate-800 text-sm">
                                        {isEditing ? 'Edit Draft — Resign Request' : 'Create Resign Request'}
                                    </h2>
                                </div>
                                {isEditing && (
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded uppercase tracking-wider">
                                        Draft
                                    </span>
                                )}
                            </div>
                            <div className="p-8 space-y-8">

                                {/* Form Fields */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Reason for Resignation <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            {...register('resignationReason')}
                                            className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 bg-white ${errors.resignationReason ? 'border-red-400' : 'border-slate-200'}`}
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
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Resignation Effective Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            {...register('effectiveDate')}
                                            className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 ${errors.effectiveDate ? 'border-red-400' : 'border-slate-200'}`}
                                        />
                                        {errors.effectiveDate && (
                                            <p className="text-xs text-red-500 mt-1">{errors.effectiveDate.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Leave Balance Display */}
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Leave Balance Summary</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {leaveBalances.map((leave) => (
                                            <div
                                                key={leave.type}
                                                className="rounded-xl border border-slate-200 p-4"
                                                style={{ backgroundColor: leave.bg }}
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
                                                    <p className="text-xs font-bold text-slate-700">{leave.type}</p>
                                                </div>
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <p className="text-2xl font-bold" style={{ color: leave.color }}>{leave.remaining}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Remaining</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500">
                                                            <span className="font-bold text-slate-600">{leave.used}</span> / {leave.total} used
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

                                {/* Remarks */}
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Remarks <span className="text-slate-400 normal-case font-normal">(Optional — Exit Feedback)</span>
                                    </label>
                                    <textarea
                                        {...register('remarks')}
                                        rows={4}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700 resize-none"
                                        placeholder="Please share any feedback or specific reasons for your departure..."
                                    />
                                </div>

                                {/* Categorized Document Uploads */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Required Documents
                                        </label>
                                        {mandatoryDocsMissing && (
                                            <span className="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
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
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    type="button"
                                    className="px-8 py-3 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 text-sm hover:bg-slate-100 transition-all"
                                    onClick={handleSaveAsDraft}
                                >
                                    {isEditing ? 'Update Draft' : 'Save as Draft'}
                                </button>
                                <div className="flex items-center gap-3">
                                    <button type="button" className="px-8 py-3 border border-slate-200 rounded-lg font-bold text-slate-400 text-sm">
                                        Back
                                    </button>
                                    <div className="relative group">
                                        <button
                                            type="submit"
                                            disabled={mandatoryDocsMissing}
                                            className={`px-10 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${mandatoryDocsMissing
                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                    : 'bg-[#8B3A00] text-white hover:opacity-90 shadow-lg shadow-[#8B3A00]/10'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">send</span>
                                            Submit Request
                                        </button>
                                        {mandatoryDocsMissing && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                Upload Resignation Letter & Obligations Clearance Letter to submit
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    <SidebarPanel />
                </div>
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#FFF7F2] rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#8B3A00] text-xl">info</span>
                </div>
                <h2 className="font-bold text-slate-800 text-sm">Resignation Policy</h2>
            </div>
            <ul className="space-y-4">
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                    <div>
                        <p className="text-xs font-bold text-slate-800">Notice Period</p>
                        <p className="text-[11px] text-slate-500 mt-1">A minimum of 30 days notice period is required for all resignations.</p>
                    </div>
                </li>
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                    <div>
                        <p className="text-xs font-bold text-slate-800">Knowledge Transfer</p>
                        <p className="text-[11px] text-slate-500 mt-1">Complete all assigned KT sessions before the last working day.</p>
                    </div>
                </li>
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                    <div>
                        <p className="text-xs font-bold text-slate-800">Exit Interview</p>
                        <p className="text-[11px] text-slate-500 mt-1">An HR representative will schedule a mandatory exit interview.</p>
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
            <p className="text-xs text-slate-600 leading-relaxed mb-4">Contact HR Operations for queries regarding notice period, final settlement, or exit clearance process.</p>
            <button className="w-full py-2 bg-[#FFC5C0] text-slate-800 font-bold rounded-lg text-xs hover:opacity-90 transition-colors">
                Contact HR
            </button>
        </div>
    </>
);

export default ResignationRequestPage;

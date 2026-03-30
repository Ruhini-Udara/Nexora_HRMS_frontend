"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Types ───────────────────────────────────────────────────────────
export type TerminationStatus = 'NEW' | 'SUBMITTED_FOR_APPROVAL' | 'ADDED_TO_TERMINATION_APPROVAL_LIST' | 'BOARD_ASSIGNED';

interface DocumentSlot {
    key: 'request_for_termination' | 'loan_clearance_letter' | 'other_document';
    label: string;
    icon: string;
    mandatory: boolean;
    file: File | null;
}

export interface TerminationRequest {
    id: string;
    employeeName: string;
    epfNumber: string;
    branch: string;
    status: TerminationStatus;
    type: string;
    reason: string;
    initiationDate: string;
    effectiveDate: string;
    specialRemark: string;
    documents: {
        request_for_termination?: string;
        loan_clearance_letter?: string;
        other_document?: string;
    };
}

// ── Zod Validation Schema ───────────────────────────────────────────
const terminationSchema = z.object({
    employeeName: z.string().min(1, 'Employee name is required'),
    epfNumber: z.string().min(1, 'EPF number is required'),
    branch: z.string().min(1, 'Branch is required'),
    terminationType: z.string().min(1, 'Termination type is required'),
    reason: z.string().min(1, 'Reason for termination is required'),
    initiationDate: z.string().min(1, 'Initiation date is required'),
    effectiveDate: z.string().min(1, 'Effective date is required'),
    specialRemark: z.string().optional(),
});

type TerminationFormData = z.infer<typeof terminationSchema>;

const terminationTypes = [
    'Voluntary (Resignation)',
    'Involuntary (Dismissal)',
    'Mutual Agreement',
    'Retirement',
    'End of Contract'
];

// ── Document Upload Card ────────────────────────────────────────────
interface DocUploadCardProps {
    slot: DocumentSlot;
    onUpload: (key: DocumentSlot['key'], file: File) => void;
    onRemove: (key: DocumentSlot['key']) => void;
}

const DocUploadCard: React.FC<DocUploadCardProps> = ({ slot, onUpload, onRemove }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const hasFile = slot.file !== null;
    const fileName = slot.file?.name || '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onUpload(slot.key, e.target.files[0]);
        }
    };

    return (
        <div className={`rounded-xl border p-5 transition-all ${hasFile ? 'border-green-200 bg-green-50/30' : slot.mandatory ? 'border-amber-200 bg-amber-50/10' : 'border-dashed border-slate-200 bg-slate-50/30'}`}>
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
                            <button
                                type="button"
                                className="ml-auto text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                onClick={() => onRemove(slot.key)}
                            >
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="mt-2 text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                            onClick={() => inputRef.current?.click()}
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

// ── Main Form Component ─────────────────────────────────────────────
interface TerminationRequestFormProps {
    onSave: (request: TerminationRequest) => void;
    onCancel: () => void;
    initialData?: TerminationRequest;
    isReadOnly?: boolean;
}

export function TerminationRequestForm({ onSave, onCancel, initialData, isReadOnly = false }: TerminationRequestFormProps) {
    const [showAckPopup, setShowAckPopup] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<TerminationRequest | null>(null);

    const [docSlots, setDocSlots] = useState<DocumentSlot[]>([
        { 
            key: 'request_for_termination', 
            label: 'Request for Termination', 
            icon: 'description', 
            mandatory: true, 
            file: initialData?.documents?.request_for_termination ? new File([], initialData.documents.request_for_termination) : null 
        },
        { 
            key: 'loan_clearance_letter', 
            label: 'Loan Clearance Letter', 
            icon: 'fact_check', 
            mandatory: true, 
            file: initialData?.documents?.loan_clearance_letter ? new File([], initialData.documents.loan_clearance_letter) : null 
        },
    ]);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<TerminationFormData>({
        resolver: zodResolver(terminationSchema),
        defaultValues: {
            employeeName: initialData?.employeeName || '',
            epfNumber: initialData?.epfNumber || '',
            branch: initialData?.branch || '',
            terminationType: initialData?.type || '',
            reason: initialData?.reason || '',
            initiationDate: initialData?.initiationDate || new Date().toISOString().split('T')[0],
            effectiveDate: initialData?.effectiveDate || '',
            specialRemark: initialData?.specialRemark || '',
        },
    });

    const handleDocUpload = useCallback((key: DocumentSlot['key'], file: File) => {
        setDocSlots((prev) =>
            prev.map((slot) =>
                slot.key === key ? { ...slot, file } : slot
            )
        );
    }, []);

    const handleDocRemove = useCallback((key: DocumentSlot['key']) => {
        setDocSlots((prev) =>
            prev.map((slot) =>
                slot.key === key ? { ...slot, file: null } : slot
            )
        );
    }, []);

    const mandatoryDocsMissing = docSlots.filter(s => s.mandatory).some(s => s.file === null);

    const buildPayload = (data: TerminationFormData, status: TerminationStatus): TerminationRequest => ({
        id: initialData?.id || `TRM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
        employeeName: data.employeeName,
        epfNumber: data.epfNumber,
        branch: data.branch,
        status,
        type: data.terminationType,
        reason: data.reason,
        initiationDate: data.initiationDate,
        effectiveDate: data.effectiveDate,
        specialRemark: data.specialRemark || '',
        documents: {
            request_for_termination: docSlots.find(s => s.key === 'request_for_termination')?.file?.name,
            loan_clearance_letter: docSlots.find(s => s.key === 'loan_clearance_letter')?.file?.name,
        },
    });

    const handleSaveAsNew = () => {
        const values = getValues();
        const payload = buildPayload(values, 'NEW');
        onSave(payload);
    };

    const onSubmitValid = (data: TerminationFormData) => {
        if (mandatoryDocsMissing) return;
        const payload = buildPayload(data, 'SUBMITTED_FOR_APPROVAL');
        setPendingPayload(payload);
        setShowAckPopup(true);
    };

    const confirmSubmit = () => {
        if (pendingPayload) {
            onSave(pendingPayload);
            setShowAckPopup(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit(onSubmitValid)} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-2xl">person_remove</span>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                        {isReadOnly ? 'View Termination Request' : initialData ? 'Edit Termination Request' : 'New Termination Request'}
                    </h2>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Employee Name *</label>
                            <Input {...register('employeeName')} placeholder="e.g. Kasun Perera" readOnly={isReadOnly} disabled={isReadOnly} />
                            {errors.employeeName && <p className="text-xs text-red-500">{errors.employeeName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">EPF Number *</label>
                            <Input {...register('epfNumber')} placeholder="e.g. 12345" readOnly={isReadOnly} disabled={isReadOnly} />
                            {errors.epfNumber && <p className="text-xs text-red-500">{errors.epfNumber.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Branch *</label>
                            <Input {...register('branch')} placeholder="e.g. Colombo Branch" readOnly={isReadOnly} disabled={isReadOnly} />
                            {errors.branch && <p className="text-xs text-red-500">{errors.branch.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Termination Type *</label>
                            <select
                                {...register('terminationType')}
                                disabled={isReadOnly}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                            >
                                <option value="">Select Type</option>
                                {terminationTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {errors.terminationType && <p className="text-xs text-red-500">{errors.terminationType.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Initiate Date *</label>
                            <Input type="date" {...register('initiationDate')} readOnly={isReadOnly} disabled={isReadOnly} />
                            {errors.initiationDate && <p className="text-xs text-red-500">{errors.initiationDate.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Reason for Termination *</label>
                        <textarea
                            {...register('reason')}
                            rows={3}
                            readOnly={isReadOnly} 
                            disabled={isReadOnly}
                            className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 disabled:opacity-50"
                            placeholder="Detailed reason for termination..."
                        />
                        {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Effective Date *</label>
                            <Input type="date" {...register('effectiveDate')} readOnly={isReadOnly} disabled={isReadOnly} />
                            {errors.effectiveDate && <p className="text-xs text-red-500">{errors.effectiveDate.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Special Remarks</label>
                        <textarea
                            {...register('specialRemark')}
                            rows={2}
                            readOnly={isReadOnly} 
                            disabled={isReadOnly}
                            className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 disabled:opacity-50"
                            placeholder="Optional remarks..."
                        />
                    </div>

                    {/* Documents */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Required Documents</label>
                             {mandatoryDocsMissing && (
                                <span className="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">warning</span>
                                    Req/Clearance are mandatory to Submit
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

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        {isReadOnly ? 'Close' : 'Cancel'}
                    </Button>
                    {!isReadOnly && (
                        <div className="flex items-center gap-3">
                            <Button type="button" variant="outline" onClick={handleSaveAsNew}>
                                {initialData ? 'Update Request' : 'Save as New'}
                            </Button>
                            <Button type="submit" disabled={mandatoryDocsMissing}>
                                Submit for Approval
                            </Button>
                        </div>
                    )}
                </div>
            </form>

            {/* Acknowledgement Popup */}
            {showAckPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                            <h3 className="font-bold text-slate-800 dark:text-white">User Acknowledgement</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                I verify that the submitted documents (Request for Termination with immediate supervisor remarks and Loan Clearance Letter covering all direct/indirect obligations) are accurate and complete. Once submitted for approval, the termination process will be initiated.
                            </p>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowAckPopup(false)}>
                                Cancel
                            </Button>
                            <Button onClick={confirmSubmit}>
                                Accept & Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

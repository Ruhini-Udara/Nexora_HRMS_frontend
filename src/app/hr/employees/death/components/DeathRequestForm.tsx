"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeathRequest } from './DeathRequestList';

interface DocumentSlot {
    key: 'deathCertificate' | 'nomineeId' | 'requestLetter';
    label: string;
    icon: string;
    mandatory: boolean;
    file: File | null;
}

const deathSchema = z.object({
    employeeName: z.string().min(1, 'Employee name is required'),
    epfNumber: z.string().min(1, 'EPF number is required'),
    dateOfDeath: z.string().min(1, 'Date of death is required'),
    natureOfDeath: z.string().min(1, 'Nature of death is required'),
    requesterName: z.string().min(1, 'Requester name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    address: z.string().min(1, 'Address is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
    specialRemark: z.string().optional(),
    
    // Nominee fields
    nomineeName: z.string().optional(),
    nomineeBank: z.string().optional(),
    nomineeBranch: z.string().optional(),
    nomineeAccount: z.string().optional(),
});

type DeathFormData = z.infer<typeof deathSchema>;

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

interface DeathRequestFormProps {
    onSave: (request: DeathRequest) => void;
    onCancel: () => void;
    initialData?: DeathRequest;
    isReadOnly?: boolean;
}

const generateRequestId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `DTH-${new Date().getFullYear()}-${timestamp}`;
};

export function DeathRequestForm({ onSave, onCancel, initialData, isReadOnly = false }: DeathRequestFormProps) {
    const [showAckPopup, setShowAckPopup] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<DeathRequest | null>(null);

    const [docSlots, setDocSlots] = useState<DocumentSlot[]>([
        { 
            key: 'deathCertificate', 
            label: 'Death Certificate', 
            icon: 'description', 
            mandatory: true, 
            file: initialData?.documents?.deathCertificate ? new File([], initialData.documents.deathCertificate) : null 
        },
        { 
            key: 'nomineeId', 
            label: 'Nominee ID Copy', 
            icon: 'badge', 
            mandatory: true, 
            file: initialData?.documents?.nomineeId ? new File([], initialData.documents.nomineeId) : null 
        },
        { 
            key: 'requestLetter', 
            label: 'Request Letter', 
            icon: 'mail', 
            mandatory: true, 
            file: initialData?.documents?.requestLetter ? new File([], initialData.documents.requestLetter) : null 
        },
    ]);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<DeathFormData>({
        resolver: zodResolver(deathSchema),
        defaultValues: {
            employeeName: initialData?.employeeName || '',
            epfNumber: initialData?.epfNumber || '',
            dateOfDeath: initialData?.dateOfDeath || '',
            natureOfDeath: initialData?.natureOfDeath || '',
            requesterName: initialData?.requesterName || '',
            relationship: initialData?.relationship || '',
            address: initialData?.address || '',
            contactNumber: initialData?.contactNumber || '',
            specialRemark: initialData?.specialRemark || '',
            nomineeName: initialData?.nomineeName || '',
            nomineeBank: initialData?.nomineeBank || '',
            nomineeBranch: initialData?.nomineeBranch || '',
            nomineeAccount: initialData?.nomineeAccount || '',
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

    const buildPayload = (data: DeathFormData, status: DeathRequest['status']): DeathRequest => ({
        id: initialData?.id || generateRequestId(),
        employeeName: data.employeeName,
        epfNumber: data.epfNumber,
        dateOfDeath: data.dateOfDeath,
        natureOfDeath: data.natureOfDeath,
        requesterName: data.requesterName,
        relationship: data.relationship,
        address: data.address,
        contactNumber: data.contactNumber,
        specialRemark: data.specialRemark || '',
        status,
        nomineeName: data.nomineeName,
        nomineeBank: data.nomineeBank,
        nomineeBranch: data.nomineeBranch,
        nomineeAccount: data.nomineeAccount,
        documents: {
            deathCertificate: docSlots.find(s => s.key === 'deathCertificate')?.file?.name,
            nomineeId: docSlots.find(s => s.key === 'nomineeId')?.file?.name,
            requestLetter: docSlots.find(s => s.key === 'requestLetter')?.file?.name,
        },
    });

    const handleSaveAsNew = () => {
        const values = getValues();
        const payload = buildPayload(values, 'NEW');
        onSave(payload);
    };

    const onSubmitValid = (data: DeathFormData) => {
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
                    <span className="material-symbols-outlined text-primary text-2xl">sentiment_very_dissatisfied</span>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                        {isReadOnly ? 'View Employee Death Request' : initialData ? 'Edit Employee Death Request' : 'New Employee Death Request'}
                    </h2>
                </div>
                
                <div className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold border-b pb-2">Basic Information</h3>
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
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Date of Death *</label>
                                <Input type="date" {...register('dateOfDeath')} readOnly={isReadOnly} disabled={isReadOnly} />
                                {errors.dateOfDeath && <p className="text-xs text-red-500">{errors.dateOfDeath.message}</p>}
                            </div>
                            <div className="space-y-2 lg:col-span-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Nature of Death *</label>
                                <Input {...register('natureOfDeath')} placeholder="e.g. Natural, Accident, etc." readOnly={isReadOnly} disabled={isReadOnly} />
                                {errors.natureOfDeath && <p className="text-xs text-red-500">{errors.natureOfDeath.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Requester Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold border-b pb-2">Requester Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Requester Name *</label>
                                <Input {...register('requesterName')} placeholder="Name of person reporting" readOnly={isReadOnly} disabled={isReadOnly} />
                                {errors.requesterName && <p className="text-xs text-red-500">{errors.requesterName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Relationship to Employee *</label>
                                <Input {...register('relationship')} placeholder="e.g. Spouse, Sibling" readOnly={isReadOnly} disabled={isReadOnly} />
                                {errors.relationship && <p className="text-xs text-red-500">{errors.relationship.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Contact Number *</label>
                                <Input {...register('contactNumber')} placeholder="Phone number" readOnly={isReadOnly} disabled={isReadOnly} />
                                {errors.contactNumber && <p className="text-xs text-red-500">{errors.contactNumber.message}</p>}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Address *</label>
                                <Input {...register('address')} placeholder="Current address" readOnly={isReadOnly} disabled={isReadOnly} />
                                {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Nominee Info */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-semibold">Nominee Details</h3>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">If different from Requester or updating</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Nominee Name</label>
                                <Input {...register('nomineeName')} placeholder="Full name of nominee" readOnly={isReadOnly} disabled={isReadOnly} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Bank Name</label>
                                <Input {...register('nomineeBank')} placeholder="e.g. Bank of Ceylon" readOnly={isReadOnly} disabled={isReadOnly} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Branch Name</label>
                                <Input {...register('nomineeBranch')} placeholder="e.g. Colombo City" readOnly={isReadOnly} disabled={isReadOnly} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Account Number</label>
                                <Input {...register('nomineeAccount')} placeholder="e.g. 1234567890" readOnly={isReadOnly} disabled={isReadOnly} />
                            </div>
                        </div>
                    </div>

                    {/* Special Remarks */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Special Remarks</label>
                        <textarea
                            {...register('specialRemark')}
                            rows={3}
                            readOnly={isReadOnly} 
                            disabled={isReadOnly}
                            className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 disabled:opacity-50"
                            placeholder="Any additional details..."
                        />
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-semibold">Required Documents</h3>
                             {mandatoryDocsMissing && !isReadOnly && (
                                <span className="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">warning</span>
                                    All documents are mandatory to Submit
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                {initialData ? 'Update Request' : 'Save as Draft (NEW)'}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-xl">info</span>
                            <h3 className="font-bold text-slate-800 dark:text-white">Submit Application</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Are you sure you want to submit this Employee Death application? Once submitted, the application cannot be edited and will be sent for Director approval.
                            </p>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowAckPopup(false)}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={confirmSubmit}>
                                Confirm & Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeathRequest } from '@/lib/api/deathRequests';

interface DocumentSlot {
    key: 'deathCertificate' | 'nomineeId' | 'requestLetter';
    label: string;
    icon: string;
    mandatory: boolean;
    file: File | null;
    existingName?: string;
}

const deathSchema = z.object({
    employeeName: z.string().min(1, 'Employee name is required'),
    epfNumber: z.string().min(1, 'EPF number is required'),
    dateOfDeath: z.string().min(1, 'Date of death is required'),
    natureOfDeath: z.string().min(1, 'Nature of death is required'),
    requesterName: z.string().min(1, 'Requester name is required'),
    requesterBranch: z.string().min(1, 'Branch/Department is required'),
    requesterDesignation: z.string().min(1, 'Requester designation is required'),
    requesterEmpId: z.string().min(1, 'Requester Emp ID is required'),
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
    isReadOnly?: boolean;
}

const DocUploadCard: React.FC<DocUploadCardProps> = ({ slot, onUpload, onRemove, isReadOnly }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const hasFile = !!slot.file || !!slot.existingName;
    const fileName = slot.file?.name || slot.existingName || '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onUpload(slot.key, file);
    };

    return (
        <div className={`p-4 rounded-xl border transition-all ${hasFile ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-900/10' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50'}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${hasFile ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-200 dark:bg-slate-800'}`}>
                        <span className={`material-symbols-outlined text-[20px] ${hasFile ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {hasFile ? 'check_circle' : slot.icon}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{slot.label} {slot.mandatory && <span className="text-red-500">*</span>}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{hasFile ? fileName : 'No file selected'}</p>
                    </div>
                </div>
                {!isReadOnly && (
                    hasFile ? (
                        <button type="button" onClick={() => onRemove(slot.key)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    ) : (
                        <button type="button" onClick={() => inputRef.current?.click()} className="text-[#8B3A00] hover:text-[#8B3A00]/80 transition-colors shrink-0 cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">upload</span>
                        </button>
                    )
                )}
            </div>
            <input type="file" ref={inputRef} onChange={handleChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
        </div>
    );
};

interface DeathRequestFormProps {
    initialData?: DeathRequest;
    onSave: (data: DeathRequest) => void;
    onCancel: () => void;
    isReadOnly?: boolean;
    hideFooter?: boolean;
    onVerify?: () => void;
    onReject?: () => void;
}

export function DeathRequestForm({ 
    initialData, 
    onSave, 
    onCancel, 
    isReadOnly = false, 
    hideFooter = false,
    onVerify,
    onReject
}: DeathRequestFormProps) {
    const [showAckPopup, setShowAckPopup] = useState(false);
    const [docError, setDocError] = useState(false);
    const [docSlots, setDocSlots] = useState<DocumentSlot[]>([
        { key: 'deathCertificate', label: 'Death Certificate', icon: 'description', mandatory: true, file: null },
        { key: 'nomineeId', label: 'Nominee Identity', icon: 'badge', mandatory: true, file: null },
        { key: 'requestLetter', label: 'Request Letter', icon: 'mail', mandatory: true, file: null },
    ]);

    const { register, handleSubmit, formState: { errors }, getValues, reset } = useForm<DeathFormData>({
        resolver: zodResolver(deathSchema),
        defaultValues: {
            employeeName: '',
            epfNumber: '',
            dateOfDeath: '',
            natureOfDeath: 'Natural',
            requesterName: '',
            requesterBranch: '',
            requesterDesignation: '',
            requesterEmpId: '',
            address: '',
            contactNumber: '',
            specialRemark: '',
        }
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
            setDocSlots(prev => prev.map(slot => ({
                ...slot,
                file: null,
                existingName: initialData.documents[slot.key as keyof typeof initialData.documents] || undefined
            })));
        }
    }, [initialData, reset]);

    const handleDocUpload = (key: DocumentSlot['key'], file: File) => {
        setDocSlots(prev => prev.map(s => s.key === key ? { ...s, file, existingName: undefined } : s));
        setDocError(false);
    };

    const handleDocRemove = (key: DocumentSlot['key']) => {
        setDocSlots(prev => prev.map(s => s.key === key ? { ...s, file: null, existingName: undefined } : s));
    };

    const isAnyDocMissing = () => {
        return docSlots.some(s => s.mandatory && !s.file && !s.existingName);
    };

    const onSubmit = (data: DeathFormData) => {
        if (isAnyDocMissing()) {
            setDocError(true);
            return;
        }
        setShowAckPopup(true);
    };

    const buildDocumentsPayload = () => {
        return docSlots.reduce((acc, slot) => {
            acc[slot.key] = slot.file?.name || slot.existingName || '';
            return acc;
        }, {} as Record<string, string>);
    };

    const confirmSubmit = () => {
        const formData = getValues();
        const documents = buildDocumentsPayload();
        onSave({ 
            ...formData, 
            specialRemark: formData.specialRemark || '',
            id: initialData?.id || `DTH-${Date.now()}`, 
            status: 'SUBMITTED', 
            documents: documents as any
        });
        setShowAckPopup(false);
    };

    const handleSaveAsDraft = () => {
        const formData = getValues();
        const documents = buildDocumentsPayload();
        onSave({ 
            ...formData, 
            specialRemark: formData.specialRemark || '',
            id: initialData?.id || `DTH-${Date.now()}`, 
            status: 'NEW', 
            documents: documents as any
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] w-full max-w-4xl">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#8B3A00] text-2xl">person_remove</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {initialData ? (isReadOnly ? 'Death Application Details' : 'Edit Death Application') : 'New Death Application'}
                        </h3>
                        <p className="text-sm text-slate-500">Employee Death Benefit Claim Process</p>
                    </div>
                </div>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Form wrapping both content and footer to support submit button */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Section: Employee Information */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-bold text-[#8B3A00] uppercase tracking-widest border-b border-[#8B3A00]/10 pb-2">Employee Information (Deceased)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Employee Name *</label>
                                <input {...register('employeeName')} readOnly={isReadOnly} className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.employeeName ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.employeeName && <p className="text-[10px] text-red-500 mt-1">{errors.employeeName.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">EPF Number *</label>
                                <input {...register('epfNumber')} readOnly={isReadOnly} className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.epfNumber ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.epfNumber && <p className="text-[10px] text-red-500 mt-1">{errors.epfNumber.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section: Claim Details */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-bold text-[#8B3A00] uppercase tracking-widest border-b border-[#8B3A00]/10 pb-2">Claim Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Date of Death *</label>
                                <input type="date" {...register('dateOfDeath')} readOnly={isReadOnly} className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.dateOfDeath ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all cursor-pointer`} />
                                {errors.dateOfDeath && <p className="text-[10px] text-red-500 mt-1">{errors.dateOfDeath.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Nature of Death *</label>
                                <select {...register('natureOfDeath')} disabled={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all cursor-pointer">
                                    <option value="Natural">Natural</option>
                                    <option value="Accident">Accident</option>
                                    <option value="Sickness">Sickness</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Requester Information */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-bold text-[#8B3A00] uppercase tracking-widest border-b border-[#8B3A00]/10 pb-2">Requester Information (Senior Officer)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Requester Name *</label>
                                <input {...register('requesterName')} readOnly={isReadOnly} className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.requesterName ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.requesterName && <p className="text-[10px] text-red-500 mt-1">{errors.requesterName.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Requester Emp ID *</label>
                                <input {...register('requesterEmpId')} readOnly={isReadOnly} className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.requesterEmpId ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.requesterEmpId && <p className="text-[10px] text-red-500 mt-1">{errors.requesterEmpId.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Requester Designation *</label>
                                <input {...register('requesterDesignation')} readOnly={isReadOnly} className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.requesterDesignation ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.requesterDesignation && <p className="text-[10px] text-red-500 mt-1">{errors.requesterDesignation.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Branch/Department *</label>
                                <input {...register('requesterBranch')} readOnly={isReadOnly} className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.requesterBranch ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.requesterBranch && <p className="text-[10px] text-red-500 mt-1">{errors.requesterBranch.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Contact Number *</label>
                                <input {...register('contactNumber')} readOnly={isReadOnly} className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.contactNumber ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.contactNumber && <p className="text-[10px] text-red-500 mt-1">{errors.contactNumber.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Official Address *</label>
                                <input {...register('address')} readOnly={isReadOnly} className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.address ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.address && <p className="text-[10px] text-red-500 mt-1">{errors.address.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section: Nominee Information */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-bold text-[#8B3A00] uppercase tracking-widest border-b border-[#8B3A00]/10 pb-2">Nominee Information (For Benefit Payment)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Nominee Name</label>
                                <input {...register('nomineeName')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Bank Name</label>
                                <input {...register('nomineeBank')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Branch Name</label>
                                <input {...register('nomineeBranch')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Account Number</label>
                                <input {...register('nomineeAccount')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Documents */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#8B3A00]/10 pb-2">
                            <h4 className="text-[11px] font-bold text-[#8B3A00] uppercase tracking-widest">Required Documents</h4>
                            {docError && (
                                <span className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded font-bold flex items-center gap-1 animate-pulse">
                                    <span className="material-symbols-outlined text-xs">warning</span>
                                    All 3 documents are required for submission
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
                                    isReadOnly={isReadOnly}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Special Remark</label>
                        <textarea {...register('specialRemark')} readOnly={isReadOnly} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all resize-none" placeholder="Enter any additional information..." />
                    </div>
                </div>

                {/* Fixed Footer Actions */}
                {!hideFooter && (
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 shrink-0">
                        {isReadOnly ? (
                            initialData?.status === 'SUBMITTED' && onVerify && onReject ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={onReject}
                                        className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                                    >
                                        Reject Application
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onVerify}
                                        className="px-6 py-2.5 bg-[#8B3A00] hover:bg-[#8B3A00]/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">verified</span>
                                        Verify & Add to Admin List
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                            )
                        ) : (
                            <div className="flex items-center gap-3 w-full justify-between">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleSaveAsDraft}
                                        className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                                    >
                                        {initialData ? 'Update Draft' : 'Save as Draft'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-10 py-2.5 bg-[#8B3A00] hover:bg-[#8B3A00]/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        Submit for Approval
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </form>

            {/* Acknowledgement Popup */}
            {showAckPopup && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#8B3A00] text-xl">info</span>
                            <h3 className="font-bold text-slate-800 dark:text-white">Submit Application</h3>
                        </div>
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-[#8B3A00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-[#8B3A00] text-3xl">send</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Are you sure you want to submit this Employee Death application? Once submitted, it will be sent for HR verification.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl">
                            <button onClick={() => setShowAckPopup(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={confirmSubmit} className="px-6 py-2.5 bg-[#8B3A00] hover:bg-[#8B3A00]/90 text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer">
                                Confirm & Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

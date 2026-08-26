"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResignationRequest } from './ResignationRequestList';
import { getHrmsSignedUrl } from '@/lib/supabaseClient';

interface DocumentSlot {
    key: 'resignationLetter' | 'handoverChecklist';
    label: string;
    icon: string;
    mandatory: boolean;
    file: File | null;
    existingName?: string;
}

const resignationSchema = z.object({
    employeeName: z.string().min(1, 'Employee name is required'),
    epfNumber: z.string().min(1, 'EPF number is required'),
    designation: z.string().min(1, 'Designation is required'),
    branch: z.string().min(1, 'Branch is required'),
    resignationDate: z.string().min(1, 'Resignation date is required'),
    lastWorkingDate: z.string().min(1, 'Last working date is required'),
    reason: z.string().min(1, 'Reason is required'),
    specialRemark: z.string().optional(),
});

type ResignationFormData = z.infer<typeof resignationSchema>;

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
        if (e.target.files?.[0]) {
            onUpload(slot.key, e.target.files[0]);
        }
    };

    const handleDownload = async () => {
        if (slot.existingName) {
            try {
                const url = await getHrmsSignedUrl(slot.existingName);
                if (url) {
                    window.open(url, '_blank');
                } else {
                    alert('Failed to fetch document.');
                }
            } catch (err) {
                console.error("Error fetching doc:", err);
                alert("Could not load the file.");
            }
        } else if (slot.file) {
            const objectUrl = URL.createObjectURL(slot.file);
            window.open(objectUrl, '_blank');
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
                                className="ml-auto text-[#8B3A00] hover:text-[#8B3A00]/80 transition-colors flex-shrink-0 mr-2 cursor-pointer"
                                onClick={handleDownload}
                                title="Download Document"
                            >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                            </button>
                            
                            {!isReadOnly && (
                                <button
                                    type="button"
                                    className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                    onClick={() => onRemove(slot.key)}
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        !isReadOnly && (
                            <button
                                type="button"
                                className="mt-2 text-[11px] font-bold text-[#8B3A00] hover:underline flex items-center gap-1 cursor-pointer"
                                onClick={() => inputRef.current?.click()}
                            >
                                <span className="material-symbols-outlined text-xs">upload</span>
                                Upload Document
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

interface ResignationRequestFormProps {
    onSave: (request: ResignationRequest) => void;
    onCancel: () => void;
    initialData?: ResignationRequest;
    isReadOnly?: boolean;
}

const generateRequestId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `RES-${new Date().getFullYear()}-${timestamp}`;
};

export function ResignationRequestForm({ onSave, onCancel, initialData, isReadOnly = false }: ResignationRequestFormProps) {
    const [showAckPopup, setShowAckPopup] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<ResignationRequest | null>(null);

    const [docSlots, setDocSlots] = useState<DocumentSlot[]>([
        { 
            key: 'resignationLetter', 
            label: 'Resignation Letter', 
            icon: 'description', 
            mandatory: true, 
            file: null,
            existingName: initialData?.documents?.resignationLetter
        },
        { 
            key: 'handoverChecklist', 
            label: 'Handover Checklist', 
            icon: 'checklist', 
            mandatory: false, 
            file: null,
            existingName: initialData?.documents?.handoverChecklist
        }
    ]);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<ResignationFormData>({
        resolver: zodResolver(resignationSchema),
        defaultValues: {
            employeeName: initialData?.employeeName || '',
            epfNumber: initialData?.epfNumber || '',
            designation: initialData?.designation || '',
            branch: initialData?.branch || '',
            resignationDate: initialData?.resignationDate || '',
            lastWorkingDate: initialData?.lastWorkingDate || '',
            reason: initialData?.reason || '',
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

    const buildPayload = (data: ResignationFormData, status: ResignationRequest['status']): ResignationRequest => ({
        id: initialData?.id || generateRequestId(),
        employeeName: data.employeeName,
        epfNumber: data.epfNumber,
        designation: data.designation,
        branch: data.branch,
        resignationDate: data.resignationDate,
        lastWorkingDate: data.lastWorkingDate,
        reason: data.reason,
        specialRemark: data.specialRemark || '',
        status,
        documents: {
            resignationLetter: docSlots.find(s => s.key === 'resignationLetter')?.file?.name,
            handoverChecklist: docSlots.find(s => s.key === 'handoverChecklist')?.file?.name,
        },
    });

    const handleSaveAsNew = () => {
        const values = getValues();
        const payload = buildPayload(values, 'NEW');
        onSave(payload);
    };

    const onSubmitValid = (data: ResignationFormData) => {
        if (mandatoryDocsMissing) return;
        const payload = buildPayload(data, 'SUBMITTED_FOR_ADMIN_APPROVAL');
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
                    <span className="material-symbols-outlined text-[#8B3A00] text-2xl">exit_to_app</span>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                        {isReadOnly ? 'View Resignation Request' : initialData ? 'Edit Resignation Request' : 'New Resignation Request'}
                    </h2>
                </div>
                
                <div className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold border-b pb-2">Employee Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Employee Name *</label>
                                <Input {...register('employeeName')} placeholder="e.g. Kasun Perera" readOnly={isReadOnly} disabled={isReadOnly} className="text-slate-900 font-bold dark:text-white disabled:opacity-100 disabled:text-slate-900 dark:disabled:text-white" />
                                {errors.employeeName && <p className="text-xs text-red-500">{errors.employeeName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">EPF Number *</label>
                                <Input {...register('epfNumber')} placeholder="e.g. 12345" readOnly={isReadOnly} disabled={isReadOnly} className="text-slate-900 font-bold dark:text-white disabled:opacity-100 disabled:text-slate-900 dark:disabled:text-white" />
                                {errors.epfNumber && <p className="text-xs text-red-500">{errors.epfNumber.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Designation *</label>
                                <Input {...register('designation')} placeholder="e.g. Software Engineer" readOnly={isReadOnly} disabled={isReadOnly} className="text-slate-900 font-bold dark:text-white disabled:opacity-100 disabled:text-slate-900 dark:disabled:text-white" />
                                {errors.designation && <p className="text-xs text-red-500">{errors.designation.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Branch *</label>
                                <Input {...register('branch')} placeholder="e.g. Colombo HQ" readOnly={isReadOnly} disabled={isReadOnly} className="text-slate-900 font-bold dark:text-white disabled:opacity-100 disabled:text-slate-900 dark:disabled:text-white" />
                                {errors.branch && <p className="text-xs text-red-500">{errors.branch.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Resignation Details */}
                    <div className="space-y-4">
                        <h3 className="font-semibold border-b pb-2">Resignation Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Resignation Date *</label>
                                <Input type="date" {...register('resignationDate')} readOnly={isReadOnly} disabled={isReadOnly} className="text-slate-900 font-bold dark:text-white disabled:opacity-100 disabled:text-slate-900 dark:disabled:text-white" />
                                {errors.resignationDate && <p className="text-xs text-red-500">{errors.resignationDate.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Last Working Date *</label>
                                <Input type="date" {...register('lastWorkingDate')} readOnly={isReadOnly} disabled={isReadOnly} className="text-slate-900 font-bold dark:text-white disabled:opacity-100 disabled:text-slate-900 dark:disabled:text-white" />
                                {errors.lastWorkingDate && <p className="text-xs text-red-500">{errors.lastWorkingDate.message}</p>}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Reason for Resignation *</label>
                                <textarea
                                    {...register('reason')}
                                    rows={3}
                                    readOnly={isReadOnly} 
                                    disabled={isReadOnly}
                                    className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-900 font-bold dark:bg-slate-950 dark:text-white dark:border-slate-800 disabled:opacity-100 disabled:text-slate-900 dark:disabled:text-white"
                                    placeholder="Brief reason for leaving..."
                                />
                                {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Special Remarks</label>
                                <textarea
                                    {...register('specialRemark')}
                                    rows={2}
                                    readOnly={isReadOnly} 
                                    disabled={isReadOnly}
                                    className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-900 font-bold dark:bg-slate-950 dark:text-white dark:border-slate-800 disabled:opacity-100 disabled:text-slate-900 dark:disabled:text-white"
                                    placeholder="Any additional details..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-semibold">Documents</h3>
                             {mandatoryDocsMissing && !isReadOnly && (
                                <span className="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">warning</span>
                                    Mandatory documents required
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <Button type="submit" disabled={mandatoryDocsMissing} className="bg-[#8B3A00] hover:bg-[#8B3A00]/90">
                                Submit for Admin Approval
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
                            <span className="material-symbols-outlined text-[#8B3A00] text-xl">info</span>
                            <h3 className="font-bold text-slate-800 dark:text-white">User Acknowledgement</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                I verify that the submitted documents are accurate and complete. Once submitted for approval, the resignation application will be locked and sent for Admin review.
                            </p>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowAckPopup(false)}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={confirmSubmit} className="bg-[#8B3A00] hover:bg-[#8B3A00]/90">
                                Accept & Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

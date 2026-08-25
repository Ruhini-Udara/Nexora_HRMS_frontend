"use client";

import React, { useState, useRef, useEffect } from 'react';
import api from '@/lib/axiosInstance';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadHrmsDocument } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { TerminationRequest } from './EmployeeTerminations';

const terminationSchema = z.object({
    employeeName: z.string().min(1, 'Employee name is required'),
    epfNumber: z.string().min(1, 'EPF number is required'),
    branch: z.string().min(1, 'Branch is required'),
    type: z.string().min(1, 'Termination type is required'),
    reason: z.string().min(1, 'Reason is required'),
    initiationDate: z.string().min(1, 'Initiation date is required'),
    effectiveDate: z.string().min(1, 'Effective date is required').refine((val) => {
        const today = new Date().toISOString().split('T')[0];
        return val >= today;
    }, {
        message: 'Effective date cannot be in the past',
    }),
    specialRemark: z.string().optional(),
});

type TerminationFormData = z.infer<typeof terminationSchema>;

interface DocumentSlot {
    key: 'request_for_termination' | 'loan_clearance_letter' | 'other_document';
    label: string;
    icon: string;
    mandatory: boolean;
    file: File | null;
    existingName?: string;
}

interface DocUploadCardProps {
    slot: DocumentSlot;
    onUpload: (key: DocumentSlot['key'], file: File) => void;
    onRemove: (key: DocumentSlot['key']) => void;
    isReadOnly?: boolean;
}

const DocUploadCard: React.FC<DocUploadCardProps> = ({ slot, onUpload, onRemove, isReadOnly }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const hasFile = slot.file !== null;
    const fileName = slot.file?.name || '';

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
                            {slot.icon}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{slot.label} {slot.mandatory && <span className="text-red-500">*</span>}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{hasFile ? fileName : 'No file selected'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {hasFile && (
                        <button type="button" onClick={() => console.log('Downloading', fileName)} className="text-primary hover:text-primary/80 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">download</span>
                        </button>
                    )}
                    {!isReadOnly && (
                        hasFile ? (
                            <button type="button" onClick={() => onRemove(slot.key)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        ) : (
                            <button type="button" onClick={() => inputRef.current?.click()} className="text-primary hover:text-primary/80 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">upload</span>
                            </button>
                        )
                    )}
                </div>
            </div>
            <input type="file" ref={inputRef} onChange={handleChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
        </div>
    );
};

interface TerminationRequestFormProps {
    initialData?: TerminationRequest;
    onSave: (data: TerminationRequest) => void;
    onCancel: () => void;
    isReadOnly?: boolean;
    hideFooter?: boolean;
    onVerify?: () => void;
    onReject?: () => void;
}

export function TerminationRequestForm({ 
    initialData, 
    onSave, 
    onCancel, 
    isReadOnly = false, 
    hideFooter = false,
    onVerify,
    onReject
}: TerminationRequestFormProps) {
    const [showAckPopup, setShowAckPopup] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredEmployees = employees.filter(emp => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            (emp.fullName && emp.fullName.toLowerCase().includes(query)) ||
            (emp.employeeCode && emp.employeeCode.toLowerCase().includes(query)) ||
            (emp.epfNumber && emp.epfNumber.toLowerCase().includes(query)) ||
            (emp.workEmail && emp.workEmail.toLowerCase().includes(query)) ||
            (emp.email && emp.email.toLowerCase().includes(query)) ||
            (emp.department && emp.department.toLowerCase().includes(query))
        );
    });

    const handleSelectEmployee = async (emp: any) => {
        setValue('employeeName', emp.fullName || emp.name || '');
        setValue('epfNumber', emp.epfNumber || emp.epfNo || '');
        const branchVal = emp.branch || emp.department || '';
        setValue('branch', branchVal);

        // Fetch accurate branch and employee details from database if missing
        if (!branchVal && (emp.id || emp.employeeCode || emp.email)) {
            try {
                const param = emp.id ? `employeeId=${emp.id}` : `email=${encodeURIComponent(emp.email || emp.workEmail || '')}`;
                const res = await fetch(`/api/employee-profile?${param}`);
                if (res.ok) {
                    const profile = await res.json();
                    if (profile.branch && profile.branch !== 'N/A') {
                        setValue('branch', profile.branch);
                    }
                    if (profile.epfNumber && profile.epfNumber !== '—') {
                        setValue('epfNumber', profile.epfNumber);
                    }
                }
            } catch (err) {
                // Ignore fallback
            }
        }
        setIsSearchOpen(false);
        setSearchQuery("");
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/api/employees');
                if (Array.isArray(res.data)) {
                    setEmployees(res.data);
                } else if (res.data?.success && Array.isArray(res.data.data)) {
                    setEmployees(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    const [docSlots, setDocSlots] = useState<DocumentSlot[]>([
        { key: 'request_for_termination', label: 'Termination Request', icon: 'description', mandatory: true, file: null },
        { key: 'loan_clearance_letter', label: 'Loan Clearance', icon: 'account_balance', mandatory: true, file: null },
        { key: 'other_document', label: 'Other Supportings', icon: 'attach_file', mandatory: false, file: null },
    ]);

    const { register, handleSubmit, formState: { errors }, getValues, setValue } = useForm<TerminationFormData>({
        resolver: zodResolver(terminationSchema),
        defaultValues: initialData || {
            employeeName: '',
            epfNumber: '',
            branch: '',
            type: 'Voluntary (Resignation)',
            reason: '',
            initiationDate: new Date().toISOString().split('T')[0],
            effectiveDate: '',
            specialRemark: '',
        }
    });

    const handleDocUpload = (key: DocumentSlot['key'], file: File) => {
        setDocSlots(prev => prev.map(s => s.key === key ? { ...s, file } : s));
    };

    const handleDocRemove = (key: DocumentSlot['key']) => {
        setDocSlots(prev => prev.map(s => s.key === key ? { ...s, file: null } : s));
    };

    const mandatoryDocsMissing = docSlots.some(s => s.mandatory && !s.file && !isReadOnly);

    const onSubmit = (data: TerminationFormData) => {
        if (mandatoryDocsMissing) return;
        setShowAckPopup(true);
    };

    
    const uploadDocs = async () => {
        const documents: any = {};
        for (const slot of docSlots) {
            if (slot.file) {
                const path = await uploadHrmsDocument(slot.file, 'termination');
                if (path) documents[slot.key] = path;
                else throw new Error('Upload failed for ' + slot.label);
            } else if (slot.existingName) {
                documents[slot.key] = slot.existingName;
            }
        }
        return documents;
    };

    const confirmSubmit = async () => {
        setIsUploading(true);
        const formData = getValues();
        try {
            const documents = await uploadDocs();
            onSave({ 
                ...formData, 
                specialRemark: formData.specialRemark || '',
                id: initialData?.id || `TRM-${Date.now()}`, 
                status: 'SUBMITTED', 
                documents 
            });
            setShowAckPopup(false);
        } catch (e: any) {
            console.error(e);
            alert("Failed to upload: " + e.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveAsDraft = async () => {
        setIsUploading(true);
        const formData = getValues();
        try {
            const documents = await uploadDocs();
            onSave({ 
                ...formData, 
                specialRemark: formData.specialRemark || '',
                id: initialData?.id || `TRM-${Date.now()}`, 
                status: 'NEW', 
                documents 
            });
        } catch (e: any) {
            console.error(e);
            alert("Failed to upload: " + e.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">person_off</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {initialData ? (isReadOnly ? 'Termination Details' : 'Edit Termination Request') : 'New Termination Request'}
                        </h3>
                        <p className="text-sm text-slate-500">Employee Separation & Documentation Process</p>
                    </div>
                </div>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
                <div className="p-8 space-y-8">
                    {/* Section: Employee & Basic Info */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Employee Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Employee Name *</label>
                                <div className="relative" ref={searchRef}>
                                    <input 
                                        type="text"
                                        {...register('employeeName')}
                                        onClick={() => !isReadOnly && setIsSearchOpen(true)}
                                        onChange={(e) => {
                                            register('employeeName').onChange(e);
                                            setSearchQuery(e.target.value);
                                            setIsSearchOpen(true);
                                        }}
                                        readOnly={isReadOnly}
                                        placeholder="Select Employee..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-text" 
                                        autoComplete="off"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">arrow_drop_down</span>
                                    
                                    {isSearchOpen && !isReadOnly && (
                                        <div className="absolute left-0 top-full mt-2 w-full min-w-[300px] z-[60] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 overflow-hidden flex flex-col">
                                            <div className="px-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/50 relative">
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search by name, EPF, or email..."
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-800 dark:text-slate-200"
                                                    autoFocus
                                                />
                                                {searchQuery && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setSearchQuery("")}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                {filteredEmployees.length > 0 ? (
                                                    filteredEmployees.map((emp: any, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => handleSelectEmployee(emp)}
                                                            className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-3 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                                                                {emp.fullName ? emp.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'EE'}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{emp.fullName}</p>
                                                                <p className="text-[10px] text-slate-500 truncate leading-none mt-1">{emp.department || 'No Dept'} • EPF: {emp.epfNumber || 'No EPF'}{emp.employeeCode ? ` (${emp.employeeCode})` : ''}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-xs text-slate-500 font-medium">
                                                        No matching employees found
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {errors.employeeName && <p className="text-[10px] text-red-500 mt-1">{errors.employeeName.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">EPF Number *</label>
                                <input {...register('epfNumber')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                                {errors.epfNumber && <p className="text-[10px] text-red-500 mt-1">{errors.epfNumber.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Branch / Department *</label>
                                <input {...register('branch')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Termination Type *</label>
                                <select {...register('type')} disabled={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                                    <option value="Voluntary (Resignation)">Voluntary (Resignation)</option>
                                    <option value="Involuntary (Dismissal)">Involuntary (Dismissal)</option>
                                    <option value="Retirement">Retirement</option>
                                    <option value="End of Contract">End of Contract</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Termination Details */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Separation Details</h4>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Reason for Termination *</label>
                            <textarea {...register('reason')} readOnly={isReadOnly} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Initiation Date *</label>
                                <input type="date" {...register('initiationDate')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Effective Date *</label>
                                <input 
                                    type="date" 
                                    {...register('effectiveDate')} 
                                    min={new Date().toISOString().split('T')[0]}
                                    readOnly={isReadOnly} 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                />
                                {errors.effectiveDate && <p className="text-[10px] text-red-500 mt-1">{errors.effectiveDate.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Special Remarks</label>
                            <textarea {...register('specialRemark')} readOnly={isReadOnly} rows={2} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" placeholder="Any additional comments or notes..." />
                        </div>
                    </div>

                    {/* Section: Documents */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                            <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest">Required Documents</h4>
                            {mandatoryDocsMissing && (
                                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">warning</span>
                                    Req/Clearance are mandatory
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

                        {isReadOnly && initialData?.hrRemark && (
                            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-[11px] font-bold text-red-500 uppercase ml-1">HR Remarks / Rejection Reason</label>
                                <div className="w-full bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
                                    {initialData.hrRemark}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
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
                                        Reject Request
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onVerify}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
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
                                        {initialData ? 'Update Details' : 'Save as Draft'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={mandatoryDocsMissing || isUploading}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                        {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : <span className="material-symbols-outlined text-[18px]">send</span>}
                                        {isUploading ? 'Submitting...' : 'Submit for Approval'}
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
                            <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                            <h3 className="font-bold text-slate-800 dark:text-white">User Acknowledgement</h3>
                        </div>
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                I verify that the submitted documents are accurate and complete. Once submitted for approval, the termination process will be initiated.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl">
                            <button onClick={() => setShowAckPopup(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={confirmSubmit} disabled={isUploading} className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50">
                                {isUploading && <Loader2 className="animate-spin w-4 h-4" />}
                                Accept & Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

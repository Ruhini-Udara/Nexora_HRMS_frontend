"use client";

import React, { useState, useRef, useEffect } from 'react';
import api from '@/lib/axiosInstance';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeathRequest } from "@/lib/api/deathRequests";
import { uploadHrmsDocument, getHrmsSignedUrl } from "@/lib/supabaseClient";

interface DocumentSlot {
    key: 'deathCertificate' | 'nomineeId' | 'requestLetter';
    label: string;
    icon: string;
    mandatory: boolean;
    file: File | null;
    existingName?: string;
}

const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
const phoneRegex = /^[0-9]{10}$/;

const deathSchema = z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    employeeName: z.string().min(1, 'Employee name is required'),
    epfNumber: z.string().min(1, 'EPF number is required'),
    dateOfDeath: z.string().min(1, 'Date of death is required').refine((val) => {
        const today = new Date().toISOString().split('T')[0];
        return val <= today;
    }, {
        message: 'Date of death cannot be in the future',
    }),
    natureOfDeath: z.string().min(1, 'Nature of death is required'),
    requesterName: z.string().min(1, 'Requester name is required'),
    requesterNic: z.string().min(1, 'Requester NIC is required').regex(nicRegex, "NIC must be either 12 digits or 9 digits followed by 'V'"),
    requesterBranch: z.string().min(1, 'Branch/Department is required'),
    requesterDesignation: z.string().min(1, 'Requester designation is required'),
    requesterEmpId: z.string().min(1, 'Requester Emp ID is required'),
    contactNumber: z.string().min(1, 'Contact number is required').regex(phoneRegex, 'Contact number must contain exactly 10 digits'),
    specialRemark: z.string().optional(),
    
    // Nominee fields
    nomineeName: z.string().optional(),
    nomineeRelationship: z.string().optional(),
    nomineeNic: z.string().optional().refine((val) => !val || nicRegex.test(val), {
        message: "NIC must be either 12 digits or 9 digits followed by 'V'",
    }),
    nomineePhone: z.string().optional().refine((val) => !val || phoneRegex.test(val), {
        message: 'Contact number must contain exactly 10 digits',
    }),
    nomineeAddress: z.string().optional(),
    nomineeBank: z.string().optional(),
    nomineeBranch: z.string().optional(),
    nomineeAccount: z.string().optional(),
});

interface DeathDocuments {
    deathCertificate?: string;
    nomineeId?: string;
    requestLetter?: string;
}

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
            // For just uploaded local file preview
            const objectUrl = URL.createObjectURL(slot.file);
            window.open(objectUrl, '_blank');
        }
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
                {hasFile && (
                    <button type="button" onClick={handleDownload} className="text-[#8B3A00] hover:text-[#8B3A00]/80 transition-colors shrink-0 cursor-pointer mr-2">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                    </button>
                )}
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
            <input type="file" ref={inputRef} onChange={handleChange} className="hidden text-slate-900 font-bold dark:text-white" accept=".pdf,.jpg,.jpeg,.png" />
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

    const [employees, setEmployees] = useState<any[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isRequesterSearchOpen, setIsRequesterSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchRef = useRef<HTMLDivElement>(null);
    const searchRequesterRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }

            if (searchRequesterRef.current && !searchRequesterRef.current.contains(event.target as Node)) {
                setIsRequesterSearchOpen(false);
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

    const handleSelectEmployee = (emp: any) => {
        setValue('employeeName', emp.fullName || '');
        setValue('employeeId', emp.employeeCode || '');
        setValue('epfNumber', emp.epfNumber || emp.epfNo || '');
        setIsSearchOpen(false);
        setSearchQuery("");
    };

    const handleSelectRequester = (emp: any) => {
        const currentDeadEmpId = getValues('employeeId');
        if (currentDeadEmpId && emp.employeeCode === currentDeadEmpId) {
            alert("Error: The deceased employee cannot be their own requester.");
            return;
        }

        // Compare designations if both are available
        const currentDeadEmp = employees.find(e => e.employeeCode === currentDeadEmpId);
        if (currentDeadEmp) {
            const designationHierarchy: Record<string, number> = {
                'Director': 100,
                'System Administrator': 90,
                'Operations Manager': 80,
                'HR Manager': 80,
                'Product Manager': 80,
                'Senior Engineer': 70,
                'Engineer': 60,
                'Software Engineer': 60,
                'HR Executive': 50,
                'Sales Executive': 50,
                'Driver': 30,
                'Support Staff': 20
            };

            const reqRank = designationHierarchy[emp.designation?.designationName] || 10;
            const deadRank = designationHierarchy[currentDeadEmp.designation?.designationName] || 10;

            if (reqRank <= deadRank) {
                alert("Error: The requester must be in a higher position (designation) than the deceased employee.");
                return;
            }
        }

        setValue('requesterName', emp.fullName || '');
        setValue('requesterEmpId', emp.employeeCode || '');
        if (emp.nicNumber || emp.nic) setValue('requesterNic', emp.nicNumber || emp.nic);
        if (emp.department) setValue('requesterBranch', emp.department);
        if (emp.designation?.designationName) setValue('requesterDesignation', emp.designation.designationName);
        if (emp.phoneNo || emp.phoneNumber || emp.mobile) setValue('contactNumber', (emp.phoneNo || emp.phoneNumber || emp.mobile).replace(/[^0-9]/g, '').slice(0, 10));
        setIsRequesterSearchOpen(false);
        setSearchQuery("");
    };

    const { register, handleSubmit, formState: { errors }, getValues, reset, watch, setValue } = useForm<DeathFormData>({
        resolver: zodResolver(deathSchema),
        defaultValues: {
            employeeId: '',
            employeeName: '',
            epfNumber: '',
            dateOfDeath: '',
            natureOfDeath: 'Natural',
            requesterName: '',
            requesterNic: '',
            requesterBranch: '',
            requesterDesignation: '',
            requesterEmpId: '',
            contactNumber: '',
            specialRemark: '',
            nomineeName: '',
            nomineeRelationship: '',
            nomineeNic: '',
            nomineePhone: '',
            nomineeAddress: '',
            nomineeBank: '',
            nomineeBranch: '',
            nomineeAccount: '',
        }
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDocSlots(prev => prev.map(slot => ({
                ...slot,
                file: null,
                existingName: initialData.documents[slot.key as keyof DeathDocuments] || undefined
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

    const onSubmit = () => {
        if (isAnyDocMissing()) {
            setDocError(true);
            return;
        }
        setShowAckPopup(true);
    };

    const buildDocumentsPayload = async () => {
        const payload: Record<string, string> = {};
        for (const slot of docSlots) {
            if (slot.file) {
                // Ensure uploadHrmsDocument is imported at the top of this file
                const path = await uploadHrmsDocument(slot.file, 'death');
                payload[slot.key] = path || slot.file.name;
            } else if (slot.existingName) {
                payload[slot.key] = slot.existingName;
            } else {
                payload[slot.key] = '';
            }
        }
        return payload;
    };

    const confirmSubmit = async () => {
        const formData = getValues();
        const documents = await buildDocumentsPayload();
        onSave({ 
            ...formData, 
            specialRemark: formData.specialRemark || '',
            address: '',
            id: initialData?.id || `DTH-${Date.now()}`, 
            status: 'SUBMITTED', 
            documents: documents as DeathDocuments
        });
        setShowAckPopup(false);
    };

    const handleSaveAsDraft = async () => {
        const formData = getValues();
        const documents = await buildDocumentsPayload();
        onSave({ 
            ...formData, 
            specialRemark: formData.specialRemark || '',
            address: '',
            id: initialData?.id || `DTH-${Date.now()}`, 
            status: 'NEW', 
            documents: documents as DeathDocuments
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
                        <p className="text-sm text-slate-500">
                            {initialData?.id ? `Request ID: ${initialData.id}` : 'Employee Death Benefit Claim Process'}
                        </p>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                        className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.employeeName ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all cursor-text`}
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
                                                            <div className="w-8 h-8 rounded-full bg-[#8B3A00]/10 text-[#8B3A00] border border-[#8B3A00]/20 flex items-center justify-center font-bold text-xs shrink-0">
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
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Employee ID *</label>
                                <input {...register('employeeId')} readOnly={isReadOnly} className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.employeeId ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.employeeId && <p className="text-[10px] text-red-500 mt-1">{errors.employeeId.message}</p>}
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
                                <input 
                                    type="date" 
                                    {...register('dateOfDeath')} 
                                    max={new Date().toISOString().split('T')[0]}
                                    readOnly={isReadOnly} 
                                    className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.dateOfDeath ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all cursor-pointer`} 
                                />
                                {errors.dateOfDeath && <p className="text-[10px] text-red-500 mt-1">{errors.dateOfDeath.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Nature of Death *</label>
                                <select {...register('natureOfDeath')} disabled={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all cursor-pointer text-slate-900 font-bold dark:text-white">
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
                                <div className="relative" ref={searchRequesterRef}>
                                    <input 
                                        type="text"
                                        {...register('requesterName')}
                                        onClick={() => !isReadOnly && setIsRequesterSearchOpen(true)}
                                        onChange={(e) => {
                                            register('requesterName').onChange(e);
                                            setSearchQuery(e.target.value);
                                            setIsRequesterSearchOpen(true);
                                        }}
                                        readOnly={isReadOnly}
                                        placeholder="Select Requester..."
                                        className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.requesterName ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all cursor-text`}
                                        autoComplete="off"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">arrow_drop_down</span>
                                    
                                    {isRequesterSearchOpen && !isReadOnly && (
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
                                                            onClick={() => handleSelectRequester(emp)}
                                                            className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-3 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-[#8B3A00]/10 text-[#8B3A00] border border-[#8B3A00]/20 flex items-center justify-center font-bold text-xs shrink-0">
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
                                {errors.requesterName && <p className="text-[10px] text-red-500 mt-1">{errors.requesterName.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Requester Emp ID *</label>
                                <input {...register('requesterEmpId')} readOnly={isReadOnly} className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.requesterEmpId ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.requesterEmpId && <p className="text-[10px] text-red-500 mt-1">{errors.requesterEmpId.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Requester NIC *</label>
                                <input {...register('requesterNic')} readOnly={isReadOnly} placeholder="e.g. 199012345678 or 901234567V" className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.requesterNic ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.requesterNic && <p className="text-[10px] text-red-500 mt-1">{errors.requesterNic.message}</p>}
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
                                <input {...register('contactNumber')} readOnly={isReadOnly} placeholder="e.g. 0771234567" className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.contactNumber ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.contactNumber && <p className="text-[10px] text-red-500 mt-1">{errors.contactNumber.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section: Nominee Information */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-bold text-[#8B3A00] uppercase tracking-widest border-b border-[#8B3A00]/10 pb-2">Nominee Information (For Benefit Payment)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Nominee Name</label>
                                <input {...register('nomineeName')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all text-slate-900 font-bold dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Relationship</label>
                                <input {...register('nomineeRelationship')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all text-slate-900 font-bold dark:text-white" placeholder="e.g. Spouse, Son, Daughter" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">NIC Number</label>
                                <input {...register('nomineeNic')} readOnly={isReadOnly} placeholder="e.g. 199012345678 or 901234567V" className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.nomineeNic ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.nomineeNic && <p className="text-[10px] text-red-500 mt-1">{errors.nomineeNic.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Contact Number</label>
                                <input {...register('nomineePhone')} readOnly={isReadOnly} placeholder="e.g. 0771234567" className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.nomineePhone ? 'border-red-500' : 'border-slate-200'} dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all`} />
                                {errors.nomineePhone && <p className="text-[10px] text-red-500 mt-1">{errors.nomineePhone.message}</p>}
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Address</label>
                                <input {...register('nomineeAddress')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all text-slate-900 font-bold dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Bank Name</label>
                                <input {...register('nomineeBank')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all text-slate-900 font-bold dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Branch Name</label>
                                <input {...register('nomineeBranch')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all text-slate-900 font-bold dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Account Number</label>
                                <input {...register('nomineeAccount')} readOnly={isReadOnly} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all text-slate-900 font-bold dark:text-white" />
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
                        <textarea {...register('specialRemark')} readOnly={isReadOnly} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all resize-none text-slate-900 font-bold dark:text-white" placeholder="Enter any additional information..." />
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

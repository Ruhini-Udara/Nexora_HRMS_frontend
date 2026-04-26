"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DeathRequestForm } from './DeathRequestForm';
import { 
    DeathRequest, 
    getAllDeathRequests, 
    createDeathRequest, 
    updateDeathRequest, 
    verifyDeathRequest, 
    rejectDeathRequest 
} from '@/lib/api/deathRequests';
import api from '@/lib/axiosInstance';

const statusConfig: Record<string, { label: string; classes: string }> = {
    NEW: {
        label: "Draft",
        classes: "bg-slate-100 text-slate-600",
    },
    SUBMITTED: {
        label: "Pending Approval",
        classes: "bg-yellow-50 text-yellow-600",
    },
    VERIFIED_BY_HR: {
        label: "Verified",
        classes: "bg-green-50 text-green-600",
    },
    PENDING_ADMIN: {
        label: "Submitted",
        classes: "bg-blue-50 text-blue-600",
    },
    REJECTED: {
        label: "Rejected",
        classes: "bg-red-50 text-red-600",
    },
};

export default function EmployeeDeath() {
    const [requests, setRequests] = useState<DeathRequest[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<DeathRequest | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'main' | 'board'>('main');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showBatchConfirm, setShowBatchConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Reject states
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    
    const [viewRequest, setViewRequest] = useState<DeathRequest | null>(null);

    const loadRequests = useCallback(async () => {
        try {
            const data = await getAllDeathRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to load death requests", error);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadRequests();
    }, [loadRequests]);

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleCreateNew = () => {
        setSelectedRequest(null);
        setIsReadOnly(false);
        setIsModalOpen(true);
    };

    const handleEdit = (req: DeathRequest) => {
        setSelectedRequest(req);
        setIsReadOnly(false);
        setIsModalOpen(true);
    };

    const handleView = (req: DeathRequest) => {
        setViewRequest(req);
    };

    const handleSaveRequest = async (data: DeathRequest) => {
        try {
            if (selectedRequest) {
                const updated = await updateDeathRequest(selectedRequest.id, data);
                setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
                showSuccess("Application updated successfully");
            } else {
                const created = await createDeathRequest(data);
                setRequests(prev => [...prev, created]);
                showSuccess("Application saved as draft");
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save death request", error);
        }
    };

    const handleVerify = async () => {
        if (!selectedRequest) return;
        try {
            const updated = await verifyDeathRequest(selectedRequest.id);
            setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
            showSuccess("Application verified successfully");
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to verify death request", error);
        }
    };

    const handleOpenRejectDialog = () => {
        setShowRejectDialog(true);
    };

    const handleConfirmReject = async () => {
        if (!selectedRequest || !rejectReason) return;
        try {
            const updated = await rejectDeathRequest(selectedRequest.id, rejectReason);
            setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
            showSuccess("Application rejected");
            setShowRejectDialog(false);
            setRejectReason('');
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to reject death request", error);
        }
    };

    const handleBulkSubmitToAdmin = async () => {
        if (selectedIds.length === 0) return;
        
        try {
            await Promise.all(selectedIds.map(id => {
                const numericId = parseInt(id.replace('DTH-', ''), 10);
                return api.post(`/death-requests/${numericId}/submit-admin`);
            }));
            
            await loadRequests();
            const count = selectedIds.length;
            setSelectedIds([]);
            setShowBatchConfirm(false);
            showSuccess(`${count} applications submitted to admin successfully`);
        } catch (error) {
            console.error("Bulk submission failed", error);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.epfNumber.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeTab === 'board') {
            return matchesSearch && req.status === 'SUBMITTED';
        }
        return matchesSearch;
    });

    const draftCount = requests.filter(r => r.status === 'NEW').length;
    const pendingCount = requests.filter(r => r.status === 'SUBMITTED').length;
    const submittedToAdminCount = requests.filter(r => r.status === 'PENDING_ADMIN').length;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredRequests.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredRequests.map(r => r.id));
        }
    };

    return (
        <div className="max-w-7xl w-full mx-auto p-8 pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#8B3A00] text-3xl">person_remove</span>
                        Death Benefit Claims
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and track employee death benefit applications</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleCreateNew}
                        className="bg-[#8B3A00] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#8B3A00]/20 transition-all active:scale-95 cursor-pointer"
                    >
                        <span className="material-symbols-outlined">add</span>
                        New Application
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Applications</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{requests.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-1">Active Drafts</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{draftCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-1">Pending Approvals</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Submitted to Admin</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{submittedToAdminCount}</p>
                </div>
            </div>

            {/* Filters & Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                        onClick={() => { setActiveTab('main'); setSelectedIds([]); }}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'main' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 cursor-pointer'}`}
                    >
                        All Applications
                    </button>
                    <button 
                        onClick={() => { setActiveTab('board'); setSelectedIds([]); }}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'board' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 cursor-pointer'}`}
                    >
                        Submit to Admin Approvals
                    </button>
                </div>
                <div className="relative w-full sm:w-80">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input 
                        type="text"
                        placeholder="Search by name, ID or EPF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8B3A00]/20 transition-all"
                    />
                </div>
            </div>

            {/* Batch Action Bar */}
            {activeTab === 'board' && selectedIds.length > 0 && (
                <div className="mb-4 p-4 bg-[#8B3A00]/10 border border-[#8B3A00]/20 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-sm font-bold text-[#8B3A00]">
                        {selectedIds.length} application(s) selected for Admin Submission
                    </p>
                    <button 
                        onClick={() => setShowBatchConfirm(true)}
                        className="bg-[#8B3A00] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-[#8B3A00]/20 hover:opacity-90 transition-all cursor-pointer"
                    >
                        Confirm & Submit Batch
                    </button>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-hidden overflow-y-auto max-h-[420px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 shadow-sm">
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {activeTab === 'board' && (
                                    <th className="py-4 px-6 w-12 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={filteredRequests.length > 0 && selectedIds.length === filteredRequests.length}
                                            onChange={handleSelectAll}
                                            className="rounded border-slate-300 text-[#8B3A00] focus:ring-[#8B3A00] cursor-pointer w-4 h-4" 
                                        />
                                    </th>
                                )}
                                <th className="py-4 px-6 w-[15%]">Request ID</th>
                                <th className="py-4 px-6 w-[35%]">Employee</th>
                                <th className="py-4 px-6 w-[20%] text-center">Date of Death</th>
                                <th className="py-4 px-6 w-[15%] text-center">Status</th>
                                <th className="py-4 px-6 w-[15%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredRequests.map((req) => {
                                const st = statusConfig[req.status] || statusConfig.NEW;
                                const isSelected = selectedIds.includes(req.id);
                                return (
                                    <tr
                                        key={req.id}
                                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group ${isSelected ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}
                                    >
                                        {activeTab === 'board' && (
                                            <td className="py-4 px-6 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(req.id)}
                                                    className="rounded border-slate-300 text-[#8B3A00] focus:ring-[#8B3A00] cursor-pointer w-4 h-4" 
                                                />
                                            </td>
                                        )}
                                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-white truncate">
                                            {req.id}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-slate-700 dark:text-slate-200 truncate">{req.employeeName}</div>
                                            <div className="text-[10px] text-slate-500">EPF: {req.epfNumber}</div>
                                        </td>
                                        <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-400">
                                            {formatDate(req.dateOfDeath)}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${st.classes}`}>
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {req.status === 'NEW' && (
                                                    <button
                                                        onClick={() => handleEdit(req)}
                                                        className="flex items-center gap-1 text-[11px] font-bold text-[#8B3A00] hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors border border-orange-100 cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                                        Edit
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleView(req)}
                                                    className="p-2 text-slate-400 hover:text-[#8B3A00] transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={activeTab === 'board' ? 6 : 5} className="py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                                            <p className="text-sm font-medium">No applications found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Batch Confirmation Modal */}
            {showBatchConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#8B3A00]">warning</span>
                                Confirm Batch Submission
                            </h3>
                            <button onClick={() => setShowBatchConfirm(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8 text-center">
                            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20 mb-4 inline-block px-8">
                                <p className="text-3xl font-black text-[#8B3A00] mb-1">{selectedIds.length}</p>
                                <p className="text-[10px] font-bold text-[#8B3A00] uppercase tracking-widest">Applications Selected</p>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold mt-4">
                                Are you sure you want to submit this batch for admin approvals?
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowBatchConfirm(false)}
                                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkSubmitToAdmin}
                                className="px-8 py-2.5 bg-[#8B3A00] text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-lg shadow-[#8B3A00]/20 transition-all cursor-pointer"
                            >
                                Yes, Submit Batch
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {successMessage && (
                <div className="fixed bottom-8 right-8 z-[110] animate-in slide-in-from-bottom-5 fade-in">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg">check</span>
                        </div>
                        <p className="text-sm font-bold tracking-tight">{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Modal for Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <DeathRequestForm
                        onSave={handleSaveRequest}
                        onCancel={() => setIsModalOpen(false)}
                        initialData={selectedRequest || undefined}
                        isReadOnly={isReadOnly}
                        hideFooter={false}
                        onVerify={handleVerify}
                        onReject={handleOpenRejectDialog}
                    />
                </div>
            )}

            {/* Detail View Modal */}
            {viewRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#8B3A00]">person_remove</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Death Application Details</h3>
                                    <p className="text-[11px] text-slate-500 font-medium">{viewRequest.id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setViewRequest(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-400"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Name</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{viewRequest.employeeName}</p>
                                    <p className="text-[10px] text-slate-500">EPF: {viewRequest.epfNumber}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusConfig[viewRequest.status]?.classes || statusConfig.NEW.classes}`}>
                                        {statusConfig[viewRequest.status]?.label || 'Draft'}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Death</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{formatDate(viewRequest.dateOfDeath)}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nature of Death</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{viewRequest.natureOfDeath}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requester Name</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{viewRequest.requesterName}</p>
                                    <p className="text-[10px] text-slate-500">{viewRequest.requesterDesignation} ({viewRequest.requesterEmpId})</p>
                                    <p className="text-[10px] text-slate-500">{viewRequest.requesterBranch}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Number</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{viewRequest.contactNumber}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nominee Details</p>
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                    <div>
                                        <p className="text-[10px] text-slate-500">Nominee Name</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{viewRequest.nomineeName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500">Bank Details</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{viewRequest.nomineeBank} - {viewRequest.nomineeBranch}</p>
                                        <p className="text-[10px] text-slate-500">{viewRequest.nomineeAccount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attached Documents</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(viewRequest.documents).map(([key, filename], idx) => (
                                        filename && (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{filename}</p>
                                                </div>
                                                <button className="text-slate-300 hover:text-[#8B3A00] transition-colors cursor-pointer">
                                                    <span className="material-symbols-outlined text-lg">download</span>
                                                </button>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                            <button 
                                onClick={() => setViewRequest(null)}
                                className="px-8 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Dialog */}
            {showRejectDialog && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-tight">Reject Application</h3>
                        </div>
                        <div className="p-8 space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Please provide a reason for rejecting this application.</p>
                            <textarea 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none h-32"
                                placeholder="Enter rejection reason..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button onClick={() => setShowRejectDialog(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">Cancel</button>
                            <button onClick={handleConfirmReject} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer">Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

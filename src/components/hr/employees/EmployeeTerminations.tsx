"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TerminationRequestForm } from "./TerminationRequestForm";
import { getAllTerminationRequests, updateTerminationStatus, updateTerminationRequest, createTerminationRequest } from "@/lib/api/terminationRequests";
export type TerminationStatus = 'NEW' | 'SUBMITTED' | 'VERIFIED_BY_HR' | 'PENDING_ADMIN' | 'REJECTED' | 'PENDING_BOARD_APPROVAL' | 'SUBMITTED_TO_DIRECTOR' | 'APPROVED';

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
    hrRemark?: string;
}

// ── Status badge config ─────────────────────────────────────────────
const statusConfig: Record<string, { label: string; classes: string }> = {
    NEW: { label: "Draft", classes: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
    SUBMITTED: { label: "Submitted", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    VERIFIED_BY_HR: { label: "Verified", classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    PENDING_ADMIN: { label: "Pending Admin", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    SUBMITTED_TO_DIRECTOR: { label: "Submitted to Director", classes: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
    APPROVED: { label: "Approved", classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    REJECTED: { label: "Rejected", classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
};

// ── Main Component ──────────────────────────────────────────────────
export default function EmployeeTerminations() {
    const [requests, setRequests] = useState<TerminationRequest[]>([]);

    React.useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await getAllTerminationRequests();
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                
                const recentData = data.filter(r => {
                    const reqDate = new Date(r.initiationDate || '');
                    return isNaN(reqDate.getTime()) || reqDate >= oneYearAgo;
                });
                setRequests(recentData as unknown as TerminationRequest[]);
            } catch (error) {
                console.error('Failed to fetch terminations:', error);
            }
        };
        fetchRequests();
    }, []);

    const [activeTab, setActiveTab] = useState<'pending' | 'board'>('pending');
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [timeFilter, setTimeFilter] = useState<'2days' | 'week' | 'month' | 'year'>('2days');
    const [selectedRequest, setSelectedRequest] = useState<TerminationRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Reject states
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectReasonError, setRejectReasonError] = useState(false);

    // ── Handlers ─────────────────────────────────────────────────────
    const handleView = (req: TerminationRequest) => {
        setSelectedRequest(req);
        setIsReadOnly(req.status !== 'NEW');
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        setSelectedRequest(null);
        setIsReadOnly(false);
        setIsModalOpen(true);
    };

    const handleSaveRequest = async (newReq: TerminationRequest, closeAfterSave = true) => {
        try {
            const exists = requests.find(r => r.id === newReq.id);
            let updatedReq: any;
            if (exists) {
                updatedReq = await updateTerminationRequest(newReq.id, newReq as any);
                setRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq as unknown as TerminationRequest : r));
            } else {
                updatedReq = await createTerminationRequest(newReq as any);
                setRequests(prev => [updatedReq as unknown as TerminationRequest, ...prev]);
                setSelectedRequest(updatedReq);
            }
            if (closeAfterSave) setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save request:', error);
        }
    };


    const handleVerify = async () => {
        if (!selectedRequest) return;
        try {
            const updatedReq = await updateTerminationStatus(selectedRequest.id, "VERIFIED_BY_HR");
            setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updatedReq as unknown as TerminationRequest : r));
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to verify:', error);
        }
    };

    const handleOpenRejectDialog = () => setShowRejectDialog(true);
    const handleCloseRejectDialog = () => {
        setShowRejectDialog(false);
        setRejectReason("");
        setRejectReasonError(false);
    };

    const handleConfirmReject = async () => {
        if (!rejectReason.trim()) {
            setRejectReasonError(true);
            return;
        }
        if (!selectedRequest) return;
        try {
            const updatedReq = await updateTerminationStatus(selectedRequest.id, "REJECTED", rejectReason);
            setRequests(prev => prev.map(req => req.id === selectedRequest.id ? updatedReq as unknown as TerminationRequest : req));
            handleCloseRejectDialog();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to reject:', error);
        }
    };

    const handleConfirmSubmitToAdmin = async () => {
        const verifiedRequests = requests.filter((r) => r.status === "VERIFIED_BY_HR");
        try {
            await Promise.all(verifiedRequests.map(r => updateTerminationStatus(r.id, "PENDING_ADMIN")));
            const data = await getAllTerminationRequests();
            setRequests(data as unknown as TerminationRequest[]);
            setShowConfirmDialog(false);
            setActiveTab('pending');
        } catch (error) {
            console.error('Failed to submit batch:', error);
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────
    const filteredRequests = requests.filter((req) => {
        const matchesTab = activeTab === 'pending' 
            ? (req.status === 'SUBMITTED' || req.status === 'PENDING_ADMIN' || req.status === 'REJECTED' || req.status === 'NEW' || req.status === 'PENDING_BOARD_APPROVAL' || req.status === 'SUBMITTED_TO_DIRECTOR' || req.status === 'APPROVED')
            : (req.status === 'VERIFIED_BY_HR');
        
        const matchesSearch =
            req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.epfNumber.includes(searchTerm);
        
        const matchesStatus = statusFilter === "All" || req.status === statusFilter;
        
        let matchesTime = true;
        const d = req.initiationDate;
        if (d) {
            const reqDate = new Date(d);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (timeFilter === '2days') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                matchesTime = reqDate >= yesterday;
            } else if (timeFilter === 'week') {
                const lastWeek = new Date(today);
                lastWeek.setDate(lastWeek.getDate() - 7);
                matchesTime = reqDate >= lastWeek;
            } else if (timeFilter === 'month') {
                const lastMonth = new Date(today);
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                matchesTime = reqDate >= lastMonth;
            }
        }
        
        return matchesTab && matchesSearch && matchesStatus && matchesTime;
    });

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDate = (iso: string) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    const verifiedCount = requests.filter(r => r.status === 'VERIFIED_BY_HR').length;
    const printRequests = requests.filter(r => r.status === 'VERIFIED_BY_HR');

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="flex-1 p-8 pb-16 max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/hr/employees" className="text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                                {activeTab === 'board' ? "Admin Approval List" : "Terminations Management"}
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 ml-9">
                            Manage employee termination requests and board approval processes.
                        </p>
                    </div>
                </div>

                {/* Sub-Tabs */}
                <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex gap-0">
                        <button 
                            onClick={() => {
                                setActiveTab('pending');
                                setCurrentPage(1);
                            }}
                            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">person_off</span>
                                Pending Terminations
                            </span>
                        </button>
                        <button 
                            onClick={() => {
                                setActiveTab('board');
                                setCurrentPage(1);
                            }}
                            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === 'board' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">playlist_add_check</span>
                                Admin Approval List
                                {verifiedCount > 0 && (
                                    <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
                                        {verifiedCount}
                                    </span>
                                )}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-symbols-outlined text-slate-400">search</span>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by ID, Name, or EPF..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">filter_list</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm"
                            >
                                <option value="All">All Statuses</option>
                                {Object.keys(statusConfig).map(st => (
                                    <option key={st} value={st}>{statusConfig[st].label}</option>
                                ))}
                            </select>
                            <select
                                value={timeFilter}
                                onChange={(e) => {
                                    setTimeFilter(e.target.value as any);
                                    setCurrentPage(1);
                                }}
                                className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm"
                            >
                                <option value="2days">Last 2 Days</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                        {activeTab === 'pending' ? (
                            <button 
                                onClick={handleCreateNew}
                                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                New Request
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => window.print()}
                                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-[18px]">print</span>
                                    Print List
                                </button>
                                <button
                                    onClick={() => setShowConfirmDialog(true)}
                                    disabled={verifiedCount === 0}
                                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                    Submit for Admin Approvals
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(
                        [
                            { label: "Submitted", status: "SUBMITTED", icon: "send", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", ring: "ring-amber-500" },
                            { label: "Verified", status: "VERIFIED_BY_HR", icon: "verified", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", ring: "ring-emerald-500" },
                            { label: "Pending Admin", status: "PENDING_ADMIN", icon: "pending_actions", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", ring: "ring-blue-500" },
                            { label: "Rejected", status: "REJECTED", icon: "cancel", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", ring: "ring-red-500" },
                        ] as const
                    ).map(({ label, status, icon, color, bg, ring }) => {
                        const statCount = requests.filter(r => r.status === status).filter(req => {
                            let matchesTime = true;
                            const d = req.initiationDate;
                            if (d) {
                                const reqDate = new Date(d);
                                const now = new Date();
                                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                if (timeFilter === '2days') {
                                    const yesterday = new Date(today);
                                    yesterday.setDate(yesterday.getDate() - 1);
                                    matchesTime = reqDate >= yesterday;
                                } else if (timeFilter === 'week') {
                                    const lastWeek = new Date(today);
                                    lastWeek.setDate(lastWeek.getDate() - 7);
                                    matchesTime = reqDate >= lastWeek;
                                } else if (timeFilter === 'month') {
                                    const lastMonth = new Date(today);
                                    lastMonth.setMonth(lastMonth.getMonth() - 1);
                                    matchesTime = reqDate >= lastMonth;
                                }
                            }
                            return matchesTime;
                        }).length;

                        return (
                            <div 
                                key={status} 
                                onClick={() => {
                                    setStatusFilter(statusFilter === status ? 'All' : status);
                                    setCurrentPage(1);
                                }}
                                className={`rounded-xl p-4 ${bg} border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm cursor-pointer transition-all hover:scale-[1.02] ${statusFilter === status ? `ring-2 ${ring}` : ''}`}
                            >
                                <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
                                <div>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {statCount}
                                    </p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    {activeTab === 'board' && <th className="py-4 px-6 w-12"><input type="checkbox" checked readOnly className="rounded border-slate-300" /></th>}
                                    <th className="py-4 px-6">Request ID</th>
                                    <th className="py-4 px-6">Employee</th>
                                    <th className="py-4 px-6">Branch</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {paginatedRequests.map((req) => {
                                    const st = statusConfig[req.status] || { 
                                        label: req.status, 
                                        classes: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400" 
                                    };
                                    return (
                                        <tr
                                            key={req.id}
                                            className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group"
                                        >
                                            {activeTab === 'board' && <td className="py-4 px-6"><input type="checkbox" checked readOnly className="rounded border-slate-300" /></td>}
                                            <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                                                {req.id}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-slate-800 dark:text-white">{req.employeeName}</div>
                                                <div className="text-xs text-slate-500">EPF: {req.epfNumber}</div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{req.branch}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${st.classes}`}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleView(req)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold transition-all cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    {req.status === 'SUBMITTED' ? "Review & Verify" : "View Details"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={activeTab === 'board' ? 7 : 6} className="py-12 text-center text-slate-400">
                                            No termination requests found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${currentPage === i + 1 ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal for Create/View/Review */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                        <TerminationRequestForm
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

                {/* Confirm Batch Submit Dialog */}
                {showConfirmDialog && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-white">
                                <span className="material-symbols-outlined text-primary">warning</span>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Confirm Submission</h3>
                            </div>
                            <div className="p-8 text-center bg-white">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-primary text-3xl">send</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    You are about to compile <span className="font-bold text-slate-800 dark:text-white">{verifiedCount} verified termination requests</span> and submit them for Admin approval.
                                </p>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg text-left">
                                    <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-start gap-2">
                                        <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                                        Once submitted, the request statuses cannot be changed by HR.
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-end rounded-b-2xl">
                                <button onClick={() => setShowConfirmDialog(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
                                    Cancel
                                </button>
                                <button onClick={handleConfirmSubmitToAdmin} className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                    Submit for Admin Approvals
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Reason Popup */}
                {showRejectDialog && selectedRequest && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-red-500 text-xl">cancel</span>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Reject Request</h3>
                                </div>
                                <button onClick={handleCloseRejectDialog} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400">Please provide a reason for rejecting this termination request.</p>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => {
                                        setRejectReason(e.target.value);
                                        if (e.target.value.trim()) setRejectReasonError(false);
                                    }}
                                    placeholder="e.g. Missing supporting evidence..."
                                    rows={4}
                                    className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 resize-none transition-colors ${rejectReasonError ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-primary/20 focus:border-primary"}`}
                                />
                                {rejectReasonError && <p className="text-xs text-red-500">Reason is mandatory.</p>}
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3 rounded-b-2xl">
                                <button onClick={handleCloseRejectDialog} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 cursor-pointer">
                                    Cancel
                                </button>
                                <button onClick={handleConfirmReject} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg shadow-sm shadow-red-200 transition-all cursor-pointer flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Printable Document (Hidden on Screen, Visible on Print) */}
            <style type="text/css" media="print">
                {`
                    body * {
                        visibility: hidden;
                    }
                    #termination-print-section, #termination-print-section * {
                        visibility: visible;
                    }
                    #termination-print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                `}
            </style>
            <div id="termination-print-section" className="hidden print:block w-full text-black bg-white min-h-screen text-left print:p-8">
                <div className="text-center mb-10 border-b-2 border-slate-800 pb-6">
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900 mb-2">HR MATE</h1>
                    <h2 className="text-xl font-semibold mb-1">Admin Approval Request</h2>
                    <h3 className="text-lg font-medium text-slate-700">Employee Termination Requests</h3>
                    <p className="text-sm mt-3 text-slate-500 font-bold">List Generated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="bg-white overflow-hidden print:shadow-none print:border-none print:rounded-none">
                    <div className="overflow-x-auto print:overflow-visible">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider font-bold text-slate-800 bg-white">
                                    <th className="py-2 px-4">Req ID</th>
                                    <th className="py-2 px-4">Employee Name</th>
                                    <th className="py-2 px-4">EPF</th>
                                    <th className="py-2 px-4">Branch</th>
                                    <th className="py-2 px-4">Initiation Date</th>
                                    <th className="py-2 px-4 text-center w-32 border-l border-slate-300">Board Decision</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {printRequests.map((req) => (
                                    <tr key={req.id} className="border-b border-slate-400 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-black">{req.id}</td>
                                        <td className="py-3 px-4 text-black">{req.employeeName}</td>
                                        <td className="py-3 px-4 text-black">{req.epfNumber || '—'}</td>
                                        <td className="py-3 px-4 text-black">{req.branch || '—'}</td>
                                        <td className="py-3 px-4 text-black">{formatDate(req.initiationDate)}</td>
                                        <td className="py-3 px-4 text-center align-middle border-l border-slate-300">
                                            <div className="w-20 border-b border-black mx-auto"></div>
                                        </td>
                                    </tr>
                                ))}
                                {printRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                                            No termination requests found for this board queue.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="hidden print:flex justify-between items-end mt-32 px-12">
                    <div className="text-center">
                        <div className="border-b border-black w-48 mx-auto mb-2"></div>
                        <p className="font-bold text-slate-800 text-sm">Prepared By (HR)</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Signature & Date</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-black w-48 mx-auto mb-2"></div>
                        <p className="font-bold text-slate-800 text-sm">Reviewed By (Director)</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Signature & Date</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-black w-48 mx-auto mb-2"></div>
                        <p className="font-bold text-slate-800 text-sm">Admin Approval</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Signature & Date</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

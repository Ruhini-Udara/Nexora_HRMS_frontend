"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DeathRequestForm } from "./DeathRequestForm";

// ── Types ───────────────────────────────────────────────────────────
export interface DeathRequest {
    id: string;
    employeeName: string;
    epfNumber: string;
    dateOfDeath: string;
    natureOfDeath: string;
    requesterName: string;
    relationship: string;
    address: string;
    contactNumber: string;
    specialRemark: string;
    status: 'NEW' | 'SUBMITTED' | 'VERIFIED_BY_HR' | 'PENDING_ADMIN' | 'REJECTED';
    nomineeName?: string;
    nomineeBank?: string;
    nomineeBranch?: string;
    nomineeAccount?: string;
    documents: {
        deathCertificate?: string;
        nomineeId?: string;
        requestLetter?: string;
    };
    hrRemark?: string;
}

// ── Mock Data ───────────────────────────────────────────────────────
const MOCK_REQUESTS: DeathRequest[] = [
    {
        id: 'DTH-2024-001',
        employeeName: 'Amal Perera',
        epfNumber: '45829',
        dateOfDeath: '2024-11-01',
        natureOfDeath: 'Natural',
        requesterName: 'Sunil Perera',
        relationship: 'Brother',
        address: '123, Galle Road, Colombo',
        contactNumber: '0771234567',
        specialRemark: '',
        status: 'SUBMITTED',
        documents: {
            deathCertificate: 'death_certificate_amal.pdf',
            nomineeId: 'id_sunil.pdf',
            requestLetter: 'request_letter_sunil.pdf'
        }
    },
    {
        id: 'DTH-2024-002',
        employeeName: 'Nimali Silva',
        epfNumber: '11223',
        dateOfDeath: '2024-10-25',
        natureOfDeath: 'Accident',
        requesterName: 'Kasun Silva',
        relationship: 'Husband',
        address: '45, Kandy Road, Kandy',
        contactNumber: '0719876543',
        specialRemark: 'Pending police report copy',
        status: 'VERIFIED_BY_HR',
        nomineeName: 'Kasun Silva',
        nomineeBank: 'BOC',
        nomineeBranch: 'Kandy',
        nomineeAccount: '1234567890',
        documents: {
            deathCertificate: 'death_certificate_nimali.pdf',
            nomineeId: 'id_kasun.pdf',
            requestLetter: 'request_letter_kasun.pdf'
        }
    },
    {
        id: 'DTH-2024-003',
        employeeName: 'Kamal Bandara',
        epfNumber: '22334',
        dateOfDeath: '2024-11-10',
        natureOfDeath: 'Natural',
        requesterName: 'Saman Bandara',
        relationship: 'Son',
        address: '78, Peradeniya Road, Kandy',
        contactNumber: '0755566778',
        specialRemark: 'Drafting request, nominee info pending.',
        status: 'NEW',
        documents: {}
    }
];

// ── Status badge config ─────────────────────────────────────────────
const statusConfig: Record<DeathRequest['status'], { label: string; classes: string }> = {
    NEW: {
        label: "Draft",
        classes: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
    },
    SUBMITTED: {
        label: "Submitted",
        classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    VERIFIED_BY_HR: {
        label: "Verified",
        classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    PENDING_ADMIN: {
        label: "Pending Admin",
        classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    REJECTED: {
        label: "Rejected",
        classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
};

// ── Main Component ──────────────────────────────────────────────────
export default function EmployeeDeath() {
    const [requests, setRequests] = useState<DeathRequest[]>(MOCK_REQUESTS);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedRequest, setSelectedRequest] = useState<DeathRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [activeTab, setActiveTab] = useState<'main' | 'board'>('main');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    
    // Reject states
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectReasonError, setRejectReasonError] = useState(false);

    // ── Handlers ─────────────────────────────────────────────────────
    const handleView = (req: DeathRequest) => {
        setSelectedRequest(req);
        setIsReadOnly(req.status !== 'NEW');
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        setSelectedRequest(null);
        setIsReadOnly(false);
        setIsModalOpen(true);
    };

    const handleSaveRequest = (newReq: DeathRequest) => {
        const adaptedReq: DeathRequest = {
            ...newReq,
            hrRemark: newReq.hrRemark || ""
        };

        setRequests(prev => {
            const exists = prev.find(r => r.id === adaptedReq.id);
            if (exists) {
                return prev.map(r => r.id === adaptedReq.id ? adaptedReq : r);
            }
            return [...prev, adaptedReq];
        });
        setIsModalOpen(false);
    };

    const handleVerify = () => {
        if (!selectedRequest) return;
        setRequests(prev => prev.map(r => 
            r.id === selectedRequest.id ? { ...r, status: 'VERIFIED_BY_HR' } : r
        ));
        setIsModalOpen(false);
    };

    const handleOpenRejectDialog = () => setShowRejectDialog(true);
    const handleCloseRejectDialog = () => {
        setShowRejectDialog(false);
        setRejectReason("");
        setRejectReasonError(false);
    };

    const handleConfirmReject = () => {
        if (!rejectReason.trim()) {
            setRejectReasonError(true);
            return;
        }
        if (!selectedRequest) return;
        setRequests((prev) =>
            prev.map((req) =>
                req.id === selectedRequest.id
                    ? { ...req, status: "REJECTED", hrRemark: rejectReason }
                    : req
            )
        );
        handleCloseRejectDialog();
        setIsModalOpen(false);
    };

    const handleConfirmSubmitToAdmin = () => {
        const verifiedIds = requests
            .filter((r) => r.status === "VERIFIED_BY_HR")
            .map((r) => r.id);

        setRequests((prev) =>
            prev.map((req) =>
                verifiedIds.includes(req.id)
                    ? { ...req, status: "PENDING_ADMIN" as DeathRequest['status'] }
                    : req
            )
        );
        setShowConfirmDialog(false);
        setActiveTab('main');
    };

    // ── Filtered list ─────────────────────────────────────────────────
    const filteredRequests = requests.filter((req) => {
        const matchesTab = activeTab === 'main' 
            ? (req.status === 'SUBMITTED' || req.status === 'PENDING_ADMIN' || req.status === 'REJECTED' || req.status === 'NEW')
            : (req.status === 'VERIFIED_BY_HR');

        const matchesSearch =
            req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.epfNumber.includes(searchTerm);
        
        const matchesStatus = statusFilter === "All" || req.status === statusFilter;
        
        return matchesTab && matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDate = (iso: string) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    const verifiedCount = requests.filter(r => r.status === 'VERIFIED_BY_HR').length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/hr/employees" className="text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                                {activeTab === 'board' ? "Admin Approval List" : "Death Applications"}
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 ml-9">
                            Review and process employee death benefit claims and documentation.
                        </p>
                    </div>
                </div>

                {/* Sub-Tabs */}
                <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex gap-0">
                        <button 
                            onClick={() => {
                                setActiveTab('main');
                                setCurrentPage(1);
                            }}
                            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === 'main' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                Death Applications
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
                                    <option key={st} value={st}>{statusConfig[st as DeathRequest['status']].label}</option>
                                ))}
                            </select>
                        </div>
                        {activeTab === 'main' ? (
                            <button
                                onClick={handleCreateNew}
                                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                New Application
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowConfirmDialog(true)}
                                disabled={verifiedCount === 0}
                                className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-[18px]">send</span>
                                Submit for Admin Approvals
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(
                        [
                            { label: "Submitted", status: "SUBMITTED", icon: "send", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
                            { label: "Verified", status: "VERIFIED_BY_HR", icon: "verified", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                            { label: "Pending Admin", status: "PENDING_ADMIN", icon: "pending_actions", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
                            { label: "Rejected", status: "REJECTED", icon: "cancel", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
                        ] as const
                    ).map(({ label, status, icon, color, bg }) => (
                        <div key={status} className={`rounded-xl p-4 ${bg} border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm`}>
                            <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
                            <div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {requests.filter((r) => r.status === status).length}
                                </p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    {activeTab === 'board' && <th className="py-4 px-6 w-12"><input type="checkbox" checked readOnly className="rounded border-slate-300" /></th>}
                                    <th className="py-4 px-6">Application ID</th>
                                    <th className="py-4 px-6">Employee</th>
                                    <th className="py-4 px-6 text-center">Date of Death</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {paginatedRequests.map((req) => {
                                    const st = statusConfig[req.status];
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
                                            <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-300">{formatDate(req.dateOfDeath)}</td>
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
                                            No applications found matching your filters.
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
                                    You are about to compile <span className="font-bold text-slate-800 dark:text-white">{verifiedCount} verified death applications</span> and submit them for Admin approval.
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
                                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Reject Application</h3>
                                </div>
                                <button onClick={handleCloseRejectDialog} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400">Please provide a reason for rejecting this death application.</p>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => {
                                        setRejectReason(e.target.value);
                                        if (e.target.value.trim()) setRejectReasonError(false);
                                    }}
                                    placeholder="e.g. Incomplete documentation..."
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
        </div>
    );
}

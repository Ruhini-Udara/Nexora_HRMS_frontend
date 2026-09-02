"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { Search, Filter, Calendar, CheckCircle2, XCircle, Clock, MoreVertical, Eye, Download, Printer, User, Building2, MapPin, Briefcase, FileText, ChevronRight, LayoutGrid, List as ListIcon, ShieldCheck, Mail, Phone, CalendarDays, History } from 'lucide-react';
import { getAllResignationRequests, updateResignationStatus, ResignationRequest } from '@/lib/api/resignationRequests';
import { getHrmsSignedUrl } from '@/lib/supabaseClient';

// ── Status badge config ─────────────────────────────────────────────
const statusConfig: Record<string, { label: string; classes: string }> = {
    SUBMITTED: { label: "Submitted", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    VERIFIED_BY_HR: { label: "Verified", classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    PENDING_ADMIN: { label: "Pending Admin", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    SUBMITTED_TO_DIRECTOR: { label: "Submitted to Director", classes: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
    "Board Approved": { label: "Board Approved", classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    EXECUTED: { label: "Executed", classes: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
    REJECTED: { label: "Rejected", classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
};

const getStatusBadge = (status: string | undefined | null) => {
    if (!status) return { label: "Draft", classes: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
    const s = String(status).trim();
    const upper = s.toUpperCase();
    if (upper === "NEW" || upper === "DRAFT") return { label: "Draft", classes: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
    if (upper === "SUBMITTED" || upper === "PENDING") return { label: "Submitted", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
    if (upper === "VERIFIED_BY_HR" || upper === "VERIFIED") return { label: "Verified", classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
    if (upper === "PENDING_ADMIN") return { label: "Pending Admin", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    if (upper === "SUBMITTED_TO_DIRECTOR" || upper === "PENDING_BOARD_APPROVAL") return { label: "Submitted to Director", classes: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" };
    if (upper === "BOARD APPROVED" || upper === "APPROVED") return { label: "Board Approved", classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" };
    if (upper === "BOARD REJECTED" || upper === "REJECTED") return { label: "Rejected", classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    if (upper === "EXECUTED") return { label: "Executed", classes: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" };
    return { label: s, classes: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
};

// ── ReadOnly input helper ────────────────────────────────────────────
const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
        </label>
        <input
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
            readOnly
            value={value}
        />
    </div>
);

// ── ReadOnly textarea helper ─────────────────────────────────────────
const ReadOnlyTextarea = ({ label, value, rows = 3 }: { label: string; value: string; rows?: number }) => (
    <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
        </label>
        <textarea
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300 resize-none"
            readOnly
            rows={rows}
            value={value}
        />
    </div>
);

// ── Main Component ──────────────────────────────────────────────────
export default function EmployeeResignations() {
    const [requests, setRequests] = useState<ResignationRequest[]>([]);

    const fetchRequests = useCallback(async () => {
        try {
            const data = await getAllResignationRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch resignations:', error);
        }
    }, []);

    useEffect(() => {
         
        fetchRequests();
    }, [fetchRequests]);

    const [selectedRequest, setSelectedRequest] = useState<ResignationRequest | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("SUBMITTED");
    const [timeFilter, setTimeFilter] = useState<'2days' | 'week' | 'month' | 'year'>('2days');
    const [showVerifiedList, setShowVerifiedList] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    // ── Reject popup state ────────────────────────────────────────────
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectReasonError, setRejectReasonError] = useState(false);

    // ── Handlers ─────────────────────────────────────────────────────
    const handleDownload = async (path: string | undefined) => {
        if (!path) return;
        if (!path.includes('/')) {
            alert('File not available (legacy format)');
            return;
        }
        const url = await getHrmsSignedUrl(path);
        if (url) {
            window.open(url, '_blank');
        } else {
            alert('Failed to get download URL');
        }
    };

    const handleView = (req: ResignationRequest) => {
        setSelectedRequest(req);
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
    };

    const handleOpenRejectDialog = () => {
        setRejectReason("");
        setRejectReasonError(false);
        setShowRejectDialog(true);
    };

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
            await updateResignationStatus(selectedRequest.id, "REJECTED", rejectReason);
            await fetchRequests();
            handleCloseRejectDialog();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to reject:', error);
        }
    };

    const handleVerify = async () => {
        if (!selectedRequest) return;
        try {
            await updateResignationStatus(selectedRequest.id, "VERIFIED_BY_HR");
            await fetchRequests();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to verify:', error);
        }
    };

    const handleShowVerifiedList = () => {
        setShowVerifiedList(true);
        setSearchTerm("");
        setStatusFilter("All");
        setCurrentPage(1);
    };

    const handleBackToList = () => {
        setShowVerifiedList(false);
        setShowConfirmDialog(false);
        setCurrentPage(1);
    };

    const handleConfirmSubmitToAdmin = async () => {
        const verifiedRequests = requests.filter((r) => r.status === "VERIFIED_BY_HR");
        
        try {
            await Promise.all(
                verifiedRequests.map((req) => updateResignationStatus(req.id, "PENDING_ADMIN"))
            );
            await fetchRequests();
            setShowConfirmDialog(false);
            setShowVerifiedList(false);
        } catch (error) {
            console.error('Failed to submit to admin:', error);
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────
    const getFilteredRequests = () => {
        let list = requests;
        if (showVerifiedList) {
            list = list.filter((r) => r.status === "VERIFIED_BY_HR");
        }
        return list.filter((req) => {
            // Exclude Drafts (NEW) from HR view
            if (req.status === "NEW") return false;

            const matchesSearch =
                req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.epfNumber.includes(searchTerm);
            const matchesStatus = statusFilter === "All" || req.status === statusFilter;
            
            let matchesTime = true;
            const d = req.createdAt || req.resignationDate;
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
            return matchesSearch && matchesStatus && matchesTime;
        });
    };

    const filteredRequests = getFilteredRequests();
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const verifiedCount = requests.filter((r) => r.status === "VERIFIED_BY_HR").length;

    // ── Format helpers ────────────────────────────────────────────────
    const formatDate = (iso: string) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="flex-1 p-8 pb-16 max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {showVerifiedList ? (
                                <button onClick={handleBackToList} className="text-slate-400 hover:text-primary transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                            ) : (
                                <Link href="/hr/employees" className="text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </Link>
                            )}
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                                {showVerifiedList ? "Admin Approval List" : "Employee Resignations"}
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 ml-9">
                            {showVerifiedList
                                ? "Review the verified resignation requests below. Submit this list for Admin approval."
                                : "Review, verify eligibility, and manage employee resignation requests across all branches."}
                        </p>
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
                        {showVerifiedList ? (
                            <div className="flex items-center gap-3">
                                <span className="px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">filter_list</span>
                                    Verified Requests Only
                                </span>
                                <button
                                    onClick={() => setShowConfirmDialog(true)}
                                    disabled={verifiedCount === 0}
                                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                    Submit for Admin Approvals
                                </button>
                            </div>
                        ) : (
                            <>
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
                                {verifiedCount > 0 && (
                                    <button
                                        onClick={handleShowVerifiedList}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">checklist</span>
                                        Submit List for Admin ({verifiedCount})
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                {!showVerifiedList && (
                    <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(
                            [
                                { label: "Submitted", status: "SUBMITTED", icon: "send", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", ring: "ring-amber-500" },
                                { label: "Verified", status: "VERIFIED_BY_HR", icon: "verified", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", ring: "ring-emerald-500" },
                                { label: "Pending Admin", status: "PENDING_ADMIN", icon: "pending_actions", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", ring: "ring-blue-500" },
                                { label: "Rejected", status: "REJECTED", icon: "cancel", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", ring: "ring-red-500" },
                            ] as const
                        ).map(({ label, status, icon, color, bg, ring }) => {
                            const statCount = requests.filter((r) => r.status === status).filter(req => {
                                let matchesTime = true;
                                const d = req.createdAt || req.resignationDate;
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
                )}

                {/* Data Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    <th className="py-4 px-6">Request ID</th>
                                    <th className="py-4 px-6">Employee</th>
                                    <th className="py-4 px-6 text-center">Initiation Date</th>
                                    <th className="py-4 px-6 text-center">Effective Date</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {paginatedRequests.map((req) => {
                                    const st = getStatusBadge(req.status);
                                    return (
                                        <tr
                                            key={req.id}
                                            className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group"
                                        >
                                            <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                                                {req.id}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-slate-800 dark:text-white">{req.employeeName}</div>
                                                <div className="text-xs text-slate-500">EPF: {req.epfNumber}</div>
                                            </td>
                                            <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-300">{formatDate(req.resignationDate)}</td>
                                            <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-300">{formatDate(req.lastWorkingDate)}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold ${st.classes}`}>
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
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            No resignation requests found matching your filters.
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

                {/* Review Modal */}
                {selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-2xl">directions_walk</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {selectedRequest.status === "SUBMITTED" && !showVerifiedList
                                                ? "Verify Resignation Request"
                                                : "View Resignation Request"}
                                        </h3>
                                        <p className="text-sm text-slate-500">Request ID: {selectedRequest.id} · {selectedRequest.employeeName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-8 overflow-y-auto flex-1 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <ReadOnlyField label="Current Designation" value={selectedRequest.designation} />
                                    <ReadOnlyField label="Branch" value={selectedRequest.branch} />
                                    <ReadOnlyField label="Initiation Date" value={formatDate(selectedRequest.resignationDate)} />
                                    <ReadOnlyField label="Last Working Date" value={formatDate(selectedRequest.lastWorkingDate)} />
                                </div>

                                <ReadOnlyTextarea label="Reason for Resignation" value={selectedRequest.reason} />
                                <ReadOnlyTextarea label="Obligation Details" value={selectedRequest.obligationDetails} />
                                <ReadOnlyTextarea label="Special Remarks" value={selectedRequest.specialRemark || "No special remarks provided."} />

                                {/* Document Cards */}
                                <div className="space-y-4">
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Required Documents
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedRequest.documents.resignationLetter && (
                                            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10 p-5 transition-all">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-900/30">
                                                        <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400">check_circle</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Resignation Letter</p>
                                                            <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded uppercase">Uploaded</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{selectedRequest.documents.resignationLetter}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDownload(selectedRequest.documents.resignationLetter)}
                                                                className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">download</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedRequest.documents.clearanceLetter && (
                                            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10 p-5 transition-all">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-900/30">
                                                        <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400">check_circle</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Clearance Letter</p>
                                                            <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded uppercase">Uploaded</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{selectedRequest.documents.clearanceLetter}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDownload(selectedRequest.documents.clearanceLetter)}
                                                                className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">download</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedRequest.documents.handoverChecklist && (
                                            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10 p-5 transition-all">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-900/30">
                                                        <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400">check_circle</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Handover Checklist</p>
                                                            <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded uppercase">Uploaded</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{selectedRequest.documents.handoverChecklist}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDownload(selectedRequest.documents.handoverChecklist)}
                                                                className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">download</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedRequest.hrRemark && (
                                    <ReadOnlyTextarea label="HR Remarks" value={selectedRequest.hrRemark} />
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
                                {selectedRequest.status === "SUBMITTED" && !showVerifiedList ? (
                                    <>
                                        <button
                                            onClick={handleOpenRejectDialog}
                                            className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                                        >
                                            Reject Request
                                        </button>
                                        <button
                                            onClick={handleVerify}
                                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">verified</span>
                                            Verify &amp; Add to Admin List
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Batch Submit Dialog */}
                {showConfirmDialog && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">warning</span>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Confirm Submission</h3>
                            </div>
                            <div className="p-8 text-center bg-white">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-primary text-3xl">send</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    You are about to compile <span className="font-bold text-slate-800 dark:text-white">{verifiedCount} verified resignation requests</span> and submit them for Admin approval.
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
                                <p className="text-sm text-slate-600 dark:text-slate-400">Please provide a reason for rejecting this request.</p>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => {
                                        setRejectReason(e.target.value);
                                        if (e.target.value.trim()) setRejectReasonError(false);
                                    }}
                                    placeholder="e.g. Missing mandatory documents..."
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

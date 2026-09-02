"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User, Calendar, MapPin, Briefcase, FileText, CheckCircle2, XCircle, Search, Clock, ArrowRight, Printer, Eye, Mail, Phone, ExternalLink, Check, X, Send, MonitorPlay } from "lucide-react";
import { getHrmsSignedUrl } from '@/lib/supabaseClient';
import { getAllResignationRequests, updateResignationStatus, ResignationRequest } from "@/lib/api/resignationRequests";
import { ResignationRequestForm } from '@/app/hr/employees/resignations/components/ResignationRequestForm';

type RequestStatus = ResignationRequest['status'];

// ── Mock Data (Removed per user request) ───────────────────────────
const MOCK: ResignationRequest[] = [];

// ── Status Badge Config ──────────────────────────────────────────────
const statusConfig: Record<string, { label: string; classes: string }> = {
    "Pending Director": {
        label: "Pending Review",
        classes: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    },
    "Board Approved": {
        label: "Approved",
        classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    "Board Rejected": {
        label: "Rejected",
        classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
};

// ── Helpers ──────────────────────────────────────────────────────────
const fmt = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-slate-800">
        <span className="text-gray-500 dark:text-slate-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
);


const FlagRow = ({ label, active, note }: { label: string; active: boolean; note: string }) => (
    <div className="flex items-center gap-3">
        {active ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
        <div className="text-sm">
            <p className="font-medium text-gray-700 dark:text-zinc-300">{label}</p>
            <p className="text-[10px] text-gray-400">{note}</p>
        </div>
    </div>
);


// ── Main Component ───────────────────────────────────────────────────
export default function ResignationTable() {
    const [requests, setRequests] = useState<ResignationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getAllResignationRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch resignations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current');
    const todayStr = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('year');
    const [statusFilter, setStatusFilter] = useState('All');

    const isActionable = (dateString?: string) => {
        if (!dateString) return true;
        try {
            const dateStr = new Date(dateString).toISOString().split('T')[0];
            return dateStr <= todayStr;
        } catch (e) {
            return true;
        }
    };

    // Reject popup
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState(false);

    // Letter preview
    const [letterPreviewReq, setLetterPreviewReq] = useState<ResignationRequest | null>(null);

    // View modal
    const [viewingRequest, setViewingRequest] = useState<ResignationRequest | null>(null);

    // Detail expand
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Toast
    const [toast, setToast] = useState<string | null>(null);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    }, []);

    const handleDownload = async (path: string) => {
        if (!path || !path.includes('/')) {
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

    const normalizeDate = useCallback((d?: string) => {
        if (!d) return "";
        try {
            const dateObj = new Date(d as string);
            if (isNaN(dateObj.getTime())) return d;
            return dateObj.toISOString().split('T')[0];
        } catch(e) {
            return d;
        }
    }, []);

    // ── Filtered list ─────────────────────────────────────────────────
    const timeFilteredRequests = React.useMemo(() => {
        return requests.filter(req => {
            const pivotDate = todayStr;
            const reqDate = normalizeDate(req.boardMeetingDate);
            if (!reqDate) return false;
            if (String(req.status).toUpperCase() === 'SUBMITTED' || String(req.status).toUpperCase() === 'DRAFT' || String(req.status).toUpperCase() === 'NEW') return false;

            let matchesTab = true;
            if (activeTab === 'current') matchesTab = reqDate === selectedDate;
            else if (activeTab === 'upcoming') {
                if (selectedDate === 'All') matchesTab = reqDate > pivotDate;
                else matchesTab = reqDate === selectedDate;
            }
            else if (activeTab === 'past') {
                if (selectedDate === 'All') matchesTab = reqDate < pivotDate;
                else matchesTab = reqDate === selectedDate;
            }
            if (!matchesTab) return false;

            let matchesTime = true;
            if (req.resignationDate || req.createdAt) {
                const dateStr = req.resignationDate || req.createdAt;
                const reqCreationDate = new Date(dateStr as string);
                if (!isNaN(reqCreationDate.getTime())) {
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const reqDay = new Date(reqCreationDate.getFullYear(), reqCreationDate.getMonth(), reqCreationDate.getDate());
                    
                    if (timeFilter === 'today') {
                        matchesTime = reqDay.getTime() === today.getTime();
                    } else if (timeFilter === 'week') {
                        const lastWeek = new Date(today);
                        lastWeek.setDate(lastWeek.getDate() - 6);
                        matchesTime = reqDay >= lastWeek && reqDay <= today;
                    } else if (timeFilter === 'month') {
                        matchesTime = reqDay.getMonth() === today.getMonth() && reqDay.getFullYear() === today.getFullYear();
                    } else if (timeFilter === 'year') {
                        matchesTime = reqDay.getFullYear() === today.getFullYear();
                    }
                }
            }
            return matchesTime;
        });
    }, [requests, activeTab, selectedDate, todayStr, timeFilter]);

    const filteredRequests = React.useMemo(() => {
        return timeFilteredRequests.filter(req => {
            if (statusFilter !== 'All' && String(req.status) !== statusFilter) return false;
            return true;
        });
    }, [timeFilteredRequests, statusFilter]);

    // ── Stats derived from state ──────────────────────────────────────
    // Stats are mapped directly inside JSX below



    const getDropdownOptions = () => {
        if (activeTab === 'current') return [todayStr];
        const allDates = Array.from(new Set(requests.map(r => normalizeDate(r.boardMeetingDate)).filter(Boolean))).sort();
        if (activeTab === 'upcoming') return allDates.filter(d => d > todayStr);
        return allDates.filter(d => d < todayStr);
    };

    const handleTabChange = (tab: 'current' | 'upcoming' | 'past') => {
        setActiveTab(tab);
        setSelectedDate(tab === 'current' ? todayStr : 'All');
    };



    // ── Handlers ─────────────────────────────────────────────────────
    const handleApprove = async (id: string) => {
        try {
            await updateResignationStatus(id, "Board Approved");
            await fetchRequests();
            showToast(`successfully approved and email sent!`);
        } catch (error) {
            console.error("Failed to approve:", error);
        }
    };

    const openRejectPopup = (id: string) => {
        setRejectId(id);
        setRejectReason("");
        setRejectError(false);
    };

    const handleConfirmReject = async () => {
        if (!rejectId || !rejectReason.trim()) return;
        try {
            await updateResignationStatus(rejectId, "Board Rejected", rejectReason);
            await fetchRequests();
            showToast(`application rejected !`);
            setRejectId(null);
        } catch (error) {
            console.error("Failed to reject:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Time Filter Dropdown */}
            <div className="flex justify-end mb-4">
                <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as any)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm text-sm font-bold"
                >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Requests", status: "All", icon: "description", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", ring: "ring-blue-500" },
                    { label: "Pending", status: "Pending Director", icon: "schedule", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", ring: "ring-yellow-500" },
                    { label: "Approved", status: "Board Approved", icon: "check_circle", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", ring: "ring-green-500" },
                    { label: "Rejected", status: "Board Rejected", icon: "cancel", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", ring: "ring-red-500" },
                ].map(({ label, status, icon, color, bg, ring }) => {
                    const statCount = timeFilteredRequests.filter(r => status === 'All' || String(r.status) === status).length;
                    return (
                        <div
                            key={status}
                            onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
                            className={`rounded-xl p-4 ${bg} border border-slate-200 dark:border-zinc-700 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] ${statusFilter === status ? `ring-2 ${ring}` : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
                                <span className="text-gray-600 dark:text-zinc-300 font-bold text-sm">{label}</span>
                            </div>
                            <span className={`text-2xl font-black ${color}`}>{statCount}</span>
                        </div>
                    );
                })}
            </div>

            {/* Tabs & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-slate-800 pb-2">
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleTabChange('current')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'current' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        Meeting View
                    </button>
                    <button 
                        onClick={() => handleTabChange('upcoming')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        Upcoming Meetings
                    </button>
                    <button 
                        onClick={() => handleTabChange('past')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        Past Meetings
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm mr-2 mb-2 sm:mb-0">
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Meeting Date:</label>
                    <select 
                        className="bg-transparent text-sm font-medium text-gray-900 dark:text-slate-200 focus:outline-none cursor-pointer"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                    >
                        {activeTab !== 'current' && <option value="All" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">All Dates</option>}
                        {getDropdownOptions().map(d => (
                            <option key={d} value={d} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
            </div>


            {/* Main Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800">
                            <tr>

                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Employee</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Reason</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Effective Date</th>
                                <th className="px-6 py-4 font-semibold text-primary">Board Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredRequests.map((req) => {
                                const st = statusConfig[req.status] || { label: req.status, classes: "bg-slate-100 text-slate-600" };
                                const isToday = req.boardMeetingDate === todayStr;
                                const isExpanded = expandedId === req.id;
                                const isPending = req.status === "Pending Director" || req.status === "PENDING_ADMIN";
                                const initials = req.employeeName ? req.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "??";
                                const actionsDisabled = !isActionable(req.boardMeetingDate || "");

                                return (
                                    <React.Fragment key={req.id}>
                                        <tr
                                            className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                                            onClick={() => setExpandedId(isExpanded ? null : req.id)}
                                        >
                                            {/* Employee */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{req.employeeName}</p>
                                                        <p className="text-xs text-gray-500 dark:text-slate-400">{req.id} · {req.designation}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Reason */}
                                            <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{req.reason}</td>
                                            {/* Effective Date */}
                                            <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{fmt(req.lastWorkingDate)}</td>
                                            {/* Board Date */}
                                            <td className="px-6 py-4 font-bold text-primary">
                                                {fmt(req.boardMeetingDate)}
                                                {isToday && (
                                                    <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full animate-pulse font-bold">TODAY</span>
                                                )}
                                            </td>
                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${st.classes}`}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        title="View Details"
                                                        onClick={() => setViewingRequest(req)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer transition-all"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {isPending && isActionable(req.boardMeetingDate || "") && (
                                                        <>
                                                            <button
                                                                title="Approve"
                                                                onClick={() => handleApprove(req.id)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 cursor-pointer"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                title="Reject"
                                                                onClick={() => openRejectPopup(req.id)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {req.status === "Board Approved" && (
                                                        <button
                                                            title="Preview Resignation Letter"
                                                            onClick={() => setLetterPreviewReq(req)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                            Letter
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ── Expanded Detail Row ─────────────────────────────────── */}
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={7} className="bg-gray-50/80 dark:bg-slate-800/40 px-8 py-5 border-b border-gray-100 dark:border-slate-800">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                        {/* Employee Details */}
                                                        <div className="space-y-3">
                                                            <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest">Employee Details</p>
                                                            <InfoRow label="EPF Number" value={req.epfNumber} />
                                                            <InfoRow label="Branch" value={req.branch} />
                                                            <InfoRow label="Initiation Date" value={fmt(req.resignationDate)} />
                                                            <InfoRow label="Email" value="N/A" />
                                                            <InfoRow label="Phone" value="N/A" />
                                                        </div>
                                                        {/* Remarks */}
                                                        <div className="space-y-3">
                                                            <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest">Remarks</p>
                                                            <InfoRow label="HR Remark" value={req.hrRemark || "—"} />
                                                            <InfoRow label="Director Remark" value={req.directorRemark || "—"} />
                                                        </div>
                                                        {/* Post-Approval Flags */}
                                                        <div className="space-y-3">
                                                            <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest">Post-Approval Workflow</p>
                                                            <FlagRow label="Payroll Closure" active={false} note={`Effective: ${fmt(req.lastWorkingDate)}`} />
                                                            <FlagRow label="Account Deactivation" active={false} note={`Scheduled: ${fmt(req.lastWorkingDate)}`} />

                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-slate-400">
                                        No resignation requests in this category.
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── View Details Modal ───────────────────────────────────────── */}
            {viewingRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-full transition-colors relative">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <span className="material-symbols-outlined text-2xl">person_remove</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Resignation Request Details</h3>
                                    <p className="text-sm text-slate-500">Request ID: {viewingRequest.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewingRequest(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-2 overflow-y-auto flex-1">
                            <ResignationRequestForm 
                                initialData={viewingRequest as any}
                                isReadOnly={true}
                                onSave={() => {}}
                                onCancel={() => setViewingRequest(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Reject Popup ─────────────────────────────────────────────── */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-zinc-700">
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-700 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <X className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">Reject Resignation</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {requests.find((r) => r.id === rejectId)?.employeeName} · {rejectId}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Provide a mandatory reason. The employee will be notified via Email.
                            </p>
                            <textarea
                                value={rejectReason}
                                autoFocus
                                onChange={(e) => { setRejectReason(e.target.value); if (e.target.value.trim()) setRejectError(false); }}
                                rows={4}
                                placeholder="State the reason for rejection..."
                                className={`w-full rounded-xl border px-4 py-3 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 outline-none resize-none transition-colors focus:ring-2 ${rejectError
                                    ? "border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30"
                                    : "border-gray-200 dark:border-zinc-600 focus:ring-primary/20 focus:border-primary"
                                    }`}
                            />
                            {rejectError && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">error</span>
                                    Rejection reason is mandatory.
                                </p>
                            )}
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-700">
                            <button
                                onClick={() => setRejectId(null)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-800 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toast ───────────────────────────────────────────────────── */}
            {toast && (
                <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="font-medium">{toast}</p>
                </div>
            )}

            {/* ── Letter Preview Modal ─────────────────────────────────────── */}
            {letterPreviewReq && (() => {
                const r = letterPreviewReq;
                const today2 = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
                return (
                    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:bg-transparent print:p-0 print:block print:overflow-visible">

                        {/* Print-only style: visibility approach works at any nesting depth */}
                        <style>{`
                            @media print {
                                body * { visibility: hidden !important; }
                                #resignation-letter-print,
                                #resignation-letter-print * { visibility: visible !important; }
                                #resignation-letter-print {
                                    position: fixed !important;
                                    top: 0 !important;
                                    left: 0 !important;
                                    width: 100% !important;
                                    height: auto !important;
                                    box-shadow: none !important;
                                    border: none !important;
                                    border-radius: 0 !important;
                                    margin: 0 !important;
                                    overflow: visible !important;
                                }
                            }
                        `}</style>

                        <div
                            id="resignation-letter-print"
                            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 my-6 overflow-hidden print:shadow-none print:border-none print:rounded-none print:max-w-full print:my-0"
                        >
                            {/* Modal toolbar — hidden when printing */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 print:hidden">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Printer className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Resignation Acceptance Letter</p>
                                        <p className="text-xs text-gray-500">{r.id} · {r.employeeName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                    <button
                                        onClick={() => setLetterPreviewReq(null)}
                                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Letter Body — A4-style traditional format */}
                            <div className="px-14 py-10 text-[13px] text-gray-800 leading-7 space-y-4 font-[Georgia,serif]">

                                {/* Letterhead */}
                                <div className="text-center pb-5 border-b border-gray-300 mb-6">
                                    <p className="text-xl font-bold tracking-wide text-gray-900">HR MATE</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Human Resources Management System</p>
                                </div>

                                {/* Date + Ref (right-aligned) */}
                                <div className="text-right text-[12px] text-gray-600 space-y-0.5">
                                    <p>{today2}</p>
                                    <p>Ref: <span className="font-semibold">{r.id}</span></p>
                                </div>

                                {/* Recipient address block */}
                                <div className="space-y-0.5 mt-2">
                                    <p className="font-semibold">{r.employeeName}</p>
                                    <p className="text-gray-600">{r.designation}</p>
                                    <p className="text-gray-600">{r.branch}</p>
                                    <p className="text-gray-600">EPF No: {r.epfNumber}</p>
                                </div>

                                {/* Subject line */}
                                <p className="mt-4 font-bold underline underline-offset-2">
                                    Re: Acceptance of Resignation
                                </p>

                                {/* Salutation */}
                                <p>Dear {r.employeeName.split(" ")[0]},</p>

                                {/* Body */}
                                <p>
                                    We write with reference to your resignation letter dated{" "}
                                    <span className="font-semibold">{fmt(r.resignationDate)}</span>. After due consideration
                                    by the Board of Directors, we hereby formally accept your resignation from the position
                                    of <span className="font-semibold">{r.designation}</span>, {r.branch}.
                                </p>
                                <p>
                                    Your reason for resignation has been noted as: <span className="font-semibold">{r.reason}</span>.
                                </p>
                                <p>
                                    Your last day of service is confirmed as{" "}
                                    <span className="font-semibold">{fmt(r.lastWorkingDate)}</span>. We kindly request
                                    that you ensure a proper handover of all responsibilities, assets, and documentation
                                    before your departure.
                                </p>
                                <p>
                                    Please be advised that your payroll will be finalised and closed as of the above
                                    effective date. Your employee account and system access privileges will accordingly
                                    be deactivated on the same date.
                                </p>

                                {/* Director remark — only shown if present */}
                                {r.directorRemark && (
                                    <p>
                                        <span className="font-semibold">Note from the Director: </span>
                                        {r.directorRemark}
                                    </p>
                                )}

                                <p>
                                    We take this opportunity to sincerely thank you for your valuable contributions
                                    to the organisation during your tenure. We extend our best wishes to you for
                                    your future endeavours.
                                </p>

                                {/* Closing */}
                                <p>Yours faithfully,</p>

                                {/* Signature */}
                                <div className="pt-10">
                                    <div className="w-36 border-t border-gray-500 mb-2" />
                                    <p className="font-semibold">Director — Human Resources</p>
                                    <p className="text-gray-500 text-[12px]">HR MATE</p>
                                </div>
                            </div>

                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

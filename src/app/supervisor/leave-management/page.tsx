"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import UserAvatar from "@/components/common/UserAvatar";
import {
    Search, Calendar, Download, PenLine,
    X, CheckCircle, BookOpen,
    ChevronDown, ClipboardList, AlertCircle, XCircle, Clock
} from "lucide-react";
import SupervisorSummaryCard from "@/components/supervisor/SupervisorSummaryCard";

type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Closed";
type LeaveType = "Annual Leave" | "Medical Leave" | "Casual Leave";

interface LeaveRequest {
    id: string;
    empId: string;
    name: string;
    role: string;
    department: string;
    avatar: string;
    leaveType: LeaveType;
    status: LeaveStatus;
    fromDate: string;
    toDate: string;
    reason: string;
    isFullTime?: boolean;
    annualLeaveRemaining: number;
    medicalLeaveRemaining: number;
    isActiveShift?: boolean;
}


function getDiffDays(from: string, to: string): number {
    const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const parse = (d: string) => {
        if (!d) return new Date();
        const parts = d.replace(",", "").split(" ");
        if (parts.length >= 3 && months[parts[0]] !== undefined) {
            return new Date(Number(parts[2]), months[parts[0]], Number(parts[1]));
        }
        return new Date(d);
    };
    return Math.ceil((parse(to).getTime() - parse(from).getTime()) / 86400000) + 1;
}

function getDuration(from: string, to: string): string {
    const diff = getDiffDays(from, to);
    return `${diff} Day${diff > 1 ? "s" : ""}`;
}

const STATUS_BADGE: Record<LeaveStatus, string> = {
    Pending: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
    Approved: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30",
    Rejected: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30",
    Closed: "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700",
};

const LEAVE_TYPE_COLOR: Record<LeaveType, string> = {
    "Annual Leave": "text-[#9e3f00] dark:text-orange-400",
    "Medical Leave": "text-blue-600 dark:text-blue-400",
    "Casual Leave": "text-purple-600 dark:text-purple-400",
};

// Maps any backend status string to a display LeaveStatus
function mapBackendStatus(raw: string): LeaveStatus {
    if (!raw) return "Pending";
    const u = raw.toUpperCase();
    if (u.includes("APPROVED") && !u.includes("PENDING")) return "Approved";
    if (u.includes("REJECTED"))  return "Rejected";
    if (u.includes("CLOSED"))    return "Closed";
    return "Pending"; // covers PENDING_SUPERVISOR_APPROVAL, PENDING_HR_APPROVAL, etc.
}

// Normalises leave type name from backend to match frontend enum
function normaliseLeaveType(raw: string): LeaveType {
    const lower = (raw || "").toLowerCase();
    if (lower.includes("annual"))  return "Annual Leave";
    if (lower.includes("sick") || lower.includes("medical")) return "Medical Leave";
    if (lower.includes("casual"))  return "Casual Leave";
    return "Annual Leave";
}

export default function LeaveManagementPage() {
    const { user } = useAuthStore();
    const [isClient, setIsClient] = useState(false);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [q, setQ] = useState("");
    const [sel, setSel] = useState<LeaveRequest | null>(null);
    const [remarks, setRemarks] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Requests");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [dateFilter, setDateFilter] = useState("");  // ISO date string e.g. "2026-08-23"
    const [toast, setToast] = useState({ msg: "", on: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsClient(true);
        const fetchLeaves = async () => {
            try {
                // Fetch data from real backend endpoint
                const [leaveRes, empRes] = await Promise.allSettled([
                    api.get("/api/v1/leaves/normal"),
                    api.get("/api/employees")
                ]);
                
                let teamIds: number[] = [];
                if (empRes.status === "fulfilled") {
                    let emps = empRes.value.data;
                    if (emps.length === 0) {
                        const allEmpRes = await api.get("/api/employees");
                        emps = allEmpRes.data;
                    }
                    teamIds = emps.map((e: any) => Number(e.id));
                }

                if (leaveRes.status === "fulfilled") {
                    const data = leaveRes.value.data;
                    
                    const mapped: LeaveRequest[] = data
                        .filter((d: any) => teamIds.includes(Number(d.employeeId)))
                        .filter((d: any) => getDiffDays(d.fromDate, d.endDate) < 3)
                        .map((d: any) => ({
                    id: d.id.toString(),
                    empId: d.employeeCode || d.employeeId?.toString() || "Unknown",
                    name: d.employeeName || "Unknown",
                    role: d.designation || d.role || "Employee",
                    department: d.department || "Unknown",
                    avatar: d.profilePicturePath || "/default-avatar.png",
                    leaveType: normaliseLeaveType(d.leaveTypeName),
                    status: mapBackendStatus(d.status),
                    fromDate: d.fromDate || "",
                    toDate: d.endDate || "",
                    reason: d.reason || "",
                    annualLeaveRemaining: d.annualLeaveRemaining ?? 0,
                    medicalLeaveRemaining: d.medicalLeaveRemaining ?? 0,
                    }));
                    
                    setRequests(mapped);
                }
            } catch (err) {
                console.error(err);
                pop("Failed to load leave requests from server.");
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) {
            fetchLeaves();
        }
    }, [user?.id]);

    const pop = (msg: string) => {
        setToast({ msg, on: true });
        setTimeout(() => setToast(t => ({ ...t, on: false })), 3500);
    };

    const handleExport = () => {
        const headers = ["ID,Employee ID,Name,Role,Department,Leave Type,Status,From Date,To Date,Reason"];
        const rows = filtered.map(r => 
            `"${r.id}","${r.empId}","${r.name}","${r.role}","${r.department}","${r.leaveType}","${r.status}","${r.fromDate}","${r.toDate}","${r.reason.replace(/"/g, '""')}"`
        );
        const csvContent = headers.concat(rows).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'leave_requests_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        pop("Export downloaded successfully!");
    };

    const handleApprove = async (id: string) => {
        try {
            await api.post("/api/v1/approvals", {
                refId: Number(id),
                refType: "NORMAL_LEAVE",
                decision: "APPROVED",
                remark: remarks || "Approved by supervisor",
                approvedBy: { id: user?.id }
            });
            
            setRequests(p => p.map(r => r.id === id ? { ...r, status: "Approved" as LeaveStatus } : r));
            pop(`Leave request approved successfully.`);
            if (sel?.id === id) setSel(prev => prev ? { ...prev, status: "Approved" } : null);
        } catch (err) {
            console.error(err);
            pop("Failed to approve request.");
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.post("/api/v1/approvals", {
                refId: Number(id),
                refType: "NORMAL_LEAVE",
                decision: "REJECTED",
                remark: remarks || "Rejected by supervisor",
                approvedBy: { id: user?.id }
            });

            setRequests(p => p.map(r => r.id === id ? { ...r, status: "Rejected" as LeaveStatus } : r));
            pop(`Leave request rejected.`);
            if (sel?.id === id) setSel(prev => prev ? { ...prev, status: "Rejected" } : null);
        } catch (err) {
            console.error(err);
            pop("Failed to reject request.");
        }
    };

    const filtered = requests.filter(r => {
        const matchQ = r.name.toLowerCase().includes(q.toLowerCase()) || r.empId.toLowerCase().includes(q.toLowerCase());
        const matchStatus = statusFilter === "All Requests" || r.status === statusFilter;
        const matchType = typeFilter === "All Types" || r.leaveType === typeFilter;
        // Date filter: show request if the selected date falls within the leave period
        let matchDate = true;
        if (dateFilter) {
            const selected = new Date(dateFilter).getTime();
            const from = new Date(r.fromDate).getTime();
            const to   = new Date(r.toDate).getTime();
            matchDate = !isNaN(selected) && !isNaN(from) && !isNaN(to) && selected >= from && selected <= to;
        }
        return matchQ && matchStatus && matchType && matchDate;
    });

    const totalCount = requests.length;
    const pendingCount = requests.filter(r => r.status === "Pending").length;
    const approvedCount = requests.filter(r => r.status === "Approved").length;
    const rejectedCount = requests.filter(r => r.status === "Rejected" || r.status === "Closed").length;

    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Review, approve, or reject leave requests from your direct reports.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* ── Summary Stats ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <SupervisorSummaryCard
                    title="Total Requests"
                    value={String(totalCount)}
                    subtext="All team submissions"
                    icon={ClipboardList}
                    variant="primary"
                />
                <SupervisorSummaryCard
                    title="Pending Action"
                    value={String(pendingCount)}
                    subtext={
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {pendingCount > 0 ? "Requires review" : "All cleared"}
                        </span>
                    }
                    icon={Clock}
                    variant="amber"
                />
                <SupervisorSummaryCard
                    title="Approved"
                    value={String(approvedCount)}
                    subtext={
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approved leaves
                        </span>
                    }
                    icon={CheckCircle}
                    variant="emerald"
                />
                <SupervisorSummaryCard
                    title="Rejected / Closed"
                    value={String(rejectedCount)}
                    subtext={
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Closed requests
                        </span>
                    }
                    icon={XCircle}
                    variant="rose"
                />
            </div>

            {/* ── Filter Bar ────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap items-center gap-4 transition-colors">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Search employee or ID..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status:</span>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
                    >
                        <option value="All Requests">All Requests</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Type:</span>
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
                    >
                        <option value="All Types">All Types</option>
                        <option value="Annual Leave">Annual Leave</option>
                        <option value="Medical Leave">Medical Leave</option>
                        <option value="Casual Leave">Casual Leave</option>
                    </select>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Date:</span>
                    <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                        <Calendar className="w-4 h-4 text-primary dark:text-orange-400 mr-2 flex-shrink-0" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                            className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-transparent border-none outline-none cursor-pointer"
                        />
                        {dateFilter && (
                            <button
                                onClick={() => setDateFilter("")}
                                className="ml-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Clear date filter"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0 gap-6">
                {/* Leave Cards Grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined animate-spin text-4xl mb-3">progress_activity</span>
                                <p className="text-sm font-medium">Loading leave requests...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
                                <CheckCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-sm font-medium">No leave requests found.</p>
                            </div>
                        ) : (
                            filtered.map(req => (
                                <LeaveCard
                                    key={req.id}
                                    req={req}
                                    selected={sel?.id === req.id}
                                    onSelect={() => { setSel(req); setRemarks(""); }}
                                    onApprove={() => handleApprove(req.id)}
                                    onReject={() => handleReject(req.id)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                {sel && (
                    <aside className="w-[360px] flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-y-auto shadow-lg transition-colors">
                        {/* Panel Header */}
                        <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <UserAvatar user={{ name: sel.name, profilePicturePath: sel.avatar }} size="md" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{sel.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{sel.role} · {sel.department}</p>
                                </div>
                            </div>
                            <button onClick={() => setSel(null)} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4 p-5 flex-1">
                            {/* Leave Type & Duration */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Leave Type</p>
                                    <p className={`text-sm font-semibold ${LEAVE_TYPE_COLOR[sel.leaveType]}`}>{sel.leaveType}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Duration</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{getDuration(sel.fromDate, sel.toDate)}</p>
                                </div>
                            </div>

                            {/* Remaining Leave Balance */}
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-xl p-4 transition-colors">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Remaining Leave Balance</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                                            {String(sel.annualLeaveRemaining).padStart(2, "0")}
                                            <span className="text-xs font-normal text-gray-500 dark:text-slate-400 ml-1">Days</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Annual Leave</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary dark:text-orange-400 leading-none">
                                            {String(sel.medicalLeaveRemaining).padStart(2, "0")}
                                            <span className="text-xs font-normal text-gray-500 dark:text-slate-400 ml-1">Days</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Medical Leave</p>
                                    </div>
                                </div>
                            </div>

                            {/* Date Range */}
                            <div>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Date Range</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">From</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{sel.fromDate}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">To</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{sel.toDate}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Reason from Employee</p>
                                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                    <p className="text-sm text-gray-700 dark:text-slate-300 italic leading-relaxed">&ldquo;{sel.reason}&rdquo;</p>
                                </div>
                            </div>

                            {/* Supervisor Remarks */}
                            <div>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Supervisor Remarks</p>
                                <textarea
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                    rows={2}
                                    placeholder="Enter remarks for the employee..."
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 placeholder-gray-400 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 transition-colors"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-auto pt-2">
                                {sel.status === "Pending" ? (
                                    <>
                                        <button
                                            onClick={() => handleReject(sel.id)}
                                            className="flex-1 py-2 text-sm font-semibold text-red-600 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/40 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(sel.id)}
                                            className="flex-1 py-2 text-sm font-semibold text-white bg-primary hover:bg-[#7a3000] rounded-lg transition-colors cursor-pointer"
                                        >
                                            Approve
                                        </button>
                                    </>
                                ) : (
                                    <div className={`flex-1 py-2 text-sm font-semibold text-center rounded-lg ${sel.status === "Approved" ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30" :
                                        sel.status === "Rejected" ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30" :
                                            "bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700"
                                        }`}>
                                        {sel.status === "Approved" ? "✓ Approved" : sel.status === "Rejected" ? "✗ Rejected" : "Closed"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* ── Status Bar ─────────────────────────────────────────────────── */}
            <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-6 py-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 transition-colors">
                <div className="flex items-center gap-6">
                    {[
                        { dot: "bg-amber-400", n: pendingCount, lbl: "Pending Requests" },
                        { dot: "bg-green-500", n: approvedCount, lbl: "Approved (MTD)" },
                        { dot: "bg-red-400", n: rejectedCount, lbl: "Rejected (MTD)" },
                    ].map(({ dot, n, lbl }) => (
                        <span key={lbl} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${dot}`} />
                            <strong className="text-slate-800 dark:text-white font-semibold">{String(n).padStart(2, "0")}</strong> {lbl}
                        </span>
                    ))}
                </div>
                <span>Last updated: Just now</span>
            </div>

            {/* ── Toast ──────────────────────────────────────────────────────── */}
            {toast.on && (
                <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span>{toast.msg}</span>
                    <button onClick={() => setToast(t => ({ ...t, on: false }))} className="text-amber-400 text-xs font-semibold hover:underline ml-1">
                        Dismiss
                    </button>
                </div>
            )}
        </div>
    );
}


// ── Leave Request Card ───────────────────────────────────────────────────────
function LeaveCard({ req, selected, onSelect, onApprove, onReject }: {
    req: LeaveRequest;
    selected: boolean;
    onSelect: () => void;
    onApprove: () => void;
    onReject: () => void;
}) {

    return (
        <div
            onClick={onSelect}
            className={`relative bg-white dark:bg-slate-900 rounded-xl border flex flex-col gap-3 p-5 transition-all duration-200 cursor-pointer ${selected
                ? "border-primary dark:border-orange-500 shadow-md ring-2 ring-primary/20"
                : "border-slate-200 dark:border-slate-800 shadow-sm hover:shadow hover:border-slate-300 dark:hover:border-slate-700"
                }`}
        >
            {/* Selected badge */}
            {selected && (
                <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-primary dark:bg-orange-500 rounded-full flex items-center justify-center shadow-md z-10">
                    <PenLine className="w-3 h-3 text-white" />
                </div>
            )}

            {/* Avatar + Info Row */}
            <div className="flex items-center gap-3">
                <UserAvatar user={{ name: req.name, profilePicturePath: req.avatar }} size="md" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">{req.name}</p>
                        <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[req.status]}`}>
                            {req.status.toUpperCase()}
                        </span>
                    </div>
                    <p className={`text-xs font-medium leading-tight mt-0.5 ${LEAVE_TYPE_COLOR[req.leaveType]}`}>
                        {req.leaveType.toUpperCase()}
                    </p>
                </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{req.fromDate} - {req.toDate}</p>
            </div>

            {/* Reason snippet */}
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 italic">
                &ldquo;{req.reason}&rdquo;
            </p>

            {/* Action Buttons */}
            {req.status === "Pending" ? (
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={e => { e.stopPropagation(); onApprove(); }}
                        className="flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-[#7a3000] text-white transition-colors cursor-pointer"
                    >
                        Approve
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onReject(); }}
                        className="flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:border-red-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                    >
                        Reject
                    </button>
                </div>
            ) : (
                <div className={`w-full py-1.5 rounded-lg text-xs font-semibold text-center border ${req.status === "Approved"
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                    }`}>
                    {req.status === "Rejected" ? "Closed" : req.status}
                </div>
            )}
        </div>
    );
}

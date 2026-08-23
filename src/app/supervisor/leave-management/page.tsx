"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import UserAvatar from "@/components/common/UserAvatar";
import {
    Search, Bell, Calendar, Download, PenLine,
    X, CheckCircle, BookOpen,
    ChevronDown,
} from "lucide-react";

type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Closed";
type LeaveType = "Annual Leave" | "Sick Leave" | "Casual Leave";

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
    sickLeaveRemaining: number;
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
    "Sick Leave": "text-blue-600 dark:text-blue-400",
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
    if (lower.includes("sick") || lower.includes("medical")) return "Sick Leave";
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
                    sickLeaveRemaining: d.sickLeaveRemaining ?? 0,
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

    const pendingCount = requests.filter(r => r.status === "Pending").length;
    const approvedCount = requests.filter(r => r.status === "Approved").length;
    const rejectedCount = requests.filter(r => r.status === "Rejected").length;

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-[#f9fafb] dark:bg-slate-950 transition-colors">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <header className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-8 h-[65px] flex items-center justify-between sticky top-0 z-40 transition-colors">
                <div className="flex items-center gap-3">
                    <h1 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">Leave Management</h1>
                    <button className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 dark:text-slate-400 hover:text-[#9e3f00] dark:hover:text-orange-400 transition-colors cursor-pointer">
                        <BookOpen className="w-3.5 h-3.5" />
                        Leave Policy
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="Search employee or leave ID..."
                            className="w-56 pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/15 focus:border-[#9e3f00]/50 transition-colors"
                        />
                    </div>
                    <button className="relative p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-slate-900" />
                    </button>
                    <div className="w-px h-8 bg-gray-200 dark:border-slate-800" />
                    <Link
                        href="/supervisor/profile"
                        className="flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors cursor-pointer"
                    >
                        <div className="text-right">
                            <p className="text-[13px] font-semibold text-gray-800 dark:text-white leading-tight">{isClient && user ? user.name : "Loading..."}</p>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-tight">{isClient && user ? (user.designation || user.role) : "Supervisor"}</p>
                        </div>
                        <UserAvatar user={isClient ? user : null} size="md" />
                    </Link>
                </div>
            </header>

            {/* ── Filter Bar ────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-8 h-[54px] flex items-center gap-3 transition-colors">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Status</span>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none text-[13px] font-medium text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/15 focus:border-[#9e3f00]/50 cursor-pointer"
                        >
                            <option className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">All Requests</option>
                            <option className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Pending</option>
                            <option className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Approved</option>
                            <option className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Type</span>
                    <div className="relative">
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            className="appearance-none text-[13px] font-medium text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/15 focus:border-[#9e3f00]/50 cursor-pointer"
                        >
                            <option className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">All Types</option>
                            <option className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Annual Leave</option>
                            <option className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Sick Leave</option>
                            <option className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Casual Leave</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Date Filter */}
                <span className={`flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 border rounded-lg px-3 py-1.5 hover:border-gray-300 dark:hover:border-slate-600 transition-colors ${
                    dateFilter ? "border-[#9e3f00]/50 ring-2 ring-[#9e3f00]/10" : "border-gray-200 dark:border-slate-700"
                }`}>
                    <Calendar className={`w-4 h-4 flex-shrink-0 ${dateFilter ? "text-[#9e3f00]" : "text-gray-400"}`} />
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="bg-transparent border-none outline-none text-gray-600 dark:text-slate-300 cursor-pointer"
                    />
                    {dateFilter && (
                        <button
                            onClick={() => setDateFilter("")}
                            className="ml-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Clear date filter"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </span>

                <div className="ml-auto flex items-center gap-3">
                    <button onClick={handleExport} className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-[7px] hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0">

                {/* Leave Cards Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                                <span className="material-symbols-outlined animate-spin text-4xl mb-4">progress_activity</span>
                                <p>Loading leave requests...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                                <p>No leave requests found.</p>
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
                    <aside className="w-[380px] flex-shrink-0 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col overflow-y-auto shadow-xl transition-colors">
                        {/* Panel Header */}
                        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <UserAvatar user={{ name: sel.name, profilePicturePath: sel.avatar }} size="lg" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-[15px]">{sel.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{sel.role} · {sel.department}</p>
                                    {sel.isFullTime && (
                                        <span className="inline-block mt-1.5 text-[10px] font-bold text-[#9e3f00] dark:text-orange-400 bg-[#9e3f00]/10 dark:bg-orange-950/40 px-2 py-0.5 rounded-full tracking-wide uppercase">
                                            Full-Time
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSel(null)} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5 px-6 py-5 flex-1">
                            {/* Leave Type & Duration */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Leave Type</p>
                                    <p className={`text-sm font-semibold ${LEAVE_TYPE_COLOR[sel.leaveType]}`}>{sel.leaveType}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Duration</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{getDuration(sel.fromDate, sel.toDate)}</p>
                                </div>
                            </div>

                            {/* Remaining Leave Balance */}
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 transition-colors">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Remaining Leave Balance</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
                                            {String(sel.annualLeaveRemaining).padStart(2, "0")}
                                            <span className="text-xs font-medium text-gray-400 dark:text-slate-500 ml-1">Days</span>
                                        </p>
                                        <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">Annual Leave Remaining</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-[#9e3f00] dark:text-orange-400 leading-none tracking-tight">
                                            {String(sel.sickLeaveRemaining).padStart(2, "0")}
                                            <span className="text-xs font-medium text-gray-400 dark:text-slate-500 ml-1">Days</span>
                                        </p>
                                        <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">Sick Leave Remaining</p>
                                    </div>
                                </div>
                            </div>

                            {/* Date Range */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Date Range</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2.5">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">From</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{sel.fromDate}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2.5">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">To</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{sel.toDate}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Reason from Employee</p>
                                <div className="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3">
                                    <p className="text-sm text-gray-700 dark:text-slate-300 italic leading-relaxed">&ldquo;{sel.reason}&rdquo;</p>
                                </div>
                            </div>

                            {/* Supervisor Remarks */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Supervisor Remarks</p>
                                <textarea
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                    rows={3}
                                    placeholder="Enter remarks for the employee..."
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/15 focus:border-[#9e3f00]/60 placeholder-gray-400 dark:placeholder-slate-500 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 transition-colors"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-auto">
                                {sel.status === "Pending" ? (
                                    <>
                                        <button
                                            onClick={() => handleReject(sel.id)}
                                            className="flex-1 py-2.5 text-sm font-semibold text-red-600 bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-900/40 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                                        >
                                            Reject Request
                                        </button>
                                        <button
                                            onClick={() => handleApprove(sel.id)}
                                            className="flex-1 py-2.5 text-sm font-bold text-white bg-[#9e3f00] rounded-xl hover:bg-[#7a3000] transition-colors cursor-pointer"
                                        >
                                            Approve Request
                                        </button>
                                    </>
                                ) : (
                                    <div className={`flex-1 py-2.5 text-sm font-bold text-center rounded-xl ${sel.status === "Approved" ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30" :
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
            <div className="flex-shrink-0 h-10 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-8 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-6 text-xs">
                    {[
                        { dot: "bg-amber-400", n: pendingCount, lbl: "Pending Requests" },
                        { dot: "bg-green-500", n: approvedCount, lbl: "Approved (MTD)" },
                        { dot: "bg-red-400", n: rejectedCount, lbl: "Rejected (MTD)" },
                    ].map(({ dot, n, lbl }) => (
                        <span key={lbl} className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                            <span className={`w-2 h-2 rounded-full ${dot}`} />
                            <strong className="text-gray-800 dark:text-white">{String(n).padStart(2, "0")}</strong> {lbl}
                        </span>
                    ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-slate-400">Last updated: Just now</span>
            </div>

            {/* ── Toast ──────────────────────────────────────────────────────── */}
            {toast.on && (
                <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white text-[13px] font-medium px-5 py-3 rounded-full shadow-2xl">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span>{toast.msg}</span>
                    <button onClick={() => setToast(t => ({ ...t, on: false }))} className="text-amber-400 text-xs font-bold hover:underline ml-1">
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
            className={`relative bg-white dark:bg-slate-900 rounded-2xl border-2 flex flex-col gap-3 p-5 transition-all duration-200 cursor-pointer ${selected
                ? "border-[#9e3f00] dark:border-orange-500 shadow-[0_0_0_4px_rgba(158,63,0,0.07)]"
                : "border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700"
                }`}
        >
            {/* Selected badge */}
            {selected && (
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#9e3f00] dark:bg-orange-500 rounded-full flex items-center justify-center shadow-md z-10">
                    <PenLine className="w-3 h-3 text-white" />
                </div>
            )}

            {/* Avatar + Info Row */}
            <div className="flex items-center gap-3">
                <UserAvatar user={{ name: req.name, profilePicturePath: req.avatar }} size="md" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight truncate">{req.name}</p>
                        <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[req.status]}`}>
                            {req.status.toUpperCase()}
                        </span>
                    </div>
                    <p className={`text-[11px] font-semibold leading-tight mt-0.5 ${LEAVE_TYPE_COLOR[req.leaveType]}`}>
                        {req.leaveType.toUpperCase()}
                    </p>
                </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <p className="text-xs font-medium text-gray-600 dark:text-slate-300">{req.fromDate} - {req.toDate}</p>
            </div>

            {/* Reason snippet */}
            <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 italic">
                &ldquo;{req.reason}&rdquo;
            </p>

            {/* Action Buttons */}
            {req.status === "Pending" ? (
                <div className="flex gap-2">
                    <button
                        onClick={e => { e.stopPropagation(); onApprove(); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selected
                            ? "bg-[#9e3f00] border-[#9e3f00] text-white hover:bg-[#7a3000]"
                            : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-green-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                            }`}
                    >
                        Approve
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onReject(); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-lg text-xs font-semibold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:border-red-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                    >
                        Reject
                    </button>
                </div>
            ) : (
                <div className={`w-full py-[7px] rounded-lg text-xs font-semibold text-center border transition-all ${req.status === "Approved"
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400"
                    : req.status === "Rejected"
                        ? "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400"
                        : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400"
                    }`}>
                    {req.status === "Rejected" ? "Closed" : req.status}
                </div>
            )}
        </div>
    );
}

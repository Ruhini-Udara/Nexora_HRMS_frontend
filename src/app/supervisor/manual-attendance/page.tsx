"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Search, Calendar,
    X, CheckCircle, Loader2, Clock,
    ClipboardList, AlertCircle, XCircle
} from "lucide-react";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import SupervisorSummaryCard from "@/components/supervisor/SupervisorSummaryCard";

type Status = "Present" | "Absent" | "Late" | "Half_Day" | null;

interface EmployeeAttendance {
    id?: number;
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    role: string;
    department: string;
    status: Status | string;
    inTime: string;
    outTime: string;
    remarks: string;
    inDate?: string;
    outDate?: string;
    approvalStatus?: string;
}

export default function ManualAttendanceApprovalsPage() {
    const { user } = useAuthStore();
    const [isClient, setIsClient] = useState(false);
    const [emps, setEmps] = useState<EmployeeAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [q, setQ] = useState("");
    const [department, setDepartment] = useState("All Departments");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [statusFilter, setStatusFilter] = useState("All");
    
    const [sel, setSel] = useState<EmployeeAttendance | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [toast, setToast] = useState({ msg: "", on: false, type: "success" as "success" | "error" });

    useEffect(() => { setIsClient(true); }, [])

    const departments = useMemo(() => {
        const unique = Array.from(new Set(emps.map(e => e.department)));
        return ["All Departments", ...unique.filter(d => d && d.trim() !== "")];
    }, [emps]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/attendance/manual`, {
                params: {
                    date,
                    department: department === "All Departments" ? "" : department,
                    supervisorId: user?.id
                }
            });
            
             
            let mapped: EmployeeAttendance[] = res.data.map((item: any) => ({
                id: item.id,
                employeeId: item.employeeId,
                employeeCode: item.employeeCode,
                employeeName: item.employeeName,
                role: item.designation,
                department: item.department,
                status: item.status || "",
                inTime: item.inTime ? item.inTime.slice(0, 5) : "",
                outTime: item.outTime ? item.outTime.slice(0, 5) : "",
                inDate: item.inDate || item.attendanceDate,
                outDate: item.outDate || item.attendanceDate,
                remarks: item.remarks || "",
                approvalStatus: item.approvalStatus
            }));
            
            // Filter to ONLY show employees who have actually applied for manual attendance
            mapped = mapped.filter(item => item.approvalStatus != null);
            
            // Set the mapped data directly from the DB response
            setEmps(mapped);
            
            setSelectedIds([]); // Clear selection on fetch
        } catch (err) {
            console.error("Failed to fetch attendance data", err);
            setEmps([]); 
            pop("Failed to fetch attendance data", "error");
        } finally {
            setLoading(false);
        }
    }, [date, department, user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const list = emps.filter(e => {
        const matchSearch = (e.employeeName || "").toLowerCase().includes(q.toLowerCase()) || (e.employeeCode || "").toLowerCase().includes(q.toLowerCase());
        
        let matchStatus = true;
        if (statusFilter === "Pending Approval") {
            matchStatus = e.approvalStatus === "PENDING" || e.status === "Pending Approval";
        } else if (statusFilter === "Approved") {
            matchStatus = e.approvalStatus === "APPROVED" || e.status === "Present";
        } else if (statusFilter === "Cancelled") {
            matchStatus = e.approvalStatus === "CANCELLED" || e.approvalStatus === "REJECTED" || e.status === "Absent";
        }
        
        return matchSearch && matchStatus;
    });

    const pendingList = list.filter(e => e.approvalStatus === "PENDING" || (!e.approvalStatus && e.status === "Pending Approval"));

    const totalCount = emps.length;
    const pendingTotalCount = emps.filter(e => e.approvalStatus === "PENDING" || (!e.approvalStatus && e.status === "Pending Approval")).length;
    const approvedTotalCount = emps.filter(e => e.approvalStatus === "APPROVED" || e.status === "Present").length;
    const rejectedTotalCount = emps.filter(e => e.approvalStatus === "CANCELLED" || e.approvalStatus === "REJECTED" || e.status === "Absent").length;

    const toggleSelectAll = () => {
        if (selectedIds.length > 0 && selectedIds.length === pendingList.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingList.map(e => e.id as number).filter(id => id !== undefined));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const approveSelected = async () => {
        if (selectedIds.length === 0) {
            pop("No requests selected", "error");
            return;
        }
        
        setSubmitting(true);
        try {
            await api.post(`/api/attendance/manual/supervisor/approve-multiple`, selectedIds);
            setEmps(p => p.map(e => {
                if (e.id && selectedIds.includes(e.id)) {
                    return { ...e, approvalStatus: "APPROVED", status: "Present" };
                }
                return e;
            }));
            
            setSelectedIds([]);
            pop(`${selectedIds.length} request(s) approved successfully!`);
        } catch (err: any) {
            pop("Failed to approve requests", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleApproveSingle = async (emp: EmployeeAttendance) => {
        setSubmitting(true);
        try {
            if (emp.id) {
                await api.post(`/api/attendance/manual/supervisor/approve-multiple`, [emp.id]);
            }
            setEmps(p => p.map(e => e.id === emp.id ? { ...e, approvalStatus: "APPROVED", status: "Present" } : e));
            pop(`${emp.employeeName}'s request approved.`);
            setSel(null);
        } catch (err) {
            pop("Failed to approve request", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectSingle = async (emp: EmployeeAttendance) => {
        setSubmitting(true);
        try {
            if (emp.id) {
                await api.post(`/api/attendance/manual/employee/cancel/${emp.id}`);
            }
            setEmps(p => p.map(e => e.id === emp.id ? { ...e, approvalStatus: "REJECTED", status: "Cancelled" } : e));
            pop(`${emp.employeeName}'s request rejected.`);
            setSel(null);
        } catch (err) {
            pop("Failed to reject request", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const pop = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, on: true, type });
        setTimeout(() => setToast(t => ({ ...t, on: false })), 3500);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
            {/* ── Page Title ──────────────────────────────────────────────── */}
            <div className="mb-6 flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Attendance Approvals</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                    Review and approve manual attendance entries for your team.
                </p>
            </div>

            {/* ── Summary Stats ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <SupervisorSummaryCard
                    title="Total Requests"
                    value={String(totalCount)}
                    subtext="All manual submissions"
                    icon={ClipboardList}
                    variant="primary"
                />
                <SupervisorSummaryCard
                    title="Pending Approval"
                    value={String(pendingTotalCount)}
                    subtext={
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {pendingTotalCount > 0 ? "Requires action" : "Up to date"}
                        </span>
                    }
                    icon={Clock}
                    variant="amber"
                />
                <SupervisorSummaryCard
                    title="Approved"
                    value={String(approvedTotalCount)}
                    subtext={
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Processed entries
                        </span>
                    }
                    icon={CheckCircle}
                    variant="emerald"
                />
                <SupervisorSummaryCard
                    title="Rejected / Cancelled"
                    value={String(rejectedTotalCount)}
                    subtext={
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Disallowed submissions
                        </span>
                    }
                    icon={XCircle}
                    variant="rose"
                />
            </div>

            {/* ── Filters Bar ──────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap items-center gap-4 transition-colors">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Search employee..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Date:</span>
                    <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                        <Calendar className="w-4 h-4 text-primary dark:text-orange-400 mr-2 flex-shrink-0" />
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-transparent border-none outline-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Department Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Department:</span>
                    <select
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
                    >
                        {departments.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status:</span>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
                    >
                        <option value="All">All</option>
                        <option value="Pending Approval">Pending Approval</option>
                        <option value="Approved">Approved</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Multiple Approval Action Button */}
                {list.length > 0 && selectedIds.length > 0 && (
                    <div className="ml-auto">
                        <button 
                            onClick={approveSelected}
                            disabled={submitting}
                            className="flex items-center gap-2 bg-primary hover:bg-[#7a3000] disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Approve Selected ({selectedIds.length})
                        </button>
                    </div>
                )}
            </div>

            {/* ── Table Area ───────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4 w-12 text-center">
                                    <div className="flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            checked={pendingList.length > 0 && selectedIds.length === pendingList.length}
                                            onChange={toggleSelectAll}
                                            disabled={pendingList.length === 0}
                                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer disabled:opacity-50"
                                        />
                                    </div>
                                </th>
                                <th className="py-3.5 px-4">Employee</th>
                                <th className="py-3.5 px-4">Department</th>
                                <th className="py-3.5 px-4">Date</th>
                                <th className="py-3.5 px-4">In Time</th>
                                <th className="py-3.5 px-4">Out Time</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                            <span className="font-medium text-sm">Loading requests...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : list.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <CheckCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                                            <span className="text-slate-700 dark:text-slate-300 font-semibold text-base">You&apos;re all caught up!</span>
                                            <span className="text-slate-400 text-sm">No pending attendance requests right now.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                list.map((emp) => (
                                    <tr key={emp.id} className={`transition-colors group cursor-pointer ${selectedIds.includes(emp.id as number) ? 'bg-orange-50/60 dark:bg-orange-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'}`}>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={emp.id ? selectedIds.includes(emp.id) : false}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        if (emp.id) {
                                                            toggleSelect(emp.id);
                                                        }
                                                    }}
                                                    disabled={emp.approvalStatus !== 'PENDING' && emp.status !== 'Pending Approval'}
                                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer disabled:opacity-50"
                                                />
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {emp.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{emp.employeeName}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{emp.employeeCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">{emp.department}</td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">{formatDate(emp.inDate || "")}</td>
                                        <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">{emp.inTime || "—"}</td>
                                        <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">{emp.outTime || "—"}</td>
                                        <td className="py-4 px-4">
                                            {(() => {
                                                const status = emp.approvalStatus?.toUpperCase() || 'PENDING';
                                                if (status === 'APPROVED') {
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Approved
                                                        </span>
                                                    );
                                                }
                                                if (status === 'CANCELLED' || status === 'REJECTED') {
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                            {status === 'CANCELLED' ? 'Cancelled' : 'Rejected'}
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                        Pending
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSel(emp);
                                                }}
                                                className="text-xs font-semibold text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Centered Modal Popup ─────────────────────────────────────── */}
            {sel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-primary dark:text-orange-400" />
                                </div>
                                <h2 className="font-bold text-gray-900 dark:text-white text-lg">View Attendance Request</h2>
                            </div>
                            <button onClick={() => setSel(null)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto max-h-[70vh]">
                            {/* Employee Info */}
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5">
                                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {sel.employeeName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{sel.employeeName}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{sel.employeeCode} &bull; {sel.role}</p>
                                </div>
                            </div>

                            {/* Date & Time display */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">In Date</p>
                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {formatDate(sel.inDate || "")}
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Out Date</p>
                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {formatDate(sel.outDate || "")}
                                    </div>
                                </div>
                                <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl p-3">
                                    <p className="text-xs font-semibold text-primary dark:text-orange-400 uppercase tracking-wider mb-1">In Time</p>
                                    <div className="text-base font-bold text-primary dark:text-orange-400">
                                        {sel.inTime || "—"}
                                    </div>
                                </div>
                                <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl p-3">
                                    <p className="text-xs font-semibold text-primary dark:text-orange-400 uppercase tracking-wider mb-1">Out Time</p>
                                    <div className="text-base font-bold text-primary dark:text-orange-400">
                                        {sel.outTime || "—"}
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status</p>
                                <div className="w-full p-3 mb-3 text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300">
                                    {sel.status === "Pending Approval" || sel.approvalStatus === "PENDING" ? "Pending Approval" : sel.status || sel.approvalStatus}
                                </div>

                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Reason / Remarks</p>
                                <div className="w-full p-3 text-sm font-normal bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {sel.remarks ? `"${sel.remarks}"` : <span className="text-slate-400 italic">No remarks provided</span>}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            {(sel.approvalStatus === "PENDING" || (!sel.approvalStatus && sel.status === "Pending Approval")) ? (
                                <div className="flex gap-3 w-full">
                                    <button 
                                        onClick={() => handleRejectSingle(sel)}
                                        disabled={submitting}
                                        className="flex-1 py-2.5 text-sm font-semibold text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-200 rounded-lg transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleApproveSingle(sel)}
                                        disabled={submitting}
                                        className="flex-[2] py-2.5 text-sm font-semibold text-white bg-primary hover:bg-[#7a3000] rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Approve Request
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full text-center py-1">
                                    <p className="text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-slate-400" />
                                        This request has been {sel.approvalStatus ? sel.approvalStatus.toLowerCase() : 'processed'}.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast.on && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 ${toast.type === "error" ? "bg-red-600" : "bg-slate-900"} text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl transition-all animate-in slide-in-from-bottom-4 duration-300`}>
                    <div className={`w-5 h-5 rounded-full ${toast.type === "error" ? "bg-white/20" : "bg-green-500"} flex items-center justify-center flex-shrink-0`}>
                        {toast.type === "error" ? <X className="w-3.5 h-3.5 text-white" /> : <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span>{toast.msg}</span>
                </div>
            )}
        </div>
    );
}

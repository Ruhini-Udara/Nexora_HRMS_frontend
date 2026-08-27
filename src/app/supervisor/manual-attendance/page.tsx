"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Search, Bell, Calendar,
    X, CheckCircle, Loader2, CheckSquare, Clock
} from "lucide-react";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import UserAvatar from "@/components/common/UserAvatar";
import Link from "next/link";
import { NotificationBell } from "@/components/NotificationBell";

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
        <div className="flex flex-col flex-1 min-h-0 bg-[#f4f7f9] dark:bg-slate-950 transition-colors">
            {/* ── Premium Header ───────────────────────────────────────────── */}
            <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 border-b border-gray-200/80 dark:border-slate-800 px-8 h-[72px] flex items-center justify-between sticky top-0 z-30 transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9e3f00] to-[#e65c00] flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <CheckSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-[22px] font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">Attendance Approvals</h1>
                        <p className="text-[12px] text-gray-500 font-medium mt-1">Review and approve manual attendance entries</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#9e3f00] transition-colors" />
                        <input
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="Search employee..."
                            className="w-64 pl-10 pr-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-slate-700 rounded-full bg-gray-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-[#9e3f00]/10 focus:border-[#9e3f00]/50 transition-all shadow-inner"
                        />
                    </div>
                    <div className="hidden sm:block">
                        <NotificationBell />
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-slate-800" />
                    <Link
                        href="/supervisor/profile"
                        className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800/50 p-1.5 pr-3 rounded-full transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                    >
                        <UserAvatar user={isClient ? user : null} size="md" />
                        <div className="text-left hidden sm:block">
                            <p className="text-[13px] font-bold text-gray-800 dark:text-white leading-tight">
                                {isClient && user ? user.name : "Supervisor"}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-tight font-medium">
                                {isClient && user ? (user.designation || user.role) : "HR Department"}
                            </p>
                        </div>
                    </Link>
                </div>
            </header>

            {/* ── Filters Bar ──────────────────────────────────────────────── */}
            <div className="flex-shrink-0 bg-white/60 backdrop-blur-md dark:bg-slate-900/60 border-b border-gray-200/50 dark:border-slate-800 px-8 py-4 flex items-center gap-6 overflow-x-auto transition-colors">
                {/* Date Filter */}
                <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Date</span>
                    <div className="relative flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3.5 py-2 shadow-sm hover:border-[#9e3f00]/40 transition-all focus-within:ring-2 focus-within:ring-[#9e3f00]/20 focus-within:border-[#9e3f00]/50">
                        <Calendar className="w-4 h-4 text-[#9e3f00] dark:text-orange-400 flex-shrink-0" />
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="text-[13px] font-bold text-gray-700 dark:text-slate-200 bg-transparent border-none outline-none cursor-pointer dark:[color-scheme:dark]"
                        />
                    </div>
                </div>

                {/* Department Filter */}
                <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Department</span>
                    <select
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="appearance-none text-[13px] font-bold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/20 focus:border-[#9e3f00]/50 cursor-pointer hover:border-[#9e3f00]/40 transition-all"
                    >
                        {departments.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="appearance-none text-[13px] font-bold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/20 focus:border-[#9e3f00]/50 cursor-pointer hover:border-[#9e3f00]/40 transition-all"
                    >
                        <option value="All">All</option>
                        <option value="Pending Approval">Pending Approval</option>
                        <option value="Approved">Approved</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    {/* Multiple Approval Action Button */}
                    {list.length > 0 && selectedIds.length > 0 && (
                        <button 
                            onClick={approveSelected}
                            disabled={submitting}
                            className="flex items-center gap-2 bg-[#9e3f00] hover:bg-[#7a3000] disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-bold text-[13px] transition-all shadow-sm"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Approve Selected ({selectedIds.length})
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table Area ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-gray-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <th className="p-5 w-16 text-center">
                                        <div className="flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={pendingList.length > 0 && selectedIds.length === pendingList.length}
                                                onChange={toggleSelectAll}
                                                disabled={pendingList.length === 0}
                                                className="w-4 h-4 text-[#9e3f00] rounded-sm border-gray-300 focus:ring-[#9e3f00] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </th>
                                    <th className="p-5 text-[12px] font-extrabold text-slate-500 uppercase tracking-widest">Employee</th>
                                    <th className="p-5 text-[12px] font-extrabold text-slate-500 uppercase tracking-widest">Department</th>
                                    <th className="p-5 text-[12px] font-extrabold text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="p-5 text-[12px] font-extrabold text-slate-500 uppercase tracking-widest">In</th>
                                    <th className="p-5 text-[12px] font-extrabold text-slate-500 uppercase tracking-widest">Out</th>
                                    <th className="p-5 text-[12px] font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="p-5 text-[12px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-[#9e3f00]" />
                                                <span className="font-semibold text-sm">Loading requests...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : list.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                                                    <CheckCircle className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <span className="text-slate-500 font-bold text-lg">You&apos;re all caught up!</span>
                                                <span className="text-slate-400 text-sm">No pending attendance requests right now.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    list.map((emp) => (
                                        <tr key={emp.id} className={`transition-all duration-200 group cursor-pointer ${selectedIds.includes(emp.id as number) ? 'bg-[#9e3f00]/5 dark:bg-orange-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                                            <td className="p-5 text-center">
                                                <div className="flex items-center justify-center h-full">
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
                                                        className="w-4 h-4 text-[#9e3f00] rounded-sm border-gray-300 focus:ring-[#9e3f00] cursor-pointer transition-transform duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 border border-white dark:border-slate-600 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm">
                                                        {emp.employeeName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">{emp.employeeName}</p>
                                                        <p className="text-[12px] font-medium text-slate-500 mt-0.5">{emp.employeeCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-[14px] font-semibold text-slate-600 dark:text-slate-300">{emp.department}</td>
                                            <td className="p-5 text-[14px] font-semibold text-slate-600 dark:text-slate-300">{formatDate(emp.inDate || "")}</td>
                                            <td className="p-5 text-[14px] font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-transparent">{emp.inTime || "—"}</td>
                                            <td className="p-5 text-[14px] font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-transparent">{emp.outTime || "—"}</td>
                                            <td className="p-5">
                                                {(() => {
                                                    const status = emp.approvalStatus?.toUpperCase() || 'PENDING';
                                                    if (status === 'APPROVED') {
                                                        return (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                Approved
                                                            </span>
                                                        );
                                                    }
                                                    if (status === 'CANCELLED' || status === 'REJECTED') {
                                                        return (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                                {status === 'CANCELLED' ? 'Cancelled' : 'Rejected'}
                                                            </span>
                                                        );
                                                    }
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                            Pending
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="p-5 text-right">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSel(emp);
                                                    }}
                                                    className="text-[13px] font-bold text-[#9e3f00] hover:text-white bg-[#9e3f00]/10 hover:bg-[#9e3f00] px-4 py-2 rounded-lg transition-all shadow-sm"
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
            </div>
            {/* ── Centered Modal Popup ─────────────────────────────────────── */}
            {sel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-[#9e3f00] dark:text-orange-400" />
                                </div>
                                <h2 className="font-extrabold text-gray-900 dark:text-white text-lg">View Request</h2>
                            </div>
                            <button onClick={() => setSel(null)} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 px-6 py-6 overflow-y-auto max-h-[70vh]">
                            {/* Employee Info */}
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-white dark:border-slate-600 shadow-sm flex items-center justify-center text-slate-700 dark:text-white font-bold text-xl flex-shrink-0">
                                    {sel.employeeName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-extrabold text-gray-900 dark:text-white text-[16px]">{sel.employeeName}</p>
                                    <p className="text-[13px] font-medium text-gray-500 dark:text-slate-400 mt-1">{sel.employeeCode} &bull; {sel.role}</p>
                                </div>
                            </div>

                            {/* Date & Time display */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-3">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">In Date</p>
                                    <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                                        {formatDate(sel.inDate || "")}
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-3">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Out Date</p>
                                    <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                                        {formatDate(sel.outDate || "")}
                                    </div>
                                </div>
                                <div className="bg-[#9e3f00]/5 dark:bg-orange-900/10 border border-[#9e3f00]/10 dark:border-orange-900/30 rounded-xl p-3">
                                    <p className="text-[11px] font-bold text-[#9e3f00]/70 dark:text-orange-400/70 uppercase tracking-widest mb-1.5">In Time</p>
                                    <div className="text-[16px] font-black text-[#9e3f00] dark:text-orange-400">
                                        {sel.inTime || "—"}
                                    </div>
                                </div>
                                <div className="bg-[#9e3f00]/5 dark:bg-orange-900/10 border border-[#9e3f00]/10 dark:border-orange-900/30 rounded-xl p-3">
                                    <p className="text-[11px] font-bold text-[#9e3f00]/70 dark:text-orange-400/70 uppercase tracking-widest mb-1.5">Out Time</p>
                                    <div className="text-[16px] font-black text-[#9e3f00] dark:text-orange-400">
                                        {sel.outTime || "—"}
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</p>
                                <div className="w-full p-4 mb-4 text-[13px] font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {sel.status === "Pending Approval" || sel.approvalStatus === "PENDING" ? "Pending Approval" : sel.status || sel.approvalStatus}
                                </div>

                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reason / Remarks</p>
                                <div className="w-full p-4 text-[13px] font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {sel.remarks ? `"${sel.remarks}"` : <span className="text-slate-400 italic">No remarks provided</span>}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                            {(sel.approvalStatus === "PENDING" || (!sel.approvalStatus && sel.status === "Pending Approval")) ? (
                                <div className="flex gap-3 w-full">
                                    <button 
                                        onClick={() => handleRejectSingle(sel)}
                                        disabled={submitting}
                                        className="flex-1 py-3 text-[14px] font-bold text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/50 rounded-xl transition-all shadow-sm"
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleApproveSingle(sel)}
                                        disabled={submitting}
                                        className="flex-[2] py-3 text-[14px] font-bold text-white bg-gradient-to-r from-[#9e3f00] to-[#c75000] hover:from-[#7a3000] hover:to-[#9e3f00] rounded-xl shadow-lg shadow-orange-900/20 transition-all hover:shadow-orange-900/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Approve Request
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full text-center py-2">
                                    <p className="text-[13px] font-semibold text-slate-500 flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-slate-400" />
                                        This request has been {sel.approvalStatus ? sel.approvalStatus.toLowerCase() : 'processed'} and cannot be modified.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast.on && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 ${toast.type === "error" ? "bg-red-600" : "bg-slate-900"} text-white text-[14px] font-bold px-6 py-3.5 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-bottom-4 duration-300`}>
                    <div className={`w-6 h-6 rounded-full ${toast.type === "error" ? "bg-white/20" : "bg-green-500"} flex items-center justify-center flex-shrink-0`}>
                        {toast.type === "error" ? <X className="w-4 h-4 text-white" /> : <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <span>{toast.msg}</span>
                </div>
            )}
        </div>
    );
}

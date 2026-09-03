'use client';

import { useEffect, useState } from "react";
import {
    Users,
    Calendar,
    AlignJustify,
    AlertCircle,
    TrendingUp,
    CheckCircle,
    XCircle,
    Loader2,
    ClipboardList,
    Waves,
    Clock,
    CalendarCheck,
    UserCheck,
    CalendarPlus
} from "lucide-react";
import SupervisorSummaryCard from "@/components/supervisor/SupervisorSummaryCard";
import ModuleCard from "@/components/dashboard/ModuleCard";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";

interface Employee {
    id: number;
    fullName: string;
    department: string;
    designation?: { designationName: string };
}

interface LeaveRequest {
    id: number;
    employeeId: number;
    employeeName?: string;
    employeeCode?: string;
    leaveTypeName?: string;
    fromDate: string;
    endDate: string;
    totalDays: number;
    status: string;
    reason?: string;
}

const statusStyles: Record<string, string> = {
    PENDING: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400",
    APPROVED: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400",
    REJECTED: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
    Pending: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400",
    Approved: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400",
    Rejected: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
};

function getInitials(name: string) {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??";
}

function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SupervisorDashboard() {
    const { user } = useAuthStore();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [dailyAttendance, setDailyAttendance] = useState<any[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const today = new Date().toISOString().slice(0, 10);
                const [empRes, leaveRes, attRes, shiftRes] = await Promise.allSettled([
                    api.get(`/api/employees?supervisorId=${user?.employeeId || user?.id}`),
                    api.get("/api/v1/leaves/normal"),
                    api.get(`/api/attendance/manual?date=${today}&supervisorId=${user?.employeeId || user?.id}`),
                    api.get("/api/shifts"),
                ]);

                let teamEmps: Employee[] = [];
                if (empRes.status === "fulfilled") {
                    teamEmps = empRes.value.data;
                    // Fallback for demo
                    if (teamEmps.length === 0) {
                        const allEmpRes = await api.get("/api/employees");
                        teamEmps = allEmpRes.data;
                    }
                    setEmployees(teamEmps);
                }
                
                if (leaveRes.status === "fulfilled") {
                    const teamIds = teamEmps.map(e => Number(e.id));
                    // Filter leaves for only this supervisor's team
                    const teamLeaves = leaveRes.value.data.filter((l: LeaveRequest) => teamIds.includes(Number(l.employeeId)));
                    setLeaves(teamLeaves);
                }
                
                if (attRes.status === "fulfilled") setDailyAttendance(attRes.value.data);
                if (shiftRes.status === "fulfilled") setShifts(shiftRes.value.data);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);

    const handleApprove = async (id: number) => {
        try {
            await api.post("/api/v1/approvals", {
                refId: id,
                refType: "NORMAL_LEAVE",
                decision: "APPROVED",
                remark: "Approved by supervisor from dashboard",
                approvedBy: { id: user?.id }
            });
            setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "Approved" } : l));
        } catch (err) {
            console.error("Failed to approve request", err);
            alert("Failed to approve request.");
        }
    };

    const handleReject = async (id: number) => {
        try {
            await api.post("/api/v1/approvals", {
                refId: id,
                refType: "NORMAL_LEAVE",
                decision: "REJECTED",
                remark: "Rejected by supervisor from dashboard",
                approvedBy: { id: user?.id }
            });
            setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "Rejected" } : l));
        } catch (err) {
            console.error("Failed to reject request", err);
            alert("Failed to reject request.");
        }
    };

    const pendingLeaves = leaves.filter(l =>
        l.status?.toUpperCase() === "PENDING" || l.status === "PENDING_HR_APPROVAL" || l.status === "PENDING_SUPERVISOR_APPROVAL"
    );

    const pendingAttendanceCount = dailyAttendance.filter(a => 
        a.approvalStatus === "PENDING" || (!a.approvalStatus && a.status === "Pending Approval")
    ).length;

    const recentLeaves = leaves.slice(0, 5);
    const presentCount = dailyAttendance.filter(a => a.status === "PRESENT").length;
    const totalEmployees = employees.length || 1; // avoid division by zero
    const presencePercentage = Math.round((presentCount / totalEmployees) * 100);

    const activeShiftsCount = shifts.length;
    const shiftNames = activeShiftsCount > 0 
        ? shifts.slice(0, 2).map(s => s.shiftName).join(" & ") + (activeShiftsCount > 2 ? "..." : " shifts")
        : "No active shifts";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Supervisor Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    Manage your team&apos;s attendance and leave requests efficiently.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <SupervisorSummaryCard
                    title="Team Presence"
                    value={`${presentCount}/${employees.length}`}
                    subtext={
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {presencePercentage}% present today
                        </span>
                    }
                    icon={Users}
                    variant="emerald"
                />
                <SupervisorSummaryCard
                    title="Pending Leaves"
                    value={String(pendingLeaves.length)}
                    subtext={
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {pendingLeaves.length > 0 ? "Requires your review" : "All caught up"}
                        </span>
                    }
                    icon={ClipboardList}
                    variant="amber"
                />
                <SupervisorSummaryCard
                    title="Pending Attendance"
                    value={String(pendingAttendanceCount)}
                    subtext={
                        <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <CalendarCheck className="w-3.5 h-3.5" />
                            {pendingAttendanceCount > 0 ? "Manual requests pending" : "No pending entries"}
                        </span>
                    }
                    icon={CalendarCheck}
                    variant="purple"
                />
                <SupervisorSummaryCard
                    title="Active Shifts"
                    value={String(activeShiftsCount)}
                    subtext={
                        <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 truncate max-w-full">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{shiftNames}</span>
                        </span>
                    }
                    icon={Waves}
                    variant="blue"
                />
            </div>

            {/* Management Modules */}
            <section className="mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Management Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ModuleCard
                        title="Manual Attendance"
                        description="Log or adjust daily attendance and clock-in/out times for your team."
                        icon={<CalendarPlus className="w-5 h-5" />}
                        href="/supervisor/manual-attendance"
                    />
                    <ModuleCard
                        title="Leave Management"
                        description="Review, approve, or reject leave requests from your direct reports."
                        icon={<CalendarCheck className="w-5 h-5" />}
                        href="/supervisor/leave-management"
                    />
                    <ModuleCard
                        title="Team Attendance"
                        description="Monitor team-wide attendance patterns and generate daily reports."
                        icon={<UserCheck className="w-5 h-5" />}
                        href="/supervisor/team-attendance"
                    />
                </div>
            </section>

            {/* Recent Leave Requests */}
            <section>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 transition-colors">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Team Leave Requests</h2>
                        <a
                            href="/supervisor/leave-management"
                            className="bg-primary hover:bg-[#7a3000] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                            View All Requests
                        </a>
                    </div>

                    {recentLeaves.length === 0 ? (
                        <p className="text-center text-gray-400 dark:text-slate-500 py-8 text-sm">No leave requests found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                        <th className="py-3.5 px-4 rounded-l-lg">Employee</th>
                                        <th className="py-3.5 px-4">Leave Type</th>
                                        <th className="py-3.5 px-4">From</th>
                                        <th className="py-3.5 px-4">Days</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 rounded-r-lg text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                                    {recentLeaves.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                            {/* Employee */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        {getInitials(req.employeeName || `EMP-${req.employeeId || req.id}`)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {req.employeeName || `Employee #${req.employeeId || "???"}`}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">ID: {req.employeeCode || req.employeeId || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Leave Type */}
                                            <td className="py-4 px-4 text-slate-600 dark:text-slate-400 capitalize">{req.leaveTypeName || "Leave"}</td>
                                            {/* From */}
                                            <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{formatDate(req.fromDate)}</td>
                                            {/* Days */}
                                            <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{req.totalDays} day{req.totalDays !== 1 ? 's' : ''}</td>
                                            {/* Status */}
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[req.status] || "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            {/* Action */}
                                            <td className="py-4 px-4 text-center">
                                                {req.status?.toUpperCase().includes("PENDING") ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            title="Approve" 
                                                            onClick={() => handleApprove(req.id)}
                                                            className="text-green-600 hover:text-green-700 transition-colors cursor-pointer"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            title="Reject" 
                                                            onClick={() => handleReject(req.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">Reviewed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

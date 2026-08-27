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
import SupervisorHeader from "@/components/SupervisorHeader";
import SummaryCard from "@/components/dashboard/SummaryCard";
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
        <>
            <SupervisorHeader />
            <div className="p-8 max-w-7xl mx-auto">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supervisor Dashboard</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">
                        Manage your team&apos;s attendance and leave requests efficiently.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <SummaryCard
                        title="Team Presence"
                        value={`${presentCount}/${employees.length}`}
                        subContent={
                            <div className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>{presencePercentage}% present today</span>
                            </div>
                        }
                        icon={<Users className="w-6 h-6" />}
                        iconBgColor="bg-orange-50 dark:bg-orange-950/40"
                        iconColor="text-orange-600 dark:text-orange-400"
                    />
                    <SummaryCard
                        title="Pending Leave Requests"
                        value={String(pendingLeaves.length)}
                        subContent={
                            <div className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Requires your action</span>
                            </div>
                        }
                        icon={<ClipboardList className="w-6 h-6" />}
                        iconBgColor="bg-yellow-50 dark:bg-yellow-950/40"
                        iconColor="text-yellow-600 dark:text-yellow-400"
                    />
                    <SummaryCard
                        title="Active Shifts"
                        value={String(activeShiftsCount)}
                        subContent={
                            <div className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span className="truncate max-w-[140px]">{shiftNames}</span>
                            </div>
                        }
                        icon={<Waves className="w-6 h-6" />}
                        iconBgColor="bg-blue-50 dark:bg-blue-950/40"
                        iconColor="text-blue-600 dark:text-blue-400"
                    />
                </div>

                {/* Management Modules */}
                <section className="mb-10">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Management Modules</h2>
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
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-custom shadow-sm p-6 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Team Leave Requests</h2>
                            <a
                                href="/supervisor/leave-management"
                                className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-custom hover:opacity-90 transition-opacity"
                            >
                                View All Requests
                            </a>
                        </div>

                        {recentLeaves.length === 0 ? (
                            <p className="text-center text-gray-400 dark:text-slate-500 py-8">No leave requests found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">
                                            <th className="py-3 px-4 rounded-l-lg">Employee</th>
                                            <th className="py-3 px-4">Leave Type</th>
                                            <th className="py-3 px-4">From</th>
                                            <th className="py-3 px-4">Days</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 rounded-r-lg text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-700 dark:text-slate-300">
                                        {recentLeaves.map((req) => (
                                            <tr key={req.id} className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                                {/* Employee */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                            {getInitials(req.employeeName || `EMP-${req.employeeId || req.id}`)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 dark:text-slate-200">
                                                                {req.employeeName || `Employee #${req.employeeId || "???"}`}
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-slate-500">ID: {req.employeeCode || req.employeeId || "—"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Leave Type */}
                                                <td className="py-4 px-4 text-gray-600 dark:text-slate-400 capitalize">{req.leaveTypeName || "Leave"}</td>
                                                {/* From */}
                                                <td className="py-4 px-4 text-gray-600 dark:text-slate-400">{formatDate(req.fromDate)}</td>
                                                {/* Days */}
                                                <td className="py-4 px-4 text-gray-600 dark:text-slate-400">{req.totalDays} day{req.totalDays !== 1 ? 's' : ''}</td>
                                                {/* Status */}
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[req.status] || "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"}`}>
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
                                                                className="text-green-500 hover:text-green-700 transition-colors cursor-pointer"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button 
                                                                title="Reject" 
                                                                onClick={() => handleReject(req.id)}
                                                                className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-slate-500 italic">Reviewed</span>
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
        </>
    );
}

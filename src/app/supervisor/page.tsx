'use client';

import { useEffect, useState } from "react";
import {
    Users,
    Calendar,
    AlignJustify,
    AlertCircle,
    TrendingUp,
    ClipboardList,
    CheckCircle,
    XCircle,
    Loader2,
} from "lucide-react";
import SupervisorHeader from "@/components/SupervisorHeader";
import SummaryCard from "@/components/dashboard/SummaryCard";
import ModuleCard from "@/components/dashboard/ModuleCard";
import api from "@/lib/axiosInstance";

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
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
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
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empRes, leaveRes] = await Promise.allSettled([
                    api.get("/api/employees"),
                    api.get("/api/v1/leaves/overseas"),
                ]);

                if (empRes.status === "fulfilled") setEmployees(empRes.value.data);
                if (leaveRes.status === "fulfilled") setLeaves(leaveRes.value.data);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const pendingLeaves = leaves.filter(l =>
        l.status?.toUpperCase() === "PENDING" || l.status === "PENDING_HR_APPROVAL"
    );

    const recentLeaves = leaves.slice(0, 5);

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
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Supervisor Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview of your team&apos;s attendance and leave requests</p>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <SummaryCard
                        title="Total Employees"
                        value={String(employees.length)}
                        subContent={
                            <div className="text-green-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>Active team members</span>
                            </div>
                        }
                        icon={<Users className="w-6 h-6" />}
                        iconBgColor="bg-orange-50"
                        iconColor="text-orange-500"
                    />
                    <SummaryCard
                        title="Pending Leave Requests"
                        value={String(pendingLeaves.length)}
                        subContent={
                            <div className="text-orange-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Requires your action</span>
                            </div>
                        }
                        icon={<Calendar className="w-6 h-6" />}
                        iconBgColor="bg-yellow-50"
                        iconColor="text-yellow-500"
                    />
                    <SummaryCard
                        title="Total Leave Requests"
                        value={String(leaves.length)}
                        subContent={
                            <div className="text-blue-600 flex items-center gap-1">
                                <AlignJustify className="w-3 h-3" />
                                <span>All submitted requests</span>
                            </div>
                        }
                        icon={<AlignJustify className="w-6 h-6" />}
                        iconBgColor="bg-blue-50"
                        iconColor="text-blue-500"
                    />
                </div>

                {/* Modules Grid */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Operations & Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModuleCard
                            title="Manual Attendance Entry"
                            description="Directly log, adjust, or sync supervisor-level attendance data directly into the system database."
                            icon={<AlignJustify className="w-5 h-5" />}
                            href="/supervisor/manual-attendance"
                        />
                        <ModuleCard
                            title="Team Attendance Log"
                            description="View complete logs of team schedules, clock-ins/outs, and real-time attendance tracking summaries."
                            icon={<Users className="w-5 h-5" />}
                            href="/supervisor/team-attendance"
                        />
                    </div>
                </section>

                {/* Recent Leave Requests from real API */}
                <section>
                    <div className="bg-white border border-gray-200 rounded-custom shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Recent Leave Requests</h2>
                            <a
                                href="/supervisor/leave-management"
                                className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-custom hover:opacity-90 transition-opacity"
                            >
                                View All Requests
                            </a>
                        </div>

                        {recentLeaves.length === 0 ? (
                            <p className="text-center text-gray-400 py-8">No leave requests found.</p>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wide">
                                        <th className="py-3 px-4 rounded-l-lg">Employee</th>
                                        <th className="py-3 px-4">Leave Type</th>
                                        <th className="py-3 px-4">From</th>
                                        <th className="py-3 px-4">Days</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 rounded-r-lg text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700">
                                    {recentLeaves.map((req) => (
                                        <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                            {/* Employee */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        {getInitials(req.employeeName || `EMP-${req.employeeId || req.id}`)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {req.employeeName || `Employee #${req.employeeId || "???"}`}
                                                        </p>
                                                        <p className="text-xs text-gray-400">ID: {req.employeeCode || req.employeeId || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Leave Type */}
                                            <td className="py-4 px-4 text-gray-600 capitalize">{req.leaveTypeName || "Leave"}</td>
                                            {/* From */}
                                            <td className="py-4 px-4 text-gray-600">{formatDate(req.fromDate)}</td>
                                            {/* Days */}
                                            <td className="py-4 px-4 text-gray-600">{req.totalDays} day{req.totalDays !== 1 ? 's' : ''}</td>
                                            {/* Status */}
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[req.status] || "bg-gray-100 text-gray-600"}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            {/* Action */}
                                            <td className="py-4 px-4 text-center">
                                                {req.status?.toUpperCase().includes("PENDING") ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button title="Approve" className="text-green-500 hover:text-green-700 transition-colors">
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button title="Reject" className="text-red-400 hover:text-red-600 transition-colors">
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Reviewed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

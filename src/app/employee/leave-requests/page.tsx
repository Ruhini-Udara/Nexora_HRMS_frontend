"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HandoverChecklist } from "@/components/ui/HandoverChecklist";
import api from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";


interface LeaveRequest {
    id: number;
    type: string;
    fromDate: string;
    endDate: string;
    totalDays: number;
    status: string;
    reason: string;
    createdAt: string;
}

interface LeaveResponse {
    id: number;
    fromDate: string;
    endDate: string;
    totalDays: number;
    status: string;
    reason: string;
    createdAt: string;
    leaveTypeName?: string;
}

export default function LeaveRequestsDashboard() {
    const { user } = useAuthStore();
    const employeeId = user?.id;
    const employeeName = user?.name || "";

    // ─── Data Fetching with TanStack Query ───────────────────────────────────

    // 1. Fetch Employee Details
    const { data: employeeData } = useQuery({
        queryKey: ['employee', employeeId],
        queryFn: async () => {
            const res = await api.get(`/api/employees/${employeeId}`);
            const data = res.data;
            return data;
        },
        enabled: !!employeeId
    });

    // 2. Fetch All Leave Requests
    const { data: requests = [], isLoading: loading } = useQuery({
        queryKey: ['leaves', employeeId],
        queryFn: async () => {
            const [overseasRes, maternityRes, normalRes] = await Promise.all([
                api.get(`/api/v1/leaves/overseas/employee/${employeeId}`),
                api.get(`/api/v1/leaves/maternity/employee/${employeeId}`),
                api.get(`/api/v1/leaves/normal/employee/${employeeId}`)
            ]);

            const overseasData = overseasRes.data;
            const maternityData = maternityRes.data;
            const normalData = normalRes.data;

            // Merge and format all leave types
            return [
                ...overseasData.map((r: LeaveResponse) => ({ ...r, type: "Overseas Leave" })),
                ...maternityData.map((r: LeaveResponse) => ({ ...r, type: "Maternity Leave" })),
                ...normalData.map((r: LeaveResponse) => ({ ...r, type: r.leaveTypeName || "Normal Leave" }))
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        enabled: !!employeeId
    });


    const [showHandover, setShowHandover] = useState(false);
    const [statusFilter, setStatusFilter] = useState("ALL");

    const leaveTypes = [
        {
            title: "Normal Leaves",
            description: "Apply for annual, medical, or casual leaves.",
            icon: "event",
            href: "/employee/leave-requests/normal-leaves",
            bgColor: "bg-gray-50 dark:bg-gray-800 group-hover:bg-primary/5 transition-colors",
            iconColor: "text-primary",
        },
        {
            title: "Overseas Leaves",
            description: "Submit requests for traveling abroad.",
            icon: "flight_takeoff",
            href: "/employee/leave-requests/overseas-leave",
            bgColor: "bg-gray-50 dark:bg-gray-800 group-hover:bg-primary/5 transition-colors",
            iconColor: "text-primary",
        },
        {
            title: "Maternity Leaves",
            description: "Apply for maternity leaves.",
            icon: "child_care",
            href: "/employee/leave-requests/maternity-leaves",
            bgColor: "bg-gray-50 dark:bg-gray-800 group-hover:bg-primary/5 transition-colors",
            iconColor: "text-primary",
        }
    ];

    const getStatusStyles = (status: string) => {
        switch (status.toUpperCase()) {
            case "APPROVED":
                return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400";
            case "REJECTED":
                return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
            case "PENDING_HR_APPROVAL":
                return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
            case "PENDING_SUPERVISOR_APPROVAL":
                return "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400";
            case "PENDING_ADMIN_APPROVAL":
            case "ADMIN_APPROVED":
                return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
            case "PENDING_DIRECTOR_REVIEW":
                return "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
            default:
                return "bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400";
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace(/_/g, " ");
    };

    const handleHandoverClick = () => {
        setShowHandover(true);
    };

    const filteredRequests = statusFilter === "ALL"
        ? requests
        : requests.filter(req => req.status.toUpperCase() === statusFilter);

    return (
        <div className="max-w-7xl mx-auto w-full pb-12">
            <div className="mb-8 block">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Requests</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select the type of leave you wish to apply for.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leaveTypes.map((leave, index) => (
                    <Link href={leave.href} key={index} className="group block">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                            <div className={`${leave.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <span className={`material-symbols-outlined text-2xl ${leave.iconColor}`}>
                                    {leave.icon}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                {leave.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow">
                                {leave.description}
                            </p>
                            <div className="flex items-center text-primary text-sm font-semibold mt-auto">
                                Apply Now
                                <span className="material-symbols-outlined text-sm ml-1 group-hover:translate-x-1 transition-transform">
                                    arrow_forward
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Leave Requests</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Your recent leave application history</p>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Filter:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING_SUPERVISOR_APPROVAL">Pending Supervisor</option>
                            <option value="PENDING_HR_APPROVAL">Pending HR</option>
                            <option value="PENDING_ADMIN_APPROVAL">Pending Admin</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Leave Type</th>
                                <th className="px-6 py-4">Applied Date</th>
                                <th className="px-6 py-4">From - To</th>
                                <th className="px-6 py-4">Days</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Loading requests...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                                        No requests found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={`${req.type}-${req.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 dark:text-white">{req.type}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[200px]">{req.reason}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm font-medium">
                                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                                            {new Date(req.fromDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                {req.totalDays} Days
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusStyles(req.status)}`}>
                                                {getStatusLabel(req.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status.toUpperCase() === "APPROVED" && (
                                                <button
                                                    onClick={() => handleHandoverClick()}
                                                    className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-1.5 ml-auto transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">assignment_return</span>
                                                    Handover
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Handover Modal */}
            {showHandover && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">assignment_return</span>
                                <span className="font-bold text-slate-800 dark:text-white">Project & Task Handover</span>
                            </div>
                            <button
                                onClick={() => setShowHandover(false)}
                                className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <HandoverChecklist
                                employeeName={employeeName}
                                onComplete={() => {
                                    setTimeout(() => setShowHandover(false), 3000);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

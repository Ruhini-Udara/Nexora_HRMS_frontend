"use client";

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";

const LeaveStatsHR = ({ type }: { type: 'OVERSEAS' | 'MATERNITY' }) => {
    const { user } = useAuthStore();
    const [statsData, setStatsData] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const endpointPrefix = `/api/v1/leaves/${type.toLowerCase()}/status`;
                const [pendingO, approvedO, rejectedO] = await Promise.all([
                    api.get(`${endpointPrefix}/PENDING_HR_APPROVAL`),
                    api.get(`${endpointPrefix}/APPROVED`),
                    api.get(`${endpointPrefix}/REJECTED`)
                ]);
                
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                
                const isValidReq = (req: { employeeId?: number; createdAt?: string }) => {
                    return req.employeeId !== user?.id;
                };

                const isThisMonth = (req: { employeeId?: number; createdAt?: string }) => {
                    if (!req.createdAt) return false;
                    const date = new Date(req.createdAt);
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                };

                const validPending = pendingO.data.filter(isValidReq);
                const validApproved = approvedO.data.filter(isValidReq);
                const validRejected = rejectedO.data.filter(isValidReq);

                // Pending requests for display should show all time pending
                const pendingCountAllTime = validPending.length;
                
                // For Total calculation, we strictly need this month's requests
                const pendingCountThisMonth = validPending.filter(isThisMonth).length;
                const approvedCountThisMonth = validApproved.filter(isThisMonth).length;
                const rejectedCountThisMonth = validRejected.filter(isThisMonth).length;
                
                const totalCountThisMonth = pendingCountThisMonth + approvedCountThisMonth + rejectedCountThisMonth;

                setStatsData({
                    pending: pendingCountAllTime,
                    approved: approvedCountThisMonth,
                    rejected: rejectedCountThisMonth,
                    total: totalCountThisMonth
                });
            } catch (err) {
                console.error("Error fetching stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [type, user?.id]);

    const stats = [
        {
            label: "Total Requests",
            value: loading ? "..." : statsData.total,
            subtext: "This month",
            icon: FileText,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100 dark:bg-blue-950/40",
            subTextColor: "text-xs font-bold text-gray-500 dark:text-slate-400",
            subIcon: null
        },
        {
            label: "Pending Verification",
            value: loading ? "..." : statsData.pending,
            subtext: "Awaiting review",
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-100 dark:bg-amber-950/40",
            subTextColor: "text-xs font-bold text-amber-600 dark:text-amber-400",
            subIcon: AlertCircle
        },
        {
            label: "Approved",
            value: loading ? "..." : statsData.approved,
            subtext: "This month",
            icon: CheckCircle,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-100 dark:bg-emerald-950/40",
            subTextColor: "text-xs font-bold text-emerald-600 dark:text-emerald-400",
            subIcon: CheckCircle
        },
        {
            label: "Rejected",
            value: loading ? "..." : statsData.rejected,
            subtext: "This month",
            icon: XCircle,
            color: "text-red-600 dark:text-red-400",
            bgColor: "bg-red-100 dark:bg-red-950/40",
            subTextColor: "text-xs font-bold text-red-600 dark:text-red-400",
            subIcon: null
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">{stat.label}</span>
                        <div className={`size-8 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <div className={`flex items-center gap-1 mt-1 ${stat.subTextColor}`}>
                        {stat.subIcon && <stat.subIcon className="w-3.5 h-3.5" />}
                        <span>{stat.subtext}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LeaveStatsHR;

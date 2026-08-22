"use client";

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Wallet } from 'lucide-react';
import api from "@/lib/axiosInstance";

const LeaveStats = () => {
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
                const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
                    api.get('/api/v1/leaves/overseas/status/PENDING_DIRECTOR_REVIEW'),
                    api.get('/api/v1/leaves/overseas/status/APPROVED'),
                    api.get('/api/v1/leaves/overseas/status/REJECTED')
                ]);
                
                setStatsData({
                    pending: pendingRes.data.length,
                    approved: approvedRes.data.length,
                    rejected: rejectedRes.data.length,
                    total: 0 // calculated below
                });
            } catch (err) {
                console.error("Error fetching stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        {
            label: "Pending Board",
            value: loading ? "..." : statsData.pending,
            subtext: "Waiting for your review",
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-100 dark:bg-amber-950/40",
            subTextColor: "text-amber-600 dark:text-amber-400"
        },
        {
            label: "Approved",
            value: loading ? "..." : statsData.approved,
            subtext: "Finalized records",
            icon: CheckCircle,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-100 dark:bg-emerald-950/40",
            subTextColor: "text-emerald-600 dark:text-emerald-400"
        },
        {
            label: "Rejected",
            value: loading ? "..." : statsData.rejected,
            subtext: "Not authorized",
            icon: XCircle,
            color: "text-red-600 dark:text-red-400",
            bgColor: "bg-red-100 dark:bg-red-950/40",
            subTextColor: "text-red-600 dark:text-red-400"
        },
        {
            label: "Total Overseas",
            value: loading ? "..." : (statsData.pending + statsData.approved + statsData.rejected),
            subtext: "Cumulative history",
            icon: Wallet,
            color: "text-primary",
            bgColor: "bg-primary/10",
            subTextColor: "text-gray-500 dark:text-slate-400"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">{stat.label}</span>
                        <div className={`size-8 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className={`text-xs mt-1 font-semibold ${stat.subTextColor}`}>{stat.subtext}</p>
                </div>
            ))}
        </div>
    );

};

export default LeaveStats;

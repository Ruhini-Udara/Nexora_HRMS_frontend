"use client";

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Wallet } from 'lucide-react';

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
                // In a real app, we'd have a summary endpoint. 
                // For now, we'll fetch the main list to get the pending count.
                const res = await fetch(`http://localhost:8080/api/v1/leaves/overseas/status/PENDING_DIRECTOR_REVIEW`);
                if (res.ok) {
                    const data = await res.json();
                    setStatsData(prev => ({ ...prev, pending: data.length }));
                }

                // Fetch total approved (final state)
                const appRes = await fetch(`http://localhost:8080/api/v1/leaves/overseas/status/APPROVED`);
                if (appRes.ok) {
                    const appData = await appRes.json();
                    setStatsData(prev => ({ ...prev, approved: appData.length }));
                }

                // Fetch total rejected
                const rejRes = await fetch(`http://localhost:8080/api/v1/leaves/overseas/status/REJECTED`);
                if (rejRes.ok) {
                    const rejData = await rejRes.json();
                    setStatsData(prev => ({ ...prev, rejected: rejData.length }));
                }
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
            color: "text-secondary",
            bgColor: "bg-secondary/10",
            subTextColor: "text-secondary"
        },
        {
            label: "Approved",
            value: loading ? "..." : statsData.approved,
            subtext: "Finalized records",
            icon: CheckCircle,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
            subTextColor: "text-emerald-600"
        },
        {
            label: "Rejected",
            value: loading ? "..." : statsData.rejected,
            subtext: "Not authorized",
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-100",
            subTextColor: "text-red-600"
        },
        {
            label: "Total Overseas",
            value: loading ? "..." : (statsData.pending + statsData.approved + statsData.rejected),
            subtext: "Cumulative history",
            icon: Wallet,
            color: "text-primary",
            bgColor: "bg-primary/10",
            subTextColor: "text-gray-500"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
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

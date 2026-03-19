"use client";

import React from "react";
import { FileText, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface Props {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export default function ResignationStats({ total, pending, approved, rejected }: Props) {
    const stats = [
        {
            label: "Total Requests",
            value: total,
            icon: FileText,
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
            sub: "All time",
            subColor: "text-gray-500",
        },
        {
            label: "Pending Review",
            value: pending,
            icon: AlertCircle,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            sub: "Action Required",
            subColor: "text-amber-600",
        },
        {
            label: "Board Approved",
            value: approved,
            icon: CheckCircle,
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-600",
            sub: "Processed",
            subColor: "text-emerald-600",
        },
        {
            label: "Board Rejected",
            value: rejected,
            icon: XCircle,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            sub: "Declined",
            subColor: "text-red-500",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map(({ label, value, icon: Icon, iconBg, iconColor, sub, subColor }) => (
                <div key={label} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</span>
                        <div className={`size-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className={`text-xs font-semibold mt-1 ${subColor}`}>{sub}</p>
                </div>
            ))}
        </div>
    );
}

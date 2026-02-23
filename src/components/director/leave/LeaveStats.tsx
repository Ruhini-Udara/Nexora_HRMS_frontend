import React from 'react';
import { Clock, CheckCircle, XCircle, Wallet } from 'lucide-react';

const LeaveStats = () => {
    const stats = [
        {
            label: "Pending Requests",
            value: "24",
            subtext: "+3 since yesterday",
            icon: Clock,
            color: "text-secondary",
            bgColor: "bg-secondary/10",
            subTextColor: "text-secondary"
        },
        {
            label: "Approved Today",
            value: "12",
            subtext: "Ready for payroll",
            icon: CheckCircle,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
            subTextColor: "text-emerald-600"
        },
        {
            label: "Rejected",
            value: "05",
            subtext: "This month",
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-100",
            subTextColor: "text-red-600"
        },
        {
            label: "Total Balance",
            value: "1,240",
            subtext: "Days remaining company-wide",
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

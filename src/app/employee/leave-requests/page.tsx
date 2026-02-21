"use client";

import React from "react";
import Link from "next/link";

export default function LeaveRequestsDashboard() {
    const leaveTypes = [
        {
            title: "Normal Leaves",
            description: "Apply for annual, sick, or casual leaves.",
            icon: "event",
            href: "/employee/leave-requests/normal-leaves",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            iconColor: "text-blue-500",
        },
        {
            title: "Overseas Leaves",
            description: "Submit requests for traveling abroad.",
            icon: "flight_takeoff",
            href: "/employee/leave-requests/overseas-leave",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            iconColor: "text-emerald-500",
        },
        {
            title: "Maternity Leaves",
            description: "Apply for maternity or paternity leave.",
            icon: "child_care",
            href: "/employee/leave-requests/maternity-leaves",
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            iconColor: "text-purple-500",
        }
    ];

    return (
        <div className="max-w-7xl mx-auto w-full">
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

            <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Leave Requests</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your recent leave application history</p>
                    </div>
                    <button className="text-primary hover:bg-primary/5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        View All
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                <th className="pb-3 px-4 font-medium">Leave Type</th>
                                <th className="pb-3 px-4 font-medium">Date Range</th>
                                <th className="pb-3 px-4 font-medium">Days</th>
                                <th className="pb-3 px-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="font-semibold text-slate-800 dark:text-white">Annual Leave</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Family Vacation</div>
                                </td>
                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300">Oct 12, 2023 - Oct 15, 2023</td>
                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300">4</td>
                                <td className="py-4 px-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Approved
                                    </span>
                                </td>
                            </tr>
                            <tr className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="font-semibold text-slate-800 dark:text-white">Sick Leave</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fever</div>
                                </td>
                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300">Sep 05, 2023 - Sep 06, 2023</td>
                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300">2</td>
                                <td className="py-4 px-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Approved
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="font-semibold text-slate-800 dark:text-white">Casual Leave</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Personal Errand</div>
                                </td>
                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300">Aug 20, 2023 - Aug 20, 2023</td>
                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300">1</td>
                                <td className="py-4 px-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                        Pending
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

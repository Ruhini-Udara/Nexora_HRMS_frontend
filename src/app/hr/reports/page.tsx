"use client";

import React from "react";

export default function HRReportsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports & Analytics</h2>
                <p className="text-gray-600 dark:text-gray-400">Generate and analyze comprehensive HR data reports.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Attendance Reports */}
                <div className="group bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:border-primary transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors">
                        <span className="material-icons-round text-primary text-3xl">schedule</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Attendance Reports</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">Detailed breakdown of daily punch-ins, late arrivals, and overtime metrics.</p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </div>

                {/* Leave Analytics */}
                <div className="group bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:border-primary transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors">
                        <span className="material-icons-round text-primary text-3xl">calendar_today</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Leave Analytics</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">Analyze leave utilization patterns, balances, and departmental leave trends.</p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </div>

                {/* Employee Turnover */}
                <div className="group bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:border-primary transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors">
                        <span className="material-symbols-outlined text-primary text-3xl font-bold">person_remove</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Employee Turnover</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">Monitor retention rates and track attrition reasons across the organization.</p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </div>

                {/* Training Progress */}
                <div className="group bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:border-primary transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors">
                        <span className="material-icons-round text-primary text-3xl">school</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Training Progress</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">Track certification completion rates and employee skill development ROI.</p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </div>

                {/* Custom Report Builder */}
                <div className="group bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:border-primary transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors">
                        <span className="material-icons-round text-primary text-3xl">tune</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Custom Report Builder</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">Create bespoke reports by selecting specific data fields and filtering criteria.</p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

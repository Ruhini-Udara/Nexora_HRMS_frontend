import React from "react";

export default function HRStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark flex items-center justify-between card-shadow">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">842</h3>
                    <p className="text-xs text-green-600 font-medium mt-2 flex items-center">
                        <span className="material-icons-round text-sm mr-1">trending_up</span> +5 new hires this week
                    </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg">
                    <span className="material-icons-round text-primary">groups</span>
                </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark flex items-center justify-between card-shadow">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Training Programs</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">12</h3>
                    <p className="text-xs text-amber-600 font-medium mt-2 flex items-center">
                        <span className="material-icons-round text-sm mr-1">pending_actions</span> 3 finishing soon
                    </p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center rounded-lg">
                    <span className="material-icons-round text-secondary">school</span>
                </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark flex items-center justify-between card-shadow">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today&apos;s Attendance %</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">94.8%</h3>
                    <p className="text-xs text-blue-600 font-medium mt-2 flex items-center">
                        <span className="material-icons-round text-sm mr-1">check_circle</span> 798 present today
                    </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center rounded-lg">
                    <span className="material-icons-round text-blue-600">how_to_reg</span>
                </div>
            </div>
        </div>
    );
}

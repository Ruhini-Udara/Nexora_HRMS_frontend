"use client";

import React from 'react';
import LeaveRequestsTable from '@/components/director/leave/LeaveRequestsTable';
import LeaveStats from '@/components/director/leave/LeaveStats';

export default function LeaveRequestsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Requests</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Manage employee leave applications and time off.</p>
                </div>
            </div>

            {/* Stats Card */}
            <LeaveStats />

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3">
                    <LeaveRequestsTable />
                </div>
            </div>
        </div>
    );
}

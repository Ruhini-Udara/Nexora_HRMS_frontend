"use client";

import React from 'react';
import LeaveStats from '@/components/director/leave/LeaveStats';
import LeaveRequestsTable from '@/components/director/leave/LeaveRequestsTable';

const LeaveRequestsPage = () => {
    return (
        <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Leave Requests</h2>

            {/* Stats Overview */}
            <LeaveStats />

            {/* Table Card */}
            <LeaveRequestsTable />
        </div>
    );
};

export default LeaveRequestsPage;


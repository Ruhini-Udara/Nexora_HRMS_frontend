"use client";

import React, { useState } from 'react';
import TrainingStats from '@/components/admin/training/TrainingStats';
import TrainingTable from '@/components/admin/training/TrainingTable';

export const initialRequests = [
    {
        id: 1,
        title: "Sales Tactics Optimization",
        requester: "Sarah Jenkins",
        type: "Soft Skills",
        typeColor: "bg-green-100 text-green-700",
        date: "Oct 12, 2023",
        status: "Pending",
    },
    {
        id: 2,
        title: "Cybersecurity Fundamentals 101",
        requester: "Michael Chen",
        type: "Technical",
        typeColor: "bg-blue-100 text-blue-700",
        date: "Oct 11, 2023",
        status: "Approved",
    },
    {
        id: 3,
        title: "Executive Leadership Coaching",
        requester: "Elena Rodriguez",
        type: "Leadership",
        typeColor: "bg-purple-100 text-purple-700",
        date: "Oct 10, 2023",
        status: "Rejected",
        rejectionReason: "Budget constraints for leadership training this quarter.",
    },
    {
        id: 4,
        title: "Workplace Safety & Compliance",
        requester: "David Park",
        type: "Safety",
        typeColor: "bg-red-100 text-red-700",
        date: "Oct 09, 2023",
        status: "Pending",
    },
    {
        id: 5,
        title: "Advanced UI Design Systems",
        requester: "Jamie Smith",
        type: "Technical",
        typeColor: "bg-blue-100 text-blue-700",
        date: "Oct 08, 2023",
        status: "Approved",
    },
];

export default function TrainingRequestsPage() {
    const [requests, setRequests] = useState(initialRequests);

    const pendingCount = requests.filter(r => r.status === 'Pending').length;
    const rejectedCount = requests.filter(r => r.status === 'Rejected').length;
    const approvedCount = requests.filter(r => r.status === 'Approved').length;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Training Request List</h2>
                    <p className="text-gray-500 mt-1">Manage and review all pending training applications from your teams.</p>
                </div>
            </div>

            {/* Stats */}
            <TrainingStats
                pendingCount={pendingCount}
                rejectedCount={rejectedCount}
                approvedCount={approvedCount}
            />

            {/* Content */}
            <TrainingTable
                requests={requests}
                setRequests={setRequests}
            />
        </div>
    );
}


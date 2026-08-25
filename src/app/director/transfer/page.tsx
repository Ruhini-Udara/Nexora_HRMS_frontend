"use client";

import React, { useState, useEffect } from 'react';
import TransferStats from '@/components/director/transfer/TransferStats';
import TransferTable from '@/components/director/transfer/TransferTable';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getAllTransferRequests, TransferRequest } from '@/lib/api/transferRequests';

export default function TransferRequestsPage() {
    const [requests, setRequests] = useState<TransferRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getAllTransferRequests();
                // Show only those submitted to director or already approved/rejected by director
                const directorScope = data.filter(r => 
                    String(r.status) === "SUBMITTED_TO_DIRECTOR" || 
                    String(r.status) === "APPROVED" || 
                    String(r.status) === "REJECTED"
                );
                setRequests(directorScope);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const stats = {
        total: requests.length,
        pending: requests.filter(r => String(r.status) === 'SUBMITTED_TO_DIRECTOR').length,
        approved: requests.filter(r => String(r.status) === 'APPROVED').length,
        rejected: requests.filter(r => String(r.status) === 'REJECTED').length
    };
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Requests</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Manage internal transfer applications and department changes.</p>

                </div>

            </div>

            {/* Stats */}
            <TransferStats stats={stats} />

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3">



                    <TransferTable />
                </div>
            </div>
        </div>
    );
}


"use client";

import React from 'react';
import TransferTable from '@/components/director/transfer/TransferTable';

export default function TransferRequestsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Requests</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Manage internal transfer applications and department changes.</p>
                </div>
            </div>
            
            <TransferTable />
        </div>
    );
}

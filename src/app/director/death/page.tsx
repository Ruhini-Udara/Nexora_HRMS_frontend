"use client";

import React from 'react';
import DeathRequestsTable from '@/components/director/death/DeathRequestsTable';

export default function DeathApplicationsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Death Applications</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Review and process employee death benefit claims and documentation.</p>
                </div>
            </div>


            {/* Table */}
            <DeathRequestsTable />
        </div>
    );
}

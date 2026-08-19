"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react';
import DeathRequestsTable from '@/components/director/death/DeathRequestsTable';
import { getAllDeathRequests, DeathRequest } from '@/lib/api/deathRequests';

export default function DeathApplicationsPage() {
    const [requests, setRequests] = useState<DeathRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await getAllDeathRequests();
            // Show only those submitted to director or already approved/rejected by director
            const directorScope = data.filter(r => 
                r.status === "SUBMITTED_TO_DIRECTOR" || 
                r.status === "APPROVED" || 
                r.status === "REJECTED"
            );
            setRequests(directorScope);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'SUBMITTED_TO_DIRECTOR').length,
        approved: requests.filter(r => r.status === 'APPROVED').length
    };
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Death Applications</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Review and process employee death benefit claims and documentation.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Total Applications</span>
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    <div className="flex items-center gap-1 mt-1 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">This year</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm font-medium">Pending Review</span>
                        <div className="size-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                    <div className="flex items-center gap-1 mt-1 text-red-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Action Required</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm font-medium">Approved</span>
                        <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
                    <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-slate-400">
                        <span className="text-xs font-bold">All-time total</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <DeathRequestsTable />
        </div>
    );
}

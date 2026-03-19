"use client";

import React, { useState } from "react";
import ResignationRequestPage from "@/components/ResignationRequestPage";
import type { ResignationRequest } from "@/components/ResignationRequestPage";

// ── Status badge config ─────────────────────────────────────────────
type RequestStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

const statusStyles: Record<RequestStatus, { label: string; classes: string }> = {
    DRAFT: { label: 'Draft', classes: 'bg-slate-100 text-slate-600' },
    SUBMITTED: { label: 'Pending', classes: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
    APPROVED: { label: 'Approved', classes: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    REJECTED: { label: 'Rejected', classes: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
};

export default function Page() {
    // ── Mock request state (API-ready) ──────────────────────────────
    const [requests, setRequests] = useState<ResignationRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Only show SUBMITTED/APPROVED/REJECTED in the status table (not DRAFT)
    const visibleRequests = requests.filter(
        (r) => r.status !== 'DRAFT' &&
            (searchQuery === '' || r.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatDate = (iso: string) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="max-w-[1400px] w-full mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resignation Request</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Submit and track your formal departure notice</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 text-[11px] font-bold px-4 py-1.5 rounded uppercase tracking-wider">
                    Active Employment
                </div>
            </div>

            <ResignationRequestPage
                requests={requests}
                onRequestChange={setRequests}
            />

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="font-bold text-slate-800 dark:text-white">Resignation Request Status</h2>
                    <div className="relative w-full sm:w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary outline-none"
                            placeholder="Search request ID..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Request ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Working Day</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {visibleRequests.length > 0 ? (
                                visibleRequests.map((req) => {
                                    const st = statusStyles[req.status];
                                    return (
                                        <tr key={req.id}>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{req.id}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(req.submittedAt || req.createdAt)}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(req.effectiveDate)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase ${st.classes}`}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-slate-400 hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-300 text-4xl">inbox</span>
                                            <p className="text-sm text-slate-400">No submitted resignation requests</p>
                                            <p className="text-[11px] text-slate-400">Requests will appear here once submitted for approval</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

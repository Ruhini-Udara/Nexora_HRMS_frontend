"use client";

import React, { useState } from 'react';
import TransferRequestPage from '@/components/TransferRequestPage';
import type { TransferRequest } from '@/components/TransferRequestPage';

// ── Status badge config ─────────────────────────────────────────────
type RequestStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

const statusStyles: Record<RequestStatus, { label: string; classes: string }> = {
    DRAFT: { label: 'Draft', classes: 'bg-slate-100 text-slate-600' },
    SUBMITTED: { label: 'Pending', classes: 'bg-yellow-50 text-yellow-600' },
    APPROVED: { label: 'Approved', classes: 'bg-green-50 text-green-600' },
    REJECTED: { label: 'Rejected', classes: 'bg-red-50 text-red-600' },
};

export default function Page() {
    const [requests, setRequests] = useState<TransferRequest[]>([]);
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
        <div className="space-y-8">
            <TransferRequestPage
                requests={requests}
                onRequestChange={setRequests}
            />

            {/* Transfer Request Status Table */}
            <div className="max-w-7xl w-full mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="font-bold text-slate-800">Transfer Request Status</h2>
                        <div className="relative w-full sm:w-80">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none"
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
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Request ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Location</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {visibleRequests.length > 0 ? (
                                    visibleRequests.map((req) => {
                                        const st = statusStyles[req.status];
                                        return (
                                            <tr key={req.id}>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{req.id}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{formatDate(req.submittedAt || req.createdAt)}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{req.targetLocation}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{formatDate(req.expectedDate)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase ${st.classes}`}>
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="text-slate-400 hover:text-[#8B3A00] transition-colors">
                                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-300 text-4xl">inbox</span>
                                                <p className="text-sm text-slate-400">No submitted transfer requests</p>
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
        </div>
    );
}

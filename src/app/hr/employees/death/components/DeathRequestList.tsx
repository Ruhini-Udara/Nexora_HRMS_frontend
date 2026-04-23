"use client";

import React, { useState } from 'react';

export interface DeathRequest {
    id: string;
    employeeName: string;
    epfNumber: string;
    dateOfDeath: string;
    natureOfDeath: string;
    requesterName: string;
    relationship: string;
    address: string;
    contactNumber: string;
    specialRemark: string;
    status: 'NEW' | 'SUBMITTED_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';
    nomineeName?: string;
    nomineeBank?: string;
    nomineeBranch?: string;
    nomineeAccount?: string;
    documents: {
        deathCertificate?: string;
        nomineeId?: string;
        requestLetter?: string;
    };
}

interface DeathRequestListProps {
    requests: DeathRequest[];
    onUpdateRequests: (requests: DeathRequest[]) => void;
    onCreateNew: () => void;
    onEdit: (request: DeathRequest) => void;
    onView: (request: DeathRequest) => void;
}

export function DeathRequestList({
    requests,
    onCreateNew,
    onEdit,
    onView
}: DeathRequestListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredRequests = requests.filter(req =>
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={onCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shrink-0"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Request
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                                <th className="py-4 px-6">Request ID</th>
                                <th className="py-4 px-6">Employee</th>
                                <th className="py-4 px-6">Date of Death</th>
                                <th className="py-4 px-6">Requester</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">{req.id}</td>
                                        <td className="py-4 px-6">
                                            <p className="font-medium text-slate-900 dark:text-white">{req.employeeName}</p>
                                            <p className="text-xs text-slate-500">EPF: {req.epfNumber}</p>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{req.dateOfDeath}</td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{req.requesterName}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                req.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                                                req.status === 'SUBMITTED_FOR_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                                                req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {req.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            {req.status === 'NEW' ? (
                                                <button
                                                    onClick={() => onEdit(req)}
                                                    className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                                                >
                                                    Edit
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onView(req)}
                                                    className="text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
                                                >
                                                    View
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-500">
                                        No requests found.
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

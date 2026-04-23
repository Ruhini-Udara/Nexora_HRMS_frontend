"use client";

import React, { useState } from 'react';

export interface ResignationRequest {
    id: string;
    employeeName: string;
    epfNumber: string;
    designation: string;
    branch: string;
    resignationDate: string;
    lastWorkingDate: string;
    reason: string;
    specialRemark: string;
    status: 'NEW' | 'SUBMITTED_FOR_ADMIN_APPROVAL' | 'APPROVED' | 'REJECTED';
    documents: {
        resignationLetter?: string;
        handoverChecklist?: string;
    };
}

interface ResignationRequestListProps {
    requests: ResignationRequest[];
    onUpdateRequests: (requests: ResignationRequest[]) => void;
    onCreateNew: () => void;
    onEdit: (request: ResignationRequest) => void;
    onView: (request: ResignationRequest) => void;
}

export function ResignationRequestList({
    requests,
    onCreateNew,
    onEdit,
    onView
}: ResignationRequestListProps) {
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
                    className="flex items-center gap-2 px-4 py-2 bg-[#8B3A00] text-white rounded-lg hover:bg-[#8B3A00]/90 transition-colors shrink-0"
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
                                <th className="py-4 px-6">Designation</th>
                                <th className="py-4 px-6">Last Working Date</th>
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
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{req.designation}</td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{req.lastWorkingDate}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                req.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                                                req.status === 'SUBMITTED_FOR_ADMIN_APPROVAL' ? 'bg-amber-100 text-amber-800' :
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
                                                    className="text-[#8B3A00] hover:text-[#8B3A00]/80 font-medium text-sm transition-colors"
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

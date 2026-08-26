"use client";

import React, { useState, useEffect } from "react";
import ResignationRequestPage from "@/components/ResignationRequestPage";
import type { ResignationRequest } from "@/components/ResignationRequestPage";
import { getResignationRequestsByEmployee } from "@/lib/api/resignationRequests";
import { useAuthStore } from "@/store/useAuthStore";

// ── Status badge config ─────────────────────────────────────────────
type RequestStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEW';

const statusStyles: Record<string, { label: string; classes: string }> = {
    'NEW': { label: 'Draft', classes: 'bg-slate-100 text-slate-600' },
    'SUBMITTED': { label: 'Pending', classes: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
    'VERIFIED_BY_HR': { label: 'Verified by HR', classes: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    'PENDING_ADMIN': { label: 'Pending Admin', classes: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    'SUBMITTED_FOR_ADMIN_APPROVAL': { label: 'Pending Admin', classes: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    'Pending Director': { label: 'Pending Director', classes: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
    'REJECTED': { label: 'Rejected', classes: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    'Board Approved': { label: 'Approved', classes: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    'Board Rejected': { label: 'Rejected', classes: 'bg-red-700/10 text-red-700 dark:text-red-400' },
};

export default function Page() {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<ResignationRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<ResignationRequest | null>(null);
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        const fetchRequests = async () => {
            try {
                const data = await getResignationRequestsByEmployee(user.id);
                
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                
                const recentData = data.filter(r => {
                    const reqDate = new Date(r.createdAt || r.resignationDate || '');
                    return isNaN(reqDate.getTime()) || reqDate >= oneYearAgo;
                });
                
                setRequests(recentData);
            } catch (error) {
                console.error("Failed to fetch resignations:", error);
            }
        };
        fetchRequests();
    }, [user?.id]);

    // Show all requests in the status table (including NEW/Draft)
    const visibleRequests = requests.filter(
        (r) => (searchQuery === '' || r.id.toLowerCase().includes(searchQuery.toLowerCase()))
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

            {/* Permanent Create Form at Top */}
            <ResignationRequestPage
                requests={requests}
                onRequestChange={setRequests}
                selectedRequest={null}
                isViewOnly={false}
                onCancelEdit={() => { }}
            />

            {/* View/Edit Modal */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
                    {isViewOnly ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800 transition-colors">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#8B3A00] dark:text-orange-500">assignment_late</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Resignation Request Details</h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{selectedRequest.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedRequest(null);
                                        setIsViewOnly(false);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-400 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Submission Date</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{formatDate(selectedRequest.createdAt || '')}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</p>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${statusStyles[selectedRequest.status]?.classes || statusStyles.NEW?.classes || 'bg-slate-100 text-slate-600'}`}>
                                            {statusStyles[selectedRequest.status]?.label || 'Draft'}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Resignation Date</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{formatDate(selectedRequest.resignationDate || '')}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Last Working Day</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{formatDate(selectedRequest.lastWorkingDate || '')}</p>
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reason for Resignation</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{selectedRequest.reason}</p>
                                    </div>
                                </div>

                                {selectedRequest.obligationDetails && (
                                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Direct and Indirect Obligations</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl italic">&quot;{selectedRequest.obligationDetails}&quot;</p>
                                    </div>
                                )}
                                
                                {selectedRequest.specialRemark && (
                                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Special Remark</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl italic">&quot;{selectedRequest.specialRemark}&quot;</p>
                                    </div>
                                )}

                                {selectedRequest.documents && Object.keys(selectedRequest.documents).length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Attached Documents</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {Object.entries(selectedRequest.documents).map(([key, filename]) => {
                                                if (!filename) return null;
                                                const labels: Record<string, string> = {
                                                    resignationLetter: 'Resignation Letter',
                                                    clearanceLetter: 'Clearance Letter',
                                                    handoverChecklist: 'Handover Checklist'
                                                };
                                                return (
                                                    <div key={key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm transition-colors">
                                                        <div className="w-8 h-8 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{labels[key] || key}</p>
                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{filename as string}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end border-t border-slate-100 dark:border-slate-800 transition-colors">
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedRequest(null);
                                        setIsViewOnly(false);
                                    }}
                                    className="px-8 py-2.5 bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Edit Resignation Draft
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedRequest(null);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="overflow-y-auto p-4 sm:p-8">
                                <ResignationRequestPage
                                    requests={requests}
                                    onRequestChange={setRequests}
                                    selectedRequest={selectedRequest}
                                    isViewOnly={false}
                                    isModal={true}
                                    onCancelEdit={() => {
                                        setIsModalOpen(false);
                                        setSelectedRequest(null);
                                        setIsViewOnly(false);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                                    const st = statusStyles[req.status] || { label: req.status || 'Unknown', classes: 'bg-slate-100 text-slate-600' };
                                    return (
                                        <tr key={req.id}>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{req.id}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(req.createdAt || '')}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(req.lastWorkingDate)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase ${st.classes}`}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <button
                                                    className="text-slate-400 hover:text-[#8B3A00] transition-colors cursor-pointer"
                                                    title="View Request"
                                                    onClick={() => {
                                                        setSelectedRequest(req);
                                                        setIsViewOnly(true);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                                {req.status === 'NEW' && (
                                                    <button
                                                        className="text-slate-400 hover:text-[#8B3A00] transition-colors cursor-pointer"
                                                        title="Edit Draft"
                                                        onClick={() => {
                                                            setSelectedRequest(req);
                                                            setIsViewOnly(false);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                                    </button>
                                                )}
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

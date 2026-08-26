"use client";

import React, { useState, useRef } from 'react';
import TransferRequestPage from '@/components/TransferRequestPage';
import { TransferRequest, getAllTransferRequests, getTransferRequestsByEmployee } from '@/lib/api/transferRequests';
import { useAuthStore } from '@/store/useAuthStore';

const statusStyles: Record<string, { label: string; classes: string }> = {
    NEW: { label: 'Draft', classes: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
    SUBMITTED: { label: 'Pending', classes: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' },
    APPROVED: { label: 'Approved', classes: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
    REJECTED: { label: 'Rejected', classes: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
    VERIFIED_BY_HR: { label: 'Verified by HR', classes: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    PENDING_ADMIN: { label: 'Pending Admin', classes: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
};

export default function Page() {
    const [requests, setRequests] = useState<TransferRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewRequest, setViewRequest] = useState<TransferRequest | null>(null);
    const formRef = useRef<{ setEditingDraft: (req: TransferRequest) => void }>(null);

    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    const loadRequests = React.useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const data = user.role === 'ROLE_ADMIN'
                ? await getAllTransferRequests()
                : await getTransferRequestsByEmployee(user.id);
            
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            
            const recentData = data.filter(r => {
                const reqDate = new Date(r.requestDate || '');
                return isNaN(reqDate.getTime()) || reqDate >= oneYearAgo;
            });
            
            setRequests(recentData);
        } catch (err) {
            console.error("Failed to fetch transfer requests", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    React.useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    // Show all requests in the table
    const visibleRequests = requests.filter(
        (r) => searchQuery === '' || r.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (iso: string) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const handleEditDraft = (req: TransferRequest) => {
        if (formRef.current) {
            formRef.current.setEditingDraft(req);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-8">
            <TransferRequestPage
                ref={formRef}
                requests={requests}
                onRequestChange={setRequests}
            />

            {/* Transfer Request Status Table */}
            <div className="max-w-7xl w-full mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="font-bold text-slate-800 dark:text-white">Transfer Request Status</h2>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {requests.length} Total
                            </span>
                        </div>
                        <div className="relative w-full sm:w-80">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-[#8B3A00] outline-none"
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
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Request ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Submission Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Target Location</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Effective Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-[#8B3A00] border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-sm text-slate-400">Loading requests...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : visibleRequests.length > 0 ? (
                                    visibleRequests.map((req) => {
                                        const st = statusStyles[req.status] || statusStyles.NEW;
                                        return (
                                            <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">{req.id}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(req.submittedAt || req.createdAt || '')}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{req.targetBranch}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(req.expectedDate)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${st.classes}`}>
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {req.status === 'NEW' && (
                                                            <button
                                                                onClick={() => handleEditDraft(req)}
                                                                className="flex items-center gap-1 text-[11px] font-bold text-[#8B3A00] dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 px-3 py-1.5 rounded-lg transition-colors border border-orange-100 dark:border-orange-900/40"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                                Edit & Submit
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setViewRequest(req)}
                                                            className="p-2 text-slate-400 hover:text-[#8B3A00] dark:hover:text-orange-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-300 text-4xl">inbox</span>
                                                <p className="text-sm text-slate-400 font-medium">No transfer requests found</p>
                                                <p className="text-[11px] text-slate-400">Try adjusting your search or create a new request</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* View Request Modal */}
            {viewRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800 transition-colors">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#8B3A00] dark:text-orange-500">description</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Transfer Request Details</h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{viewRequest.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewRequest(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-400"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Submission Date</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{formatDate(viewRequest.submittedAt || viewRequest.createdAt || '')}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</p>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${statusStyles[viewRequest.status]?.classes || statusStyles.NEW.classes}`}>
                                        {statusStyles[viewRequest.status]?.label || 'Draft'}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Branch</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{viewRequest.currentBranch}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target Branch</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{viewRequest.targetBranch}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Effective Date</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{formatDate(viewRequest.expectedDate)}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Transfer Type</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{viewRequest.transferType}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reason for Transfer</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl italic">&quot;{viewRequest.reason}&quot;</p>
                            </div>

                            {viewRequest.documents && viewRequest.documents.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Attached Documents</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {viewRequest.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm transition-colors">
                                                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{doc.label}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{doc.filename}</p>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end border-t border-slate-100 dark:border-slate-800 transition-colors">
                            <button
                                onClick={() => setViewRequest(null)}
                                className="px-8 py-2.5 bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

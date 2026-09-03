"use client";

import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import TrainingListModal from './viewlist/TrainingListModal';
import api from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/useAuthStore';

// Shape of each training request displayed in the table
interface RequestModel {
    id: number;
    title: string;
    trainingCode?: string;
    requester: string;
    type: string;
    typeColor: string;
    submissionDate: string;
    date: string;
    status: string;
    rejectionReason?: string;
    time: string;
    location: string;
    trainer: string;
    expectedParticipants: number;
    approvedAt?: string;
    updatedAt?: string;
}

interface TrainingTableProps {
    requests: RequestModel[];
    setRequests: React.Dispatch<React.SetStateAction<RequestModel[]>>;
}

export default function TrainingTable({ requests, setRequests }: TrainingTableProps) {
    const { user } = useAuthStore();

    // Controls main modal visibility (view training details)
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Holds data for the currently selected training to display in modal
    const [selectedTraining, setSelectedTraining] = useState<{ 
        id: number, 
        title: string, 
        trainingCode?: string,
        type: string, 
        date: string, 
        status: string, 
        time: string,
        location: string, 
        trainer: string, 
        expectedParticipants: number 
    } | null>(null);

    const [filterType, setFilterType] = useState("All");
    const [filterStatus, setFilterStatus] = useState("Pending");
    const [rejectionReason, setRejectionReason] = useState("");

    // Confirmation Modal State (used for approve/return/reject actions)
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'Approve' | 'Return' | 'Reject' | null;
    }>({ isOpen: false, type: null });

    // Tracks API request state to disable UI during processing
    const [isProcessing, setIsProcessing] = useState(false);

    // Opens the training details modal and sets selected training
    const handleViewList = (req: RequestModel) => {
        setSelectedTraining({
            id: req.id,
            title: req.title,
            trainingCode: req.trainingCode,
            type: req.type,
            date: req.date,
            status: req.status,
            time: req.time,
            location: req.location,
            trainer: req.trainer,
            expectedParticipants: req.expectedParticipants
        });
        setIsModalOpen(true);
    };

    const handleApproveClick = () => {
        if (!selectedTraining) return;
        setConfirmModal({ isOpen: true, type: 'Approve' });
    };

    const handleReturnClick = () => {
        if (!selectedTraining) return;
        setConfirmModal({ isOpen: true, type: 'Return' });
    };

    const handleRejectClick = () => {
        if (!selectedTraining) return;
        setConfirmModal({ isOpen: true, type: 'Reject' });
    };

    /**
     * Handles final confirmation action:
     * - Determines new status
     * - Sends update to backend
     * - Updates local state for immediate UI feedback
     */
    const confirmAction = async () => {
        if (!selectedTraining || !confirmModal.type) return;

        const newStatus = confirmModal.type === 'Approve' ? 'Approved' : (confirmModal.type === 'Return' ? 'Returned' : 'Rejected');

        const nowIso = new Date().toISOString();
        try {
            await api.put(`/api/training/events/${selectedTraining.id}/status`, {
                status: newStatus,
                reason: (confirmModal.type === 'Reject' || confirmModal.type === 'Return') ? rejectionReason : undefined,
                approvedBy: confirmModal.type === 'Approve' ? user?.name : undefined,
                approvedAt: confirmModal.type === 'Approve' ? nowIso : undefined
            });

            setRequests(prev => {
                const target = prev.find(req => req.id === selectedTraining.id);
                if (!target) return prev;
                const updatedItem: RequestModel = {
                    ...target,
                    status: newStatus,
                    approvedAt: confirmModal.type === 'Approve' ? nowIso : target.approvedAt,
                    updatedAt: nowIso,
                    ...((confirmModal.type === 'Reject' || confirmModal.type === 'Return') ? { rejectionReason } : {})
                };
                // Place newly approved/updated item directly at the top
                return [updatedItem, ...prev.filter(req => req.id !== selectedTraining.id)];
            });
        } catch (err) {
            console.error("Failed to update training event status", err);
            alert("Failed to update status. Please try again.");
        } finally {
            setIsProcessing(false);
            setConfirmModal({ isOpen: false, type: null });
            setRejectionReason("");
            setIsModalOpen(false);
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter and sort requests with newest on top
    const filteredRequests = requests
        .filter(req =>
            (filterType === "All" || req.type === filterType) &&
            (filterStatus === "All Statuses" || req.status === filterStatus)
        )
        .sort((a, b) => {
            const timeA = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
            const timeB = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
            if (timeA && timeB && timeA !== timeB) return timeB - timeA;
            if (timeA && !timeB) return -1;
            if (!timeA && timeB) return 1;

            const subA = a.submissionDate && a.submissionDate !== "N/A" ? new Date(a.submissionDate).getTime() : 0;
            const subB = b.submissionDate && b.submissionDate !== "N/A" ? new Date(b.submissionDate).getTime() : 0;
            if (subA && subB && subA !== subB) return subB - subA;

            return b.id - a.id;
        });

    // Pagination Logic
    const totalItems = filteredRequests.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = filteredRequests.slice(startIndex, endIndex);

    // Handles page navigation while preventing invalid page numbers
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filterType, filterStatus]);

    return (
        <>
            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm gap-4">
                <div className="relative inline-flex items-center">
                    <SlidersHorizontal className="w-4 h-4 text-gray-500 absolute left-4 pointer-events-none" />
                    <select
                        className="appearance-none w-full flex items-center gap-2 pl-10 pr-10 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-semibold rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Internal">Internal</option>
                        <option value="External">External</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 pointer-events-none" />
                </div>

                <div className="relative inline-flex items-center">
                    <select
                        className="appearance-none w-full flex items-center gap-2 pl-4 pr-10 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-semibold rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All Statuses">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Returned">Returned</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 pointer-events-none" />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Training Program</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Training Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                                {(filterStatus === "Rejected" || filterStatus === "Returned") && (
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider w-48">Reason</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {currentItems.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{req.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 dark:text-slate-400">{req.type}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-slate-400">{req.submissionDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'Approved' ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400' :
                                            req.status === 'Rejected' ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400' :
                                                req.status === 'Returned' ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400' :
                                                    'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleViewList(req)}
                                            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm inline-block"
                                        >
                                            View List
                                        </button>
                                    </td>
                                    {(filterStatus === "Rejected" || filterStatus === "Returned") && (
                                        <td className="px-6 py-4 w-48">
                                            <p className={`text-sm font-medium break-words line-clamp-3 ${req.status === 'Rejected' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`} title={req.rejectionReason || "No reason provided."}>
                                                {req.rejectionReason || (req.status === 'Returned' ? "Returned for adjustments." : "No reason provided.")}
                                            </p>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {currentItems.length === 0 && (
                                <tr>
                                    <td colSpan={(filterStatus === "Rejected" || filterStatus === "Returned") ? 6 : 5} className="px-6 py-10 text-center text-gray-500 dark:text-slate-400 italic">
                                        No programs found matching the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                        Showing {totalItems > 0 ? startIndex + 1 : 0} to {endIndex} of {totalItems} results
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${
                                    currentPage === page 
                                    ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                                    : 'border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <TrainingListModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                training={selectedTraining}
                onApprove={handleApproveClick}
                onReturn={handleReturnClick}
                onReject={handleRejectClick}
            />

            {/* Custom Confirmation Modal */}
            {confirmModal.isOpen && selectedTraining && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col p-6 text-center border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {confirmModal.type === 'Approve' ? 'Confirm Approval' : (confirmModal.type === 'Return' ? 'Return to HR' : 'Confirm Final Rejection')}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            {confirmModal.type === 'Approve'
                                ? `Are you sure you want to approve and send emails for the "${selectedTraining.title}" training list? This action cannot be undone.`
                                : confirmModal.type === 'Return'
                                    ? `Are you sure you want to return the "${selectedTraining.title}" training list to HR for adjustments?`
                                    : `Are you sure you want to finally reject and cancel the "${selectedTraining.title}" training program? This action cannot be undone.`
                            }
                        </p>
                        {(confirmModal.type === 'Reject' || confirmModal.type === 'Return') && (
                            <div className="mb-6 text-left">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Reason for {confirmModal.type === 'Return' ? 'Return' : 'Rejection'} *
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder={`Enter the reason for ${confirmModal.type === 'Return' ? 'returning' : 'rejecting'} this training list...`}
                                />
                            </div>
                        )}
                        <div className="flex gap-4">
                            <button
                                onClick={() => !isProcessing && setConfirmModal({ isOpen: false, type: null })}
                                disabled={isProcessing}
                                className="flex-1 px-4 py-2.5 font-semibold rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                disabled={isProcessing || ((confirmModal.type === 'Reject' || confirmModal.type === 'Return') && !rejectionReason.trim())}
                                className={`flex-1 px-4 py-2.5 font-semibold rounded-xl text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${confirmModal.type === 'Approve'
                                        ? 'bg-primary hover:bg-primary/90'
                                        : confirmModal.type === 'Return'
                                            ? 'bg-orange-500 hover:bg-orange-600'
                                            : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    confirmModal.type === 'Approve' ? 'Yes, Approve' : (confirmModal.type === 'Return' ? 'Yes, Return' : 'Yes, Reject')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

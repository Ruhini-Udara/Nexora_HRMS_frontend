"use client";

import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import TrainingListModal from './viewlist/TrainingListModal';

interface RequestModel {
    id: number;
    title: string;
    requester: string;
    type: string;
    typeColor: string;
    date: string;
    status: string;
}

interface TrainingTableProps {
    requests: RequestModel[];
    setRequests: React.Dispatch<React.SetStateAction<RequestModel[]>>;
}

export default function TrainingTable({ requests, setRequests }: TrainingTableProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState<{id: number, title: string, type: string, date: string, status: string} | null>(null);
    const [filterType, setFilterType] = useState("All");
    const [filterStatus, setFilterStatus] = useState("Pending");

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'Approve' | 'Reject' | null;
    }>({ isOpen: false, type: null });

    const handleViewList = (req: RequestModel) => {
        setSelectedTraining({
            id: req.id,
            title: req.title,
            type: req.type,
            date: req.date,
            status: req.status
        });
        setIsModalOpen(true);
    };

    const handleApproveClick = () => {
        if (!selectedTraining) return;
        setConfirmModal({ isOpen: true, type: 'Approve' });
    };

    const handleRejectClick = () => {
        if (!selectedTraining) return;
        setConfirmModal({ isOpen: true, type: 'Reject' });
    };

    const confirmAction = () => {
        if (!selectedTraining || !confirmModal.type) return;

        setRequests(prev => prev.map(req => 
            req.id === selectedTraining.id 
                ? { ...req, status: confirmModal.type === 'Approve' ? "Approved" as const : "Rejected" as const } 
                : req
        ));
        
        setConfirmModal({ isOpen: false, type: null });
        setIsModalOpen(false);
    };

    const uniqueTypes = ["All", ...Array.from(new Set(requests.map(req => req.type)))];
    const uniqueStatuses = ["All Statuses", ...Array.from(new Set(requests.map(req => req.status)))];

    const filteredRequests = requests.filter(req => 
        (filterType === "All" || req.type === filterType) &&
        (filterStatus === "All Statuses" || req.status === filterStatus)
    );

    return (
        <>
            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                <div className="relative inline-flex items-center">
                    <SlidersHorizontal className="w-4 h-4 text-gray-500 absolute left-4 pointer-events-none" />
                    <select
                        className="appearance-none w-full flex items-center gap-2 pl-10 pr-10 py-2 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        {uniqueTypes.map(type => (
                            <option key={type} value={type}>
                                {type === "All" ? "All Types" : type}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 pointer-events-none" />
                </div>
                
                <div className="relative inline-flex items-center">
                    <select
                        className="appearance-none w-full flex items-center gap-2 pl-4 pr-10 py-2 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        {uniqueStatuses.map(status => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 pointer-events-none" />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Training Program</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Training Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{req.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">{req.type}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{req.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-orange-100 text-orange-800'
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium">Showing 1 to 5 of 8 results</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1.5 bg-primary text-white rounded-md text-sm font-bold">1</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600">2</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600">3</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600">Next</button>
                    </div>
                </div>
            </div>

            <TrainingListModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                training={selectedTraining}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
            />

            {/* Custom Confirmation Modal */}
            {confirmModal.isOpen && selectedTraining && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col p-6 text-center border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {confirmModal.type === 'Approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            {confirmModal.type === 'Approve' 
                                ? `Are you sure you want to approve and send emails for the "${selectedTraining.title}" training list? This action cannot be undone.`
                                : `Are you sure you want to reject the "${selectedTraining.title}" training list? This action cannot be undone.`
                            }
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, type: null })}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`flex-1 px-4 py-2.5 font-semibold rounded-xl text-white transition-all shadow-sm ${
                                    confirmModal.type === 'Approve' 
                                        ? 'bg-primary hover:bg-primary/90' 
                                        : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {confirmModal.type === 'Approve' ? 'Yes, Approve' : 'Yes, Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

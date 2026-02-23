"use client";

import React, { useState } from 'react';
import { Download, Check, X, Send } from 'lucide-react';

const mockRequests = [
    {
        id: "REQ-001",
        name: "Johnathan Doe",
        initials: "JD",
        type: "Overseas Leave",
        startDate: "Oct 12, 2023",
        endDate: "Oct 15, 2023",
        duration: "4 Days",
        status: "Pending Board Approval",
        boardMeeting: "August 2024 Board",
        email: "johnathan@example.com",
        phone: "+94771234567"
    },
    {
        id: "REQ-002",
        name: "Jane Smith",
        initials: "JS",
        type: "Overseas Leave",
        startDate: "Oct 14, 2023",
        endDate: "Oct 14, 2023",
        duration: "1 Day",
        status: "Approved",
        boardMeeting: "August 2024 Board",
        email: "jane@example.com",
        phone: "+94771234568"
    },
    {
        id: "REQ-003",
        name: "Robert Brown",
        initials: "RB",
        type: "Overseas Leave",
        startDate: "Nov 01, 2023",
        endDate: "Nov 14, 2023",
        duration: "14 Days",
        status: "Pending Board Approval",
        boardMeeting: "September 2024 Board",
        email: "robert@example.com",
        phone: "+94771234569"
    }
];

const LeaveRequestsTable = () => {
    const [requests, setRequests] = useState(mockRequests);
    const [boardFilter, setBoardFilter] = useState("All");

    // Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Toast State for simulating SMS/Email
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleApprove = (id: string) => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "Approved" } : req));
    };

    const openRejectModal = (id: string) => {
        setRequestToReject(id);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = () => {
        if (!rejectReason.trim()) return;
        setRequests(prev => prev.map(req => req.id === requestToReject ? { ...req, status: "Rejected" } : req));
        setRejectModalOpen(false);
        setRequestToReject(null);
    };

    const handleShareStatus = (req: typeof mockRequests[0]) => {
        setToastMessage(`Status update sent to ${req.name} (${req.email} & ${req.phone})`);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const filteredRequests = requests.filter(req =>
        boardFilter === "All" || req.boardMeeting === boardFilter
    );


    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Recent Applications</h3>
                <div className="flex items-center gap-3">

                    <select
                        value={boardFilter}
                        onChange={(e) => setBoardFilter(e.target.value)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm outline-none focus:border-primary"
                    >
                        <option value="All">All Boards</option>
                        <option value="August 2024 Board">August 2024 Board</option>
                        <option value="September 2024 Board">September 2024 Board</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Employee Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Leave Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Start Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">End Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Duration</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredRequests.map((request, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                            {request.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{request.name}</p>
                                            <p className="text-xs text-gray-500">{request.boardMeeting}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600">{request.type}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">{request.startDate}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">{request.endDate}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">{request.duration}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-orange-100 text-orange-800'
                                        }`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {request.status === 'Pending Board Approval' ? (
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleApprove(request.id)} className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-all title='Approve'">
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => openRejectModal(request.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all title='Reject'">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleShareStatus(request)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-all">
                                            <Send className="w-3.5 h-3.5" /> Share
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Reject Application</h3>
                            <p className="text-sm text-gray-500 mt-1">Please provide a mandatory reason for this rejection.</p>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                                rows={4}
                                placeholder="State the reason for rejection..."
                            />
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={!rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg font-medium text-sm animate-in slide-in-from-bottom-5">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default LeaveRequestsTable;

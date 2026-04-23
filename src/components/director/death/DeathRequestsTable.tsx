"use client";

import React, { useState } from 'react';
import { X, Send, Eye } from 'lucide-react';

const mockRequests = [
    {
        id: "DTH-2024-002",
        name: "Nimali Silva",
        initials: "NS",
        dateOfDeath: "Oct 25, 2024",
        natureOfDeath: "Accident",
        requester: "Kasun Silva",
        status: "Pending Board Approval",
        boardMeeting: "November 2024 Board",
        email: "kasun@example.com",
        phone: "+94719876543",
        documents: {
            deathCertificate: "death_certificate_nimali.pdf",
            nomineeId: "id_kasun.pdf"
        }
    },
    {
        id: "DTH-2024-003",
        name: "Kamal Perera",
        initials: "KP",
        dateOfDeath: "Oct 20, 2024",
        natureOfDeath: "Natural",
        requester: "Sunil Perera",
        status: "Approved",
        boardMeeting: "November 2024 Board",
        email: "sunil@example.com",
        phone: "+94771234567",
        documents: {}
    }
];

const DeathRequestsTable = () => {
    const [requests, setRequests] = useState(mockRequests);
    const [boardFilter, setBoardFilter] = useState("All");

    // Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<typeof mockRequests[0] | null>(null);

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Toast State for simulating SMS/Email
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleApprove = (id: string) => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "Approved" } : req));
        setViewModalOpen(false);
        setToastMessage("Request approved successfully.");
        setTimeout(() => setToastMessage(null), 3000);
    };

    const openRejectModal = (id: string) => {
        setRequestToReject(id);
        setRejectReason("");
        setRejectModalOpen(true);
        setViewModalOpen(false);
    };

    const handleRejectSubmit = () => {
        if (!rejectReason.trim()) return;
        setRequests(prev => prev.map(req => req.id === requestToReject ? { ...req, status: "Rejected" } : req));
        setRejectModalOpen(false);
        setRequestToReject(null);
        setToastMessage("Request rejected.");
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleShareStatus = (req: typeof mockRequests[0]) => {
        setToastMessage(`Status update sent to ${req.requester} (${req.email} & ${req.phone})`);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const filteredRequests = requests.filter(req =>
        boardFilter === "All" || req.boardMeeting === boardFilter
    );

    const openViewModal = (req: typeof mockRequests[0]) => {
        setSelectedRequest(req);
        setViewModalOpen(true);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Submitted Applications</h3>
                <div className="flex items-center gap-3">
                    <select
                        value={boardFilter}
                        onChange={(e) => setBoardFilter(e.target.value)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm outline-none focus:border-primary"
                    >
                        <option value="All">All Boards</option>
                        <option value="November 2024 Board">November 2024 Board</option>
                        <option value="December 2024 Board">December 2024 Board</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Employee Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Date of Death</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Nature</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Requester</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredRequests.map((request, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                <td className="px-6 py-4" onClick={() => openViewModal(request)}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                            {request.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{request.name}</p>
                                            <p className="text-xs text-gray-500">{request.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500" onClick={() => openViewModal(request)}>{request.dateOfDeath}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500" onClick={() => openViewModal(request)}>{request.natureOfDeath}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500" onClick={() => openViewModal(request)}>{request.requester}</td>
                                <td className="px-6 py-4" onClick={() => openViewModal(request)}>
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
                                            <button onClick={() => openViewModal(request)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-all title='View Details'">
                                                <Eye className="w-5 h-5" />
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
                        {filteredRequests.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-500">
                                    No requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            {viewModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Death Benefit Verification</h3>
                                <p className="text-sm text-gray-500 mt-1">Review application details before taking action.</p>
                            </div>
                            <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Employee</p>
                                    <p className="font-bold text-gray-900 mt-1">{selectedRequest.name}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Date of Death</p>
                                    <p className="font-bold text-gray-900 mt-1">{selectedRequest.dateOfDeath}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Nature</p>
                                    <p className="font-bold text-gray-900 mt-1">{selectedRequest.natureOfDeath}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Requester (Beneficiary)</p>
                                    <p className="font-bold text-gray-900 mt-1">{selectedRequest.requester}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">Provided Documents</h4>
                                <ul className="space-y-2">
                                    {Object.entries(selectedRequest.documents).map(([key, value]) => (
                                        <li key={key} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
                                            <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                            <span className="text-sm font-medium text-gray-700">{value}</span>
                                            <button className="ml-auto text-blue-600 hover:text-blue-800 text-xs font-bold">
                                                Preview
                                            </button>
                                        </li>
                                    ))}
                                    {Object.keys(selectedRequest.documents).length === 0 && (
                                        <li className="text-sm text-gray-500">No documents attached.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                        {selectedRequest.status === 'Pending Board Approval' && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                                <button onClick={() => openRejectModal(selectedRequest.id)} className="px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-lg text-sm hover:bg-red-100 transition-colors">
                                    Reject Application
                                </button>
                                <button onClick={() => handleApprove(selectedRequest.id)} className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg text-sm hover:bg-green-700 transition-colors">
                                    Approve Verification
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Reject Application</h3>
                            <p className="text-sm text-gray-500 mt-1">Please provide a mandatory reason for this rejection.</p>
                        </div>
                        <div className="p-6">
                            <select
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 mb-4"
                            >
                                <option value="">Select a reason...</option>
                                <option value="Incomplete documents">Incomplete documents</option>
                                <option value="Information mismatch">Information mismatch</option>
                                <option value="Eligibility criteria not met">Eligibility criteria not met</option>
                                <option value="Other">Other</option>
                            </select>
                            {rejectReason === "Other" && (
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                                    rows={3}
                                    placeholder="Specify details..."
                                />
                            )}
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

export default DeathRequestsTable;

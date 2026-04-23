"use client";

import React, { useState } from 'react';
import { Filter, Check, X, Send, Eye } from 'lucide-react';

const mockRequests = [
    {
        id: "TRF-2024-006",
        employee: "Ruwanthi Perera",
        initials: "RP",
        currentDept: "Colombo Branch",
        targetDept: "Galle Branch",
        date: "2024-10-10",
        boardMeetingDate: "2024-11-01", // Past Date
        status: "Submitted to Director",
        email: "ruwanthi@example.com",
    },
    {
        id: "TRF-2024-007",
        employee: "Asela Gunaratne",
        initials: "AG",
        currentDept: "Jaffna Branch",
        targetDept: "Trincomalee Branch",
        date: "2024-10-09",
        boardMeetingDate: new Date().toISOString().split('T')[0], // Today
        status: "Submitted to Director",
        email: "asela@example.com",
    },
    {
        id: "TRF-2024-008",
        employee: "Chathurangi De Silva",
        initials: "CS",
        currentDept: "Kegalle Branch",
        targetDept: "Kandy Branch",
        date: "2024-10-11",
        boardMeetingDate: "2026-12-15", // Future Date
        status: "Submitted to Director",
        email: "chathurangi@example.com",
    },
    {
        id: "TRF-2024-011",
        employee: "Test User",
        initials: "TU",
        currentDept: "Kandy Branch",
        targetDept: "Colombo Branch",
        date: "2024-10-15",
        boardMeetingDate: "2024-10-25", // Past Date
        status: "Board Approved",
        email: "test@example.com",
    }
];

export default function TransferTable() {
    const [requests, setRequests] = useState(mockRequests);
    const [tabFilter, setTabFilter] = useState<"Today/Previous" | "Upcoming">("Today/Previous");

    // Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // View Modal State
    const [viewingRequest, setViewingRequest] = useState<typeof mockRequests[0] | null>(null);

    // Toast State for simulating SMS/Email
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const todayString = new Date().toISOString().split('T')[0];

    const handleApprove = (id: string, name: string, email: string) => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "Board Approved" } : req));
        setToastMessage(`Approval email sent to ${name} (${email})`);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const openRejectModal = (id: string) => {
        setRequestToReject(id);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = () => {
        if (!rejectReason.trim() || !requestToReject) return;
        const targetReq = requests.find(r => r.id === requestToReject);

        setRequests(prev => prev.map(req => req.id === requestToReject ? { ...req, status: "Board Rejected" } : req));
        if (targetReq) {
            setToastMessage(`Rejection email sent to ${targetReq.employee} (${targetReq.email})`);
        }

        setTimeout(() => setToastMessage(null), 4000);
        setRejectModalOpen(false);
        setRequestToReject(null);
    };


    const filteredRequests = requests.filter(req => {
        const isUpcoming = req.boardMeetingDate > todayString;
        return tabFilter === "Upcoming" ? isUpcoming : !isUpcoming;
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Board Transfer Reviews</h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setTabFilter("Today/Previous")}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${tabFilter === "Today/Previous" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Today / Previous
                    </button>
                    <button
                        onClick={() => setTabFilter("Upcoming")}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${tabFilter === "Upcoming" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Upcoming
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Employee</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Movement</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">HR Date</th>
                            <th className="px-6 py-4 font-semibold text-primary">Board Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                            {req.initials}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{req.employee}</p>
                                            <p className="text-xs text-gray-500">{req.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-700 text-xs">From: {req.currentDept}</p>
                                    <p className="font-medium text-blue-600 text-xs">To: {req.targetDept}</p>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{req.date}</td>
                                <td className="px-6 py-4 text-primary font-bold">
                                    {req.boardMeetingDate}
                                    {req.boardMeetingDate === todayString && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded animate-pulse">TODAY</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${req.status === 'Board Approved' ? 'bg-green-100 text-green-800' :
                                            req.status === 'Board Rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => setViewingRequest(req)}
                                            className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {req.status === 'Submitted to Director' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(req.id, req.employee, req.email)}
                                                    disabled={tabFilter === "Upcoming"}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${tabFilter === "Upcoming" ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                    title="Approve"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(req.id)}
                                                    disabled={tabFilter === "Upcoming"}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${tabFilter === "Upcoming" ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                    title="Reject"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredRequests.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-500">
                                    No requests available in this category.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            {viewingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Transfer Request Details</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{viewingRequest.id}</p>
                            </div>
                            <button onClick={() => setViewingRequest(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Employee</p><p className="font-semibold text-gray-900">{viewingRequest.employee}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Email</p><p className="font-semibold text-gray-900">{viewingRequest.email}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">From</p><p className="font-semibold text-gray-900">{viewingRequest.currentDept}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">To</p><p className="font-semibold text-blue-600">{viewingRequest.targetDept}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Request Date</p><p className="font-semibold text-gray-900">{viewingRequest.date}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Board Meeting Date</p><p className="font-semibold text-primary">{viewingRequest.boardMeetingDate}</p></div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setViewingRequest(null)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:hidden">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Reject Transfer Application</h3>
                            <p className="text-sm text-gray-500 mt-1">Please provide a mandatory reason for rejecting this transfer.</p>
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
                <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg font-medium text-sm animate-in slide-in-from-bottom-5 print:hidden">
                    <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-primary" />
                        {toastMessage}
                    </div>
                </div>
            )}

        </div>
    );
}

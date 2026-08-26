"use client";

import React, { useState } from 'react';
import { X, Send, Eye, Check } from 'lucide-react';
import { getHrmsSignedUrl } from '@/lib/supabaseClient';

const mockRequests = [
    {
        id: "RES-2024-003",
        name: "Malshan Jayarathne",
        initials: "MJ",
        designation: "UI/UX Designer",
        branch: "Galle Branch",
        resignationDate: "Oct 16, 2024",
        lastWorkingDate: "Nov 16, 2024",
        reason: "Illness",
        status: "Pending Board Approval",
        boardMeetingDate: new Date().toISOString().split('T')[0], // Today
        email: "malshan@example.com",
        phone: "+94719876543",
        documents: {
            resignationLetter: "resignation_malshan.pdf",
            handoverChecklist: "checklist_malshan.pdf"
        }
    },
    {
        id: "RES-2024-004",
        name: "Kumari Silva",
        initials: "KS",
        designation: "HR Executive",
        branch: "Colombo HQ",
        resignationDate: "Oct 20, 2024",
        lastWorkingDate: "Nov 20, 2024",
        reason: "Higher Studies",
        status: "Pending Board Approval",
        boardMeetingDate: "2026-12-01", // Future Date
        email: "kumari@example.com",
        phone: "+94771234567",
        documents: {
            resignationLetter: "resignation_kumari.pdf"
        }
    }
];


    const handleDownload = async (path: string) => {
        if (!path.includes('/')) {
            alert('File not available (legacy format)');
            return;
        }
        const url = await getHrmsSignedUrl(path);
        if (url) {
            window.open(url, '_blank');
        } else {
            alert('Failed to get download URL');
        }
    };

const ResignationRequestsTable = () => {
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
        const req = requests.find(r => r.id === id);
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "Approved" } : req));
        setViewModalOpen(false);
        setToastMessage(`successfully approved and email sent!`);
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
        setToastMessage(`application rejected !`);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleShareStatus = (req: typeof mockRequests[0]) => {
        setToastMessage(`successfully approved and email sent!`);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const availableDates = Array.from(new Set(requests.map(r => r.boardMeetingDate)));

    const filteredRequests = requests.filter(req =>
        boardFilter === "All" || req.boardMeetingDate === boardFilter
    );

    const openViewModal = (req: typeof mockRequests[0]) => {
        setSelectedRequest(req);
        setViewModalOpen(true);
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('year');
    const [statusFilter, setStatusFilter] = useState('All');

    const isActionable = (dateString?: string) => {
        if (!dateString) return true;
        try {
            const dateStr = new Date(dateString).toISOString().split('T')[0];
            return dateStr <= todayStr;
        } catch (e) {
            return true;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Submitted Resignations</h3>
                <div className="flex items-center gap-3">
                    <select
                        value={boardFilter}
                        onChange={(e) => setBoardFilter(e.target.value)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors shadow-sm outline-none focus:border-[#8B3A00] cursor-pointer"
                    >
                        <option value="All" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">All Board Dates</option>
                        {availableDates.map(date => (
                            <option key={date} value={date} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{date}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Employee Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Designation</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Resignation Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Board Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {filteredRequests.map((request, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer">
                                <td className="px-6 py-4" onClick={() => openViewModal(request)}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#8B3A00]/10 text-[#8B3A00] flex items-center justify-center text-xs font-bold">
                                            {request.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{request.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">{request.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-slate-400" onClick={() => openViewModal(request)}>{request.designation}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-slate-400" onClick={() => openViewModal(request)}>{request.resignationDate}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-slate-400" onClick={() => openViewModal(request)}>
                                    <span className={isActionable(request.boardMeetingDate) ? 'text-gray-500 dark:text-slate-400' : 'text-amber-600 dark:text-amber-400 font-semibold'}>
                                        {request.boardMeetingDate}
                                    </span>
                                </td>
                                <td className="px-6 py-4" onClick={() => openViewModal(request)}>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'Approved' ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400' :
                                        request.status === 'Rejected' ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400' :
                                            'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400'
                                        }`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => openViewModal(request)}
                                            className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {request.status === 'Pending Board Approval' && isActionable(request.boardMeetingDate) && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    className="w-8 h-8 rounded-md bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
                                                    title="Approve"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(request.id)}
                                                    className="w-8 h-8 rounded-md bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
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
                                <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-slate-400">
                                    No requests found for this board meeting date.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            {viewModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resignation Verification</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Review application details before taking action.</p>
                            </div>
                            <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            {!isActionable(selectedRequest.boardMeetingDate) && selectedRequest.status === 'Pending Board Approval' && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 rounded-lg flex gap-3 text-amber-800 dark:text-amber-300">
                                    <span className="material-symbols-outlined">warning</span>
                                    <div>
                                        <p className="font-bold text-sm">Action Disabled</p>
                                        <p className="text-xs mt-1">This request is scheduled for a future board meeting ({selectedRequest.boardMeetingDate}). You can only approve or reject requests scheduled for today or in the past.</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Employee</p>
                                    <p className="font-bold text-gray-900 dark:text-white mt-1">{selectedRequest.name}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Designation & Branch</p>
                                    <p className="font-bold text-gray-900 dark:text-white mt-1">{selectedRequest.designation} - {selectedRequest.branch}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Resignation Date</p>
                                    <p className="font-bold text-gray-900 dark:text-white mt-1">{selectedRequest.resignationDate}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Last Working Date</p>
                                    <p className="font-bold text-gray-900 dark:text-white mt-1">{selectedRequest.lastWorkingDate}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">Provided Documents</h4>
                                <ul className="space-y-2">
                                    {Object.entries(selectedRequest.documents).map(([key, value]) => (
                                        <li key={key} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                                            <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{value}</span>
                                            <button className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-bold">
                                                Preview
                                            </button>
                                        </li>
                                    ))}
                                    {Object.keys(selectedRequest.documents).length === 0 && (
                                        <li className="text-sm text-gray-500 dark:text-slate-400">No documents attached.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                        {selectedRequest.status === 'Pending Board Approval' && (
                            <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 shrink-0 transition-colors">
                                <button 
                                    onClick={() => openRejectModal(selectedRequest.id)} 
                                    disabled={!isActionable(selectedRequest.boardMeetingDate)}
                                    className="px-6 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Reject Application
                                </button>
                                <button 
                                    onClick={() => handleApprove(selectedRequest.id)} 
                                    disabled={!isActionable(selectedRequest.boardMeetingDate)}
                                    className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
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
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reject Application</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Please provide a mandatory reason for this rejection.</p>
                        </div>
                        <div className="p-6">
                            <select
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-3 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 mb-4 cursor-pointer"
                            >
                                <option value="" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Select a reason...</option>
                                <option value="Incomplete documents" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Incomplete documents</option>
                                <option value="Handover pending" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Handover pending</option>
                                <option value="Notice period not served" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Notice period not served</option>
                                <option value="Other" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Other</option>
                            </select>
                            {rejectReason === "Other" && (
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-3 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
                                    rows={3}
                                    placeholder="Specify details..."
                                />
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 transition-colors">
                            <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={!rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="font-medium">{toastMessage}</p>
                </div>
            )}
        </div>
    );
};

export default ResignationRequestsTable;

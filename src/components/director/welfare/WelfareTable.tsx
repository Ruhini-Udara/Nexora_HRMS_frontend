"use client";

import React, { useState } from 'react';
import { Check, X, Eye, Filter, Send } from 'lucide-react';

type WelfareStatus = 'Pending' | 'Approved' | 'Rejected';

interface WelfareRequest {
    id: number; employee: string; email: string; role: string; initials: string;
    type: string; date: string; amount: string; status: WelfareStatus;
}

const MOCK: WelfareRequest[] = [
    { id: 1, employee: "John Doe", email: "john.doe@example.com", role: "Senior UX Designer", initials: "JD", type: "Financial Aid", date: "12 Oct 2023", amount: "$500.00", status: "Pending" },
    { id: 2, employee: "Jane Smith", email: "jane.smith@example.com", role: "Marketing Lead", initials: "JS", type: "Medical Assistance", date: "10 Oct 2023", amount: "$1,200.00", status: "Approved" },
    { id: 3, employee: "Robert Brown", email: "robert.brown@example.com", role: "Systems Engineer", initials: "RB", type: "Education Support", date: "08 Oct 2023", amount: "$2,500.00", status: "Rejected" },
    { id: 4, employee: "Emily Davis", email: "emily.davis@example.com", role: "Project Director", initials: "ED", type: "Financial Aid", date: "05 Oct 2023", amount: "$300.00", status: "Pending" },
    { id: 5, employee: "Michael Wilson", email: "michael.wilson@example.com", role: "Content Strategist", initials: "MW", type: "Medical Assistance", date: "01 Oct 2023", amount: "$850.00", status: "Approved" },
];

export default function WelfareTable() {
    const [requests, setRequests] = useState<WelfareRequest[]>(MOCK);
    const [viewingRequest, setViewingRequest] = useState<WelfareRequest | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 4000); };

    const handleApprove = (id: number) => {
        const req = requests.find(r => r.id === id);
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
        showToast(`Approval email sent to ${req?.employee} (${req?.email})`);
    };

    const openRejectModal = (id: number) => { setRequestToReject(id); setRejectReason(''); setRejectModalOpen(true); };

    const handleRejectSubmit = () => {
        if (!rejectReason.trim() || requestToReject === null) return;
        const req = requests.find(r => r.id === requestToReject);
        setRequests(prev => prev.map(r => r.id === requestToReject ? { ...r, status: 'Rejected' } : r));
        showToast(`Rejection email sent to ${req?.employee} (${req?.email})`);
        setRejectModalOpen(false); setRequestToReject(null);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Active Requests</h3>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    <Filter className="w-[18px] h-[18px]" /> Filter
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Employee Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Welfare Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Application Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Amount</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{req.initials}</div>
                                        <div><p className="text-sm font-medium text-gray-900">{req.employee}</p><p className="text-xs text-gray-500">{req.role}</p></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{req.type}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">{req.date}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{req.amount}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>{req.status}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => setViewingRequest(req)} className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                                        {req.status === 'Pending' && (<>
                                            <button onClick={() => handleApprove(req.id)} className="w-8 h-8 rounded-md bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors" title="Approve"><Check className="w-4 h-4" /></button>
                                            <button onClick={() => openRejectModal(req.id)} className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors" title="Reject"><X className="w-4 h-4" /></button>
                                        </>)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {viewingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div><h3 className="text-lg font-bold text-gray-900">Welfare Request Details</h3><p className="text-sm text-gray-500">Request #{viewingRequest.id}</p></div>
                            <button onClick={() => setViewingRequest(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Employee</p><p className="font-semibold text-gray-900">{viewingRequest.employee}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Email</p><p className="font-semibold text-gray-900">{viewingRequest.email}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Role</p><p className="font-semibold text-gray-900">{viewingRequest.role}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Welfare Type</p><p className="font-semibold text-gray-900">{viewingRequest.type}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Amount</p><p className="font-semibold text-gray-900">{viewingRequest.amount}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Date</p><p className="font-semibold text-gray-900">{viewingRequest.date}</p></div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end"><button onClick={() => setViewingRequest(null)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer">Close</button></div>
                    </div>
                </div>
            )}

            {rejectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-900">Reject Welfare Request</h3><p className="text-sm text-gray-500 mt-1">Provide a reason. The employee will be notified by email.</p></div>
                        <div className="p-6"><textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none" rows={4} placeholder="State the reason for rejection..." autoFocus /></div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors cursor-pointer">Cancel</button>
                            <button onClick={handleRejectSubmit} disabled={!rejectReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Confirm Rejection</button>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-[70] bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2">
                    <Send className="w-4 h-4 text-green-400" />{toastMessage}
                </div>
            )}
        </div>
    );
}

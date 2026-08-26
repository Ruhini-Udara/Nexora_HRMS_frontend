"use client";

import React, { useState } from 'react';
import { Check, X, Eye, Filter, Send } from 'lucide-react';

type DeathStatus = 'Pending' | 'Approved' | 'Rejected';

interface DeathApplication {
    id: number; employee: string; empId: string; email: string;
    deceasedRelation: string; incidentDate: string; applicationDate: string;
    status: DeathStatus; documentUrl: string;
}

const MOCK: DeathApplication[] = [
    { id: 1, employee: "John Doe", empId: "EMP-8821", email: "john.doe@example.com", deceasedRelation: "Spouse", incidentDate: "Oct 12, 2023", applicationDate: "Oct 14, 2023", status: "Pending", documentUrl: "#" },
    { id: 2, employee: "Jane Smith", empId: "EMP-9204", email: "jane.smith@example.com", deceasedRelation: "Father", incidentDate: "Oct 05, 2023", applicationDate: "Oct 08, 2023", status: "Approved", documentUrl: "#" },
    { id: 3, employee: "Robert Brown", empId: "EMP-4412", email: "robert.brown@example.com", deceasedRelation: "Mother", incidentDate: "Sep 28, 2023", applicationDate: "Sep 30, 2023", status: "Approved", documentUrl: "#" },
    { id: 4, employee: "Emily Davis", empId: "EMP-3351", email: "emily.davis@example.com", deceasedRelation: "Child", incidentDate: "Sep 20, 2023", applicationDate: "Sep 22, 2023", status: "Pending", documentUrl: "#" },
];

export default function DeathTable() {
    const [applications, setApplications] = useState<DeathApplication[]>(MOCK);
    const [viewingApp, setViewingApp] = useState<DeathApplication | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [appToReject, setAppToReject] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 4000); };

    const handleApprove = (id: number) => {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
        showToast(`successfully approved and email sent!`);
    };

    const openRejectModal = (id: number) => { setAppToReject(id); setRejectReason(''); setRejectModalOpen(true); };

    const handleRejectSubmit = () => {
        if (!rejectReason.trim() || appToReject === null) return;
        setApplications(prev => prev.map(a => a.id === appToReject ? { ...a, status: 'Rejected' } : a));
        showToast(`application rejected !`);
        setRejectModalOpen(false); setAppToReject(null);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Recent Applications</h3>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    <Filter className="w-[18px] h-[18px]" /> Filter
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Employee Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Deceased Relation</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Incident Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Application Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {applications.map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{app.employee.split(' ').map(n => n[0]).join('')}</div>
                                        <div><p className="text-sm font-medium text-gray-900">{app.employee}</p><p className="text-xs text-gray-500">{app.empId}</p></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{app.deceasedRelation}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{app.incidentDate}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{app.applicationDate}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>{app.status}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => setViewingApp(app)} className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                                        {app.status === 'Pending' && (<>
                                            <button onClick={() => handleApprove(app.id)} className="w-8 h-8 rounded-md bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors" title="Approve"><Check className="w-4 h-4" /></button>
                                            <button onClick={() => openRejectModal(app.id)} className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors" title="Reject"><X className="w-4 h-4" /></button>
                                        </>)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">Showing {applications.length} results</p>
            </div>

            {viewingApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div><h3 className="text-lg font-bold text-gray-900">Death Benefit Application</h3><p className="text-sm text-gray-500">{viewingApp.empId}</p></div>
                            <button onClick={() => setViewingApp(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Employee</p><p className="font-semibold text-gray-900">{viewingApp.employee}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Email</p><p className="font-semibold text-gray-900">{viewingApp.email}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Deceased Relation</p><p className="font-semibold text-gray-900">{viewingApp.deceasedRelation}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Status</p><p className="font-semibold text-gray-900">{viewingApp.status}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Incident Date</p><p className="font-semibold text-gray-900">{viewingApp.incidentDate}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Application Date</p><p className="font-semibold text-gray-900">{viewingApp.applicationDate}</p></div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end"><button onClick={() => setViewingApp(null)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer">Close</button></div>
                    </div>
                </div>
            )}

            {rejectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-900">Reject Application</h3><p className="text-sm text-gray-500 mt-1">Provide a reason. The employee will be notified by email.</p></div>
                        <div className="p-6"><textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none" rows={4} placeholder="State the reason for rejection..." autoFocus /></div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors cursor-pointer">Cancel</button>
                            <button onClick={handleRejectSubmit} disabled={!rejectReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Confirm Rejection</button>
                        </div>
                    </div>
                </div>
            )}

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
}

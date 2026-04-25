"use client";

import React, { useState, useMemo } from 'react';
import { Check, X, Eye, MonitorPlay, Mails, Send } from 'lucide-react';

export type DirTermRequest = {
    id: string;
    employeeName: string;
    email: string;
    branch: string;
    type: string;
    reason: string;
    initiationDate: string;
    effectiveDate: string;
    boardMeetingDate: string;
    specialRemark?: string;
    status: 'BOARD_ASSIGNED' | 'APPROVED' | 'REJECTED';
    rejectReason?: string;
};

const mockData: DirTermRequest[] = [
    {
        id: 'TRM-2024-001',
        employeeName: 'John Doe',
        email: 'john.doe@example.com',
        branch: 'Colombo',
        type: 'Involuntary',
        reason: 'Poor performance over 3 quarters.',
        initiationDate: '2024-10-15',
        effectiveDate: '2024-11-01',
        boardMeetingDate: '2024-11-10',
        status: 'APPROVED'
    },
    {
        id: 'TRM-2024-002',
        employeeName: 'Sunil Silva',
        email: 'sunil.silva@example.com',
        branch: 'Kandy',
        type: 'Voluntary',
        reason: 'Career change',
        initiationDate: '2024-11-05',
        effectiveDate: '2024-12-01',
        boardMeetingDate: '2024-11-20',
        specialRemark: 'Employee requested an expedited settlement for the loan clearance due to urgent departure.',
        status: 'BOARD_ASSIGNED'
    },
    {
        id: 'TRM-2024-003',
        employeeName: 'Amal Perera',
        email: 'amal.perera@example.com',
        branch: 'Galle',
        type: 'Voluntary',
        reason: 'Relocating abroad',
        initiationDate: '2024-11-06',
        effectiveDate: '2024-12-15',
        boardMeetingDate: '2024-11-20',
        status: 'BOARD_ASSIGNED'
    },
    {
        id: 'TRM-2024-004',
        employeeName: 'Nuwan Fernando',
        email: 'nuwan.fernando@example.com',
        branch: 'Matara',
        type: 'Involuntary',
        reason: 'Policy violation',
        initiationDate: '2024-11-10',
        effectiveDate: '2024-11-12',
        boardMeetingDate: '2024-12-15',
        status: 'BOARD_ASSIGNED'
    }
];

export default function TerminationTable() {
    const [requests, setRequests] = useState<DirTermRequest[]>(mockData);
    const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current');
    
    // View Modal State
    const [viewingRequest, setViewingRequest] = useState<DirTermRequest | null>(null);
    
    // Reject Modal State
    const [rejectingRequest, setRejectingRequest] = useState<DirTermRequest | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    
    // Notification states
    const [hrNotified, setHrNotified] = useState(false);
    const [financeNotified, setFinanceNotified] = useState(false);
    const [employeesNotified, setEmployeesNotified] = useState(false);

    const [selectedDate, setSelectedDate] = useState('2024-11-20');

    // Toast State
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 4000); };

    // Filter Logic based on tabs
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            if (activeTab === 'current') return req.boardMeetingDate === selectedDate;
            if (activeTab === 'upcoming') {
                // For mock purposes, using '2024-11-20' as the "current today" pivot
                return req.boardMeetingDate > '2024-11-20';
            }
            if (activeTab === 'past') {
                return req.boardMeetingDate < '2024-11-20';
            }
            return true;
        });
    }, [requests, activeTab, selectedDate]);

    const isCurrentListFullyDecided = filteredRequests.length > 0 && filteredRequests.every(r => r.status !== 'BOARD_ASSIGNED');

    const handleApprove = (id: string) => {
        const req = requests.find(r => r.id === id);
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
        showToast(`✅ Approved — email sent to ${req?.employeeName} (${req?.email})`);
    };

    const handleConfirmReject = () => {
        if (!rejectingRequest || !rejectReason.trim()) return;
        setRequests(prev => prev.map(r => r.id === rejectingRequest.id ? { ...r, status: 'REJECTED', rejectReason } : r));
        showToast(`❌ Rejected — email sent to ${rejectingRequest.employeeName} (${rejectingRequest.email})`);
        setRejectingRequest(null);
        setRejectReason('');
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'APPROVED': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Approved</span>;
            case 'REJECTED': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Rejected</span>;
            default: return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">Pending Review</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-2">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveTab('current')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'current' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Meeting View
                    </button>
                    <button 
                        onClick={() => setActiveTab('upcoming')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Upcoming Meetings
                    </button>
                    <button 
                        onClick={() => setActiveTab('past')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Past Meetings
                    </button>
                </div>

                {activeTab === 'current' && (
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm mr-2 mb-2 sm:mb-0">
                        <label className="text-xs font-bold text-gray-500 uppercase">Meeting Date:</label>
                        <input 
                            type="date" 
                            className="bg-transparent text-sm font-medium text-gray-900 focus:outline-none cursor-pointer"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Request ID</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Branch</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredRequests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{req.id}</td>
                                    <td className="px-6 py-4 text-gray-700">{req.employeeName}</td>
                                    <td className="px-6 py-4 text-gray-600">{req.branch}</td>
                                    <td className="px-6 py-4 text-gray-600">{req.type}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => setViewingRequest(req)}
                                                className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {req.status === 'BOARD_ASSIGNED' && activeTab === 'current' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApprove(req.id)}
                                                        className="w-8 h-8 rounded-md bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setRejectingRequest(req)}
                                                        className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">No termination requests found for this meeting date.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Finalization Communications Panel */}
            {activeTab === 'current' && isCurrentListFullyDecided && (
                <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-xl p-8 shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                            <Mails className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Finalize Board Decisions</h3>
                            <p className="text-gray-600 mt-1 max-w-2xl">
                                All requests for the current board meeting have been reviewed. Dispatch the official summary emails to HR and Finance. (Employees have already been notified individually upon approval).
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                        <button 
                            onClick={() => { setHrNotified(true); showToast('✅ Summary email sent to HR Team'); }}
                            disabled={hrNotified}
                            className={`p-4 rounded-lg border text-left transition-colors flex flex-col justify-center gap-2 ${hrNotified ? 'bg-green-50 border-green-200 cursor-not-allowed text-green-800' : 'bg-white border-blue-200 hover:bg-white hover:border-blue-400 hover:shadow-md cursor-pointer'}`}
                        >
                            <span className="font-bold">{hrNotified ? '✓ Sent to HR' : 'Notify HR Team'}</span>
                            <span className="text-xs opacity-80">Summary of all approved &amp; rejected requests.</span>
                        </button>

                        <button 
                            onClick={() => { setFinanceNotified(true); showToast('✅ Summary email sent to Finance'); }}
                            disabled={financeNotified}
                            className={`p-4 rounded-lg border text-left transition-colors flex flex-col justify-center gap-2 ${financeNotified ? 'bg-green-50 border-green-200 cursor-not-allowed text-green-800' : 'bg-white border-blue-200 hover:bg-white hover:border-blue-400 hover:shadow-md cursor-pointer'}`}
                        >
                            <span className="font-bold">{financeNotified ? '✓ Sent to Finance' : 'Notify Finance'}</span>
                            <span className="text-xs opacity-80">Roster of finalized approved terminations.</span>
                        </button>
                    </div>
                </div>
            )}


            {/* View Details Modal */}
            {viewingRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Termination Request</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{viewingRequest.id} · View-only</p>
                            </div>
                            <button onClick={() => setViewingRequest(null)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg"><span className="block text-xs font-bold text-gray-500 uppercase mb-1">Employee</span><p className="font-medium text-gray-900">{viewingRequest.employeeName}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><span className="block text-xs font-bold text-gray-500 uppercase mb-1">Branch</span><p className="font-medium text-gray-900">{viewingRequest.branch}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><span className="block text-xs font-bold text-gray-500 uppercase mb-1">Termination Type</span><p className="font-medium text-gray-900">{viewingRequest.type}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><span className="block text-xs font-bold text-gray-500 uppercase mb-1">Board Meeting Date</span><p className="font-medium text-primary">{viewingRequest.boardMeetingDate}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><span className="block text-xs font-bold text-gray-500 uppercase mb-1">Initiated</span><p className="font-medium text-gray-900">{viewingRequest.initiationDate}</p></div>
                                <div className="p-3 bg-red-50 rounded-lg"><span className="block text-xs font-bold text-red-500 uppercase mb-1">Effective Date</span><p className="font-medium text-red-700">{viewingRequest.effectiveDate}</p></div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="block text-xs font-bold text-gray-500 uppercase mb-2">Reason for Termination</span>
                                <p className="text-gray-800 text-sm">{viewingRequest.reason}</p>
                            </div>
                            {viewingRequest.specialRemark && (
                                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <span className="block text-xs font-bold text-orange-700 uppercase mb-2">HR Special Remarks</span>
                                    <p className="text-orange-900 text-sm">{viewingRequest.specialRemark}</p>
                                </div>
                            )}
                            {viewingRequest.rejectReason && (
                                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                    <span className="block text-xs font-bold text-red-700 uppercase mb-2">Rejection Reason</span>
                                    <p className="text-red-900 text-sm">{viewingRequest.rejectReason}</p>
                                </div>
                            )}
                            <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase mb-2">Attached Documents</span>
                                <div className="flex gap-3">
                                    <a href="#" className="flex-1 border border-gray-200 rounded-lg p-3 hover:bg-gray-50 hover:border-blue-200 transition-all group flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Request Formulation.pdf</span>
                                        <MonitorPlay className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                                    </a>
                                    <a href="#" className="flex-1 border border-gray-200 rounded-lg p-3 hover:bg-gray-50 hover:border-blue-200 transition-all group flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Clearance Letter.pdf</span>
                                        <MonitorPlay className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setViewingRequest(null)} className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors cursor-pointer">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectingRequest && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><X className="w-5 h-5" /></span>
                                Reject Request
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">Please provide a reason or constructive feedback for rejecting <span className="font-bold text-gray-900">{rejectingRequest.employeeName}&apos;s</span> termination request.</p>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                                <textarea 
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-28"
                                    placeholder="Brief explanation for the HR team..."
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                            <button onClick={() => { setRejectingRequest(null); setRejectReason(''); }} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                            <button 
                                onClick={handleConfirmReject} 
                                disabled={!rejectReason.trim()}
                                className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-[70] bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2">
                    <Send className="w-4 h-4 text-green-400" />
                    {toastMessage}
                </div>
            )}
        </div>
    );
}

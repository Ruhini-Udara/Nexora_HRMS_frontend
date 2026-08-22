"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Eye, Check } from 'lucide-react';
import { 
    getAllDeathRequests, 
    updateDeathStatus, 
    rejectDeathRequest,
    DeathRequest 
} from '@/lib/api/deathRequests';

const DeathRequestsTable = () => {
    const [requests, setRequests] = useState<DeathRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current');
    
    // Get today's date formatted as YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);

    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllDeathRequests();
            
            // Show only those submitted to director or already approved/rejected by director
            const filtered = data.filter(r => 
                r.status === "SUBMITTED_TO_DIRECTOR" || 
                r.status === "APPROVED" || 
                r.status === "REJECTED"
            );
            setRequests(filtered);
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    // Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<DeathRequest | null>(null);

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Toast State for simulating SMS/Email
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        try {
            await updateDeathStatus(id, "APPROVED");
            await loadRequests();
            setViewModalOpen(false);
            setToastMessage(`✅ Application Approved successfully`);
            setTimeout(() => setToastMessage(null), 4000);
        } catch (error) {
            console.error("Failed to approve", error);
        }
    };

    const openRejectModal = (id: string) => {
        setRequestToReject(id);
        setRejectReason("");
        setRejectModalOpen(true);
        setViewModalOpen(false);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim() || !requestToReject) return;
        try {
            await rejectDeathRequest(requestToReject, rejectReason);
            await loadRequests();
            setRejectModalOpen(false);
            setRequestToReject(null);
            setToastMessage(`❌ Application Rejected`);
            setTimeout(() => setToastMessage(null), 4000);
        } catch (error) {
            console.error("Failed to reject", error);
        }
    };

    const normalizeDate = (d?: string) => {
        if (!d) return "";
        try {
            const dateObj = new Date(d);
            if (isNaN(dateObj.getTime())) return d;
            return dateObj.toISOString().split('T')[0];
        } catch(e) {
            return d;
        }
    };

    const getDropdownOptions = () => {
        if (activeTab === 'current') return [todayStr];
        const allDates = Array.from(new Set(requests.map(r => normalizeDate(r.boardMeetingDate)).filter(Boolean))).sort();
        if (activeTab === 'upcoming') return allDates.filter(d => d > todayStr);
        return allDates.filter(d => d < todayStr);
    };

    const handleTabChange = (tab: 'current' | 'upcoming' | 'past') => {
        setActiveTab(tab);
        setSelectedDate(tab === 'current' ? todayStr : 'All');
    };

    const filteredRequests = React.useMemo(() => {
        return requests.filter(req => {
            const pivotDate = todayStr;
            const reqDate = normalizeDate(req.boardMeetingDate);
            if (activeTab === 'current') return reqDate === selectedDate;
            if (activeTab === 'upcoming') {
                if (selectedDate === 'All') return reqDate > pivotDate;
                return reqDate === selectedDate;
            }
            if (activeTab === 'past') {
                if (selectedDate === 'All') return reqDate < pivotDate;
                return reqDate === selectedDate;
            }
            return true;
        });
    }, [requests, activeTab, selectedDate, todayStr]);

    const openViewModal = (req: DeathRequest) => {
        setSelectedRequest(req);
        setViewModalOpen(true);
    };

    const isActionable = (dateString?: string) => {
        if (!dateString) return false;
        try {
            const dateStr = new Date(dateString).toISOString().split('T')[0];
            return dateStr === todayStr;
        } catch (e) {
            return false;
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-slate-800 pb-2">
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleTabChange('current')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'current' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        Meeting View
                    </button>
                    <button 
                        onClick={() => handleTabChange('upcoming')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        Upcoming Meetings
                    </button>
                    <button 
                        onClick={() => handleTabChange('past')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        Past Meetings
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm mr-2 mb-2 sm:mb-0">
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Meeting Date:</label>
                    <select 
                        className="bg-transparent text-sm font-medium text-gray-900 dark:text-slate-200 focus:outline-none cursor-pointer"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                    >
                        {activeTab !== 'current' && <option value="All" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">All Dates</option>}
                        {getDropdownOptions().map(d => (
                            <option key={d} value={d} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">Request ID</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">Employee Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">Date of Death</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">Nature</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">Requester</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
                            {filteredRequests.map((request, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        DTH-{request.id}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-slate-300">
                                        {request.employeeName}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{request.dateOfDeath}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{request.natureOfDeath}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{request.requesterName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400' :
                                            request.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400' :
                                                'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400'
                                            }`}>
                                            {request.status === 'APPROVED' ? 'Approved' : request.status === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openViewModal(request)} className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {request.status === 'SUBMITTED_TO_DIRECTOR' && isActionable(request.boardMeetingDate) && (
                                                <>
                                                    <button onClick={() => request.id && handleApprove(String(request.id))} className="w-8 h-8 rounded-md bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors cursor-pointer" title="Approve">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => request.id && openRejectModal(String(request.id))} className="w-8 h-8 rounded-md bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer" title="Reject">
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
                                    <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-slate-400">
                                        No requests found for this selection.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Details Modal — Read-only popup */}
            {viewModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Death Benefit Application</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{selectedRequest.id} · View-only</p>
                            </div>
                            <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Employee Name</p><p className="font-semibold text-gray-900 dark:text-white">{selectedRequest.employeeName}</p></div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Date of Death</p><p className="font-semibold text-gray-900 dark:text-white">{selectedRequest.dateOfDeath}</p></div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Nature of Death</p><p className="font-semibold text-gray-900 dark:text-white">{selectedRequest.natureOfDeath}</p></div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Requester / Beneficiary</p><p className="font-semibold text-gray-900 dark:text-white">{selectedRequest.requesterName}</p></div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Contact Email</p><p className="font-semibold text-gray-900 dark:text-white">N/A</p></div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Contact Phone</p><p className="font-semibold text-gray-900 dark:text-white">{selectedRequest.contactNumber}</p></div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Board Meeting</p><p className="font-semibold text-primary">{selectedRequest.boardMeetingDate}</p></div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedRequest.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400' : selectedRequest.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400' : 'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400'}`}>{selectedRequest.status === 'APPROVED' ? 'Approved' : selectedRequest.status === 'REJECTED' ? 'Rejected' : 'Pending Review'}</span>
                                </div>
                            </div>
                            {Object.keys(selectedRequest.documents).length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Provided Documents</p>
                                    <div className="space-y-2">
                                        {Object.entries(selectedRequest.documents).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                                <span className="material-symbols-outlined text-red-500 text-lg">picture_as_pdf</span>
                                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300 flex-1">{value}</span>
                                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-bold cursor-pointer">Preview</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-end transition-colors">
                            <button onClick={() => setViewModalOpen(false)} className="px-5 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">Close</button>
                        </div>
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
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm text-gray-700 dark:text-slate-200 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 mb-4 cursor-pointer"
                            >
                                <option value="" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Select a reason...</option>
                                <option value="Incomplete documents" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Incomplete documents</option>
                                <option value="Information mismatch" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Information mismatch</option>
                                <option value="Eligibility criteria not met" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Eligibility criteria not met</option>
                                <option value="Other" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Other</option>
                            </select>
                            {rejectReason === "Other" && (
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm text-gray-700 dark:text-slate-200 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
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
                <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg font-medium text-sm animate-in slide-in-from-bottom-5">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default DeathRequestsTable;

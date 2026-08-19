import React, { useState, useEffect, useCallback } from 'react';
import { Filter, Check, X, Send, Eye } from 'lucide-react';
import { 
    getAllTransferRequests, 
    updateTransferStatus, 
    TransferRequest 
} from '@/lib/api/transferRequests';

export default function TransferTable() {
    const [requests, setRequests] = useState<TransferRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current');
    
    // Get today's date formatted as YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);

    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllTransferRequests();
            
            // Filter: Only show "legit" requests (real employees, not mock/hardcoded data)
            const isLegit = (req: TransferRequest) => {
                return (req.employeeName || "").trim().length > 0 && 
                       (req.epfNumber || "").trim().length > 0 && 
                       req.epfNumber !== '0' &&
                       !req.employeeName.toLowerCase().includes("test") &&
                       !req.employeeName.toLowerCase().includes("kasun");
            };

            // Show only those submitted to director or already approved/rejected by director
            const filtered = data.filter(r => 
                isLegit(r) && (
                    String(r.status) === "SUBMITTED_TO_DIRECTOR" || 
                    String(r.status) === "APPROVED" || 
                    String(r.status) === "REJECTED"
                )
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
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // View Modal State
    const [viewingRequest, setViewingRequest] = useState<TransferRequest | null>(null);

    // Toast State for simulating SMS/Email
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const todayString = new Date().toISOString().split('T')[0];

    const handleApprove = async (id: string) => {
        try {
            await updateTransferStatus(id, "APPROVED");
            await loadRequests();
            setToastMessage(`Transfer application approved successfully`);
            setTimeout(() => setToastMessage(null), 4000);
        } catch (error) {
            console.error("Failed to approve", error);
        }
    };

    const availableBoardDates = Array.from(new Set(requests.map(r => r.boardMeetingDate))).filter(d => d).sort();

    const openRejectModal = (id: string) => {
        setRequestToReject(id);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim() || !requestToReject) return;
        try {
            await updateTransferStatus(requestToReject, "REJECTED", rejectReason);
            await loadRequests();
            setToastMessage(`Transfer application rejected`);
            setTimeout(() => setToastMessage(null), 4000);
            setRejectModalOpen(false);
            setRequestToReject(null);
        } catch (error) {
            console.error("Failed to reject", error);
        }
    };

    const getDropdownOptions = () => {
        if (activeTab === 'current') return [todayStr];
        const allDates = Array.from(new Set(requests.map(r => r.boardMeetingDate).filter(Boolean))).sort() as string[];
        if (activeTab === 'upcoming') return allDates.filter(d => d > todayStr);
        return allDates.filter(d => d < todayStr);
    };

    const handleTabChange = (tab: 'current' | 'upcoming' | 'past') => {
        setActiveTab(tab);
        setSelectedDate(tab === 'current' ? todayStr : 'All');
    };

    const filteredRequests = React.useMemo(() => {
        return requests.filter(req => {
            if (!req.boardMeetingDate) return false;
            const pivotDate = todayStr;
            if (activeTab === 'current') return req.boardMeetingDate === selectedDate;
            if (activeTab === 'upcoming') {
                if (selectedDate === 'All') return req.boardMeetingDate > pivotDate;
                return req.boardMeetingDate === selectedDate;
            }
            if (activeTab === 'past') {
                if (selectedDate === 'All') return req.boardMeetingDate < pivotDate;
                return req.boardMeetingDate === selectedDate;
            }
            return true;
        });
    }, [requests, activeTab, selectedDate, todayStr]);

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-2">
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleTabChange('current')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'current' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Meeting View
                    </button>
                    <button 
                        onClick={() => handleTabChange('upcoming')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Upcoming Meetings
                    </button>
                    <button 
                        onClick={() => handleTabChange('past')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Past Meetings
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm mr-2 mb-2 sm:mb-0">
                    <label className="text-xs font-bold text-gray-500 uppercase">Meeting Date:</label>
                    <select 
                        className="bg-transparent text-sm font-medium text-gray-900 focus:outline-none cursor-pointer"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                    >
                        {activeTab !== 'current' && <option value="All">All Dates</option>}
                        {getDropdownOptions().map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                                            {req.employeeName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{req.employeeName}</p>
                                            <p className="text-xs text-gray-500">{req.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-700 text-xs">From: {req.currentBranch}</p>
                                    <p className="font-medium text-blue-600 text-xs">To: {req.targetBranch}</p>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{req.requestDate}</td>
                                <td className="px-6 py-4 text-primary font-bold">
                                    {req.boardMeetingDate}
                                    {req.boardMeetingDate === todayStr && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded animate-pulse">TODAY</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${String(req.status) === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            String(req.status) === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'}`}>
                                        {String(req.status).replace(/_/g, ' ')}
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
                                        {String(req.status) === 'SUBMITTED_TO_DIRECTOR' && isActionable(req.boardMeetingDate) && (
                                            <>
                                                <button
                                                    onClick={() => req.id && handleApprove(req.id!)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-green-50 text-green-600 hover:bg-green-100"
                                                    title="Approve"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => req.id && openRejectModal(req.id!)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-red-50 text-red-600 hover:bg-red-100"
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
                                    No requests available for this selection.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
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
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Employee</p><p className="font-semibold text-gray-900">{viewingRequest.employeeName}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">EPF Number</p><p className="font-semibold text-gray-900">{viewingRequest.epfNumber}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">From</p><p className="font-semibold text-gray-900">{viewingRequest.currentBranch}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">To</p><p className="font-semibold text-blue-600">{viewingRequest.targetBranch}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Request Date</p><p className="font-semibold text-gray-900">{viewingRequest.requestDate}</p></div>
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

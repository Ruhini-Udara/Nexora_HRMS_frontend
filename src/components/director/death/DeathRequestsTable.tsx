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
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('year');
    const [statusFilter, setStatusFilter] = useState('All');

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
            setToastMessage(`application approved successfully !`);
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
            setToastMessage(`application rejected !`);
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

    const timeFilteredRequests = React.useMemo(() => {
        return requests.filter(req => {
            const reqBoardDate = req.boardMeetingDate;
            if (!reqBoardDate) return false;
            const statusUpper = String(req.status).toUpperCase();
            if (statusUpper === 'SUBMITTED' || statusUpper === 'DRAFT' || statusUpper === 'NEW' || statusUpper === 'PENDING_HR') return false;

            let matchesTab = true;
            if (activeTab === 'current') {
                matchesTab = reqBoardDate === selectedDate;
            } else if (activeTab === 'upcoming') {
                if (selectedDate === 'All') matchesTab = reqBoardDate > todayStr;
                else matchesTab = reqBoardDate === selectedDate;
            } else if (activeTab === 'past') {
                if (selectedDate === 'All') matchesTab = reqBoardDate < todayStr;
                else matchesTab = reqBoardDate === selectedDate;
            }
            if (!matchesTab) return false;

            let matchesTime = true;
            if (req.createdAt || req.dateOfDeath) {
                const reqDate = new Date(req.createdAt || req.dateOfDeath);
                if (!isNaN(reqDate.getTime())) {
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const reqDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate());
                    
                    if (timeFilter === 'today') {
                        matchesTime = reqDay.getTime() === today.getTime();
                    } else if (timeFilter === 'week') {
                        const lastWeek = new Date(today);
                        lastWeek.setDate(lastWeek.getDate() - 6);
                        matchesTime = reqDay >= lastWeek && reqDay <= today;
                    } else if (timeFilter === 'month') {
                        matchesTime = reqDay.getMonth() === today.getMonth() && reqDay.getFullYear() === today.getFullYear();
                    } else if (timeFilter === 'year') {
                        matchesTime = reqDay.getFullYear() === today.getFullYear();
                    }
                }
            }
            return matchesTime;
        });
    }, [requests, activeTab, selectedDate, todayStr, timeFilter]);

    const filteredRequests = React.useMemo(() => {
        return timeFilteredRequests.filter(req => {
            if (statusFilter !== 'All' && String(req.status) !== statusFilter) return false;
            return true;
        });
    }, [timeFilteredRequests, statusFilter]);

    const openViewModal = (req: DeathRequest) => {
        setSelectedRequest(req);
        setViewModalOpen(true);
    };

    const isActionable = (dateString?: string) => {
        if (!dateString) return true;
        try {
            const dateStr = new Date(dateString).toISOString().split('T')[0];
            return dateStr <= todayStr;
        } catch (e) {
            return true;
        }
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <span className="px-3 py-1 bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400 rounded-full text-xs font-bold">Approved</span>;
            case 'REJECTED': return <span className="px-3 py-1 bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 rounded-full text-xs font-bold">Rejected</span>;
            default: return <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 rounded-full text-xs font-bold">Pending Review</span>;
        }
    };

    const statsTags = [
        { label: "Total Requests", status: "All", icon: "description", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", ring: "ring-blue-500" },
        { label: "Pending", status: "SUBMITTED_TO_DIRECTOR", icon: "schedule", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", ring: "ring-yellow-500" },
        { label: "Approved", status: "APPROVED", icon: "check_circle", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", ring: "ring-green-500" },
        { label: "Rejected", status: "REJECTED", icon: "cancel", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", ring: "ring-red-500" },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Time Filter Dropdown */}
            <div className="flex justify-end mb-4">
                <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as any)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm text-sm font-bold"
                >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>
            </div>

            {/* Interactive Stats Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsTags.map(({ label, status, icon, color, bg, ring }) => {
                    const statCount = timeFilteredRequests.filter(r => status === 'All' || String(r.status) === status).length;

                    return (
                        <div 
                            key={status} 
                            onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
                            className={`rounded-xl p-4 ${bg} border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] ${statusFilter === status ? `ring-2 ${ring}` : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
                                <span className="text-gray-600 dark:text-slate-300 font-bold text-sm">{label}</span>
                            </div>
                            <span className={`text-2xl font-black ${color}`}>{statCount}</span>
                        </div>
                    );
                })}
            </div>
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

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Request ID</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Employee</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Details</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">HR Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Board Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">DTH-{req.id}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{req.employeeName}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                                        <p className="font-medium text-gray-700 dark:text-slate-300 text-xs">Nature: {req.natureOfDeath}</p>
                                        <p className="font-medium text-blue-600 dark:text-blue-400 text-xs">Req: {req.requesterName}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{req.createdAt ? new Date(req.createdAt).toISOString().split('T')[0] : req.dateOfDeath}</td>
                                    <td className="px-6 py-4 text-primary font-bold">{req.boardMeetingDate}</td>
                                    <td className="px-6 py-4 text-center">
                                        {renderStatusBadge(String(req.status))}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openViewModal(req)} 
                                                className="p-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors" 
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {req.status === 'SUBMITTED_TO_DIRECTOR' && isActionable(req.boardMeetingDate) && (
                                                <>
                                                    <button 
                                                        onClick={() => req.id && handleApprove(String(req.id))} 
                                                        className="p-1.5 text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-md transition-colors" 
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => req.id && openRejectModal(String(req.id))} 
                                                        className="p-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors" 
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
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                                        No requests available for this selection.
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

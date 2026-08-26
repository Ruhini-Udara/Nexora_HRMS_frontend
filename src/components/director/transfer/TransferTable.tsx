"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Eye, Send, MonitorPlay } from 'lucide-react';
import { getHrmsSignedUrl } from '@/lib/supabaseClient';
import { getAllTransferRequests, updateTransferStatus, TransferRequest } from '@/lib/api/transferRequests';
export default function TransferTable() {
    const [requests, setRequests] = useState<TransferRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current');
    
    // Filters
    const getTodayStr = () => new Date().toISOString().split('T')[0];

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
        </label>
        <input
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm  text-slate-900 font-bold dark:text-white"
            readOnly
            value={value || ""}
        />
    </div>
);

const ReadOnlyTextarea = ({ label, value, rows = 3 }: { label: string; value: string; rows?: number }) => (
    <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
        </label>
        <textarea
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm  resize-none text-slate-900 font-bold dark:text-white"
            readOnly
            rows={rows}
            value={value || ""}
        />
    </div>
);
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('year');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllTransferRequests();
            
            const isLegit = (req: TransferRequest) => {
                return (req.employeeName || "").trim().length > 0 && 
                       (req.epfNumber || "").trim().length > 0 && 
                       req.epfNumber !== '0' &&
                       !req.employeeName.toLowerCase().includes("test") &&
                       !req.employeeName.toLowerCase().includes("kasun");
            };

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

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [viewingRequest, setViewingRequest] = useState<TransferRequest | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        try {
            await updateTransferStatus(id, "APPROVED");
            await loadRequests();
            setToastMessage("application approved successfully !");
            setTimeout(() => setToastMessage(null), 4000);
        } catch (error) {
            console.error("Failed to approve", error);
        }
    };

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
            setToastMessage("application rejected !");
            setTimeout(() => setToastMessage(null), 4000);
            setRejectModalOpen(false);
            setRequestToReject(null);
        } catch (error) {
            console.error("Failed to reject", error);
        }
    };

    
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
            if (req.requestDate) {
                const reqDate = new Date(req.requestDate);
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

    const isActionable = (dateString?: string) => {
        if (!dateString) return true;
        try {
            const dateStr = new Date(dateString).toISOString().split('T')[0];
            return dateStr <= todayStr;
        } catch (e) {
            return true;
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
            {toastMessage && (
                <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="font-medium">{toastMessage}</p>
                </div>
            )}

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
                        className="bg-transparent text-sm  focus:outline-none cursor-pointer text-slate-900 font-bold dark:text-white"
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
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Employee</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Movement</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">HR Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Board Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                                {req.employeeName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{req.employeeName}</p>
                                                <p className="text-xs text-gray-500 dark:text-slate-400">{req.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-700 dark:text-slate-300 text-xs">From: {req.currentBranch}</p>
                                        <p className="font-medium text-blue-600 dark:text-blue-400 text-xs">To: {req.targetBranch}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{req.requestDate}</td>
                                    <td className="px-6 py-4 text-primary font-bold">
                                        {req.boardMeetingDate}
                                        {req.boardMeetingDate === todayStr && (
                                            <span className="ml-2 text-[10px] bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded animate-pulse">
                                                TODAY
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const st = String(req.status).toUpperCase();
                                            if (st === 'APPROVED' || st === 'BOARD APPROVED') {
                                                return (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400">
                                                        Approved
                                                    </span>
                                                );
                                            }
                                            if (st === 'REJECTED' || st === 'BOARD REJECTED') {
                                                return (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
                                                        Rejected
                                                    </span>
                                                );
                                            }
                                            return (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                                                    Pending Review
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => setViewingRequest(req)}
                                                className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {String(req.status) === 'SUBMITTED_TO_DIRECTOR' && isActionable(req.boardMeetingDate) && (
                                                <>
                                                    <button
                                                        onClick={() => req.id && handleApprove(String(req.id))}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 cursor-pointer"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => req.id && openRejectModal(String(req.id))}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer"
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-full transition-colors relative">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-2xl">swap_horiz</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">View Transfer Request</h3>
                                    <p className="text-sm text-slate-500">Request ID: {viewingRequest.id} · {viewingRequest.employeeName}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewingRequest(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <ReadOnlyField label="Current Designation" value={viewingRequest.designation || ""} />
                                <ReadOnlyField label="Current Location" value={viewingRequest.currentBranch} />
                                <ReadOnlyField label="Target Location" value={viewingRequest.targetBranch} />
                                <ReadOnlyField label="Expected Date" value={viewingRequest.expectedDate || ""} />
                            </div>

                            <ReadOnlyTextarea label="Reason for Transfer" value={viewingRequest.reason} />

                            {/* Document Cards */}
                            {viewingRequest.documents && viewingRequest.documents.length > 0 && (
                                <div className="space-y-4">
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Required Documents
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {viewingRequest.documents.map((doc, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10 p-5 transition-all"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-900/30">
                                                        <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400">check_circle</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{doc.label || doc.filename}</p>
                                                            <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded uppercase">Uploaded</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{doc.filename}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDownload(doc.filename)}
                                                                className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                                                title="Download Document"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">download</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {viewingRequest.hrRemark && (
                                <ReadOnlyTextarea label="HR Remarks" value={viewingRequest.hrRemark} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:hidden">
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reject Transfer Application</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Please provide a mandatory reason for rejecting this transfer.</p>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-lg p-3 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
                                rows={4}
                                placeholder="State the reason for rejection..."
                            />
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

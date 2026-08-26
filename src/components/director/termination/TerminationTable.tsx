"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Eye, MonitorPlay, Mails, Send } from 'lucide-react';
import { getHrmsSignedUrl } from '@/lib/supabaseClient';
import { TerminationRequestForm } from '@/components/hr/employees/TerminationRequestForm';

export type DirTermRequest = {
    id: string;
    employeeName: string;
    epfNumber?: string;
    email?: string;
    branch: string;
    type: string;
    reason: string;
    initiationDate: string;
    effectiveDate: string;
    boardMeetingDate?: string;
    specialRemark?: string;
    status: string;
    rejectReason?: string;
    documents?: {
        request_for_termination?: string;
        loan_clearance_letter?: string;
        other_document?: string;
    };
    hrRemark?: string;
};

const getTodayStr = () => new Date().toISOString().split('T')[0];

const loadDirectorTerminations = (): DirTermRequest[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("termination_requests");
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed.filter((r: any) => 
                    r.status === 'SUBMITTED_TO_DIRECTOR' || 
                    r.status === 'PENDING_BOARD_APPROVAL' || 
                    r.status === 'BOARD_ASSIGNED' ||
                    r.status === 'APPROVED' || 
                    r.status === 'REJECTED'
                ).map((r: any) => ({
                    ...r,
                    boardMeetingDate: r.boardMeetingDate || getTodayStr(),
                    email: r.email || `${r.employeeName ? r.employeeName.toLowerCase().replace(/\s+/g, '.') : 'employee'}@example.com`
                }));
            }
        } catch (e) {
            console.error(e);
        }
    }
    return [];
};

export default function TerminationTable() {
    const todayStr = getTodayStr();
    const [requests, setRequests] = useState<DirTermRequest[]>([]);
    const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current');
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('year');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    // View Modal State
    const [viewingRequest, setViewingRequest] = useState<DirTermRequest | null>(null);
    
    // Reject Modal State
    const [rejectingRequest, setRejectingRequest] = useState<DirTermRequest | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    
    // Notification states
    const [hrNotified, setHrNotified] = useState(false);
    const [financeNotified, setFinanceNotified] = useState(false);

    // Toast State
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 4000); };

    useEffect(() => {
        setRequests(loadDirectorTerminations());
    }, []);

    const handleDownload = async (path: string) => {
        if (!path || !path.includes('/')) {
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

    const isPending = (status: string) => {
        return status === 'SUBMITTED_TO_DIRECTOR' || status === 'PENDING_BOARD_APPROVAL' || status === 'BOARD_ASSIGNED';
    };

    const getDropdownOptions = () => {
        if (activeTab === 'current') return [todayStr];
        const allDates = Array.from(new Set(requests.map(r => r.boardMeetingDate).filter(Boolean) as string[])).sort();
        if (activeTab === 'upcoming') return allDates.filter(d => d > todayStr);
        return allDates.filter(d => d < todayStr);
    };

    const handleTabChange = (tab: 'current' | 'upcoming' | 'past') => {
        setActiveTab(tab);
        setSelectedDate(tab === 'current' ? todayStr : 'All');
    };

    // Filter Logic based on tabs
    const timeFilteredRequests = useMemo(() => {
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
            const dateToCheck = req.initiationDate || reqBoardDate;
            if (dateToCheck) {
                const reqDate = new Date(dateToCheck);
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

    const filteredRequests = useMemo(() => {
        return timeFilteredRequests.filter(req => {
            if (statusFilter === 'All') return true;
            if (statusFilter === 'PENDING') return isPending(req.status);
            return req.status === statusFilter;
        });
    }, [timeFilteredRequests, statusFilter]);

    const isCurrentListFullyDecided = filteredRequests.length > 0 && filteredRequests.every(r => !isPending(r.status));

    const saveToLocalStorage = (updatedRequests: DirTermRequest[]) => {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem("termination_requests");
        if (stored) {
            try {
                const all = JSON.parse(stored);
                const updatedAll = all.map((item: any) => {
                    const found = updatedRequests.find(u => u.id === item.id);
                    return found ? { ...item, ...found } : item;
                });
                localStorage.setItem("termination_requests", JSON.stringify(updatedAll));
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleApprove = (id: string) => {
        const req = requests.find(r => r.id === id);
        const updated = requests.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r);
        setRequests(updated);
        saveToLocalStorage(updated);
        showToast(`application approved successfully !`);
    };

    const handleConfirmReject = () => {
        if (!rejectingRequest || !rejectReason.trim()) return;
        const id = rejectingRequest.id;
        const updated = requests.map(r => r.id === id ? { ...r, status: 'REJECTED', rejectReason, hrRemark: rejectReason } : r);
        setRequests(updated);
        saveToLocalStorage(updated);
        showToast(`application rejected !`);
        setRejectingRequest(null);
        setRejectReason('');
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'APPROVED': return <span className="px-3 py-1 bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400 rounded-full text-xs font-bold">Approved</span>;
            case 'REJECTED': return <span className="px-3 py-1 bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 rounded-full text-xs font-bold">Rejected</span>;
            default: return <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 rounded-full text-xs font-bold">Pending Review</span>;
        }
    };

    const statsTags = [
        { label: "Total Requests", status: "All", icon: "description", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", ring: "ring-blue-500" },
        { label: "Pending", status: "PENDING", icon: "schedule", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", ring: "ring-yellow-500" },
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
                    const statCount = timeFilteredRequests.filter(r => {
                        if (status === 'All') return true;
                        if (status === 'PENDING') return isPending(r.status);
                        return String(r.status) === status;
                    }).length;

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

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">Request ID</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">Branch</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
                            {filteredRequests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{req.id}</td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-slate-200 font-medium">{req.employeeName}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{req.branch}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{req.type}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => setViewingRequest(req)}
                                                className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {isPending(req.status) && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApprove(req.id)}
                                                        className="w-8 h-8 rounded-md bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setRejectingRequest(req)}
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 italic">No termination requests found for this meeting date.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Finalization Communications Panel */}
            {activeTab === 'current' && isCurrentListFullyDecided && (
                <div className="mt-8 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-8 shadow-sm transition-colors">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                            <Mails className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Finalize Board Decisions</h3>
                            <p className="text-gray-600 dark:text-slate-400 mt-1 max-w-2xl">
                                All requests for the current board meeting have been reviewed. Dispatch the official summary emails to HR and Finance. (Employees have already been notified individually upon approval).
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                        <button 
                            onClick={() => { setHrNotified(true); showToast('✅ Summary email sent to HR Team'); }}
                            disabled={hrNotified}
                            className={`p-4 rounded-lg border text-left transition-colors flex flex-col justify-center gap-2 ${hrNotified ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/40 cursor-not-allowed text-green-800 dark:text-green-300' : 'bg-white dark:bg-slate-900 border-blue-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400 hover:shadow-md cursor-pointer'}`}
                        >
                            <span className="font-bold">{hrNotified ? '✓ Sent to HR' : 'Notify HR Team'}</span>
                            <span className="text-xs opacity-80">Summary of all approved &amp; rejected requests.</span>
                        </button>

                        <button 
                            onClick={() => { setFinanceNotified(true); showToast('✅ Summary email sent to Finance'); }}
                            disabled={financeNotified}
                            className={`p-4 rounded-lg border text-left transition-colors flex flex-col justify-center gap-2 ${financeNotified ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/40 cursor-not-allowed text-green-800 dark:text-green-300' : 'bg-white dark:bg-slate-900 border-blue-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400 hover:shadow-md cursor-pointer'}`}
                        >
                            <span className="font-bold">{financeNotified ? '✓ Sent to Finance' : 'Notify Finance'}</span>
                            <span className="text-xs opacity-80">Roster of finalized approved terminations.</span>
                        </button>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {viewingRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-full transition-colors relative">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                    <span className="material-symbols-outlined text-2xl">person_remove</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Termination Request</h3>
                                    <p className="text-sm text-slate-500">Request ID: {viewingRequest.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewingRequest(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-2 overflow-y-auto flex-1">
                            <TerminationRequestForm 
                                initialData={viewingRequest as any}
                                isReadOnly={true}
                                hideFooter={false}
                                onSave={() => {}}
                                onCancel={() => setViewingRequest(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectingRequest && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center"><X className="w-5 h-5" /></span>
                                Reject Request
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600 dark:text-slate-300">Please provide a reason or constructive feedback for rejecting <span className="font-bold text-gray-900 dark:text-white">{rejectingRequest.employeeName}&apos;s</span> termination request.</p>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                                <textarea 
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-28 transition-colors"
                                    placeholder="Brief explanation for the HR team..."
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800 transition-colors">
                            <button onClick={() => { setRejectingRequest(null); setRejectReason(''); }} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer">Cancel</button>
                            <button 
                                onClick={handleConfirmReject} 
                                disabled={!rejectReason.trim()}
                                className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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

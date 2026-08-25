"use client";

import React, { useState } from 'react';
import { Check, X, Eye, Filter, Send } from 'lucide-react';

type WelfareStatus = 'Pending' | 'Approved' | 'Rejected';

interface WelfareRequest {
    id: number; employee: string; email: string; role: string; initials: string;
    type: string; date: string; amount: string; status: WelfareStatus;
    createdAt?: string; boardMeetingDate?: string;
}

const MOCK: WelfareRequest[] = [
    { id: 1, employee: "John Doe", email: "john.doe@example.com", role: "Senior UX Designer", initials: "JD", type: "Financial Aid", date: "12 Oct 2023", amount: "$500.00", status: "Pending", createdAt: "2023-10-12", boardMeetingDate: "2023-10-15" },
    { id: 2, employee: "Jane Smith", email: "jane.smith@example.com", role: "Marketing Lead", initials: "JS", type: "Medical Assistance", date: "10 Oct 2023", amount: "$1,200.00", status: "Approved", createdAt: "2023-10-10", boardMeetingDate: "2023-10-15" },
    { id: 3, employee: "Robert Brown", email: "robert.brown@example.com", role: "Systems Engineer", initials: "RB", type: "Education Support", date: "08 Oct 2023", amount: "$2,500.00", status: "Rejected", createdAt: "2023-10-08", boardMeetingDate: "2023-10-15" },
    { id: 4, employee: "Emily Davis", email: "emily.davis@example.com", role: "Project Director", initials: "ED", type: "Financial Aid", date: "05 Oct 2023", amount: "$300.00", status: "Pending", createdAt: "2023-10-05", boardMeetingDate: "2023-10-15" },
    { id: 5, employee: "Michael Wilson", email: "michael.wilson@example.com", role: "Content Strategist", initials: "MW", type: "Medical Assistance", date: "01 Oct 2023", amount: "$850.00", status: "Approved", createdAt: "2023-10-01", boardMeetingDate: "2023-10-15" },
];

const normalizeDate = (d?: string) => d || "";

export default function WelfareTable() {
    const [requests, setRequests] = useState<WelfareRequest[]>(MOCK);
    const [viewingRequest, setViewingRequest] = useState<WelfareRequest | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current');
    const todayStr = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('year');
    const [statusFilter, setStatusFilter] = useState('All');

    const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 4000); };

    const handleApprove = (id: number) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
        showToast(`application approved successfully !`);
    };

    const openRejectModal = (id: number) => { setRequestToReject(id); setRejectReason(''); setRejectModalOpen(true); };

    const handleRejectSubmit = () => {
        if (!rejectReason.trim() || requestToReject === null) return;
        setRequests(prev => prev.map(r => r.id === requestToReject ? { ...r, status: 'Rejected' } : r));
        showToast(`application rejected !`);
        setRejectModalOpen(false); setRequestToReject(null);
    };

    const timeFilteredRequests = React.useMemo(() => {
        return requests.filter(req => {
            const pivotDate = todayStr;
            const reqDate = normalizeDate(req.boardMeetingDate);
            if (!reqDate) return false;
            const statusUpper = String(req.status).toUpperCase();
            if (statusUpper === 'SUBMITTED' || statusUpper === 'DRAFT' || statusUpper === 'NEW' || statusUpper === 'PENDING_HR') return false;

            let matchesTab = true;
            if (activeTab === 'current') matchesTab = reqDate === selectedDate;
            else if (activeTab === 'upcoming') {
                if (selectedDate === 'All') matchesTab = reqDate > pivotDate;
                else matchesTab = reqDate === selectedDate;
            }
            else if (activeTab === 'past') {
                if (selectedDate === 'All') matchesTab = reqDate < pivotDate;
                else matchesTab = reqDate === selectedDate;
            }
            if (!matchesTab) return false;

            let matchesTime = true;
            if (req.createdAt) {
                const reqCreationDate = new Date(req.createdAt);
                if (!isNaN(reqCreationDate.getTime())) {
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const reqDay = new Date(reqCreationDate.getFullYear(), reqCreationDate.getMonth(), reqCreationDate.getDate());
                    
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

        const statsTags = [
        { label: "Total Requests", status: "All", icon: "description", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", ring: "ring-blue-500" },
        { label: "Pending", status: "Pending", icon: "schedule", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", ring: "ring-yellow-500" },
        { label: "Approved", status: "Approved", icon: "check_circle", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", ring: "ring-green-500" },
        { label: "Rejected", status: "Rejected", icon: "cancel", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", ring: "ring-red-500" },
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
                        onClick={() => setActiveTab('current')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'current' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        Meeting View
                    </button>
                    <button 
                        onClick={() => setActiveTab('upcoming')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        Upcoming Meetings
                    </button>
                    <button 
                        onClick={() => setActiveTab('past')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                    >
                        Past Meetings
                    </button>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    {/* Date Selector for Meeting View */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-[16px] text-gray-500 dark:text-slate-400">calendar_month</span>
                        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                            Meeting Date:
                        </span>
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                        >
                            <option value="All">All Dates</option>
                            <option value={todayStr}>{todayStr} (Today)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Employee Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Welfare Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Application Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Amount</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {filteredRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{req.initials}</div>
                                        <div><p className="text-sm font-medium text-gray-900 dark:text-white">{req.employee}</p><p className="text-xs text-gray-500 dark:text-slate-400">{req.role}</p></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">{req.type}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-slate-400">{req.date}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{req.amount}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'Approved' ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400' : req.status === 'Rejected' ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400' : 'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400'}`}>{req.status}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => setViewingRequest(req)} className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer" title="View Details"><Eye className="w-4 h-4" /></button>
                                        {req.status === 'Pending' && (<>
                                            <button onClick={() => handleApprove(req.id)} className="w-8 h-8 rounded-md bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors cursor-pointer" title="Approve"><Check className="w-4 h-4" /></button>
                                            <button onClick={() => openRejectModal(req.id)} className="w-8 h-8 rounded-md bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer" title="Reject"><X className="w-4 h-4" /></button>
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
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Welfare Request Details</h3><p className="text-sm text-gray-500 dark:text-slate-400">Request #{viewingRequest.id}</p></div>
                            <button onClick={() => setViewingRequest(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Employee</p><p className="font-semibold text-gray-900 dark:text-white">{viewingRequest.employee}</p></div>
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Email</p><p className="font-semibold text-gray-900 dark:text-white">{viewingRequest.email}</p></div>
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Role</p><p className="font-semibold text-gray-900 dark:text-white">{viewingRequest.role}</p></div>
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Welfare Type</p><p className="font-semibold text-gray-900 dark:text-white">{viewingRequest.type}</p></div>
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Amount</p><p className="font-semibold text-gray-900 dark:text-white">{viewingRequest.amount}</p></div>
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg"><p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Date</p><p className="font-semibold text-gray-900 dark:text-white">{viewingRequest.date}</p></div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-end transition-colors"><button onClick={() => setViewingRequest(null)} className="px-5 py-2 text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white cursor-pointer">Close</button></div>
                    </div>
                </div>
            )}

            {rejectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800"><h3 className="text-lg font-bold text-gray-900 dark:text-white">Reject Welfare Request</h3><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Provide a reason. The employee will be notified by email.</p></div>
                        <div className="p-6"><textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-3 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none transition-colors" rows={4} placeholder="State the reason for rejection..." autoFocus /></div>
                        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 transition-colors">
                            <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">Cancel</button>
                            <button onClick={handleRejectSubmit} disabled={!rejectReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">Confirm Rejection</button>
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

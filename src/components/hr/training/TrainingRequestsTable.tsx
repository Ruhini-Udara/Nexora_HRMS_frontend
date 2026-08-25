"use client";

import React, { useState, useEffect, useMemo } from 'react';
import TrainingEventCard from "@/components/hr/training/TrainingEventCard";
import TrainingRequestDetailsModal from "@/components/hr/training/TrainingRequestDetailsModal";
import ApprovedTrainingListModal from "@/components/hr/training/ApprovedTrainingListModal";
import { TrainingRequest } from '@/types/training';
import api from '@/lib/axiosInstance';
import { formatTime } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

// Props describing a training event
type TrainingEvent = {
    id: number;
    title: string;
    proposedStartDate?: string;
    date?: string;
    time?: string;
    category: string;
    status: string;
    expectedParticipants?: number;
    reason?: string;
    approvedBy?: string;
    approvedAt?: string;
};

export default function TrainingRequestsTable() {
    const [events, setEvents] = useState<TrainingEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedStatus, setSelectedStatus] = useState<string>("Not Sent");
    const [requests, setRequests] = useState<TrainingRequest[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [processingIds, setProcessingIds] = useState<number[]>([]);
    const [selectedRequestIds, setSelectedRequestIds] = useState<number[]>([]);
    const [isBulkRejectionModalOpen, setIsBulkRejectionModalOpen] = useState(false);
    const [bulkRejectionReason, setBulkRejectionReason] = useState("");
    const [activeTab, setActiveTab] = useState<'manage' | 'action_required'>('manage');

    // Pagination for Events
    const [currentPageEvents, setCurrentPageEvents] = useState(1);
    const eventsPerPage = 6;

    // Pagination for Requests
    const [currentPageRequests, setCurrentPageRequests] = useState(1);
    const requestsPerPage = 10;

    const { user } = useAuthStore();

    // Fetch events on mount
    useEffect(() => {
        let isMounted = true;
        api.get('/api/training/events')
            .then(res => {
                if (isMounted) {
                    const sorted = res.data.sort((a: TrainingEvent, b: TrainingEvent) => b.id - a.id);
                    setEvents(sorted);
                }
            })
            .catch(err => {
                if (isMounted) {
                    console.error("Failed to fetch events", err);
                    setToast({ message: "Failed to load training events.", type: 'error' });
                }
            });
        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch requests when event selected
    useEffect(() => {
        let isMounted = true;
        if (selectedEventId) {
            api.get(`/api/training/events/${selectedEventId}/requests`)
                .then(res => {
                    if (isMounted) {
                        setRequests(res.data);
                        setCurrentPageRequests(1); // Reset requests page when event changes
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        console.error("Failed to fetch requests");
                        setToast({ message: "Failed to load requests for this event.", type: 'error' });
                    }
                });
        }
        return () => {
            isMounted = false;
        };
    }, [selectedEventId]);

    // Clear selection when filters or event change
    useEffect(() => {
        setSelectedRequestIds([]);
    }, [selectedEventId, selectedCategory, selectedStatus]);

    // Request details modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);

    // Approved list modal state
    const [isListModalOpen, setIsListModalOpen] = useState(false);

    // Rejection Modal State
    const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean, requestId: number | null }>({ isOpen: false, requestId: null });
    const [rejectionReason, setRejectionReason] = useState("");

    // Filter events by category and status
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
            const isSent = e.status === 'Pending Admin Approval' || e.status === 'Approved' || e.status === 'Rejected' || e.approvedBy;
            const isReturned = e.status === 'Returned';

            const matchesStatus = selectedStatus === "All" ||
                (selectedStatus === "Sent" && isSent) ||
                (selectedStatus === "Not Sent" && (!isSent || isReturned));
            return matchesCategory && matchesStatus;
        });
    }, [events, selectedCategory, selectedStatus]);

    // Event Pagination Logic
    const totalPagesEvents = Math.ceil(filteredEvents.length / eventsPerPage);
    const indexOfLastEvent = currentPageEvents * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

    // Handle auto-selection when filters change
    useEffect(() => {
        const currentSelEvent = events.find(e => e.id === selectedEventId);
        const isReturnedOrRejected = currentSelEvent && (currentSelEvent.status === 'Returned' || currentSelEvent.status === 'Rejected');

        if (isReturnedOrRejected) {
            // Do not override selection if a returned/rejected event is currently selected
            return;
        }

        if (filteredEvents.length > 0) {
            const isCurrentlyVisible = filteredEvents.some(e => e.id === selectedEventId);
            if (!selectedEventId || !isCurrentlyVisible) {
                const firstVisibleId = filteredEvents[0].id;
                if (selectedEventId !== firstVisibleId) {
                    Promise.resolve().then(() => {
                        setSelectedEventId(firstVisibleId);
                    });
                }
            }
        } else {
            if (selectedEventId !== null) {
                Promise.resolve().then(() => {
                    setSelectedEventId(null);
                    setRequests([]);
                });
            }
        }
    }, [filteredEvents, selectedEventId, events]);

    // Filter requests by event ID
    const filteredRequests = useMemo(() => {
        return selectedEventId
            ? requests.filter(req => req.eventId === selectedEventId)
            : [];
    }, [selectedEventId, requests]);

    const pendingRequests = useMemo(() => {
        return filteredRequests.filter(r => r.status === 'Pending');
    }, [filteredRequests]);

    const actionRequiredCount = useMemo(() => {
        return events.filter(evt => evt.status === 'Returned' || evt.status === 'Rejected').length;
    }, [events]);

    const areAllPendingSelected = pendingRequests.length > 0 && pendingRequests.every(r => selectedRequestIds.includes(r.id));

    const toggleSelectAll = () => {
        if (areAllPendingSelected) {
            setSelectedRequestIds([]);
        } else {
            setSelectedRequestIds(pendingRequests.map(r => r.id));
        }
    };

    const toggleSelectRequest = (id: number) => {
        setSelectedRequestIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkApprove = async () => {
        if (selectedRequestIds.length === 0) return;
        const idsToProcess = [...selectedRequestIds];
        setProcessingIds(prev => [...prev, ...idsToProcess]);

        try {
            await Promise.all(idsToProcess.map(id =>
                api.put(`/api/training/requests/${id}/status`, {
                    status: 'Approved',
                    approverId: user?.id
                })
            ));
            setRequests(prev => prev.map(r =>
                idsToProcess.includes(r.id) ? { ...r, status: "Approved" } : r
            ));
            setToast({ message: `Successfully approved ${idsToProcess.length} request(s)!`, type: 'success' });
            setSelectedRequestIds([]);
        } catch (err) {
            console.error("Failed to approve requests in bulk", err);
            setToast({ message: "Failed to approve some request(s). Please try again.", type: 'error' });
        } finally {
            setProcessingIds(prev => prev.filter(id => !idsToProcess.includes(id)));
        }
    };

    const handleBulkReject = async () => {
        if (selectedRequestIds.length === 0) return;
        const idsToProcess = [...selectedRequestIds];
        setProcessingIds(prev => [...prev, ...idsToProcess]);

        try {
            await Promise.all(idsToProcess.map(id =>
                api.put(`/api/training/requests/${id}/status`, {
                    status: 'Rejected',
                    rejectionReason: bulkRejectionReason,
                    approverId: user?.id
                })
            ));
            setRequests(prev => prev.map(r =>
                idsToProcess.includes(r.id) ? { ...r, status: "Rejected", rejectionReason: bulkRejectionReason } : r
            ));
            setToast({ message: `Successfully rejected ${idsToProcess.length} request(s).`, type: 'info' });
            setIsBulkRejectionModalOpen(false);
            setBulkRejectionReason("");
            setSelectedRequestIds([]);
        } catch (err) {
            console.error("Failed to reject requests in bulk", err);
            setToast({ message: "Failed to reject some request(s). Please try again.", type: 'error' });
        } finally {
            setProcessingIds(prev => prev.filter(id => !idsToProcess.includes(id)));
        }
    };

    // Request Pagination Logic
    const totalPagesRequests = Math.ceil(filteredRequests.length / requestsPerPage);
    const indexOfLastRequest = currentPageRequests * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
    const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

    const selectedEvent = events.find(e => e.id === selectedEventId);

    // Calculate dynamic stats
    const totalPending = requests.filter(r => r.status === 'Pending').length;
    const totalApproved = requests.filter(r => r.status === 'Approved').length;
    const totalRejected = requests.filter(r => r.status === 'Rejected').length;

    // Main UI with event cards, filters, stats, and tables
    return (
        <div className="flex-1 p-8 bg-background-light dark:bg-background-dark/40">
            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
                <button
                    onClick={() => setActiveTab('manage')}
                    className={`pb-3 px-4 text-sm font-semibold transition-all relative ${activeTab === 'manage'
                        ? 'text-primary'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                        Manage Applications
                    </span>
                    {activeTab === 'manage' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in duration-200" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('action_required')}
                    className={`pb-3 px-4 text-sm font-semibold transition-all relative ${activeTab === 'action_required'
                        ? 'text-primary'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">assignment_returned</span>
                        Action Required
                    </span>
                    {activeTab === 'action_required' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in duration-200" />
                    )}
                </button>
            </div>

            {activeTab === 'manage' ? (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <div className="bg-orange-50/50 dark:bg-orange-900/10 p-3 rounded-xl border-2 border-orange-400/50 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-1.5 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl text-orange-600">pending_actions</span>
                            </div>
                            <div className="flex justify-between items-center mb-1 relative z-10">
                                <p className="text-[10px] font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider">Total Pending</p>
                                <span className="material-symbols-outlined text-[16px] text-orange-600 dark:text-orange-400">pending_actions</span>
                            </div>
                            <div className="flex items-baseline gap-1.5 relative z-10">
                                <h3 className="text-xl font-black text-orange-700 dark:text-orange-300 leading-none">{totalPending}</h3>
                                <span className="text-[9px] font-bold text-orange-600/60 dark:text-orange-400/60 uppercase">Requests</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-background-dark/30 p-3 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Approved</p>
                                <span className="material-symbols-outlined text-[16px] text-green-600">verified</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white leading-none">{totalApproved}</h3>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Requests</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-background-dark/30 p-3 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Rejected</p>
                                <span className="material-symbols-outlined text-[16px] text-red-600">block</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white leading-none">{totalRejected}</h3>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Requests</span>
                            </div>
                        </div>
                    </div>

                    {/* Section: Available Training Events */}
                    <section className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">
                                    local_library
                                </span>
                                Available Training Events
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Type:</span>
                                    <div className="relative">
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => {
                                                setSelectedCategory(e.target.value);
                                                setSelectedEventId(null);
                                                setCurrentPageEvents(1);
                                            }}
                                            className="pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                                        >
                                            <option value="All" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">All Types</option>
                                            <option value="Internal" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">Internal</option>
                                            <option value="External" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">External</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none text-[18px]">
                                            arrow_drop_down
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Status:</span>
                                    <div className="relative">
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => {
                                                setSelectedStatus(e.target.value);
                                                setSelectedEventId(null);
                                                setCurrentPageEvents(1);
                                            }}
                                            className="pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                                        >
                                            <option value="All" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">All Status</option>
                                            <option value="Sent" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">Already Sent</option>
                                            <option value="Not Sent" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">Not Sent Yet</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none text-[18px]">
                                            arrow_drop_down
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentEvents.map((event) => (
                                <TrainingEventCard
                                    key={event.id}
                                    title={event.title}
                                    date={event.proposedStartDate || "TBD"}
                                    time={formatTime(event.time)}
                                    category={event.category}
                                    status={event.approvedBy ? 'Approved' : event.status}
                                    reason={event.reason}
                                    hideActions={true}
                                    isSelected={selectedEventId === event.id}
                                    onClick={() => setSelectedEventId(event.id)}
                                />
                            ))}
                        </div>

                        {filteredEvents.length > eventsPerPage && (
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <button
                                    disabled={currentPageEvents === 1}
                                    onClick={() => setCurrentPageEvents(prev => Math.max(prev - 1, 1))}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: totalPagesEvents }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPageEvents(page)}
                                            className={`w-8 h-8 rounded-lg font-bold text-xs transition-all shadow-sm ${currentPageEvents === page
                                                ? 'bg-primary text-white'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    disabled={currentPageEvents === totalPagesEvents}
                                    onClick={() => setCurrentPageEvents(prev => Math.min(prev + 1, totalPagesEvents))}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Table Header Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            Requests for {selectedEvent ? `"${selectedEvent.title}"` : "Selected Training"}
                            {selectedEvent?.expectedParticipants && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20">
                                    <span className="material-symbols-outlined text-[16px]">groups</span>
                                    Expected Participants: {selectedEvent.expectedParticipants}
                                </span>
                            )}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsListModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">list_alt</span>View Training List
                            </button>
                        </div>
                    </div>

                    {/* Bulk Actions Panel */}
                    {selectedRequestIds.length > 0 && (
                        <div className="flex items-center justify-between p-4 mb-4 bg-primary/10 border-2 border-primary/20 rounded-xl animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-primary">
                                    {selectedRequestIds.length} candidate{selectedRequestIds.length > 1 ? 's' : ''} selected
                                </span>
                                <button
                                    onClick={() => setSelectedRequestIds([])}
                                    className="text-xs font-bold text-slate-500 hover:text-slate-700 underline"
                                >
                                    Clear Selection
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleBulkApprove}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    Approve Selected
                                </button>
                                <button
                                    onClick={() => setIsBulkRejectionModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                                    Reject Selected
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table Container */}
                    <div className="bg-white dark:bg-background-dark/30 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary/5 border-b border-primary/10">
                                        <th className="px-6 py-4 text-left w-12 no-print">
                                            {pendingRequests.length > 0 && (
                                                <input
                                                    type="checkbox"
                                                    checked={areAllPendingSelected}
                                                    onChange={toggleSelectAll}
                                                    className="rounded border-slate-300 text-primary focus:ring-primary size-4 cursor-pointer"
                                                />
                                            )}
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Submitted</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Request Form</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {currentRequests.length > 0 ? (
                                        currentRequests.map((request) => (
                                            <tr key={request.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="px-6 py-4 no-print">
                                                    {request.status === 'Pending' && (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRequestIds.includes(request.id)}
                                                            onChange={() => toggleSelectRequest(request.id)}
                                                            className="rounded border-slate-300 text-primary focus:ring-primary size-4 cursor-pointer"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {request.avatar ? (
                                                            <img alt={request.employeeName} className="size-10 rounded-full object-cover" src={request.avatar} />
                                                        ) : (
                                                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                                {request.initials}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-semibold">{request.employeeName}</p>
                                                            <p className="text-xs text-slate-500">{request.department}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-600">{request.dateSubmitted}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 border border-primary/20 bg-white text-primary rounded-lg text-xs font-semibold hover:bg-primary/5 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">visibility</span> View
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                        request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {request.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {request.status !== 'Approved' && (
                                                            <button
                                                                disabled={processingIds.includes(request.id)}
                                                                onClick={() => {
                                                                    setProcessingIds(prev => [...prev, request.id]);
                                                                    api.put(`/api/training/requests/${request.id}/status`, {
                                                                        status: 'Approved',
                                                                        approverId: user?.id
                                                                    })
                                                                        .then(() => {
                                                                            setRequests(requests.map(r => r.id === request.id ? { ...r, status: "Approved" } : r));
                                                                            setToast({ message: `Request from ${request.employeeName} approved!`, type: 'success' });
                                                                        })
                                                                        .catch(err => {
                                                                            console.error("Failed to approve request", err);
                                                                            setToast({ message: "Failed to approve request. Please try again.", type: 'error' });
                                                                        })
                                                                        .finally(() => {
                                                                            setProcessingIds(prev => prev.filter(id => id !== request.id));
                                                                        });
                                                                }}
                                                                className={`p-1.5 rounded transition-colors ${processingIds.includes(request.id) ? 'text-slate-300 cursor-not-allowed' : 'text-green-600 hover:bg-green-50'}`} title="Approve">
                                                                {processingIds.includes(request.id) ? (
                                                                    <div className="size-[20px] border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                                )}
                                                            </button>
                                                        )}
                                                        {request.status !== 'Rejected' && (
                                                            <button
                                                                onClick={() => {
                                                                    setRejectionModal({ isOpen: true, requestId: request.id });
                                                                }}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Reject">
                                                                <span className="material-symbols-outlined text-[20px]">cancel</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 w-48">
                                                    {request.status === 'Rejected' && request.rejectionReason && (
                                                        <p className="text-sm text-slate-600 break-words line-clamp-3" title={request.rejectionReason}>
                                                            {request.rejectionReason}
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                                No training requests found for this event.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {filteredRequests.length > requestsPerPage && (
                            <div className="px-6 py-4 bg-slate-50 dark:bg-background-dark/20 border-t border-primary/10 flex items-center justify-between">
                                <p className="text-xs font-medium text-slate-500">
                                    Showing {indexOfFirstRequest + 1} - {Math.min(indexOfLastRequest, filteredRequests.length)} of {filteredRequests.length} results
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPageRequests === 1}
                                        onClick={() => setCurrentPageRequests(prev => Math.max(prev - 1, 1))}
                                        className="p-1 rounded border border-primary/20 text-slate-400 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: totalPagesRequests }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPageRequests(page)}
                                                className={`size-8 rounded font-bold text-xs transition-all shadow-sm ${currentPageRequests === page
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        disabled={currentPageRequests === totalPagesRequests}
                                        onClick={() => setCurrentPageRequests(prev => Math.min(prev + 1, totalPagesRequests))}
                                        className="p-1 rounded border border-primary/20 text-slate-400 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <section className="mb-10 animate-in fade-in duration-200">
                    {actionRequiredCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-background-dark/30 rounded-xl border border-primary/10 shadow-sm text-center p-8">
                            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">check_circle</span>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">All Clear!</h3>
                            <p className="text-sm text-slate-500 max-w-sm">No training lists are currently returned or rejected. Everything is up to date.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Returned & Rejected Training Event Lists</h2>
                                        <p className="text-[13px] text-slate-500 font-medium">Programs sent back by Admin for adjustments or cancellation</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-background-dark/30 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-primary/5 border-b border-primary/10">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Programme Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Training Type</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/5">
                                            {events.filter(evt => evt.status === 'Returned' || evt.status === 'Rejected').map((evt) => (
                                                <tr
                                                    key={evt.id}
                                                    onClick={() => setSelectedEventId(evt.id)}
                                                    className="transition-colors cursor-pointer hover:bg-primary/5 border-l-4 border-l-transparent"
                                                >
                                                    <td className="px-6 py-4 text-sm font-semibold">{evt.title}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{evt.category}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${evt.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                            evt.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {evt.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedEventId(evt.id);
                                                                setIsListModalOpen(true);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1 border border-primary/20 bg-white text-primary rounded-lg text-xs font-semibold hover:bg-primary/5 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">visibility</span> View List
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 min-w-[250px]">
                                                        {(evt.status === 'Rejected' || evt.status === 'Returned') && evt.reason && (
                                                            <p className={`text-sm font-medium break-words ${evt.status === 'Rejected' ? 'text-red-600' : 'text-orange-600'}`} title={evt.reason}>
                                                                {evt.reason}
                                                            </p>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            )}
            {/* Footer Info */}

            <TrainingRequestDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                request={selectedRequest}
            />

            <ApprovedTrainingListModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                requests={filteredRequests}
                eventName={selectedEvent?.title || "Selected Training"}
                eventId={selectedEvent?.id}
                eventStatus={selectedEvent?.approvedBy ? 'Approved' : selectedEvent?.status}
                approvedBy={selectedEvent?.approvedBy}
                approvedAt={selectedEvent?.approvedAt}
                onStatusUpdate={() => {
                    // Refresh events to show updated status
                    api.get('/api/training/events')
                        .then(res => {
                            setEvents(res.data.sort((a: TrainingEvent, b: TrainingEvent) => b.id - a.id));
                        });
                    // Also refresh requests list
                    if (selectedEventId) {
                        api.get(`/api/training/events/${selectedEventId}/requests`)
                            .then(res => {
                                setRequests(res.data);
                            });
                    }
                }}
            />

            {rejectionModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a1c23] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col p-6 text-center border border-primary/10">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Confirm Rejection
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Please provide a reason for rejecting this training request.
                        </p>
                        <div className="mb-6 text-left">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Reason for Rejection *
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Enter reason here..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setRejectionModal({ isOpen: false, requestId: null });
                                    setRejectionReason("");
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (rejectionModal.requestId) {
                                        setProcessingIds(prev => [...prev, rejectionModal.requestId as number]);
                                        api.put(`/api/training/requests/${rejectionModal.requestId}/status`, {
                                            status: 'Rejected',
                                            rejectionReason,
                                            approverId: user?.id
                                        })
                                            .then(() => {
                                                setRequests(requests.map(r => r.id === rejectionModal.requestId ? { ...r, status: "Rejected", rejectionReason } : r));
                                                setToast({ message: "Request rejected successfully.", type: 'info' });
                                                setRejectionModal({ isOpen: false, requestId: null });
                                                setRejectionReason("");
                                            })
                                            .catch(err => {
                                                console.error("Failed to reject request", err);
                                                setToast({ message: "Failed to reject request. Please try again.", type: 'error' });
                                            })
                                            .finally(() => {
                                                if (rejectionModal.requestId) {
                                                    setProcessingIds(prev => prev.filter(id => id !== rejectionModal.requestId));
                                                }
                                            });
                                    } else {
                                        setRejectionModal({ isOpen: false, requestId: null });
                                        setRejectionReason("");
                                    }
                                }}
                                disabled={!rejectionReason.trim() || (rejectionModal.requestId !== null && processingIds.includes(rejectionModal.requestId))}
                                className="flex-1 px-4 py-2.5 font-semibold rounded-xl text-white transition-all shadow-sm bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {rejectionModal.requestId !== null && processingIds.includes(rejectionModal.requestId) ? (
                                    <>
                                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    "Yes, Reject"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isBulkRejectionModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a1c23] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col p-6 text-center border border-primary/10">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Confirm Bulk Rejection
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Please provide a reason for rejecting the {selectedRequestIds.length} selected request(s).
                        </p>
                        <div className="mb-6 text-left">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Reason for Rejection *
                            </label>
                            <textarea
                                value={bulkRejectionReason}
                                onChange={(e) => setBulkRejectionReason(e.target.value)}
                                className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Enter reason here..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsBulkRejectionModalOpen(false);
                                    setBulkRejectionReason("");
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkReject}
                                disabled={!bulkRejectionReason.trim() || processingIds.some(id => selectedRequestIds.includes(id))}
                                className="flex-1 px-4 py-2.5 font-semibold rounded-xl text-white transition-all shadow-sm bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processingIds.some(id => selectedRequestIds.includes(id)) ? (
                                    <>
                                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    "Yes, Reject All"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

import { Toast } from '@/components/ui/Toast';

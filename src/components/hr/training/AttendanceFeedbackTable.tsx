"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosInstance';
import TrainingEventCard from "@/components/hr/training/TrainingEventCard";
import FeedbackDetailsModal from "@/components/hr/training/FeedbackDetailsModal";
import { formatTime } from '@/lib/utils';

type TrainingEvent = {
    id: number;
    title: string;
    proposedStartDate?: string;
    date?: string;
    time?: string;
    category: string;
    instructor?: string;
    description?: string;
    status: string;
};

type TrainingFeedback = {
    id: number;
    eventId: number;
    employeeName: string;
    workEmail: string;
    feedback: string;
    attendanceStatus: string;
    courseContentRating: number;
    instructorRating: number;
    overallExperienceRating: number;
    suggestions: string;
};

export default function AttendanceFeedbackTable() {
    const [events, setEvents] = useState<TrainingEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [eventParticipants, setEventParticipants] = useState<any[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<TrainingFeedback | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Pagination for Events
    const [currentPageEvents, setCurrentPageEvents] = useState(1);
    const eventsPerPage = 6;

    // Pagination for Feedback
    const [currentPageFeedback, setCurrentPageFeedback] = useState(1);
    const feedbackPerPage = 10;

    useEffect(() => {
        api.get('/api/training/events')
            .then(res => {
                // Only show events that have been Approved by Admin
                const approvedEvents = res.data.filter((e: TrainingEvent) => e.status === "Approved");
                const sorted = approvedEvents.sort((a: TrainingEvent, b: TrainingEvent) => b.id - a.id);
                setEvents(sorted);
                if (sorted.length > 0) {
                    setSelectedEventId(sorted[0].id);
                }
            })
            .catch(() => {
                console.error("Failed to fetch events");
                setToast({ message: "Failed to load training events.", type: 'error' });
            });
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            // Fetch both feedback and approved requests to show the full participant list
            Promise.all([
                api.get(`/api/training/events/${selectedEventId}/feedback`),
                api.get(`/api/training/events/${selectedEventId}/requests`)
            ])
            .then(([feedbackRes, requestsRes]) => {
                const feedbackData = feedbackRes.data;
                const requestsData = requestsRes.data;

                // Filter for approved requests
                const approvedRequests = requestsData.filter((req: any) => req.status === "Approved");

                // Merge them: Start with all approved requests
                const participants = approvedRequests.map((req: any) => {
                    // Find matching feedback if it exists
                    const feedback = feedbackData.find((f: any) => f.employeeId === req.employeeId);
                    
                    return {
                        id: feedback?.id || `req-${req.id}`,
                        employeeId: req.employeeId,
                        employeeName: req.employeeName,
                        workEmail: req.workEmail,
                        attendanceStatus: feedback?.attendanceStatus || "Pending",
                        feedback: feedback?.feedback || null,
                        courseContentRating: feedback?.courseContentRating || 0,
                        instructorRating: feedback?.instructorRating || 0,
                        overallExperienceRating: feedback?.overallExperienceRating || 0,
                        suggestions: feedback?.suggestions || "",
                        hasSubmitted: !!feedback
                    };
                });

                setEventParticipants(participants);
                setCurrentPageFeedback(1);
            })
            .catch(() => {
                console.error("Failed to fetch event data");
                setToast({ message: "Failed to load participant data for this event.", type: 'error' });
            });
        }

        return () => {
            setEventParticipants([]);
        };
    }, [selectedEventId]);

    const filteredEvents = selectedCategory === "All"
        ? events
        : events.filter(e => e.category === selectedCategory);

    // Event Pagination Logic
    const totalPagesEvents = Math.ceil(filteredEvents.length / eventsPerPage);
    const indexOfLastEvent = currentPageEvents * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

    // Feedback/Participants Pagination Logic
    const totalPagesFeedback = Math.ceil(eventParticipants.length / feedbackPerPage);
    const indexOfLastFeedback = currentPageFeedback * feedbackPerPage;
    const indexOfFirstFeedback = indexOfLastFeedback - feedbackPerPage;
    const currentFeedback = eventParticipants.slice(indexOfFirstFeedback, indexOfLastFeedback);

    const selectedEvent = events.find(e => e.id === selectedEventId);

    return (
        <div className="flex-1 p-8 bg-background-light dark:bg-background-dark/40">
            {/* Section: Available Training Events */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">
                            local_library
                        </span>
                        Available Training Events
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">Filter by Type:</span>
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setSelectedEventId(null);
                                    setCurrentPageEvents(1);
                                }}
                                className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                            >
                                <option value="All">All Types</option>
                                <option value="Internal">Internal</option>
                                <option value="External">External</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                                arrow_drop_down
                            </span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentEvents.map((event) => (
                        <TrainingEventCard
                            key={event.id}
                            title={event.title}
                            date={event.proposedStartDate || event.date || "TBD"}
                            time={formatTime(event.time)}
                            category={event.category}
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
                                    className={`w-8 h-8 rounded-lg font-bold text-xs transition-all shadow-sm ${
                                        currentPageEvents === page 
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

            {/* Selected Event Details */}
            {selectedEvent && (
                <div className="mb-6 p-6 bg-white dark:bg-background-dark/30 rounded-xl border border-primary/10 shadow-sm flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{selectedEvent.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">{selectedEvent.description}</p>

                        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <div className="p-1.5 bg-primary/10 rounded-lg text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block -mb-1">Trainer</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedEvent.instructor || "TBA"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <div className="p-1.5 bg-primary/10 rounded-lg text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block -mb-1">Date</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedEvent.proposedStartDate || selectedEvent.date || "TBD"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <div className="p-1.5 bg-primary/10 rounded-lg text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block -mb-1">Time</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatTime(selectedEvent.time)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Header Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold">
                    Attendance & Feedback for {selectedEvent ? `"${selectedEvent.title}"` : "Selected Training"}
                </h2>
                {selectedEvent && eventParticipants.some(p => p.hasSubmitted) && (
                    <button
                        onClick={() => setToast({ message: `Generating feedback report for ${selectedEvent.title}...`, type: 'info' })}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">summarize</span>
                        Generate Report
                    </button>
                )}
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-background-dark/30 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
                {selectedEventId ? (
                    eventParticipants.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-primary/5 border-b border-primary/10">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Name</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Work Email</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Feedback</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {currentFeedback.map((record) => (
                                            <tr key={record.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold">{record.employeeName}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">{record.workEmail}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${record.attendanceStatus === 'Present' || record.attendanceStatus === 'Confirmed'
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                        }`}>
                                                        {record.attendanceStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {record.hasSubmitted ? (
                                                        <button
                                                            onClick={() => setSelectedFeedback(record)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1 border border-primary/20 bg-white text-primary rounded-lg text-xs font-semibold hover:bg-primary/5 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">visibility</span> View
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Not Submitted</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Feedback Table Pagination */}
                            {eventParticipants.length > feedbackPerPage && (
                                <div className="px-6 py-4 bg-slate-50 dark:bg-background-dark/20 border-t border-primary/10 flex items-center justify-between">
                                    <p className="text-xs font-medium text-slate-500">
                                        Showing {indexOfFirstFeedback + 1} - {Math.min(indexOfLastFeedback, eventParticipants.length)} of {eventParticipants.length} records
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            disabled={currentPageFeedback === 1}
                                            onClick={() => setCurrentPageFeedback(prev => Math.max(prev - 1, 1))}
                                            className="p-1 rounded border border-primary/20 text-slate-400 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                        </button>
                                        
                                        <div className="flex items-center gap-1.5">
                                            {Array.from({ length: totalPagesFeedback }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPageFeedback(page)}
                                                    className={`size-8 rounded font-bold text-xs transition-all shadow-sm ${
                                                        currentPageFeedback === page 
                                                        ? 'bg-primary text-white' 
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button 
                                            disabled={currentPageFeedback === totalPagesFeedback}
                                            onClick={() => setCurrentPageFeedback(prev => Math.min(prev + 1, totalPagesFeedback))}
                                            className="p-1 rounded border border-primary/20 text-slate-400 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="px-6 py-12 text-center text-slate-500">
                            <p>No attendance or feedback records found for this event.</p>
                        </div>
                    )
                ) : (
                    <div className="px-6 py-12 text-center text-slate-500">
                        <p className="mb-2">Select a training event to view and manage attendance and feedback.</p>
                    </div>
                )}
            </div>

            <FeedbackDetailsModal
                isOpen={!!selectedFeedback}
                onClose={() => setSelectedFeedback(null)}
                feedback={selectedFeedback}
            />
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

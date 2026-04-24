"use client";

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
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
    const [eventFeedback, setEventFeedback] = useState<TrainingFeedback[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<TrainingFeedback | null>(null);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        axiosInstance.get('/training/events')
            .then(res => {
                const sorted = res.data.sort((a: TrainingEvent, b: TrainingEvent) => b.id - a.id);
                setEvents(sorted);
                if (sorted.length > 0) {
                    setSelectedEventId(sorted[0].id);
                }
            })
            .catch(() => console.error("Failed to fetch events"));
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            axiosInstance.get(`/training/events/${selectedEventId}/feedback`)
                .then(res => setEventFeedback(res.data))
                .catch(() => console.error("Failed to fetch feedback"));
        } else {
            setEventFeedback([]);
        }
    }, [selectedEventId]);

    const filteredEvents = selectedCategory === "All"
        ? events
        : events.filter(e => e.category === selectedCategory);

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
                                    setShowAll(false);
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
                    {(showAll ? filteredEvents : filteredEvents.slice(0, 6)).map((event) => (
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

                {filteredEvents.length > 6 && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="px-8 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-full hover:bg-slate-50 hover:border-primary hover:text-primary transition-all shadow-sm flex items-center gap-2 group text-sm"
                        >
                            <span>{showAll ? "Show Less" : "View All Training Courses"}</span>
                            <span className={`material-symbols-outlined text-sm transition-transform ${showAll ? "rotate-180" : "group-hover:translate-y-0.5"}`}>
                                expand_more
                            </span>
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
                {selectedEvent && eventFeedback.length > 0 && (
                    <button
                        onClick={() => alert(`Generating feedback report for ${selectedEvent.title}...`)}
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
                    eventFeedback.length > 0 ? (
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
                                    {eventFeedback.map((record) => (
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
                                                <button
                                                    onClick={() => setSelectedFeedback(record)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 border border-primary/20 bg-white text-primary rounded-lg text-xs font-semibold hover:bg-primary/5 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">visibility</span> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
        </div>
    );
}

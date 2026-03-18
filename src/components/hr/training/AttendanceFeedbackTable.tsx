"use client";

import React, { useState } from 'react';
import TrainingEventCard from "@/components/hr/training/TrainingEventCard";
import FeedbackDetailsModal from "@/components/hr/training/FeedbackDetailsModal";

const trainingEvents = [
    {
        id: 1,
        title: "Advanced Sales Tactics",
        date: "October 24, 2023",
        time: "09:00 AM - 12:00 PM",
        category: "Sales",
        trainer: "Mr. Samantha Perera",
        description: "An intensive course focusing on modern negotiation tactics, objection handling, and closing strategies."
    },
    {
        id: 2,
        title: "Leadership 101: Core Basics",
        date: "November 02, 2023",
        time: "02:00 PM - 05:00 PM",
        category: "Leadership",
        trainer: "Dr. Ruwan Fernando",
        description: "Foundational leadership principles for new managers, focusing on communication and team building."
    },
    {
        id: 3,
        title: "2024 Product Roadmap",
        date: "November 15, 2023",
        time: "11:00 AM - 12:30 PM",
        category: "Product",
        trainer: "Ms. Anuki Silva",
        description: "A comprehensive overview of the upcoming product releases, feature updates, and strategic direction."
    },
];

const mockAttendanceData = [
    {
        id: 1,
        eventId: 1,
        employeeName: "Kamal Perera",
        workEmail: "kamal.p@nexora.com",
        feedback: "The sales tactics taught were very practical and I can apply them immediately.",
        ratings: { courseContent: 5, instructor: 4, overallExperience: 5 },
        suggestions: "Perhaps more interactive roleplay sessions next time."
    },
    {
        id: 2,
        eventId: 1,
        employeeName: "Amali Silva",
        workEmail: "amali.s@nexora.com",
        feedback: "Good session, but I wish there were more examples relevant to data analytics.",
        ratings: { courseContent: 4, instructor: 3, overallExperience: 3 },
        suggestions: "Could include more case studies relevant to different departments."
    },
    {
        id: 3,
        eventId: 2,
        employeeName: "Nuwan Kumara",
        workEmail: "nuwan.k@nexora.com",
        feedback: "Excellent leadership training. The core basics were well explained.",
        ratings: { courseContent: 5, instructor: 5, overallExperience: 4 },
        suggestions: "None, it was perfect!"
    },
];

export default function AttendanceFeedbackTable() {
    const [selectedEventId, setSelectedEventId] = useState<number | null>(trainingEvents[0].id);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedFeedback, setSelectedFeedback] = useState<typeof mockAttendanceData[0] | null>(null);

    const filteredEvents = selectedCategory === "All"
        ? trainingEvents
        : trainingEvents.filter(e => e.category === selectedCategory);

    const selectedEvent = trainingEvents.find(e => e.id === selectedEventId);

    const eventAttendance = selectedEventId 
        ? mockAttendanceData.filter(a => a.eventId === selectedEventId)
        : [];

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
                                }}
                                className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                            >
                                <option value="All">All Types</option>
                                <option value="Sales">Sales</option>
                                <option value="Leadership">Leadership</option>
                                <option value="Product">Product</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                                arrow_drop_down
                            </span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <TrainingEventCard
                            key={event.id}
                            title={event.title}
                            date={event.date}
                            time={event.time}
                            category={event.category}
                            hideActions={true}
                            isSelected={selectedEventId === event.id}
                            onClick={() => setSelectedEventId(event.id)}
                        />
                    ))}
                </div>
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
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedEvent.trainer}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <div className="p-1.5 bg-primary/10 rounded-lg text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block -mb-1">Date</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedEvent.date}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <div className="p-1.5 bg-primary/10 rounded-lg text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block -mb-1">Time</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedEvent.time}</span>
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
                {selectedEvent && eventAttendance.length > 0 && (
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
                    eventAttendance.length > 0 ? (
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
                                    {eventAttendance.map((record) => (
                                        <tr key={record.id} className="hover:bg-primary/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold">{record.employeeName}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{record.workEmail}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                    Confirmed
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

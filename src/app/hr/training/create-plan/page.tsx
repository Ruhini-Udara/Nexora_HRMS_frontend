"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TrainingEventCard from "@/components/hr/training/TrainingEventCard";

type TrainingEvent = {
    id: number;
    title: string;
    proposedStartDate?: string;
    date?: string;
    time?: string;
    category: string;
    participants?: string;
    expectedParticipants?: number;
    description?: string;
    applyBefore?: string;
    location?: string;
    budget?: string;
    instructor?: string;
};

export default function CreateTrainingPlanPage() {
    const [events, setEvents] = useState<TrainingEvent[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedViewEvent, setSelectedViewEvent] = useState<TrainingEvent | null>(null);
    const router = useRouter();

    useEffect(() => {
        axiosInstance.get('/training/events')
            .then(res => setEvents(res.data))
            .catch(err => console.error("Failed to fetch events:", err));
    }, []);

    const categories = ["All", ...Array.from(new Set(events.map(e => e.category)))];

    const filteredEvents = selectedCategory === "All"
        ? events
        : events.filter(e => e.category === selectedCategory);

    const handleDeleteEvent = (id: number) => {
        axiosInstance.delete(`/training/events/${id}`)
            .then(() => {
                setEvents(events.filter(event => event.id !== id));
            })
            .catch(err => {
                console.warn("Backend may not support DELETE yet:", err);
                // Optimistically remove from UI for demonstration
                setEvents(events.filter(event => event.id !== id));
            });
    };

    const handleEditEvent = (id: number) => {
        router.push(`/hr/training/create-plan/new?editId=${id}`);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full space-y-10">
            {/* Hero Title */}
            <div className="flex items-end justify-between border-b border-primary/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-[#1d130c] tracking-tight">
                        Create and Edit Training Plans
                    </h1>
                    <p className="text-stone-500 mt-1">
                        Design, manage, and update training programs for your organization.
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        {filteredEvents.length} Available Courses
                    </span>
                    <Link href="/hr/training/create-plan/new" className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-full flex items-center gap-1 hover:bg-[#853500] transition-colors shadow-sm shadow-primary/20">
                        <span className="material-symbols-outlined text-sm">add</span>
                        Create New Training Event
                    </Link>
                </div>
            </div>

            {/* Section: Available Training Events */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">
                            local_library
                        </span>
                        Available Training Events
                    </h2>
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="appearance-none bg-white text-stone-700 text-sm font-bold rounded-lg px-4 py-2 pr-10 border border-stone-200 outline-none cursor-pointer hover:bg-stone-50 transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category === "All" ? "All Types" : category}
                                </option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none text-lg">
                            expand_more
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <TrainingEventCard
                            key={event.id}
                            title={event.title}
                            date={event.proposedStartDate || "TBD"}
                            time={"TBD"}
                            category={event.category}
                            onView={() => setSelectedViewEvent(event)}
                            onEdit={() => handleEditEvent(event.id)}
                            onDelete={() => handleDeleteEvent(event.id)}
                        />
                    ))}
                </div>
            </section>

            {/* View Event Modal */}
            {selectedViewEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <span className="material-symbols-outlined text-2xl">event_note</span>
                                </div>
                                <div>
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1 inline-block">
                                        {selectedViewEvent.category}
                                    </span>
                                    <h3 className="text-xl font-bold text-stone-900 leading-tight">{selectedViewEvent.title}</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedViewEvent(null)}
                                className="text-stone-400 hover:text-stone-600 transition-colors p-1"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4 py-4 border-y border-stone-100 max-h-[60vh] overflow-y-auto pr-2">
                            {selectedViewEvent.description && (
                                <div>
                                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Description</p>
                                    <p className="text-sm text-stone-700">{selectedViewEvent.description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="flex items-center gap-3 text-stone-600">
                                    <span className="material-symbols-outlined text-stone-400">calendar_month</span>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Date</p>
                                        <p className="font-medium text-sm">{selectedViewEvent.proposedStartDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-stone-600">
                                    <span className="material-symbols-outlined text-stone-400">schedule</span>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Time</p>
                                        <p className="font-medium text-sm">TBD</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-stone-600">
                                    <span className="material-symbols-outlined text-stone-400">group</span>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Participants</p>
                                        <p className="font-medium text-sm">{selectedViewEvent.expectedParticipants} Expected</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-stone-600">
                                    <span className="material-symbols-outlined text-stone-400">event_busy</span>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Apply Before</p>
                                        <p className="font-medium text-sm">{selectedViewEvent.applyBefore}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-stone-600">
                                    <span className="material-symbols-outlined text-stone-400">location_on</span>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Location</p>
                                        <p className="font-medium text-sm">{selectedViewEvent.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-stone-600">
                                    <span className="material-symbols-outlined text-stone-400">payments</span>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Budget</p>
                                        <p className="font-medium text-sm">LKR {selectedViewEvent.budget}</p>
                                    </div>
                                </div>
                                <div className="col-span-2 flex items-center gap-3 text-stone-600">
                                    <span className="material-symbols-outlined text-stone-400">person</span>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Instructor</p>
                                        <p className="font-medium text-sm">{selectedViewEvent.instructor}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedViewEvent(null)}
                                className="px-5 py-2.5 rounded-xl bg-stone-100 font-semibold text-stone-700 hover:bg-stone-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

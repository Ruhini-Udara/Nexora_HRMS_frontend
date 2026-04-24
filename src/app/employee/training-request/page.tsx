"use client";

import React, { useState, useEffect } from "react";
import TrainingEventCard from "@/components/employee/training/TrainingEventCard";
import TrainingStatusTable from "@/components/employee/training/TrainingStatusTable";
import TrainingFeedbackModal from "@/components/employee/training/TrainingFeedbackModal";
import axiosInstance from "@/lib/axios";

type TrainingEvent = {
    id: number;
    title: string;
    proposedStartDate?: string;
    date?: string;
    time?: string;
    category: string;
    imageSrc?: string;
    imageAlt?: string;
    applyBefore?: string;
};

export default function TrainingRequestPage() {
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedFeedbackCourse, setSelectedFeedbackCourse] = useState("");
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showAll, setShowAll] = useState(false);

    const [events, setEvents] = useState<TrainingEvent[]>([]);

    useEffect(() => {
        axiosInstance.get('/training/events')
            .then(res => setEvents(res.data.sort((a: TrainingEvent, b: TrainingEvent) => b.id - a.id)))
            .catch(err => console.error("Failed to fetch events", err));
    }, []);

    const categories = ["All", ...Array.from(new Set(events.map(event => event.category)))];

    const filteredEvents = selectedCategory === "All"
        ? events
        : events.filter(event => event.category === selectedCategory);

    return (
        <div className="space-y-10 max-w-7xl mx-auto w-full">
            {/* Hero Title */}
            <div className="flex items-end justify-between border-b border-[var(--color-training-primary)]/10 pb-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Professional Development
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Elevate your skills with our curated corporate training programs.
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center justify-center">
                        {events.length} Available Courses
                    </span>
                </div>
            </div>

            {/* Section 1: Available Training Events */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[#1d130c]">
                        <span className="material-symbols-outlined text-[var(--color-training-primary)]">
                            local_library
                        </span>
                        Available Training Events
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-500">Filter by Type:</span>
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setShowAll(false);
                            }}
                            className="bg-white border border-stone-200 text-stone-800 text-sm font-medium rounded-lg focus:ring-[var(--color-training-primary)] focus:border-[var(--color-training-primary)] block p-2 outline-none cursor-pointer"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category === "All" ? "All Types" : category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(showAll ? filteredEvents : filteredEvents.slice(0, 6)).map((event) => (
                        <TrainingEventCard 
                            key={event.id} 
                            category={event.category}
                            imageSrc={event.imageSrc || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"}
                            imageAlt={event.imageAlt || event.title}
                            title={event.title}
                            date={event.proposedStartDate || event.date || "TBD"}
                            time={event.time || "TBD"}
                            applyBefore={event.applyBefore}
                        />
                    ))}
                </div>

                {filteredEvents.length > 6 && (
                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => setShowAll(!showAll)}
                            className="px-8 py-2 bg-white border border-stone-200 text-stone-700 font-bold rounded-full hover:bg-stone-50 hover:border-[var(--color-training-primary)] hover:text-[var(--color-training-primary)] transition-all shadow-sm flex items-center gap-2 group text-sm"
                        >
                            <span>{showAll ? "Show Less" : "View All Training Courses"}</span>
                            <span className={`material-symbols-outlined text-sm transition-transform ${showAll ? "rotate-180" : "group-hover:translate-y-0.5"}`}>
                                expand_more
                            </span>
                        </button>
                    </div>
                )}
            </section>

            {/* Section 2: My Training Status */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[#1d130c]">
                        <span className="material-symbols-outlined text-[var(--color-training-primary)]">
                            assignment_turned_in
                        </span>
                        My Training Status
                    </h2>
                </div>
                <TrainingStatusTable
                    onFeedbackClick={(request) => {
                        setSelectedFeedbackCourse(request.trainingTitle);
                        setSelectedEventId(request.eventId);
                        setIsFeedbackModalOpen(true);
                    }}
                />
            </section>

            <TrainingFeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                courseName={selectedFeedbackCourse}
                eventId={selectedEventId}
            />
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import TrainingEventCard from "@/components/employee/training/TrainingEventCard";
import TrainingStatusTable from "@/components/employee/training/TrainingStatusTable";
import TrainingFeedbackModal from "@/components/employee/training/TrainingFeedbackModal";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";

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

type TrainingRequestItem = {
    id: number;
    eventId: number;
    status: 'Approved' | 'Pending' | 'Rejected' | 'HR Approved' | 'Confirmed';
    trainingTitle: string;
    trainingCategory: string;
    trainingDate: string;
    trainingTime: string;
    rejectionReason?: string;
};

export default function TrainingRequestPage() {
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedFeedbackCourse, setSelectedFeedbackCourse] = useState("");
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [statusFilter, setStatusFilter] = useState("New"); // All, New, Applied
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [events, setEvents] = useState<TrainingEvent[]>([]);
    const [userRequests, setUserRequests] = useState<TrainingRequestItem[]>([]);
    const { user } = useAuthStore();

    useEffect(() => {
        let isMounted = true;

        api.get('/api/training/events')
            .then(res => {
                if (isMounted) setEvents(res.data.sort((a: TrainingEvent, b: TrainingEvent) => b.id - a.id));
            })
            .catch(err => console.error("Failed to fetch events", err));
            
        if (user?.id) {
            api.get(`/api/training/employees/${user.id}/requests`)
                .then(res => {
                    if (isMounted) setUserRequests(res.data);
                })
                .catch(err => console.error("Failed to fetch user requests", err));
        }

        return () => {
            isMounted = false;
        };
    }, [user?.id]);

    const categories = ["All", ...Array.from(new Set(events.map(event => event.category)))];

    const filteredEvents = events.filter(event => {
        const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
        const isApplied = userRequests.some(req => req.eventId === event.id);
        
        const matchesStatus = 
            statusFilter === "All" ? true :
            statusFilter === "New" ? !isApplied :
            statusFilter === "Applied" ? isApplied : true;
            
        return matchesCategory && matchesStatus;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

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
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center justify-center">
                        {userRequests.length} Applied Events
                    </span>
                    {userRequests.filter(req => req.status === 'Rejected').length > 0 && (
                        <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center justify-center">
                            {userRequests.filter(req => req.status === 'Rejected').length} Rejected
                        </span>
                    )}
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
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-stone-500">Filter by Type:</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setCurrentPage(1);
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
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-stone-500">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-white border border-stone-200 text-stone-800 text-sm font-medium rounded-lg focus:ring-[var(--color-training-primary)] focus:border-[var(--color-training-primary)] block p-2 outline-none cursor-pointer"
                            >
                                <option value="All">All Courses</option>
                                <option value="New">Not Applied (New)</option>
                                <option value="Applied">Already Applied</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentItems.map((event) => {
                        const isApplied = userRequests.some(req => req.eventId === event.id);
                        return (
                            <TrainingEventCard 
                                key={event.id} 
                                category={event.category}
                                imageSrc={event.imageSrc || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"}
                                imageAlt={event.imageAlt || event.title}
                                title={event.title}
                                date={event.proposedStartDate || event.date || "TBD"}
                                time={event.time || "TBD"}
                                applyBefore={event.applyBefore}
                                isApplied={isApplied}
                            />
                        );
                    })}
                </div>

                {filteredEvents.length > itemsPerPage && (
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 hover:border-[var(--color-training-primary)] hover:text-[var(--color-training-primary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                        currentPage === page 
                                        ? 'bg-[var(--color-training-primary)] text-white' 
                                        : 'bg-white border border-stone-200 text-stone-600 hover:border-[var(--color-training-primary)] hover:text-[var(--color-training-primary)]'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 hover:border-[var(--color-training-primary)] hover:text-[var(--color-training-primary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
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
                        My Training Events Status
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

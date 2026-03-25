"use client";

import React, { useState } from "react";
import TrainingEventCard from "@/components/employee/training/TrainingEventCard";
import TrainingStatusTable from "@/components/employee/training/TrainingStatusTable";
import TrainingFeedbackModal from "@/components/employee/training/TrainingFeedbackModal";

export default function TrainingRequestPage() {
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedFeedbackCourse, setSelectedFeedbackCourse] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const trainingEvents = [
        {
            category: "Sales",
            imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8kev8B1LHYhdvJyun1RzU5HW-NDFoJcDXqV7wdhsVReP40kpwOtbuxDty4O6mfetRRD_QTIJIJSjSp4mw1fNCpwFqjfcIreTGSOTOKsEsO3MBcrz-WlwuTzupbrmc-o_v6Lgu__qD6QWbyDyeRJ26EJtz2nzEoUITC4819iWyi4NrePIRCsW_8OUJE_mnttj7P1ijejfnRuikHbdDkWXZWlQ4qOTfWlwrNsWBCheAV2_OupK08EcTN9TGNdugoXWibnpud_0qhBI",
            imageAlt: "Team collaborating in a modern office workshop setting",
            title: "Advanced Sales Tactics",
            date: "October 24, 2023",
            time: "09:00 AM - 12:00 PM",
        },
        {
            category: "Leadership",
            imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeomj4FV-xTtl2q-eZoLucnP8oW2QvbeBuvy5Jy4SlB02M4bG-Lbm02kxsJMCKLnPwdIFc1imWvEFWqzereZgUBki7sf7CcgjvgFmglNSiSSuT2BuDhCBsU4QwSi8ropV70Fz77jye_NG8hb7xtEtutziJY23stOGe9XUQOTSuRlKsk995DZ6T7PvLqBG2T8IeN_hFvHPoQGIFCCqIdKOI2yqDouhUviARKhhCgVmw4f-bqAygPiLqG6iDvmwSIUbifK7oRoCHWzM",
            imageAlt: "Corporate meeting room with leadership presentation",
            title: "Leadership 101: Core Basics",
            date: "November 02, 2023",
            time: "02:00 PM - 05:00 PM",
        },
        {
            category: "Product",
            imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCAiE3w4C5N0fAAb27Exc4cON_BPrwP423cWY51Z5bAwzqP4nOzSTulKsfKLMmmNnL9d9WrqSIScUMPHNCBR3p9o0HUFnsXt9qSJy52kRa0m2dIlnLwnzkLhxUXZxmx7tY1C3kmdjAiBEjevmQsROHz-bkkrsvt_a92zGS9emts4J3NeWW31g9Nf6HdXTjKZl5zBLwuwrKVYbHQdFRCm8nqWPpp9B9fEY6YhuDFZP9LLl6CPD_0tjGaul5Q-BWhhMKHmEE4U2dS48",
            imageAlt: "Laptop displaying data analytics charts and graphs",
            title: "2024 Product Roadmap",
            date: "November 15, 2023",
            time: "11:00 AM - 12:30 PM",
        },
    ];

    const categories = ["All", ...Array.from(new Set(trainingEvents.map(event => event.category)))];

    const filteredEvents = selectedCategory === "All"
        ? trainingEvents
        : trainingEvents.filter(event => event.category === selectedCategory);

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
                    <span className="px-3 py-1 bg-[var(--color-training-primary)]/10 text-[var(--color-training-primary)] text-xs font-bold rounded-full">
                        12 Available Courses
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        3 Active Requests
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
                            onChange={(e) => setSelectedCategory(e.target.value)}
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
                    {filteredEvents.map((event, index) => (
                        <TrainingEventCard key={index} {...event} />
                    ))}
                </div>
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
                        setSelectedFeedbackCourse(request.name);
                        setIsFeedbackModalOpen(true);
                    }} 
                />
            </section>

            <TrainingFeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                courseName={selectedFeedbackCourse}
            />
        </div>
    );
}

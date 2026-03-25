import React from "react";
import Link from "next/link";
import TrainingEventCard from "@/components/hr/training/TrainingEventCard";

const trainingEvents = [
    {
        id: 1,
        title: "Advanced Sales Tactics",
        date: "October 24, 2023",
        time: "09:00 AM - 12:00 PM",
        category: "Sales",
    },
    {
        id: 2,
        title: "Leadership 101: Core Basics",
        date: "November 02, 2023",
        time: "02:00 PM - 05:00 PM",
        category: "Leadership",
    },
    {
        id: 3,
        title: "2024 Product Roadmap",
        date: "November 15, 2023",
        time: "11:00 AM - 12:30 PM",
        category: "Product",
    },
];

export default function CreateTrainingPlanPage() {
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
                        3 Available Courses
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainingEvents.map((event) => (
                        <TrainingEventCard
                            key={event.id}
                            title={event.title}
                            date={event.date}
                            time={event.time}
                            category={event.category}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

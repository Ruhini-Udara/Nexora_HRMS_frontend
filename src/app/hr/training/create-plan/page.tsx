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
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8kev8B1LHYhdvJyun1RzU5HW-NDFoJcDXqV7wdhsVReP40kpwOtbuxDty4O6mfetRRD_QTIJIJSjSp4mw1fNCpwFqjfcIreTGSOTOKsEsO3MBcrz-WlwuTzupbrmc-o_v6Lgu__qD6QWbyDyeRJ26EJtz2nzEoUITC4819iWyi4NrePIRCsW_8OUJE_mnttj7P1ijejfnRuikHbdDkWXZWlQ4qOTfWlwrNsWBCheAV2_OupK08EcTN9TGNdugoXWibnpud_0qhBI",
    },
    {
        id: 2,
        title: "Leadership 101: Core Basics",
        date: "November 02, 2023",
        time: "02:00 PM - 05:00 PM",
        category: "Leadership",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeomj4FV-xTtl2q-eZoLucnP8oW2QvbeBuvy5Jy4SlB02M4bG-Lbm02kxsJMCKLnPwdIFc1imWvEFWqzereZgUBki7sf7CcgjvgFmglNSiSSuT2BuDhCBsU4QwSi8ropV70Fz77jye_NG8hb7xtEtutziJY23stOGe9XUQOTSuRlKsk995DZ6T7PvLqBG2T8IeN_hFvHPoQGIFCCqIdKOI2yqDouhUviARKhhCgVmw4f-bqAygPiLqG6iDvmwSIUbifK7oRoCHWzM",
    },
    {
        id: 3,
        title: "2024 Product Roadmap",
        date: "November 15, 2023",
        time: "11:00 AM - 12:30 PM",
        category: "Product",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCAiE3w4C5N0fAAb27Exc4cON_BPrwP423cWY51Z5bAwzqP4nOzSTulKsfKLMmmNnL9d9WrqSIScUMPHNCBR3p9o0HUFnsXt9qSJy52kRa0m2dIlnLwnzkLhxUXZxmx7tY1C3kmdjAiBEjevmQsROHz-bkkrsvt_a92zGS9emts4J3NeWW31g9Nf6HdXTjKZl5zBLwuwrKVYbHQdFRCm8nqWPpp9B9fEY6YhuDFZP9LLl6CPD_0tjGaul5Q-BWhhMKHmEE4U2dS48",
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
                            image={event.image}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

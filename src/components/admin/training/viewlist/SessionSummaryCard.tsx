"use client";

import React from "react";

interface SessionSummaryCardProps {
    title: string;
    type: string;
    date: string;
    location: string;
    trainer: string;
}

export default function SessionSummaryCard({
    title,
    type,
    date,
    location,
    trainer,
}: SessionSummaryCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <span className="px-2.5 py-1 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
                        {type}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                        {title}
                    </h3>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">
                        Date & Time
                    </span>
                    <span className="text-gray-700 dark:text-gray-200 font-medium">
                        {date}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">
                        Location
                    </span>
                    <span className="text-gray-700 dark:text-gray-200 font-medium">
                        {location}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">
                        Trainer
                    </span>
                    <span className="text-gray-700 dark:text-gray-200 font-medium">
                        {trainer}
                    </span>
                </div>
            </div>
        </div>
    );
}

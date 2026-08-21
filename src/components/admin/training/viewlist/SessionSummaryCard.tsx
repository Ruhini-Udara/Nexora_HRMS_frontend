"use client";

import React from "react";

interface SessionSummaryCardProps {
    title: string;
    trainingCode?: string;
    type: string;
    date: string;
    location: string;
    trainer: string;
    expectedParticipants: number;
}

export default function SessionSummaryCard({
    title,
    trainingCode,
    type,
    date,
    location,
    trainer,
    expectedParticipants,
}: SessionSummaryCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="px-2 py-0.5 rounded bg-primary text-white text-[9px] font-bold uppercase tracking-widest inline-block">
                            {type}
                        </span>
                        {trainingCode && (
                            <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 text-[9px] font-bold uppercase tracking-widest inline-block">
                                {trainingCode}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight leading-tight">
                        {title}
                    </h3>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                        Date & Time
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-semibold">
                        {date}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                        Location
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-semibold truncate" title={location}>
                        {location}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                        Trainer
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-semibold truncate" title={trainer}>
                        {trainer}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                        Expected
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-semibold">
                        {expectedParticipants} Participants
                    </span>
                </div>
            </div>
        </div>
    );
}

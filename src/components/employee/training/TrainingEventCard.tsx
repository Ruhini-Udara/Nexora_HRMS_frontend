"use client";

import React from "react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";

// Props describing a single training event card
interface TrainingEventProps {
    category: string;
    imageSrc: string;
    title: string;
    date: string;
    time: string;
    imageAlt: string;
    applyBefore?: string;
    isApplied?: boolean;  // Determines whether user has already applied for this event
}

const TrainingEventCard: React.FC<TrainingEventProps> = ({
    category,
    title,
    date,
    time,
    applyBefore,
    isApplied
}) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isRegistrationClosed = applyBefore && applyBefore !== "TBD" ? applyBefore < todayStr : false;

    // Card UI changes based on whether the user already applied or registration is closed:
    return (
        <div className={`bg-white dark:bg-slate-900 rounded-xl border transition-all flex flex-col group ${
            isApplied 
                ? 'border-emerald-100 dark:border-emerald-900/30' 
                : isRegistrationClosed
                    ? 'border-stone-200 dark:border-slate-800 opacity-70 bg-stone-50/30 dark:bg-slate-900/40'
                    : 'border-stone-200 dark:border-slate-800 hover:border-[var(--color-training-primary)] hover:shadow-lg'
        }`}>
            <div className={`rounded-t-xl p-2.5 flex justify-end items-center ${isApplied ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-[var(--color-training-primary)]/5 dark:bg-[var(--color-training-primary)]/10'}`}>
                <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-black text-[var(--color-training-primary)] uppercase shadow-sm">
                    {category}
                </span>
            </div>
            <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-bold text-sm mb-1 text-stone-800 dark:text-white line-clamp-1" title={title}>{title}</h3>
                <div className="space-y-1 mb-3">
                    {/* Date & time display using material icons */}
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-xs">calendar_month</span>
                        {date}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {formatTime(time)}
                    </div>
                </div>

                {/* Bottom bar: show "Apply Before" (if applicable) or "Applied" badge */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-stone-100 dark:border-slate-800 pt-2.5">
                    {applyBefore && !isApplied && (
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-1 rounded-md border ${
                            isRegistrationClosed
                                ? 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30'
                                : 'text-orange-600 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-900/30'
                        }`}>
                            <span className="material-symbols-outlined text-[14px]">event_busy</span>
                            {isRegistrationClosed ? `Deadline Passed: ${applyBefore}` : `Apply Before: ${applyBefore}`}
                        </div>
                    )}
                    {isApplied ? (
                        <div className="inline-flex items-center justify-center gap-1 px-3 py-1.5 w-max bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-md font-bold text-[10px] ml-auto border border-emerald-200 dark:border-emerald-800/30">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            Applied
                        </div>
                    ) : isRegistrationClosed ? (
                        <div className="inline-flex items-center justify-center gap-1 px-3 py-1.5 w-max bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 rounded-md font-bold text-[10px] ml-auto border border-rose-200 dark:border-rose-900/30">
                            <span className="material-symbols-outlined text-[12px]">block</span>
                            Closed
                        </div>
                    ) : (
                        <Link
                            href={`/employee/training-request/${title.toLowerCase().replace(/ /g, '-')}`}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 w-max bg-[var(--color-training-primary)] text-white rounded-md font-bold text-[10px] hover:bg-[#853500] transition-colors cursor-pointer ml-auto"
                        >
                            <span className="material-symbols-outlined text-[12px]">send</span>
                            Apply Now
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainingEventCard;

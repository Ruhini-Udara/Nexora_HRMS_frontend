"use client";

import React from "react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";

interface TrainingEventProps {
    category: string;
    imageSrc: string;
    title: string;
    date: string;
    time: string;
    imageAlt: string;
    applyBefore?: string;
    isApplied?: boolean;
}

const TrainingEventCard: React.FC<TrainingEventProps> = ({
    category,
    title,
    date,
    time,
    applyBefore,
    isApplied
}) => {
    return (
        <div className={`bg-white rounded-xl border transition-all flex flex-col group ${isApplied ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-stone-200 hover:border-[var(--color-training-primary)] hover:shadow-lg'}`}>
            <div className={`rounded-t-xl p-2.5 flex justify-end items-center ${isApplied ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-[var(--color-training-primary)]/5'}`}>
                <span className="bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-black text-[var(--color-training-primary)] uppercase shadow-sm">
                    {category}
                </span>
            </div>
            <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-bold text-sm mb-1 text-stone-800 line-clamp-1" title={title}>{title}</h3>
                <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                        <span className="material-symbols-outlined text-xs">calendar_month</span>
                        {date}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {formatTime(time)}
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-stone-100 pt-2.5">
                    {applyBefore && !isApplied && (
                        <div className="flex items-center gap-1 text-[10px] text-orange-600 font-bold bg-orange-50 px-1.5 py-1 rounded-md border border-orange-100">
                            <span className="material-symbols-outlined text-[14px]">event_busy</span>
                            Apply Before: {applyBefore}
                        </div>
                    )}
                    {isApplied ? (
                        <div className="inline-flex items-center justify-center gap-1 px-3 py-1.5 w-max bg-emerald-500/10 text-emerald-600 rounded-md font-bold text-[10px] ml-auto border border-emerald-200">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            Applied
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

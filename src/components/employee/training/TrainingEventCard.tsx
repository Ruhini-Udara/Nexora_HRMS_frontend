"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface TrainingEventProps {
    category: string;
    imageSrc: string;
    title: string;
    date: string;
    time: string;
    imageAlt: string;
    applyBefore?: string;
}

const TrainingEventCard: React.FC<TrainingEventProps> = ({
    category,
    imageSrc,
    title,
    date,
    time,
    imageAlt,
    applyBefore,
}) => {
    return (
        <div className="bg-white rounded-xl border border-stone-200 hover:border-[var(--color-training-primary)] transition-all hover:shadow-lg flex flex-col group">
            <div className="bg-[var(--color-training-primary)]/5 rounded-t-xl p-4 flex justify-end">
                <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-black text-[var(--color-training-primary)] uppercase shadow-sm">
                    {category}
                </span>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2 text-stone-800">{title}</h3>
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        {date}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {time}
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
                    {applyBefore && (
                        <div className="flex items-center gap-1.5 text-[11px] text-orange-600 font-bold bg-orange-50 px-2 py-1.5 rounded-md border border-orange-100">
                            <span className="material-symbols-outlined text-[14px]">event_busy</span>
                            Apply By: {applyBefore}
                        </div>
                    )}
                    <Link
                        href={`/employee/training-request/${title.toLowerCase().replace(/ /g, '-')}`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 w-max bg-[var(--color-training-primary)] text-white rounded-md font-bold text-[11px] hover:bg-[#853500] transition-colors cursor-pointer ml-auto"
                    >
                        <span className="material-symbols-outlined text-[13px]">send</span>
                        Apply Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TrainingEventCard;

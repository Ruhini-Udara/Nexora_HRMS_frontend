"use client";

import React from "react";

interface TrainingEventCardProps {
    title: string;
    date: string;
    time: string;
    category: string;
    hideActions?: boolean;
    onClick?: () => void;
    isSelected?: boolean;
}

export default function TrainingEventCard({
    title,
    date,
    time,
    category,
    hideActions,
    onClick,
    isSelected,
}: TrainingEventCardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl border transition-all hover:shadow-lg flex flex-col group ${onClick ? "cursor-pointer" : ""
                } ${isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-stone-200 hover:border-primary"
                }`}
        >
            <div className="bg-primary/5 rounded-t-xl p-2.5 flex justify-end">
                <span className="bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-black text-primary uppercase shadow-sm">
                    {category}
                </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-base mb-1.5 text-stone-800">{title}</h3>
                <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        {date}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {time}
                    </div>
                </div>
                {hideActions !== true && (
                    <div className="flex gap-2 mt-auto">
                        <button className="flex-1 py-1 bg-primary text-white rounded-lg font-bold text-xs hover:bg-[#853500] transition-colors flex items-center justify-center gap-1 shadow-sm shadow-primary/20">
                            <span className="material-symbols-outlined text-[13px]">edit</span>
                            Edit
                        </button>
                        <button className="flex-1 py-1 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition-colors flex items-center justify-center gap-1 border border-red-100">
                            <span className="material-symbols-outlined text-[13px]">delete</span>
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

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
    onDelete?: () => void;
    onView?: () => void;
    onEdit?: () => void;
}

export default function TrainingEventCard({
    title,
    date,
    time,
    category,
    hideActions,
    onClick,
    isSelected,
    onDelete,
    onView,
    onEdit,
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
            <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-bold text-sm mb-1 text-stone-800">{title}</h3>
                <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                        <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                        {date}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        {time}
                    </div>
                </div>
                {hideActions !== true && (
                    <div className="flex gap-1.5 mt-auto">
                        <button
                            className="flex-1 py-1 bg-stone-100 text-stone-700 rounded-lg font-bold text-[11px] hover:bg-stone-200 transition-colors flex items-center justify-center gap-1 border border-stone-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onView) onView();
                            }}
                        >
                            <span className="material-symbols-outlined text-[12px]">visibility</span>
                            View
                        </button>
                        <button
                            className="flex-1 py-1 bg-primary text-white rounded-lg font-bold text-[11px] hover:bg-[#853500] transition-colors flex items-center justify-center gap-1 shadow-sm shadow-primary/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) onEdit();
                            }}
                        >
                            <span className="material-symbols-outlined text-[12px]">edit</span>
                            Edit
                        </button>
                        <button
                            className="flex-1 py-1 bg-red-50 text-red-600 rounded-lg font-bold text-[11px] hover:bg-red-100 transition-colors flex items-center justify-center gap-1 border border-red-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onDelete) onDelete();
                            }}
                        >
                            <span className="material-symbols-outlined text-[12px]">delete</span>
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import React from "react";

// Props describing a single training event card
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
    status?: string;
    reason?: string;
}

// HR card UI
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
    status,
    reason,
}: TrainingEventCardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-slate-800 rounded-xl border transition-all hover:shadow-lg flex flex-col group relative ${onClick ? "cursor-pointer" : ""
                } ${isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-stone-200 dark:border-slate-700 hover:border-primary"
                }`}
        >
            <div className="bg-primary/5 rounded-t-xl p-2.5 flex justify-end">
                <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-black text-primary dark:text-primary-light uppercase shadow-sm">
                    {category}
                </span>
            </div>
            <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-bold text-sm mb-1 text-stone-800 dark:text-white pr-10">{title}</h3>
                <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                        {date}
                    </div>
                    <div className="flex items-center justify-between gap-1 text-[11px] text-stone-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {time}
                        </div>
                        {(status === 'Pending Admin Approval' || status === 'Approved') && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-green-200 shadow-sm">
                                Already Sent
                            </span>
                        )}
                        {status === 'Rejected' && (
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-red-200 shadow-sm">
                                Rejected
                            </span>
                        )}
                    </div>
                </div>

                {/* HR card actions: View / Edit / Delete */}
                {hideActions !== true && (
                    <div className="flex gap-1.5 mt-auto">
                        <button
                            className="flex-1 py-1 bg-stone-100 dark:bg-slate-700 text-stone-700 dark:text-slate-300 rounded-lg font-bold text-[11px] hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1 border border-stone-200 dark:border-slate-650"
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
                            className="flex-1 py-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg font-bold text-[11px] hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-1 border border-red-100 dark:border-red-900/30"
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

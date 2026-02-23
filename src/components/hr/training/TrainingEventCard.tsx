"use client";

import React from "react";

interface TrainingEventCardProps {
    title: string;
    date: string;
    time: string;
    category: string;
    image: string;
}

export default function TrainingEventCard({
    title,
    date,
    time,
    category,
    image,
}: TrainingEventCardProps) {
    return (
        <div className="bg-white rounded-xl border border-stone-200 hover:border-primary transition-all hover:shadow-lg group">
            <div className="h-32 bg-primary/5 rounded-t-xl overflow-hidden relative">
                <img
                    alt={title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform"
                    src={image}
                />
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-black text-primary uppercase shadow-sm">
                    {category}
                </span>
            </div>
            <div className="p-5">
                <h3 className="font-bold text-lg mb-2 text-stone-800">{title}</h3>
                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        {date}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {time}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-[#853500] transition-colors flex items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit
                    </button>
                    <button className="flex-1 py-2.5 bg-red-100 text-red-700 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

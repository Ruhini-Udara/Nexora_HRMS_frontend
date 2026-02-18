"use client";

import React from "react";
import Image from "next/image";

interface TrainingEventProps {
    category: string;
    imageSrc: string;
    title: string;
    date: string;
    time: string;
    imageAlt: string;
}

const TrainingEventCard: React.FC<TrainingEventProps> = ({
    category,
    imageSrc,
    title,
    date,
    time,
    imageAlt,
}) => {
    return (
        <div className="bg-white rounded-xl border border-stone-200 hover:border-[var(--color-training-primary)] transition-all hover:shadow-lg group overflow-hidden">
            <div className="h-32 bg-[var(--color-training-primary-light)] relative">
                <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    className="object-cover opacity-80 group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-black text-[var(--color-training-primary)] uppercase shadow-sm">
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
                <button className="w-full py-2.5 bg-[var(--color-training-primary)] text-white rounded-lg font-bold text-sm hover:bg-[#853500] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined text-sm">send</span>
                    Apply Now
                </button>
            </div>
        </div>
    );
};

export default TrainingEventCard;

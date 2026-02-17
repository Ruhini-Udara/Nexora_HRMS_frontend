import React from "react";

interface FeatureCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
    return (
        <div className="group relative bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-zinc-200 dark:border-zinc-700 hover:border-[#8B3A00] dark:hover:border-[#E5BA73] hover:-translate-y-1">
            {/* Corner accent */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#8B3A00] dark:border-[#E5BA73] rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#8B3A00] dark:border-[#E5BA73] rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Icon */}
            {icon && (
                <div className="mb-4 text-[#8B3A00] dark:text-[#E5BA73]">
                    {icon}
                </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold text-[#8B3A00] dark:text-[#E5BA73] mb-3">
                {title}
            </h3>

            {/* Description */}
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                {description}
            </p>
        </div>
    );
}

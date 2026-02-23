import React from 'react';

const UpcomingLeaves = () => {
    const upcoming = [
        {
            initials: "TH",
            name: "Thomas Hughes",
            details: "Maternity Cover • Starts in 2 days",
            date: "12 - 18 OCT",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            initials: "LR",
            name: "Lisa Ray",
            details: "Annual • Starts in 5 days",
            date: "15 - 20 OCT",
            color: "text-secondary",
            bg: "bg-secondary/10"
        }
    ];

    return (
        <div className="flex-1 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-primary/5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Upcoming Leaves</h4>
            <div className="space-y-4">
                {upcoming.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`size-8 ${item.bg} rounded-full flex items-center justify-center ${item.color} font-bold text-[10px]`}>
                                {item.initials}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-800 dark:text-white">{item.name}</p>
                                <p className="text-[10px] text-gray-500">{item.details}</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">{item.date}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingLeaves;

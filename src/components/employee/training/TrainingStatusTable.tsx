"use client";

import React from "react";

interface TrainingRequest {
    id: number;
    name: string;
    category: string;
    status: "Approved" | "Pending" | "Rejected";
    date: string;
    time: string;
    canReview: boolean;
}

const requests: TrainingRequest[] = [
    {
        id: 1,
        name: "Customer Success Workshop",
        category: "Soft Skills",
        status: "Approved",
        date: "Oct 18, 2023",
        time: "10:00 AM - 01:00 PM",
        canReview: true,
    },
    {
        id: 2,
        name: "Advanced Negotiation Skills",
        category: "Sales",
        status: "Pending",
        date: "Oct 30, 2023",
        time: "09:00 AM - 12:00 PM",
        canReview: false,
    },
    {
        id: 3,
        name: "Python for Sales Automation",
        category: "Technical",
        status: "Rejected",
        date: "Nov 05, 2023",
        time: "All Day Session",
        canReview: false,
    },
];

interface TrainingStatusTableProps {
    onFeedbackClick: () => void;
}

const TrainingStatusTable: React.FC<TrainingStatusTableProps> = ({ onFeedbackClick }) => {
    return (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-stone-50 border-b border-stone-100">
                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                            Training Name
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                            Status
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                            Date & Time
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-center">
                            Actions
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-center">
                            Feedback
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {requests.map((request) => (
                        <tr
                            key={request.id}
                            className={`hover:bg-stone-50 transition-colors ${request.status === "Rejected" ? "opacity-70 bg-stone-50/50" : ""
                                }`}
                        >
                            <td className="px-6 py-5">
                                <p className="font-bold text-stone-800">{request.name}</p>
                                <p className="text-[10px] text-stone-400 font-medium">
                                    Category: {request.category}
                                </p>
                            </td>
                            <td className="px-6 py-5">
                                <span
                                    className={`px-2.5 py-1 text-[10px] font-black uppercase rounded flex items-center gap-1 w-fit ${request.status === "Approved"
                                            ? "bg-green-100 text-green-700"
                                            : request.status === "Pending"
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    <span
                                        className="material-symbols-outlined text-[12px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        {request.status === "Approved"
                                            ? "check_circle"
                                            : request.status === "Pending"
                                                ? "pending"
                                                : "cancel"}
                                    </span>
                                    {request.status}
                                </span>
                            </td>
                            <td className="px-6 py-5">
                                <p className="text-sm text-stone-600 font-medium">{request.date}</p>
                                <p className="text-xs text-stone-400">{request.time}</p>
                            </td>
                            <td className="px-6 py-5">
                                {request.status === "Approved" ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <button className="px-3 py-1.5 bg-[var(--color-training-primary)] text-white text-[11px] font-bold rounded hover:bg-[#853500] transition-colors cursor-pointer">
                                            Confirm Attendance
                                        </button>
                                        <button className="px-3 py-1.5 bg-stone-100 text-stone-600 text-[11px] font-bold rounded hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
                                            Reject
                                        </button>
                                    </div>
                                ) : request.status === "Pending" ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <button className="px-3 py-1.5 border border-stone-200 text-stone-400 text-[11px] font-bold rounded cursor-not-allowed">
                                            Actions Restricted
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <button className="text-stone-400 text-[11px] font-bold underline hover:text-stone-600 cursor-pointer">
                                            View Reason
                                        </button>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-5 text-center">
                                <button
                                    className={`text-[11px] font-bold flex items-center gap-1 justify-center mx-auto ${request.canReview
                                            ? "text-[var(--color-training-primary)] hover:underline cursor-pointer"
                                            : "text-stone-300 cursor-not-allowed"
                                        }`}
                                    disabled={!request.canReview}
                                    onClick={request.canReview ? onFeedbackClick : undefined}
                                >
                                    <span className="material-symbols-outlined text-sm">rate_review</span>{" "}
                                    Give Feedback
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="p-6 bg-stone-50 flex items-center justify-between border-t border-stone-100">
                <p className="text-xs text-stone-400 font-medium">
                    Showing 3 of 15 past applications
                </p>
                <div className="flex gap-1">
                    <button className="size-8 flex items-center justify-center rounded border border-stone-200 text-stone-400 hover:bg-white hover:text-[var(--color-training-primary)] transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button className="size-8 flex items-center justify-center rounded border border-[var(--color-training-primary)] bg-[var(--color-training-primary)] text-white font-bold text-xs cursor-pointer">
                        1
                    </button>
                    <button className="size-8 flex items-center justify-center rounded border border-stone-200 text-stone-600 hover:bg-white hover:text-[var(--color-training-primary)] font-bold text-xs cursor-pointer">
                        2
                    </button>
                    <button className="size-8 flex items-center justify-center rounded border border-stone-200 text-stone-400 hover:bg-white hover:text-[var(--color-training-primary)] transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrainingStatusTable;

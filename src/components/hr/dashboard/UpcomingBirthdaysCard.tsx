"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

interface Employee {
    id: number;
    fullName: string;
    dateOfBirth: string;
}

export default function UpcomingBirthdaysCard() {
    const { data: birthdays = [], isLoading } = useQuery<Employee[]>({
        queryKey: ["upcomingBirthdays"],
        queryFn: async () => {
            const res = await api.get("/api/employees/upcoming-birthdays");
            return res.data;
        },
    });

    const formatBirthday = (dobString: string) => {
        if (!dobString) return "";
        const date = new Date(dobString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark flex items-start justify-between card-shadow h-full">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Birthdays</p>
                {isLoading ? (
                    <div className="animate-pulse space-y-3 mt-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                ) : (
                    <>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 mb-2">
                            {birthdays.length}
                        </h3>
                        <p className="text-xs text-primary font-medium mb-3">This Week</p>
                        <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                            {birthdays.length > 0 ? (
                                birthdays.map((emp) => (
                                    <li key={emp.id} className="flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-primary/60"></span>
                                        <span className="font-medium text-gray-900 dark:text-white">{emp.fullName}</span>
                                        <span className="text-gray-400 dark:text-gray-500">- {formatBirthday(emp.dateOfBirth)}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500 italic">No birthdays this week</li>
                            )}
                        </ul>
                    </>
                )}
            </div>
            <div className="w-12 h-12 bg-pink-500/10 flex items-center justify-center rounded-lg shrink-0 ml-4">
                <span className="text-2xl">🎂</span>
            </div>
        </div>
    );
}

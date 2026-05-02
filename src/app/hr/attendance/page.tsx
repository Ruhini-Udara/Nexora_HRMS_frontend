"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/axiosInstance";

type AttendanceDailySummary = {
    employeeCode: string;
    employeeName: string;
    department: string;
    attendanceDate: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    fingerprintUserId: number | null;
    source: string;
};

type AttendanceFilters = {
    date: string;
    startDate: string;
    endDate: string;
    employeeCode: string;
    department: string;
};

const initialFilters: AttendanceFilters = {
    date: "",
    startDate: "",
    endDate: "",
    employeeCode: "",
    department: "",
};

function formatDate(value: string | null) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en-CA").format(new Date(`${value}T00:00:00`));
}

function formatTime(value: string | null) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export default function AttendancePage() {
    const [summaries, setSummaries] = useState<AttendanceDailySummary[]>([]);
    const [filters, setFilters] = useState<AttendanceFilters>(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState<AttendanceFilters>(initialFilters);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const queryParams = useMemo(() => {
        const params: Record<string, string> = {};

        if (appliedFilters.date) {
            params.date = appliedFilters.date;
        } else {
            if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
            if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;
        }

        if (appliedFilters.employeeCode.trim()) {
            params.employeeCode = appliedFilters.employeeCode.trim();
        }

        if (appliedFilters.department.trim()) {
            params.department = appliedFilters.department.trim();
        }

        return params;
    }, [appliedFilters]);

    useEffect(() => {
        const fetchSummaries = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await api.get<AttendanceDailySummary[]>("/api/attendance/daily", {
                    params: queryParams,
                });
                setSummaries(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Error fetching attendance summaries:", err);
                setError("Unable to load attendance summaries.");
                setSummaries([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSummaries();
    }, [queryParams]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAppliedFilters(filters);
    };

    const handleClear = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Daily Attendance
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        View processed attendance records from fingerprint device punches.
                    </p>
                </div>
                <Link
                    href="/hr/attendance/sync-runs"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Sync Logs
                </Link>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-5 mb-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(event) => setFilters({ ...filters, date: event.target.value })}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            disabled={Boolean(filters.date)}
                            onChange={(event) => setFilters({ ...filters, startDate: event.target.value })}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20 disabled:bg-slate-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            disabled={Boolean(filters.date)}
                            onChange={(event) => setFilters({ ...filters, endDate: event.target.value })}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20 disabled:bg-slate-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            Employee Code
                        </label>
                        <input
                            type="text"
                            value={filters.employeeCode}
                            onChange={(event) => setFilters({ ...filters, employeeCode: event.target.value })}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                            placeholder="EMP001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            Department
                        </label>
                        <input
                            type="text"
                            value={filters.department}
                            onChange={(event) => setFilters({ ...filters, department: event.target.value })}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                            placeholder="HR"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-5">
                    <button
                        type="submit"
                        className="h-10 px-4 rounded-lg bg-amber-900 text-white text-sm font-semibold hover:bg-amber-800 transition-colors"
                    >
                        Apply Filters
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="h-10 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </form>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Employee Code
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Employee Name
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Check-in
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Check-out
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Source
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                                        Loading attendance summaries...
                                    </td>
                                </tr>
                            ) : summaries.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                                        No attendance summaries found.
                                    </td>
                                </tr>
                            ) : (
                                summaries.map((summary) => (
                                    <tr
                                        key={`${summary.employeeCode}-${summary.attendanceDate}`}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-5 font-bold text-amber-900">
                                            {summary.employeeCode}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                                            {summary.employeeName}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {summary.department}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {formatDate(summary.attendanceDate)}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {formatTime(summary.checkInTime)}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {formatTime(summary.checkOutTime)}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                                {summary.source}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

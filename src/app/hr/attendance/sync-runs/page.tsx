"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axiosInstance";

type AttendanceSyncRun = {
    id: number;
    deviceCode: string | null;
    deviceName: string | null;
    startedAt: string | null;
    completedAt: string | null;
    receivedCount: number;
    insertedCount: number;
    duplicateCount: number;
    failedCount: number;
    status: string;
    message: string | null;
};

function formatDateTime(value: string | null) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function statusClass(status: string) {
    if (status === "SUCCESS") {
        return "bg-emerald-100 text-emerald-800";
    }
    if (status === "PARTIAL_SUCCESS") {
        return "bg-amber-100 text-amber-800";
    }
    if (status === "FAILED") {
        return "bg-red-100 text-red-800";
    }
    return "bg-slate-100 text-slate-700";
}

export default function AttendanceSyncRunsPage() {
    const [syncRuns, setSyncRuns] = useState<AttendanceSyncRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSyncRuns = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await api.get<AttendanceSyncRun[]>("/api/attendance/sync-runs");
                setSyncRuns(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Error fetching attendance sync runs:", err);
                setError("Unable to load attendance sync logs.");
                setSyncRuns([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSyncRuns();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Attendance Sync Logs
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Review fingerprint device punch ingestion runs and diagnostics.
                    </p>
                </div>
                <Link
                    href="/hr/attendance"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Daily Attendance
                </Link>
            </div>

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
                                    Device Code
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Started
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Completed
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Received
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Inserted
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Duplicate
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Failed
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Message
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-10 text-center text-sm text-slate-500">
                                        Loading sync logs...
                                    </td>
                                </tr>
                            ) : syncRuns.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-10 text-center text-sm text-slate-500">
                                        No sync logs found.
                                    </td>
                                </tr>
                            ) : (
                                syncRuns.map((syncRun) => (
                                    <tr key={syncRun.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-amber-900">
                                                {syncRun.deviceCode ?? "-"}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {syncRun.deviceName ?? ""}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {formatDateTime(syncRun.startedAt)}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {formatDateTime(syncRun.completedAt)}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {syncRun.receivedCount}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {syncRun.insertedCount}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {syncRun.duplicateCount}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {syncRun.failedCount}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusClass(syncRun.status)}`}>
                                                {syncRun.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600 max-w-md">
                                            {syncRun.message ?? "-"}
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

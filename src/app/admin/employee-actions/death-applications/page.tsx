"use client";

import React, { useState, useEffect } from "react";
import { getAllDeathRequests, executeDeathRequest, DeathRequest } from "@/lib/api/deathRequests";
import { Toast } from "@/components/ui/Toast";
import Link from "next/link";
import { format } from "date-fns";

export default function DeathApplicationsExecutionPage() {
    const [requests, setRequests] = useState<DeathRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const isApprovedStatus = (status: string | undefined | null) => {
        if (!status) return false;
        const s = String(status).trim().toUpperCase();
        return s === "APPROVED" || s === "BOARD APPROVED";
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getAllDeathRequests();
            // Filter both APPROVED and Board Approved requests
            const approved = data.filter((req) => isApprovedStatus(req.status));
            setRequests(approved);
        } catch (error) {
            setToast({
                message: "Failed to load death requests",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleExecute = async (id: string) => {
        try {
            setExecuting(id);
            await executeDeathRequest(id);
            setToast({
                message: "The employee's death application has been executed and their account deactivated.",
                type: "success",
            });
            await fetchRequests(); // Refresh the list
        } catch (error) {
            setToast({
                message: "Failed to execute death application. Please try again.",
                type: "error",
            });
        } finally {
            setExecuting(null);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Link href="/admin/employee-actions" className="text-slate-400 hover:text-[#8B3A00] transition-colors cursor-pointer flex items-center">
                        <span className="material-symbols-outlined text-[28px]">arrow_back</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Death Application Executions
                    </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 ml-10">
                    View approved death applications and execute offboarding updates.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date of Death</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Requester</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-[#8B3A00] border-t-transparent animate-spin"></div>
                                            Loading requests...
                                        </div>
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                        No approved death applications pending execution.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#8B3A00]/10 text-[#8B3A00] flex items-center justify-center font-bold text-xs shrink-0">
                                                    {req.employeeName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{req.employeeName}</p>
                                                    <p className="text-xs text-gray-500">EPF: {req.epfNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {req.dateOfDeath ? format(new Date(req.dateOfDeath), "MMM dd, yyyy") : "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{req.requesterName}</p>
                                            <p className="text-xs text-gray-500">{req.requesterBranch}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleExecute(req.id)}
                                                disabled={executing === req.id}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B3A00] hover:bg-[#8B3A00]/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {executing === req.id ? (
                                                    <>
                                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                                        Executing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-[18px]">person_off</span>
                                                        Execute Action
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

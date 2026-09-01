"use client";

import React, { useState, useEffect } from "react";
import { getAllTransferRequests, executeTransfer, TransferRequest } from "@/lib/api/transferRequests";
import { Toast } from "@/components/ui/Toast";
import Link from "next/link";
import { format } from "date-fns";

export default function TransfersExecutionPage() {
    const [activeTab, setActiveTab] = useState<"today" | "upcoming">("today");
    const [requests, setRequests] = useState<TransferRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getAllTransferRequests();
            // Filter only APPROVED requests
            const approved = data.filter((req) => req.status === "APPROVED");
            setRequests(approved);
        } catch (error) {
            setToast({
                message: "Failed to load transfer requests",
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
            await executeTransfer(id);
            setToast({
                message: "The employee's branch has been successfully updated.",
                type: "success",
            });
            await fetchRequests(); // Refresh the list
        } catch (error) {
            setToast({
                message: "Failed to execute transfer. Please try again.",
                type: "error",
            });
        } finally {
            setExecuting(null);
        }
    };

    const getTodayDateStr = () => {
        const today = new Date();
        return format(today, "yyyy-MM-dd");
    };

    const filteredRequests = requests.filter((req) => {
        const todayStr = getTodayDateStr();
        const expectedDate = req.expectedDate || todayStr; // fallback if missing
        
        if (activeTab === "today") {
            // Effective date is today or earlier
            return expectedDate <= todayStr;
        } else {
            // Effective date is in the future
            return expectedDate > todayStr;
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Link href="/admin/employee-actions" className="text-slate-400 hover:text-[#8B3A00] transition-colors cursor-pointer flex items-center">
                        <span className="material-symbols-outlined text-[28px]">arrow_back</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Transfer Executions
                    </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 ml-10">
                    View approved transfers and execute branch updates.
                </p>
            </div>

            <div className="flex space-x-1 border-b border-gray-200 dark:border-slate-800 mb-6">
                <button
                    onClick={() => setActiveTab("today")}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                        activeTab === "today"
                            ? "text-[#8B3A00] dark:text-[#E85C0D]"
                            : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                    }`}
                >
                    Today (Ready)
                    {activeTab === "today" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B3A00] dark:bg-[#E85C0D]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                        activeTab === "upcoming"
                            ? "text-[#8B3A00] dark:text-[#E85C0D]"
                            : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                    }`}
                >
                    Upcoming
                    {activeTab === "upcoming" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B3A00] dark:bg-[#E85C0D]" />
                    )}
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Movement</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Effective Date</th>
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
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                        No requests available for this selection.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{req.currentBranch}</span>
                                                <span className="material-symbols-outlined text-[16px] text-[#8B3A00] mx-1">arrow_forward</span>
                                                <span className="text-sm font-bold text-[#8B3A00] dark:text-[#E85C0D]">{req.targetBranch}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {req.expectedDate ? format(new Date(req.expectedDate), "MMM dd, yyyy") : "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {activeTab === "today" ? (
                                                <button
                                                    onClick={() => handleExecute(req.id)}
                                                    disabled={executing === req.id}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B3A00] hover:bg-[#8B3A00]/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {executing === req.id ? (
                                                        <>
                                                            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                                            Executing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                            Execute Action
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Execution blocked until {req.expectedDate}</span>
                                            )}
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

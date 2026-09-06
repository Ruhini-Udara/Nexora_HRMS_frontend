"use client";

import React, { useState, useEffect } from "react";
import { getAllTransferRequests, executeTransfer, TransferRequest } from "@/lib/api/transferRequests";
import { Toast } from "@/components/ui/Toast";
import Link from "next/link";
import { format } from "date-fns";

export default function TransfersExecutionPage() {
    const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "previous" | "executed">("today");
    const [pendingRequests, setPendingRequests] = useState<TransferRequest[]>([]);
    const [executedRequests, setExecutedRequests] = useState<TransferRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calendar / Date filter state for Executed tab
    const [selectedDate, setSelectedDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
    const [showAllDates, setShowAllDates] = useState(false);

    const isApprovedStatus = (status: string | undefined | null) => {
        if (!status) return false;
        const s = String(status).trim().toUpperCase();
        return s === "APPROVED" || s === "BOARD APPROVED";
    };

    const isExecutedStatus = (status: string | undefined | null) => {
        if (!status) return false;
        const s = String(status).trim().toUpperCase();
        return s === "EXECUTED";
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getAllTransferRequests();
            const approved = data.filter((req) => isApprovedStatus(req.status));
            const executed = data.filter((req) => isExecutedStatus(req.status));
            setPendingRequests(approved);
            setExecutedRequests(executed);
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

    const handleTabChange = (tab: "today" | "upcoming" | "previous" | "executed") => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleExecute = async (id: string) => {
        try {
            setExecuting(id);
            await executeTransfer(id);
            setToast({
                message: "The employee's branch has been successfully updated.",
                type: "success",
            });
            await fetchRequests();
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

    const getExecutionDateStr = (req: TransferRequest) => {
        if (req.updatedAt) return req.updatedAt.split('T')[0];
        if (req.expectedDate) return req.expectedDate.split('T')[0];
        if (req.createdAt) return req.createdAt.split('T')[0];
        return "";
    };

    const formatDisplayDateTime = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        try {
            return format(new Date(dateStr), "MMM dd, yyyy 'at' hh:mm a");
        } catch {
            return dateStr;
        }
    };

    // Filter pending requests for today, upcoming, previous
    const filteredPending = pendingRequests.filter((req) => {
        const todayStr = getTodayDateStr();
        const rawDate = req.expectedDate ? req.expectedDate.split('T')[0] : todayStr;
        
        if (activeTab === "today") {
            return rawDate === todayStr;
        } else if (activeTab === "upcoming") {
            return rawDate > todayStr;
        } else if (activeTab === "previous") {
            return rawDate < todayStr;
        }
        return true;
    });

    // Filter executed requests by selected calendar date
    const filteredExecuted = executedRequests.filter((req) => {
        if (showAllDates) return true;
        const execDate = getExecutionDateStr(req);
        return execDate === selectedDate;
    }).sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
    });

    const activeList = activeTab === "executed" ? filteredExecuted : filteredPending;
    const totalPages = Math.ceil(activeList.length / itemsPerPage);
    const paginatedRequests = activeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const renderTableRow = (req: TransferRequest, isPrintMode = false) => (
        <tr key={req.id + (isPrintMode ? "-print" : "")} className="hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-colors print:hover:bg-transparent">
            <td className="px-6 py-4 print:py-2.5 print:px-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8B3A00]/10 text-[#8B3A00] flex items-center justify-center font-bold text-xs shrink-0 print:border print:border-gray-400">
                        {req.employeeName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white print:text-black">{req.employeeName}</p>
                        <p className="text-xs text-gray-500 print:text-gray-700">EPF: {req.epfNumber}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 print:py-2.5 print:px-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 print:text-black">{req.currentBranch}</span>
                    <span className="material-symbols-outlined text-[16px] text-[#8B3A00] mx-1 print:text-black">arrow_forward</span>
                    <span className="text-sm font-bold text-[#8B3A00] dark:text-[#E85C0D] print:text-black">{req.targetBranch}</span>
                </div>
                {req.transferType && (
                    <span className="text-[11px] text-slate-400 print:text-gray-600 mt-0.5 block">{req.transferType}</span>
                )}
            </td>
            {activeTab === "executed" ? (
                <>
                    <td className="px-6 py-4 print:py-2.5 print:px-3 text-sm font-medium text-gray-900 dark:text-white print:text-black">
                        {formatDisplayDateTime(req.updatedAt || req.createdAt)}
                    </td>
                    <td className="px-6 py-4 print:py-2.5 print:px-3 text-sm text-gray-600 dark:text-gray-300 print:text-gray-800">
                        {req.expectedDate ? format(new Date(req.expectedDate), "MMM dd, yyyy") : "N/A"}
                    </td>
                </>
            ) : (
                <td className="px-6 py-4 print:py-2.5 print:px-3 text-sm text-gray-600 dark:text-gray-300 print:text-gray-800">
                    {req.expectedDate ? format(new Date(req.expectedDate), "MMM dd, yyyy") : "N/A"}
                </td>
            )}
            <td className="px-6 py-4 print:py-2.5 print:px-3">
                {activeTab === "executed" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 print:bg-white print:text-black print:border-gray-500">
                        <span className="material-symbols-outlined text-[14px] print:hidden">check_circle</span>
                        EXECUTED
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 print:bg-white print:text-black print:border-gray-500">
                        {req.status}
                    </span>
                )}
            </td>
            {activeTab !== "executed" && (
                <td className="px-6 py-4 text-right print:hidden">
                    {activeTab === "upcoming" ? (
                        <span className="text-xs text-slate-400 italic">Execution blocked until {req.expectedDate}</span>
                    ) : (
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
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    Execute Action
                                </>
                            )}
                        </button>
                    )}
                </td>
            )}
        </tr>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 print:p-0 print:m-0 print:max-w-none">
            {/* Screen Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/employee-actions" className="text-slate-400 hover:text-[#8B3A00] transition-colors cursor-pointer flex items-center">
                            <span className="material-symbols-outlined text-[28px]">arrow_back</span>
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Transfer Executions
                        </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 ml-10">
                        View approved transfers and execute branch updates, or review past executions by date.
                    </p>
                </div>

                {activeTab === "executed" && (
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs transition-colors cursor-pointer self-start sm:self-center shrink-0"
                        title="Print executed list"
                    >
                        <span className="material-symbols-outlined text-[20px] text-[#8B3A00] dark:text-[#E85C0D]">print</span>
                        Print List
                    </button>
                )}
            </div>

            {/* Print-Only Document Header (only for executed list) */}
            {activeTab === "executed" && (
                <div className="hidden print:block mb-4 border-b border-gray-300 pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-black uppercase tracking-wide">HR MATE — Transfer Executions Report</h1>
                            <p className="text-xs text-gray-600 mt-1">
                                Filter View: <strong>Executed History</strong>
                                <span> • Date: <strong>{showAllDates ? "All Recorded Dates" : (selectedDate ? format(new Date(selectedDate + "T00:00:00"), "MMM dd, yyyy") : "N/A")}</strong></span>
                                <span> • Printed On: <strong>{format(new Date(), "MMM dd, yyyy 'at' hh:mm a")}</strong></span>
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-gray-700 border border-gray-300 px-3 py-1 rounded">
                                Total Records: {activeList.length}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex space-x-1 border-b border-gray-200 dark:border-slate-800 mb-6 overflow-x-auto print:hidden">
                <button
                    onClick={() => handleTabChange("today")}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative cursor-pointer whitespace-nowrap flex items-center gap-2 ${
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
                    onClick={() => handleTabChange("upcoming")}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative cursor-pointer whitespace-nowrap flex items-center gap-2 ${
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
                <button
                    onClick={() => handleTabChange("previous")}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                        activeTab === "previous"
                            ? "text-[#8B3A00] dark:text-[#E85C0D]"
                            : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                    }`}
                >
                    Previous
                    {activeTab === "previous" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B3A00] dark:bg-[#E85C0D]" />
                    )}
                </button>
                <button
                    onClick={() => handleTabChange("executed")}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                        activeTab === "executed"
                            ? "text-[#8B3A00] dark:text-[#E85C0D]"
                            : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Executed History
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold">
                        {executedRequests.length}
                    </span>
                    {activeTab === "executed" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B3A00] dark:bg-[#E85C0D]" />
                    )}
                </button>
            </div>

            {/* Date Filter Bar for Executed Tab */}
            {activeTab === "executed" && (
                <div className="mb-6 p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-[#8B3A00] dark:text-[#E85C0D] font-semibold text-sm">
                            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                            <span>Filter by Execution Date:</span>
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setShowAllDates(false);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#8B3A00] focus:outline-none cursor-pointer"
                        />
                        <button
                            onClick={() => {
                                setSelectedDate(getTodayDateStr());
                                setShowAllDates(false);
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                selectedDate === getTodayDateStr() && !showAllDates
                                    ? "bg-[#8B3A00] text-white"
                                    : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                            }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => {
                                setShowAllDates(!showAllDates);
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                showAllDates
                                    ? "bg-[#8B3A00] text-white"
                                    : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                            }`}
                        >
                            {showAllDates ? "Showing All Dates" : "Show All Executed"}
                        </button>
                    </div>

                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {showAllDates ? (
                            <span>Showing all <strong>{filteredExecuted.length}</strong> executed record(s)</span>
                        ) : (
                            <span>
                                <strong>{filteredExecuted.length}</strong> employee(s) executed on{" "}
                                <strong className="text-slate-800 dark:text-slate-200">
                                    {selectedDate ? format(new Date(selectedDate + "T00:00:00"), "MMMM dd, yyyy") : "N/A"}
                                </strong>
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className={`bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm ${activeTab === "executed" ? "print:border print:border-gray-300 print:shadow-none print:rounded-none" : "print:hidden"}`}>
                <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full text-left border-collapse print:w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 print:bg-gray-100 print:border-b print:border-gray-300">
                                <th className="px-6 py-4 print:py-2.5 print:px-3 text-xs font-bold text-gray-500 dark:text-slate-400 print:text-black uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 print:py-2.5 print:px-3 text-xs font-bold text-gray-500 dark:text-slate-400 print:text-black uppercase tracking-wider">Branch Movement</th>
                                {activeTab === "executed" ? (
                                    <>
                                        <th className="px-6 py-4 print:py-2.5 print:px-3 text-xs font-bold text-gray-500 dark:text-slate-400 print:text-black uppercase tracking-wider">Execution Date</th>
                                        <th className="px-6 py-4 print:py-2.5 print:px-3 text-xs font-bold text-gray-500 dark:text-slate-400 print:text-black uppercase tracking-wider">Effective Date</th>
                                    </>
                                ) : (
                                    <th className="px-6 py-4 print:py-2.5 print:px-3 text-xs font-bold text-gray-500 dark:text-slate-400 print:text-black uppercase tracking-wider">Effective Date</th>
                                )}
                                <th className="px-6 py-4 print:py-2.5 print:px-3 text-xs font-bold text-gray-500 dark:text-slate-400 print:text-black uppercase tracking-wider">Status</th>
                                {activeTab !== "executed" && (
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right print:hidden">Actions</th>
                                )}
                            </tr>
                        </thead>

                        {/* On-screen paginated table body */}
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800 print:hidden">
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === "executed" ? 4 : 5} className="px-6 py-8 text-center text-sm text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-[#8B3A00] border-t-transparent animate-spin"></div>
                                            Loading requests...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === "executed" ? 4 : 5} className="px-6 py-12 text-center text-sm text-gray-500">
                                        {activeTab === "executed" ? (
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-4xl text-slate-400">event_busy</span>
                                                <p className="font-semibold text-slate-700 dark:text-slate-300">
                                                    No executed transfers found for {showAllDates ? "any date" : (selectedDate ? format(new Date(selectedDate + "T00:00:00"), "MMM dd, yyyy") : "selected date")}.
                                                </p>
                                                {!showAllDates && (
                                                    <button
                                                        onClick={() => setShowAllDates(true)}
                                                        className="mt-1 text-xs text-[#8B3A00] dark:text-[#E85C0D] font-semibold underline cursor-pointer"
                                                    >
                                                        Click here to view all executed transfers across all dates
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            "No requests available for this selection."
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequests.map((req) => renderTableRow(req, false))
                            )}
                        </tbody>

                        {/* Print-only full list table body (prints all matching rows without pagination cuts) */}
                        <tbody className="divide-y divide-gray-300 hidden print:table-row-group">
                            {activeList.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === "executed" ? 4 : 4} className="py-6 text-center text-sm text-gray-500">
                                        No records found for this selection.
                                    </td>
                                </tr>
                            ) : (
                                activeList.map((req) => renderTableRow(req, true))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls (hidden when printing) */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between print:hidden">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, activeList.length)} of {activeList.length} requests
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        currentPage === i + 1
                                            ? 'bg-[#8B3A00] text-white shadow-md shadow-[#8B3A00]/20'
                                            : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {toast && (
                <div className="print:hidden">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}
        </div>
    );
}

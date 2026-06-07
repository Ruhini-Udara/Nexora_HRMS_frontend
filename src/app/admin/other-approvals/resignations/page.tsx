"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAllResignationRequests, updateResignationStatus, ResignationRequest } from "@/lib/api/resignationRequests";

export default function AdminResignationsPage() {
    const [requests, setRequests] = useState<ResignationRequest[]>([]);
    const [activeTab, setActiveTab] = useState<"preparation" | "management">("preparation");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [boardDate, setBoardDate] = useState<string>("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [filterDate, setFilterDate] = useState<string>("All");

    const fetchRequests = useCallback(async () => {
        try {
            const data = await getAllResignationRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch resignations:', error);
        }
    }, []);

    useEffect(() => {
        (async () => {
            await fetchRequests();
        })();
    }, [fetchRequests]);

    const handleCheckboxToggle = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const approvedIds = requests.filter(r => r.status === "PENDING_ADMIN").map(r => r.id);
            setSelectedIds(approvedIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handlePrepareList = async () => {
        if (!boardDate) {
            alert("Please select a Board Gathering Date first.");
            return;
        }
        if (selectedIds.length === 0) {
            alert("Please select at least one application.");
            return;
        }

        try {
            await Promise.all(
                selectedIds.map((id) => updateResignationStatus(id, "SUBMITTED_FOR_ADMIN_APPROVAL", undefined, boardDate))
            );
            await fetchRequests();
            setSelectedIds([]);
            setFilterDate(boardDate);
            setBoardDate("");
            setActiveTab("management");
        } catch (error) {
            console.error('Failed to prepare list:', error);
        }
    };

    const handlePrintList = () => {
        window.print();
    };

    const handleConfirmSubmitToDirector = async () => {
        try {
            const batchToSubmit = requests.filter(r => {
                if (r.status !== "SUBMITTED_FOR_ADMIN_APPROVAL") return false;
                if (filterDate !== "All" && r.boardMeetingDate !== filterDate) return false;
                return true;
            });

            await Promise.all(
                batchToSubmit.map((req) => updateResignationStatus(req.id, "Pending Director"))
            );
            await fetchRequests();
            setShowConfirmModal(false);
        } catch (error) {
            console.error('Failed to submit to director:', error);
        }
    };

    const preparationList = requests.filter(r => r.status === "PENDING_ADMIN");
    const availableDates = Array.from(new Set(requests.filter(r => r.status === "SUBMITTED_FOR_ADMIN_APPROVAL" && r.boardMeetingDate).map(r => r.boardMeetingDate as string)));
    
    const managementList = requests.filter(r => {
        if (r.status !== "SUBMITTED_FOR_ADMIN_APPROVAL") return false;
        if (filterDate !== "All" && r.boardMeetingDate !== filterDate) return false;
        return true;
    });

    const isAllSelected = preparationList.length > 0 && selectedIds.length === preparationList.length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between print:hidden">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/admin/other-approvals" className="text-slate-400 hover:text-[#8B3A00] transition-colors cursor-pointer">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                                Resignation Board Approvals
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 ml-9">
                            Review submitted resignations, prepare batches, and manage board gathering approvals.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-slate-200 dark:border-slate-700 print:hidden">
                    <div className="flex gap-0 relative">
                        <button
                            onClick={() => setActiveTab("preparation")}
                            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all cursor-pointer relative ${activeTab === "preparation"
                                ? "border-[#8B3A00] text-[#8B3A00]"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                            disabled={activeTab === "preparation"}
                        >
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">list_alt</span>
                                1. Preparation of Pending List
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("management")}
                            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all cursor-pointer relative ${activeTab === "management"
                                ? "border-[#8B3A00] text-[#8B3A00]"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                            disabled={activeTab === "management"}
                        >
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">gavel</span>
                                2. Management of Pending Board Approvals
                                {requests.filter(r => r.status === "SUBMITTED_FOR_ADMIN_APPROVAL").length > 0 && (
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs ml-1">
                                        {requests.filter(r => r.status === "SUBMITTED_FOR_ADMIN_APPROVAL").length}
                                    </span>
                                )}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Stage 1: Preparation */}
                {activeTab === "preparation" && (
                    <div className="space-y-6 print:hidden">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2 flex-1 max-w-sm">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Select Board Gathering Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
                                    </div>
                                    <input
                                        type="date"
                                        value={boardDate}
                                        onChange={(e) => setBoardDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B3A00]/50 focus:border-[#8B3A00]"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Pick a future date for the board meeting review.</p>
                            </div>

                            <div>
                                <button
                                    onClick={handlePrepareList}
                                    className="w-full md:w-auto px-6 py-2.5 bg-[#8B3A00] hover:bg-[#8B3A00]/90 text-white font-bold rounded-lg text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">inventory</span>
                                    Prepare Pending Resignation List
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                                    Submitted Applications Available to Batch
                                </h3>
                                <span className="text-xs font-semibold text-slate-500 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full">
                                    {preparationList.length} Items Found
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800">
                                            <th className="py-4 px-6 w-12">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-[#8B3A00] focus:ring-[#8B3A00] cursor-pointer"
                                                    checked={isAllSelected}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="py-4 px-6">Request ID</th>
                                            <th className="py-4 px-6">Employee Name</th>
                                            <th className="py-4 px-6">Designation</th>
                                            <th className="py-4 px-6">Resignation Date</th>
                                            <th className="py-4 px-6">Last Working Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {preparationList.map((req) => (
                                            <tr key={req.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300 text-[#8B3A00] focus:ring-[#8B3A00] cursor-pointer"
                                                        checked={selectedIds.includes(req.id)}
                                                        onChange={() => handleCheckboxToggle(req.id)}
                                                    />
                                                </td>
                                                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">{req.id}</td>
                                                <td className="py-4 px-6">{req.employeeName}</td>
                                                <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{req.designation}</td>
                                                <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{req.resignationDate}</td>
                                                <td className="py-4 px-6">{req.lastWorkingDate}</td>
                                            </tr>
                                        ))}
                                        {preparationList.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-slate-500">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-4xl text-slate-300">done_all</span>
                                                        <p>No submitted requests pending batch creation.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stage 2: Management */}
                {activeTab === "management" && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-end gap-6 print:hidden">
                            <div className="space-y-2 flex-1 max-w-xs">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Filter by Board Date
                                </label>
                                <div className="relative">
                                    <select
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 appearance-none border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3A00]/50 cursor-pointer"
                                    >
                                        <option value="All">All pending board meetings</option>
                                        {availableDates.map(date => (
                                            <option key={date} value={date}>{date}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={handlePrintList}
                                    className="flex-1 md:flex-none px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">print</span>
                                    Print List
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    disabled={managementList.length === 0}
                                    className={`flex-1 md:flex-none px-6 py-2.5 font-bold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${managementList.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">task_alt</span>
                                    Finalize Decisions
                                </button>
                            </div>
                        </div>

                        {/* Print Header */}
                        <div className="hidden print:block text-center mb-10 border-b-2 border-slate-800 pb-6">
                            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Nexora HRMS</h1>
                            <h2 className="text-xl font-bold text-slate-700 mb-1">Resignation Board Approvals List</h2>
                            <p className="text-sm text-slate-600 font-medium">
                                Batch Meeting Date: {filterDate !== "All" ? filterDate : "All Dates"}
                            </p>
                            <p className="text-xs text-slate-500 mt-4">Printed on: {new Date().toLocaleDateString()}</p>
                        </div>

                        {/* Print Content */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 print:bg-white print:border-slate-400">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 print:text-black mt-2">
                                    <span className="material-symbols-outlined text-blue-600 print:hidden">rule_folder</span>
                                    Pending Board Approvals List
                                </h3>
                                <span className="text-xs font-semibold text-slate-500 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full print:border print:border-slate-400 print:bg-white print:text-black">
                                    Batch Size: {managementList.length}
                                </span>
                            </div>
                            <div className="overflow-x-auto print:overflow-visible">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 print:border-slate-800 text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 print:text-black">
                                            <th className="py-4 px-6 print:py-2">Request ID</th>
                                            <th className="py-4 px-6 print:py-2">Employee Name</th>
                                            <th className="py-4 px-6 print:py-2">Designation</th>
                                            <th className="py-4 px-6 print:py-2">Last Working Date</th>
                                            <th className="py-4 px-6 print:py-2">Gathering Date</th>
                                            <th className="py-4 px-6 print:py-2 print:table-cell text-center w-32 hidden">Board Decision</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm print:text-xs">
                                        {managementList.map((req) => (
                                            <tr key={req.id} className="border-b border-slate-50 dark:border-slate-700/50 print:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white print:py-3 print:text-black">{req.id}</td>
                                                <td className="py-4 px-6 print:py-3 print:text-black">{req.employeeName}</td>
                                                <td className="py-4 px-6 text-slate-600 dark:text-slate-400 print:py-3 print:text-black">{req.designation}</td>
                                                <td className="py-4 px-6 text-slate-600 dark:text-slate-400 print:py-3 print:text-black">{req.lastWorkingDate}</td>
                                                <td className="py-4 px-6 font-semibold text-blue-700 dark:text-blue-400 print:py-3 print:text-black">{req.boardMeetingDate}</td>
                                                <td className="py-4 px-6 print:py-3 print:table-cell hidden text-center align-middle">
                                                    <div className="w-full h-8 border border-slate-300 bg-slate-50"></div>
                                                </td>
                                            </tr>
                                        ))}
                                        {managementList.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-slate-500 print:py-6">
                                                    No requests pending board approval for this selection.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Print Footer */}
                        <div className="hidden print:flex justify-between items-end mt-24">
                            <div className="w-1/3 text-center border-t border-slate-800 pt-2">
                                <p className="text-xs font-bold text-slate-800">Prepared By (HR Representative)</p>
                                <p className="text-xs text-slate-500 mt-1">Signature & Date</p>
                            </div>
                            <div className="w-1/3 text-center border-t border-slate-800 pt-2">
                                <p className="text-xs font-bold text-slate-800">Approved By (Board Director)</p>
                                <p className="text-xs text-slate-500 mt-1">Signature & Date</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm print:hidden">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#8B3A00]">warning</span>
                                Confirm Submission
                            </h3>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                You are about to finalize <span className="font-bold text-slate-900 dark:text-white">{managementList.length}</span> request(s) for final board approval.
                            </p>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm font-semibold rounded-lg border border-amber-200 dark:border-amber-800/50 flex gap-2">
                                <span className="material-symbols-outlined text-[20px]">info</span>
                                Submit for Board Approvals
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-sm transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSubmitToDirector}
                                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">send</span>
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axiosInstance";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NormalLeave {
    id: number;
    employeeId: number;
    employeeName: string;
    employeeCode: string;
    leaveTypeName: string;
    reason: string;
    fromDate: string;
    endDate: string;
    totalDays: number;
    status: string;
    createdAt: string;
    department: string;
    branch: string;
    contactNumber: string;
    email: string;
}

// ─── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        PENDING_HR_APPROVAL: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    const label: Record<string, string> = {
        PENDING_HR_APPROVAL: "Pending HR Approval",
        APPROVED: "Approved (Final)",
        REJECTED: "Rejected",
    };
    return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
            {label[status] ?? status}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NormalApprovalsPage() {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<NormalLeave[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<NormalLeave | null>(null);
    const [hrRemark, setHrRemark] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING_HR_APPROVAL");
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // ── Fetch leaves from backend ──────────────────────────────────────────
    const fetchLeaves = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get(`/api/v1/leaves/normal/status/${statusFilter}`);
            setRequests(res.data);
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Could not connect to the backend. Make sure the server is running.");
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

    // ── Open modal ────────────────────────────────────────────────────────
    const handleOpenReview = async (req: NormalLeave) => {
        setSelectedRequest(req);
        setHrRemark("");
    };

    // ── Approve / Reject ───────────────────────────────────────────────────
    const handleDecision = async (decision: "APPROVE" | "REJECT") => {
        if (!selectedRequest) return;

        if (decision === "REJECT" && !hrRemark.trim()) {
            setToast({ message: "Please provide a remark explaining the reason for rejection.", type: "error" });
            setTimeout(() => setToast(null), 4000);
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/api/v1/approvals", {
                refId: selectedRequest.id,
                refType: "NORMAL_LEAVE",
                decision: decision === "APPROVE" ? "APPROVED" : "REJECTED",
                remark: hrRemark,
                approvedBy: { id: user?.id }, // Use actual HR id from store
            });

            if (decision === "REJECT") {
                setToast({ message: "Rejection reason has been successfully sent to the employee.", type: "success" });
            } else {
                setToast({ message: "Request has been verified and forwarded successfully.", type: "success" });
            }
            setTimeout(() => setToast(null), 4000);

            setSelectedRequest(null);
            setHrRemark("");
            await fetchLeaves(); // Refresh the list
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            console.error("Decision error:", err);
            setToast({ message: error.response?.data?.message || "Something went wrong. Please try again.", type: "error" });
            setTimeout(() => setToast(null), 4000);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Filter ─────────────────────────────────────────────────────────────
    const filtered = requests.filter(req => {
        // Smart Routing: Hide my own requests from verification list
        if (req.employeeId === user?.id) return false;

        const name = (req.employeeName || "").toLowerCase();
        const id = String(req.id);
        return name.includes(searchTerm.toLowerCase()) || id.includes(searchTerm);
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/hr/leave" className="text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                                Normal Leave Verification
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 ml-9">
                            Review, verify documents, and approve normal leave requests (≥ 3 days) from employees.
                        </p>
                    </div>
                    <button
                        onClick={fetchLeaves}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        Refresh
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-symbols-outlined text-slate-400">search</span>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by ID or Name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="material-symbols-outlined text-slate-400">filter_list</span>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                        >
                            <option value="PENDING_HR_APPROVAL">Pending HR Approval</option>
                            <option value="APPROVED">Approved (Final)</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            Loading leave requests...
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-16 gap-3 text-red-500">
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                        <th className="py-4 px-6">ID</th>
                                        <th className="py-4 px-6">Employee</th>
                                        <th className="py-4 px-6">Leave Type & Dates</th>
                                        <th className="py-4 px-6">Status</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filtered.map(req => (
                                        <tr key={req.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                            <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">#{req.id}</td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <div className="font-semibold text-slate-800 dark:text-white whitespace-nowrap">
                                                        {req.employeeName}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {req.employeeCode} • {req.department}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                                                <div className="font-medium text-slate-800 dark:text-slate-200">{req.leaveTypeName}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {req.fromDate} → {req.endDate} ({req.totalDays} days)
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <StatusBadge status={req.status} />
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleOpenReview(req)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-500">
                                                <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">inbox</span>
                                                No leave requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Review Modal ───────────────────────────────────────────────── */}
            {selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                        {/* Panel Header */}
                        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg shrink-0">
                                    {selectedRequest.employeeName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-[15px]">{selectedRequest.employeeName}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{selectedRequest.employeeCode} · {selectedRequest.department}</p>
                                    <span className="inline-block mt-1.5 text-[10px] font-bold text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full tracking-wide uppercase">
                                        ID: #{selectedRequest.id}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-5 px-6 py-5 flex-1 overflow-y-auto">
                            {/* Leave Type & Duration */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Leave Type</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedRequest.leaveTypeName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Duration</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRequest.totalDays} Day{selectedRequest.totalDays > 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            {/* Date Range */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Date Range</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2.5">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">From</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRequest.fromDate}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2.5">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">To</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRequest.endDate}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Reason from Employee</p>
                                <div className="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3">
                                    <p className="text-sm text-gray-700 dark:text-slate-300 italic leading-relaxed">&ldquo;{selectedRequest.reason}&rdquo;</p>
                                </div>
                            </div>

                            {/* HR Remarks */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">HR Remarks</p>
                                <textarea
                                    value={hrRemark}
                                    onChange={e => setHrRemark(e.target.value)}
                                    disabled={selectedRequest.status !== "PENDING_HR_APPROVAL"}
                                    rows={3}
                                    placeholder="Enter verification notes or rejection reason..."
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/60 placeholder-gray-400 dark:placeholder-slate-500 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 transition-colors disabled:opacity-60"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-between gap-3 rounded-b-2xl">
                            {selectedRequest.status === "PENDING_HR_APPROVAL" ? (
                                <>
                                    <button
                                        onClick={() => handleDecision("REJECT")}
                                        disabled={submitting}
                                        className="flex-1 py-2.5 text-sm font-semibold text-red-600 bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-900/40 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => handleDecision("APPROVE")}
                                        disabled={submitting}
                                        className="flex-1 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {submitting
                                            ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                            : <span className="material-symbols-outlined text-[18px]">verified</span>
                                        }
                                        Approve Final
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="w-full py-2.5 text-sm font-bold text-center rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500 ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
                    }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-white/20'
                        }`}>
                        <span className="material-symbols-outlined text-[18px] text-white">
                            {toast.type === 'success' ? 'check' : 'close'}
                        </span>
                    </div>
                    <p className="text-sm font-bold tracking-tight">{toast.message}</p>
                    <button onClick={() => setToast(null)} className="ml-4 text-white/50 hover:text-white transition-colors flex">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { getSignedUrl } from "@/lib/supabaseClient";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LeaveDocument { id: number; documentType: string; filePathUrl: string; description: string; }
interface OverseasLeave {
    id: number; reason: string; fromDate: string; endDate: string; totalDays: number;
    status: string; branch: string; contactNumber: string; email: string; specialRemark: string;
    passportNumber: string; passportExpDate: string;
    employee: { id: number; employeeCode: string; firstName: string; lastName: string; };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        PENDING_ADMIN_APPROVAL: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        ADMIN_APPROVED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        PENDING_DIRECTOR_REVIEW: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    const label: Record<string, string> = {
        PENDING_ADMIN_APPROVAL: "Pending Admin Approval",
        ADMIN_APPROVED: "In Board Agenda",
        PENDING_DIRECTOR_REVIEW: "Sent to Director",
        APPROVED: "Approved", REJECTED: "Rejected",
    };
    return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-slate-100 text-slate-600"}`}>{label[status] ?? status}</span>;
}

function DocumentCard({ label, path }: { label: string; path: string }) {
    const [loading, setLoading] = useState(false);
    const handleView = async () => {
        setLoading(true);
        const url = await getSignedUrl(path, 3600);
        setLoading(false);
        if (url) window.open(url, "_blank");
        else alert("Could not generate a secure link. Please try again.");
    };
    return (
        <div onClick={handleView} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 group hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {loading ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    : <span className="material-symbols-outlined text-[18px]">description</span>}
            </div>
            <div className="overflow-hidden flex-1">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</div>
                <div className="text-[10px] text-primary group-hover:underline">Click to view (1-hr secure link)</div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-primary">open_in_new</span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OverseasLeaveApprovals() {
    const [requests, setRequests] = useState<OverseasLeave[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING_ADMIN_APPROVAL");
    const [boardItems, setBoardItems] = useState<OverseasLeave[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<"pending" | "board">("pending");
    const [boardMeetingDate, setBoardMeetingDate] = useState("");

    // Modal state
    const [selectedRequest, setSelectedRequest] = useState<OverseasLeave | null>(null);
    const [documents, setDocuments] = useState<LeaveDocument[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [adminRemark, setAdminRemark] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // ── Fetch ──────────────────────────────────────────────────────────────
    const fetchLeaves = useCallback(async () => {
        setLoading(true); setError("");
        try {
            // Fetch pending actions
            const res = await fetch(`http://localhost:8080/api/v1/leaves/overseas/status/${statusFilter}`);
            if (!res.ok) throw new Error();
            setRequests(await res.json());
            // Always fetch board agenda items (ADMIN_APPROVED status)
            const boardRes = await fetch(`http://localhost:8080/api/v1/leaves/overseas/status/ADMIN_APPROVED`);
            if (boardRes.ok) setBoardItems(await boardRes.json());
        } catch { setError("Could not connect to the backend. Make sure the server is running."); }
        finally { setLoading(false); }
    }, [statusFilter]);

    useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

    const handleOpenReview = async (req: OverseasLeave) => {
        setSelectedRequest(req); setAdminRemark(""); setDocuments([]); setDocsLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/v1/documents?refId=${req.id}&refType=OVERSEAS_LEAVE`);
            if (res.ok) setDocuments(await res.json());
        } catch { /* non-critical */ } finally { setDocsLoading(false); }
    };

    // ── Approve / Reject ───────────────────────────────────────────────────
    const handleDecision = async (decision: "APPROVE" | "REJECT") => {
        if (!selectedRequest) return;
        setSubmitting(true);
        try {
            const res = await fetch("http://localhost:8080/api/v1/approvals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    refId: selectedRequest.id, refType: "OVERSEAS_LEAVE",
                    decision: decision === "APPROVE" ? "APPROVED" : "REJECTED",
                    remark: adminRemark,
                    approvedBy: { id: 1 }, // TODO: logged-in admin's employee id
                }),
            });
            if (!res.ok) throw new Error();
            setSelectedRequest(null); setAdminRemark("");
            await fetchLeaves();
        } catch { alert("Something went wrong. Please try again."); }
        finally { setSubmitting(false); }
    };

    // ── Print & Send selected board items to Director (combined action) ────────
    const handlePrintAndSend = async () => {
        if (selectedIds.length === 0) return;
        if (!boardMeetingDate) { alert("Please set a Board Meeting Date before printing."); return; }

        // Step 1: show print view and trigger browser print dialog
        setIsPrinting(true);
        await new Promise(resolve => setTimeout(resolve, 400));
        window.print();
        setIsPrinting(false);

        // Step 2: After printing, forward all selected items to the Director
        for (const id of selectedIds) {
            await fetch("http://localhost:8080/api/v1/approvals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    refId: id, refType: "OVERSEAS_LEAVE",
                    decision: "APPROVED",
                    remark: `Presented at board meeting on ${boardMeetingDate}`,
                    approvedBy: { id: 1 },
                }),
            });
        }
        setSelectedIds([]);
        await fetchLeaves();
    };

    // ── Filter (pending tab) ───────────────────────────────────────────────
    const filtered = requests.filter(req => {
        const name = `${req.employee?.firstName ?? ""} ${req.employee?.lastName ?? ""}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || String(req.id).includes(searchTerm);
    });

    // ── Filter (board tab) ────────────────────────────────────────────────
    const filteredBoard = boardItems.filter(req => {
        const name = `${req.employee?.firstName ?? ""} ${req.employee?.lastName ?? ""}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || String(req.id).includes(searchTerm);
    });

    const activeRows = activeTab === "pending" ? filtered : filteredBoard;

    // ── Print view overlay ─────────────────────────────────────────────────
    const selectedBoardItems = filteredBoard.filter(r => selectedIds.includes(r.id));
    if (isPrinting) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white text-black p-10 overflow-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold uppercase underline mb-2">Overseas Leave — Board Meeting Agenda</h1>
                    <h2 className="text-xl font-semibold">Selected Requests for Director Review</h2>
                    <p className="text-lg mt-1 font-bold text-red-700">Board Meeting Date: {boardMeetingDate}</p>
                    <p className="mt-2 text-gray-500 text-sm">Printed on: {new Date().toLocaleDateString()}</p>
                </div>
                <table className="w-full border-collapse border border-gray-800 text-sm">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-800">
                            <th className="border border-gray-800 p-3 text-left">ID</th>
                            <th className="border border-gray-800 p-3 text-left">Employee</th>
                            <th className="border border-gray-800 p-3 text-left">Reason</th>
                            <th className="border border-gray-800 p-3 text-center">Dates</th>
                            <th className="border border-gray-800 p-3 text-center">Days</th>
                            <th className="border border-gray-800 p-3 text-left">Passport No.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedBoardItems.map(req => (
                            <tr key={req.id}>
                                <td className="border border-gray-800 p-3 font-semibold">#{req.id}</td>
                                <td className="border border-gray-800 p-3">{req.employee?.firstName} {req.employee?.lastName}<br /><span className="text-gray-500 text-xs">{req.employee?.employeeCode} • {req.branch}</span></td>
                                <td className="border border-gray-800 p-3">{req.reason}</td>
                                <td className="border border-gray-800 p-3 text-center">{req.fromDate} to {req.endDate}</td>
                                <td className="border border-gray-800 p-3 text-center font-bold">{req.totalDays}</td>
                                <td className="border border-gray-800 p-3">{req.passportNumber}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-20 flex justify-between px-10">
                    <div className="text-center"><div className="border-t border-black w-48 mb-2" /><p className="font-semibold">Prepared By (Admin)</p></div>
                    <div className="text-center"><div className="border-t border-black w-48 mb-2" /><p className="font-semibold">Director / Board Approval</p></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto w-full px-2">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pt-2">
                <Link href="/admin/leave-requests" className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Overseas Leave Approvals</h1>
                    <p className="text-gray-500 text-base">Review and manage overseas leave requests pending admin approval.</p>
                </div>
                <button onClick={fetchLeaves} className="ml-auto flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-6">
                <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-6 px-1">
                    {(["pending", "board"] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === tab ? "text-primary" : "text-slate-500 hover:text-slate-800"}`}>
                            {tab === "pending" ? "Pending Actions" : "Board Meeting Agenda"}
                            {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    {activeTab === "pending" && (
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                            <option value="PENDING_ADMIN_APPROVAL">Pending My Approval</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="APPROVED">Approved</option>
                        </select>
                    )}
                    {activeTab === "board" && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Board Meeting Date:</span>
                            <input type="date" value={boardMeetingDate} onChange={e => setBoardMeetingDate(e.target.value)}
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                    )}
                </div>
            </div>

            {/* Bulk action bar */}
            {selectedIds.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{selectedIds.length}</span>
                        <span className="text-primary font-semibold text-sm">request(s) selected</span>
                    </div>
                    {activeTab === "pending" ? (
                        <button onClick={() => { setSelectedIds([]); }} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold">
                            Clear Selection
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Will print a board list and automatically forward to Director.</span>
                            <button onClick={handlePrintAndSend} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">print</span>
                                Print List &amp; Send to Director
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                        <span className="material-symbols-outlined animate-spin">progress_activity</span> Loading...
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-16 gap-3 text-red-500">
                        <span className="material-symbols-outlined">error</span> {error}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    {activeTab === "pending" && <th className="py-4 px-4 w-12"><input type="checkbox" className="w-4 h-4 rounded" onChange={e => setSelectedIds(e.target.checked ? filtered.map(r => r.id) : [])} checked={selectedIds.length === filtered.length && filtered.length > 0} /></th>}
                                    {activeTab === "board" && <th className="py-4 px-4 w-12"><input type="checkbox" className="w-4 h-4 rounded" onChange={e => setSelectedIds(e.target.checked ? filteredBoard.map(r => r.id) : [])} checked={selectedIds.length === filteredBoard.length && filteredBoard.length > 0} /></th>}
                                    <th className="py-4 px-6">ID</th>
                                    <th className="py-4 px-6">Employee</th>
                                    <th className="py-4 px-6">Date Range</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {(activeTab === "pending" ? filtered : filteredBoard).map(req => (
                                    <tr key={req.id} className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${selectedIds.includes(req.id) ? "bg-primary/5" : ""}`}>
                                        <td className="py-4 px-4"><input type="checkbox" className="w-4 h-4 rounded" checked={selectedIds.includes(req.id)} onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, req.id] : prev.filter(id => id !== req.id))} /></td>
                                        <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">#{req.id}</td>
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-slate-800 dark:text-white">{req.employee?.firstName} {req.employee?.lastName}</div>
                                            <div className="text-xs text-slate-500">{req.employee?.employeeCode} • {req.branch}</div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                                            {req.fromDate} → {req.endDate}<br />
                                            <span className="text-xs text-slate-400">({req.totalDays} days)</span>
                                        </td>
                                        <td className="py-4 px-6"><StatusBadge status={req.status} /></td>
                                        <td className="py-4 px-6 text-right">
                                            <button onClick={() => handleOpenReview(req)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">visibility</span> Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(activeRows).length === 0 && (
                                    <tr><td colSpan={6} className="py-12 text-center text-slate-500">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">inbox</span>
                                        No requests found.
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Overseas Leave — #{selectedRequest.id}</h3>
                                <p className="text-sm text-slate-500 mt-1">Verified by HR. Your decision forwards this to the Director or rejects it.</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Employee Info</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Name:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">EPF:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.employee?.employeeCode}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Branch:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.branch}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Contact:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.contactNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.email}</span></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Leave Details</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Status:</span><StatusBadge status={selectedRequest.status} /></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Dates:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.fromDate} → {selectedRequest.endDate}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Days:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.totalDays}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Passport:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.passportNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Passport Exp:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.passportExpDate}</span></div>
                                        <div className="mt-2"><span className="text-slate-500 block mb-1">Reason:</span><p className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded text-slate-700 dark:text-slate-300">{selectedRequest.reason}</p></div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    Uploaded Documents <span className="ml-2 text-xs font-normal text-slate-500">(Secure links · 1hr expiry)</span>
                                </h4>
                                {docsLoading ? (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm"><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Loading documents...</div>
                                ) : documents.length === 0 ? (
                                    <p className="text-xs text-amber-600 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">warning</span> No documents uploaded.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {documents.map(doc => <DocumentCard key={doc.id} label={doc.description || doc.documentType} path={doc.filePathUrl} />)}
                                    </div>
                                )}
                            </div>

                            {/* Admin Remarks */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Administrator Remarks</h4>
                                <textarea value={adminRemark} onChange={e => setAdminRemark(e.target.value)}
                                    disabled={selectedRequest.status !== "PENDING_ADMIN_APPROVAL"}
                                    placeholder="Add final approval notes or conditions..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24 text-slate-700 dark:text-slate-300 disabled:opacity-60" />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                            <button onClick={() => setSelectedRequest(null)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm">Close</button>
                            {selectedRequest.status === "PENDING_ADMIN_APPROVAL" && (
                                <>
                                    <button onClick={() => handleDecision("REJECT")} disabled={submitting} className="px-5 py-2.5 bg-red-50 text-red-600 font-bold hover:bg-red-100 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
                                        <span className="material-symbols-outlined text-[18px]">cancel</span> Reject
                                    </button>
                                    <button onClick={() => handleDecision("APPROVE")} disabled={submitting} className="px-5 py-2.5 bg-primary text-white font-bold hover:bg-primary/90 rounded-lg text-sm flex items-center gap-2 shadow-sm disabled:opacity-50">
                                        {submitting ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">fact_check</span>}
                                        Approve & Add to Board Agenda
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

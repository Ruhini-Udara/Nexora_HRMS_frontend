"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { getSignedUrl } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axiosInstance";
import { WorkflowTrackerStepper } from "@/components/WorkflowTrackerStepper";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LeaveDocument { id: number; documentType: string; filePathUrl: string; description: string; }
interface OverseasLeave {
    id: number;
    employeeId: number;
    employeeName: string;
    employeeCode: string;
    epfNumber: string;
    leaveTypeId: number;
    leaveTypeName: string;
    reason: string;
    fromDate: string;
    endDate: string;
    totalDays: number;
    status: string;
    branch: string;
    department: string;
    contactNumber: string;
    email: string;
    specialRemark: string;
    passportNumber: string;
    passportExpDate: string;
    createdAt?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        PENDING_ADMIN_APPROVAL: "bg-amber-100 text-amber-700  ",
        ADMIN_APPROVED: "bg-blue-100 text-blue-700  ",
        PENDING_DIRECTOR_REVIEW: "bg-purple-100 text-purple-700  ",
        APPROVED: "bg-emerald-100 text-emerald-700  ",
        REJECTED: "bg-red-100 text-red-700  ",
    };
    const label: Record<string, string> = {
        PENDING_ADMIN_APPROVAL: "Pending Admin Approval",
        ADMIN_APPROVED: "In Board Agenda",
        PENDING_DIRECTOR_REVIEW: "Sent to Director",
        APPROVED: "Approved", REJECTED: "Rejected",
    };
    return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-slate-100 text-slate-600"}`}>{label[status] ?? status}</span>;
}

function DocumentCard({ label, path, onError }: { label: string; path: string; onError: (msg: string) => void }) {
    const [loading, setLoading] = useState(false);
    const handleView = async () => {
        setLoading(true);
        const url = await getSignedUrl(path, 3600);
        setLoading(false);
        if (url) window.open(url, "_blank");
        else onError("Could not generate a secure link. Please try again.");
    };
    return (
        <div onClick={handleView} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50 group hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {loading ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    : <span className="material-symbols-outlined text-[18px]">description</span>}
            </div>
            <div className="overflow-hidden flex-1">
                <div className="text-xs font-bold text-slate-700">{label}</div>
                <div className="text-[10px] text-primary group-hover:underline">Click to view (1-hr secure link)</div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-primary">open_in_new</span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OverseasLeaveApprovals() {
    const { user } = useAuthStore();
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
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const getWorkflowSteps = (req: OverseasLeave) => {
        // Mocking created date if not present for demo purposes
        const createdDate = req.createdAt ? new Date(req.createdAt) : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); 
        const isDelayed = (Date.now() - createdDate.getTime()) > 2 * 24 * 60 * 60 * 1000;
        
        return [
            { label: 'Request Submitted', status: 'completed' as const },
            { label: 'HR Verification', status: 'completed' as const },
            { 
                label: 'Admin Confirmation', 
                status: req.status === 'PENDING_ADMIN_APPROVAL' ? 'current' as const : 
                        req.status === 'REJECTED' ? 'pending' as const : 'completed' as const,
                isDelayed: req.status === 'PENDING_ADMIN_APPROVAL' && isDelayed,
                timeSpent: req.status === 'PENDING_ADMIN_APPROVAL' && isDelayed ? '> 2 Days' : undefined
            },
            { 
                label: 'Board Approval', 
                status: req.status === 'ADMIN_APPROVED' || req.status === 'PENDING_DIRECTOR_REVIEW' ? 'current' as const : 
                        req.status === 'APPROVED' ? 'completed' as const : 'pending' as const 
            }
        ];
    };

    // ── Fetch ──────────────────────────────────────────────────────────────
    const fetchLeaves = useCallback(async () => {
        setLoading(true); setError("");
        try {
            // Fetch pending actions
            const res = await api.get(`/api/v1/leaves/overseas/status/${statusFilter}`);
            setRequests(res.data);
            // Always fetch board agenda items (ADMIN_APPROVED status)
            const boardRes = await api.get(`/api/v1/leaves/overseas/status/ADMIN_APPROVED`);
            setBoardItems(boardRes.data);
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Could not connect to the backend. Make sure the server is running.");
        } finally { setLoading(false); }
    }, [statusFilter]);

    useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

    const handleOpenReview = async (req: OverseasLeave) => {
        setSelectedRequest(req); setAdminRemark(""); setDocuments([]); setDocsLoading(true);
        try {
            const res = await api.get(`/api/v1/documents?refId=${req.id}&refType=OVERSEAS_LEAVE`);
            setDocuments(res.data);
        } catch { /* non-critical */ } finally { setDocsLoading(false); }
    };

    // ── Approve / Reject ───────────────────────────────────────────────────
    const handleDecision = async (decision: "APPROVE" | "REJECT") => {
        if (!selectedRequest) return;
        setSubmitting(true);
        try {
            await api.post("/api/v1/approvals", {
                refId: selectedRequest.id, refType: "OVERSEAS_LEAVE",
                decision: decision === "APPROVE" ? "APPROVED" : "REJECTED",
                remark: adminRemark,
                approvedBy: { id: user?.id }, // Logged-in admin's employee id
            });
            setSelectedRequest(null); setAdminRemark("");
            await fetchLeaves();
            showToast("Request processed successfully.", "success");
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            showToast(error.response?.data?.message || "Something went wrong. Please try again.", "error");
        } finally { setSubmitting(false); }
    };

    // ── Preview & Download board items ──────────────────────────────────────
    const handlePreviewAgenda = () => {
        if (selectedIds.length === 0) return;
        if (!boardMeetingDate) {
            showToast("Please set a Board Meeting Date before previewing.", "error");
            return;
        }
        setIsPrinting(true);
    };

    const handleDownloadOnly = async () => {
        try {
            // @ts-expect-error html2pdf.js does not bundle ts types
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default || html2pdfModule;

            const element = document.getElementById("print-agenda-view");
            if (!element) {
                showToast("Could not find the agenda sheet element.", "error");
                return;
            }

            const opt = {
                margin: 0.5,
                filename: `Board_Agenda_${boardMeetingDate || 'Agenda'}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();
            showToast("PDF Downloaded successfully.", "success");
        } catch (e) {
            const error = e as { message?: string };
            console.error("PDF generation failed:", e);
            showToast(`PDF generation failed: ${error.message || "Please check console"}`, "error");
        }
    };

    const handleSendToDirector = async () => {
        setSubmitting(true);
        try {
            for (const id of selectedIds) {
                await api.post("/api/v1/approvals", {
                    refId: id, refType: "OVERSEAS_LEAVE",
                    decision: "APPROVED",
                    remark: `Presented at board meeting on ${boardMeetingDate}`,
                    approvedBy: { id: user?.id },
                });
            }
            setSelectedIds([]);
            setIsPrinting(false);
            await fetchLeaves();
            showToast("List successfully sent to Director.", "success");
        } catch (e) {
            const error = e as { message?: string };
            showToast(`Failed to send to Director: ${error.message || 'Unknown error'}`, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrintAndSendToDirector = async () => {
        window.print();
        await handleSendToDirector();
    };

    // ── Filter (pending tab) ───────────────────────────────────────────────
    const filtered = requests.filter(req => {
        // Smart Routing: Hide my own requests from verification list
        if (req.employeeId === user?.id) return false;

        const name = (req.employeeName || "").toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || String(req.id).includes(searchTerm);
    });

    // ── Filter (board tab) ────────────────────────────────────────────────
    const filteredBoard = boardItems.filter(req => {
        const name = (req.employeeName || "").toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || String(req.id).includes(searchTerm);
    });

    const activeRows = activeTab === "pending" ? filtered : filteredBoard;

    // ── Print view overlay ─────────────────────────────────────────────────
    const selectedBoardItems = filteredBoard.filter(r => selectedIds.includes(r.id));
    if (isPrinting) {
        return (
            <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm overflow-auto flex flex-col p-4">
                <div className="bg-white max-w-5xl w-full mx-auto rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                        <div className="text-sm font-bold text-slate-800">Preview Agenda Document</div>
                        <div className="flex items-center gap-2">
                            <button disabled={submitting} onClick={() => setIsPrinting(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                                Cancel
                            </button>
                            <button disabled={submitting} onClick={handleDownloadOnly} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Download PDF
                            </button>
                            <button disabled={submitting} onClick={handlePrintAndSendToDirector} className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50">
                                {submitting ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">print</span>}
                                Print & Send to Director
                            </button>
                        </div>
                    </div>
                    <div className="p-10 bg-white overflow-auto max-h-[80vh]">
                        <div id="print-agenda-view" style={{ backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <h1 style={{ fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'underline', marginBottom: '8px' }}>Overseas Leave — Board Meeting Agenda</h1>
                                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Selected Requests for Director Review</h2>
                                <p style={{ fontSize: '16px', marginTop: '4px', fontWeight: 'bold', color: '#b91c1c' }}>Board Meeting Date: {boardMeetingDate}</p>
                                <p style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>Generated on: {new Date().toLocaleDateString()}</p>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', fontSize: '12px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                                        <th style={{ border: '1px solid #000000', padding: '10px', textAlign: 'left' }}>ID</th>
                                        <th style={{ border: '1px solid #000000', padding: '10px', textAlign: 'left' }}>Employee</th>
                                        <th style={{ border: '1px solid #000000', padding: '10px', textAlign: 'left' }}>Reason</th>
                                        <th style={{ border: '1px solid #000000', padding: '10px', textAlign: 'center' }}>Dates</th>
                                        <th style={{ border: '1px solid #000000', padding: '10px', textAlign: 'center' }}>Days</th>
                                        <th style={{ border: '1px solid #000000', padding: '10px', textAlign: 'left' }}>Passport No.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBoardItems.map(req => (
                                        <tr key={req.id}>
                                            <td style={{ border: '1px solid #000000', padding: '10px', fontWeight: 'bold' }}>#{req.id}</td>
                                            <td style={{ border: '1px solid #000000', padding: '10px' }}>
                                                <div style={{ fontWeight: 'bold' }}>{req.employeeName}</div>
                                                <div style={{ color: '#6b7280', fontSize: '10px' }}>{req.employeeCode} • {req.department}</div>
                                            </td>
                                            <td style={{ border: '1px solid #000000', padding: '10px' }}>{req.reason}</td>
                                            <td style={{ border: '1px solid #000000', padding: '10px', textAlign: 'center' }}>{req.fromDate} to {req.endDate}</td>
                                            <td style={{ border: '1px solid #000000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{req.totalDays}</td>
                                            <td style={{ border: '1px solid #000000', padding: '10px' }}>{req.passportNumber}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', paddingLeft: '20px', paddingRight: '20px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ borderTop: '1px solid #000000', width: '180px', marginBottom: '8px' }} />
                                    <p style={{ fontWeight: 'bold', fontSize: '12px' }}>Prepared By (Admin)</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ borderTop: '1px solid #000000', width: '180px', marginBottom: '8px' }} />
                                    <p style={{ fontWeight: 'bold', fontSize: '12px' }}>Director / Board Approval</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

    return (
        <div className="max-w-7xl mx-auto w-full px-2">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pt-2">
                <Link href="/admin/leave-requests" className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Overseas Leave Approvals</h1>
                    <p className="text-gray-500 dark:text-slate-400 text-base">Review and manage overseas leave requests pending admin approval.</p>
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
                            className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === tab ? "text-primary" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"}`}>
                            {tab === "pending" ? "Pending Actions" : "Board Meeting Agenda"}
                            {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    {activeTab === "pending" && (
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                            <option value="PENDING_ADMIN_APPROVAL">Pending My Approval</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="APPROVED">Approved</option>
                        </select>
                    )}
                    {activeTab === "board" && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Board Meeting Date:</span>
                            <input type="date" value={boardMeetingDate} onChange={e => setBoardMeetingDate(e.target.value)}
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
                        <button onClick={() => { setSelectedIds([]); }} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold">
                            Clear Selection
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600">Will print a board list and automatically forward to Director.</span>
                            <button onClick={handlePreviewAgenda} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">preview</span>
                                Preview List &amp; Send to Director
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
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
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-500 dark:text-slate-400">
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
                                    <tr key={req.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${selectedIds.includes(req.id) ? "bg-primary/5 dark:bg-primary/5" : ""}`}>
                                        <td className="py-4 px-4"><input type="checkbox" className="w-4 h-4 rounded" checked={selectedIds.includes(req.id)} onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, req.id] : prev.filter(id => id !== req.id))} /></td>
                                        <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">#{req.id}</td>
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{req.employeeName}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{req.employeeCode} • {req.department}</div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-350">
                                            {req.fromDate} → {req.endDate}<br />
                                            <span className="text-xs text-slate-400 dark:text-slate-500">({req.totalDays} days)</span>
                                        </td>
                                        <td className="py-4 px-6"><StatusBadge status={req.status} /></td>
                                        <td className="py-4 px-6 text-right">
                                            <button onClick={() => handleOpenReview(req)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">visibility</span> Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(activeRows).length === 0 && (
                                    <tr><td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 block mb-2">inbox</span>
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
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Verified by HR. Your decision forwards this to the Director or rejects it.</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Employee Info</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Name:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.employeeName}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">EPF:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.employeeCode}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Department:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.department}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Contact:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.contactNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Email:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.email}</span></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Leave Details</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Status:</span><StatusBadge status={selectedRequest.status} /></div>
                                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Dates:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.fromDate} → {selectedRequest.endDate}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Days:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.totalDays}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Passport:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.passportNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Passport Exp:</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.passportExpDate}</span></div>
                                        <div className="mt-2"><span className="text-slate-500 dark:text-slate-400 block mb-1">Reason:</span><p className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-slate-700 dark:text-slate-300">{selectedRequest.reason}</p></div>
                                    </div>
                                </div>
                            </div>

                            {/* Workflow Tracker */}
                            <WorkflowTrackerStepper steps={getWorkflowSteps(selectedRequest)} />

                            {/* Documents */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    Uploaded Documents <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">(Secure links · 1hr expiry)</span>
                                </h4>
                                {docsLoading ? (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm"><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Loading documents...</div>
                                ) : documents.length === 0 ? (
                                    <p className="text-xs text-amber-600 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">warning</span> No documents uploaded.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {documents.map(doc => <DocumentCard key={doc.id} label={doc.description || doc.documentType} path={doc.filePathUrl} onError={(msg) => showToast(msg, "error")} />)}
                                    </div>
                                )}
                            </div>

                            {/* Admin Remarks */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-3">Administrator Remarks</h4>
                                <textarea value={adminRemark} onChange={e => setAdminRemark(e.target.value)}
                                    disabled={selectedRequest.status !== "PENDING_ADMIN_APPROVAL"}
                                    placeholder="Add final approval notes or conditions..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24 text-slate-700 disabled:opacity-60" />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 shrink-0 flex items-center justify-end gap-3 bg-slate-50 rounded-b-2xl">
                            <button onClick={() => setSelectedRequest(null)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 :bg-slate-700 rounded-lg transition-colors text-sm">Close</button>
                            {selectedRequest.status === "PENDING_ADMIN_APPROVAL" && (
                                <>
                                    <button onClick={() => handleDecision("REJECT")} disabled={submitting} className="px-5 py-2.5 bg-red-50 text-red-600 font-bold hover:bg-red-100 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
                                        <span className="material-symbols-outlined text-[18px]">cancel</span> Reject
                                    </button>
                                    <button onClick={() => handleDecision("APPROVE")} disabled={submitting} className="px-5 py-2.5 bg-primary text-white font-bold hover:bg-primary/90 rounded-lg text-sm flex items-center gap-2 shadow-sm disabled:opacity-50">
                                        {submitting ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">fact_check</span>}
                                        Approve
                                    </button>
                                </>
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

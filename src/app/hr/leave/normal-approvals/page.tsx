"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getSignedUrl } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axiosInstance";
import { WorkflowTrackerStepper } from "@/components/WorkflowTrackerStepper";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LeaveDocument {
    id: number;
    documentType: string;
    filePathUrl: string;
    description: string;
}

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

interface LeaveImpactData {
    riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
    departmentEmployees: number;
    alreadyOnLeave: number;
    availableAfterApproval: number;
    availabilityPercentage: number;
}

// ─── Document viewer helper ───────────────────────────────────────────────────
function DocumentCard({ label, path }: { label: string; path: string }) {
    const [loading, setLoading] = useState(false);

    const handleView = async () => {
        if (!path) return;
        setLoading(true);
        const url = await getSignedUrl(path, 3600);
        setLoading(false);
        if (url) {
            window.open(url, "_blank");
        } else {
            alert("Could not generate a secure link for this document. Please try again.");
        }
    };

    if (!path) return null;

    return (
        <div
            onClick={handleView}
            className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 group hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
        >
            <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {loading
                    ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    : <span className="material-symbols-outlined text-[18px]">description</span>
                }
            </div>
            <div className="overflow-hidden flex-1">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">{label}</div>
                <div className="text-[10px] text-primary group-hover:underline">Click to view (1-hr secure link)</div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-primary">open_in_new</span>
        </div>
    );
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
    const [documents, setDocuments] = useState<LeaveDocument[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [hrRemark, setHrRemark] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING_HR_APPROVAL");
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [impactData, setImpactData] = useState<LeaveImpactData | null>(null);
    const [impactLoading, setImpactLoading] = useState(false);

    const getWorkflowSteps = (req: NormalLeave) => {
        const createdDate = req.createdAt ? new Date(req.createdAt) : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); 
        const isDelayed = (Date.now() - createdDate.getTime()) > 2 * 24 * 60 * 60 * 1000;
        
        return [
            { label: 'Request Submitted', status: 'completed' as const },
            { 
                label: 'HR Final Review', 
                status: req.status === 'PENDING_HR_APPROVAL' ? 'current' as const : 
                        req.status === 'APPROVED' ? 'completed' as const : 'pending' as const,
                isDelayed: req.status === 'PENDING_HR_APPROVAL' && isDelayed,
                timeSpent: req.status === 'PENDING_HR_APPROVAL' && isDelayed ? '> 2 Days' : undefined
            }
        ];
    };

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

    // ── Open modal and load documents ─────────────────────────────────────
    const handleOpenReview = async (req: NormalLeave) => {
        setSelectedRequest(req);
        setHrRemark("");
        setDocuments([]);
        setImpactData(null);
        setDocsLoading(true);
        setImpactLoading(true);
        
        try {
            const res = await api.get(`/api/v1/documents?refId=${req.id}&refType=NORMAL_LEAVE`);
            setDocuments(res.data);
        } catch {
            // non-critical
        } finally {
            setDocsLoading(false);
        }

        try {
            const res = await api.get(`/api/v1/leaves/normal/${req.id}/impact`);
            setImpactData(res.data);
        } catch {
            // non-critical
        } finally {
            setImpactLoading(false);
        }
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
                                                    Review
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verify Normal Leave Request</h3>
                                <p className="text-sm text-slate-500 mt-1">Request ID: #{selectedRequest.id}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-8 flex-1">

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wider">Employee Info</h4>
                                    <div className="mb-4">
                                        <div className="font-bold text-slate-900 dark:text-white text-lg">
                                            {selectedRequest.employeeName}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {selectedRequest.employeeCode} • {selectedRequest.department}
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Branch:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.branch || "N/A"}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Contact:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.contactNumber || "N/A"}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.email}</span></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Leave Details</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Status:</span> <StatusBadge status={selectedRequest.status} /></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Leave Type:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.leaveTypeName}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Dates:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.fromDate} → {selectedRequest.endDate}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Total Days:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.totalDays}</span></div>
                                        <div className="mt-2"><span className="text-slate-500 block mb-1">Reason:</span><p className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded text-slate-700 dark:text-slate-300">{selectedRequest.reason}</p></div>
                                    </div>
                                </div>
                            </div>

                            <WorkflowTrackerStepper steps={getWorkflowSteps(selectedRequest)} />

                            {/* Documents */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    Uploaded Documents
                                    <span className="ml-2 text-xs font-normal text-slate-500">(Secure links expire in 1 hour)</span>
                                </h4>
                                {docsLoading ? (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Loading documents...
                                    </div>
                                ) : documents.length === 0 ? (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">warning</span>
                                        No documents were uploaded with this request.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {documents.map(doc => (
                                            <DocumentCard
                                                key={doc.id}
                                                label={doc.description || doc.documentType}
                                                path={doc.filePathUrl}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Leave Impact Analysis */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Leave Impact Analysis</h4>
                                {impactLoading ? (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Calculating impact...
                                    </div>
                                ) : impactData ? (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                                            <div>
                                                <h5 className="font-bold text-slate-900 dark:text-white">Department Availability</h5>
                                                <p className="text-xs text-slate-500 mt-0.5">Projected availability if this leave is approved.</p>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
                                                impactData.riskLevel === 'Low Risk' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                impactData.riskLevel === 'Medium Risk' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {impactData.riskLevel === 'Low Risk' ? 'check_circle' : impactData.riskLevel === 'Medium Risk' ? 'warning' : 'error'}
                                                </span>
                                                {impactData.riskLevel}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-center">
                                                <div className="text-2xl font-black text-slate-900 dark:text-white">{impactData.departmentEmployees}</div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Total in Dept</div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-center">
                                                <div className="text-2xl font-black text-amber-600 dark:text-amber-500">{impactData.alreadyOnLeave}</div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Already On Leave</div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-center">
                                                <div className="text-2xl font-black text-blue-600 dark:text-blue-500">{impactData.availableAfterApproval}</div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Available After</div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-center">
                                                <div className={`text-2xl font-black ${
                                                    impactData.riskLevel === 'Low Risk' ? 'text-emerald-600' :
                                                    impactData.riskLevel === 'Medium Risk' ? 'text-amber-600' :
                                                    'text-red-600'
                                                }`}>
                                                    {impactData.availabilityPercentage.toFixed(0)}%
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Availability</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500">Failed to load impact analysis.</p>
                                )}
                            </div>

                            {/* HR Remarks */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">HR Remarks</h4>
                                <textarea
                                    value={hrRemark}
                                    onChange={e => setHrRemark(e.target.value)}
                                    disabled={selectedRequest.status !== "PENDING_HR_APPROVAL"}
                                    placeholder="Add verification notes or rejection reason..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
                            {selectedRequest.status === "PENDING_HR_APPROVAL" ? (
                                <>
                                    <button
                                        onClick={() => handleDecision("REJECT")}
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => handleDecision("APPROVE")}
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        {submitting
                                            ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                            : <span className="material-symbols-outlined text-[18px]">verified</span>
                                        }
                                        "Approve Final"
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-bold text-sm transition-colors"
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

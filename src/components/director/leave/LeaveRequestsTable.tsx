"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Download, Check, X, Send, Eye, FileText } from 'lucide-react';
import { getSignedUrl } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axiosInstance";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LeaveDocument {
    id: number;
    documentType: string;
    filePathUrl: string;
    description: string;
}

interface OverseasLeave {
    id: number;
    reason: string;
    fromDate: string;
    endDate: string;
    totalDays: number;
    status: string;
    branch: string;
    contactNumber: string;
    email: string;
    specialRemark: string;
    passportNumber: string;
    passportExpDate: string;
    employeeId: number;
    employeeName: string;
    employeeCode: string;
    department: string;
    createdAt?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        PENDING_HR_APPROVAL: "bg-amber-100 text-amber-700",
        PENDING_ADMIN_APPROVAL: "bg-blue-100 text-blue-700",
        ADMIN_APPROVED: "bg-indigo-100 text-indigo-700",
        PENDING_DIRECTOR_REVIEW: "bg-purple-100 text-purple-700",
        APPROVED: "bg-emerald-100 text-emerald-800",
        REJECTED: "bg-red-100 text-red-800",
    };
    const label: Record<string, string> = {
        PENDING_HR_APPROVAL: "HR Review",
        PENDING_ADMIN_APPROVAL: "Admin Review",
        ADMIN_APPROVED: "Board Agenda",
        PENDING_DIRECTOR_REVIEW: "Director Review",
        APPROVED: "Approved",
        REJECTED: "Rejected",
    };
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-800"}`}>
            {label[status] ?? status}
        </span>
    );
}

const LeaveRequestsTable = () => {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<OverseasLeave[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING_DIRECTOR_REVIEW");

    // Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<OverseasLeave | null>(null);
    const [documents, setDocuments] = useState<LeaveDocument[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [directorRemark, setDirectorRemark] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Fetch Requests
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const endpointSuffix = statusFilter === "ALL" ? "" : `/status/${statusFilter}`;
            const [overseasRes, maternityRes] = await Promise.all([
                api.get(`/api/v1/leaves/overseas${endpointSuffix}`),
                api.get(`/api/v1/leaves/maternity${endpointSuffix}`)
            ]);

            interface LeaveResponse {
                id: number;
                [key: string]: unknown;
            }
            // Add refType to help identify them
            const overseas = overseasRes.data.map((r: LeaveResponse) => ({ ...r, refType: 'OVERSEAS_LEAVE' }));
            const maternity = maternityRes.data.map((r: LeaveResponse) => ({ ...r, refType: 'MATERNITY_LEAVE' }));

            setRequests([...overseas, ...maternity]);
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Could not connect to the backend. Please ensure the server is running.");
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests, statusFilter]);

    const handleOpenReview = async (req: OverseasLeave) => {
        setSelectedRequest(req);
        setDirectorRemark("");
        setReviewModalOpen(true);
        setDocuments([]);
        setDocsLoading(true);
        try {
            const res = await api.get(`/api/v1/documents?refId=${req.id}&refType=OVERSEAS_LEAVE`);
            setDocuments(res.data);
        } catch (err) {
            console.error("Error fetching documents", err);
        } finally {
            setDocsLoading(false);
        }
    };

    const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
        if (!selectedRequest) return;
        setSubmitting(true);
        try {
            await api.post("/api/v1/approvals", {
                refId: selectedRequest.id,
                refType: (selectedRequest as { refType?: string }).refType || "OVERSEAS_LEAVE",
                decision: decision,
                remark: directorRemark,
                approvedBy: { id: user?.id }, // Use actual director id from store
            });

            setReviewModalOpen(false);
            setSelectedRequest(null);

            // Show Success Toast
            setToast({
                message: decision === "APPROVED"
                    ? "Final Approval Successful. E-mailed the status to the employee!"
                    : "Request Rejected. Notification sent to the employee.",
                type: 'success'
            });
            setTimeout(() => setToast(null), 5000);

            fetchRequests();
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
            setToast({ message: errorMsg, type: 'error' });
            setTimeout(() => setToast(null), 5000);
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewDocument = async (path: string) => {
        const url = await getSignedUrl(path, 3600);
        if (url) window.open(url, "_blank");
        else alert("Could not generate secure link.");
    };

    const filteredRequests = requests.filter(req => {
        // Smart Routing: Hide my own requests from verification list
        if (req.employeeId === user?.id) return false;

        const fullName = (req.employeeName || "").toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || String(req.id).includes(searchTerm);
    });

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Pending Board Approvals</h3>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-4 pr-10 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium outline-none focus:border-primary"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="py-2 pl-3 pr-8 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium outline-none focus:border-primary appearance-none"
                    >
                        <option value="ALL">All Requests</option>
                        <option value="PENDING_DIRECTOR_REVIEW">Pending Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                    <button
                        onClick={fetchRequests}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                        <tr>
<<<<<<< Updated upstream
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Employee</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Dates</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Days</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Actions</th>
=======
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Employee</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Requested Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-center">Days</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 text-center">Actions</th>
>>>>>>> Stashed changes
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading requests...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-red-500">{error}</td>
                            </tr>
                        ) : filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No pending board approvals found.</td>
                            </tr>
                        ) : (
                            filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {request.employeeName}
                                            </p>
                                            <p className="text-xs text-gray-500">{request.employeeCode} • {request.department}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase text-[10px]">{(request as { refType?: string }).refType === 'MATERNITY_LEAVE' ? 'Maternity Leave' : 'Overseas Leave'}</p>
                                    </td>
                                    <td className="px-6 py-4">
<<<<<<< Updated upstream
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                            {request.fromDate} to {request.endDate}
=======
                                        <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                                            {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
>>>>>>> Stashed changes
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                                            {request.totalDays}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={request.status} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {request.status === "PENDING_DIRECTOR_REVIEW" ? (
                                            <button
                                                onClick={() => handleOpenReview(request)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Review
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">Reviewed</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Review Modal */}
            {reviewModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review Board Application</h3>
                            <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee Details</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {selectedRequest.employeeName}
                                        </p>
                                        <p className="text-xs text-gray-500">EPF: {selectedRequest.employeeCode}</p>
                                        <p className="text-xs text-gray-500">Department: {selectedRequest.department}</p>
                                        <p className="text-xs text-gray-500">Email: {selectedRequest.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Leave Info</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRequest.fromDate} to {selectedRequest.endDate}</p>
                                        <p className="text-xs text-gray-500">Duration: {selectedRequest.totalDays} Days</p>
                                        <p className="text-xs text-gray-500">Passport: {selectedRequest.passportNumber}</p>
                                        <p className="text-xs text-gray-500">Expiry: {selectedRequest.passportExpDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reason & Remarks</h4>
                                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Reason for Leave</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{selectedRequest.reason}</p>
                                    </div>
                                    {selectedRequest.specialRemark && (
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Special Remark</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{selectedRequest.specialRemark}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attached Documents</h4>
                                {docsLoading ? (
                                    <p className="text-sm text-gray-500">Loading documents...</p>
                                ) : documents.length === 0 ? (
                                    <p className="text-sm text-gray-500">No documents attached.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {documents.map(doc => (
                                            <div
                                                key={doc.id}
                                                onClick={() => handleViewDocument(doc.filePathUrl)}
                                                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors group"
                                            >
                                                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{doc.description || doc.documentType}</p>
                                                    <p className="text-[10px] text-primary group-hover:underline">Click to View</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Board Final Review Remark</h4>
                                <textarea
                                    value={directorRemark}
                                    onChange={(e) => setDirectorRemark(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary h-24 resize-none"
                                    placeholder="Enter any final comments for this board approval..."
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setReviewModalOpen(false)}
                                className="px-6 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDecision("REJECTED")}
                                disabled={submitting}
                                className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleDecision("APPROVED")}
                                disabled={submitting}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? "Processing..." : <><Check className="w-4 h-4" /> Final Approve</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500 ${toast.type === 'success' ? 'bg-zinc-900 text-white' : 'bg-red-600 text-white'
                    }`}>
                    <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-white/20'
                        }`}>
                        {toast.type === 'success' ? <Check className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
                    </div>
                    <p className="text-sm font-bold tracking-tight">{toast.message}</p>
                    <button onClick={() => setToast(null)} className="ml-4 text-white/50 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default LeaveRequestsTable;

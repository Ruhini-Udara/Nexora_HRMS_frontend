"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getSignedUrl } from "@/lib/supabaseClient";

// ─── Types ───────────────────────────────────────────────────────────────────
interface MaternityLeave {
    id: number;
    childNumber: string;
    branch: string;
    contactNumber: string;
    email: string;
    specialRemark: string;
    status: string;
    reason: string;
    fromDate: string;
    endDate: string;
    totalDays: number;
    employee: {
        id: number;
        employeeCode: string;
        firstName: string;
        lastName: string;
        fullName?: string;
        surname?: string;
    };
}

interface LeaveDocument {
    id: number;
    documentType: string;
    filePathUrl: string;
    description: string;
}

export default function MaternityLeaveApprovals() {
    const [requests, setRequests] = useState<MaternityLeave[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<MaternityLeave | null>(null);
    const [documents, setDocuments] = useState<LeaveDocument[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [adminRemark, setAdminRemark] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING_ADMIN_APPROVAL");
    const [submitting, setSubmitting] = useState(false);
    const [showNotification, setShowNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Fetch Requests
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/v1/leaves/maternity/status/${statusFilter}`);
            if (!res.ok) throw new Error("Failed to fetch requests");
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setShowNotification({ message, type });
        setTimeout(() => setShowNotification(null), 4000);
    };

    const handleView = async (req: MaternityLeave) => {
        setSelectedRequest(req);
        setAdminRemark("");
        setDocuments([]);
        setDocsLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/v1/documents?refId=${req.id}&refType=MATERNITY_LEAVE`);
            if (res.ok) {
                const docs = await res.json();
                setDocuments(docs);
            }
        } catch (error) {
            console.error("Error fetching documents", error);
        } finally {
            setDocsLoading(false);
        }
    };

    const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
        if (!selectedRequest) return;
        setSubmitting(true);
        try {
            const res = await fetch("http://localhost:8080/api/v1/approvals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    refId: selectedRequest.id,
                    refType: "MATERNITY_LEAVE",
                    decision: decision,
                    remark: adminRemark,
                    approvedBy: { id: 1 }, // TODO: use actual Admin id
                }),
            });
            if (!res.ok) throw new Error("Approval failed");
            
            triggerNotification(
                decision === "APPROVED" 
                    ? "Request Approved & Submitted for Salary Calculation! Employee notified via E-mail." 
                    : "Request Rejected. Employee notified via E-mail.",
                'success'
            );
            
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            console.error("Approval decision failed:", error);
            alert("Something went wrong. Please try again.");
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
        const fullName = `${req.employee?.fullName || req.employee?.firstName + " " + req.employee?.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || String(req.id).includes(searchTerm);
    });

    return (
        <div className="max-w-7xl mx-auto w-full relative p-6">
            {/* Toast Notification */}
            {showNotification && (
                <div className={`fixed top-24 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 flex items-center gap-3 ${
                    showNotification.type === 'success' ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-red-600 text-white border-red-500'
                }`}>
                    <span className="material-symbols-outlined text-[24px]">
                        {showNotification.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="font-bold text-sm tracking-tight">{showNotification.message}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/leave-requests" className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Maternity Leave Approvals</h1>
                        <p className="text-gray-500 dark:text-slate-400 text-base font-medium">Finalize maternity leave requests and trigger salary calculation.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-8 flex flex-col md:flex-row gap-6">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search by employee name or request ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold cursor-pointer"
                    >
                        <option value="PENDING_ADMIN_APPROVAL">Pending Admin Approval</option>
                        <option value="APPROVED">Final Approved (Salary Calc)</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                <th className="py-5 px-6">Request ID</th>
                                <th className="py-5 px-6">Employee</th>
                                <th className="py-5 px-6">Duration</th>
                                <th className="py-5 px-6">Status</th>
                                <th className="py-5 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center text-slate-500 font-medium italic">Fetching requests...</td></tr>
                            ) : filteredRequests.map(req => (
                                <tr key={req.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group">
                                    <td className="py-5 px-6 font-bold text-slate-900 dark:text-white">#{req.id}</td>
                                    <td className="py-5 px-6">
                                        <div className="font-bold text-slate-800 dark:text-white">{req.employee?.fullName || `${req.employee?.firstName} ${req.employee?.lastName}`}</div>
                                        <div className="text-xs text-slate-500 font-medium">{req.employee?.employeeCode} • {req.branch}</div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="font-medium text-slate-600 dark:text-slate-300">{req.fromDate} to {req.endDate}</div>
                                        <div className="text-xs text-slate-400 font-bold uppercase">{req.totalDays} Days</div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            req.status === "PENDING_ADMIN_APPROVAL" ? "bg-amber-100 text-amber-700" :
                                            req.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                                            "bg-red-100 text-red-700"
                                        }`}>
                                            {req.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6 text-right">
                                        <button onClick={() => handleView(req)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black transition-all">
                                            <span className="material-symbols-outlined text-[18px]">visibility</span> REVIEW
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredRequests.length === 0 && (
                                <tr><td colSpan={5} className="py-20 text-center text-slate-500 font-medium">No maternity leave requests found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Final Approval Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Admin Final Review</h3>
                                <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-wider">Maternity Leave Request #{selectedRequest.id}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-10 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Employee Information</h4>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">Full Name</span> <span className="font-black text-slate-800 dark:text-slate-100">{selectedRequest.employee?.fullName || `${selectedRequest.employee?.firstName} ${selectedRequest.employee?.lastName}`}</span></div>
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">EPF Code</span> <span className="font-black text-slate-800 dark:text-slate-100">{selectedRequest.employee?.employeeCode}</span></div>
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">Current Branch</span> <span className="font-black text-slate-800 dark:text-slate-100">{selectedRequest.branch}</span></div>
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">E-mail Address</span> <span className="font-black text-slate-800 dark:text-slate-100">{selectedRequest.email}</span></div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Leave Parameters</h4>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">Duration</span> <span className="font-black text-slate-800 dark:text-slate-100">{selectedRequest.fromDate} to {selectedRequest.endDate}</span></div>
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">Total Days</span> <span className="font-black text-slate-800 dark:text-slate-100">{selectedRequest.totalDays} Days</span></div>
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">Child Count</span> <span className="font-black text-slate-800 dark:text-slate-100">{selectedRequest.childNumber}</span></div>
                                        <div className="pt-2">
                                            <span className="text-slate-500 font-bold block mb-2 uppercase text-[10px]">Application Reason</span>
                                            <p className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 font-medium leading-relaxed">{selectedRequest.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Verified Documents</h4>
                                {docsLoading ? <p className="text-sm font-medium animate-pulse">Checking document integrity...</p> : documents.length === 0 ? <p className="text-sm text-slate-500 font-medium">No files attached.</p> : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {documents.map(doc => (
                                            <div key={doc.id} onClick={() => handleViewDocument(doc.filePathUrl)} className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">description</span></div>
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{doc.description || doc.documentType}</div>
                                                    <div className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Open Securely</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Administrator Remarks & Final Instructions</h4>
                                <textarea
                                    value={adminRemark}
                                    onChange={(e) => setAdminRemark(e.target.value)}
                                    placeholder="Enter instructions for salary calculation or rejection reason here..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 h-32 resize-none transition-all font-medium"
                                />
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex gap-3">
                                    <span className="material-symbols-outlined text-amber-600">info</span>
                                    <p className="text-xs text-amber-800 dark:text-amber-400 font-bold leading-relaxed">
                                        Finalizing approval will automatically notify the employee via E-mail and trigger a placeholder request for Salary Calculation in the Finance Module.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-end gap-4 rounded-b-3xl">
                            <button onClick={() => setSelectedRequest(null)} className="px-8 py-3 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all text-[10px]">Cancel</button>
                            {selectedRequest.status === "PENDING_ADMIN_APPROVAL" && (
                                <>
                                    <button disabled={submitting} onClick={() => handleDecision("REJECTED")} className="px-8 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-50">Reject Request</button>
                                    <button disabled={submitting} onClick={() => handleDecision("APPROVED")} className="px-8 py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-2">
                                        {submitting ? "Processing..." : "Approve & Calc Salary"}
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

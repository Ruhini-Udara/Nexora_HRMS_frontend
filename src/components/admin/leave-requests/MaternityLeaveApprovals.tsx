"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getSignedUrl } from "@/lib/supabaseClient";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import { WorkflowTrackerStepper } from "@/components/WorkflowTrackerStepper";

// ─── Types ───────────────────────────────────────────────────────────────────
interface MaternityLeave {
    id: number;
    employeeId: number;
    employeeName: string;
    employeeCode: string;
    epfNumber: string;
    leaveTypeId: number;
    leaveTypeName: string;
    childNumber: string;
    department: string;
    branch: string;
    contactNumber: string;
    email: string;
    specialRemark: string;
    status: string;
    reason: string;
    fromDate: string;
    endDate: string;
    totalDays: number;
    createdAt?: string;
}

interface LeaveDocument {
    id: number;
    documentType: string;
    filePathUrl: string;
    description: string;
}

export default function MaternityLeaveApprovals() {
    const { user } = useAuthStore();
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
            const res = await api.get(`/api/v1/leaves/maternity/status/${statusFilter}`);
            setRequests(res.data.sort((a: any, b: any) => b.id - a.id));
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

    const getWorkflowSteps = (req: MaternityLeave) => {
        // Mocking created date if not present for demo purposes
        const createdDate = req.createdAt ? new Date(req.createdAt) : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); 
        const isDelayed = (Date.now() - createdDate.getTime()) > 2 * 24 * 60 * 60 * 1000;
        
        return [
            { label: 'Request Submitted', status: 'completed' as const },
            { label: 'HR Verification', status: 'completed' as const },
            { 
                label: 'Admin Final Review', 
                status: req.status === 'PENDING_ADMIN_APPROVAL' ? 'current' as const : 
                        req.status === 'REJECTED' ? 'pending' as const : 'completed' as const,
                isDelayed: req.status === 'PENDING_ADMIN_APPROVAL' && isDelayed,
                timeSpent: req.status === 'PENDING_ADMIN_APPROVAL' && isDelayed ? '> 2 Days' : undefined
            },
            { 
                label: 'Salary Calculation Queue', 
                status: req.status === 'APPROVED' ? 'current' as const : 'pending' as const 
            }
        ];
    };

    const handleView = async (req: MaternityLeave) => {
        setSelectedRequest(req);
        setAdminRemark("");
        setDocuments([]);
        setDocsLoading(true);
        try {
            const res = await api.get(`/api/v1/documents?refId=${req.id}&refType=MATERNITY_LEAVE`);
            setDocuments(res.data);
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
            await api.post("/api/v1/approvals", {
                refId: selectedRequest.id,
                refType: "MATERNITY_LEAVE",
                decision: decision,
                remark: adminRemark,
                approvedBy: { id: user?.id },
            });

            triggerNotification(
                decision === "APPROVED"
                    ? "Request Approved & Submitted for Salary Calculation! Employee notified via E-mail."
                    : "Request Rejected. Employee notified via E-mail.",
                'success'
            );

            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            console.warn("Approval decision failed:", error);
            const axiosError = error as { response?: { data?: { message?: string } } };
            const errorMsg = axiosError.response?.data?.message || "Something went wrong. Please try again.";
            triggerNotification(errorMsg, 'error');
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
        <div className="max-w-7xl mx-auto w-full relative p-6">
            {/* Toast Notification */}
            {showNotification && (
                <div className={`fixed top-24 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 flex items-center gap-3 ${showNotification.type === 'success' ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-red-600 text-white border-red-500'
                    }`}>
                    <span className="material-symbols-outlined text-[24px]">
                        {showNotification.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="font-bold text-sm tracking-tight">{showNotification.message}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/leave-requests" className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
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
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold cursor-pointer"
                    >
                        <option value="PENDING_ADMIN_APPROVAL">Pending Admin Approval</option>
                        <option value="APPROVED">Final Approved (Salary Calc)</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                <th className="py-5 px-6">Request ID</th>
                                <th className="py-5 px-6">Employee</th>
                                <th className="py-5 px-6">Requested Date</th>
                                <th className="py-5 px-6">Duration</th>
                                <th className="py-5 px-6">Status</th>
                                <th className="py-5 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={6} className="py-20 text-center text-slate-500 dark:text-slate-400 font-medium italic">Fetching requests...</td></tr>
                            ) : filteredRequests.map(req => (
                                <tr key={req.id} className="border-b border-slate-100 dark:border-slate-805 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="py-5 px-6 font-bold text-slate-900 dark:text-white">#{req.id}</td>
                                    <td className="py-5 px-6">
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{req.employeeName}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{req.employeeCode} • {req.department}</div>
                                    </td>
                                    <td className="py-5 px-6 text-slate-600 dark:text-slate-300 font-bold">
                                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="font-medium text-slate-600 dark:text-slate-350">{req.fromDate} to {req.endDate}</div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">{req.totalDays} Days</div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${req.status === "PENDING_ADMIN_APPROVAL" ? "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" :
                                                req.status === "APPROVED" ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" :
                                                    "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                                            }`}>
                                            {req.status === "PENDING_ADMIN_APPROVAL" ? "Pending Admin Approval" : req.status === "APPROVED" ? "Approved" : "Rejected"}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6 text-right">
                                        <button onClick={() => handleView(req)} className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all">
                                            <span className="material-symbols-outlined text-[18px]">visibility</span> Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredRequests.length === 0 && (
                                <tr><td colSpan={6} className="py-20 text-center text-slate-500 dark:text-slate-400 font-medium">No maternity leave requests found.</td></tr>
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
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Final Review</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Maternity Leave Request #{selectedRequest.id}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-10 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold text-primary mb-4">Employee Information</h4>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">Full Name</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.employeeName}</span></div>
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">EPF Code</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.employeeCode}</span></div>
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">Department</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.department}</span></div>
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">E-mail Address</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.email}</span></div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold text-primary mb-4">Leave Parameters</h4>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">Duration</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.fromDate} to {selectedRequest.endDate}</span></div>
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">Total Days</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.totalDays} Days</span></div>
                                        <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-500 font-bold">Child Count</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.childNumber}</span></div>
                                        <div className="pt-2">
                                            <span className="text-slate-500 font-semibold block mb-2 text-sm">Application Reason</span>
                                            <p className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-slate-700 dark:text-slate-350 border border-slate-100 dark:border-slate-800 font-medium leading-relaxed">{selectedRequest.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <WorkflowTrackerStepper steps={getWorkflowSteps(selectedRequest)} />

                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-primary">Verified Documents</h4>
                                {docsLoading ? <p className="text-sm font-medium animate-pulse">Checking document integrity...</p> : documents.length === 0 ? <p className="text-sm text-slate-500 font-medium">No files attached.</p> : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {documents.map(doc => (
                                            <div key={doc.id} onClick={() => handleViewDocument(doc.filePathUrl)} className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">description</span></div>
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.description || doc.documentType}</div>
                                                    <div className="text-xs font-semibold text-primary mt-1">Open Securely</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-primary">Administrator Remarks & Final Instructions</h4>
                                <textarea
                                    value={adminRemark}
                                    onChange={(e) => setAdminRemark(e.target.value)}
                                    placeholder="Enter instructions for salary calculation or rejection reason here..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 h-32 resize-none transition-all font-medium"
                                />
                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
                                    <span className="material-symbols-outlined text-amber-600">info</span>
                                    <p className="text-xs text-amber-800 font-bold leading-relaxed">
                                        Finalizing approval will automatically notify the employee via E-mail and trigger a placeholder request for Salary Calculation in the Finance Module.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-end gap-4 rounded-b-3xl">
                            <button onClick={() => setSelectedRequest(null)} className="px-8 py-3 text-slate-600 font-semibold hover:bg-slate-200 :bg-slate-800 rounded-xl transition-all text-sm">Cancel</button>
                            {selectedRequest.status === "PENDING_ADMIN_APPROVAL" && (
                                <>
                                    <button disabled={submitting} onClick={() => handleDecision("REJECTED")} className="px-8 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-semibold text-sm transition-all disabled:opacity-50">Reject Request</button>
                                    <button disabled={submitting} onClick={() => handleDecision("APPROVED")} className="px-8 py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-semibold text-sm shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-2">
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

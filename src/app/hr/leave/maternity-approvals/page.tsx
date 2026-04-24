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

export default function MaternityApprovalsPage() {
    const [requests, setRequests] = useState<MaternityLeave[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<MaternityLeave | null>(null);
    const [documents, setDocuments] = useState<LeaveDocument[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [hrRemarkInput, setHrRemarkInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING_HR_APPROVAL");
    const [submitting, setSubmitting] = useState(false);

    // Fetch Requests
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`http://localhost:8080/api/v1/leaves/maternity/status/${statusFilter}`);
            if (!res.ok) throw new Error("Failed to fetch requests");
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            setError("Could not connect to the backend. Please ensure the server is running.");
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleView = async (req: MaternityLeave) => {
        setSelectedRequest(req);
        setHrRemarkInput("");
        setDocuments([]);
        setDocsLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/v1/documents?refId=${req.id}&refType=MATERNITY_LEAVE`);
            if (res.ok) {
                const docs = await res.json();
                setDocuments(docs);
            }
        } catch (err) {
            console.error("Error fetching documents", err);
        } finally {
            setDocsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
        setHrRemarkInput("");
    };

    const handleVerifySubmit = async (decision: "APPROVED" | "REJECTED") => {
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
                    remark: hrRemarkInput,
                    approvedBy: { id: 1 }, // TODO: use actual HR id
                }),
            });
            if (!res.ok) throw new Error("Verification failed");
            
            handleCloseModal();
            fetchRequests();
        } catch (err) {
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/hr/leave" className="text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                                Maternity Leave Verification
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 ml-9">
                            Review and verify maternity leave requests before administrator approval.
                        </p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-symbols-outlined text-slate-400">search</span>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by ID or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="material-symbols-outlined text-slate-400">filter_list</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer font-semibold"
                        >
                            <option value="PENDING_HR_APPROVAL">Pending Verification</option>
                            <option value="PENDING_ADMIN_APPROVAL">Verified (Pending Admin)</option>
                            <option value="APPROVED">Approved (Final)</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    <th className="py-4 px-6">ID</th>
                                    <th className="py-4 px-6">Employee</th>
                                    <th className="py-4 px-6">Date Range</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-12 text-center text-slate-500">Loading requests...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan={5} className="py-12 text-center text-red-500">{error}</td></tr>
                                ) : filteredRequests.map((req) => (
                                    <tr key={req.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                        <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">#{req.id}</td>
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-slate-800 dark:text-white">{req.employee?.fullName || `${req.employee?.firstName} ${req.employee?.lastName}`}</div>
                                            <div className="text-xs text-slate-500">{req.employee?.employeeCode} • {req.branch}</div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                                            {req.fromDate} to {req.endDate} <br />
                                            <span className="text-xs text-slate-400">({req.totalDays} Days)</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                req.status === "PENDING_HR_APPROVAL" ? "bg-amber-100 text-amber-700" :
                                                req.status === "PENDING_ADMIN_APPROVAL" ? "bg-blue-100 text-blue-700" :
                                                req.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                                                "bg-red-100 text-red-700"
                                            }`}>
                                                {req.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleView(req)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-500">No requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 h-screen max-h-screen">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-full">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verify Maternity Leave Request</h3>
                                <p className="text-sm text-slate-500 mt-1">Request ID: #{selectedRequest.id}</p>
                            </div>
                            <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wider">Employee Info</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.employee?.fullName || `${selectedRequest.employee?.firstName} ${selectedRequest.employee?.lastName}`}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Code:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.employee?.employeeCode}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Branch:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.branch}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Contact:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.contactNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.email}</span></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wider">Leave Details</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Dates:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.fromDate} to {selectedRequest.endDate}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Total Days:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.totalDays}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Child Number:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.childNumber}</span></div>
                                        <div className="mt-2 text-slate-500">Reason:</div>
                                        <p className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">{selectedRequest.reason}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wider">Medical Documents</h4>
                                {docsLoading ? (
                                    <p className="text-sm text-slate-500">Loading documents...</p>
                                ) : documents.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No documents attached.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {documents.map(doc => (
                                            <div 
                                                key={doc.id} 
                                                onClick={() => handleViewDocument(doc.filePathUrl)}
                                                className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:border-primary transition-colors cursor-pointer group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined">description</span>
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{doc.description || doc.documentType}</div>
                                                    <div className="text-[10px] text-primary group-hover:underline">Click to view securely</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wider">Verification Remarks</h4>
                                <textarea
                                    value={hrRemarkInput}
                                    onChange={(e) => setHrRemarkInput(e.target.value)}
                                    placeholder="Add any verification notes or rejection reasons here..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-primary focus:ring-1 focus:ring-primary h-24 resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
                            {selectedRequest.status === "PENDING_HR_APPROVAL" ? (
                                <>
                                    <button
                                        disabled={submitting}
                                        onClick={() => handleVerifySubmit("REJECTED")}
                                        className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        disabled={submitting}
                                        onClick={() => handleVerifySubmit("APPROVED")}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? "Verifying..." : <><span className="material-symbols-outlined text-[18px]">verified</span> Verify & Forward</>}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleCloseModal}
                                    className="px-8 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 rounded-xl font-bold text-sm transition-colors"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

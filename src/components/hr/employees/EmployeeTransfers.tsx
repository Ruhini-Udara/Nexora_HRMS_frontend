"use client";

import React, { useState } from "react";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────
type TransferStatus = "SUBMITTED" | "VERIFIED_BY_HR" | "PENDING_ADMIN" | "REJECTED";

interface TransferDocument {
    key: string;
    label: string;
    filename: string;
}

interface TransferRequest {
    id: string;
    epfNumber: string;
    employeeName: string;
    designation: string;
    branch: string;
    currentBranch: string;
    targetBranch: string;
    transferType: string;
    reason: string;
    requestDate: string;
    expectedDate: string;
    status: TransferStatus;
    documents: TransferDocument[];
    hrRemark: string;
}

// ── Mock Data ───────────────────────────────────────────────────────
const MOCK_REQUESTS: TransferRequest[] = [
    {
        id: "TRF-2024-001",
        epfNumber: "12345",
        employeeName: "Kasun Perera",
        designation: "Software Engineer",
        branch: "Colombo Branch",
        currentBranch: "Colombo Branch",
        targetBranch: "Kandy Branch",
        transferType: "Requested by Employee",
        reason: "Career advancement to senior role available at Kandy Branch. Completed 3 years in current role with consistently high performance ratings.",
        requestDate: "2024-10-01",
        expectedDate: "2024-11-15",
        status: "SUBMITTED",
        documents: [
            { key: "justification", label: "Transfer Justification Letter", filename: "transfer_justification_kasun.pdf" },
            { key: "proof", label: "Proof Documents", filename: "performance_review_2024.pdf" },
        ],
        hrRemark: "",
    },
    {
        id: "TRF-2024-002",
        epfNumber: "67890",
        employeeName: "Nimali Silva",
        designation: "Marketing Manager",
        branch: "Kandy Branch",
        currentBranch: "Kandy Branch",
        targetBranch: "Galle Branch",
        transferType: "Requested by Employee",
        reason: "Relocating due to spouse's job transfer to Galle district. Need to move closer to family residence for personal commitments.",
        requestDate: "2024-10-05",
        expectedDate: "2024-12-01",
        status: "SUBMITTED",
        documents: [
            { key: "justification", label: "Transfer Justification Letter", filename: "relocation_letter_nimali.pdf" },
        ],
        hrRemark: "",
    },
    {
        id: "TRF-2024-003",
        epfNumber: "34567",
        employeeName: "Tharindu Jayawardena",
        designation: "Senior Accountant",
        branch: "Head Office",
        currentBranch: "Head Office",
        targetBranch: "Colombo Branch",
        transferType: "Requested by Employee",
        reason: "Medical recommendation to transfer to a branch closer to residence to reduce daily commute stress. Supporting medical certificate attached.",
        requestDate: "2024-09-28",
        expectedDate: "2024-10-30",
        status: "SUBMITTED",
        documents: [
            { key: "justification", label: "Transfer Justification Letter", filename: "medical_transfer_tharindu.pdf" },
            { key: "medical_cert", label: "Medical Certificate", filename: "medical_cert_2024.pdf" },
            { key: "proof", label: "Proof Documents", filename: "doctor_recommendation.pdf" },
        ],
        hrRemark: "",
    },
];

// ── Status badge config ─────────────────────────────────────────────
const statusConfig: Record<TransferStatus, { label: string; classes: string }> = {
    SUBMITTED: {
        label: "Submitted",
        classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    VERIFIED_BY_HR: {
        label: "Verified",
        classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    PENDING_ADMIN: {
        label: "Pending",
        classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    REJECTED: {
        label: "Rejected",
        classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
};

// ── Transfer Type badge config ──────────────────────────────────────
const typeConfig: Record<string, { icon: string; color: string }> = {
    "Requested by Employee": { icon: "person", color: "text-primary" },
};

// ── Main Component ──────────────────────────────────────────────────
export default function EmployeeTransfers() {
    const [activeTab, setActiveTab] = useState<"employee" | "other">("employee");
    const [requests, setRequests] = useState<TransferRequest[]>(MOCK_REQUESTS);
    const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
    const [hrRemarkInput, setHrRemarkInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showVerifiedList, setShowVerifiedList] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // ── Handlers ────────────────────────────────────────────────────
    const handleView = (req: TransferRequest) => {
        setSelectedRequest(req);
        setHrRemarkInput(req.hrRemark || "");
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
        setHrRemarkInput("");
    };

    const handleVerifySubmit = (newStatus: "VERIFIED_BY_HR" | "REJECTED") => {
        if (!selectedRequest) return;
        setRequests((prev) =>
            prev.map((req) =>
                req.id === selectedRequest.id
                    ? { ...req, status: newStatus, hrRemark: hrRemarkInput }
                    : req
            )
        );
        handleCloseModal();
    };

    // Enter verified list view
    const handleShowVerifiedList = () => {
        setShowVerifiedList(true);
        setSearchTerm("");
    };

    // Go back to normal list
    const handleBackToList = () => {
        setShowVerifiedList(false);
        setShowConfirmDialog(false);
    };

    // Confirm and submit ALL verified requests to admin
    const handleConfirmSubmitToAdmin = () => {
        const verifiedIds = requests
            .filter((r) => r.status === "VERIFIED_BY_HR")
            .map((r) => r.id);

        // TODO: POST /api/transfers/bulk-submit with verifiedIds
        console.log("Confirm & Submit to Admin, IDs:", verifiedIds);

        setRequests((prev) =>
            prev.map((req) =>
                verifiedIds.includes(req.id)
                    ? { ...req, status: "PENDING_ADMIN" as TransferStatus }
                    : req
            )
        );
        setShowConfirmDialog(false);
        setShowVerifiedList(false);
    };

    // ── Filtered list ───────────────────────────────────────────────
    const getFilteredRequests = () => {
        let list = requests;

        // In verified-list view, only show VERIFIED_BY_HR requests
        if (showVerifiedList) {
            list = list.filter((req) => req.status === "VERIFIED_BY_HR");
        }

        return list.filter((req) => {
            const matchesSearch =
                req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || req.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    };

    const filteredRequests = getFilteredRequests();

    // Count verified requests for the button badge
    const verifiedCount = requests.filter((r) => r.status === "VERIFIED_BY_HR").length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {showVerifiedList ? (
                                <button onClick={handleBackToList} className="text-slate-400 hover:text-primary transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                            ) : (
                                <Link href="/hr/employees" className="text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </Link>
                            )}
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                                {showVerifiedList ? "Verified Transfer Requests" : "Employee Transfers"}
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 ml-9">
                            {showVerifiedList
                                ? "Review the verified transfer requests below. Submit this list for Admin approval."
                                : "Review, verify documents, and approve employee transfer requests across all branches."}
                        </p>
                    </div>
                </div>

                {/* Sub-Tabs — hidden in verified-list view */}
                {!showVerifiedList && (
                    <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex gap-0">
                            <button
                                onClick={() => setActiveTab("employee")}
                                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === "employee"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                                    Employee Transfer Requests
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("other")}
                                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === "other"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                                    Other Transfer Requests
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {(activeTab === "employee" || showVerifiedList) ? (
                    <>
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
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {showVerifiedList ? (
                                    /* In verified-list view — show a static label */
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400">filter_list</span>
                                        <span className="px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                            Verified Requests Only
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400">filter_list</span>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                                            >
                                                <option value="All">All Statuses</option>
                                                <option value="SUBMITTED">Submitted</option>
                                                <option value="PENDING_ADMIN">Pending</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                        </div>

                                        {/* Submit Verified List button — only when verified requests exist */}
                                        {verifiedCount > 0 && (
                                            <button
                                                onClick={handleShowVerifiedList}
                                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">checklist</span>
                                                Submit List for Admin ({verifiedCount})
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                            <th className="py-4 px-6">Request ID</th>
                                            <th className="py-4 px-6">Employee Name</th>
                                            <th className="py-4 px-6">Branch</th>
                                            <th className="py-4 px-6">Transfer Type</th>
                                            <th className="py-4 px-6">Current Status</th>
                                            <th className="py-4 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {filteredRequests.map((req) => {
                                            const st = statusConfig[req.status];
                                            const tp = typeConfig[req.transferType] || { icon: "swap_horiz", color: "text-primary" };
                                            return (
                                                <tr
                                                    key={req.id}
                                                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
                                                >
                                                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{req.id}</td>
                                                    <td className="py-4 px-6">
                                                        <div className="font-semibold text-slate-800 dark:text-white">{req.employeeName}</div>
                                                        <div className="text-xs text-slate-500">{req.epfNumber} • {req.designation}</div>
                                                    </td>
                                                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{req.branch}</td>
                                                    <td className="py-4 px-6">
                                                        <span className="inline-flex items-center gap-1.5 text-sm">
                                                            <span className={`material-symbols-outlined text-[16px] ${tp.color}`}>{tp.icon}</span>
                                                            <span className="text-slate-700 dark:text-slate-300">{req.transferType}</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${st.classes}`}>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <button
                                                            onClick={() => handleView(req)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                            {showVerifiedList ? "View" : "Review"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredRequests.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-slate-500">
                                                    {showVerifiedList
                                                        ? "No verified transfer requests available to submit."
                                                        : "No transfer requests found matching your filters."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Confirm and Submit Section — only in verified-list view when there are results */}
                        {showVerifiedList && filteredRequests.length > 0 && (
                            <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                            {filteredRequests.length} verified request(s) ready for Admin approval
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            All verified employee transfer requests will be submitted to Admin for final approval.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowConfirmDialog(true)}
                                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        Confirm and Submit to Admin
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Other Transfer Requests Tab — Placeholder */
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400 text-3xl">folder_shared</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Other Transfer Requests</h3>
                            <p className="text-sm text-slate-500 max-w-md">
                                This section will display inter-departmental and cross-functional transfer requests. Coming soon.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Review / View Modal ─────────────────────────────────────── */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 h-screen max-h-screen">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {selectedRequest.status === "SUBMITTED" && !showVerifiedList
                                        ? "Verify Transfer Request"
                                        : "View Transfer Request"}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Request ID: {selectedRequest.id}</p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body — matches employee TransferRequestPage layout */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="p-8 space-y-10">

                                    {/* Transfer Request Details Header */}
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transfer Request Details</h2>
                                                <p className="text-sm text-slate-500 mt-1">Submitted by {selectedRequest.employeeName} ({selectedRequest.epfNumber})</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${statusConfig[selectedRequest.status].classes}`}>
                                                {statusConfig[selectedRequest.status].label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Form Fields — read-only */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Current Department
                                            </label>
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                                                readOnly
                                                value={selectedRequest.designation + " - " + selectedRequest.branch}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Current Location
                                            </label>
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                                                readOnly
                                                value={selectedRequest.currentBranch}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Target Location
                                            </label>
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                                                readOnly
                                                value={selectedRequest.targetBranch}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Expected Date
                                            </label>
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                                                readOnly
                                                value={selectedRequest.expectedDate}
                                            />
                                        </div>
                                    </div>

                                    {/* Valid Reason — read-only */}
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Valid Reason
                                        </label>
                                        <textarea
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300 resize-none"
                                            readOnly
                                            rows={4}
                                            value={selectedRequest.reason}
                                        />
                                    </div>

                                    {/* Document Cards */}
                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Required Documents
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedRequest.documents.map((doc) => (
                                                <div
                                                    key={doc.key}
                                                    className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10 p-5 transition-all"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-900/30">
                                                            <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400">check_circle</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{doc.label}</p>
                                                                <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded uppercase">Uploaded</span>
                                                            </div>
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{doc.filename}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* HR Remarks — editable only when SUBMITTED and not in verified-list view */}
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            HR Remarks
                                        </label>
                                        <textarea
                                            value={hrRemarkInput}
                                            onChange={(e) => setHrRemarkInput(e.target.value)}
                                            placeholder={selectedRequest.status === "SUBMITTED" && !showVerifiedList ? "Add any verification notes or rejection reasons here..." : ""}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                            rows={3}
                                            readOnly={selectedRequest.status !== "SUBMITTED" || showVerifiedList}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
                            {selectedRequest.status === "SUBMITTED" && !showVerifiedList ? (
                                <>
                                    <button
                                        onClick={() => handleVerifySubmit("REJECTED")}
                                        className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => handleVerifySubmit("VERIFIED_BY_HR")}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">verified</span>
                                        Verify &amp; Submit for Admin Approval
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Confirmation Dialog ─────────────────────────────────────── */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">warning</span>
                                Confirm Submission
                            </h3>
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                You are about to submit <span className="font-bold text-slate-800 dark:text-white">{verifiedCount} verified transfer request(s)</span> to Admin for final approval.
                            </p>
                            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-start gap-2">
                                    <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                                    After submitting for approval, the request status cannot be changed.
                                </p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSubmitToAdmin}
                                className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">send</span>
                                Yes, Submit to Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

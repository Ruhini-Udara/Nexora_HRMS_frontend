"use client";

import React, { useState } from "react";


// ── Types ───────────────────────────────────────────────────────────
type WelfareStatus = "SUBMITTED" | "APPROVED" | "REJECTED";

interface WelfareDocument {
    key: string;
    label: string;
    filename: string;
}

interface WelfareApprovalRequest {
    id: string;
    epfNumber: string;
    employeeName: string;
    designation: string;
    branch: string;
    welfareType: string;
    amount: number;
    adjustedAmount: number; // For adjusting during certification
    specialRemark: string;
    requestDate: string;
    status: WelfareStatus;
    documents: WelfareDocument[];
    hrRemarks: string; // Used for rejection reasons or internal notes
}

// ── Mock Data ───────────────────────────────────────────────────────
const MOCK_REQUESTS: WelfareApprovalRequest[] = [
    {
        id: "WLF-2024-882",
        epfNumber: "12345",
        employeeName: "Kasun Perera",
        designation: "Software Engineer",
        branch: "Colombo Branch",
        welfareType: "Family Funeral",
        amount: 50000,
        adjustedAmount: 50000,
        specialRemark: "Immediate requirement for funeral expenses.",
        requestDate: "2024-10-01",
        status: "SUBMITTED",
        documents: [
            { key: "cert", label: "Supporting Document", filename: "death_certificate.pdf" },
        ],
        hrRemarks: "",
    },
    {
        id: "WLF-2024-883",
        epfNumber: "67890",
        employeeName: "Nimali Silva",
        designation: "Marketing Manager",
        branch: "Kandy Branch",
        welfareType: "Festival Advance",
        amount: 25000,
        adjustedAmount: 25000,
        specialRemark: "Sinhala and Tamil New Year advance.",
        requestDate: "2024-10-05",
        status: "SUBMITTED",
        documents: [],
        hrRemarks: "",
    },
    {
        id: "WLF-2024-884",
        epfNumber: "34567",
        employeeName: "Tharindu Jayawardena",
        designation: "Senior Accountant",
        branch: "Head Office",
        welfareType: "Accident Claims",
        amount: 150000,
        adjustedAmount: 150000,
        specialRemark: "Vehicle accident while on duty. Original bills attached.",
        requestDate: "2024-09-28",
        status: "SUBMITTED",
        documents: [
            { key: "police", label: "Police Report", filename: "police_report_345.pdf" },
            { key: "medical", label: "Medical Bills", filename: "hospital_bills.pdf" },
        ],
        hrRemarks: "",
    },
];

// ── Status Configs ───────────────────────────────────────────
const statusConfig: Record<WelfareStatus, { label: string; classes: string }> = {
    SUBMITTED: { label: "Submitted", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    APPROVED: { label: "Approved", classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    REJECTED: { label: "Rejected", classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function WelfarePage() {
    const [requests, setRequests] = useState<WelfareApprovalRequest[]>(MOCK_REQUESTS);
    const [selectedRequest, setSelectedRequest] = useState<WelfareApprovalRequest | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal Form State
    const [adjustedAmountStr, setAdjustedAmountStr] = useState<string>("");
    const [hrRemarksStr, setHrRemarksStr] = useState<string>("");
    const [actionError, setActionError] = useState<string>("");

    // ── Data Filtering ──────────────────────────────────────────────
    const filteredRequests = requests.filter((req) => {
        const matchesSearch =
            req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const isActionable = (req: WelfareApprovalRequest) => {
        return req.status === "SUBMITTED";
    };

    // ── Event Handlers ──────────────────────────────────────────────
    const handleView = (req: WelfareApprovalRequest) => {
        setSelectedRequest(req);
        setAdjustedAmountStr(req.adjustedAmount.toString());
        setHrRemarksStr(req.hrRemarks || "");
        setActionError("");
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
    };

    const processAction = (action: "APPROVE" | "REJECT") => {
        if (!selectedRequest) return;
        
        // Validation
        if (action === "REJECT" && !hrRemarksStr.trim()) {
            setActionError("Mandatory Remarks are required for rejection.");
            return;
        }

        const numericAmount = parseFloat(adjustedAmountStr) || selectedRequest.adjustedAmount;

        const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

        setRequests((prev) =>
            prev.map((r) =>
                r.id === selectedRequest.id
                    ? { ...r, status: newStatus, adjustedAmount: numericAmount, hrRemarks: hrRemarksStr.trim() }
                    : r
            )
        );



        handleCloseModal();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
                {/* Header Sequence */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                                HR Welfare Approvals
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">
                            Review and approve pending employee welfare requests systematically.
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
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
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    <th className="py-4 px-6">Request ID</th>
                                    <th className="py-4 px-6">Employee Info</th>
                                    <th className="py-4 px-6">Branch</th>
                                    <th className="py-4 px-6">Welfare Type</th>
                                    <th className="py-4 px-6">Amount</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredRequests.map((req) => {
                                    const st = statusConfig[req.status];
                                    const canAct = isActionable(req);

                                    return (
                                        <tr
                                            key={req.id}
                                            className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${canAct ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                        >
                                            <td className="py-4 px-6 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                {canAct && <span className="w-2 h-2 rounded-full bg-primary" title="Needs Action"></span>}
                                                {req.id}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-slate-800 dark:text-white">{req.employeeName}</div>
                                                <div className="text-xs text-slate-500">{req.epfNumber} • {req.designation}</div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{req.branch}</td>
                                            <td className="py-4 px-6 text-slate-800 dark:text-slate-200 font-medium">
                                                {req.welfareType}
                                            </td>
                                            <td className="py-4 px-6 text-slate-800 dark:text-slate-200">
                                                LKR {req.adjustedAmount.toLocaleString()}
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
                                                    {canAct ? 'Review' : 'View'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-500">
                                            No requests found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Review / View Modal ─────────────────────────────────────── */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 h-screen max-h-screen">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {isActionable(selectedRequest) ? "Final Approval Review" : "View Welfare Request"}
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

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="p-8 space-y-8">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedRequest.welfareType}</h2>
                                            <p className="text-sm text-slate-500 mt-1">Requested by {selectedRequest.employeeName} ({selectedRequest.epfNumber}) on {selectedRequest.requestDate}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${statusConfig[selectedRequest.status].classes}`}>
                                            {statusConfig[selectedRequest.status].label}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Employee Designation
                                            </label>
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                                                readOnly
                                                value={selectedRequest.designation}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Branch Location
                                            </label>
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                                                readOnly
                                                value={selectedRequest.branch}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Special Remark
                                        </label>
                                        <textarea
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300 resize-none"
                                            readOnly
                                            rows={2}
                                            value={selectedRequest.specialRemark || "No special remarks provided."}
                                        />
                                    </div>

                                    {/* Document Cards */}
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Supporting Documents
                                        </label>
                                        {selectedRequest.documents.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {selectedRequest.documents.map((doc) => (
                                                    <div
                                                        key={doc.key}
                                                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center gap-3"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center flex-shrink-0">
                                                            <span className="material-symbols-outlined text-slate-400">description</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{doc.label}</p>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-red-500 text-[14px]">picture_as_pdf</span>
                                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hover:text-primary transition-colors cursor-pointer">{doc.filename}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                                <p className="text-sm text-slate-500 text-center">No documents uploaded with this request.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                                        <div className="grid grid-cols-2 gap-6 items-start">
                                            {/* Amount Fields */}
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                        Original Requested Amount
                                                    </label>
                                                    <p className="text-lg font-bold text-slate-800 dark:text-white">LKR {selectedRequest.amount.toLocaleString()}</p>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-primary uppercase tracking-wider">
                                                        Approved/Adjusted Amount (LKR)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={adjustedAmountStr}
                                                        onChange={(e) => setAdjustedAmountStr(e.target.value)}
                                                        readOnly={!isActionable(selectedRequest)}
                                                        className={`w-full font-bold border rounded-lg px-4 py-3 text-sm outline-none transition-colors ${
                                                            isActionable(selectedRequest)
                                                                ? "bg-white dark:bg-slate-800 border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                                                                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                                        }`}
                                                    />
                                                    {isActionable(selectedRequest) && (
                                                        <p className="text-[10px] text-slate-500 mt-1">You may adjust this amount before final approval.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Remarks */}
                                            <div className="space-y-2">
                                                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Approval/Rejection Remarks
                                                </label>
                                                {isActionable(selectedRequest) ? (
                                                    <textarea
                                                        value={hrRemarksStr}
                                                        onChange={(e) => { setHrRemarksStr(e.target.value); setActionError(""); }}
                                                        placeholder="Enter mandatory remarks if rejecting, or optional notes if certifying..."
                                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <div className="mb-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                                        {selectedRequest.hrRemarks || "No remarks provided."}
                                                    </div>
                                                )}
                                                {actionError && (
                                                    <p className="text-xs text-red-500 font-semibold">{actionError}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
                            {isActionable(selectedRequest) ? (
                                <>
                                    <button
                                        onClick={() => processAction("REJECT")}
                                        className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => processAction("APPROVE")}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">verified</span> Approve Request
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
        </div>
    );
}

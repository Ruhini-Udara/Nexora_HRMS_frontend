"use client";

import React, { useState } from "react";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────
type ResignationStatus =
    | "SUBMITTED"
    | "VERIFIED_BY_HR"
    | "PENDING_DIRECTOR"
    | "REJECTED";

interface ResignationDocument {
    key: string;
    label: string;
    filename: string;
}

interface LeaveBalance {
    type: string;
    total: number;
    used: number;
    remaining: number;
    color: string;
    bg: string;
}

interface ResignationRequest {
    id: string;
    epfNumber: string;
    employeeName: string;
    designation: string;
    branch: string;
    reason: string;
    initiationDate: string;
    effectiveDate: string;
    obligationDetails: string;
    specialRemark: string;
    documents: ResignationDocument[];
    leaveBalances: LeaveBalance[];
    hrRemark: string;
    status: ResignationStatus;
}

// ── Mock Data ───────────────────────────────────────────────────────
const MOCK_REQUESTS: ResignationRequest[] = [
    {
        id: "RES-2024-001",
        epfNumber: "12345",
        employeeName: "Kasun Perera",
        designation: "Software Engineer",
        branch: "Colombo Branch",
        reason: "Career Growth",
        initiationDate: "2024-10-01",
        effectiveDate: "2024-11-01",
        obligationDetails:
            "Handover of the Customer Portal project to Nimal Silva. Two pending sprint tasks will be completed before last working day. No direct reports.",
        specialRemark: "Requesting early settlement of final dues.",
        documents: [
            { key: "resignation_letter", label: "Resignation Letter", filename: "resignation_letter_kasun.pdf" },
            { key: "clearance_letter", label: "Obligations Clearance Letter", filename: "clearance_kasun.pdf" },
            { key: "handover_checklist", label: "Employee Handover Checklist", filename: "handover_checklist_kasun.pdf" },
        ],
        leaveBalances: [
            { type: "Annual Leave", total: 14, used: 6, remaining: 8, color: "#8B3A00", bg: "#FEF3EB" },
            { type: "Sick Leave", total: 7, used: 2, remaining: 5, color: "#0D9488", bg: "#F0FDFA" },
            { type: "Casual Leave", total: 7, used: 4, remaining: 3, color: "#6366F1", bg: "#EEF2FF" },
        ],
        hrRemark: "",
        status: "SUBMITTED",
    },
    {
        id: "RES-2024-002",
        epfNumber: "67890",
        employeeName: "Nimali Silva",
        designation: "Marketing Manager",
        branch: "Kandy Branch",
        reason: "Personal Reasons",
        initiationDate: "2024-10-05",
        effectiveDate: "2024-11-10",
        obligationDetails:
            "All current campaigns handed over to Tharaka. Budget reports for Q4 have been filed. No pending external contracts.",
        specialRemark: "",
        documents: [
            { key: "resignation_letter", label: "Resignation Letter", filename: "resignation_letter_nimali.pdf" },
            { key: "clearance_letter", label: "Obligations Clearance Letter", filename: "clearance_nimali.pdf" },
        ],
        leaveBalances: [
            { type: "Annual Leave", total: 14, used: 10, remaining: 4, color: "#8B3A00", bg: "#FEF3EB" },
            { type: "Sick Leave", total: 7, used: 7, remaining: 0, color: "#0D9488", bg: "#F0FDFA" },
            { type: "Casual Leave", total: 7, used: 2, remaining: 5, color: "#6366F1", bg: "#EEF2FF" },
        ],
        hrRemark: "",
        status: "SUBMITTED",
    },
    {
        id: "RES-2024-003",
        epfNumber: "34567",
        employeeName: "Tharindu Jayawardena",
        designation: "Senior Accountant",
        branch: "Head Office",
        reason: "Better Opportunity",
        initiationDate: "2024-09-28",
        effectiveDate: "2024-10-31",
        obligationDetails:
            "All audit files have been archived. Year-end reconciliation handed to Priya. Infrastructure access revoked.",
        specialRemark: "Please expedite the release letter for new employer.",
        documents: [
            { key: "resignation_letter", label: "Resignation Letter", filename: "resignation_letter_tharindu.pdf" },
            { key: "clearance_letter", label: "Obligations Clearance Letter", filename: "clearance_tharindu.pdf" },
            { key: "handover_checklist", label: "Employee Handover Checklist", filename: "handover_tharindu.pdf" },
        ],
        leaveBalances: [
            { type: "Annual Leave", total: 14, used: 3, remaining: 11, color: "#8B3A00", bg: "#FEF3EB" },
            { type: "Sick Leave", total: 7, used: 1, remaining: 6, color: "#0D9488", bg: "#F0FDFA" },
            { type: "Casual Leave", total: 7, used: 0, remaining: 7, color: "#6366F1", bg: "#EEF2FF" },
        ],
        hrRemark: "",
        status: "SUBMITTED",
    },
    {
        id: "RES-2024-004",
        epfNumber: "89012",
        employeeName: "Amaya Bandara",
        designation: "HR Executive",
        branch: "Galle Branch",
        reason: "Relocation",
        initiationDate: "2024-09-15",
        effectiveDate: "2024-10-15",
        obligationDetails:
            "All HR files digitised and transferred to the central repository. Payroll for September processed.",
        specialRemark: "Relocating abroad permanently.",
        documents: [
            { key: "resignation_letter", label: "Resignation Letter", filename: "resignation_letter_amaya.pdf" },
            { key: "clearance_letter", label: "Obligations Clearance Letter", filename: "clearance_amaya.pdf" },
            { key: "handover_checklist", label: "Employee Handover Checklist", filename: "handover_amaya.pdf" },
        ],
        leaveBalances: [
            { type: "Annual Leave", total: 14, used: 14, remaining: 0, color: "#8B3A00", bg: "#FEF3EB" },
            { type: "Sick Leave", total: 7, used: 3, remaining: 4, color: "#0D9488", bg: "#F0FDFA" },
            { type: "Casual Leave", total: 7, used: 7, remaining: 0, color: "#6366F1", bg: "#EEF2FF" },
        ],
        hrRemark: "All documents verified. Eligible for director approval.",
        status: "VERIFIED_BY_HR",
    },
];

// ── Status badge config ─────────────────────────────────────────────
const statusConfig: Record<ResignationStatus, { label: string; classes: string }> = {
    SUBMITTED: {
        label: "Submitted",
        classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    VERIFIED_BY_HR: {
        label: "Verified",
        classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    PENDING_DIRECTOR: {
        label: "Pending Director",
        classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    REJECTED: {
        label: "Rejected",
        classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
};

// ── ReadOnly input helper ────────────────────────────────────────────
const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
        </label>
        <input
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
            readOnly
            value={value}
        />
    </div>
);

// ── ReadOnly textarea helper ─────────────────────────────────────────
const ReadOnlyTextarea = ({ label, value, rows = 3 }: { label: string; value: string; rows?: number }) => (
    <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
        </label>
        <textarea
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300 resize-none"
            readOnly
            rows={rows}
            value={value}
        />
    </div>
);

// ── Main Component ──────────────────────────────────────────────────
export default function EmployeeResignations() {
    const [requests, setRequests] = useState<ResignationRequest[]>(MOCK_REQUESTS);
    const [selectedRequest, setSelectedRequest] = useState<ResignationRequest | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showVerifiedList, setShowVerifiedList] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    // ── Reject popup state ────────────────────────────────────────────
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectReasonError, setRejectReasonError] = useState(false);

    // ── Handlers ─────────────────────────────────────────────────────
    const handleView = (req: ResignationRequest) => {
        setSelectedRequest(req);
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
    };

    const handleOpenRejectDialog = () => {
        setRejectReason("");
        setRejectReasonError(false);
        setShowRejectDialog(true);
    };

    const handleCloseRejectDialog = () => {
        setShowRejectDialog(false);
        setRejectReason("");
        setRejectReasonError(false);
    };

    const handleConfirmReject = () => {
        if (!rejectReason.trim()) {
            setRejectReasonError(true);
            return;
        }
        if (!selectedRequest) return;
        setRequests((prev) =>
            prev.map((req) =>
                req.id === selectedRequest.id
                    ? { ...req, status: "REJECTED", hrRemark: rejectReason }
                    : req
            )
        );
        handleCloseRejectDialog();
        handleCloseModal();
    };

    const handleVerify = () => {
        if (!selectedRequest) return;
        setRequests((prev) =>
            prev.map((req) =>
                req.id === selectedRequest.id
                    ? { ...req, status: "VERIFIED_BY_HR" }
                    : req
            )
        );
        handleCloseModal();
    };

    const handleShowVerifiedList = () => {
        setShowVerifiedList(true);
        setSearchTerm("");
        setStatusFilter("All");
    };

    const handleBackToList = () => {
        setShowVerifiedList(false);
        setShowConfirmDialog(false);
    };

    const handleConfirmSubmitToDirector = () => {
        const verifiedIds = requests
            .filter((r) => r.status === "VERIFIED_BY_HR")
            .map((r) => r.id);
        // TODO: POST /api/resignations/bulk-submit-director with verifiedIds
        console.log("Submit to Director, IDs:", verifiedIds);
        setRequests((prev) =>
            prev.map((req) =>
                verifiedIds.includes(req.id)
                    ? { ...req, status: "PENDING_DIRECTOR" as ResignationStatus }
                    : req
            )
        );
        setShowConfirmDialog(false);
        setShowVerifiedList(false);
    };

    // ── Filtered list ─────────────────────────────────────────────────
    const getFilteredRequests = () => {
        let list = requests;
        if (showVerifiedList) {
            list = list.filter((r) => r.status === "VERIFIED_BY_HR");
        }
        return list.filter((req) => {
            const matchesSearch =
                req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.epfNumber.includes(searchTerm);
            const matchesStatus = statusFilter === "All" || req.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    };

    const filteredRequests = getFilteredRequests();
    const verifiedCount = requests.filter((r) => r.status === "VERIFIED_BY_HR").length;

    const canVerify =
        selectedRequest?.status === "SUBMITTED" &&
        !showVerifiedList;

    // ── Format helpers ────────────────────────────────────────────────
    const formatDate = (iso: string) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full">

                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {showVerifiedList ? (
                                <button
                                    onClick={handleBackToList}
                                    className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                            ) : (
                                <Link href="/hr/employees" className="text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </Link>
                            )}
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                                {showVerifiedList ? "Verified Resignation Requests" : "Employee Resignations"}
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 ml-9">
                            {showVerifiedList
                                ? "Review verified requests below. Submit this list for Director approval."
                                : "Review, verify eligibility, and manage employee resignation requests across all branches."}
                        </p>
                    </div>
                </div>

                {/* ── Filter & Search Bar ───────────────────────────────────── */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-symbols-outlined text-slate-400">search</span>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by ID, Name, or EPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {showVerifiedList ? (
                            <span className="px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                                Verified Requests Only
                            </span>
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
                                        <option value="VERIFIED_BY_HR">Verified</option>
                                        <option value="PENDING_DIRECTOR">Pending Director</option>
                                        <option value="REJECTED">Rejected</option>
                                    </select>
                                </div>
                                {verifiedCount > 0 && (
                                    <button
                                        onClick={handleShowVerifiedList}
                                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">checklist</span>
                                        Prepare for Director Approval ({verifiedCount})
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── Stats Row ─────────────────────────────────────────────── */}
                {!showVerifiedList && (
                    <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(
                            [
                                { label: "Submitted", status: "SUBMITTED", icon: "send", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
                                { label: "Verified", status: "VERIFIED_BY_HR", icon: "verified", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                                { label: "Pending Director", status: "PENDING_DIRECTOR", icon: "pending_actions", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
                                { label: "Rejected", status: "REJECTED", icon: "cancel", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
                            ] as const
                        ).map(({ label, status, icon, color, bg }) => (
                            <div key={status} className={`rounded-xl p-4 ${bg} border border-slate-200 dark:border-slate-700 flex items-center gap-3`}>
                                <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
                                <div>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {requests.filter((r) => r.status === status).length}
                                    </p>
                                    <p className="text-xs text-slate-500">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Data Table ────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    <th className="py-4 px-6">Request ID</th>
                                    <th className="py-4 px-6">Employee</th>
                                    <th className="py-4 px-6">Branch</th>
                                    <th className="py-4 px-6">Reason</th>
                                    <th className="py-4 px-6">Effective Date</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredRequests.map((req) => {
                                    const st = statusConfig[req.status];
                                    return (
                                        <tr
                                            key={req.id}
                                            className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
                                        >
                                            <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                                                {req.id}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-slate-800 dark:text-white">{req.employeeName}</div>
                                                <div className="text-xs text-slate-500">{req.epfNumber} · {req.designation}</div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{req.branch}</td>
                                            <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{req.reason}</td>
                                            <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{formatDate(req.effectiveDate)}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${st.classes}`}>
                                                        {st.label}
                                                    </span>
                                                </div>
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
                                        <td colSpan={7} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-300 text-4xl">inbox</span>
                                                <p className="text-sm text-slate-400">
                                                    {showVerifiedList
                                                        ? "No verified resignation requests available to submit."
                                                        : "No requests found matching your filters."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Confirm and Submit Section (Verified List view) ────────── */}
                {showVerifiedList && filteredRequests.length > 0 && (
                    <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                    {filteredRequests.length} verified request(s) ready for Director approval
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    All verified resignation requests will be compiled and submitted for Board / Director approval.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowConfirmDialog(true)}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-[18px]">send</span>
                                Confirm &amp; Submit to Director
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Review / View Modal ─────────────────────────────────────── */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 h-screen max-h-screen">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-full">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {canVerify ? "Verify Resignation Request" : "View Resignation Request"}
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

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">

                            {/* Employee & Request Info */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Resignation Request Details</h4>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            Submitted by {selectedRequest.employeeName} ({selectedRequest.epfNumber}) · {selectedRequest.branch}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${statusConfig[selectedRequest.status].classes}`}>
                                        {statusConfig[selectedRequest.status].label}
                                    </span>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Dates & Reason */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <ReadOnlyField label="Resignation Initiation Date" value={formatDate(selectedRequest.initiationDate)} />
                                        <ReadOnlyField label="Resignation Effective Date" value={formatDate(selectedRequest.effectiveDate)} />
                                        <ReadOnlyField label="Designation" value={selectedRequest.designation} />
                                        <ReadOnlyField label="Reason for Resignation" value={selectedRequest.reason} />
                                    </div>

                                    {/* Obligation Details */}
                                    <ReadOnlyTextarea
                                        label="Direct and Indirect Obligation Details"
                                        value={selectedRequest.obligationDetails}
                                        rows={3}
                                    />

                                    {/* Leave Balance */}
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Leave Balance Details
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {selectedRequest.leaveBalances.map((leave) => (
                                                <div
                                                    key={leave.type}
                                                    className="rounded-xl border border-slate-200 p-4"
                                                    style={{ backgroundColor: leave.bg }}
                                                >
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                                                            style={{ backgroundColor: `${leave.color}20` }}
                                                        >
                                                            <span className="material-symbols-outlined text-sm" style={{ color: leave.color }}>
                                                                event_available
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-700">{leave.type}</p>
                                                    </div>
                                                    <div className="flex items-end justify-between">
                                                        <div>
                                                            <p className="text-xl font-bold" style={{ color: leave.color }}>{leave.remaining}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Remaining</p>
                                                        </div>
                                                        <p className="text-xs text-slate-500">
                                                            <span className="font-bold text-slate-600">{leave.used}</span> / {leave.total} used
                                                        </p>
                                                    </div>
                                                    <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${(leave.used / leave.total) * 100}%`,
                                                                backgroundColor: leave.color,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Special Remark */}
                                    {selectedRequest.specialRemark && (
                                        <ReadOnlyTextarea label="Special Remark" value={selectedRequest.specialRemark} rows={2} />
                                    )}

                                    {/* Documents */}
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Submitted Documents
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { key: "resignation_letter", label: "Resignation Letter", icon: "description", mandatory: true },
                                                { key: "clearance_letter", label: "Obligations Clearance Letter", icon: "fact_check", mandatory: true },
                                                { key: "handover_checklist", label: "Employee Handover Checklist", icon: "checklist", mandatory: false },
                                            ].map((slot) => {
                                                const uploaded = selectedRequest.documents.find((d) => d.key === slot.key);
                                                return (
                                                    <div
                                                        key={slot.key}
                                                        className={`rounded-xl border p-4 transition-all ${uploaded
                                                            ? "border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-900/10"
                                                            : slot.mandatory
                                                                ? "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-900/10"
                                                                : "border-dashed border-slate-200 bg-slate-50/30 dark:border-slate-600"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${uploaded ? "bg-green-100 dark:bg-green-900/30" : slot.mandatory ? "bg-red-100 dark:bg-red-900/30" : "bg-slate-100 dark:bg-slate-700"}`}>
                                                                <span className={`material-symbols-outlined text-base ${uploaded ? "text-green-600" : slot.mandatory ? "text-red-400" : "text-slate-400"}`}>
                                                                    {uploaded ? "check_circle" : slot.mandatory ? "error" : slot.icon}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{slot.label}</p>
                                                                    {slot.mandatory && (
                                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${uploaded ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                                                                            {uploaded ? "Uploaded" : "Missing"}
                                                                        </span>
                                                                    )}
                                                                    {!slot.mandatory && (
                                                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">Optional</span>
                                                                    )}
                                                                </div>
                                                                {uploaded ? (
                                                                    <div className="mt-1.5 flex items-center gap-1.5">
                                                                        <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                                                                        <p className="text-[11px] text-slate-500 truncate">{uploaded.filename}</p>
                                                                    </div>
                                                                ) : (
                                                                    <p className="mt-1 text-[11px] text-slate-400">Not uploaded</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* HR Remark (read-only; shown when already processed) */}
                                    {selectedRequest.hrRemark && (
                                        <ReadOnlyTextarea
                                            label="HR Remark"
                                            value={selectedRequest.hrRemark}
                                            rows={2}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
                            {selectedRequest.status === "SUBMITTED" && !showVerifiedList ? (
                                <>
                                    <button
                                        onClick={handleOpenRejectDialog}
                                        className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                                    >
                                        Reject Request
                                    </button>
                                    <div className="relative group">
                                        <button
                                            onClick={handleVerify}
                                            disabled={!canVerify}
                                            className={`px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${canVerify
                                                ? "bg-primary hover:bg-primary/90 text-white shadow-sm cursor-pointer"
                                                : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">verified</span>
                                            Verify &amp; Add to Director List
                                        </button>
                                        {!canVerify && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                Resolve all blockers before verifying
                                            </div>
                                        )}
                                    </div>
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

            {/* ── Confirm Submit to Director Dialog ──────────────────────── */}
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
                                You are about to compile{" "}
                                <span className="font-bold text-slate-800 dark:text-white">
                                    {verifiedCount} verified resignation request(s)
                                </span>{" "}
                                and submit them for Board / Director approval.
                            </p>
                            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-start gap-2">
                                    <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                                    Once submitted, the request statuses cannot be changed by HR.
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
                                onClick={handleConfirmSubmitToDirector}
                                className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">send</span>
                                Yes, Submit to Director
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Reject Reason Popup ─────────────────────────────────────── */}
            {showRejectDialog && selectedRequest && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-red-500 text-xl">cancel</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Reject Resignation Request</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{selectedRequest.id} · {selectedRequest.employeeName}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseRejectDialog}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Please provide a clear reason for rejecting this request. This will be visible to the employee.
                            </p>
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => {
                                        setRejectReason(e.target.value);
                                        if (e.target.value.trim()) setRejectReasonError(false);
                                    }}
                                    placeholder="e.g. Outstanding loan balance not cleared, missing mandatory documents..."
                                    rows={4}
                                    autoFocus
                                    className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 resize-none transition-colors ${rejectReasonError
                                        ? "border-red-400 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30"
                                        : "border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
                                        }`}
                                />
                                {rejectReasonError && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[13px]">error</span>
                                        Rejection reason is mandatory.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
                            <button
                                onClick={handleCloseRejectDialog}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg shadow-sm shadow-red-200 dark:shadow-red-900/20 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useCallback } from "react";
import { Check, X, Send, Printer } from "lucide-react";
import ResignationStats from "./ResignationStats";

// ── Types ────────────────────────────────────────────────────────────
type ResignStatus = "Pending Director" | "Board Approved" | "Board Rejected";

interface ResignationRequest {
    id: string;
    epfNumber: string;
    employee: string;
    initials: string;
    designation: string;
    branch: string;
    reason: string;
    initiationDate: string;
    effectiveDate: string;
    boardMeetingDate: string;
    status: ResignStatus;
    email: string;
    phone: string;
    hrRemark: string;
    directorRemark: string;
    // Post-approval flags (simulated)
    payrollClosed: boolean;
    accountDeactivated: boolean;
}

// ── Mock Data ────────────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];

const MOCK: ResignationRequest[] = [
    {
        id: "RES-2024-001",
        epfNumber: "12345",
        employee: "Kasun Perera",
        initials: "KP",
        designation: "Software Engineer",
        branch: "Colombo Branch",
        reason: "Career Growth",
        initiationDate: "2024-10-01",
        effectiveDate: "2024-11-01",
        boardMeetingDate: today,
        status: "Pending Director",
        email: "kasun@example.com",
        phone: "+94771234567",
        hrRemark: "All documents verified. Eligible for director approval.",
        directorRemark: "",
        payrollClosed: false,
        accountDeactivated: false,
    },
    {
        id: "RES-2024-003",
        epfNumber: "34567",
        employee: "Tharindu Jayawardena",
        initials: "TJ",
        designation: "Senior Accountant",
        branch: "Head Office",
        reason: "Better Opportunity",
        initiationDate: "2024-09-28",
        effectiveDate: "2024-10-31",
        boardMeetingDate: "2024-11-15",
        status: "Pending Director",
        email: "tharindu@example.com",
        phone: "+94779876543",
        hrRemark: "Handover complete. Release letter requested urgently.",
        directorRemark: "",
        payrollClosed: false,
        accountDeactivated: false,
    },
    {
        id: "RES-2024-004",
        epfNumber: "89012",
        employee: "Amaya Bandara",
        initials: "AB",
        designation: "HR Executive",
        branch: "Galle Branch",
        reason: "Relocation",
        initiationDate: "2024-09-15",
        effectiveDate: "2024-10-15",
        boardMeetingDate: "2025-01-20",
        status: "Board Approved",
        email: "amaya@example.com",
        phone: "+94772345678",
        hrRemark: "All cleared.",
        directorRemark: "Approved. Best wishes.",
        payrollClosed: true,
        accountDeactivated: true,
    },
];

// ── Status Badge Config ──────────────────────────────────────────────
const statusConfig: Record<ResignStatus, { label: string; classes: string }> = {
    "Pending Director": {
        label: "Pending Director",
        classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    "Board Approved": {
        label: "Board Approved",
        classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    "Board Rejected": {
        label: "Board Rejected",
        classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
};

// ── Helpers ──────────────────────────────────────────────────────────
const fmt = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};


// ── Main Component ───────────────────────────────────────────────────
export default function ResignationTable() {
    const [requests, setRequests] = useState<ResignationRequest[]>(MOCK);
    const [tabFilter, setTabFilter] = useState<"Today/Previous" | "Upcoming">("Today/Previous");

    // Reject popup
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState(false);

    // Letter preview
    const [letterPreviewReq, setLetterPreviewReq] = useState<ResignationRequest | null>(null);

    // Detail expand
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Toast
    const [toast, setToast] = useState<string | null>(null);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    }, []);

    // ── Stats derived from state ──────────────────────────────────────
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "Pending Director").length;
    const approved = requests.filter((r) => r.status === "Board Approved").length;
    const rejected = requests.filter((r) => r.status === "Board Rejected").length;

    // ── Filtered list ─────────────────────────────────────────────────
    const filteredRequests = requests.filter((req) => {
        const upcoming = req.boardMeetingDate > today;
        return tabFilter === "Upcoming" ? upcoming : !upcoming;
    });

    // ── Handlers ─────────────────────────────────────────────────────
    const handleApprove = (id: string) => {
        const req = requests.find((r) => r.id === id)!;
        setRequests((prev) =>
            prev.map((r) =>
                r.id === id
                    ? { ...r, status: "Board Approved", payrollClosed: true, accountDeactivated: true }
                    : r
            )
        );
        showToast(`✅ Approved — SMS & Email sent to ${req.employee} (${req.email}, ${req.phone})`);
    };

    const openRejectPopup = (id: string) => {
        setRejectId(id);
        setRejectReason("");
        setRejectError(false);
    };

    const handleConfirmReject = () => {
        if (!rejectReason.trim()) { setRejectError(true); return; }
        const req = requests.find((r) => r.id === rejectId)!;
        setRequests((prev) =>
            prev.map((r) =>
                r.id === rejectId
                    ? { ...r, status: "Board Rejected", directorRemark: rejectReason }
                    : r
            )
        );
        showToast(`❌ Rejected — SMS & Email notification sent to ${req.employee}`);
        setRejectId(null);
    };

    return (
        <div className="space-y-6">
            {/* Live Stats */}
            <ResignationStats total={total} pending={pending} approved={approved} rejected={rejected} />

            {/* Main Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="p-6 border-b border-gray-100 dark:border-zinc-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Board Resignation Reviews</h3>
                    <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                        {(["Today/Previous", "Upcoming"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setTabFilter(tab)}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${tabFilter === tab
                                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-700">
                            <tr>

                                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Employee</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Reason</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Effective Date</th>
                                <th className="px-6 py-4 font-semibold text-primary">Board Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/50">
                            {filteredRequests.map((req) => {
                                const st = statusConfig[req.status];
                                const isToday = req.boardMeetingDate === today;
                                const isExpanded = expandedId === req.id;
                                const isPending = req.status === "Pending Director";
                                const actionsDisabled = tabFilter === "Upcoming";

                                return (
                                    <React.Fragment key={req.id}>
                                        <tr
                                            className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                                            onClick={() => setExpandedId(isExpanded ? null : req.id)}
                                        >
                                            {/* Employee */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {req.initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{req.employee}</p>
                                                        <p className="text-xs text-gray-500">{req.id} · {req.designation}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Reason */}
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{req.reason}</td>
                                            {/* Effective Date */}
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{fmt(req.effectiveDate)}</td>
                                            {/* Board Date */}
                                            <td className="px-6 py-4 font-bold text-primary">
                                                {fmt(req.boardMeetingDate)}
                                                {isToday && (
                                                    <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full animate-pulse font-bold">TODAY</span>
                                                )}
                                            </td>
                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${st.classes}`}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                {isPending ? (
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            title="Approve"
                                                            onClick={() => handleApprove(req.id)}
                                                            disabled={actionsDisabled}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${actionsDisabled
                                                                ? "bg-gray-100 text-gray-300 cursor-not-allowed dark:bg-zinc-800"
                                                                : "bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer"
                                                                }`}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            title="Reject"
                                                            onClick={() => openRejectPopup(req.id)}
                                                            disabled={actionsDisabled}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${actionsDisabled
                                                                ? "bg-gray-100 text-gray-300 cursor-not-allowed dark:bg-zinc-800"
                                                                : "bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                                                                }`}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : req.status === "Board Approved" ? (
                                                    <button
                                                        title="Preview Resignation Letter"
                                                        onClick={() => setLetterPreviewReq(req)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer mx-auto"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                        Letter
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Decision Final</span>
                                                )}
                                            </td>
                                        </tr>

                                        {/* ── Expanded Detail Row ─────────────────────────────────── */}
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={7} className="bg-gray-50/80 dark:bg-zinc-800/40 px-8 py-5 border-b border-gray-100 dark:border-zinc-700">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                        {/* Employee Details */}
                                                        <div className="space-y-3">
                                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Employee Details</p>
                                                            <InfoRow label="EPF Number" value={req.epfNumber} />
                                                            <InfoRow label="Branch" value={req.branch} />
                                                            <InfoRow label="Initiation Date" value={fmt(req.initiationDate)} />
                                                            <InfoRow label="Email" value={req.email} />
                                                            <InfoRow label="Phone" value={req.phone} />
                                                        </div>
                                                        {/* Remarks */}
                                                        <div className="space-y-3">
                                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Remarks</p>
                                                            <InfoRow label="HR Remark" value={req.hrRemark || "—"} />
                                                            <InfoRow label="Director Remark" value={req.directorRemark || "—"} />
                                                        </div>
                                                        {/* Post-Approval Flags */}
                                                        <div className="space-y-3">
                                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Post-Approval Workflow</p>
                                                            <FlagRow label="Payroll Closure" active={req.payrollClosed} note={`Effective: ${fmt(req.effectiveDate)}`} />
                                                            <FlagRow label="Account Deactivation" active={req.accountDeactivated} note={`Scheduled: ${fmt(req.effectiveDate)}`} />

                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                        No resignation requests in this category.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Reject Popup ─────────────────────────────────────────────── */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-zinc-700">
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-700 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <X className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">Reject Resignation</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {requests.find((r) => r.id === rejectId)?.employee} · {rejectId}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Provide a mandatory reason. The employee will be notified via SMS & Email.
                            </p>
                            <textarea
                                value={rejectReason}
                                autoFocus
                                onChange={(e) => { setRejectReason(e.target.value); if (e.target.value.trim()) setRejectError(false); }}
                                rows={4}
                                placeholder="State the reason for rejection..."
                                className={`w-full rounded-xl border px-4 py-3 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 outline-none resize-none transition-colors focus:ring-2 ${rejectError
                                    ? "border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30"
                                    : "border-gray-200 dark:border-zinc-600 focus:ring-primary/20 focus:border-primary"
                                    }`}
                            />
                            {rejectError && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">error</span>
                                    Rejection reason is mandatory.
                                </p>
                            )}
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-700">
                            <button
                                onClick={() => setRejectId(null)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-800 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toast ───────────────────────────────────────────────────── */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 bg-gray-900 dark:bg-zinc-800 text-white px-6 py-3 rounded-xl shadow-2xl font-medium text-sm flex items-center gap-2 max-w-sm">
                    <Send className="w-4 h-4 text-primary flex-shrink-0" />
                    {toast}
                </div>
            )}

            {/* ── Letter Preview Modal ─────────────────────────────────────── */}
            {letterPreviewReq && (() => {
                const r = letterPreviewReq;
                const today2 = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
                return (
                    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:bg-transparent print:p-0 print:block print:overflow-visible">

                        {/* Print-only style: visibility approach works at any nesting depth */}
                        <style>{`
                            @media print {
                                body * { visibility: hidden !important; }
                                #resignation-letter-print,
                                #resignation-letter-print * { visibility: visible !important; }
                                #resignation-letter-print {
                                    position: fixed !important;
                                    top: 0 !important;
                                    left: 0 !important;
                                    width: 100% !important;
                                    height: auto !important;
                                    box-shadow: none !important;
                                    border: none !important;
                                    border-radius: 0 !important;
                                    margin: 0 !important;
                                    overflow: visible !important;
                                }
                            }
                        `}</style>

                        <div
                            id="resignation-letter-print"
                            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 my-6 overflow-hidden print:shadow-none print:border-none print:rounded-none print:max-w-full print:my-0"
                        >
                            {/* Modal toolbar — hidden when printing */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 print:hidden">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Printer className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Resignation Acceptance Letter</p>
                                        <p className="text-xs text-gray-500">{r.id} · {r.employee}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                    <button
                                        onClick={() => setLetterPreviewReq(null)}
                                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Letter Body — A4-style traditional format */}
                            <div className="px-14 py-10 text-[13px] text-gray-800 leading-7 space-y-4 font-[Georgia,serif]">

                                {/* Letterhead */}
                                <div className="text-center pb-5 border-b border-gray-300 mb-6">
                                    <p className="text-xl font-bold tracking-wide text-gray-900">NEXORA HRMS</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Human Resources Management System</p>
                                </div>

                                {/* Date + Ref (right-aligned) */}
                                <div className="text-right text-[12px] text-gray-600 space-y-0.5">
                                    <p>{today2}</p>
                                    <p>Ref: <span className="font-semibold">{r.id}</span></p>
                                </div>

                                {/* Recipient address block */}
                                <div className="space-y-0.5 mt-2">
                                    <p className="font-semibold">{r.employee}</p>
                                    <p className="text-gray-600">{r.designation}</p>
                                    <p className="text-gray-600">{r.branch}</p>
                                    <p className="text-gray-600">EPF No: {r.epfNumber}</p>
                                </div>

                                {/* Subject line */}
                                <p className="mt-4 font-bold underline underline-offset-2">
                                    Re: Acceptance of Resignation
                                </p>

                                {/* Salutation */}
                                <p>Dear {r.employee.split(" ")[0]},</p>

                                {/* Body */}
                                <p>
                                    We write with reference to your resignation letter dated{" "}
                                    <span className="font-semibold">{fmt(r.initiationDate)}</span>. After due consideration
                                    by the Board of Directors, we hereby formally accept your resignation from the position
                                    of <span className="font-semibold">{r.designation}</span>, {r.branch}.
                                </p>
                                <p>
                                    Your reason for resignation has been noted as: <span className="font-semibold">{r.reason}</span>.
                                </p>
                                <p>
                                    Your last day of service is confirmed as{" "}
                                    <span className="font-semibold">{fmt(r.effectiveDate)}</span>. We kindly request
                                    that you ensure a proper handover of all responsibilities, assets, and documentation
                                    before your departure.
                                </p>
                                <p>
                                    Please be advised that your payroll will be finalised and closed as of the above
                                    effective date. Your employee account and system access privileges will accordingly
                                    be deactivated on the same date.
                                </p>

                                {/* Director remark — only shown if present */}
                                {r.directorRemark && (
                                    <p>
                                        <span className="font-semibold">Note from the Director: </span>
                                        {r.directorRemark}
                                    </p>
                                )}

                                <p>
                                    We take this opportunity to sincerely thank you for your valuable contributions
                                    to the organisation during your tenure. We extend our best wishes to you for
                                    your future endeavours.
                                </p>

                                {/* Closing */}
                                <p>Yours faithfully,</p>

                                {/* Signature */}
                                <div className="pt-10">
                                    <div className="w-36 border-t border-gray-500 mb-2" />
                                    <p className="font-semibold">Director — Human Resources</p>
                                    <p className="text-gray-500 text-[12px]">Nexora HRMS</p>
                                </div>
                            </div>

                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

// ── Small helper components ──────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{value}</p>
        </div>
    );
}

function FlagRow({ label, active, note }: { label: string; active: boolean; note: string }) {
    return (
        <div className="flex items-start gap-2">
            <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${active ? "bg-emerald-500" : "bg-gray-200 dark:bg-zinc-600"}`}>
                {active && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</p>
                <p className="text-[10px] text-gray-400">{note}</p>
            </div>
        </div>
    );
}

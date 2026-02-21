"use client";

import React, { useState } from "react";
import Link from "next/link";

// Mock Data for pending requests
const MOCK_REQUESTS = [
    {
        id: "MAT-001",
        epfNumber: "EMP-092",
        employeeName: "Sarah Jenkins",
        employeeType: "Permanent",
        designation: "Product Manager",
        branch: "Head Office",
        leaveReason: "First Child Maternity Leave",
        startDate: "2024-06-01",
        endDate: "2024-09-08",
        noOfDays: 100,
        childNumber: "1",
        contactNumber: "+94 77 987 6543",
        email: "sarah.j@example.com",
        specialRemark: "Doctor recommended starting leave 1 week early.",
        status: "Submitted for Maternity Leaves Verification",
        requestDate: "2024-05-15",
        documents: {
            requestLetter: "sarah_maternity_request.pdf",
            medicalCertificate: "dr_smith_medical_cert.pdf",
            supportingDoc: "ultrasound_confirmation.pdf"
        },
        hrRemark: ""
    }
];

export default function MaternityApprovalsPage() {
    const [requests, setRequests] = useState(MOCK_REQUESTS);
    const [selectedRequest, setSelectedRequest] = useState<typeof MOCK_REQUESTS[0] | null>(null);
    const [hrRemarkInput, setHrRemarkInput] = useState("");

    const handleView = (req: typeof MOCK_REQUESTS[0]) => {
        setSelectedRequest(req);
        setHrRemarkInput(req.hrRemark || "");
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
        setHrRemarkInput("");
    };

    const handleVerifySubmit = (status: "Submitted for HR Approvals" | "Rejected") => {
        if (!selectedRequest) return;

        setRequests(prev => prev.map(req =>
            req.id === selectedRequest.id
                ? { ...req, status, hrRemark: hrRemarkInput }
                : req
        ));

        handleCloseModal();
    };

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
                            Review, verify documents, and approve maternity leave requests from employees.
                        </p>
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
                                {requests.map((req) => (
                                    <tr key={req.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                        <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{req.id}</td>
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-slate-800 dark:text-white">{req.employeeName}</div>
                                            <div className="text-xs text-slate-500">{req.epfNumber} • {req.designation}</div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                                            {req.startDate} to {req.endDate} <br />
                                            <span className="text-xs text-slate-400">({req.noOfDays} Days)</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${req.status === "Submitted for Maternity Leaves Verification"
                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                : req.status === "Submitted for HR Approvals"
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}>
                                                {req.status}
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
                                {requests.length === 0 && (
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

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verify Maternity Leave Request</h3>
                                <p className="text-sm text-slate-500 mt-1">Request ID: {selectedRequest.id}</p>
                            </div>
                            <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto space-y-8 flex-1">

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Employee Info</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.employeeName}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">EPF No:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.epfNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Type:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.employeeType}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Branch:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.branch}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Designation:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.designation}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Contact:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.contactNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.email}</span></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Leave Details</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Status:</span> <span className="font-bold text-primary">{selectedRequest.status}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Dates:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.startDate} to {selectedRequest.endDate}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Total Days:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.noOfDays}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Child Number:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.childNumber}</span></div>
                                        <div className="mt-2"><span className="text-slate-500 block mb-1">Reason:</span> <p className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded text-slate-700 dark:text-slate-300">{selectedRequest.leaveReason}</p></div>
                                        {selectedRequest.specialRemark && (
                                            <div className="mt-2"><span className="text-slate-500 block mb-1">Special Remarks:</span> <p className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-2 rounded">{selectedRequest.specialRemark}</p></div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Uploaded Documents</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(selectedRequest.documents).map(([key, filename]) => (
                                        filename ? (
                                            <div key={key} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 group hover:border-primary transition-colors cursor-pointer">
                                                <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-[18px]">description</span>
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize truncate">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                                    <div className="text-[10px] text-slate-500 truncate">{filename}</div>
                                                </div>
                                            </div>
                                        ) : null
                                    ))}

                                    {/* Adhoc Upload */}
                                    <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-[18px]">upload</span>
                                        <span className="text-xs font-semibold">Upload Override Doc</span>
                                        <input type="file" className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* HR Remarks */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">HR Remarks</h4>
                                <textarea
                                    value={hrRemarkInput}
                                    onChange={(e) => setHrRemarkInput(e.target.value)}
                                    placeholder="Add any verification notes or rejection reasons here..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    rows={3}
                                />
                            </div>

                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
                            {selectedRequest.status === "Submitted for Maternity Leaves Verification" ? (
                                <>
                                    <button
                                        onClick={() => handleVerifySubmit("Rejected")}
                                        className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-sm transition-colors"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => handleVerifySubmit("Submitted for HR Approvals")}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">verified</span>
                                        Verify &amp; Submit for HR Approval
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-bold text-sm transition-colors"
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

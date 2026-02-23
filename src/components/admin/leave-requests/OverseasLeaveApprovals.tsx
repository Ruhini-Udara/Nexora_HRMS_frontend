"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

// Mock Data for pending requests (Admin view)
const MOCK_REQUESTS = [
    {
        id: "REQ-001",
        epfNumber: "12345",
        employeeName: "John Doe",
        designation: "Software Engineer",
        branch: "Head Office",
        leaveReason: "Family Vacation to Europe",
        startDate: "2024-05-10",
        endDate: "2024-05-25",
        noOfDays: 16,
        passportNumber: "N12345678",
        passportExpDate: "2028-10-15",
        contactNumber: "+94 77 123 4567",
        email: "john.doe@example.com",
        specialRemark: "All flights booked.",
        status: "Sent for Admin Approval",
        requestDate: "2024-04-01",
        documents: {
            passportCopy: "passport_johndoe.pdf",
            visaCopy: "schengen_visa.pdf",
            confirmationLetter: "hr_confirmation.pdf",
            leaveLetter: "leave_request.pdf"
        },
        adminRemark: ""
    },
    {
        id: "REQ-002",
        epfNumber: "87654",
        employeeName: "Kasun Perera",
        designation: "Marketing Manager",
        branch: "Colombo Branch",
        leaveReason: "Attending International Marketing Conference in Dubai",
        startDate: "2024-06-15",
        endDate: "2024-06-20",
        noOfDays: 6,
        passportNumber: "N98765432",
        passportExpDate: "2029-05-20",
        contactNumber: "+94 71 987 6543",
        email: "kasun.p@example.com",
        specialRemark: "Conference registration confirmed. Company sponsored trip.",
        status: "Sent for Admin Approval",
        requestDate: "2024-05-02",
        documents: {
            passportCopy: "passport_kasun.pdf",
            visaCopy: "dubai_visa.pdf",
            confirmationLetter: "conference_invite.pdf",
            leaveLetter: "leave_req_kasun.pdf"
        },
        adminRemark: ""
    },
    {
        id: "REQ-003",
        epfNumber: "34567",
        employeeName: "Amaya Fernando",
        designation: "Product Owner",
        branch: "Head Office",
        leaveReason: "Personal travel and higher studies program in UK",
        startDate: "2024-07-01",
        endDate: "2024-08-31",
        noOfDays: 62,
        passportNumber: "N34567890",
        passportExpDate: "2030-01-10",
        contactNumber: "+94 77 345 6789",
        email: "amaya.f@example.com",
        specialRemark: "University acceptance letter attached.",
        status: "Submitted for Committee / Board Approvals",
        requestDate: "2024-05-15",
        documents: {
            passportCopy: "passport_amaya.pdf",
            visaCopy: "uk_student_visa.pdf",
            confirmationLetter: "uni_acceptance.pdf",
            leaveLetter: "leave_req_amaya.pdf"
        },
        adminRemark: "Verified by HR. Passed for Board approval due to length."
    },
    {
        id: "REQ-004",
        epfNumber: "56789",
        employeeName: "Nimal Silva",
        designation: "Finance Director",
        branch: "Head Office",
        leaveReason: "Medical treatment in Singapore",
        startDate: "2024-08-10",
        endDate: "2024-08-25",
        noOfDays: 16,
        passportNumber: "N56789012",
        passportExpDate: "2027-11-22",
        contactNumber: "+94 71 567 8901",
        email: "nimal.s@example.com",
        specialRemark: "Urgent medical requirement.",
        status: "Submitted for Committee / Board Approvals",
        requestDate: "2024-06-01",
        documents: {
            passportCopy: "passport_nimal.pdf",
            visaCopy: "sg_visa.pdf",
            confirmationLetter: "hospital_appt.pdf",
            leaveLetter: "leave_req_nimal.pdf"
        },
        adminRemark: "Critical request. Added to urgent board agenda."
    },
    {
        id: "REQ-005",
        epfNumber: "11223",
        employeeName: "Priyanka Silva",
        designation: "QA Engineer",
        branch: "Kandy Branch",
        leaveReason: "Leisure trip to Malaysia",
        startDate: "2024-09-05",
        endDate: "2024-09-15",
        noOfDays: 11,
        passportNumber: "N11223344",
        passportExpDate: "2026-04-12",
        contactNumber: "+94 70 112 2334",
        email: "priyanka.s@example.com",
        specialRemark: "",
        status: "Sent for Admin Approval",
        requestDate: "2024-06-15",
        documents: {
            passportCopy: "passport_priyanka.pdf",
            visaCopy: "my_visa.pdf",
            confirmationLetter: "",
            leaveLetter: "leave_req_priyanka.pdf"
        },
        adminRemark: ""
    }
];

export default function OverseasLeaveApprovals() {
    const [requests, setRequests] = useState(MOCK_REQUESTS);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Selection state for Bulk and Print
    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);

    // Modal State
    const [selectedRequest, setSelectedRequest] = useState<typeof MOCK_REQUESTS[0] | null>(null);
    const [adminRemark, setAdminRemark] = useState("");

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || req.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [requests, searchTerm, statusFilter]);

    // Derived states for Action Bar
    const selectedPending = requests.filter(r => selectedRequests.includes(r.id) && r.status === "Sent for Admin Approval");
    const selectedForBoard = requests.filter(r => selectedRequests.includes(r.id) && r.status === "Submitted for Committee / Board Approvals");

    const handleToggleSelection = (id: string) => {
        setSelectedRequests(prev =>
            prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
        );
    };

    const handleToggleAll = () => {
        if (selectedRequests.length === filteredRequests.length) {
            setSelectedRequests([]);
        } else {
            setSelectedRequests(filteredRequests.map(r => r.id));
        }
    };

    const handleView = (req: typeof MOCK_REQUESTS[0]) => {
        setSelectedRequest(req);
        setAdminRemark(req.adminRemark || "");
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
        setAdminRemark("");
    };

    // Single Actions
    const handleApprove = () => {
        if (!selectedRequest) return;
        setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: "Submitted for Committee / Board Approvals", adminRemark } : r));
        handleCloseModal();
    };

    const handleReject = () => {
        if (!selectedRequest) return;
        setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: "Rejected", adminRemark } : r));
        handleCloseModal();
    };

    // Bulk Actions
    const handleBulkConfirm = () => {
        setRequests(prev => prev.map(r => selectedPending.find(sp => sp.id === r.id) ? { ...r, status: "Submitted for Committee / Board Approvals" } : r));
        setSelectedRequests([]);
    };

    const handleBulkReject = () => {
        setRequests(prev => prev.map(r => selectedPending.find(sp => sp.id === r.id) ? { ...r, status: "Rejected" } : r));
        setSelectedRequests([]);
    };

    const handlePrintBoardList = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
            setSelectedRequests([]);
        }, 300);
    };

    if (isPrinting) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white text-black p-10 overflow-auto print:block">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold uppercase underline mb-2">Notice of Board Meeting</h1>
                    <h2 className="text-xl">Overseas Leave Requests for Committee Approval</h2>
                    <p className="mt-2 text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
                </div>

                <table className="w-full border-collapse border border-gray-800 text-sm">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-800">
                            <th className="border border-gray-800 p-3 text-left">Request ID</th>
                            <th className="border border-gray-800 p-3 text-left">Employee Name</th>
                            <th className="border border-gray-800 p-3 text-left">Designation</th>
                            <th className="border border-gray-800 p-3 text-left">Leave Reason</th>
                            <th className="border border-gray-800 p-3 text-center">Dates</th>
                            <th className="border border-gray-800 p-3 text-center">Total Days</th>
                            <th className="border border-gray-800 p-3 text-left">Admin Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedForBoard.map(req => (
                            <tr key={req.id}>
                                <td className="border border-gray-800 p-3 font-semibold">{req.id}</td>
                                <td className="border border-gray-800 p-3">{req.employeeName} ({req.epfNumber})</td>
                                <td className="border border-gray-800 p-3">{req.designation}</td>
                                <td className="border border-gray-800 p-3">{req.leaveReason}</td>
                                <td className="border border-gray-800 p-3 text-center">{req.startDate} to {req.endDate}</td>
                                <td className="border border-gray-800 p-3 text-center font-bold">{req.noOfDays}</td>
                                <td className="border border-gray-800 p-3 text-gray-600 italic">{req.adminRemark || "None"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-20 flex justify-between px-10">
                    <div className="text-center">
                        <div className="border-t border-black w-48 mb-2"></div>
                        <p className="font-semibold">Prepared By (HR/Admin)</p>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black w-48 mb-2"></div>
                        <p className="font-semibold">Board / Committee Approval</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto w-full pt-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pt-2">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/leave-requests"
                        className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            Overseas Leave Approvals
                        </h1>
                        <p className="text-gray-500 text-base">
                            Review and manage overseas leave requests pending admin and board approval.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative md:col-span-2">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search by employee name or request ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Sent for Admin Approval">Sent for Admin Approval</option>
                            <option value="Submitted for Committee / Board Approvals">Submitted for Committee / Board Approvals</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedRequests.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{selectedRequests.length}</span>
                        <span className="text-primary font-semibold text-sm">Requests Selected</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {selectedPending.length > 0 && selectedForBoard.length === 0 && (
                            <>
                                <button onClick={handleBulkReject} className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                                    Reject Selected
                                </button>
                                <button onClick={handleBulkConfirm} className="px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">fact_check</span> Confirm Selected
                                </button>
                            </>
                        )}

                        {selectedForBoard.length > 0 && selectedPending.length === 0 && (
                            <button onClick={handlePrintBoardList} className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">print</span> Print Board List
                            </button>
                        )}

                        {selectedForBoard.length > 0 && selectedPending.length > 0 && (
                            <span className="text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                                Please select requests of the same status to perform bulk actions.
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                <th className="py-4 px-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded text-primary focus:ring-primary/50 cursor-pointer"
                                        checked={filteredRequests.length > 0 && selectedRequests.length === filteredRequests.length}
                                        onChange={handleToggleAll}
                                    />
                                </th>
                                <th className="py-4 px-6">ID</th>
                                <th className="py-4 px-6">Employee</th>
                                <th className="py-4 px-6">Date Range</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${selectedRequests.includes(req.id) ? "bg-primary/5 dark:bg-primary/10" : ""}`}>
                                    <td className="py-4 px-4 text-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded text-primary focus:ring-primary/50 cursor-pointer"
                                            checked={selectedRequests.includes(req.id)}
                                            onChange={() => handleToggleSelection(req.id)}
                                        />
                                    </td>
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
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold text-center leading-tight ${req.status === "Sent for Admin Approval"
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            : req.status === "Submitted for Committee / Board Approvals"
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                : req.status === "Approved" // Kept for backwards compatibility if needed
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
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500">No requests found matching your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 h-screen max-h-screen">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-full">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Overseas Leave Request</h3>
                                <p className="text-sm text-slate-500 mt-1">Request ID: {selectedRequest.id}</p>
                            </div>
                            <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Employee Info</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.employeeName}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">EPF No:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRequest.epfNumber}</span></div>
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
                                        <div className="mt-2"><span className="text-slate-500 block mb-1">Reason:</span> <p className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded text-slate-700 dark:text-slate-300">{selectedRequest.leaveReason}</p></div>
                                        {selectedRequest.specialRemark && (
                                            <div className="mt-2"><span className="text-slate-500 block mb-1">Special Remarks:</span> <p className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-2 rounded">{selectedRequest.specialRemark}</p></div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Uploaded Documents</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                    {/* Adhoc Upload Facility */}
                                    <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-[18px]">upload</span>
                                        <span className="text-xs font-semibold">Upload Additional Doc</span>
                                        <input type="file" className="hidden" />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Administrator Remarks</h4>
                                <textarea
                                    value={adminRemark}
                                    onChange={(e) => setAdminRemark(e.target.value)}
                                    placeholder="Add any final approval notes or conditions here..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24 text-slate-700 dark:text-slate-300"
                                    disabled={selectedRequest.status !== "Sent for Admin Approval"}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                            <button onClick={handleCloseModal} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm">
                                Close
                            </button>
                            {selectedRequest.status === "Sent for Admin Approval" && (
                                <>
                                    <button onClick={handleReject} className="px-5 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors text-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">cancel</span> Disable / Reject
                                    </button>
                                    <button onClick={handleApprove} className="px-5 py-2.5 bg-primary text-white font-bold hover:bg-primary-dark rounded-lg transition-colors shadow-sm shadow-primary/20 text-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">fact_check</span> Confirm Request
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

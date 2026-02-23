"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

// Mock Data for pending requests (Admin view)
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
        status: "Branch Level Reviewed",
        requestDate: "2024-05-15",
        documents: {
            requestLetter: "sarah_maternity_request.pdf",
            medicalCertificate: "dr_smith_medical_cert.pdf",
            supportingDoc: "ultrasound_confirmation.pdf"
        },
        adminRemark: ""
    },
    {
        id: "MAT-002",
        epfNumber: "EMP-105",
        employeeName: "Nisha Perera",
        employeeType: "Contract",
        designation: "Software Engineer",
        branch: "Colombo Branch",
        leaveReason: "Second Child Maternity Leave",
        startDate: "2024-07-15",
        endDate: "2024-10-22",
        noOfDays: 100,
        childNumber: "2",
        contactNumber: "+94 71 123 4567",
        email: "nisha.p@example.com",
        specialRemark: "Standard leave planned.",
        status: "Branch Level Reviewed",
        requestDate: "2024-06-02",
        documents: {
            requestLetter: "nisha_maternity_request.pdf",
            medicalCertificate: "medical_cert_nisha.pdf",
            supportingDoc: ""
        },
        adminRemark: ""
    },
    {
        id: "MAT-003",
        epfNumber: "EMP-042",
        employeeName: "Ayesha Fernando",
        employeeType: "Permanent",
        designation: "QA Lead",
        branch: "Kandy Branch",
        leaveReason: "First Child Maternity Leave",
        startDate: "2024-05-10",
        endDate: "2024-08-18",
        noOfDays: 100,
        childNumber: "1",
        contactNumber: "+94 70 987 1234",
        email: "ayesha.f@example.com",
        specialRemark: "",
        status: "Submitted for Salary Calculation",
        requestDate: "2024-04-10",
        documents: {
            requestLetter: "ayesha_maternity.pdf",
            medicalCertificate: "medical_ayesha.pdf",
            supportingDoc: "clinic_book.pdf"
        },
        adminRemark: "Verified doc authenticity. Submitted for salary process."
    },
    {
        id: "MAT-004",
        epfNumber: "EMP-234",
        employeeName: "Dilini Ratnayake",
        employeeType: "Permanent",
        designation: "HR Executive",
        branch: "Head Office",
        leaveReason: "First Child Maternity Leave",
        startDate: "2024-08-01",
        endDate: "2024-11-08",
        noOfDays: 100,
        childNumber: "1",
        contactNumber: "+94 77 234 5678",
        email: "dilini.r@example.com",
        specialRemark: "",
        status: "Branch Level Reviewed",
        requestDate: "2024-07-05",
        documents: {
            requestLetter: "dilini_req.pdf",
            medicalCertificate: "dilini_med.pdf",
            supportingDoc: ""
        },
        adminRemark: ""
    },
    {
        id: "MAT-005",
        epfNumber: "EMP-888",
        employeeName: "Chamari Atapattu",
        employeeType: "Permanent",
        designation: "Senior Accountant",
        branch: "Galle Branch",
        leaveReason: "Third Child Maternity Leave",
        startDate: "2024-09-10",
        endDate: "2024-12-18",
        noOfDays: 100,
        childNumber: "3",
        contactNumber: "+94 71 888 9999",
        email: "chamari.a@example.com",
        specialRemark: "Requires special board approval for 3rd child.",
        status: "Branch Level Reviewed",
        requestDate: "2024-08-12",
        documents: {
            requestLetter: "chamari_leave.pdf",
            medicalCertificate: "chamari_doctor.pdf",
            supportingDoc: "board_approval.pdf"
        },
        adminRemark: ""
    },
    {
        id: "MAT-006",
        epfNumber: "EMP-456",
        employeeName: "Samanthi Silva",
        employeeType: "Contract",
        designation: "Customer Support Agent",
        branch: "Colombo Branch",
        leaveReason: "First Child Maternity Leave",
        startDate: "2024-10-01",
        endDate: "2025-01-08",
        noOfDays: 100,
        childNumber: "1",
        contactNumber: "+94 70 456 1234",
        email: "samanthi.s@example.com",
        specialRemark: "Contract ends during leave period, need HR consultation.",
        status: "Branch Level Reviewed",
        requestDate: "2024-09-01",
        documents: {
            requestLetter: "samanthi_maternity.pdf",
            medicalCertificate: "samanthi_medical.pdf",
            supportingDoc: "contract_copy.pdf"
        },
        adminRemark: ""
    }
];

export default function MaternityLeaveApprovals() {
    const [requests, setRequests] = useState(MOCK_REQUESTS);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Selection state for Bulk actions
    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

    // Notification state for demo
    const [showNotification, setShowNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Modal States
    const [selectedRequest, setSelectedRequest] = useState<typeof MOCK_REQUESTS[0] | null>(null);
    const [adminRemark, setAdminRemark] = useState("");

    // Reject Reason Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectingBulk, setRejectingBulk] = useState(false);

    // Share Options
    const [shareViaEmail, setShareViaEmail] = useState(true);
    const [shareViaSMS, setShareViaSMS] = useState(false);

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || req.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [requests, searchTerm, statusFilter]);

    // Derived states for Action Bar
    const selectedPending = requests.filter(r => selectedRequests.includes(r.id) && r.status === "Branch Level Reviewed");
    const otherSelected = requests.filter(r => selectedRequests.includes(r.id) && r.status !== "Branch Level Reviewed");

    const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setShowNotification({ message, type });
        setTimeout(() => setShowNotification(null), 4000);
    };

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
        setShareViaEmail(true);
        setShareViaSMS(false);
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
        setAdminRemark("");
        setShowRejectModal(false);
        setRejectReason("");
    };

    // Single Actions
    const handleApprove = () => {
        if (!selectedRequest) return;
        setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: "Submitted for Salary Calculation", adminRemark } : r));

        let notifyMsg = `Request ${selectedRequest.id} submitted for salary calculation.`;
        if (shareViaEmail || shareViaSMS) {
            notifyMsg += ` Notified employee via ${[shareViaEmail ? 'Email' : '', shareViaSMS ? 'SMS' : ''].filter(Boolean).join(' & ')}.`;
        }
        triggerNotification(notifyMsg, 'success');
        handleCloseModal();
    };

    const handleRejectSubmit = () => {
        if (!rejectReason.trim()) {
            triggerNotification("Reject reason is mandatory.", "error");
            return;
        }

        if (rejectingBulk) {
            setRequests(prev => prev.map(r => selectedPending.find(sp => sp.id === r.id) ? { ...r, status: "Rejected", adminRemark: rejectReason } : r));
            let notifyMsg = `Bulk rejected ${selectedPending.length} requests.`;
            if (shareViaEmail || shareViaSMS) {
                notifyMsg += ` Notifications sent via ${[shareViaEmail ? 'Email' : '', shareViaSMS ? 'SMS' : ''].filter(Boolean).join(' & ')}.`;
            }
            triggerNotification(notifyMsg, 'success');
            setSelectedRequests([]);
        } else if (selectedRequest) {
            setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: "Rejected", adminRemark: rejectReason } : r));
            let notifyMsg = `Request ${selectedRequest.id} rejected.`;
            if (shareViaEmail || shareViaSMS) {
                notifyMsg += ` Notified employee via ${[shareViaEmail ? 'Email' : '', shareViaSMS ? 'SMS' : ''].filter(Boolean).join(' & ')}.`;
            }
            triggerNotification(notifyMsg, 'success');
        }

        handleCloseModal();
    };

    // Bulk Actions
    const handleBulkSubmitForSalary = () => {
        setRequests(prev => prev.map(r => selectedPending.find(sp => sp.id === r.id) ? { ...r, status: "Submitted for Salary Calculation" } : r));
        triggerNotification(`${selectedPending.length} requests submitted for Salary Calculation. Automatic notifications sent.`, 'success');
        setSelectedRequests([]);
    };

    const openBulkReject = () => {
        setRejectingBulk(true);
        setRejectReason("");
        setShareViaEmail(true);
        setShareViaSMS(false);
        setShowRejectModal(true);
    };

    const openSingleReject = () => {
        setRejectingBulk(false);
        setRejectReason(adminRemark);
        setShowRejectModal(true);
    };

    return (
        <div className="max-w-7xl mx-auto w-full pt-20 relative">

            {/* Toast Notification */}
            {showNotification && (
                <div className={`fixed top-24 right-6 z-[100] px-6 py-3 rounded-lg shadow-lg border animate-in fade-in slide-in-from-top-4 flex items-center gap-3 ${showNotification.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                    }`}>
                    <span className="material-symbols-outlined text-[20px]">
                        {showNotification.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="font-medium text-sm">{showNotification.message}</span>
                </div>
            )}

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
                            Maternity Leave Approvals
                        </h1>
                        <p className="text-gray-500 text-base">
                            Review Branch Level approved Maternity leaves and submit them for Salary Calculation.
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
                            <option value="Branch Level Reviewed">Branch Level Reviewed</option>
                            <option value="Submitted for Salary Calculation">Submitted for Salary Calculation</option>
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
                        {selectedPending.length > 0 && otherSelected.length === 0 && (
                            <>
                                <button onClick={openBulkReject} className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">cancel</span> Reject Selected
                                </button>
                                <button onClick={handleBulkSubmitForSalary} className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span> Submit for Salary Calc
                                </button>
                            </>
                        )}

                        {otherSelected.length > 0 && (
                            <span className="text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                                Please select only &quot;Branch Level Reviewed&quot; requests to perform bulk actions.
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
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${req.status === "Branch Level Reviewed"
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            : req.status === "Submitted for Salary Calculation"
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
            {selectedRequest && !showRejectModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 h-screen max-h-screen">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-full">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Maternity Leave Request</h3>
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
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Administrator Remarks</h4>
                                <textarea
                                    value={adminRemark}
                                    onChange={(e) => setAdminRemark(e.target.value)}
                                    placeholder="Add any final instructions for payroll/salary here..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24 text-slate-700 dark:text-slate-300"
                                    disabled={selectedRequest.status !== "Branch Level Reviewed"}
                                />
                            </div>

                            {selectedRequest.status === "Branch Level Reviewed" && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Notification Options</h4>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={shareViaEmail} onChange={(e) => setShareViaEmail(e.target.checked)} className="w-4 h-4 rounded text-primary focus:ring-primary/50" />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">Share status via Email</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={shareViaSMS} onChange={(e) => setShareViaSMS(e.target.checked)} className="w-4 h-4 rounded text-primary focus:ring-primary/50" />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">Share status via SMS</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                            <button onClick={handleCloseModal} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm">
                                Close
                            </button>
                            {selectedRequest.status === "Branch Level Reviewed" && (
                                <>
                                    <button onClick={openSingleReject} className="px-5 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors text-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">cancel</span> Reject Request
                                    </button>
                                    <button onClick={handleApprove} className="px-5 py-2.5 bg-emerald-500 text-white font-bold hover:bg-emerald-600 rounded-lg transition-colors shadow-sm shadow-emerald-500/20 text-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span> Submit for Salary Calc
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 font-sans">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <span className="material-symbols-outlined text-3xl">warning</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reject Leave Request{rejectingBulk ? 's' : ''}</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                            You are about to reject {rejectingBulk ? `${selectedPending.length} requests` : `request ${selectedRequest?.id}`}.
                            A reason is strictly mandatory.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="State the reason clearly for the employee..."
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all resize-none h-32"
                            />
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Notification</h4>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={shareViaEmail} onChange={(e) => setShareViaEmail(e.target.checked)} className="w-4 h-4 rounded text-red-600 focus:ring-red-500/50" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Email Employee</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={shareViaSMS} onChange={(e) => setShareViaSMS(e.target.checked)} className="w-4 h-4 rounded text-red-600 focus:ring-red-500/50" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">SMS Employee</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={() => setShowRejectModal(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm">
                                Cancel
                            </button>
                            <button onClick={handleRejectSubmit} className="px-5 py-2.5 bg-red-600 text-white font-bold hover:bg-red-700 rounded-lg transition-colors shadow-sm shadow-red-500/20 text-sm">
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

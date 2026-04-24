"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

type TrainingRequest = {
    id: number;
    eventId: number;
    employeeId: number;
    employeeName: string;
    trainingTitle: string;
    trainingCategory: string;
    trainingDate: string;
    trainingTime: string;
    status: "Approved" | "Pending" | "Rejected";
    rejectionReason?: string;
    attendanceConfirmed: boolean;
};

// Removed mock data

interface TrainingStatusTableProps {
    onFeedbackClick: (request: TrainingRequest) => void;
}

const TrainingStatusTable: React.FC<TrainingStatusTableProps> = ({ onFeedbackClick }) => {
    const [requests, setRequests] = useState<TrainingRequest[]>([]);
    const [isConfirmingAttendance, setIsConfirmingAttendance] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedRejection, setSelectedRejection] = useState<string | null>(null);

    useEffect(() => {
        // Fetching for employee 1 for now
        axiosInstance.get('/training/employees/1/requests')
            .then(res => setRequests(res.data))
            .catch(err => console.error("Failed to fetch requests", err));
    }, []);

    const handleConfirmAttendance = (requestId: number) => {
        // We'll simulate this by updating state for now or calling an endpoint if it exists
        // Assuming we update the status locally for demo
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, attendanceConfirmed: true } : r));
        setIsConfirmingAttendance(false);
        setSelectedRequest(null);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 lg:p-8">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-500 dark:text-slate-400">
                            <th className="pb-3 px-4 font-medium uppercase tracking-tight text-xs">Training Name</th>
                            <th className="pb-3 px-4 font-medium uppercase tracking-tight text-xs">Status</th>
                            <th className="pb-3 px-4 font-medium uppercase tracking-tight text-xs">Date & Time</th>
                            <th className="pb-3 px-4 font-medium uppercase tracking-tight text-xs text-center">Actions</th>
                            <th className="pb-3 px-4 font-medium uppercase tracking-tight text-xs text-center">Feedback</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                    {requests.map((request, idx) => (
                        <tr
                            key={request.id}
                            className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
                                request.status === "Rejected" ? "opacity-70" : ""
                            } ${idx === requests.length - 1 ? "border-none" : ""}`}
                        >
                            <td className="py-4 px-4">
                                <p className="font-semibold text-slate-800 dark:text-white">{request.trainingTitle}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
                                    {request.trainingCategory}
                                </p>
                            </td>
                            <td className="py-4 px-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                    request.status === "Approved"
                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                        : request.status === "Pending"
                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                            : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        request.status === "Approved"
                                            ? "bg-emerald-500"
                                            : request.status === "Pending"
                                                ? "bg-blue-500"
                                                : "bg-red-500"
                                    }`}></span>
                                    {request.status}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{request.trainingDate}</p>
                                <p className="text-[11px] text-slate-400">{request.trainingTime}</p>
                            </td>
                            <td className="py-4 px-4 text-center">
                                {request.status === "Approved" ? (
                                    request.attendanceConfirmed ? (
                                        <div className="flex items-center justify-center">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                Confirmed
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setIsConfirmingAttendance(true);
                                                }}
                                                className="px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-[#853500] transition-colors cursor-pointer shadow-sm shadow-primary/20"
                                            >
                                                Confirm Attendance
                                            </button>
                                        </div>
                                    )
                                ) : request.status === "Pending" ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-[11px] font-semibold text-slate-400 px-3 py-1.5 border border-dashed border-slate-200 rounded-lg">
                                            Waiting...
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <button 
                                            onClick={() => {
                                                setSelectedRejection(request.rejectionReason || "No reason provided.");
                                                setIsRejectionModalOpen(true);
                                            }}
                                            className="text-slate-400 text-[11px] font-semibold hover:text-slate-600 hover:underline cursor-pointer transition-colors"
                                        >
                                            View Reason
                                        </button>
                                    </div>
                                )}
                            </td>
                            <td className="py-4 px-4 text-center">
                                <button
                                    className={`text-[11px] font-bold flex items-center gap-1 justify-center mx-auto px-3 py-1.5 rounded-lg transition-colors ${request.status === 'Approved' && request.attendanceConfirmed
                                            ? "text-primary hover:bg-primary/5 cursor-pointer"
                                            : "text-slate-300 cursor-not-allowed"
                                        }`}
                                    disabled={!(request.status === 'Approved' && request.attendanceConfirmed)}
                                    onClick={(request.status === 'Approved' && request.attendanceConfirmed) ? () => onFeedbackClick(request) : undefined}
                                >
                                    <span className="material-symbols-outlined text-sm">rate_review</span>{" "}
                                    {(request.status === 'Approved' && request.attendanceConfirmed) ? "Give Feedback" : "Review Locked"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">
                    Showing <span className="text-slate-600 dark:text-slate-300 font-bold">{requests.length}</span> applications
                </p>
                <div className="flex gap-1.5">
                    <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-primary transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-xs shadow-sm shadow-primary/20 cursor-pointer">
                        1
                    </button>
                    <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary font-bold text-xs transition-all cursor-pointer">
                        2
                    </button>
                    <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-primary transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Attendance Confirmation Modal */}
            {isConfirmingAttendance && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-training-primary)]/10 flex items-center justify-center text-[var(--color-training-primary)] shrink-0">
                                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    check_circle
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Confirm Attendance?</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Are you sure you want to confirm your attendance for <strong>{selectedRequest.trainingTitle}</strong> on {selectedRequest.trainingDate}?
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-8">
                            <button
                                onClick={() => {
                                    setIsConfirmingAttendance(false);
                                    setSelectedRequest(null);
                                }}
                                className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                             <button
                                onClick={() => handleConfirmAttendance(selectedRequest.id)}
                                className="px-5 py-2.5 rounded-xl bg-[var(--color-training-primary)] text-white font-semibold hover:bg-[#853500] transition-colors shadow-sm cursor-pointer"
                            >
                                Yes, Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {isRejectionModalOpen && selectedRejection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-slate-100">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    error
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Rejection Reason</h3>
                                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                                    {selectedRejection}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setIsRejectionModalOpen(false);
                                    setSelectedRejection(null);
                                }}
                                className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingStatusTable;

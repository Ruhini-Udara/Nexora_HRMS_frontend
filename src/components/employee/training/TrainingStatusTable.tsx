"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";

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
    eventStatus?: string;
    eventRejectionReason?: string;
    rejectionReason?: string;
    attendanceConfirmed: boolean;
};

// Removed mock data

interface TrainingStatusTableProps {
    onFeedbackClick: (request: TrainingRequest) => void;
}

const TrainingStatusTable: React.FC<TrainingStatusTableProps> = ({ onFeedbackClick }) => {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<TrainingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmingAttendance, setIsConfirmingAttendance] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedRejection, setSelectedRejection] = useState<string | null>(null);
    const [isDecliningInvitation, setIsDecliningInvitation] = useState(false);

    const formatTime = (timeStr: string) => {
        if (!timeStr || timeStr === "TBD") return "10:00 AM";
        if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
        
        try {
            const [hours, minutes] = timeStr.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch {
            return timeStr;
        }
    };

    useEffect(() => {
        let isMounted = true;
        if (user?.id) {
            // Wrap sync state update in micro-task to avoid cascading render lint error
            Promise.resolve().then(() => {
                if (isMounted) setIsLoading(true);
            });

            api.get(`/api/training/employees/${user.id}/requests`)
                .then(res => {
                    if (isMounted) {
                        setRequests(res.data.sort((a: TrainingRequest, b: TrainingRequest) => b.id - a.id));
                    }
                })
                .catch(err => {
                    if (isMounted) {
                        console.error("Failed to fetch requests", err);
                    }
                })
                .finally(() => {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                });
        }
        return () => {
            isMounted = false;
        };
    }, [user?.id]);

    const handleConfirmAttendance = async (requestId: number) => {
        if (!selectedRequest) return;
        try {
            await api.post('/api/training/feedback', {
                eventId: selectedRequest.eventId,
                employeeId: selectedRequest.employeeId,
                attendanceStatus: 'Confirmed'
            });
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, attendanceConfirmed: true } : r));
        } catch (err) {
            console.error("Failed to confirm attendance", err);
            alert("Failed to confirm attendance. Please try again.");
        } finally {
            setIsConfirmingAttendance(false);
            setSelectedRequest(null);
        }
    };

    const handleDeclineInvitation = async (requestId: number) => {
        try {
            await api.put(`/api/training/requests/${requestId}/status`, {
                status: 'Rejected',
                rejectionReason: 'Declined by employee.'
            });
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Rejected', rejectionReason: 'Declined by employee.' } : r));
        } catch (err) {
            console.error("Failed to decline invitation", err);
            alert("Failed to decline invitation. Please try again.");
        } finally {
            setIsDecliningInvitation(false);
            setSelectedRequest(null);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 lg:p-8">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="pb-4 px-4 font-bold uppercase tracking-wider text-[13px] text-slate-700 dark:text-slate-200">Program Name</th>
                            <th className="pb-4 px-4 font-bold uppercase tracking-wider text-[13px] text-slate-700 dark:text-slate-200">Status</th>
                            <th className="pb-4 px-4 font-bold uppercase tracking-wider text-[13px] text-slate-700 dark:text-slate-200">Date & Time</th>
                            <th className="pb-4 px-4 font-bold uppercase tracking-wider text-[13px] text-slate-700 dark:text-slate-200 text-center">Actions</th>
                            <th className="pb-4 px-4 font-bold uppercase tracking-wider text-[13px] text-slate-700 dark:text-slate-200 text-center">Feedback</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-10 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                        <p className="text-slate-400 font-medium">Fetching your program status...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : requests.length > 0 ? (
                            requests.map((request, idx) => (
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
                                                ? request.eventStatus === "Approved"
                                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                                    : request.eventStatus === "Rejected"
                                                        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                                        : request.eventStatus === "Returned"
                                                            ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                                                            : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                                : request.status === "Pending"
                                                    ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                                                    : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                request.status === "Approved"
                                                    ? request.eventStatus === "Approved"
                                                        ? "bg-emerald-500"
                                                        : request.eventStatus === "Rejected"
                                                            ? "bg-red-500"
                                                            : request.eventStatus === "Returned"
                                                                ? "bg-orange-500"
                                                                : "bg-blue-500"
                                                    : request.status === "Pending"
                                                        ? "bg-amber-500"
                                                        : "bg-red-500"
                                            }`}></span>
                                             {request.status === "Approved" 
                                                ? request.eventStatus === "Approved" 
                                                    ? "Approved" 
                                                    : request.eventStatus === "Rejected"
                                                        ? "Rejected (Final)"
                                                        : request.eventStatus === "Returned"
                                                            ? "Returned to HR"
                                                            : "HR Approved" 
                                                : request.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{request.trainingDate}</p>
                                        <p className="text-[11px] text-slate-400">{formatTime(request.trainingTime)}</p>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {request.status === "Approved" ? (
                                            request.eventStatus === "Approved" ? (
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
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setIsDecliningInvitation(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 text-[11px] font-bold rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )
                                            ) : (request.eventStatus === "Rejected" || request.eventStatus === "Returned") ? (
                                                <div className="flex items-center justify-center">
                                                    <button 
                                                        onClick={() => {
                                                            const reason = request.eventStatus === "Rejected" 
                                                                ? (request.eventRejectionReason || "This training program has been cancelled/rejected by the administrator.")
                                                                : (request.eventRejectionReason || "The training list was returned to HR for adjustments. Please wait for an update.");
                                                            setSelectedRejection(reason);
                                                            setIsRejectionModalOpen(true);
                                                        }}
                                                        className="text-red-500 text-[11px] font-semibold hover:text-red-700 hover:underline cursor-pointer transition-colors flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                                        View Reason
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 border border-blue-100 rounded-lg dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30 flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                                                        Pending Admin Approval
                                                    </span>
                                                </div>
                                            )
                                        ) : request.status === "Pending" ? (
                                            <div className="flex items-center justify-center">
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-50 text-slate-500 border border-slate-200/50 dark:bg-slate-800/40 dark:border-slate-700/30 shadow-sm shadow-slate-100/50 dark:shadow-none">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-300 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
                                                    </span>
                                                    In Review
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedRejection(request.rejectionReason || "No reason provided.");
                                                        setIsRejectionModalOpen(true);
                                                    }}
                                                    className="text-red-500 text-[11px] font-semibold hover:text-red-700 hover:underline cursor-pointer transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">info</span>
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-40">
                                        <span className="material-symbols-outlined text-4xl">history_edu</span>
                                        <p className="text-sm font-medium">No program requests found for your account.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
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
            {/* Decline Invitation Modal */}
            {isDecliningInvitation && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    cancel
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Decline Invitation?</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Are you sure you want to decline the invitation for <strong>{selectedRequest.trainingTitle}</strong>? This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-8">
                            <button
                                onClick={() => {
                                    setIsDecliningInvitation(false);
                                    setSelectedRequest(null);
                                }}
                                className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Back
                            </button>
                             <button
                                onClick={() => handleDeclineInvitation(selectedRequest.id)}
                                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                            >
                                Yes, Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingStatusTable;

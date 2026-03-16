"use client";

import React, { useEffect } from "react";
import { Info, Send, XCircle, X } from "lucide-react";
import SessionSummaryCard from "./SessionSummaryCard";
import CandidatesTable from "./CandidatesTable";

interface TrainingDetails {
    title: string;
    type: string;
    date: string;
    status: string;
}

interface TrainingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    training: TrainingDetails | null;
    onApprove: () => void;
    onReject: () => void;
}

export default function TrainingListModal({ isOpen, onClose, training, onApprove, onReject }: TrainingListModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !training) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Click outside to close */}
            <div 
                className="absolute inset-0 -z-10" 
                onClick={onClose}
                aria-hidden="true"
            />
            
            <div 
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                            Approve Training List
                        </h2>
                        <p className="text-gray-500 font-medium text-sm mt-1">
                            Advanced tracking and coordination for scheduled development programs.
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Training Summary Card */}
                    <SessionSummaryCard
                        title={training.title}
                        type={training.type}
                        date={`${training.date} • 10:00 AM`}
                        location="Main Conference Room B"
                        trainer="Alex Rivera"
                    />

                    {/* Candidates Table Section */}
                    <CandidatesTable />
                </div>

                {/* Modal Footer Actions - Only show if Pending */}
                {training.status === "Pending" && (
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/50">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="flex items-start gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-primary max-w-xl shadow-sm">
                                <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                                    System will automatically send Training Date, Time, and Location
                                    via SMS/email to all selected candidates upon confirmation.
                                    Ensure all statuses are accurate before broadcasting.
                                </p>
                            </div>
                            <div className="flex gap-4 w-full lg:w-auto">
                                <button 
                                    onClick={onReject}
                                    className="flex-1 lg:flex-none px-6 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                                >
                                    Reject List
                                    <XCircle className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={onApprove}
                                    className="flex-1 lg:flex-none px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    Confirm & Send
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

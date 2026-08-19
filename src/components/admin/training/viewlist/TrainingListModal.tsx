"use client";

import React, { useEffect } from "react";
import { Info, Send, XCircle, X } from "lucide-react";
import SessionSummaryCard from "./SessionSummaryCard";
import CandidatesTable from "./CandidatesTable";

interface TrainingDetails {
    id: number;
    title: string;
    trainingCode?: string;
    type: string;
    date: string;
    time: string;
    location: string;
    trainer: string;
    expectedParticipants: number;
    status: string;
}

interface TrainingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    training: TrainingDetails | null;
    onApprove: () => void;
    onReturn?: () => void;
    onReject: () => void;
}

export default function TrainingListModal({ isOpen, onClose, training, onApprove, onReturn, onReject }: TrainingListModalProps) {
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
                        trainingCode={training.trainingCode}
                        type={training.type}
                        date={`${training.date} • ${training.time || '10:00 AM'}`}
                        location={training.location || 'Main Conference Hall'}
                        trainer={training.trainer || 'To Be Assigned'}
                        expectedParticipants={training.expectedParticipants || 0}
                    />

                    {/* Candidates Table Section */}
                    <CandidatesTable eventId={training.id} />
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
                            <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
                                <button 
                                    onClick={onReject}
                                    className="flex-1 lg:flex-none px-4 py-2.5 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                                >
                                    Final Reject
                                    <XCircle className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => (onReturn ? onReturn() : onReject())}
                                    className="flex-1 lg:flex-none px-4 py-2.5 bg-orange-100 text-orange-700 rounded-xl font-bold hover:bg-orange-200 transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                                >
                                    Return to HR
                                    <Send className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={onApprove}
                                    className="flex-1 lg:flex-none px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
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

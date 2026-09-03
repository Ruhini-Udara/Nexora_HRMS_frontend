"use client";

import React, { useMemo } from 'react';
import { formatTime, formatDateRange } from '@/lib/utils';

type EventParticipant = {
    id: string | number;
    employeeId: number;
    employeeName: string;
    department?: string;
    workEmail: string;
    attendanceStatus: string;
    hasSubmitted: boolean;
};

interface AttendanceListModalProps {
    isOpen: boolean;
    onClose: () => void;
    participants: EventParticipant[];
    event: {
        id?: number;
        title: string;
        trainingCode?: string;
        category?: string;
        location?: string;
        proposedStartDate?: string;
        proposedEndDate?: string;
        instructor?: string;
        time?: string;
    } | null;
}

export default function AttendanceListModal({
    isOpen,
    onClose,
    participants,
    event
}: AttendanceListModalProps) {

    const confirmedParticipants = useMemo(() => {
        return participants.filter(p => p.attendanceStatus === 'Present' || p.attendanceStatus === 'Confirmed');
    }, [participants]);

    if (!isOpen || !event) return null;

    const handlePrint = () => {
        const originalTitle = document.title;
        const cleanEventTitle = (event?.title || 'Training_Program')
            .replace(/[^a-zA-Z0-9]/g, '_')
            .replace(/_+/g, '_');
        const codeStr = event?.trainingCode ? `_${event.trainingCode}` : '';
        const dateStr = event?.proposedStartDate ? `_${event.proposedStartDate}` : '';

        // Set dynamic document title so browser defaults PDF save filename to this title
        document.title = `Attendance_Sign_In_Sheet_${cleanEventTitle}${codeStr}${dateStr}`;

        const printStyles = document.createElement('style');
        printStyles.id = 'attendance-list-print-style';
        printStyles.innerHTML = `
            @media print {
                *, *::before, *::after {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Force page background to pure white in print mode */
                html, body, .dark, .dark body, .dark html {
                    background: #ffffff !important;
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                }

                body * { visibility: hidden !important; }

                /* Force Light Mode printing regardless of dark theme */
                #printable-attendance-list,
                #printable-attendance-list *,
                .dark #printable-attendance-list,
                .dark #printable-attendance-list * {
                    visibility: visible !important;
                    color: #0f172a !important;
                    border-color: #cbd5e1 !important;
                    box-shadow: none !important;
                    text-shadow: none !important;
                }

                #printable-attendance-list {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    min-height: 100% !important;
                    height: auto !important;
                    background: #ffffff !important;
                    background-color: #ffffff !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    border: none !important;
                    overflow: visible !important;
                }

                .print-table-header,
                .dark .print-table-header {
                    background-color: #f1f5f9 !important;
                    color: #0f172a !important;
                }

                .no-print, .no-print * { display: none !important; }
                @page {
                    size: portrait;
                    margin: 12mm;
                }
            }
        `;
        document.head.appendChild(printStyles);
        window.print();
        setTimeout(() => {
            document.title = originalTitle;
            const existing = document.getElementById('attendance-list-print-style');
            if (existing) document.head.removeChild(existing);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:static print:inset-auto print:bg-white print:p-0 print:z-0 print:backdrop-blur-none">
            <div id="printable-attendance-list" className="bg-white dark:bg-[#1a1c23] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col border border-primary/10 print:max-h-full print:overflow-visible print:border-none print:shadow-none print:w-full">
                
                {/* Modal Header */}
                <div className="px-8 py-5 border-b border-primary/10 flex items-center justify-between no-print">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
                        Attendance Sign-in List
                    </h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 transition-colors shadow-sm cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[16px]">print</span>
                            Print List
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Printable Attendance Sheet */}
                <div className="p-8 flex-1 space-y-6 print:p-2 print:space-y-4 print:text-black">
                    
                    {/* Report Header (Only in Print) */}
                    <div className="hidden print:flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-black">HR Mate - Attendance Sign-in Sheet</h1>
                            <p className="text-[11px] text-slate-500 mt-0.5">Exported on: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Program Information Grid */}
                    <div className="bg-slate-50 dark:bg-background-dark/20 p-5 rounded-xl border border-primary/5 grid grid-cols-2 md:grid-cols-4 gap-4 print:bg-slate-50 print:border print:border-slate-200 print:grid-cols-4 print:p-3 print:gap-3">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">Programme Name</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white print:text-xs print:text-black">{event.title}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">Training Code</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 print:text-xs print:text-black">{event.trainingCode || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">Instructor / Trainer</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 print:text-xs print:text-black">{event.instructor || 'Internal Staff'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">Date, Time & Location</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 print:text-xs print:text-black">
                                {formatDateRange(event.proposedStartDate, event.proposedEndDate)} ({formatTime(event.time)}) - {event.location}
                            </p>
                        </div>
                    </div>

                    {/* Attendee Roll Call Table */}
                    <div className="border border-primary/10 rounded-xl overflow-hidden shadow-sm print:border-slate-300 print:shadow-none">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="print-table-header bg-primary/5 dark:bg-background-dark/40 border-b border-primary/10 print:bg-slate-100 print:border-slate-300">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-12 text-center print:py-2 print:px-3 print:text-[10px] print:text-black">#</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider print:py-2 print:px-3 print:text-[10px] print:text-black">Employee Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider print:py-2 print:px-3 print:text-[10px] print:text-black">Work Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40 text-center print:py-2 print:px-3 print:text-[10px] print:text-black">Signature</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5 dark:divide-primary/5 print:divide-slate-300">
                                {confirmedParticipants.length > 0 ? (
                                    confirmedParticipants.map((p, idx) => (
                                        <tr key={p.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 print:bg-white">
                                            <td className="px-6 py-4 text-sm text-slate-500 font-bold text-center print:py-2.5 print:px-3 print:text-xs">{idx + 1}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white print:py-2.5 print:px-3 print:text-xs print:text-black">
                                                {p.employeeName}
                                                {p.department && (
                                                    <span className="text-[10px] block text-slate-400 font-semibold uppercase print:text-[9px] print:text-slate-600 mt-0.5">
                                                        {p.department}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 print:py-2.5 print:px-3 print:text-xs print:text-black">{p.workEmail}</td>
                                            {/* Print signature underline lines */}
                                            <td className="px-6 py-4 print:py-2.5 print:px-3">
                                                <div className="w-32 border-b border-dashed border-slate-400/80 h-5 mx-auto no-print" />
                                                <div className="hidden print:block w-32 border-b border-slate-500 h-5 mx-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic print:py-4 print:text-xs">
                                            No confirmed participants found for this training session.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-8 py-4 border-t border-primary/10 flex justify-end gap-3 no-print">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-5 py-2 bg-primary hover:bg-primary/95 text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        Print Attendance List
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useMemo } from 'react';
import { formatTime } from '@/lib/utils';

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
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:absolute print:inset-0 print:bg-white print:p-0 print:z-0 print:backdrop-blur-none">
            <div className="bg-white dark:bg-[#1a1c23] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col border border-primary/10 print:max-h-full print:overflow-visible print:border-none print:shadow-none">
                
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
                <div className="p-8 flex-1 space-y-6 print:p-0 print:text-black">
                    
                    {/* Report Header (Only in Print) */}
                    <div className="hidden print:flex items-center justify-between border-b border-slate-300 pb-5 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-black">Nexora HRMS - Attendance Sign-in Sheet</h1>
                            <p className="text-xs text-slate-500 mt-1">Exported on: {new Date().toLocaleDateString()}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">TRAINING DEPT</span>
                    </div>

                    {/* Program Information Grid */}
                    <div className="bg-slate-50 dark:bg-background-dark/20 p-5 rounded-xl border border-primary/5 grid grid-cols-2 md:grid-cols-4 gap-4 print:bg-slate-50 print:border-slate-300 print:grid-cols-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Programme Name</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white print:text-black">{event.title}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Training Code</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 print:text-black">{event.trainingCode || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructor / Trainer</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 print:text-black">{event.instructor || 'Internal Staff'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date, Time & Location</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 print:text-black">
                                {event.proposedStartDate || 'TBD'} ({formatTime(event.time)}) - {event.location}
                            </p>
                        </div>
                    </div>

                    {/* Attendee Roll Call Table */}
                    <div className="border border-primary/10 rounded-xl overflow-hidden shadow-sm print:border-slate-300 print:shadow-none">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary/5 dark:bg-background-dark/40 border-b border-primary/10 print:bg-slate-100 print:border-slate-300">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-12 text-center">#</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Work Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40 text-center">Signature</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5 dark:divide-primary/5 print:divide-slate-300">
                                {confirmedParticipants.length > 0 ? (
                                    confirmedParticipants.map((p, idx) => (
                                        <tr key={p.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 print:bg-white">
                                            <td className="px-6 py-4 text-sm text-slate-500 font-bold text-center">{idx + 1}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white print:text-black">
                                                {p.employeeName}
                                                {p.department && (
                                                    <span className="text-[10px] block text-slate-400 font-semibold uppercase print:text-slate-500 mt-0.5">
                                                        {p.department}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 print:text-black">{p.workEmail}</td>
                                            {/* Print signature underline lines */}
                                            <td className="px-6 py-4">
                                                <div className="w-32 border-b border-dashed border-slate-400/80 h-5 mx-auto no-print" />
                                                <div className="hidden print:block w-32 border-b border-slate-400 h-5 mx-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">
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

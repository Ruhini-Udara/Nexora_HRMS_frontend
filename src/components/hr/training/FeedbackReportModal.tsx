"use client";

import React, { useMemo } from 'react';

type EventParticipant = {
    id: string | number;
    employeeId: number;
    employeeName: string;
    department?: string;
    workEmail: string;
    attendanceStatus: string;
    feedback: string | null;
    courseContentRating: number;
    instructorRating: number;
    overallExperienceRating: number;
    suggestions: string;
    hasSubmitted: boolean;
};

interface FeedbackReportModalProps {
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
        budget?: number;
    } | null;
}

export default function FeedbackReportModal({
    isOpen,
    onClose,
    participants,
    event
}: FeedbackReportModalProps) {

    const stats = useMemo(() => {
        const total = participants.length;
        const attendees = participants.filter(p => p.attendanceStatus === 'Present' || p.attendanceStatus === 'Attended');
        const absentees = participants.filter(p => p.attendanceStatus === 'Absent');
        
        const feedbackSubmissions = participants.filter(p => p.hasSubmitted);
        const feedbackCount = feedbackSubmissions.length;
        
        const attendanceRate = total > 0 ? Math.round((attendees.length / total) * 100) : 0;
        const responseRate = total > 0 ? Math.round((feedbackCount / total) * 100) : 0;
        
        // Averages
        const avgOverall = feedbackCount > 0 
            ? (feedbackSubmissions.reduce((sum, p) => sum + p.overallExperienceRating, 0) / feedbackCount).toFixed(1)
            : '0.0';
            
        const avgContent = feedbackCount > 0 
            ? (feedbackSubmissions.reduce((sum, p) => sum + p.courseContentRating, 0) / feedbackCount).toFixed(1)
            : '0.0';
            
        const avgInstructor = feedbackCount > 0 
            ? (feedbackSubmissions.reduce((sum, p) => sum + p.instructorRating, 0) / feedbackCount).toFixed(1)
            : '0.0';

        // Star breakdown for Overall Experience
        const starBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        feedbackSubmissions.forEach(p => {
            const rating = Math.round(p.overallExperienceRating);
            if (rating >= 1 && rating <= 5) {
                starBreakdown[rating as 1 | 2 | 3 | 4 | 5]++;
            }
        });

        return {
            total,
            attendees: attendees.length,
            absentees: absentees.length,
            feedbackCount,
            attendanceRate,
            responseRate,
            avgOverall,
            avgContent,
            avgInstructor,
            starBreakdown
        };
    }, [participants]);

    if (!isOpen || !event) return null;

    const handlePrint = () => {
        const originalTitle = document.title;
        const cleanEventTitle = (event?.title || 'Training_Program')
            .replace(/[^a-zA-Z0-9]/g, '_')
            .replace(/_+/g, '_');
        const codeStr = event?.trainingCode ? `_${event.trainingCode}` : '';
        const dateStr = event?.proposedStartDate ? `_${event.proposedStartDate}` : '';

        // Dynamically set document title so browser defaults PDF save filename to this title
        document.title = `Training_Evaluation_Report_${cleanEventTitle}${codeStr}${dateStr}`;

        const printStyles = document.createElement('style');
        printStyles.id = 'feedback-report-print-style';
        printStyles.innerHTML = `
            @media print {
                *, *::before, *::after {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Override page background to pure white in print mode */
                html, body, .dark, .dark body, .dark html {
                    background: #ffffff !important;
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                }
                
                body * { visibility: hidden !important; }
                
                /* Force Light Mode printing regardless of dark theme */
                #printable-feedback-report,
                #printable-feedback-report *,
                .dark #printable-feedback-report,
                .dark #printable-feedback-report * {
                    visibility: visible !important;
                    color: #0f172a !important;
                    border-color: #e2e8f0 !important;
                    box-shadow: none !important;
                    text-shadow: none !important;
                }
                
                #printable-feedback-report {
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

                #printable-feedback-report .print-hero-banner,
                .dark #printable-feedback-report .print-hero-banner {
                    background-color: #f8fafc !important;
                    border: 1px solid #e2e8f0 !important;
                    border-left: 4px solid #ea580c !important;
                }

                #printable-feedback-report .print-card,
                .dark #printable-feedback-report .print-card {
                    background-color: #ffffff !important;
                    border: 1px solid #e2e8f0 !important;
                }

                #printable-feedback-report .print-bar-track,
                .dark #printable-feedback-report .print-bar-track {
                    background-color: #f1f5f9 !important;
                    border: 1px solid #cbd5e1 !important;
                    height: 8px !important;
                    border-radius: 9999px !important;
                    overflow: hidden !important;
                }

                #printable-feedback-report .print-bar-fill-orange,
                .dark #printable-feedback-report .print-bar-fill-orange {
                    background-color: #ea580c !important;
                    height: 100% !important;
                }

                #printable-feedback-report .print-bar-fill-blue,
                .dark #printable-feedback-report .print-bar-fill-blue {
                    background-color: #2563eb !important;
                    height: 100% !important;
                }

                #printable-feedback-report .print-bar-fill-green,
                .dark #printable-feedback-report .print-bar-fill-green {
                    background-color: #16a34a !important;
                    height: 100% !important;
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
            const existing = document.getElementById('feedback-report-print-style');
            if (existing) document.head.removeChild(existing);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:static print:inset-auto print:bg-white print:p-0 print:z-0 print:backdrop-blur-none">
            <div id="printable-feedback-report" className="bg-white dark:bg-[#1a1c23] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col border border-primary/10 print:max-h-full print:overflow-visible print:border-none print:shadow-none print:w-full">
                
                {/* Modal Header */}
                <div className="px-8 py-5 border-b border-primary/10 flex items-center justify-between no-print">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Training Feedback Statistics Report
                    </h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 transition-colors shadow-sm cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[16px]">print</span>
                            Print Report
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Printable Report Content */}
                <div className="p-8 flex-1 space-y-8 print:p-2 print:space-y-4 print:text-black">
                    
                    {/* Report Header (Shown in Print) */}
                    <div className="hidden print:flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-black">HR Mate - Training Evaluation Report</h1>
                            <p className="text-[11px] text-slate-500 mt-0.5">Generated on: {new Date().toLocaleDateString()}</p>
                        </div>
                        <span className="text-xs font-bold text-primary border border-primary/30 px-2 py-0.5 rounded">CONFIDENTIAL</span>
                    </div>

                    {/* Program Information (Redesigned Hero) */}
                    <div className="print-hero-banner bg-gradient-to-r from-primary/5 via-slate-50 to-primary/5 dark:from-primary/5 dark:via-background-dark/20 dark:to-primary/5 p-6 rounded-2xl border-l-4 border-l-primary dark:border-l-primary/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 print:bg-slate-50 print:border print:border-slate-200 print:border-l-4 print:border-l-primary print:flex-row print:p-3.5 print:rounded-lg print:gap-4">
                        {/* Title Section */}
                        <div className="space-y-2 md:max-w-[45%] print:space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest print:text-[9px]">Programme Name</p>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-snug print:text-base print:text-black">{event.title}</h2>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary dark:text-primary rounded-full text-xs font-bold shadow-sm print:py-0.5 print:px-2 print:text-[10px]">
                                <span className="material-symbols-outlined text-[14px] print:text-[12px]">qr_code</span>
                                {event.trainingCode || 'TRN-N/A'}
                            </div>
                        </div>

                        {/* Metadata Grid (Right Side) */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-8 print:border-slate-200 print:gap-x-4 print:gap-y-2 print:pl-4">
                            <div className="flex items-center gap-2.5 print:gap-1.5">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-lg flex items-center justify-center print:p-1 no-print">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider print:text-[8px]">Instructor</span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-[11px] print:text-black">{event.instructor || 'Internal Staff'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 print:gap-1.5">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-lg flex items-center justify-center print:p-1 no-print">
                                    <span className="material-symbols-outlined text-[18px]">category</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider print:text-[8px]">Training Type</span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-[11px] print:text-black">{event.category}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 print:gap-1.5">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-lg flex items-center justify-center print:p-1 no-print">
                                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider print:text-[8px]">Date</span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-[11px] print:text-black">{event.proposedStartDate || 'TBD'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 print:gap-1.5">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-lg flex items-center justify-center print:p-1 no-print">
                                    <span className="material-symbols-outlined text-[18px]">map</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider print:text-[8px]">Location</span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-[11px] print:text-black">{event.location || 'TBD'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
                        {/* Attendance Card */}
                        <div className="print-card bg-white dark:bg-[#1f212a] p-6 rounded-2xl border-t-4 border-t-orange-500 border-x border-b border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center print:border print:border-slate-200 print:p-3 print:rounded-lg print:shadow-none print:transform-none">
                            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 no-print">
                                <span className="material-symbols-outlined text-2xl">groups</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider print:text-[9px]">Attendance Rate</p>
                            <h4 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5 print:text-xl print:mt-0.5 print:text-black">{stats.attendanceRate}%</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase print:text-[8px] print:mt-0.5">{stats.attendees} / {stats.total} Present</p>
                        </div>

                        {/* Response Rate Card */}
                        <div className="print-card bg-white dark:bg-[#1f212a] p-6 rounded-2xl border-t-4 border-t-green-500 border-x border-b border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center print:border print:border-slate-200 print:p-3 print:rounded-lg print:shadow-none print:transform-none">
                            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3 no-print">
                                <span className="material-symbols-outlined text-2xl">rate_review</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider print:text-[9px]">Response Rate</p>
                            <h4 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5 print:text-xl print:mt-0.5 print:text-black">{stats.responseRate}%</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase print:text-[8px] print:mt-0.5">{stats.feedbackCount} Feedbacks</p>
                        </div>

                        {/* Satisfaction Rating Card */}
                        <div className="print-card bg-white dark:bg-[#1f212a] p-6 rounded-2xl border-t-4 border-t-amber-500 border-x border-b border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center print:border print:border-slate-200 print:p-3 print:rounded-lg print:shadow-none print:transform-none">
                            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 no-print">
                                <span className="material-symbols-outlined text-2xl">star</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider print:text-[9px]">Avg Satisfaction</p>
                            <h4 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5 print:text-xl print:mt-0.5 print:text-black">{stats.avgOverall} / 5.0</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase print:text-[8px] print:mt-0.5">Overall Rating</p>
                        </div>

                        {/* Details Rating Card */}
                        <div className="print-card bg-white dark:bg-[#1f212a] p-6 rounded-2xl border-t-4 border-t-blue-500 border-x border-b border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center print:border print:border-slate-200 print:p-3 print:rounded-lg print:shadow-none print:transform-none">
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 no-print">
                                <span className="material-symbols-outlined text-2xl">menu_book</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider print:text-[9px]">Course & Instructor</p>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-2 print:text-sm print:mt-1 print:text-black">C: {stats.avgContent} | I: {stats.avgInstructor}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-2.5 uppercase print:text-[8px] print:mt-0.5">Average Ratings</p>
                        </div>
                    </div>

                    {/* Score Distribution & Rating Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
                        
                        {/* Rating Distributions */}
                        <div className="print-card border border-primary/10 p-6 rounded-xl bg-white dark:bg-[#1e202c] shadow-sm print:border-slate-200 print:p-3 print:rounded-lg print:shadow-none">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-primary/5 pb-2 print:text-xs print:mb-2 print:pb-1 print:text-black">
                                Rating Distributions
                            </h4>
                            <div className="space-y-4 print:space-y-1.5">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    const count = stats.starBreakdown[stars as 1 | 2 | 3 | 4 | 5];
                                    const percentage = stats.feedbackCount > 0 ? (count / stats.feedbackCount) * 100 : 0;
                                    return (
                                        <div key={stars} className="flex items-center gap-3 print:gap-2">
                                            <span className="text-xs font-bold text-slate-600 w-12 flex items-center gap-0.5 print:text-[10px] print:w-9 print:text-black">
                                                {stars} <span className="material-symbols-outlined text-[14px] text-yellow-500 print:text-[12px]">star</span>
                                            </span>
                                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden print-bar-track">
                                                <div 
                                                    className="h-full bg-primary rounded-full print-bar-fill-orange" 
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500 w-8 text-right print:text-[10px] print:w-6 print:text-black">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detailed Score Summaries */}
                        <div className="print-card border border-primary/10 p-6 rounded-xl bg-white dark:bg-[#1e202c] shadow-sm print:border-slate-200 print:p-3 print:rounded-lg print:shadow-none">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-primary/5 pb-2 print:text-xs print:mb-2 print:pb-1 print:text-black">
                                Category Breakdown
                            </h4>
                            <div className="space-y-5 print:space-y-2.5">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 print:text-[10px] print:mb-0.5 print:text-black">
                                        <span>Course Content Quality</span>
                                        <span>{stats.avgContent} / 5.0</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden print-bar-track">
                                        <div 
                                            className="h-full bg-blue-500 rounded-full print-bar-fill-blue" 
                                            style={{ width: `${(parseFloat(stats.avgContent) / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 print:text-[10px] print:mb-0.5 print:text-black">
                                        <span>Instructor Capability</span>
                                        <span>{stats.avgInstructor} / 5.0</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden print-bar-track">
                                        <div 
                                            className="h-full bg-green-500 rounded-full print-bar-fill-green" 
                                            style={{ width: `${(parseFloat(stats.avgInstructor) / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 print:text-[10px] print:mb-0.5 print:text-black">
                                        <span>Overall Training Experience</span>
                                        <span>{stats.avgOverall} / 5.0</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden print-bar-track">
                                        <div 
                                            className="h-full bg-orange-500 rounded-full print-bar-fill-orange" 
                                            style={{ width: `${(parseFloat(stats.avgOverall) / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suggestions & Employee Remarks */}
                    <div className="print-card border border-primary/10 p-6 rounded-xl bg-white dark:bg-[#1e202c] shadow-sm print:border-slate-200 print:p-3 print:rounded-lg print:shadow-none print:break-inside-avoid">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-primary/5 pb-2 print:text-xs print:mb-2 print:pb-1 print:text-black">
                            Employee Suggestions
                        </h4>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 print:max-h-full print:overflow-visible print:pr-0 print:space-y-2">
                            {participants.filter(p => p.hasSubmitted && p.suggestions?.trim()).length > 0 ? (
                                participants.filter(p => p.hasSubmitted && p.suggestions?.trim()).map((p) => (
                                    <div key={p.id} className="p-3 bg-slate-50 dark:bg-background-dark/20 rounded-lg border-l-4 border-l-primary flex flex-col gap-1.5 print:bg-slate-50 print:border-slate-200 print:border-l-orange-500 print:p-2 print:gap-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-[10px] print:text-black">{p.employeeName}{p.department ? ` (${p.department})` : ''}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 italic print:text-[10px] print:text-black">
                                            &ldquo;{p.suggestions}&rdquo;
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic text-center py-6 print:py-2 print:text-[10px]">No suggestions or comments submitted yet for this program.</p>
                            )}
                        </div>
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
                        Print Report
                    </button>
                </div>
            </div>
        </div>
    );
}

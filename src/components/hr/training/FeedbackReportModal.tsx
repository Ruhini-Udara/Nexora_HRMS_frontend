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
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:absolute print:inset-0 print:bg-white print:p-0 print:z-0 print:backdrop-blur-none">
            <div className="bg-white dark:bg-[#1a1c23] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col border border-primary/10 print:max-h-full print:overflow-visible print:border-none print:shadow-none">
                
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
                <div className="p-8 flex-1 space-y-8 print:p-0 print:text-black">
                    
                    {/* Report Header (Shown in Print) */}
                    <div className="hidden print:flex items-center justify-between border-b border-slate-300 pb-5 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-black">Nexora HRMS - Training Evaluation Report</h1>
                            <p className="text-xs text-slate-500 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">CONFIDENTIAL</span>
                    </div>

                    {/* Program Information (Redesigned Hero) */}
                    <div className="bg-gradient-to-r from-primary/5 via-slate-50 to-primary/5 dark:from-primary/5 dark:via-background-dark/20 dark:to-primary/5 p-6 rounded-2xl border-l-4 border-l-primary dark:border-l-primary/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 print:bg-slate-50 print:border-slate-300 print:flex-row print:p-5 print:rounded-xl">
                        {/* Title Section */}
                        <div className="space-y-2 md:max-w-[45%]">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Programme Name</p>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-snug print:text-black">{event.title}</h2>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary dark:text-primary rounded-full text-xs font-bold shadow-sm">
                                <span className="material-symbols-outlined text-[14px]">qr_code</span>
                                {event.trainingCode || 'TRN-N/A'}
                            </div>
                        </div>

                        {/* Metadata Grid (Right Side) */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-8 print:border-slate-300">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Instructor</span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-black">{event.instructor || 'Internal Staff'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">category</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Training Type</span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-black">{event.category}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Date</span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-black">{event.proposedStartDate || 'TBD'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">map</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Location</span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-black">{event.location || 'TBD'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Attendance Card */}
                        <div className="bg-white dark:bg-[#1f212a] p-6 rounded-2xl border-t-4 border-t-orange-500 border-x border-b border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center print:border-slate-300 print:shadow-none print:transform-none">
                            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 no-print">
                                <span className="material-symbols-outlined text-2xl">groups</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Attendance Rate</p>
                            <h4 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5 print:text-black">{stats.attendanceRate}%</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">{stats.attendees} / {stats.total} Present</p>
                        </div>

                        {/* Response Rate Card */}
                        <div className="bg-white dark:bg-[#1f212a] p-6 rounded-2xl border-t-4 border-t-green-500 border-x border-b border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center print:border-slate-300 print:shadow-none print:transform-none">
                            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3 no-print">
                                <span className="material-symbols-outlined text-2xl">rate_review</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Response Rate</p>
                            <h4 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5 print:text-black">{stats.responseRate}%</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">{stats.feedbackCount} Feedbacks</p>
                        </div>

                        {/* Satisfaction Rating Card */}
                        <div className="bg-white dark:bg-[#1f212a] p-6 rounded-2xl border-t-4 border-t-amber-500 border-x border-b border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center print:border-slate-300 print:shadow-none print:transform-none">
                            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 no-print">
                                <span className="material-symbols-outlined text-2xl">star</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Satisfaction</p>
                            <h4 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5 print:text-black">{stats.avgOverall} / 5.0</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">Overall Rating</p>
                        </div>

                        {/* Details Rating Card */}
                        <div className="bg-white dark:bg-[#1f212a] p-6 rounded-2xl border-t-4 border-t-blue-500 border-x border-b border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center print:border-slate-300 print:shadow-none print:transform-none">
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 no-print">
                                <span className="material-symbols-outlined text-2xl">menu_book</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Course & Instructor</p>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-2 print:text-black">C: {stats.avgContent} | I: {stats.avgInstructor}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-2.5 uppercase">Average Ratings</p>
                        </div>
                    </div>

                    {/* Score Distribution & Rating Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Rating Distributions */}
                        <div className="border border-primary/10 p-6 rounded-xl bg-white dark:bg-[#1e202c] shadow-sm print:border-slate-300 print:shadow-none">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-primary/5 pb-2 print:text-black">
                                Rating Distributions
                            </h4>
                            <div className="space-y-4">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    const count = stats.starBreakdown[stars as 1 | 2 | 3 | 4 | 5];
                                    const percentage = stats.feedbackCount > 0 ? (count / stats.feedbackCount) * 100 : 0;
                                    return (
                                        <div key={stars} className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-600 w-12 flex items-center gap-0.5 print:text-black">
                                                {stars} <span className="material-symbols-outlined text-[14px] text-yellow-500">star</span>
                                            </span>
                                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                                                <div 
                                                    className="h-full bg-primary rounded-full print:bg-orange-500" 
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500 w-8 text-right print:text-black">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detailed Score Summaries */}
                        <div className="border border-primary/10 p-6 rounded-xl bg-white dark:bg-[#1e202c] shadow-sm print:border-slate-300 print:shadow-none">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-primary/5 pb-2 print:text-black">
                                Category Breakdown
                            </h4>
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 print:text-black">
                                        <span>Course Content Quality</span>
                                        <span>{stats.avgContent} / 5.0</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                                        <div 
                                            className="h-full bg-blue-500 rounded-full" 
                                            style={{ width: `${(parseFloat(stats.avgContent) / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 print:text-black">
                                        <span>Instructor Capability</span>
                                        <span>{stats.avgInstructor} / 5.0</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                                        <div 
                                            className="h-full bg-green-500 rounded-full" 
                                            style={{ width: `${(parseFloat(stats.avgInstructor) / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 print:text-black">
                                        <span>Overall Training Experience</span>
                                        <span>{stats.avgOverall} / 5.0</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                                        <div 
                                            className="h-full bg-orange-500 rounded-full" 
                                            style={{ width: `${(parseFloat(stats.avgOverall) / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suggestions & Employee Remarks */}
                    <div className="border border-primary/10 p-6 rounded-xl bg-white dark:bg-[#1e202c] shadow-sm print:border-slate-300 print:shadow-none print:break-before-page">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-primary/5 pb-2 print:text-black">
                            Employee Suggestions & Comments
                        </h4>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 print:max-h-full print:overflow-visible print:pr-0">
                            {participants.filter(p => p.hasSubmitted && p.suggestions?.trim()).length > 0 ? (
                                participants.filter(p => p.hasSubmitted && p.suggestions?.trim()).map((p) => (
                                    <div key={p.id} className="p-3 bg-slate-50 dark:bg-background-dark/20 rounded-lg border-l-4 border-l-primary flex flex-col gap-1.5 print:bg-slate-50 print:border-slate-300 print:border-l-orange-500">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black">{p.employeeName}{p.department ? ` (${p.department})` : ''}</span>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5 print:text-black">
                                                Rating: {p.overallExperienceRating} <span className="material-symbols-outlined text-[12px] text-yellow-500">star</span>
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 italic print:text-black">
                                            &ldquo;{p.suggestions}&rdquo;
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic text-center py-6">No suggestions or comments submitted yet for this program.</p>
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

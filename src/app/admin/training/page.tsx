"use client";

import React, { useState, useEffect } from 'react';
import TrainingStats from '@/components/admin/training/TrainingStats';
import TrainingTable from '@/components/admin/training/TrainingTable';
import api from '@/lib/axiosInstance';
import { formatDateRange } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface TrainingEvent {
    id: number;
    title: string;
    trainingCode?: string;
    category: string;
    proposedStartDate?: string;
    proposedEndDate?: string;
    date?: string;
    time?: string;
    location?: string;
    trainer?: string;
    status: string;
    reason?: string;
    trainingName?: string;
    trainingType?: string;
    dateSubmitted?: string;
    submittedAt?: string;
    updatedAt?: string;
    trainingDate?: string;
    trainingTime?: string;
    trainingLocation?: string;
    instructor?: string;
    trainerName?: string;
    expectedParticipants?: number;
    participants?: number;
    rejectionReason?: string;
    approvedBy?: string;
    approvedAt?: string;
}

// Clean, UI-friendly data model used by components
interface MappedTrainingEvent {
    id: number;
    title: string;
    trainingCode?: string;
    requester: string;
    type: string;
    typeColor: string;
    proposedStartDate?: string;
    submissionDate: string;
    date: string;
    time: string;
    location: string;
    trainer: string;
    expectedParticipants: number;
    status: string;
    rejectionReason?: string;
    approvedAt?: string;
    updatedAt?: string;
}

export default function TrainingRequestsPage() {
    const [requests, setRequests] = useState<MappedTrainingEvent[]>([]);  // Stores processed training requests ready for display
    const [isLoading, setIsLoading] = useState(true);  // Controls loading spinner visibility

    useEffect(() => {
        // Utility to format time to 12-hour format
        const formatTime = (timeStr: string) => {
            if (!timeStr || timeStr === "TBD") return "10:00 AM";  // Default time if not specified
            if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;  // Already formatted
            
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

        // Utility to format date explicitly as year/month/day (YYYY/MM/DD)
        const formatDisplayDate = (dateStr?: string) => {
            if (!dateStr || dateStr === "TBD") return "TBD";
            try {
                const parts = dateStr.split('T')[0].split('-');
                if (parts.length === 3) {
                    const [y, m, d] = parts;
                    return `${y}/${m.padStart(2, '0')}/${d.padStart(2, '0')}`;
                }
                const dateObj = new Date(dateStr);
                if (isNaN(dateObj.getTime())) return dateStr;
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                return `${year}/${month}/${day}`;
            } catch {
                return dateStr;
            }
        };

        const fetchEvents = async () => {
            try {
                const res = await api.get('/api/training/events');
                // Filter only events that are relevant to Admin review (skip 'Published' status unless already approved)
                const relevantEvents = (res.data as TrainingEvent[]).filter((event: TrainingEvent) => 
                    ['Pending Admin Approval', 'Approved', 'Rejected'].includes(event.status) || event.approvedBy
                );
                
                // Map filtered API events to the table model, sorting newest approved/submitted on top
                const mappedEvents: MappedTrainingEvent[] = relevantEvents
                    .sort((a: TrainingEvent, b: TrainingEvent) => {
                        const timeA = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
                        const timeB = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
                        if (timeA && timeB && timeA !== timeB) return timeB - timeA;
                        if (timeA && !timeB) return -1;
                        if (!timeA && timeB) return 1;

                        const startA = a.proposedStartDate ? new Date(a.proposedStartDate).getTime() : 0;
                        const startB = b.proposedStartDate ? new Date(b.proposedStartDate).getTime() : 0;
                        if (startA && startB && startA !== startB) return startB - startA;

                        return b.id - a.id;
                    })
                    .map((event: TrainingEvent) => ({
                        id: event.id,
                        title: event.title || event.trainingName || "Untitled Training",
                        trainingCode: event.trainingCode,
                        requester: "HR Department", 
                        type: event.category || event.trainingType || "General",
                        typeColor: "bg-blue-100 text-blue-800",
                        proposedStartDate: formatDisplayDate(event.proposedStartDate || event.date || event.trainingDate),
                        submissionDate: formatDisplayDate(event.proposedStartDate || event.date || event.trainingDate),
                        date: formatDateRange(event.proposedStartDate || event.date || event.trainingDate, event.proposedEndDate),
                        time: formatTime(event.time || event.trainingTime || "10:00"),
                        location: event.location || event.trainingLocation || "Main Conference Hall",
                        trainer: event.instructor || event.trainer || event.trainerName || "To Be Assigned",
                        expectedParticipants: event.expectedParticipants || event.participants || 0,
                        status: event.approvedBy ? 'Approved' : (event.status === 'Pending Admin Approval' ? 'Pending' : event.status),
                        rejectionReason: event.reason || event.rejectionReason,
                        approvedAt: event.approvedAt,
                        updatedAt: event.updatedAt
                    }));
                setRequests(mappedEvents);
            } catch (err) {
                console.error("Failed to fetch training events for admin", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    /**
     * Derived statistics for dashboard cards.
     * These are recalculated on every render based on current state.
     */
    const pendingCount = requests.filter(r => r.status === 'Pending' || r.status === 'Pending Admin Approval').length;
    const rejectedCount = requests.filter(r => r.status === 'Rejected').length;
    const approvedCount = requests.filter(r => r.status === 'Approved').length;

    if (isLoading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading training requests...</p>
            </div>
        );
    }

    return (
        <div className="pt-4 px-8 pb-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Training Request List</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Manage and review all pending training applications from your teams.</p>
                </div>
            </div>

            {/* Stats */}
            <TrainingStats
                pendingCount={pendingCount}
                rejectedCount={rejectedCount}
                approvedCount={approvedCount}
            />

            {/* Important Notice */}
            <div className="mt-8 mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-center gap-3.5 text-amber-900 dark:text-amber-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium">
                    <span className="font-bold text-amber-950 dark:text-amber-100">Important Note:</span> Please make sure to review and approve the training list before the <span className="font-semibold underline underline-offset-2">Proposed Start Date</span> to ensure participants and trainers receive timely confirmation.
                </p>
            </div>

            {/* Content */}
            <TrainingTable
                requests={requests}
                setRequests={setRequests}
            />
        </div>
    );
}


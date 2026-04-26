"use client";

import React, { useState, useEffect } from 'react';
import TrainingStats from '@/components/admin/training/TrainingStats';
import TrainingTable from '@/components/admin/training/TrainingTable';
import api from '@/lib/axiosInstance';

interface TrainingEvent {
    id: number;
    title: string;
    category: string;
    proposedStartDate?: string;
    date?: string;
    time?: string;
    location?: string;
    trainer?: string;
    status: string;
    reason?: string;
}

export default function TrainingRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const formatTime = (timeStr: string) => {
            if (!timeStr || timeStr === "TBD") return "10:00 AM";
            if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
            
            try {
                const [hours, minutes] = timeStr.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${minutes} ${ampm}`;
            } catch (e) {
                return timeStr;
            }
        };

        const fetchEvents = async () => {
            try {
                const res = await api.get('/api/training/events');
                // Filter only events that are relevant to Admin review (skip 'Published' status)
                const relevantEvents = res.data.filter((event: any) => 
                    ['Pending Admin Approval', 'Approved', 'Rejected'].includes(event.status)
                );
                
                // Map filtered API events to the table model
                const mappedEvents = relevantEvents.map((event: any) => ({
                    id: event.id,
                    title: event.title || event.trainingName || "Untitled Training",
                    requester: "HR Department", 
                    type: event.category || event.trainingType || "General",
                    submissionDate: event.updatedAt ? new Date(event.updatedAt).toLocaleDateString() : new Date().toLocaleDateString(),
                    date: event.proposedStartDate || event.date || event.trainingDate || "TBD",
                    time: formatTime(event.time || event.trainingTime || "10:00"),
                    location: event.location || event.trainingLocation || "Main Conference Hall",
                    trainer: event.instructor || event.trainer || event.trainerName || "To Be Assigned",
                    expectedParticipants: event.expectedParticipants || event.participants || 0,
                    status: event.status === 'Pending Admin Approval' ? 'Pending' : event.status,
                    rejectionReason: event.reason || event.rejectionReason
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
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Training Request List</h2>
                    <p className="text-gray-500 mt-1">Manage and review all pending training applications from your teams.</p>
                </div>
            </div>

            {/* Stats */}
            <TrainingStats
                pendingCount={pendingCount}
                rejectedCount={rejectedCount}
                approvedCount={approvedCount}
            />

            {/* Content */}
            <TrainingTable
                requests={requests}
                setRequests={setRequests}
            />
        </div>
    );
}


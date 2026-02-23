"use client";

import React from "react";
import { ChevronRight, Bell, Settings, Search, Info, Send, XCircle } from "lucide-react";
import SessionSummaryCard from "@/components/admin/training/viewlist/SessionSummaryCard";
import CandidatesTable from "@/components/admin/training/viewlist/CandidatesTable";

export default function TrainingSessionDetailsPage() {
    return (
        <div className="p-8 pt-16 max-w-6xl mx-auto space-y-8">
            {/* Page Title */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    Approve Training Lists
                </h1>
                <p className="text-gray-500 font-medium text-sm">
                    Advanced tracking and coordination for scheduled development programs.
                </p>
            </div>

            {/* Training Summary Card */}
            <SessionSummaryCard
                title="Sales Tactics Optimization"
                type="Soft Skills"
                date="Oct 24, 2023 • 10:00 AM"
                location="Main Conference Room B"
                trainer="Alex Rivera"
            />

            {/* Candidates Table Section */}
            <CandidatesTable />

            {/* Footer Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 pb-12">
                <div className="flex items-start gap-3 bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border-l-4 border-primary max-w-xl shadow-sm">
                    <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                        System will automatically send Training Date, Time, and Location
                        via SMS/email to all selected candidates upon confirmation.
                        Ensure all statuses are accurate before broadcasting.
                    </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-8 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-all flex items-center justify-center gap-2">
                        Reject List
                        <XCircle className="w-4 h-4" />
                    </button>
                    <button className="flex-1 md:flex-none px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                        Confirm List & Send Email
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

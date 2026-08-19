"use client";

import React, { useState, useEffect } from "react";
import { Mail, Users, Loader2 } from "lucide-react";
import api from "@/lib/axiosInstance";

interface Candidate {
    id: number;
    name: string;
    department: string;
    email: string;
}

interface CandidatesTableProps {
    eventId?: number;
}

export default function CandidatesTable({ eventId }: CandidatesTableProps) {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!eventId) return;

        const fetchCandidates = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/api/training/events/${eventId}/requests`);
                
                if (!res.data || !Array.isArray(res.data)) {
                    setCandidates([]);
                    return;
                }

                interface CandidateRequest {
                    id: number;
                    status: string;
                    employeeName: string;
                    department: string;
                    workEmail?: string;
                    personalEmail?: string;
                }

                // Map and filter candidates. 
                // We show 'Approved' and 'Pending' candidates for the admin to review.
                const mappedCandidates: Candidate[] = (res.data as CandidateRequest[])
                    .filter((req: CandidateRequest) => {
                        const status = req.status?.toLowerCase();
                        return status === 'approved' || status === 'pending';
                    })
                    .map((req: CandidateRequest) => ({
                        id: req.id,
                        name: req.employeeName,
                        department: req.department,
                        email: req.personalEmail || req.workEmail || "N/A"
                    }));
                
                setCandidates(mappedCandidates);
            } catch (err) {
                console.error("Failed to fetch candidates for admin review", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
    }, [eventId]);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Selected Candidates
                </h4>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {candidates.length} Total Candidates
                </span>
            </div>
            <div className="overflow-x-auto min-h-[150px] relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        <p className="text-xs font-medium text-slate-500">Loading candidates...</p>
                    </div>
                ) : null}

                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Employee Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {candidates.length > 0 ? (
                            candidates.map((candidate) => (
                                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {candidate.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {candidate.department}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-primary" />
                                            <span className="text-xs text-gray-500 font-medium">
                                                {candidate.email}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : !isLoading && (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic text-sm">
                                    No approved candidates found for this training.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

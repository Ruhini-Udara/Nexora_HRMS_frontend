"use client";

import React from "react";
import { Mail, Users } from "lucide-react";

interface Candidate {
    id: number;
    name: string;
    department: string;
    email: string;
}

const candidates: Candidate[] = [
    {
        id: 1,
        name: "Jordan Lee",
        department: "UX Design",
        email: "j.lee@hrmate.com",
    },
    {
        id: 2,
        name: "Samantha Reed",
        department: "Product Management",
        email: "s.reed@hrmate.com",
    },
    {
        id: 3,
        name: "Marcus Wu",
        department: "Engineering",
        email: "m.wu@hrmate.com",
    },
    {
        id: 4,
        name: "Elena Gomez",
        department: "UX Research",
        email: "e.gomez@hrmate.com",
    },
];

export default function CandidatesTable() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Selected Candidates
                </h4>
            </div>
            <div className="overflow-x-auto">
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
                        {candidates.map((candidate) => (
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

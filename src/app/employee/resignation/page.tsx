"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react"; // Or use Material Symbols if preferred

export default function ResignationRequestPage() {
    return (
        <div className="max-w-[1400px] w-full mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resignation Request</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Submit and track your formal departure notice</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 text-[11px] font-bold px-4 py-1.5 rounded uppercase tracking-wider">
                    Active Employment
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">assignment_late</span>
                    <h2 className="font-bold text-slate-800 dark:text-white text-sm">Create Resign Request</h2>
                </div>
                <div className="p-8">
                    <form className="space-y-8">
                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-12 lg:col-span-5 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Desired Last Working Day</label>
                                        <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm text-slate-600 dark:text-slate-300 p-2.5 outline-none" placeholder="mm/dd/yyyy" type="date" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Reason for Resignation</label>
                                        <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm text-slate-600 dark:text-slate-300 p-2.5 outline-none">
                                            <option>Select Reason</option>
                                            <option>Career Growth</option>
                                            <option>Personal Reasons</option>
                                            <option>Better Opportunity</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Add Remarks (Exit Feedback)</label>
                                    <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm text-slate-600 dark:text-slate-300 p-3 h-32 outline-none" placeholder="Please share any feedback or specific reasons for your departure..."></textarea>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-7">
                                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Upload Resignation Letter</label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center h-full min-h-[220px]">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-primary text-2xl">cloud_upload</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-400">Signed PDF or Document (max. 5MB)</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all" type="submit">
                                <span className="material-symbols-outlined text-[20px]">send</span>
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="font-bold text-slate-800 dark:text-white">Resignation Request Status</h2>
                    <div className="relative w-full sm:w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary outline-none" placeholder="Search request ID..." type="text" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Request ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Working Day</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr>
                                <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">RES-2024-012</td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">15 Oct 2024</td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">15 Nov 2024</td>
                                <td className="px-6 py-4">
                                    <span className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Pending</span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

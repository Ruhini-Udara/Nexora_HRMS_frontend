"use client";

import React from "react";
import Link from "next/link";

export default function LeaveRequestPage() {
    return (
        <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-8">
            <div className="col-span-12">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Apply for Leave</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please fill out the form below to submit a new leave request.</p>
            </div>

            <div className="col-span-12 lg:col-span-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Leave Type</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none">
                                <option>Select leave type</option>
                                <option>Annual Leave</option>
                                <option>Sick Leave</option>
                                <option>Casual Leave</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                                <div className="relative">
                                    <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none" placeholder="mm/dd/yyyy" type="date" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                                <div className="relative">
                                    <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none" placeholder="mm/dd/yyyy" type="date" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Total Days</label>
                            <input className="w-full bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 dark:text-slate-500 p-2.5 outline-none" disabled type="text" value="0 Days" />
                            <p className="text-[11px] text-slate-400 mt-1.5">Automatically calculated based on date range.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Reason</label>
                            <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-3 outline-none" placeholder="Briefly describe your reason for leave..." rows={4}></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Attachments</label>
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-800/30">
                                <span className="material-symbols-outlined text-slate-400 text-4xl mb-3">cloud_upload</span>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300"><span className="text-primary cursor-pointer">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-slate-400 mt-1">PDF, JPG or PNG (max. 10MB)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pt-4">
                            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg font-bold shadow-sm shadow-primary/20 transition-all" type="submit">
                                Submit Request
                            </button>
                            <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium px-4" type="button">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-800 dark:text-white">Leave Balance</h2>
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-full">2023 CYCLE</span>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-500 dark:text-slate-400 uppercase">Annual Leave</span>
                                <span className="text-slate-900 dark:text-white font-bold text-sm">12/20 <span className="text-slate-400 text-xs font-normal">Days</span></span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: "60%" }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-500 dark:text-slate-400 uppercase">Sick Leave</span>
                                <span className="text-slate-900 dark:text-white font-bold text-sm">8/10 <span className="text-slate-400 text-xs font-normal">Days</span></span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: "80%" }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-500 dark:text-slate-400 uppercase">Casual Leave</span>
                                <span className="text-slate-900 dark:text-white font-bold text-sm">3/7 <span className="text-slate-400 text-xs font-normal">Days</span></span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: "42%" }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex gap-3 border border-amber-100 dark:border-amber-900/30">
                        <span className="material-symbols-outlined text-amber-500 text-lg">info</span>
                        <p className="text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
                            Unused leaves expire on Dec 31st.
                        </p>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-[#E9C46A] via-[#F4A261] to-[#E76F51] p-6 rounded-xl text-amber-950 shadow-lg">
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-2">Leave Policy Update</h3>
                        <p className="text-xs font-medium mb-6 leading-relaxed opacity-90">
                            Medical certificates are now mandatory for sick leaves exceeding 2 consecutive days.
                        </p>
                        <Link href="#" className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline">
                            Read Policy <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </Link>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                </div>
            </div>
        </div>
    );
}

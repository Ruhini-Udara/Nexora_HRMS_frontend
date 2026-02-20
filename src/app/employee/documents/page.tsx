"use client";

import React from "react";

export default function MyDocumentsPage() {
    return (
        <div className="space-y-10 max-w-[1600px] mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Documents</h1>
                    <p className="text-sm text-gray-500 mt-1">Easily organize, access and manage your professional credentials.</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-8">
                        {/* Folder Cards */}
                        <div className="bg-[#FFF9F6] dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl cursor-pointer transition-all hover:border-[#953002]/30 shadow-sm group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[#953002]/10 flex items-center justify-center text-[#953002] transition-transform group-hover:scale-110">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <span className="bg-[#953002] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">04</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Personal</h3>
                            <p className="text-[11px] text-gray-400">ID, Passport, Visa</p>
                        </div>

                        <div className="bg-[#f0f9ff] dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl cursor-pointer transition-all hover:border-cyan-600/30 shadow-sm group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-cyan-600/10 flex items-center justify-center text-cyan-600 transition-transform group-hover:scale-110">
                                    <span className="material-symbols-outlined">school</span>
                                </div>
                                <span className="bg-cyan-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">03</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Academic</h3>
                            <p className="text-[11px] text-gray-400">Degrees, Diplomas</p>
                        </div>

                        <div className="bg-[#fff1f2] dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl cursor-pointer transition-all hover:border-rose-700/30 shadow-sm group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-rose-700/10 flex items-center justify-center text-rose-700 transition-transform group-hover:scale-110">
                                    <span className="material-symbols-outlined">work</span>
                                </div>
                                <span className="bg-rose-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">02</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Employment</h3>
                            <p className="text-[11px] text-gray-400">Letters, Contracts</p>
                        </div>

                        <div className="bg-[#f0fdf4] dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl cursor-pointer transition-all hover:border-green-700/30 shadow-sm group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-green-700/10 flex items-center justify-center text-green-700 transition-transform group-hover:scale-110">
                                    <span className="material-symbols-outlined">medical_information</span>
                                </div>
                                <span className="bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">01</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Medical</h3>
                            <p className="text-[11px] text-gray-400">Reports, Insurance</p>
                        </div>
                    </div>
                </div>

                {/* Quick Upload Area */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-dashed border-2 border-[#953002]/20 bg-[#FFF7ED]/30 dark:bg-[#953002]/5 flex flex-col items-center justify-center text-center group transition-all hover:border-[#953002]/40 shadow-sm h-full min-h-[250px]">
                    <div className="w-14 h-14 rounded-full bg-[#953002]/10 flex items-center justify-center text-[#953002] mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Quick Upload</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Drag and drop your files here or click to browse</p>
                    <button className="mt-4 bg-[#953002] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#7a2802] shadow-md shadow-[#953002]/20 transition-all">
                        Browse Files
                    </button>
                </div>
            </div>

            {/* Recent Uploads Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Recent Uploads</h2>
                    <button className="text-xs font-bold text-[#953002] hover:underline">View All</button>
                </div>
                <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide">
                    {/* Upload Card 1 */}
                    <div className="flex-none w-64 bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md border-l-4 border-l-[#953002]">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-[#953002]/5 rounded flex items-center justify-center text-[#953002]">
                                <span className="material-symbols-outlined">picture_as_pdf</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate dark:text-white">Passport_Update.pdf</p>
                                <p className="text-[10px] text-gray-400">Uploaded 2h ago • 2.4 MB</p>
                            </div>
                        </div>
                        <div className="mt-5 flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 text-[10px] font-bold uppercase tracking-tighter">Verified</span>
                            <div className="flex gap-1">
                                <button className="p-1 text-gray-400 hover:text-[#953002] transition-colors"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                                <button className="p-1 text-gray-400 hover:text-[#953002] transition-colors"><span className="material-symbols-outlined text-[18px]">download</span></button>
                            </div>
                        </div>
                    </div>

                    {/* Upload Card 2 */}
                    <div className="flex-none w-64 bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md border-l-4 border-l-[#953002]/60">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-[#953002]/5 rounded flex items-center justify-center text-[#953002]">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate dark:text-white">IELTS_Certificate.pdf</p>
                                <p className="text-[10px] text-gray-400">Uploaded 1d ago • 1.1 MB</p>
                            </div>
                        </div>
                        <div className="mt-5 flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 text-[10px] font-bold uppercase tracking-tighter">Pending</span>
                            <div className="flex gap-1">
                                <button className="p-1 text-gray-400 hover:text-[#953002] transition-colors"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                                <button className="p-1 text-gray-400 hover:text-[#953002] transition-colors"><span className="material-symbols-outlined text-[18px]">download</span></button>
                            </div>
                        </div>
                    </div>

                    {/* Upload Card 3 */}
                    <div className="flex-none w-64 bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md border-l-4 border-l-[#953002]/40">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-[#953002]/5 rounded flex items-center justify-center text-[#953002]">
                                <span className="material-symbols-outlined">image</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate dark:text-white">Visa_Scan_Back.jpg</p>
                                <p className="text-[10px] text-gray-400">Uploaded 2d ago • 0.8 MB</p>
                            </div>
                        </div>
                        <div className="mt-5 flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 text-[10px] font-bold uppercase tracking-tighter">Verified</span>
                            <div className="flex gap-1">
                                <button className="p-1 text-gray-400 hover:text-[#953002] transition-colors"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                                <button className="p-1 text-gray-400 hover:text-[#953002] transition-colors"><span className="material-symbols-outlined text-[18px]">download</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Document Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button className="px-4 py-1.5 rounded-lg text-sm font-bold bg-white dark:bg-slate-700 text-[#953002] shadow-sm">All Records</button>
                        <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-slate-700 dark:hover:text-slate-300">Pending</button>
                        <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-slate-700 dark:hover:text-slate-300">Archived</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-[#953002] hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#953002] hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                            <span className="material-symbols-outlined">grid_view</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Document</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Upload Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {/* Row 1 */}
                            <tr className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-[#953002]/10 flex items-center justify-center text-[#953002]">
                                            <span className="material-symbols-outlined text-[20px]">file_present</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Passport_Copy_New.pdf</p>
                                            <p className="text-[11px] text-gray-400">2.4 MB • PDF</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400 font-medium">Personal ID</td>
                                <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">Oct 12, 2023</td>
                                <td className="px-6 py-5">
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 uppercase">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Verified
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-gray-400 hover:text-[#953002] hover:bg-[#953002]/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">download</span></button>
                                        <button className="p-2 text-gray-400 hover:text-[#953002] hover:bg-[#953002]/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                        <button className="p-2 text-gray-400 hover:text-[#953002] hover:bg-[#953002]/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                            {/* Row 2 */}
                            <tr className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-[#953002]/10 flex items-center justify-center text-[#953002]">
                                            <span className="material-symbols-outlined text-[20px]">file_present</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Degree_Certificate.pdf</p>
                                            <p className="text-[11px] text-gray-400">1.8 MB • PDF</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400 font-medium">Academic</td>
                                <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">Oct 10, 2023</td>
                                <td className="px-6 py-5">
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-yellow-600 uppercase">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                        Pending
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-gray-400 hover:text-[#953002] hover:bg-[#953002]/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">download</span></button>
                                        <button className="p-2 text-gray-400 hover:text-[#953002] hover:bg-[#953002]/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                        <button className="p-2 text-gray-400 hover:text-[#953002] hover:bg-[#953002]/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

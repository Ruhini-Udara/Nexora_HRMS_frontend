"use client";

import React, { useState } from "react";

const WelfareRequestPage = () => {
    const [welfareType, setWelfareType] = useState<string>("Medical");
    const [amount, setAmount] = useState<string>("");
    const [remarks, setRemarks] = useState<string>("");

    // Mock data for requests table
    const requests = [
        { id: "WLF-2024-882", type: "Medical Reimbursement", date: "22 Oct 2024", status: "Pending", statusColor: "bg-yellow-50 text-yellow-600" },
        { id: "WLF-2024-715", type: "Educational Assistance", date: "10 Sep 2024", status: "Approved", statusColor: "bg-green-50 text-green-600" },
        { id: "WLF-2024-654", type: "Financial Aid", date: "15 Aug 2024", status: "Rejected", statusColor: "bg-red-50 text-red-600" },
    ];

    return (
        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-9 space-y-8">
                <h1 className="text-2xl font-bold text-primary">Welfare Request Management</h1>

                {/* Create Request Form */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-8">
                            <span className="material-symbols-outlined text-primary">volunteer_activism</span>
                            <h2 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Create Welfare Request</h2>
                        </div>

                        <div className="mb-6">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-3">Select Welfare Type</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Medical */}
                                <div
                                    onClick={() => setWelfareType("Medical")}
                                    className={`border rounded-xl p-4 cursor-pointer relative transition-all ${welfareType === "Medical" ? "border-primary bg-light-cream" : "border-slate-100 bg-white hover:border-slate-200"
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${welfareType === "Medical" ? "bg-orange-100/50" : "bg-slate-50"}`}>
                                        <span className={`material-symbols-outlined text-lg ${welfareType === "Medical" ? "text-primary" : "text-slate-400"}`}>medical_services</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800">Medical</h4>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">Healthcare & medicine reimbursements</p>
                                </div>

                                {/* Education */}
                                <div
                                    onClick={() => setWelfareType("Education")}
                                    className={`border rounded-xl p-4 cursor-pointer relative transition-all ${welfareType === "Education" ? "border-primary bg-light-cream" : "border-slate-100 bg-white hover:border-slate-200"
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${welfareType === "Education" ? "bg-orange-100/50" : "bg-slate-50"}`}>
                                        <span className={`material-symbols-outlined text-lg ${welfareType === "Education" ? "text-primary" : "text-slate-400"}`}>school</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800">Education</h4>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">Tuition & learning resources</p>
                                </div>

                                {/* Financial Aid */}
                                <div
                                    onClick={() => setWelfareType("Financial")}
                                    className={`border rounded-xl p-4 cursor-pointer relative transition-all ${welfareType === "Financial" ? "border-primary bg-light-cream" : "border-slate-100 bg-white hover:border-slate-200"
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${welfareType === "Financial" ? "bg-orange-100/50" : "bg-slate-50"}`}>
                                        <span className={`material-symbols-outlined text-lg ${welfareType === "Financial" ? "text-primary" : "text-slate-400"}`}>payments</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800">Financial Aid</h4>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">Urgent financial support loans</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Amount Requested (LKR)</label>
                                    <input
                                        type="text"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Add Remarks (Justification)</label>
                                    <textarea
                                        rows={4}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
                                        placeholder="Please provide detailed justification for your welfare request..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Upload Supporting Documents</label>
                                <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-12 flex flex-col items-center justify-center text-center group hover:border-primary transition-all cursor-pointer h-[calc(100%-24px)]">
                                    <span className="material-symbols-outlined text-slate-400 text-3xl mb-3">upload_file</span>
                                    <p className="text-sm font-bold text-slate-800">Click to upload or drag and drop</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase">Bills, Certificates, or relevant documentation (Max. 10MB)</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-8">
                            <button className="px-8 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">send</span>
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Welfare Request Status</h2>
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Search request ID or type..."
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Request ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Welfare Type</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Submission Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-800">{req.id}</td>
                                        <td className="px-6 py-4 text-xs text-slate-600">{req.type}</td>
                                        <td className="px-6 py-4 text-xs text-slate-600">{req.date}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.statusColor}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Sidebar / Policies */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
                <div className="bg-green-50 border border-green-100 rounded-full px-4 py-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-[11px] font-bold text-green-700">Eligibility: Eligible for Welfare Benefits</span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-1.5 bg-orange-50 rounded-lg">
                            <span className="material-symbols-outlined text-primary text-lg">security</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Welfare Policies</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Medical Limit</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">LKR 150,000 per annum for permanent staff.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Processing Time</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Requests are typically reviewed within 7 working days.</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 text-[10px] font-bold text-primary border-t border-slate-50 pt-4 flex items-center justify-center gap-1 hover:underline">
                        Read Full Policy Documents <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-tight">Common Questions</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-700 hover:text-primary transition-colors">
                            How long does it take?
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-700 hover:text-primary transition-colors">
                            Is documentation mandatory?
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                    </div>
                </div>

                <div className="bg-need-help-bg rounded-xl border border-red-100 p-6 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                        <span className="material-symbols-outlined text-8xl">help_outline</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-2 relative z-10">Need Help?</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed mb-4 relative z-10">
                        Contact HR Operations if you have questions regarding regional availability or relocation benefits.
                    </p>
                    <button className="w-full py-2 bg-need-help-btn text-need-help-text text-[11px] font-bold rounded-lg hover:opacity-90 transition-colors relative z-10 shadow-sm uppercase tracking-wide">
                        Contact HR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelfareRequestPage;
"use client";

import React, { useState } from 'react';
import TrainingEventCard from "@/components/hr/training/TrainingEventCard";
import TrainingRequestDetailsModal from "@/components/hr/training/TrainingRequestDetailsModal";
import ApprovedTrainingListModal from "@/components/hr/training/ApprovedTrainingListModal";

const trainingEvents = [
    {
        id: 1,
        title: "Advanced Sales Tactics",
        date: "October 24, 2023",
        time: "09:00 AM - 12:00 PM",
        category: "Sales",
    },
    {
        id: 2,
        title: "Leadership 101: Core Basics",
        date: "November 02, 2023",
        time: "02:00 PM - 05:00 PM",
        category: "Leadership",
    },
    {
        id: 3,
        title: "2024 Product Roadmap",
        date: "November 15, 2023",
        time: "11:00 AM - 12:30 PM",
        category: "Product",
    },
];

const initialMockRequests = [
    {
        id: 1,
        eventId: 1,
        employeeName: "Kamal Perera",
        epfNumber: "EPF-1025",
        age: 32,
        department: "Sales Department",
        designation: "Senior Sales Executive",
        workEmail: "kamal.p@nexora.com",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmYuDYYWzEWBuDPbtCpt5100Pybre81uC7wd5tncHa7Jb-5NUaTQX6p7I-m5P94omqeXaZ3fId2Eovte-nCUw70ZEYa-652-sxCuLm0VnE3ak_KOd1CRvc8dASaXTHTZNuj8c-zmMSJujN2mhNPqt3afItU8BQI3hytOFdK8OczliowI5LtJRCG75lxjAv1BGif_LdMI-Bz6L4fwWqypzcCfC__cH5nz6wbT5Aw7HUuBV3LjPbt4hlUrdKOMHf1ZBi-ozecK43AGE",
        dateSubmitted: "Oct 12, 2023",
        status: "Pending",
        justification: "I would like to improve my sales closing techniques and learn advanced negotiation skills to meet Q4 targets efficiently. This training will highly benefit the company's revenue growth.",
        attachments: [
            { name: "sales_performance_report_Q3.pdf", url: "#" },
            { name: "manager_recommendation.docx", url: "#" }
        ]
    },
    {
        id: 2,
        eventId: 1,
        employeeName: "Amali Silva",
        epfNumber: "EPF-2041",
        age: 28,
        department: "IT & Data",
        designation: "Data Analyst",
        workEmail: "amali.s@nexora.com",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAE3GELhkAR_Bsi9WXiYp4-iplhAdX8v6jQ3zpYtB6F1Bsjj8RSQ2MnAFLTDwhd09KIhjIzBny6-TrfnJAVH1RqaItRSjlmDeKcYnH7qZ4j-ssCJzDYwY6nRznWDtfrXeYCzoltdvjoWOkzCmLEa9ymLX6_fHAZaQ1zZega6kK58VlYomoz2ClLlMkaPBNhTrCSZ9j_fujB-JiFy0GFC9rzlQ3cIi37J1M_knGqtqMbkIXLoDLwGCshBEXlUcCRpLNh80sUIj9TaXI",
        dateSubmitted: "Oct 10, 2023",
        status: "Approved",
        justification: "Cross-training in sales data analysis to better support the sales team with insights and customized dashboards.",
        attachments: [
            { name: "training_justification_amali.pdf", url: "#" }
        ]
    },
    {
        id: 3,
        eventId: 2,
        employeeName: "Nuwan Kumara",
        epfNumber: "EPF-3105",
        age: 41,
        department: "Marketing",
        designation: "Marketing Manager",
        workEmail: "nuwan.k@nexora.com",
        initials: "NK",
        dateSubmitted: "Oct 08, 2023",
        status: "Pending",
        justification: "To enhance team leadership strategies and effective communication within the department.",
        attachments: []
    },
    {
        id: 4,
        eventId: 3,
        employeeName: "Nethmi Fernando",
        epfNumber: "EPF-4022",
        age: 26,
        department: "Operations",
        designation: "Operations Coordinator",
        workEmail: "nethmi.f@nexora.com",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCyRHcUSOchj-O-7fcIy8ZhsWe1_ckC5tQx0N7AOX1OOf-O38ObkaVfbxuFyS2XvWZIP5uTWasCvnQ92XcIAeodaajIvT1q56iAbZA0nEpFIv2s9VhG4BlH4V8pFcfWFJAcPq2j9z5sQizCSfrNOG7IEPMixbDQydcp3zH5KxfrH0AQvjt62MIIHMik6krYZBgnSbeWt0fCIlHdFYtRsoS6SRg6FdrD2VxnSVx23SiSO8ujKOoy7r4rl2_DgcO91kzwIR3eXuDoMw",
        dateSubmitted: "Oct 05, 2023",
        status: "Rejected",
        justification: "Interested in understanding the product roadmap to align operational processes.",
        attachments: [
            { name: "operations_alignment_proposal.pdf", url: "#" }
        ]
    },
];

export default function TrainingRequestsTable() {
    const [selectedEventId, setSelectedEventId] = useState<number | null>(trainingEvents[0].id);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [requests, setRequests] = useState(initialMockRequests);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    const [isListModalOpen, setIsListModalOpen] = useState(false);

    const filteredEvents = selectedCategory === "All"
        ? trainingEvents
        : trainingEvents.filter(e => e.category === selectedCategory);

    const filteredRequests = selectedEventId
        ? requests.filter(req => req.eventId === selectedEventId)
        : [];

    const selectedEvent = trainingEvents.find(e => e.id === selectedEventId);

    // Calculate dynamic stats
    const totalPending = requests.filter(r => r.status === 'Pending').length;
    const totalApproved = requests.filter(r => r.status === 'Approved').length;
    const totalRejected = requests.filter(r => r.status === 'Rejected').length;

    return (
        <div className="flex-1 p-8 bg-background-light dark:bg-background-dark/40">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-xl border-2 border-orange-400/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-8xl text-orange-600">pending_actions</span>
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <p className="text-sm font-bold text-orange-800 dark:text-orange-400">Total Pending</p>
                        <span className="p-2 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg material-symbols-outlined text-[20px]">pending_actions</span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <h3 className="text-3xl font-extrabold text-orange-700 dark:text-orange-300">{totalPending}</h3>
                        <span className="text-xs font-bold text-orange-600/70 dark:text-orange-400/70 px-1.5 py-0.5 mt-1">Requests</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-background-dark/30 p-6 rounded-xl border border-primary/10 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-medium text-slate-500">Total Approved</p>
                        <span className="p-2 bg-green-100 text-green-600 rounded-lg material-symbols-outlined text-[20px]">verified</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold">{totalApproved}</h3>
                        <span className="text-xs font-bold text-slate-500 px-1.5 py-0.5 mt-1">Requests</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-background-dark/30 p-6 rounded-xl border border-primary/10 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-medium text-slate-500">Total Rejected</p>
                        <span className="p-2 bg-red-100 text-red-600 rounded-lg material-symbols-outlined text-[20px]">block</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold">{totalRejected}</h3>
                        <span className="text-xs font-bold text-slate-500 px-1.5 py-0.5 mt-1">Requests</span>
                    </div>
                </div>
            </div>

            {/* Section: Available Training Events */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">
                            local_library
                        </span>
                        Available Training Events
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">Filter by Type:</span>
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    // Reset selected event when filter changes
                                    setSelectedEventId(null);
                                }}
                                className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                            >
                                <option value="All">All Types</option>
                                <option value="Sales">Sales</option>
                                <option value="Leadership">Leadership</option>
                                <option value="Product">Product</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                                arrow_drop_down
                            </span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <TrainingEventCard
                            key={event.id}
                            title={event.title}
                            date={event.date}
                            time={event.time}
                            category={event.category}
                            hideActions={true}
                            isSelected={selectedEventId === event.id}
                            onClick={() => setSelectedEventId(event.id)}
                        />
                    ))}
                </div>
            </section>

            {/* Table Header Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold">
                    Requests for {selectedEvent ? `"${selectedEvent.title}"` : "Selected Training"}
                </h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsListModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">list_alt</span>View Training List
                    </button>
                </div>
            </div>
            {/* Table Container */}
            <div className="bg-white dark:bg-background-dark/30 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary/5 border-b border-primary/10">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Programe name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Submitted</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proposed Start Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Request Form</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {request.avatar ? (
                                                    <img alt={request.employeeName} className="size-10 rounded-full object-cover" src={request.avatar} />
                                                ) : (
                                                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                        {request.initials}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold">{request.employeeName}</p>
                                                    <p className="text-xs text-slate-500">{request.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium">{selectedEvent?.title}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{request.dateSubmitted}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{selectedEvent?.date}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            <button 
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setIsModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 border border-primary/20 bg-white text-primary rounded-lg text-xs font-semibold hover:bg-primary/5 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">visibility</span> View
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setRequests(requests.map(r => r.id === request.id ? { ...r, status: "Approved" } : r));
                                                    }}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Approve">
                                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setRequests(requests.map(r => r.id === request.id ? { ...r, status: "Rejected" } : r));
                                                    }}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Reject">
                                                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        No training requests found for this event.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-background-dark/20 border-t border-primary/10 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">Showing {filteredRequests.length} results</p>
                    <div className="flex items-center gap-2">
                        <button className="p-1 rounded border border-primary/20 text-slate-400 hover:text-primary transition-colors disabled:opacity-50" disabled>
                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>
                        <button className="size-8 rounded bg-primary text-white text-xs font-bold">1</button>
                        <button className="size-8 rounded hover:bg-primary/10 text-xs font-bold transition-colors">2</button>
                        <button className="size-8 rounded hover:bg-primary/10 text-xs font-bold transition-colors">3</button>
                        <button className="p-1 rounded border border-primary/20 text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* Footer Info */}

            <TrainingRequestDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                request={selectedRequest}
            />

            <ApprovedTrainingListModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                requests={filteredRequests}
                eventName={selectedEvent?.title || "Selected Training"}
            />
        </div>
    );
}

import React from 'react';
import { Filter, Download, Link, MoreVertical, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

const ResignationTable = () => {
    const requests = [
        {
            name: "John Doe",
            reason: "Better Opportunity",
            submitted: "12/10/2023",
            effective: "12/11/2023",
            status: "Pending",
            statusColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        },
        {
            name: "Jane Smith",
            reason: "Personal Reasons",
            submitted: "10/10/2023",
            effective: "10/11/2023",
            status: "Approved",
            statusColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        },
        {
            name: "Robert Brown",
            reason: "Relocation",
            submitted: "05/10/2023",
            effective: "05/11/2023",
            status: "Pending",
            statusColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        },
        {
            name: "Alice Wilson",
            reason: "Career Change",
            submitted: "01/10/2023",
            effective: "01/11/2023",
            status: "Rejected",
            statusColor: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
        }
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">All Applications</h3>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-sm hover:bg-primary/90 rounded-lg transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-[18px] h-[18px]" />
                        Filter
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Employee Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Reason</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Submitted</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Effective Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Letter</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map((request, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                            {request.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{request.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{request.reason}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">{request.submitted}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">{request.effective}</td>
                                <td className="px-6 py-4">
                                    <button className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                                        <Link className="w-4 h-4" /> View Document
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${request.statusColor}`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {request.status === 'Pending' ? (
                                        <div className="flex justify-center gap-2">
                                            <button className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-all">
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">Showing 1 to 4 of 124 results</p>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1.5 bg-primary text-white rounded-md text-sm font-bold">1</button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600">2</button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600">3</button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600">Next</button>
                </div>
            </div>
        </div>
    );
};

export default ResignationTable;

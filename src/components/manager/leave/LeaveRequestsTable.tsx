import React from 'react';
import { Download, Filter, Check, X } from 'lucide-react';

const LeaveRequestsTable = () => {
    const requests = [
        {
            name: "Johnathan Doe",
            initials: "JD",
            type: "Annual Leave",
            startDate: "Oct 12, 2023",
            endDate: "Oct 15, 2023",
            duration: "4 Days",
            status: "Pending",
        },
        {
            name: "Jane Smith",
            initials: "JS",
            type: "Sick Leave",
            startDate: "Oct 14, 2023",
            endDate: "Oct 14, 2023",
            duration: "1 Day",
            status: "Approved",
        },
        {
            name: "Robert Brown",
            initials: "RB",
            type: "Paternity Leave",
            startDate: "Nov 01, 2023",
            endDate: "Nov 14, 2023",
            duration: "14 Days",
            status: "Pending",
        },
        {
            name: "Emily Davis",
            initials: "ED",
            type: "Annual Leave",
            startDate: "Oct 20, 2023",
            endDate: "Oct 22, 2023",
            duration: "3 Days",
            status: "Rejected",
        },
        {
            name: "Michael Wilson",
            initials: "MW",
            type: "Sick Leave",
            startDate: "Oct 18, 2023",
            endDate: "Oct 19, 2023",
            duration: "2 Days",
            status: "Pending",
        }
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Recent Applications</h3>
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
                            <th className="px-6 py-4 font-semibold text-gray-700">Leave Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Start Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">End Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Duration</th>
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
                                            {request.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{request.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600">{request.type}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">{request.startDate}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">{request.endDate}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">{request.duration}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-orange-100 text-orange-800'
                                        }`}>
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
                                        <span className="text-gray-400 text-xs italic">No actions</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">Showing 1 to 5 of 24 results</p>
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

export default LeaveRequestsTable;

import Link from 'next/link';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function TrainingTable() {
    const requests = [
        {
            id: 1,
            title: "Sales Tactics Optimization",
            requester: "Sarah Jenkins",
            type: "Soft Skills",
            typeColor: "bg-green-100 text-green-700",
            date: "Oct 12, 2023",
            status: "Pending",
        },
        {
            id: 2,
            title: "Cybersecurity Fundamentals 101",
            requester: "Michael Chen",
            type: "Technical",
            typeColor: "bg-blue-100 text-blue-700",
            date: "Oct 11, 2023",
            status: "Approved",
        },
        {
            id: 3,
            title: "Executive Leadership Coaching",
            requester: "Elena Rodriguez",
            type: "Leadership",
            typeColor: "bg-purple-100 text-purple-700",
            date: "Oct 10, 2023",
            status: "Rejected",
        },
        {
            id: 4,
            title: "Workplace Safety & Compliance",
            requester: "David Park",
            type: "Safety",
            typeColor: "bg-red-100 text-red-700",
            date: "Oct 09, 2023",
            status: "Pending",
        },
        {
            id: 5,
            title: "Advanced UI Design Systems",
            requester: "Jamie Smith",
            type: "Technical",
            typeColor: "bg-blue-100 text-blue-700",
            date: "Oct 08, 2023",
            status: "Approved",
        },
    ];

    return (
        <>
            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary text-sm font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filter by Training Type</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Training Program</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Training Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{req.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">{req.type}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{req.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-orange-100 text-orange-800'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link
                                            href="/admin/training/view-list"
                                            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm inline-block"
                                        >
                                            View List
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium">Showing 1 to 5 of 8 results</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1.5 bg-primary text-white rounded-md text-sm font-bold">1</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600">2</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600">3</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600">Next</button>
                    </div>
                </div>
            </div>
        </>
    );
}

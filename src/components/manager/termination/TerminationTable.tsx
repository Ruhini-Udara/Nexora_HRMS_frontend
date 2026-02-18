import { Link as LinkIcon, Check, X, Download } from 'lucide-react';
import Link from 'next/link';

export default function TerminationTable() {
    const requests = [
        {
            id: 1,
            employee: "John Doe",
            initials: "JD",
            reason: "Resignation",
            submissionDate: "Oct 12, 2023",
            effectiveDate: "Nov 01, 2023",
            status: "Pending",
            avatarColor: "bg-orange-100 text-orange-700"
        },
        {
            id: 2,
            employee: "Alice Smith",
            initials: "AS",
            reason: "Retirement",
            submissionDate: "Oct 10, 2023",
            effectiveDate: "Dec 31, 2023",
            status: "Approved",
            avatarColor: "bg-blue-100 text-blue-700"
        },
        {
            id: 3,
            employee: "Robert King",
            initials: "RK",
            reason: "Performance",
            submissionDate: "Oct 15, 2023",
            effectiveDate: "Oct 20, 2023",
            status: "Declined",
            avatarColor: "bg-purple-100 text-purple-700"
        },
        {
            id: 4,
            employee: "Michael West",
            initials: "MW",
            reason: "Policy Violation",
            submissionDate: "Oct 18, 2023",
            effectiveDate: "Oct 19, 2023",
            status: "Pending",
            avatarColor: "bg-amber-100 text-amber-700"
        },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Recent Requests</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-sm hover:bg-primary/90 rounded-lg transition-colors shadow-sm">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <th className="px-6 py-4">Employee Name</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">Submission Date</th>
                            <th className="px-6 py-4">Effective Date</th>
                            <th className="px-6 py-4 text-center">Termination Letter</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full ${req.avatarColor} flex items-center justify-center text-xs font-bold`}>
                                            {req.initials}
                                        </div>
                                        <span className="font-semibold text-gray-900">{req.employee}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                        {req.reason}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{req.submissionDate}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{req.effectiveDate}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <Link href="#" className="flex items-center gap-1.5 text-primary hover:underline font-medium text-xs">
                                            <LinkIcon className="w-4 h-4" />
                                            View Document
                                        </Link>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <span className={`px-3 py-1 text-xs rounded-lg font-bold
                                            ${req.status === 'Approved' ? 'bg-green-50 text-green-600' :
                                                req.status === 'Declined' ? 'bg-red-50 text-red-600' :
                                                    'bg-orange-50 text-orange-600'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {req.status === 'Pending' ? (
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
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm text-gray-500">Showing 1 to 4 of 56 entries</p>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1.5 bg-primary text-white rounded-md text-sm font-bold">1</button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600">2</button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-600">Next</button>
                </div>
            </div>
        </div>
    );
}

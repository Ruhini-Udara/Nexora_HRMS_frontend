import { Link as LinkIcon, Check, X, Download, Filter } from 'lucide-react';
import Link from 'next/link';

export default function DeathTable() {
    const applications = [
        {
            id: 1,
            employee: "John Doe",
            empId: "EMP-8821",
            deceasedRelation: "Spouse",
            incidentDate: "Oct 12, 2023",
            applicationDate: "Oct 14, 2023",
            status: "Pending",
        },
        {
            id: 2,
            employee: "Jane Smith",
            empId: "EMP-9204",
            deceasedRelation: "Father",
            incidentDate: "Oct 05, 2023",
            applicationDate: "Oct 08, 2023",
            status: "Approved",
        },
        {
            id: 3,
            employee: "Robert Brown",
            empId: "EMP-4412",
            deceasedRelation: "Mother",
            incidentDate: "Sep 28, 2023",
            applicationDate: "Sep 30, 2023",
            status: "Approved",
        },
        {
            id: 4,
            employee: "Emily Davis",
            empId: "EMP-3351",
            deceasedRelation: "Child",
            incidentDate: "Sep 20, 2023",
            applicationDate: "Sep 22, 2023",
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
                            <th className="px-6 py-4 font-semibold text-gray-700">Deceased Relation</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Incident Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Application Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Document Proof</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {applications.map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                            {app.employee.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{app.employee}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600">{app.deceasedRelation}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600">{app.incidentDate}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600">{app.applicationDate}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <Link href="#" className="flex items-center gap-1.5 text-primary hover:underline font-medium text-xs">
                                        <LinkIcon className="w-4 h-4" />
                                        View Document
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-orange-100 text-orange-800'
                                        }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {app.status === 'Pending' ? (
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
            <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">Showing 1 to 4 of 124 results</p>
                {/* Pagination (simplified) */}
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

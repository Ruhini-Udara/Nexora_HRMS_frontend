import { MoreHorizontal, Eye, Check, X } from 'lucide-react';

export default function TransferTable() {
    const requests = [
        {
            id: 1,
            employee: "Alice Johnson",
            currentDept: "Marketing",
            targetDept: "Sales",
            date: "2023-10-25",
            effectiveDate: "2023-11-01",
            status: "Pending",
            avatar: "AJ"
        },
        {
            id: 2,
            employee: "Bob Smith",
            currentDept: "IT Support",
            targetDept: "Development",
            date: "2023-10-24",
            effectiveDate: "2023-11-15",
            status: "Approved",
            avatar: "BS"
        },
        {
            id: 3,
            employee: "Charlie Brown",
            currentDept: "HR",
            targetDept: "Finance",
            date: "2023-10-22",
            effectiveDate: "2023-11-05",
            status: "Rejected",
            avatar: "CB"
        },
        {
            id: 4,
            employee: "Diana Prince",
            currentDept: "Sales",
            targetDept: "Marketing",
            date: "2023-10-20",
            effectiveDate: "2023-11-01",
            status: "Pending",
            avatar: "DP"
        },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Recent Requests</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Filter
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Employee</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Current Dept</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Target Dept</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Date Requested</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Effective Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                            {req.avatar}
                                        </div>
                                        <span className="font-medium text-gray-900">{req.employee}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{req.currentDept}</td>
                                <td className="px-6 py-4 text-gray-600">{req.targetDept}</td>
                                <td className="px-6 py-4 text-gray-600">{req.date}</td>
                                <td className="px-6 py-4 text-gray-600">{req.effectiveDate}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-orange-100 text-orange-800'}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                                            Review
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-center">
                <button className="text-sm text-gray-500 hover:text-primary font-medium">
                    View All Requests
                </button>
            </div>
        </div>
    );
}

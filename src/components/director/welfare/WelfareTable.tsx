import { Check, X, Download, Filter } from 'lucide-react';

export default function WelfareTable() {
    const requests = [
        {
            id: 1,
            employee: "John Doe",
            role: "Senior UX Designer",
            initials: "JD",
            type: "Financial Aid",
            date: "12 Oct 2023",
            amount: "$500.00",
            status: "Pending",
            avatarColor: "bg-amber-100 text-amber-700",
            typeColor: "bg-orange-50 text-orange-700"
        },
        {
            id: 2,
            employee: "Jane Smith",
            role: "Marketing Lead",
            initials: "JS",
            type: "Medical Assistance",
            date: "10 Oct 2023",
            amount: "$1,200.00",
            status: "Approved",
            avatarColor: "bg-blue-100 text-blue-700",
            typeColor: "bg-red-50 text-red-700"
        },
        {
            id: 3,
            employee: "Robert Brown",
            role: "Systems Engineer",
            initials: "RB",
            type: "Education Support",
            date: "08 Oct 2023",
            amount: "$2,500.00",
            status: "Rejected",
            avatarColor: "bg-indigo-100 text-indigo-700",
            typeColor: "bg-amber-50 text-amber-700"
        },
        {
            id: 4,
            employee: "Emily Davis",
            role: "Project director",
            initials: "ED",
            type: "Financial Aid",
            date: "05 Oct 2023",
            amount: "$300.00",
            status: "Pending",
            avatarColor: "bg-rose-100 text-rose-700",
            typeColor: "bg-orange-50 text-orange-700"
        },
        {
            id: 5,
            employee: "Michael Wilson",
            role: "Content Strategist",
            initials: "MW",
            type: "Medical Assistance",
            date: "01 Oct 2023",
            amount: "$850.00",
            status: "Approved",
            avatarColor: "bg-emerald-100 text-emerald-700",
            typeColor: "bg-red-50 text-red-700"
        }
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Active Requests</h3>
                <div className="flex items-center gap-3">

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
                            <th className="px-6 py-4 font-semibold text-gray-700">Welfare Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Application Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Amount</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                            {req.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{req.employee}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600">{req.type}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">{req.date}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{req.amount}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-orange-100 text-orange-800'
                                        }`}>
                                        {req.status}
                                    </span>
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
            <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">Showing 1 to 5 of 1,248 results</p>
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
}


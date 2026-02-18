import {
    Users,
    Calendar,
    AlignJustify,
    AlertCircle,
    TrendingUp,
    ClipboardList,
    CheckCircle,
    XCircle,
} from "lucide-react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import ModuleCard from "@/components/dashboard/ModuleCard";

// Recent leave requests data
const leaveRequests = [
    {
        id: 1,
        initials: "AM",
        name: "Alice Miller",
        role: "Sales Associate",
        leaveType: "Casual Leave",
        duration: "Oct 20 (1 day)",
        status: "Pending",
    },
    {
        id: 2,
        initials: "RT",
        name: "Robert Taylor",
        role: "Junior Developer",
        leaveType: "Sick Leave",
        duration: "Oct 18 - Oct 19 (2 days)",
        status: "Approved",
    },
    {
        id: 3,
        initials: "PK",
        name: "Priya Kumar",
        role: "QA Engineer",
        leaveType: "Annual Leave",
        duration: "Oct 22 - Oct 24 (3 days)",
        status: "Pending",
    },
    {
        id: 4,
        initials: "JD",
        name: "James Davis",
        role: "UI Designer",
        leaveType: "Casual Leave",
        duration: "Oct 15 (1 day)",
        status: "Approved",
    },
];

const statusStyles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
};

export default function SupervisorDashboard() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
                <p className="text-gray-500 mt-1">
                    Manage your team&apos;s attendance and leave requests efficiently.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <SummaryCard
                    title="Team Presence"
                    value="28/30"
                    subContent={
                        <div className="text-green-600 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>93% present today</span>
                        </div>
                    }
                    icon={<Users className="w-6 h-6" />}
                    iconBgColor="bg-orange-50"
                    iconColor="text-orange-500"
                />
                <SummaryCard
                    title="Pending Leave Requests"
                    value="4"
                    subContent={
                        <div className="text-orange-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Requires your action</span>
                        </div>
                    }
                    icon={<Calendar className="w-6 h-6" />}
                    iconBgColor="bg-yellow-50"
                    iconColor="text-yellow-500"
                />
                <SummaryCard
                    title="Active Shifts"
                    value="2"
                    subContent={
                        <div className="text-blue-600 flex items-center gap-1">
                            <AlignJustify className="w-3 h-3" />
                            <span>Morning &amp; Swing shifts</span>
                        </div>
                    }
                    icon={<AlignJustify className="w-6 h-6" />}
                    iconBgColor="bg-blue-50"
                    iconColor="text-blue-500"
                />
            </div>

            {/* Management Modules */}
            <section className="mb-10">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Management Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ModuleCard
                        title="Manual Attendance"
                        description="Log or adjust daily attendance and clock-in/out times for your team."
                        icon={<ClipboardList className="w-5 h-5" />}
                        href="/supervisor/manual-attendance"
                    />
                    <ModuleCard
                        title="Leave Management"
                        description="Review, approve, or reject leave requests from your direct reports."
                        icon={<Calendar className="w-5 h-5" />}
                        href="/supervisor/leave-management"
                    />
                    <ModuleCard
                        title="Team Attendance"
                        description="Monitor team-wide attendance patterns and generate daily reports."
                        icon={<Users className="w-5 h-5" />}
                        href="/supervisor/team-attendance"
                    />
                </div>
            </section>

            {/* Recent Team Leave Requests */}
            <section>
                <div className="bg-white border border-gray-200 rounded-custom shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Team Leave Requests</h2>
                        <a
                            href="/supervisor/leave-management"
                            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-custom hover:opacity-90 transition-opacity"
                        >
                            View All Requests
                        </a>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wide">
                                <th className="py-3 px-4 rounded-l-lg">Team Member</th>
                                <th className="py-3 px-4">Leave Type</th>
                                <th className="py-3 px-4">Duration</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 rounded-r-lg text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                            {leaveRequests.map((req) => (
                                <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                    {/* Team Member */}
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {req.initials}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{req.name}</p>
                                                <p className="text-xs text-gray-400">{req.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Leave Type */}
                                    <td className="py-4 px-4 text-gray-600">{req.leaveType}</td>
                                    {/* Duration */}
                                    <td className="py-4 px-4 text-gray-600">{req.duration}</td>
                                    {/* Status */}
                                    <td className="py-4 px-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[req.status]}`}
                                        >
                                            {req.status}
                                        </span>
                                    </td>
                                    {/* Action */}
                                    <td className="py-4 px-4 text-center">
                                        {req.status === "Pending" ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    title="Approve"
                                                    className="text-green-500 hover:text-green-700 transition-colors"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    title="Reject"
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Reviewed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

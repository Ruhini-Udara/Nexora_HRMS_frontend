
import { AlertCircle, TrendingUp, Calendar, ArrowLeftRight, UserMinus, Heart, UserX, LogOut } from 'lucide-react';
import SummaryCard from '@/components/dashboard/SummaryCard';
import ModuleCard from '@/components/dashboard/ModuleCard';

export default function DirectorDashboard() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Director Dashboard</h1>
                <p className="text-gray-500 dark:text-slate-400 mt-1">Manage your team&apos;s requests and monitor department performance.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <SummaryCard
                    title="Pending Approvals"
                    value="18"
                    subContent={
                        <div className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>! 4 require immediate attention</span>
                        </div>
                    }
                    icon={<AlertCircle className="w-6 h-6" />}
                    iconBgColor="bg-orange-50 dark:bg-orange-950/40"
                    iconColor="text-orange-600 dark:text-orange-400"
                />
                <SummaryCard
                    title="Department Attendance"
                    value="94%"
                    subContent={
                        <div className="text-green-600 dark:text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>Stable compared to last week</span>
                        </div>
                    }
                    icon={<TrendingUp className="w-6 h-6" />}
                    iconBgColor="bg-green-50 dark:bg-green-950/40"
                    iconColor="text-green-600 dark:text-green-400"
                />
                <SummaryCard
                    title="Upcoming Team Events"
                    value="3"
                    subContent={
                        <div className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Next: Team Workshop (Thu)</span>
                        </div>
                    }
                    icon={<Calendar className="w-6 h-6" />}
                    iconBgColor="bg-blue-50 dark:bg-blue-950/40"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
            </div>

            {/* Request Management Modules */}
            <section>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Request Management Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ModuleCard
                        title="Transfer Requests"
                        description="Review and approve employee requests for internal department transfers or location changes."
                        icon={<ArrowLeftRight className="w-5 h-5" />}
                        href="/director/transfer"
                    />
                    <ModuleCard
                        title="Termination Requests"
                        description="Manage offboarding procedures and resignation notices for department staff."
                        icon={<UserMinus className="w-5 h-5" />}
                        href="/director/termination"
                    />
                    <ModuleCard
                        title="Resignation Requests"
                        description="Review and process employee resignation letters and exit interviews."
                        icon={<LogOut className="w-5 h-5" />}
                        href="/director/resign"
                    />
                    <ModuleCard
                        title="Death Application"
                        description="Process compassionate leave and insurance benefit claims for bereaved employees."
                        icon={<UserX className="w-5 h-5" />}
                        href="/director/death"
                    />
                    <ModuleCard
                        title="Leave Requests"
                        description="Review and approve annual leave, sick leave, and other time-off applications."
                        icon={<Calendar className="w-5 h-5" />}
                        href="/director/leave"
                    />
                </div>
            </section>
        </div>
    );
}


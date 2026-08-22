"use client";

import React, { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, Calendar, ArrowLeftRight, UserMinus, LogOut, UserX, Users } from 'lucide-react';
import SummaryCard from '@/components/dashboard/SummaryCard';
import ModuleCard from '@/components/dashboard/ModuleCard';
import api from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/useAuthStore';

interface DirectorDashboardData {
    pendingApprovalsCount: number;
    urgentApprovalsCount: number;
    companyAttendancePercentage: string;
    totalEmployeesCount: number;
}

export default function DirectorDashboard() {
    const { user } = useAuthStore();
    const [data, setData] = useState<DirectorDashboardData | null>(null);

    // derive loading instead of storing it in state
    const loading = user?.id ? data === null : false;

    useEffect(() => {
        if (!user?.id) return;

        api.get('/api/v1/dashboard/director')
            .then((res) => {
                setData(res.data);
            })
            .catch((err) => {
                console.error("Failed to fetch director dashboard data", err);
            });
    }, [user?.id]);

    if (loading) {
        return <div className="text-center py-10 text-slate-500">Loading dashboard data...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Director Dashboard</h1>
                <p className="text-gray-500 dark:text-slate-400 mt-1">Manage your team&apos;s requests and monitor company performance.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <SummaryCard
                    title="Pending Approvals"
                    value={data?.pendingApprovalsCount?.toString() || "0"}
                    icon={<AlertCircle className="w-6 h-6" />}
                    iconBgColor="bg-orange-50 dark:bg-orange-950/40"
                    iconColor="text-orange-600 dark:text-orange-400"
                />
                <SummaryCard
                    title="Company Attendance"
                    value={data?.companyAttendancePercentage || "0%"}
                    icon={<TrendingUp className="w-6 h-6" />}
                    iconBgColor="bg-green-50 dark:bg-green-950/40"
                    iconColor="text-green-600 dark:text-green-400"
                />
                <SummaryCard
                    title="Total Employees"
                    value={data?.totalEmployeesCount?.toString() || "0"}
                    icon={<Users className="w-6 h-6" />}
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

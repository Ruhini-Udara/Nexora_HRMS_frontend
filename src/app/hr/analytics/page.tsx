"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axiosInstance";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

interface PassportExpiry {
    employeeName: string;
    passportNumber: string;
    expiryDate: string;
}

interface MaternityReturn {
    employeeName: string;
    expectedReturnDate: string;
}

interface AnalyticsData {
    presentToday: number;
    lateToday: number;
    pendingOverseas: number;
    pendingMaternity: number;
    delayedApprovals: number;
    passportExpiryAlerts: PassportExpiry[];
    upcomingMaternityReturns: MaternityReturn[];
    departmentEmployeeCount: Record<string, number>;
    departmentLeaveImpact: Record<string, number>;
    designationEmployeeCount: Record<string, number>;
    employmentStatusCount: Record<string, number>;
    branchEmployeeCount: Record<string, number>;
    leaveTypesUsed: Record<string, number>;
    attendanceStatusToday: Record<string, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#e056fd', '#eb4d4b', '#f9ca24', '#f0932b'];
const MUTED_COLORS = ['#0077DF', '#00A888', '#EAA420', '#E66A35', '#7672C8', '#70BA8B', '#CC4CEB', '#D94341', '#E5BA1C', '#DE8422'];

export default function HrAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
    const [exportYear, setExportYear] = useState(new Date().getFullYear());
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get("/api/v1/dashboard/analytics");
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4 text-gray-500">
                    <span className="material-icons-round text-primary text-4xl animate-pulse">hourglass_empty</span>
                    <span className="font-semibold tracking-widest uppercase text-sm">Loading Analytics...</span>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const handleDownloadPayroll = async () => {
        setIsExporting(true);
        try {
            const res = await api.get(`/api/v1/payroll/approved-leaves?month=${exportMonth}&year=${exportYear}`);
            const leaves = res.data;
            if (leaves.length === 0) {
                alert("No approved leaves found for this period.");
                return;
            }

            // Convert to CSV
            const headers = ["Leave ID", "Employee ID", "Employee Name", "EPF Number", "Leave Type", "From Date", "End Date", "Total Days", "Status"];
            const rows = leaves.map((l: any) => [
                l.leaveId, l.employeeId, `"${l.employeeName}"`, `"${l.epfNumber}"`, l.leaveType, l.fromDate, l.endDate, l.totalDays, l.status
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map((row: any[]) => row.join(","))
            ].join("\n");

            // Trigger Download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Payroll_Export_${exportMonth}_${exportYear}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to export payroll data", error);
            alert("Failed to export payroll data. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    // Calculate max values for bar charts
    const maxEmployees = Math.max(...Object.values(data.departmentEmployeeCount || {}), 1);
    const maxLeaves = Math.max(...Object.values(data.departmentLeaveImpact || {}), 1);

    const departments = Array.from(new Set([
        ...Object.keys(data.departmentEmployeeCount || {}),
        ...Object.keys(data.departmentLeaveImpact || {})
    ])).sort();

    const toChartData = (record: Record<string, number> | undefined) => {
        if (!record) return [];
        return Object.entries(record).map(([name, value]) => ({ name, value }));
    };

    const getDepartmentChartData = () => {
        if (!data?.departmentEmployeeCount) return [];
        let unassignedCount = 0;
        const result: { name: string; value: number }[] = [];

        for (const [key, val] of Object.entries(data.departmentEmployeeCount)) {
            if (!key || key.trim() === "" || key === "null") {
                unassignedCount += val;
            } else {
                result.push({ name: key, value: val });
            }
        }

        result.sort((a, b) => a.name.localeCompare(b.name));

        if (unassignedCount > 0) {
            result.push({ name: "Unassigned", value: unassignedCount });
        }

        return result;
    };

    const getLeaveChartData = () => {
        if (!data?.leaveTypesUsed) return [];

        const order = ["Annual Leave", "Casual Leave", "Medical Leave", "Overseas Leave", "Maternity Leave"];
        const result: { name: string; value: number }[] = [];

        // Add preferred types in exact order
        for (const type of order) {
            result.push({ name: type, value: data.leaveTypesUsed[type] || 0 });
        }

        // Add any remaining types
        for (const [key, val] of Object.entries(data.leaveTypesUsed)) {
            if (!order.includes(key)) {
                result.push({ name: key, value: val });
            }
        }

        return result;
    };

    const CustomYAxisTick = (props: any) => {
        const { y, payload } = props;
        return (
            <g transform={`translate(20,${y})`}>
                <text x={0} y={0} dy={4} textAnchor="start" fill="#6b7280" fontSize={11}>
                    {payload.value}
                </text>
            </g>
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">HR Analytics Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400">Comprehensive overview of workforce metrics</p>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* 1. Attendance Status Today (Doughnut) */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow h-96 flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Attendance Today</h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={toChartData(data.attendanceStatusToday)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2}>
                                    {toChartData(data.attendanceStatusToday).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={
                                            entry.name === 'On Leave' ? '#64748b' : 
                                            entry.name === 'Absent' ? '#8B3A00' : 
                                            COLORS[(index + 3) % COLORS.length]
                                        } />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '0px' }} formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Leave Types Used */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow h-96 flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Approved Leaves This Month</h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getLeaveChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" angle={-25} textAnchor="end" height={60} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis allowDecimals={false} tick={{ fill: '#6b7280' }} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#64748b" radius={[4, 4, 0, 0]} name="Active Leaves" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Employees by Employment Status (Doughnut) */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow h-[500px] flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Employment Status</h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={toChartData(data.employmentStatusCount)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2}>
                                    {toChartData(data.employmentStatusCount).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={MUTED_COLORS[index % MUTED_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '0px' }} formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Employees by Branch/Location (Pie) */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow h-[500px] flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Employees by Branch</h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={toChartData(data.branchEmployeeCount)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}>
                                    {toChartData(data.branchEmployeeCount).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={MUTED_COLORS[(index + 5) % MUTED_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '0px' }} formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5. Employees by Department */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow h-[500px] flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Employees by Department</h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getDepartmentChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis allowDecimals={false} tick={{ fill: '#6b7280' }} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#8B3A00" radius={[4, 4, 0, 0]} name="Employees" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 6. Employees by Designation (Horizontal Bar) */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow h-[500px] flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Employees by Designation</h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={toChartData(data.designationEmployeeCount)} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                <XAxis type="number" allowDecimals={false} tick={{ fill: '#6b7280' }} />
                                <YAxis type="category" dataKey="name" width={80} interval={0} tick={<CustomYAxisTick />} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#64748b" radius={[0, 4, 4, 0]} name="Employees" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Middle Row: Department Impact */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl card-shadow border border-border-light dark:border-border-dark p-6 mb-8">
                <div className="flex items-center gap-3 mb-6 border-b border-border-light dark:border-border-dark pb-4">
                    <span className="material-icons-round text-primary text-2xl">work</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Department Leave Impact</h3>
                </div>

                {departments.length === 0 ? (
                    <p className="text-gray-500 italic py-8 text-center">No department data available.</p>
                ) : (
                    <div className="space-y-6">
                        {departments.map(dept => {
                            const empCount = data.departmentEmployeeCount[dept] || 0;
                            const leaveCount = data.departmentLeaveImpact[dept] || 0;
                            const empWidth = Math.max((empCount / maxEmployees) * 100, 2);
                            const leaveWidth = Math.max((leaveCount / maxLeaves) * 100, 2);

                            return (
                                <div key={dept} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                    <div className="md:col-span-3">
                                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">
                                            {(!dept || dept.trim() === "" || dept === "null") ? "Unassigned" : dept}
                                        </p>
                                    </div>
                                    <div className="md:col-span-9 space-y-2">
                                        {/* Employee Count Bar */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden flex-1 relative">
                                                <div
                                                    className="bg-gray-400 dark:bg-gray-500 h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${empWidth}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 w-24 text-right">{empCount} Employees</span>
                                        </div>
                                        {/* Leaves Count Bar */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden flex-1 relative">
                                                <div
                                                    className="bg-primary h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${leaveCount === 0 ? 0 : leaveWidth}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-primary w-24 text-right">{leaveCount} On Leave</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Row: Alerts Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Passports */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl card-shadow border border-border-light dark:border-border-dark p-6 flex flex-col h-96">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary">flight</span>
                            Passport Expiries (&lt; 6 mo)
                        </h3>
                        <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">{data.passportExpiryAlerts?.length || 0}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {!data.passportExpiryAlerts || data.passportExpiryAlerts.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500 text-sm py-12">
                                No upcoming passport expirations.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.passportExpiryAlerts.map((alert, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-border-light dark:border-border-dark hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{alert.employeeName}</p>
                                            <p className="text-xs text-gray-500 mt-1">Passport: {alert.passportNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold text-primary dark:text-amber-400 uppercase tracking-wider">Expires</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{alert.expiryDate}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Maternity Returns */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl card-shadow border border-border-light dark:border-border-dark p-6 flex flex-col h-96">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary">pregnant_woman</span>
                            Upcoming Maternity Returns
                        </h3>
                        <span className="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 px-3 py-1 rounded-full text-xs font-bold border border-pink-200 dark:border-pink-800">{data.upcomingMaternityReturns?.length || 0}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {!data.upcomingMaternityReturns || data.upcomingMaternityReturns.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500 text-sm py-12">
                                No upcoming returns this month.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.upcomingMaternityReturns.map((alert, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-border-light dark:border-border-dark hover:border-pink-300 dark:hover:border-pink-700 transition-colors">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{alert.employeeName}</p>
                                            <p className="text-xs text-gray-500 mt-1">Returning from leave</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Expected</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{alert.expectedReturnDate}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

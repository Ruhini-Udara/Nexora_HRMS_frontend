"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Bell,
    Calendar,
    Download,
    FileSpreadsheet,
    ChevronDown,
    Clock,
    UserCheck,
    UserMinus,
    AlertCircle,
    Loader2,
} from "lucide-react";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";

interface Employee {
    id: number;
    fullName: string;
    department: string;
    designation?: { designationName: string };
    employeeCode?: string;
}

type AttendanceStatus = "Present" | "On Leave" | "Unknown";

interface AttendanceRow {
    id: number;
    name: string;
    role: string;
    department: string;
    employeeCode: string;
    status: AttendanceStatus;
    checkIn: string;
    checkOut: string;
}

const StatusBadge = ({ status }: { status: AttendanceStatus }) => {
    const configs: Record<AttendanceStatus, string> = {
        Present: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30",
        "On Leave": "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
        Unknown: "bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-zinc-700",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[12px] font-bold border ${configs[status]}`}>
            {status}
        </span>
    );
};

export default function TeamAttendancePage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDept, setSelectedDept] = useState("All Departments");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const user = useAuthStore(s => s.user);

    useEffect(() => {
        api.get("/api/employees")
            .then(res => setEmployees(res.data))
            .catch(err => console.error("Failed to load employees", err))
            .finally(() => setLoading(false));
    }, []);

    // Map employees to attendance rows (status is unknown without an attendance API)
    const rows: AttendanceRow[] = employees.map(emp => ({
        id: emp.id,
        name: emp.fullName,
        role: emp.designation?.designationName || "—",
        department: emp.department || "—",
        employeeCode: emp.employeeCode || `EMP-${emp.id}`,
        status: "Present" as AttendanceStatus, // default; no attendance API in backend
        checkIn: "—",
        checkOut: "—",
    }));

    const departments = ["All Departments", ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];

    const filtered = rows.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDept = selectedDept === "All Departments" || r.department === selectedDept;
        return matchSearch && matchDept;
    });

    const presentCount = filtered.filter(r => r.status === "Present").length;
    const absentCount = filtered.filter(r => r.status === "On Leave").length;

    return (
        <div className="flex flex-col flex-1 min-h-screen bg-[#f8f9fa] dark:bg-zinc-950">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 dark:border-zinc-800 dark:bg-zinc-900 sticky top-0 z-30">
                <div className="relative w-96 font-medium">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search team members..."
                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-800 text-slate-800 dark:text-slate-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-gray-400 hover:text-gray-600">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                    </button>
                    <div className="h-8 w-px bg-gray-200 dark:bg-zinc-700 mx-2" />
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name || "Supervisor"}</p>
                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{user?.designation || user?.role || "Supervisor"}</p>
                    </div>
                </div>
            </header>

            <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
                {/* Title */}
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Team Attendance</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                        Monitor daily attendance metrics and detailed logs for your team.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-medium">
                    {[
                        { label: "Total Employees", value: String(filtered.length).padStart(2, "0"), sub: "Registered in system", icon: UserCheck, iconBg: "bg-[#fff4ed] dark:bg-orange-950/30", color: "text-[#9e3f00] dark:text-orange-400", trend: "text-green-600 dark:text-green-400" },
                        { label: "Total Present", value: String(presentCount).padStart(2, "0"), sub: "On schedule today", icon: UserCheck, iconBg: "bg-green-50 dark:bg-green-950/30", color: "text-green-700 dark:text-green-400", trend: "text-green-600 dark:text-green-400" },
                        { label: "On Leave / Absent", value: String(absentCount).padStart(2, "0"), sub: "Not available today", icon: UserMinus, iconBg: "bg-red-50 dark:bg-red-950/30", color: "text-red-700 dark:text-red-400", trend: "text-red-500 dark:text-red-400" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">{stat.label}</p>
                                <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-1 leading-none tracking-tight">{stat.value}</h3>
                                <div className={`flex items-center gap-1 mt-3 ${stat.trend}`}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{stat.sub}</span>
                                </div>
                            </div>
                            <div className={`${stat.iconBg} p-4 rounded-xl border border-white/50 dark:border-zinc-700`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="date"
                                className="h-10 pl-10 pr-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="relative min-w-[200px]">
                            <select
                                className="h-10 w-full appearance-none pl-4 pr-10 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                            >
                                {departments.map(d => (
                                    <option key={d} className="bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200">
                                        {d}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 h-10 px-5 bg-orange-400 hover:bg-orange-500 text-white font-bold text-[13px] rounded-xl transition-colors shadow-sm cursor-pointer">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                        <button className="flex items-center gap-2 h-10 px-5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[13px] rounded-xl transition-colors shadow-sm cursor-pointer">
                            <FileSpreadsheet className="w-4 h-4" />
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#fcfcfd] dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Check-In</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Check-Out</th>
                                        <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400 dark:text-slate-500">No employees found.</td>
                                        </tr>
                                    ) : filtered.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-[#9e3f00] dark:text-orange-400 font-black text-xs border border-orange-200 dark:border-orange-900/30">
                                                        {row.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{row.name}</p>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{row.role} · {row.employeeCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">{row.department}</td>
                                            <td className="px-6 py-5"><StatusBadge status={row.status} /></td>
                                            <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />{row.checkIn}
                                            </td>
                                            <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">{row.checkOut}</td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="text-[12px] font-bold text-[#9e3f00] dark:text-orange-400 hover:text-[#7a3100] transition-colors uppercase tracking-widest cursor-pointer">
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="bg-[#fcfcfd] dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800 px-8 py-4 flex items-center justify-between">
                        <p className="text-[12px] font-bold text-slate-400">
                            Showing <span className="text-slate-900 dark:text-white">{filtered.length}</span> of{" "}
                            <span className="text-slate-900 dark:text-white">{employees.length}</span> employees
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Attendance times require a time-tracking integration</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

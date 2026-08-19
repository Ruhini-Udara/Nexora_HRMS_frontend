"use client";

import React, { useState } from "react";
import Image from "next/image";
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
} from "lucide-react";

type AttendanceStatus = "Present" | "Late" | "Absent";

interface AttendanceRecord {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: AttendanceStatus;
    checkIn: string;
    checkOut: string;
    overtime: string;
    initials?: string;
}

const ATTENDANCE_DATA: AttendanceRecord[] = [
    {
        id: "EMP-001",
        name: "James Davidson",
        role: "Sr. Operations Specialist",
        avatar: "https://i.pravatar.cc/150?img=12",
        status: "Present",
        checkIn: "08:55 AM",
        checkOut: "06:05 PM",
        overtime: "+1h 05m",
        initials: "JD",
    },
    {
        id: "EMP-002",
        name: "Alice Miller",
        role: "Sales Lead",
        avatar: "https://i.pravatar.cc/150?img=45",
        status: "Late",
        checkIn: "09:32 AM",
        checkOut: "-- : --",
        overtime: "0h 0m",
        initials: "AM",
    },
    {
        id: "EMP-003",
        name: "Robert Taylor",
        role: "Logistics Coordinator",
        avatar: "https://i.pravatar.cc/150?img=53",
        status: "Absent",
        checkIn: "-- : --",
        checkOut: "-- : --",
        overtime: "0h 0m",
        initials: "RT",
    },
    {
        id: "EMP-004",
        name: "Sarah Chen",
        role: "Junior Analyst",
        avatar: "https://i.pravatar.cc/150?img=32",
        status: "Present",
        checkIn: "08:45 AM",
        checkOut: "05:30 PM",
        overtime: "0h 0m",
    },
];

const StatusBadge = ({ status }: { status: AttendanceStatus }) => {
    const configs = {
        Present: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30",
        Late: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
        Absent: "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[12px] font-bold border ${configs[status]}`}>
            {status}
        </span>
    );
};

export default function TeamAttendancePage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState("2023-10-24");
    const [selectedDept, setSelectedDept] = useState("All Departments");

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
                    <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-zinc-900" />
                    </button>
                    <div className="h-8 w-px bg-gray-200 dark:bg-zinc-700 mx-2" />
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Supervisor Profile</p>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Operations Lead</p>
                        </div>
                        <Image
                            src="https://i.pravatar.cc/150?img=25" // Profile avatar from screenshot
                            alt="Supervisor"
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-orange-100 dark:border-zinc-700"
                        />
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
                {/* Title Section */}
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Team Attendance</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                        Monitor daily attendance metrics and detailed logs for your team.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-medium">
                    {[
                        { label: "Total Present", value: "26", sub: "On schedule", icon: UserCheck, color: "text-[#9e3f00] dark:text-orange-400", iconBg: "bg-[#fff4ed] dark:bg-orange-950/30", trend: "text-green-600 dark:text-green-400" },
                        { label: "Total Absent", value: "02", sub: "2 unplanned leaves", icon: UserMinus, color: "text-red-900 dark:text-red-400", iconBg: "bg-red-50 dark:bg-red-950/30", trend: "text-red-500 dark:text-red-400" },
                        { label: "Late Arrivals", value: "02", sub: "After 09:15 AM", icon: Clock, color: "text-amber-900 dark:text-amber-400", iconBg: "bg-amber-50 dark:bg-amber-950/30", trend: "text-amber-600 dark:text-amber-400" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">{stat.label}</p>
                                <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-1 leading-none tracking-tight">{stat.value}</h3>
                                <div className={`flex items-center gap-1 mt-3 ${stat.trend}`}>
                                    {stat.label === "Total Present" && <UserCheck className="w-3.5 h-3.5" />}
                                    {stat.label === "Total Absent" && <AlertCircle className="w-3.5 h-3.5" />}
                                    {stat.label === "Late Arrivals" && <Clock className="w-3.5 h-3.5" />}
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{stat.sub}</span>
                                </div>
                            </div>
                            <div className={`${stat.iconBg} p-4 rounded-xl border border-white/50 dark:border-zinc-700`}>
                                <stat.icon className={`w-6 h-6 ${stat.color === 'text-[#9e3f00]' ? 'text-[#9e3f00]' : stat.color}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col md:flex-row items-center gap-4">
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
                                <option className="bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200">All Departments</option>
                                <option className="bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200">Operations</option>
                                <option className="bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200">Sales</option>
                                <option className="bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200">Logistics</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 h-10 px-5 bg-orange-400 hover:bg-orange-500 text-white font-bold text-[13px] rounded-xl transition-colors shadow-sm">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                        <button className="flex items-center gap-2 h-10 px-5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[13px] rounded-xl transition-colors shadow-sm">
                            <FileSpreadsheet className="w-4 h-4" />
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#fcfcfd] dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Employee</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Check-In Time</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Check-Out Time</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Overtime</th>
                                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                                {ATTENDANCE_DATA.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                {row.initials ? (
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#9e3f00] font-black text-xs border border-orange-200">
                                                        {row.initials}
                                                    </div>
                                                ) : (
                                                    <Image
                                                        src={row.avatar}
                                                        alt={row.name}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border-2 border-white dark:border-zinc-800"
                                                    />
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{row.name}</p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{row.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={row.status} />
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-normal text-slate-600 dark:text-slate-400">{row.checkIn}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-normal text-slate-500 dark:text-slate-500 tracking-tight">{row.checkOut}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <p className={`text-sm font-normal ${row.overtime.startsWith('+') ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                                {row.overtime}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5 text-right whitespace-nowrap">
                                            <button className="text-[12px] font-bold text-[#9e3f00] hover:text-[#7a3100] transition-colors uppercase tracking-widest">
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    <div className="bg-[#fcfcfd] dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800 px-8 py-4 flex items-center justify-between">
                        <p className="text-[12px] font-bold text-slate-400">
                            Showing <span className="text-slate-900 dark:text-white">1 to 4</span> of <span className="text-slate-900 dark:text-white">30</span> employees
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors">
                                Previous
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center bg-[#9e3f00] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-900/20">
                                1
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors">
                                2
                            </button>
                            <button className="px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

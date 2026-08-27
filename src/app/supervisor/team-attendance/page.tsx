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
    CheckCircle,
    X,
} from "lucide-react";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import UserAvatar from "@/components/common/UserAvatar";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Employee {
    id: number;
    fullName: string;
    department: string;
    designation?: { designationName: string };
    employeeCode?: string;
}

type AttendanceStatus = "Present" | "On Leave" | "Absent" | "Unknown";

interface AttendanceRow {
    id: number;
    recordId?: number;
    name: string;
    role: string;
    department: string;
    employeeCode: string;
    status: AttendanceStatus;
    checkIn: string;
    checkOut: string;
    isLate?: boolean;
    warning?: string;
    approvalStatus?: string;
    remarks?: string;
    workHours?: number;
    overtimeHours?: number;
}

const StatusBadge = ({ status }: { status: AttendanceStatus }) => {
    const configs: Record<AttendanceStatus, string> = {
        Present: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30",
        "On Leave": "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
        Absent: "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30",
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
    const [attendanceLog, setAttendanceLog] = useState<any[]>([]);
    const [employeesOnLeave, setEmployeesOnLeave] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDept, setSelectedDept] = useState("All Departments");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [isClient, setIsClient] = useState(false);
    const [toast, setToast] = useState({ msg: "", on: false, type: "success" as "success" | "error" });
    const [selectedDetail, setSelectedDetail] = useState<AttendanceRow | null>(null);
    const [selectedForApproval, setSelectedForApproval] = useState<number[]>([]);
    const [isApproving, setIsApproving] = useState(false);
    const user = useAuthStore(s => s.user);

    useEffect(() => { setIsClient(true); }, []);

    const pop = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, on: true, type });
        setTimeout(() => setToast(t => ({ ...t, on: false })), 3500);
    };

    useEffect(() => {
        const loadData = async () => {
            if (!user?.employeeId && !user?.id) return;
            setLoading(true);
            try {
                const [empRes, attRes, leaveRes] = await Promise.allSettled([
                    api.get(`/api/employees?supervisorId=${user?.employeeId || user?.id}`),
                    api.get(`/api/attendance/manual?date=${selectedDate}`),
                    api.get(`/api/v1/leaves/daily-approved?date=${selectedDate}`)
                ]);

                if (empRes.status === "fulfilled") {
                    let emps = empRes.value.data;
                    if (emps.length === 0) {
                        const allEmpRes = await api.get("/api/employees");
                        emps = allEmpRes.data;
                    }
                    setEmployees(emps);
                }
                if (attRes.status === "fulfilled") setAttendanceLog(attRes.value.data);
                if (leaveRes.status === "fulfilled") {
                    setEmployeesOnLeave(leaveRes.value.data);
                }
            } catch (err) {
                console.error("Failed to load team attendance data", err);
            } finally {
                setLoading(false);
                setSelectedForApproval([]); // Reset selections on data reload
            }
        };
        loadData();
    }, [selectedDate, user?.id]);

    const handleApproveSelected = async () => {
        if (selectedForApproval.length === 0) return;
        setIsApproving(true);
        try {
            await api.post('/api/attendance/manual/supervisor/approve-multiple', selectedForApproval);
            pop("Selected requests approved successfully!");
            // Refresh data
            setSelectedForApproval([]);
            const attRes = await api.get(`/api/attendance/manual?date=${selectedDate}`);
            setAttendanceLog(attRes.data);
        } catch (err) {
            console.error("Failed to approve", err);
            pop("Failed to approve selected requests", "error");
        } finally {
            setIsApproving(false);
        }
    };

    const rows: AttendanceRow[] = employees.map(emp => {
        const code = emp.employeeCode || `EMP-${emp.id}`;
        // Map to manual attendance dto which has inDate, inTime, outDate, outTime
        const record = attendanceLog.find(a => (a.employeeCode === code || a.employeeId === emp.id) && a.status && a.status !== 'Unknown');
        
        const formatTime = (isoString?: string) => {
            if (!isoString) return "—";
            // Check if it's already a time string "HH:mm" or "HH:mm:ss"
            if (isoString.includes("T")) {
                return new Date(isoString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            }
            // Parse time string directly
            const [h, m] = isoString.split(":");
            const hr = parseInt(h, 10);
            const ampm = hr >= 12 ? 'PM' : 'AM';
            const h12 = hr % 12 || 12;
            return `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
        };

        let isLate = false;
        let warning = "";

        if (record?.inTime) {
            const [h, m] = record.inTime.split(":");
            const inDate = new Date();
            inDate.setHours(parseInt(h, 10), parseInt(m, 10), 0);
            
            // Expected shift logic based on role
            let expectedMins = 480; 
            let shiftStartHour = 8;
            let shiftStartMin = 30;
            
            const roleLower = (emp.designation?.designationName || "").toLowerCase();
            if (roleLower.includes("staff assistant")) {
                expectedMins = 510;
                shiftStartHour = 8;
                shiftStartMin = 15;
            } else if (roleLower.includes("driver")) {
                expectedMins = 540;
                shiftStartHour = 8;
                shiftStartMin = 0;
            }

            // Late check
            isLate = (inDate.getHours() > shiftStartHour) || (inDate.getHours() === shiftStartHour && inDate.getMinutes() > shiftStartMin);

            // Short leave / Half day check
            if (record.outTime) {
                const [oh, om] = record.outTime.split(":");
                const outDate = new Date();
                outDate.setHours(parseInt(oh, 10), parseInt(om, 10), 0);
                
                const diffMs = outDate.getTime() - inDate.getTime();
                if (diffMs > 0) {
                    const totalMins = Math.floor(diffMs / 60000);
                    const deficit = expectedMins - totalMins;
                    
                    if (deficit >= 240) warning = "Half Day";
                    else if (deficit >= 90) warning = "Short Leave";
                }
            }
        }

        let computedStatus: AttendanceStatus = "Unknown";
        if (record && record.status === "PRESENT") {
            computedStatus = "Present";
        } else if (employeesOnLeave.includes(emp.id)) {
            computedStatus = "On Leave";
        } else {
            computedStatus = "Absent";
        }

        return {
            id: emp.id,
            recordId: record?.id,
            name: emp.fullName,
            role: emp.designation?.designationName || "—",
            department: emp.department || "—",
            employeeCode: code,
            status: computedStatus,
            checkIn: record?.inTime ? formatTime(record.inTime) : "—",
            checkOut: record?.outTime ? formatTime(record.outTime) : "—",
            isLate,
            warning,
            approvalStatus: record?.approvalStatus || "—",
            remarks: record?.remarks || "No remarks provided.",
            workHours: record?.workHours || 0,
            overtimeHours: record?.overtimeHours || 0
        };
    });

    const departments = ["All Departments", ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];

    const filtered = rows.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDept = selectedDept === "All Departments" || r.department === selectedDept;
        return matchSearch && matchDept;
    });

    const presentCount = filtered.filter(r => r.status === "Present").length;
    const absentCount = filtered.filter(r => r.status === "On Leave" || r.status === "Absent").length;

    const exportToPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Team Attendance Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Date: ${selectedDate} | Department: ${selectedDept}`, 14, 30);

        const tableColumn = ["Employee", "Code", "Department", "Role", "Status", "Check-In", "Check-Out", "Notes"];
        const tableRows = filtered.map(row => [
            row.name,
            row.employeeCode,
            row.department,
            row.role,
            row.status,
            row.checkIn,
            row.checkOut,
            [row.isLate ? "Late" : "", row.warning].filter(Boolean).join(", ")
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
        });

        doc.save(`Team_Attendance_${selectedDate}.pdf`);
        pop("Export PDF generated successfully!");
    };

    const exportToExcel = () => {
        const worksheetData = filtered.map(row => ({
            "Employee Name": row.name,
            "Employee Code": row.employeeCode,
            "Department": row.department,
            "Role": row.role,
            "Status": row.status,
            "Check-In": row.checkIn,
            "Check-Out": row.checkOut,
            "Late Check-In": row.isLate ? "Yes" : "No",
            "Warning/Deficit": row.warning || "None"
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        
        XLSX.writeFile(workbook, `Team_Attendance_${selectedDate}.xlsx`);
        pop("Export Excel generated successfully!");
    };

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
                    <Link
                        href="/supervisor/profile"
                        className="flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 p-2 rounded-lg transition-colors cursor-pointer"
                    >
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                {isClient && user ? user.name : "Loading..."}
                            </p>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-tight">
                                {isClient && user ? (user.designation || user.role) : "Supervisor"}
                            </p>
                        </div>
                        <UserAvatar user={isClient ? user : null} size="md" />
                    </Link>
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
                        {/* Date Picker */}
                        <div className="relative">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="appearance-none text-sm font-bold text-gray-700 dark:text-slate-200 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-[#9e3f00]/20 focus:border-[#9e3f00] cursor-pointer shadow-sm transition-all w-40"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedForApproval.length > 0 && (
                            <button 
                                onClick={handleApproveSelected} 
                                disabled={isApproving}
                                className="flex items-center gap-2 h-10 px-5 bg-green-600 hover:bg-green-700 text-white font-bold text-[13px] rounded-xl transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Approve ({selectedForApproval.length})
                            </button>
                        )}
                        <button onClick={exportToPDF} className="flex items-center gap-2 h-10 px-5 bg-[#9e3f00] dark:bg-orange-600 hover:bg-[#7a3000] dark:hover:bg-orange-700 text-white font-bold text-[13px] rounded-xl transition-colors shadow-sm cursor-pointer">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                        <button onClick={exportToExcel} className="flex items-center gap-2 h-10 px-5 bg-[#9e3f00] dark:bg-orange-600 hover:bg-[#7a3000] dark:hover:bg-orange-700 text-white font-bold text-[13px] rounded-xl transition-colors shadow-sm cursor-pointer">
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
                                        <th className="px-4 py-4 w-10"></th>
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
                                            <td className="px-4 py-5 text-center">
                                                {row.approvalStatus === 'PENDING' && row.recordId && (
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                                                        checked={selectedForApproval.includes(row.recordId)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedForApproval(prev => [...prev, row.recordId!]);
                                                            } else {
                                                                setSelectedForApproval(prev => prev.filter(id => id !== row.recordId));
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </td>
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
                                            <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />{row.checkIn}
                                                    </div>
                                                    {row.isLate && <span className="text-[9px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800">Late</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex flex-col items-start gap-1">
                                                    {row.checkOut}
                                                    {row.warning && <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">{row.warning}</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => setSelectedDetail(row)}
                                                    className="text-[12px] font-bold text-[#9e3f00] dark:text-orange-400 hover:text-[#7a3100] transition-colors uppercase tracking-widest cursor-pointer"
                                                >
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

            {/* ── Details Modal ──────────────────────────────────────────────────────── */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-[#f8f9fa] dark:bg-zinc-800/50">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Attendance Details</h3>
                            <button onClick={() => setSelectedDetail(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-[#9e3f00] dark:text-orange-400 font-black text-lg border border-orange-200 dark:border-orange-900/30">
                                    {selectedDetail.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">{selectedDetail.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedDetail.role} · {selectedDetail.department}</p>
                                </div>
                                <div className="ml-auto">
                                    <StatusBadge status={selectedDetail.status} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Check-In</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.checkIn}</p>
                                    {selectedDetail.isLate && <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800">Late</span>}
                                </div>
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Check-Out</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.checkOut}</p>
                                    {selectedDetail.warning && <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">{selectedDetail.warning}</span>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Work Hours</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.workHours} hrs</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Overtime</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.overtimeHours} hrs</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Approval Status</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.approvalStatus}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Remarks</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
                                    {selectedDetail.remarks}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toast ──────────────────────────────────────────────────────── */}
            {toast.on && (
                <div className={`fixed bottom-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 ${toast.type === "error" ? "bg-red-900" : "bg-gray-900"} text-white text-[13px] font-medium px-5 py-3 rounded-full shadow-2xl`}>
                    <div className={`w-5 h-5 rounded-full ${toast.type === "error" ? "bg-red-500" : "bg-green-500"} flex items-center justify-center flex-shrink-0`}>
                        {toast.type === "error" ? <X className="w-3 h-3 text-white" /> : <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span>{toast.msg}</span>
                </div>
            )}
        </div>
    );
}

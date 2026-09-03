"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Calendar,
    Download,
    FileSpreadsheet,
    Clock,
    UserCheck,
    UserMinus,
    AlertCircle,
    Loader2,
    CheckCircle,
    X,
    Users,
} from "lucide-react";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import SupervisorSummaryCard from "@/components/supervisor/SupervisorSummaryCard";
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
        Present: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
        "On Leave": "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
        Absent: "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50",
        Unknown: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${configs[status]}`}>
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
    const [toast, setToast] = useState({ msg: "", on: false, type: "success" as "success" | "error" });
    const [selectedDetail, setSelectedDetail] = useState<AttendanceRow | null>(null);
    const [selectedForApproval, setSelectedForApproval] = useState<number[]>([]);
    const [isApproving, setIsApproving] = useState(false);
    const user = useAuthStore(s => s.user);

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
    }, [selectedDate, user?.id, user?.employeeId]);

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
        const record = attendanceLog.find(a => (a.employeeCode === code || a.employeeId === emp.id) && a.status && a.status !== 'Unknown');
        
        const formatTime = (isoString?: string) => {
            if (!isoString) return "—";
            if (isoString.includes("T")) {
                return new Date(isoString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            }
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

            isLate = (inDate.getHours() > shiftStartHour) || (inDate.getHours() === shiftStartHour && inDate.getMinutes() > shiftStartMin);

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

    const totalMembersCount = employees.length;
    const presentCount = filtered.filter(r => r.status === "Present").length;
    const onLeaveCount = filtered.filter(r => r.status === "On Leave").length;
    const absentCount = filtered.filter(r => r.status === "Absent").length;
    const lateCount = filtered.filter(r => r.isLate).length;
    const presencePercentage = totalMembersCount > 0 ? Math.round((presentCount / totalMembersCount) * 100) : 0;

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
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 space-y-6">
            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Team Attendance</h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Monitor daily attendance metrics and detailed logs for your team.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportToPDF} className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary hover:bg-[#7a3000] text-white font-semibold text-sm rounded-lg transition-colors shadow-sm cursor-pointer">
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                    <button onClick={exportToExcel} className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-lg transition-colors shadow-sm cursor-pointer">
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* ── Summary Stats ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <SupervisorSummaryCard
                    title="Total Team"
                    value={String(totalMembersCount)}
                    subtext="Assigned team roster"
                    icon={Users}
                    variant="primary"
                />
                <SupervisorSummaryCard
                    title="Present Today"
                    value={String(presentCount)}
                    subtext={
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {presencePercentage}% present rate
                        </span>
                    }
                    icon={UserCheck}
                    variant="emerald"
                />
                <SupervisorSummaryCard
                    title="On Leave"
                    value={String(onLeaveCount)}
                    subtext="Approved leave today"
                    icon={Calendar}
                    variant="amber"
                />
                <SupervisorSummaryCard
                    title="Absent / Late"
                    value={String(absentCount)}
                    subtext={
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <UserMinus className="w-3.5 h-3.5" />
                            {lateCount > 0 ? `${lateCount} late arrival(s)` : `${absentCount} unavailable`}
                        </span>
                    }
                    icon={UserMinus}
                    variant="rose"
                />
            </div>

            {/* ── Filter Bar ──────────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search team members..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Department Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Department:</span>
                    <select
                        className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        {departments.map(d => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Date:</span>
                    <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                        <Calendar className="w-4 h-4 text-primary dark:text-orange-400 mr-2 flex-shrink-0" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-transparent border-none outline-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Batch Action */}
                {selectedForApproval.length > 0 && (
                    <div className="ml-auto">
                        <button 
                            onClick={handleApproveSelected} 
                            disabled={isApproving}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Approve ({selectedForApproval.length})
                        </button>
                    </div>
                )}
            </div>

            {/* ── Table ───────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-sm font-medium">Loading team attendance...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4 w-10 text-center"></th>
                                    <th className="py-3.5 px-6">Employee</th>
                                    <th className="py-3.5 px-6">Department</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6">Check-In</th>
                                    <th className="py-3.5 px-6">Check-Out</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-slate-400 dark:text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <CheckCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                                                <span className="text-base font-semibold text-slate-700 dark:text-slate-300">No employees found</span>
                                                <span className="text-sm text-slate-400">No attendance logs matching current filters.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                                        <td className="py-4 px-4 text-center">
                                            {row.approvalStatus === 'PENDING' && row.recordId && (
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
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
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                    {row.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white leading-tight">{row.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{row.role} · {row.employeeCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{row.department}</td>
                                        <td className="py-4 px-6"><StatusBadge status={row.status} /></td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />{row.checkIn}
                                                </div>
                                                {row.isLate && <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">Late</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{row.checkOut}</span>
                                                {row.warning && <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800/50">{row.warning}</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button 
                                                onClick={() => setSelectedDetail(row)}
                                                className="text-xs font-semibold text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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

                {/* Table Footer */}
                <div className="bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <p className="font-medium">
                        Showing <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span> of{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">{employees.length}</span> team members
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Daily logs update in real-time</span>
                    </div>
                </div>
            </div>

            {/* ── Details Modal ────────────────────────────────────────── */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance Details</h3>
                            <button onClick={() => setSelectedDetail(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {selectedDetail.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedDetail.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedDetail.role} · {selectedDetail.department}</p>
                                </div>
                                <div className="ml-auto">
                                    <StatusBadge status={selectedDetail.status} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-In</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.checkIn}</p>
                                    {selectedDetail.isLate && <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">Late</span>}
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-Out</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.checkOut}</p>
                                    {selectedDetail.warning && <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800/50">{selectedDetail.warning}</span>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Work Hours</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.workHours} hrs</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Overtime</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.overtimeHours} hrs</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Approval Status</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.approvalStatus}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Remarks</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                    {selectedDetail.remarks}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toast ────────────────────────────────────────────────── */}
            {toast.on && (
                <div className={`fixed bottom-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 ${toast.type === "error" ? "bg-red-900" : "bg-slate-900"} text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl`}>
                    <div className={`w-5 h-5 rounded-full ${toast.type === "error" ? "bg-red-500" : "bg-green-500"} flex items-center justify-center flex-shrink-0`}>
                        {toast.type === "error" ? <X className="w-3.5 h-3.5 text-white" /> : <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span>{toast.msg}</span>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import {
    Search,
    Calendar,
    ArrowLeftRight,
    X,
    Clock,
    LogIn,
    LogOut,
    CheckCircle,
    XCircle,
    Undo2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AttendanceStatus = "Present" | "Absent" | "Pending" | null;

interface Employee {
    id: string;
    name: string;
    role: string;
    avatarUrl: string;
    status: AttendanceStatus;
    inTime: string;
    outTime: string;
    isActiveShift?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialEmployees: Employee[] = [
    {
        id: "HRM-204",
        name: "Marcus Thorne",
        role: "Warehouse Associate",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
        status: "Present",
        inTime: "08:00 AM",
        outTime: "05:00 PM",
    },
    {
        id: "HRM-312",
        name: "Elena Rodriguez",
        role: "Shift Supervisor",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
        status: "Present",
        inTime: "08:15 AM",
        outTime: "05:05 PM",
        isActiveShift: true,
    },
    {
        id: "HRM-189",
        name: "Jon Wu",
        role: "Clerk",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jon",
        status: "Absent",
        inTime: "",
        outTime: "",
    },
    {
        id: "HRM-421",
        name: "David Wilson",
        role: "Security Officer",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        status: null,
        inTime: "08:00 AM",
        outTime: "05:00 PM",
    },
    {
        id: "HRM-115",
        name: "Leila Samari",
        role: "Data Analyst",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leila",
        status: null,
        inTime: "08:00 AM",
        outTime: "05:00 PM",
    },
    {
        id: "HRM-672",
        name: "Robert Vance",
        role: "Quality Inspector",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
        status: null,
        inTime: "08:00 AM",
        outTime: "05:00 PM",
    },
];

// ─── Helper: Calculate Work Hours ─────────────────────────────────────────────
function calcWorkHours(inTime: string, outTime: string) {
    if (!inTime || !outTime) return { label: "—", overtime: "" };
    const parse = (t: string) => {
        const [time, meridiem] = t.split(" ");
        let [h, m] = time.split(":").map(Number);
        if (meridiem === "PM" && h !== 12) h += 12;
        if (meridiem === "AM" && h === 12) h = 0;
        return h * 60 + m;
    };
    const totalMins = parse(outTime) - parse(inTime);
    if (totalMins <= 0) return { label: "—", overtime: "" };
    const shift = 8 * 60; // standard 8h shift
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const overtimeMins = totalMins - shift;
    const ot =
        overtimeMins > 0
            ? `Overtime: +${Math.floor(overtimeMins / 60)}h ${overtimeMins % 60}m`
            : "";
    return { label: `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`, overtime: ot };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ManualAttendancePage() {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [customInTime, setCustomInTime] = useState("");
    const [customOutTime, setCustomOutTime] = useState("");
    const [remarks, setRemarks] = useState("");
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({
        message: "",
        visible: false,
    });
    const [quickUpdateMode, setQuickUpdateMode] = useState(true);

    // Derived stats
    const presentCount = employees.filter((e) => e.status === "Present").length;
    const absentCount = employees.filter((e) => e.status === "Absent").length;
    const pendingCount = employees.filter((e) => e.status === null || e.status === "Pending").length;

    const filteredEmployees = employees.filter(
        (e) =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Set status for an employee
    const setStatus = (id: string, status: AttendanceStatus) => {
        setEmployees((prev) =>
            prev.map((e) => (e.id === id ? { ...e, status } : e))
        );
    };

    // Mark all present
    const markAllPresent = () => {
        setEmployees((prev) => prev.map((e) => ({ ...e, status: "Present" })));
        showToast("All employees marked as Present.");
    };

    // Open custom entry panel
    const openCustomEntry = (emp: Employee) => {
        setSelectedEmployee(emp);
        setCustomInTime(emp.inTime || "08:00 AM");
        setCustomOutTime(emp.outTime || "05:00 PM");
        setRemarks("");
    };

    // Save custom entry
    const saveEntry = () => {
        if (!selectedEmployee) return;
        setEmployees((prev) =>
            prev.map((e) =>
                e.id === selectedEmployee.id
                    ? { ...e, inTime: customInTime, outTime: customOutTime, status: "Present" }
                    : e
            )
        );
        showToast(`${selectedEmployee.name}'s time entry updated successfully.`);
        setSelectedEmployee(null);
    };

    // Toast helper
    const showToast = (message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast({ message: "", visible: false }), 3500);
    };

    const workHours = calcWorkHours(customInTime, customOutTime);

    return (
        <div className="min-h-screen bg-[#f9fafb] flex flex-col relative">
            {/* ── Top Bar ────────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4 sticky top-0 z-40">
                {/* Title */}
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Manual Attendance</h1>
                    {quickUpdateMode && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                            ⚡ QUICK UPDATE MODE
                        </span>
                    )}
                </div>

                {/* Search */}
                <div className="relative ml-auto w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employee..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/30 focus:border-[#9e3f00]"
                    />
                </div>

                {/* Bell */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.437L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full ring-2 ring-white" />
                </button>

                {/* Profile */}
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">Sarah Jenkins</p>
                        <p className="text-xs text-gray-500">Operations Lead</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#9e3f00] flex items-center justify-center text-white font-bold text-sm">
                        SJ
                    </div>
                </div>
            </div>

            {/* ── Filter / Action Bar ────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4">
                {/* Dept tag */}
                <span className="text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
                    Operations Dept
                </span>

                {/* Shift tag */}
                <span className="text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
                    Morning Shift (08:00 – 17:00)
                </span>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Oct 24, 2023
                </div>

                <div className="ml-auto flex items-center gap-3">
                    {/* Mark All Present */}
                    <button
                        onClick={markAllPresent}
                        className="flex items-center gap-2 text-sm font-semibold text-[#9e3f00] border border-[#9e3f00]/30 rounded-lg px-4 py-2 hover:bg-[#9e3f00]/5 transition-colors"
                    >
                        <ArrowLeftRight className="w-4 h-4" />
                        Mark All Present
                    </button>

                    {/* Submit */}
                    <button
                        onClick={() => showToast("Attendance submitted successfully!")}
                        className="flex items-center gap-2 text-sm font-bold text-white bg-[#9e3f00] rounded-lg px-5 py-2 hover:bg-[#7a3000] transition-colors shadow-sm"
                    >
                        Submit Updates
                    </button>
                </div>
            </div>

            {/* ── Main Content ───────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Employee Grid */}
                <div
                    className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${selectedEmployee ? "blur-[1px] pointer-events-none select-none" : ""}`}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredEmployees.map((emp) => (
                            <EmployeeCard
                                key={emp.id}
                                employee={emp}
                                onSetStatus={setStatus}
                                onCustomTime={() => openCustomEntry(emp)}
                                isSelected={selectedEmployee?.id === emp.id}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Custom Entry Panel ─────────────────────────────────── */}
                {selectedEmployee && (
                    <div className="w-[370px] bg-white border-l border-gray-200 flex flex-col shadow-xl overflow-y-auto">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <div>
                                <p className="font-bold text-gray-900 text-base">Custom Entry</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Adjusting attendance for 1 employee
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedEmployee(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Employee Info Card */}
                        <div className="px-6 py-4">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <img
                                    src={selectedEmployee.avatarUrl}
                                    alt={selectedEmployee.name}
                                    className="w-12 h-12 rounded-full border-2 border-white shadow"
                                />
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">
                                        {selectedEmployee.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {selectedEmployee.id} · {selectedEmployee.role}
                                    </p>
                                    {selectedEmployee.isActiveShift && (
                                        <span className="inline-block mt-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                                            ACTIVE SHIFT
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Time Inputs */}
                        <div className="px-6 pb-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                                    In Time
                                </label>
                                <div className="relative">
                                    <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={customInTime}
                                        onChange={(e) => setCustomInTime(e.target.value)}
                                        placeholder="08:00 AM"
                                        className="w-full pl-9 pr-3 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/30 focus:border-[#9e3f00]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                                    Out Time
                                </label>
                                <div className="relative">
                                    <LogOut className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={customOutTime}
                                        onChange={(e) => setCustomOutTime(e.target.value)}
                                        placeholder="05:00 PM"
                                        className="w-full pl-9 pr-3 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/30 focus:border-[#9e3f00]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="px-6 pb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                                Reason / Remarks
                            </label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="e.g. Late entry due to transport delay..."
                                rows={3}
                                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/30 focus:border-[#9e3f00] text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        {/* Calculated Work Hours */}
                        <div className="px-6 pb-4">
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                                        Calculated Work Hours
                                    </p>
                                </div>
                                <div className="flex items-end justify-between">
                                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                        {workHours.label}
                                    </p>
                                    {workHours.overtime && (
                                        <p className="text-xs font-semibold text-amber-600">
                                            {workHours.overtime}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6 mt-auto flex flex-col gap-3">
                            <button
                                onClick={() => setSelectedEmployee(null)}
                                className="w-full py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEntry}
                                className="w-full py-2.5 rounded-lg bg-[#9e3f00] text-white text-sm font-bold hover:bg-[#7a3000] transition-colors shadow-sm"
                            >
                                Save Entry
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Status Bar ─────────────────────────────────────────────── */}
            <div className="bg-white border-t border-gray-200 px-8 py-3 flex items-center justify-between text-xs text-gray-500 sticky bottom-0">
                <div className="flex items-center gap-5">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                        <strong className="text-gray-700">{presentCount.toString().padStart(2, "0")}</strong> Present
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                        <strong className="text-gray-700">{absentCount.toString().padStart(2, "0")}</strong> Absent
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                        <strong className="text-gray-700">{pendingCount.toString().padStart(2, "0")}</strong> Pending
                    </span>
                </div>
                <span>Last updated: 5 minutes ago</span>
            </div>

            {/* ── Toast Notification ─────────────────────────────────────── */}
            {toast.visible && (
                <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-2xl animate-fade-in-up">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{toast.message}</span>
                    <button className="text-gray-400 hover:text-white ml-1">
                        <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-gray-400 text-xs">Undo</span>
                </div>
            )}
        </div>
    );
}

// ─── Employee Card Sub-Component ──────────────────────────────────────────────
function EmployeeCard({
    employee,
    onSetStatus,
    onCustomTime,
    isSelected,
}: {
    employee: Employee;
    onSetStatus: (id: string, status: AttendanceStatus) => void;
    onCustomTime: () => void;
    isSelected: boolean;
}) {
    const { id, name, role, avatarUrl, status } = employee;

    return (
        <div
            className={`bg-white rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md p-5 flex flex-col gap-4 ${isSelected
                    ? "border-[#9e3f00] shadow-[0_0_0_3px_rgba(158,63,0,0.15)]"
                    : "border-gray-100 hover:border-gray-200"
                }`}
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img
                        src={avatarUrl}
                        alt={name}
                        className="w-12 h-12 rounded-full border-2 border-gray-100 object-cover bg-gray-100"
                    />
                    {status === "Present" && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{name}</p>
                    <p className="text-xs text-gray-500 truncate">{id}</p>
                    <p className="text-xs text-[#9e3f00] font-medium truncate">{role}</p>
                </div>
            </div>

            {/* Status Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => onSetStatus(id, "Present")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${status === "Present"
                            ? "bg-green-50 border-green-400 text-green-700 shadow-sm"
                            : "border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600 hover:bg-green-50"
                        }`}
                >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Present
                </button>
                <button
                    onClick={() => onSetStatus(id, "Absent")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${status === "Absent"
                            ? "bg-red-50 border-red-400 text-red-600 shadow-sm"
                            : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
                        }`}
                >
                    <XCircle className="w-3.5 h-3.5" />
                    Absent
                </button>
            </div>

            {/* Custom Time Button */}
            <button
                onClick={onCustomTime}
                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg border border-[#9e3f00]/30 text-[#9e3f00] text-xs font-bold hover:bg-[#9e3f00]/5 transition-colors"
            >
                <Clock className="w-3.5 h-3.5" />
                Custom Time
            </button>
        </div>
    );
}

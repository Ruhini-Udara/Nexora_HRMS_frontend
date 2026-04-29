"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Search, Bell, Calendar, ArrowLeftRight,
    X, Clock, LogIn, LogOut, CheckCircle, PenLine, ChevronDown, Loader2
} from "lucide-react";
import api from "@/lib/axiosInstance";

type Status = "Present" | "Absent" | "Late" | "Half_Day" | null;

interface EmployeeAttendance {
    id?: number; // Attendance record ID
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    role: string;
    department: string;
    shiftName?: string;
    status: Status;
    inTime: string;
    outTime: string;
    remarks: string;
    isActiveShift?: boolean;
}

interface Shift {
    id: number;
    shiftName: string;
    startTime: string;
    endTime: string;
}

export default function ManualAttendancePage() {
    const [emps, setEmps] = useState<EmployeeAttendance[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [q, setQ] = useState("");
    const [department, setDepartment] = useState("All Departments");
    const [selectedShiftId, setSelectedShiftId] = useState<number | "all">("all");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    
    const [sel, setSel] = useState<EmployeeAttendance | null>(null);
    const [inT, setInT] = useState("");
    const [outT, setOutT] = useState("");
    const [rem, setRem] = useState("");
    const [toast, setToast] = useState({ msg: "", on: false, type: "success" as "success" | "error" });

    // Extract unique departments from the loaded employees to ensure filters always match data
    const departments = useMemo(() => {
        const unique = Array.from(new Set(emps.map(e => e.department)));
        return ["All Departments", ...unique.filter(d => d && d.trim() !== "")];
    }, [emps]);

    // Fetch shifts on mount
    useEffect(() => {
        const fetchShifts = async () => {
            try {
                const res = await api.get("/api/attendance/shifts");
                setShifts(res.data);
            } catch (err) {
                console.error("Failed to fetch shifts", err);
            }
        };
        fetchShifts();
    }, []);

    // Fetch attendance data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/attendance/manual`, {
                params: {
                    date,
                    department: department === "All Departments" ? "" : department
                }
            });
            
            const mapped: EmployeeAttendance[] = res.data.map((item: any) => ({
                id: item.id,
                employeeId: item.employeeId,
                employeeCode: item.employeeCode,
                employeeName: item.employeeName,
                role: item.designation,
                department: item.department,
                shiftName: item.shiftName,
                status: item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase() as Status) : null,
                inTime: item.inTime ? formatTime(item.inTime) : "",
                outTime: item.outTime ? formatTime(item.outTime) : "",
                remarks: item.remarks || "",
                isActiveShift: false 
            }));
            
            setEmps(mapped);
        } catch (err) {
            pop("Failed to load attendance data", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [date, department]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    function formatTime(timeStr: string) {
        if (!timeStr) return "";
        const [h, m] = timeStr.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const h12 = hour % 12 || 12;
        return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
    }

    function parseTimeForBackend(timeStr: string) {
        if (!timeStr) return null;
        const [time, ampm] = timeStr.split(" ");
        let [h, m] = time.split(":").map(Number);
        if (ampm === "PM" && h !== 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    // Fixed Filter Logic: 
    // 1. Search name/code
    // 2. Shift filtering: If an employee has a shift name, it must match. 
    //    If they DON'T have a shift name (unmarked), we show them anyway so the supervisor can mark them for THIS shift.
    const list = emps.filter(e => {
        const matchSearch = e.employeeName.toLowerCase().includes(q.toLowerCase()) || e.employeeCode.toLowerCase().includes(q.toLowerCase());
        
        const targetShiftName = shifts.find(s => s.id === selectedShiftId)?.shiftName;
        const matchShift = selectedShiftId === "all" || !e.shiftName || e.shiftName === targetShiftName;
        
        return matchSearch && matchShift;
    });

    const pc = emps.filter(e => e.status === "Present").length;
    const ac = emps.filter(e => e.status === "Absent").length;
    const nd = emps.filter(e => e.status === null).length;

    const setStatus = (empId: number, s: Status) =>
        setEmps(p => p.map(e => e.employeeId === empId ? { ...e, status: s } : e));

    const markAll = () => {
        setEmps(p => p.map(e => ({ ...e, status: "Present" as Status })));
        pop("All employees marked as Present locally. Click Submit to save.");
    };

    const open = (emp: EmployeeAttendance) => {
        setSel(emp);
        setInT(emp.inTime || "08:00 AM");
        setOutT(emp.outTime || "05:00 PM");
        setRem(emp.remarks || "");
    };

    const saveEntry = () => {
        if (!sel) return;
        setEmps(p => p.map(e => e.employeeId === sel.employeeId ? { 
            ...e, 
            inTime: inT, 
            outTime: outT, 
            remarks: rem,
            status: "Present" 
        } : e));
        pop(`${sel.employeeName}'s time entry updated locally.`);
        setSel(null);
    };

    const submitAll = async () => {
        if (selectedShiftId === "all") {
            pop("Please select a specific shift before submitting", "error");
            return;
        }
        
        setSubmitting(true);
        try {
            const storage = localStorage.getItem('nexora-auth-storage');
            const supervisorId = storage ? JSON.parse(storage).state?.user?.id : 1;

            const payload = {
                attendanceDate: date,
                shiftId: selectedShiftId,
                submittedBy: supervisorId,
                records: emps.filter(e => e.status !== null).map(e => ({
                    employeeId: e.employeeId,
                    status: e.status?.toUpperCase(),
                    inTime: e.status === "Present" ? parseTimeForBackend(e.inTime) : null,
                    outTime: e.status === "Present" ? parseTimeForBackend(e.outTime) : null,
                    remarks: e.remarks
                }))
            };

            await api.post("/api/attendance/manual/submit", payload);
            pop("Attendance data synced with Supabase successfully!");
            fetchData();
        } catch (err) {
            pop("Failed to save attendance", "error");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const pop = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, on: true, type });
        setTimeout(() => setToast(t => ({ ...t, on: false })), 3500);
    };

    const wh = (inT && outT) ? (
        (() => {
            const parse = (t: string) => {
                const [time, mer] = t.split(" ");
                const [hRaw, m] = time.split(":").map(Number);
                let h = hRaw;
                if (mer === "PM" && h !== 12) h += 12;
                if (mer === "AM" && h === 12) h = 0;
                return h * 60 + m;
            };
            const total = parse(outT) - parse(inT);
            if (total <= 0) return { label: "—", ot: "" };
            const h = Math.floor(total / 60), m = total % 60;
            const ex = total - 480;
            return {
                label: `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`,
                ot: ex > 0 ? `Overtime: +${Math.floor(ex / 60)}h ${ex % 60}m` : "",
            };
        })()
    ) : { label: "—", ot: "" };

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-[#f9fafb]">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <header className="flex-shrink-0 bg-white border-b border-gray-200 px-8 h-[65px] flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Manual Attendance</h1>
                    <span className="text-[10px] font-extrabold tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-[5px] rounded-full uppercase">
                        ⚡ Quick Update Mode
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="Search employee..."
                            className="w-52 pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/15 focus:border-[#9e3f00]/50"
                        />
                    </div>
                    <button className="relative p-2 text-gray-400 hover:text-gray-700">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 ring-2 ring-white" />
                    </button>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex items-center gap-2.5">
                        <div className="text-right">
                            <p className="text-[13px] font-semibold text-gray-800 leading-tight">Sarah Jenkins</p>
                            <p className="text-[11px] text-gray-500 leading-tight">Operations Lead</p>
                        </div>
                        <img
                            src="https://i.pravatar.cc/150?img=23"
                            alt="Sarah Jenkins"
                            className="w-10 h-10 rounded-full border-2 border-gray-100 bg-gray-100"
                        />
                    </div>
                </div>
            </header>

            {/* ── Action Bar ─────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 bg-white border-b border-gray-100 px-8 h-[54px] flex items-center gap-2 overflow-x-auto">
                {/* Department Filter */}
                <div className="relative flex-shrink-0">
                    <select
                        id="dept-filter"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="appearance-none text-[13px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/20 focus:border-[#9e3f00]/50 cursor-pointer hover:border-[#9e3f00]/40 transition-colors"
                    >
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>

                {/* Shift Filter */}
                <div className="relative flex-shrink-0">
                    <select
                        id="shift-filter"
                        value={selectedShiftId}
                        onChange={e => setSelectedShiftId(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="appearance-none text-[13px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/20 focus:border-[#9e3f00]/50 cursor-pointer hover:border-[#9e3f00]/40 transition-colors"
                    >
                        <option value="all">All Shifts</option>
                        {shifts.map(s => <option key={s.id} value={s.id}>{s.shiftName}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>

                {/* Date Filter */}
                <div className="relative flex-shrink-0 flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#9e3f00]/40 transition-colors focus-within:ring-2 focus-within:ring-[#9e3f00]/20 focus-within:border-[#9e3f00]/50">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                        id="date-filter"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="text-[13px] font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                    />
                </div>

                {/* Active filter badges */}
                {(department !== "All Departments" || selectedShiftId !== "all") && (
                    <span className="flex-shrink-0 text-[11px] font-semibold text-[#9e3f00] bg-[#9e3f00]/8 border border-[#9e3f00]/20 px-2.5 py-1 rounded-full">
                        {list.length} result{list.length !== 1 ? "s" : ""}
                    </span>
                )}

                <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                    <button onClick={markAll} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#9e3f00] border border-[#9e3f00]/25 rounded-lg px-4 py-[7px] hover:bg-[#9e3f00]/5 transition-colors">
                        <ArrowLeftRight className="w-3.5 h-3.5" /> Mark All Present
                    </button>
                    <button 
                        onClick={submitAll} 
                        disabled={submitting}
                        className="flex items-center gap-2 text-[13px] font-bold text-white bg-[#9e3f00] rounded-lg px-5 py-[7px] hover:bg-[#7a3000] transition-colors shadow-sm disabled:opacity-70"
                    >
                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {submitting ? "Saving..." : "Submit Updates"}
                    </button>
                </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0">

                {/* Card Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                            <Loader2 className="w-10 h-10 animate-spin text-[#9e3f00]/40" />
                            <p className="text-sm font-medium">Loading attendance sheet...</p>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                            <Search className="w-10 h-10 opacity-20" />
                            <p className="text-sm font-medium">No employees found for this selection</p>
                            <p className="text-xs text-gray-500">Try changing filters or searching for another name</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {list.map(emp => (
                                <Card
                                    key={emp.employeeId}
                                    emp={emp}
                                    selected={sel?.employeeId === emp.employeeId}
                                    onStatus={setStatus}
                                    onCustom={() => open(emp)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Custom Entry Panel */}
                {sel && (
                    <aside className="w-[360px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-y-auto shadow-xl">
                        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <p className="font-bold text-gray-900 text-[15px]">Custom Entry</p>
                                <p className="text-xs text-gray-500 mt-0.5">Adjusting attendance for 1 employee</p>
                            </div>
                            <button onClick={() => setSel(null)} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5 px-6 py-5 flex-1">
                            {/* Employee chip */}
                            <div className="flex items-center gap-3 bg-[#fdf9f7] border border-[#9e3f00]/10 rounded-xl p-4">
                                <div className="w-12 h-12 rounded-full bg-[#9e3f00]/10 border-2 border-white shadow-sm flex items-center justify-center text-[#9e3f00] font-bold text-lg flex-shrink-0">
                                    {sel.employeeName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{sel.employeeName}</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">ID: {sel.employeeCode} · {sel.role}</p>
                                    {sel.isActiveShift && (
                                        <span className="inline-block mt-1.5 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full tracking-wide">
                                            ACTIVE SHIFT
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Time inputs */}
                            <div className="grid grid-cols-2 gap-3">
                                {([
                                    { label: "In Time", val: inT, set: setInT, Icon: LogIn, ph: "08:00 AM" },
                                    { label: "Out Time", val: outT, set: setOutT, Icon: LogOut, ph: "05:00 PM" },
                                ] as const).map(({ label, val, set, Icon, ph }) => (
                                    <div key={label}>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
                                        <div className="relative">
                                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                                                className="w-full pl-9 pr-2 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/15 focus:border-[#9e3f00]/60" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Remarks */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Reason / Remarks</p>
                                <textarea value={rem} onChange={e => setRem(e.target.value)} rows={3}
                                    placeholder="e.g. Late entry due to transport delay..."
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/15 focus:border-[#9e3f00]/60 placeholder-gray-400 text-gray-700" />
                            </div>

                            {/* Work Hours */}
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Calculated Work Hours</p>
                                </div>
                                <div className="flex items-end justify-between">
                                    <p className="text-4xl font-black text-gray-900 leading-none tracking-tight">{wh.label}</p>
                                    {wh.ot && <p className="text-xs font-semibold text-amber-600 mb-1">{wh.ot}</p>}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col gap-2.5 mt-auto">
                                <button onClick={() => setSel(null)}
                                    className="w-full py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={saveEntry}
                                    className="w-full py-2.5 text-sm font-bold text-white bg-[#9e3f00] rounded-xl hover:bg-[#7a3000] transition-colors">
                                    Save Entry
                                </button>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* ── Status Bar ─────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 h-10 bg-white border-t border-gray-200 px-8 flex items-center justify-between">
                <div className="flex items-center gap-6 text-xs">
                    {[
                        { dot: "bg-green-500", n: pc, lbl: "Present" },
                        { dot: "bg-red-400", n: ac, lbl: "Absent" },
                        { dot: "bg-amber-400", n: nd, lbl: "Pending" },
                    ].map(({ dot, n, lbl }) => (
                        <span key={lbl} className="flex items-center gap-1.5 text-gray-600">
                            <span className={`w-2 h-2 rounded-full ${dot}`} />
                            <strong className="text-gray-800">{String(n).padStart(2, "0")}</strong> {lbl}
                        </span>
                    ))}
                </div>
                <span className="text-xs text-gray-500">
                    {emps.length > 0 ? `Showing ${emps.length} total employees` : "No data available"}
                </span>
            </div>

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

// ── Employee Card ─────────────────────────────────────────────────────────────
function Card({ emp, selected, onStatus, onCustom }: {
    emp: EmployeeAttendance;
    selected: boolean;
    onStatus: (id: number, s: Status) => void;
    onCustom: () => void;
}) {
    return (
        <div className={`relative bg-white rounded-2xl border-2 flex flex-col gap-3.5 p-5 transition-all duration-200 ${selected
            ? "border-[#9e3f00] shadow-[0_0_0_4px_rgba(158,63,0,0.07)]"
            : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
            }`}>
            {/* Edit badge */}
            {selected && (
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#9e3f00] rounded-full flex items-center justify-center shadow-md z-10">
                    <PenLine className="w-3 h-3 text-white" />
                </div>
            )}

            {/* Avatar + Info */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-50 border-2 border-gray-100 flex-shrink-0 flex items-center justify-center text-[#9e3f00] font-bold">
                    {emp.employeeName.charAt(0)}
                </div>
                <div className="min-w-0">
                    <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">{emp.employeeName}</p>
                    <p className="text-[11px] text-gray-400 leading-tight">ID: {emp.employeeCode}</p>
                    <p className="text-[11px] text-[#9e3f00] font-semibold leading-tight truncate">{emp.role}</p>
                </div>
            </div>

            {/* Present / Absent */}
            <div className="flex gap-2">
                <button onClick={() => onStatus(emp.employeeId, "Present")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-lg text-xs font-semibold border transition-all ${emp.status === "Present"
                        ? "bg-green-50 border-green-400 text-green-700"
                        : "bg-white border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600 hover:bg-green-50"
                        }`}>
                    <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${emp.status === "Present" ? "bg-green-500" : "bg-gray-300"}`} />
                    Present
                </button>
                <button onClick={() => onStatus(emp.employeeId, "Absent")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-lg text-xs font-semibold border transition-all ${emp.status === "Absent"
                        ? "bg-red-50 border-red-400 text-red-600"
                        : "bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
                        }`}>
                    <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${emp.status === "Absent" ? "bg-red-500" : "bg-gray-300"}`} />
                    Absent
                </button>
            </div>

            {/* Custom Time */}
            <button onClick={onCustom}
                className={`w-full flex items-center justify-center gap-2 py-[7px] rounded-lg text-xs font-semibold border transition-all ${selected
                    ? "bg-[#9e3f00] border-[#9e3f00] text-white"
                    : "bg-white border-[#9e3f00]/30 text-[#9e3f00] hover:bg-[#9e3f00]/5"
                    }`}>
                <Clock className="w-3.5 h-3.5" />
                Custom Time
            </button>
        </div>
    );
}

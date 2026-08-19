"use client";

import { useState } from "react";
import {
    Search, Bell, Calendar, ArrowLeftRight,
    X, Clock, LogIn, LogOut, CheckCircle, PenLine,
} from "lucide-react";

type Status = "Present" | "Absent" | null;

interface Employee {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: Status;
    inTime: string;
    outTime: string;
    isActiveShift?: boolean;
}

const EMPLOYEES: Employee[] = [
    { id: "HRM-204", name: "Marcus Thorne", role: "Warehouse Associate", avatar: "https://i.pravatar.cc/150?img=11", status: "Present", inTime: "08:00 AM", outTime: "05:00 PM" },
    { id: "HRM-312", name: "Elena Rodriguez", role: "Shift Supervisor", avatar: "https://i.pravatar.cc/150?img=47", status: "Present", inTime: "08:15 AM", outTime: "05:05 PM", isActiveShift: true },
    { id: "HRM-189", name: "Jon Wu", role: "Clerk", avatar: "https://i.pravatar.cc/150?img=53", status: "Absent", inTime: "", outTime: "" },
    { id: "HRM-421", name: "David Wilson", role: "Security Officer", avatar: "https://i.pravatar.cc/150?img=15", status: null, inTime: "08:00 AM", outTime: "05:00 PM" },
    { id: "HRM-115", name: "Leila Samari", role: "Data Analyst", avatar: "https://i.pravatar.cc/150?img=44", status: null, inTime: "08:00 AM", outTime: "05:00 PM" },
    { id: "HRM-672", name: "Robert Vance", role: "Quality Inspector", avatar: "https://i.pravatar.cc/150?img=68", status: null, inTime: "08:00 AM", outTime: "05:00 PM" },
];

function calcWorkHours(inT: string, outT: string) {
    if (!inT || !outT) return { label: "—", ot: "" };
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
}

export default function ManualAttendancePage() {
    const [emps, setEmps] = useState<Employee[]>(EMPLOYEES);
    const [q, setQ] = useState("");
    const [sel, setSel] = useState<Employee | null>(null);
    const [inT, setInT] = useState("");
    const [outT, setOutT] = useState("");
    const [rem, setRem] = useState("");
    const [toast, setToast] = useState({ msg: "", on: false });

    const pc = emps.filter(e => e.status === "Present").length;
    const ac = emps.filter(e => e.status === "Absent").length;
    const nd = emps.filter(e => e.status === null).length;

    const list = emps.filter(e =>
        e.name.toLowerCase().includes(q.toLowerCase()) ||
        e.id.toLowerCase().includes(q.toLowerCase())
    );

    const setStatus = (id: string, s: Status) =>
        setEmps(p => p.map(e => e.id === id ? { ...e, status: s } : e));

    const markAll = () => {
        setEmps(p => p.map(e => ({ ...e, status: "Present" as Status })));
        pop("All employees marked as Present.");
    };

    const open = (emp: Employee) => {
        setSel(emp);
        setInT(emp.inTime || "08:00 AM");
        setOutT(emp.outTime || "05:00 PM");
        setRem("");
    };

    const save = () => {
        if (!sel) return;
        setEmps(p => p.map(e => e.id === sel.id ? { ...e, inTime: inT, outTime: outT, status: "Present" } : e));
        pop(`${sel.name}'s time entry updated successfully.`);
        setSel(null);
    };

    const pop = (msg: string) => {
        setToast({ msg, on: true });
        setTimeout(() => setToast(t => ({ ...t, on: false })), 3500);
    };

    const wh = calcWorkHours(inT, outT);

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-[#f9fafb] dark:bg-slate-950 transition-colors">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <header className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-8 h-[65px] flex items-center justify-between sticky top-0 z-40 transition-colors">
                <div className="flex items-center gap-3">
                    <h1 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">Manual Attendance</h1>
                    <span className="text-[10px] font-extrabold tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 px-2.5 py-[5px] rounded-full uppercase">
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
                            className="w-52 pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/15 focus:border-[#9e3f00]/50 transition-colors"
                        />
                    </div>
                    <button className="relative p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-slate-900" />
                    </button>
                    <div className="w-px h-8 bg-gray-200 dark:bg-slate-800" />
                    <div className="flex items-center gap-2.5">
                        <div className="text-right">
                            <p className="text-[13px] font-semibold text-gray-800 dark:text-white leading-tight">Sarah Jenkins</p>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-tight">Operations Lead</p>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://i.pravatar.cc/150?img=23"
                            alt="Sarah Jenkins"
                            className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-slate-700 bg-gray-100 dark:bg-slate-800"
                        />
                    </div>
                </div>
            </header>

            {/* ── Action Bar ─────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-8 h-[54px] flex items-center gap-3 transition-colors">
                {["Operations Dept", "Morning Shift (08:00 – 17:00)"].map(t => (
                    <span key={t} className="text-[13px] font-medium text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 whitespace-nowrap">
                        {t}
                    </span>
                ))}
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 whitespace-nowrap">
                    <Calendar className="w-4 h-4 text-gray-400" /> Oct 24, 2023
                </span>
                <div className="ml-auto flex items-center gap-3">
                    <button onClick={markAll} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#9e3f00] dark:text-orange-400 border border-[#9e3f00]/25 dark:border-orange-500/30 rounded-lg px-4 py-[7px] hover:bg-[#9e3f00]/5 dark:hover:bg-orange-500/10 transition-colors cursor-pointer">
                        <ArrowLeftRight className="w-3.5 h-3.5" /> Mark All Present
                    </button>
                    <button onClick={() => pop("Attendance submitted!")} className="text-[13px] font-bold text-white bg-[#9e3f00] rounded-lg px-5 py-[7px] hover:bg-[#7a3000] transition-colors shadow-sm cursor-pointer">
                        Submit Updates
                    </button>
                </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0">

                {/* Card Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {list.map(emp => (
                            <Card
                                key={emp.id}
                                emp={emp}
                                selected={sel?.id === emp.id}
                                onStatus={setStatus}
                                onCustom={() => open(emp)}
                            />
                        ))}
                    </div>
                </div>

                {/* Custom Entry Panel */}
                {sel && (
                    <aside className="w-[360px] flex-shrink-0 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col overflow-y-auto shadow-xl transition-colors">
                        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-[15px]">Custom Entry</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Adjusting attendance for 1 employee</p>
                            </div>
                            <button onClick={() => setSel(null)} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5 px-6 py-5 flex-1">
                            {/* Employee chip */}
                            <div className="flex items-center gap-3 bg-[#fdf9f7] dark:bg-slate-800/60 border border-[#9e3f00]/10 dark:border-slate-700 rounded-xl p-4 transition-colors">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={sel.avatar} alt={sel.name} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 border-2 border-white dark:border-slate-600 shadow-sm flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{sel.name}</p>
                                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">ID: {sel.id} · {sel.role}</p>
                                    {sel.isActiveShift && (
                                        <span className="inline-block mt-1.5 text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/40 px-2 py-0.5 rounded-full tracking-wide">
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
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
                                        <div className="relative">
                                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                                                className="w-full pl-9 pr-2 py-2.5 text-sm font-semibold border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/15 focus:border-[#9e3f00]/60 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Remarks */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Reason / Remarks</p>
                                <textarea value={rem} onChange={e => setRem(e.target.value)} rows={3}
                                    placeholder="e.g. Late entry due to transport delay..."
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#9e3f00]/15 focus:border-[#9e3f00]/60 placeholder-gray-400 dark:placeholder-slate-500 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 transition-colors" />
                            </div>

                            {/* Work Hours */}
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 transition-colors">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Calculated Work Hours</p>
                                </div>
                                <div className="flex items-end justify-between">
                                    <p className="text-4xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{wh.label}</p>
                                    {wh.ot && <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">{wh.ot}</p>}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col gap-2.5 mt-auto">
                                <button onClick={() => setSel(null)}
                                    className="w-full py-2.5 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                                    Cancel
                                </button>
                                <button onClick={save}
                                    className="w-full py-2.5 text-sm font-bold text-white bg-[#9e3f00] rounded-xl hover:bg-[#7a3000] transition-colors cursor-pointer">
                                    Save Entry
                                </button>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* ── Status Bar ─────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 h-10 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-8 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-6 text-xs">
                    {[
                        { dot: "bg-green-500", n: pc, lbl: "Present" },
                        { dot: "bg-red-400", n: ac, lbl: "Absent" },
                        { dot: "bg-amber-400", n: nd, lbl: "Pending" },
                    ].map(({ dot, n, lbl }) => (
                        <span key={lbl} className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                            <span className={`w-2 h-2 rounded-full ${dot}`} />
                            <strong className="text-gray-800 dark:text-white">{String(n).padStart(2, "0")}</strong> {lbl}
                        </span>
                    ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-slate-400">Last updated: 5 minutes ago</span>
            </div>

            {/* ── Toast ──────────────────────────────────────────────────────── */}
            {toast.on && (
                <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white text-[13px] font-medium px-5 py-3 rounded-full shadow-2xl">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span>{toast.msg}</span>
                    <button className="text-amber-400 text-xs font-bold hover:underline ml-1">Undo</button>
                </div>
            )}
        </div>
    );
}

// ── Employee Card ─────────────────────────────────────────────────────────────
function Card({ emp, selected, onStatus, onCustom }: {
    emp: Employee;
    selected: boolean;
    onStatus: (id: string, s: Status) => void;
    onCustom: () => void;
}) {
    return (
        <div className={`relative bg-white dark:bg-slate-900 rounded-2xl border-2 flex flex-col gap-3.5 p-5 transition-all duration-200 ${selected
            ? "border-[#9e3f00] dark:border-orange-500 shadow-[0_0_0_4px_rgba(158,63,0,0.07)]"
            : "border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700"
            }`}>
            {/* Edit badge */}
            {selected && (
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#9e3f00] dark:bg-orange-500 rounded-full flex items-center justify-center shadow-md z-10">
                    <PenLine className="w-3 h-3 text-white" />
                </div>
            )}

            {/* Avatar + Info */}
            <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={emp.avatar} alt={emp.name}
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 flex-shrink-0 object-cover" />
                <div className="min-w-0">
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight truncate">{emp.name}</p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 leading-tight">ID: {emp.id}</p>
                    <p className="text-[11px] text-[#9e3f00] dark:text-orange-400 font-semibold leading-tight truncate">{emp.role}</p>
                </div>
            </div>

            {/* Present / Absent */}
            <div className="flex gap-2">
                <button onClick={() => onStatus(emp.id, "Present")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-lg text-xs font-semibold border transition-all cursor-pointer ${emp.status === "Present"
                        ? "bg-green-50 dark:bg-green-950/20 border-green-400 dark:border-green-800 text-green-700 dark:text-green-400"
                        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-green-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                        }`}>
                    <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${emp.status === "Present" ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"}`} />
                    Present
                </button>
                <button onClick={() => onStatus(emp.id, "Absent")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-lg text-xs font-semibold border transition-all cursor-pointer ${emp.status === "Absent"
                        ? "bg-red-50 dark:bg-red-950/20 border-red-400 dark:border-red-800 text-red-600 dark:text-red-400"
                        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-red-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        }`}>
                    <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${emp.status === "Absent" ? "bg-red-500" : "bg-gray-300 dark:bg-slate-600"}`} />
                    Absent
                </button>
            </div>

            {/* Custom Time */}
            <button onClick={onCustom}
                className={`w-full flex items-center justify-center gap-2 py-[7px] rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selected
                    ? "bg-[#9e3f00] border-[#9e3f00] text-white"
                    : "bg-white dark:bg-slate-800 border-[#9e3f00]/30 dark:border-orange-500/30 text-[#9e3f00] dark:text-orange-400 hover:bg-[#9e3f00]/5 dark:hover:bg-orange-500/10"
                    }`}>
                <Clock className="w-3.5 h-3.5" />
                Custom Time
            </button>
        </div>
    );
}

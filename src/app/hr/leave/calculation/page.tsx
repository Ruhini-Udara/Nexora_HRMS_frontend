"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Calculator,
    UploadCloud,
    CheckCircle2,
    Printer,
    FileSpreadsheet,
    AlertCircle,
    ChevronRight,
    X,
    FileCheck,
    RefreshCw,
    Check,
    DownloadCloud,
    Eye,
    Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import * as XLSX from "xlsx";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LeaveBalance {
    id: number;
    employee: {
        id: number;
        fullName: string;
        branch: string;
        employeeType: string;
    };
    leaveYear: number;
    annualLeaveQuota: number;
    casualLeaveQuota: number;
    medicalLeaveQuota: number;
    annualLeaveUsed: number;
    casualLeaveUsed: number;
    medicalLeaveUsed: number;
    status: "CALCULATED" | "FINALIZED";
    isManuallyEdited: boolean;
    calculationSource?: "AUTOMATIC" | "HISTORICAL_IMPORT" | "MANUAL_ADJUSTMENT";
}

interface BranchSummary {
    name: string;
    pending: number;
    total: number;
    finalized: boolean;
    employees: LeaveBalance[];
}

interface LeaveImportRequest {
    employeeId: number;
    year: number;
    annualLeaveQuota: number;
    casualLeaveQuota: number;
    medicalLeaveQuota: number;
    annualLeaveUsed: number;
    casualLeaveUsed: number;
    medicalLeaveUsed: number;
}

function groupByBranch(balances: LeaveBalance[]): BranchSummary[] {
    const map: Record<string, { pending: number; total: number; finalized: boolean; employees: LeaveBalance[] }> = {};
    for (const lb of balances) {
        if (!lb?.employee) continue;
        const branch = lb.employee?.branch || "Unknown";
        if (!map[branch]) map[branch] = { pending: 0, total: 0, finalized: true, employees: [] };
        map[branch].total += 1;
        map[branch].employees.push(lb);
        if (lb.status !== "FINALIZED") {
            map[branch].pending += 1;
            map[branch].finalized = false;
        }
    }
    return Object.entries(map).map(([name, v]) => ({ name, ...v }));
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    return (
        <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${type === "success" ? "bg-zinc-900 text-white" : "bg-red-600 text-white"}`}>
            <div className={`size-7 rounded-full flex items-center justify-center shrink-0 ${type === "success" ? "bg-emerald-500" : "bg-white/20"}`}>
                {type === "success" ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
            </div>
            <p className="text-sm font-semibold">{message}</p>
            <button onClick={onClose} className="ml-2 text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LeaveCalculationPage() {
    const { user } = useAuthStore();
    const currentYear = new Date().getFullYear();

    // States
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [branches, setBranches] = useState<BranchSummary[]>([]);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
    const [viewEmployee, setViewEmployee] = useState<LeaveBalance | null>(null);
    const [confirmFinalize, setConfirmFinalize] = useState<string | null>(null);

    // Adjustment Form
    const [adjType, setAdjType] = useState<"ANNUAL" | "CASUAL" | "MEDICAL">("ANNUAL");
    const [adjNewBal, setAdjNewBal] = useState<number>(0);
    const [adjReason, setAdjReason] = useState("");
    const [isAdjusting, setIsAdjusting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Data Fetching ──────────────────────────────────────────────────────────
    const fetchBalances = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/api/leave-calculation/balances?year=${selectedYear}`);
            const data: LeaveBalance[] = Array.isArray(res.data) ? res.data : [];
            setBalances(data);
            setBranches(groupByBranch(data));
            setExpandedBranch(null); // Reset expanded on refresh
        } catch (err: any) {
            console.error("Failed to fetch leave balances:", err);
            setBalances([]);
            setBranches([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    // ── Calculation ────────────────────────────────────────────────────────────
    const handleCalculate = async () => {
        setIsCalculating(true);
        try {
            const res = await api.post(`/api/leave-calculation/calculate?year=${selectedYear}`);
            setToast({ message: res.data.message || "Calculation completed!", type: "success" });
            await fetchBalances();
        } catch (err: any) {
            setToast({ message: err.response?.data?.message || "Calculation failed.", type: "error" });
        } finally {
            setIsCalculating(false);
        }
    };

    // ── Finalization ───────────────────────────────────────────────────────────
    const executeFinalize = async (branchName: string) => {
        if (!user?.id) {
            setToast({ message: "You must be logged in to finalize.", type: "error" });
            return;
        }
        setIsFinalizing(branchName);
        try {
            await api.post(`/api/leave-calculation/finalize?year=${selectedYear}&branch=${encodeURIComponent(branchName)}&finalizedById=${user.id}`);
            setToast({ message: `${branchName} leave balances finalized successfully!`, type: "success" });
            await fetchBalances();
        } catch (err: any) {
            setToast({ message: err.response?.data?.message || "Finalization failed.", type: "error" });
        } finally {
            setIsFinalizing(null);
            setConfirmFinalize(null);
        }
    };

    // ── Excel Upload & Parsing ─────────────────────────────────────────────────
    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { EmployeeCode: "", AnnualLeaveQuota: "", CasualLeaveQuota: "", MedicalLeaveQuota: "", AnnualLeaveUsed: 0, CasualLeaveUsed: 0, MedicalLeaveUsed: 0 }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Historical_Leave_Template.xlsx");
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFile(file);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const payload = data.map((row: any) => ({
                    employeeCode: String(row.EmployeeCode || row.Employeecode || row.EmployeeID || "").trim(),
                    year: selectedYear,
                    annualLeaveQuota: parseInt(row.AnnualLeaveQuota || 0),
                    casualLeaveQuota: parseInt(row.CasualLeaveQuota || 0),
                    medicalLeaveQuota: parseInt(row.MedicalLeaveQuota || 0),
                    annualLeaveUsed: parseInt(row.AnnualLeaveUsed || 0),
                    casualLeaveUsed: parseInt(row.CasualLeaveUsed || 0),
                    medicalLeaveUsed: parseInt(row.MedicalLeaveUsed || 0)
                })).filter(r => r.employeeCode !== "");

                if (payload.length === 0) throw new Error("No valid data found in file. Please use the EmployeeCode column.");

                await api.post('/api/leave-calculation/import', payload);
                setToast({ message: "Historical data imported successfully. Please review.", type: "success" });
                setUploadedFile(null);
                await fetchBalances();

            } catch (err: any) {
                setToast({ message: err.message || "Import failed.", type: "error" });
                setUploadedFile(null);
            }
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsBinaryString(file);
    };

    // ── HR Adjustment ──────────────────────────────────────────────────────────
    const handleAdjust = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!viewEmployee || !user?.id) return;

        setIsAdjusting(true);
        try {
            const payload = {
                balanceId: viewEmployee.id,
                leaveType: adjType,
                newBalance: adjNewBal,
                reason: adjReason,
                adjustedById: user.id
            };

            await api.put('/api/leave-calculation/adjust', payload);
            setToast({ message: "Leave balance adjusted successfully.", type: "success" });
            setViewEmployee(null);
            await fetchBalances();
        } catch (err: any) {
            setToast({ message: err.response?.data?.message || "Adjustment failed.", type: "error" });
        } finally {
            setIsAdjusting(false);
            setAdjReason("");
        }
    };

    const openEmployeeView = (emp: LeaveBalance) => {
        setViewEmployee(emp);
        setAdjType("ANNUAL");
        setAdjNewBal(emp.annualLeaveQuota);
        setAdjReason("");
    };

    // ── Stats ──────────────────────────────────────────────────────────────────
    const finalizedCount = balances.filter(b => b.status === "FINALIZED").length;
    const pendingCount = balances.filter(b => b.status !== "FINALIZED").length;
    const calculatedCount = balances.length;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />

            {/* Header & Year Selector */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Leave Calculation &amp; Finalization
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Calculate, review, adjust and finalize employee leave balances.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 shadow-sm">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Leave Year:</span>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="bg-transparent text-sm font-bold text-primary focus:outline-none cursor-pointer"
                        >
                            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={fetchBalances} disabled={isLoading} className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 hover:text-primary transition-colors">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Calculated / Total</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{calculatedCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600"><Calculator className="w-5 h-5" /></div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Finalized</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">{finalizedCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Review</p>
                        <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600"><AlertCircle className="w-5 h-5" /></div>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Auto Calculation */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between p-5">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0"><Calculator className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Calculate Yearly Leave Balances</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                Calculate employee leave entitlements and balances based on employee type, joining date, leave policies and leave usage.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleCalculate} disabled={isCalculating} className="text-xs h-8">
                            {isCalculating ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Calculating...</> : <><Calculator className="w-3.5 h-3.5 mr-1.5" /> Run Now</>}
                        </Button>
                    </div>
                </div>

                {/* Excel Upload */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/50 transition-colors flex flex-col justify-between p-5">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 shrink-0"><FileSpreadsheet className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Historical Leave Data Import</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                Import approved historical leave balances when previous-year records are not available in the new HRMS.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2">
                        <Button variant="outline" onClick={handleDownloadTemplate} className="text-xs h-8 text-gray-600">
                            <DownloadCloud className="w-3.5 h-3.5 mr-1.5" /> Download Template
                        </Button>
                        <Button onClick={handleUploadClick} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8">
                            <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Upload Excel/CSV
                        </Button>
                    </div>
                </div>
            </div>

            {/* Branch Table & Employees */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden w-full">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Branch-Wise Finalization</h2>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Branch</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Employees</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Pending</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400"><RefreshCw className="w-4 h-4 animate-spin inline mr-2" />Loading...</td></tr>
                            ) : branches.length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No data found for {selectedYear}.</td></tr>
                            ) : (
                                branches.map((branch) => (
                                    <React.Fragment key={branch.name}>
                                        <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                                            <td className="px-5 py-3">
                                                <button onClick={() => setExpandedBranch(expandedBranch === branch.name ? null : branch.name)} className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white hover:text-primary">
                                                    <ChevronRight className={`w-4 h-4 transition-transform ${expandedBranch === branch.name ? "rotate-90" : ""}`} />
                                                    {branch.name}
                                                </button>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{branch.total}</td>
                                            <td className="px-5 py-3 text-sm font-semibold text-amber-600">{branch.finalized ? "0" : branch.pending}</td>
                                            <td className="px-5 py-3">
                                                {branch.finalized ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Finalized</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pending Review</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {!branch.finalized && (
                                                    <Button onClick={() => setConfirmFinalize(branch.name)} className="text-xs h-7 px-3 font-bold" variant="default">
                                                        Finalize Branch
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                        {/* Expandable Employee Details */}
                                        {expandedBranch === branch.name && (
                                            <tr>
                                                <td colSpan={5} className="p-0 border-b-2 border-primary/20">
                                                    <div className="bg-gray-50/80 dark:bg-zinc-900/50 p-4 shadow-inner">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Employee Leave Balances - {branch.name}</h4>
                                                        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                                                            <table className="w-full text-left text-sm">
                                                                <thead className="bg-gray-100/50 dark:bg-zinc-700/50 border-b border-gray-200 dark:border-zinc-700">
                                                                    <tr>
                                                                        <th className="px-4 py-2 font-semibold">Emp ID</th>
                                                                        <th className="px-4 py-2 font-semibold">Name</th>
                                                                        <th className="px-4 py-2 font-semibold text-center">Annual</th>
                                                                        <th className="px-4 py-2 font-semibold text-center">Casual</th>
                                                                        <th className="px-4 py-2 font-semibold text-center">Medical</th>
                                                                        <th className="px-4 py-2 font-semibold">Status</th>
                                                                        <th className="px-4 py-2 font-semibold text-right">Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                                                    {branch.employees.map(emp => (
                                                                        <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/30">
                                                                            <td className="px-4 py-2 text-gray-500">#{emp.employee?.id}</td>
                                                                            <td className="px-4 py-2 font-medium">{emp.employee?.fullName || "N/A"}</td>
                                                                            <td className="px-4 py-2 text-center">{emp.annualLeaveQuota}</td>
                                                                            <td className="px-4 py-2 text-center">{emp.casualLeaveQuota}</td>
                                                                            <td className="px-4 py-2 text-center">{emp.medicalLeaveQuota}</td>
                                                                            <td className="px-4 py-2">
                                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${emp.status === 'FINALIZED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                                    {emp.status}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-4 py-2 text-right">
                                                                                <Button variant="ghost" onClick={() => openEmployeeView(emp)} className="h-7 text-xs text-primary hover:bg-primary/10">
                                                                                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                                                                                </Button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Finalize Confirmation Modal */}
            {confirmFinalize && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 text-amber-600 mb-4">
                            <AlertCircle className="w-6 h-6" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Finalization</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            Are you sure you want to finalize leave balances for <strong>{confirmFinalize}</strong> for the year <strong>{selectedYear}</strong>? Finalized balances cannot be directly edited.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setConfirmFinalize(null)}>Cancel</Button>
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => executeFinalize(confirmFinalize)} disabled={isFinalizing === confirmFinalize}>
                                {isFinalizing === confirmFinalize ? "Finalizing..." : "Yes, Finalize"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee View & Adjustment Modal */}
            {viewEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Employee Leave Record</h3>
                            <button onClick={() => setViewEmployee(null)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Employee Info</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{viewEmployee.employee?.fullName || "N/A"}</p>
                                    <p className="text-xs text-gray-500">#{viewEmployee.employee?.id} &bull; {viewEmployee.employee?.branch || "Unknown"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Status & Source</p>
                                    <div className="flex gap-2 items-center">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${viewEmployee.status === 'FINALIZED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{viewEmployee.status}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 font-bold uppercase">{viewEmployee.calculationSource || "AUTOMATIC"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-center">
                                    <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-800">
                                        <tr>
                                            <th className="px-4 py-2 font-semibold">Leave Type</th>
                                            <th className="px-4 py-2 font-semibold text-primary">Entitlement</th>
                                            <th className="px-4 py-2 font-semibold text-rose-500">Used</th>
                                            <th className="px-4 py-2 font-semibold text-emerald-600">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                        <tr><td className="px-4 py-2 font-medium">Annual</td><td className="px-4 py-2">{viewEmployee.annualLeaveQuota}</td><td className="px-4 py-2">{viewEmployee.annualLeaveUsed}</td><td className="px-4 py-2 font-bold">{viewEmployee.annualLeaveQuota - viewEmployee.annualLeaveUsed}</td></tr>
                                        <tr><td className="px-4 py-2 font-medium">Casual</td><td className="px-4 py-2">{viewEmployee.casualLeaveQuota}</td><td className="px-4 py-2">{viewEmployee.casualLeaveUsed}</td><td className="px-4 py-2 font-bold">{viewEmployee.casualLeaveQuota - viewEmployee.casualLeaveUsed}</td></tr>
                                        <tr><td className="px-4 py-2 font-medium">Medical</td><td className="px-4 py-2">{viewEmployee.medicalLeaveQuota}</td><td className="px-4 py-2">{viewEmployee.medicalLeaveUsed}</td><td className="px-4 py-2 font-bold">{viewEmployee.medicalLeaveQuota - viewEmployee.medicalLeaveUsed}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* HR Adjustment Form */}
                            <div className="bg-gray-50 dark:bg-zinc-800/50 p-5 rounded-xl border border-gray-200 dark:border-zinc-700">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> HR Manual Adjustment</h4>
                                {viewEmployee.status === 'FINALIZED' ? (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-xs flex items-center gap-2 font-semibold">
                                        <AlertCircle className="w-4 h-4" /> This record is finalized and cannot be adjusted.
                                    </div>
                                ) : (
                                    <form onSubmit={handleAdjust} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Leave Type</label>
                                                <select value={adjType} onChange={(e) => {
                                                    const type = e.target.value as any;
                                                    setAdjType(type);
                                                    setAdjNewBal(type === 'ANNUAL' ? viewEmployee.annualLeaveQuota : type === 'CASUAL' ? viewEmployee.casualLeaveQuota : viewEmployee.medicalLeaveQuota);
                                                }} className="w-full text-sm p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                                                    <option value="ANNUAL">Annual Leave</option>
                                                    <option value="CASUAL">Casual Leave</option>
                                                    <option value="MEDICAL">Medical Leave</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">New Entitlement Balance</label>
                                                <input type="number" min="0" required value={adjNewBal} onChange={(e) => setAdjNewBal(parseInt(e.target.value) || 0)} className="w-full text-sm p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Reason for Adjustment</label>
                                            <input type="text" required placeholder="e.g. Correcting historical discrepancy" value={adjReason} onChange={(e) => setAdjReason(e.target.value)} className="w-full text-sm p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" />
                                        </div>
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={isAdjusting} className="h-8 text-xs font-bold bg-primary text-white">
                                                {isAdjusting ? "Saving..." : <><Save className="w-3.5 h-3.5 mr-1.5" /> Save Adjustment</>}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

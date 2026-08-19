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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LeaveBalance {
    id: number;
    year: number;
    status: string;
    annualLeaveQuota: number;
    casualLeaveQuota: number;
    medicalLeaveQuota: number;
    annualLeaveUsed: number;
    casualLeaveUsed: number;
    medicalLeaveUsed: number;
    isManuallyEdited: boolean;
    employee: {
        id: number;
        fullName: string;
        branch: string;
        employeeCode: string;
        employeeType: string;
    };
}

interface DistrictSummary {
    branch: string;
    total: number;
    finalized: number;
    pending: number;
}

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    return (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium ${type === "success" ? "bg-zinc-900" : "bg-red-600"}`}>
            {type === "success" ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4" />}
            {message}
            <button onClick={onClose} className="ml-2 text-white/50 hover:text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeaveCalculationPage() {
    const { user } = useAuthStore();
    const currentYear = new Date().getFullYear();

    const [isCalculating, setIsCalculating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [finalizingBranch, setFinalizingBranch] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [printingBranch, setPrintingBranch] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [districts, setDistricts] = useState<DistrictSummary[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // ── Build district summary from real leave balances ───────────────────────
    const fetchDistrictSummary = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/api/leave-calculation/balances?year=${currentYear}`);
            const balances: LeaveBalance[] = res.data;

            // Group by branch
            const branchMap: Record<string, DistrictSummary> = {};
            for (const lb of balances) {
                const branch = lb.employee?.branch || "Unknown";
                if (!branchMap[branch]) {
                    branchMap[branch] = { branch, total: 0, finalized: 0, pending: 0 };
                }
                branchMap[branch].total++;
                if (lb.status === "FINALIZED") {
                    branchMap[branch].finalized++;
                } else {
                    branchMap[branch].pending++;
                }
            }
            setDistricts(Object.values(branchMap));
        } catch (err) {
            // No data yet — leave districts empty (will show "Run Calculation" call to action)
            setDistricts([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentYear]);

    useEffect(() => {
        fetchDistrictSummary();
    }, [fetchDistrictSummary]);

    // ── Run Calculation ───────────────────────────────────────────────────────
    const handleCalculate = async () => {
        setIsCalculating(true);
        try {
            const res = await api.post(`/api/leave-calculation/calculate?year=${currentYear}`);
            showToast(res.data.message || "Calculation completed!", "success");
            await fetchDistrictSummary();
        } catch {
            showToast("Calculation failed. Please check backend logs.", "error");
        } finally {
            setIsCalculating(false);
        }
    };

    // ── Finalize District ─────────────────────────────────────────────────────
    const handleFinalize = async (branch: string) => {
        if (!user?.id) {
            showToast("You must be logged in to finalize.", "error");
            return;
        }
        setFinalizingBranch(branch);
        try {
            await api.post(`/api/leave-calculation/finalize?year=${currentYear}&branch=${encodeURIComponent(branch)}&finalizedById=${user.id}`);
            showToast(`${branch} successfully finalized!`, "success");
            await fetchDistrictSummary();
        } catch {
            showToast(`Failed to finalize ${branch}. Please try again.`, "error");
        } finally {
            setFinalizingBranch(null);
        }
    };

    // ── Excel Upload ──────────────────────────────────────────────────────────
    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setUploadedFile(file);
        e.target.value = "";
    };

    // ── Print ─────────────────────────────────────────────────────────────────
    const handlePrint = (branch: string) => {
        const d = districts.find((x) => x.branch === branch);
        if (!d) return;
        setPrintingBranch(branch);
        const w = window.open("", "_blank", "width=800,height=600");
        if (!w) return;
        w.document.write(`
            <html><head><title>Leave Report – ${d.branch}</title>
            <style>
                body{font-family:Arial,sans-serif;padding:32px;color:#111}
                h1{font-size:20px;font-weight:bold;margin-bottom:4px}
                p{font-size:13px;color:#555;margin-bottom:24px}
                table{width:100%;border-collapse:collapse;font-size:13px}
                th{background:#f3f4f6;text-align:left;padding:10px 14px;border:1px solid #e5e7eb;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
                td{padding:10px 14px;border:1px solid #e5e7eb}
                .badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:bold}
                .green{background:#d1fae5;color:#065f46}.amber{background:#fef3c7;color:#92400e}
            </style></head>
            <body>
                <h1>Branch Leave Report – ${d.branch}</h1>
                <p>Generated: ${new Date().toLocaleString()} | Year: ${currentYear}</p>
                <table><thead><tr><th>District</th><th>Total Employees</th><th>Finalized</th><th>Pending</th></tr></thead>
                <tbody><tr>
                    <td>${d.branch}</td><td>${d.total}</td>
                    <td><span class="badge green">${d.finalized}</span></td>
                    <td><span class="badge amber">${d.pending}</span></td>
                </tr></tbody></table>
            </body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); w.close(); setPrintingBranch(null); }, 400);
    };

    const finalizedCount = districts.filter((d) => d.pending === 0 && d.total > 0).length;
    const pendingCount = districts.filter((d) => d.pending > 0).length;

    return (
        <div className="p-8 max-w-7xl mx-auto w-full space-y-4">
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />

            {/* ── Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Leave Calculation &amp; Finalization — {currentYear}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                        Calculate yearly leave quotas and finalize district-wise balances.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-center px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <p className="text-base font-bold text-emerald-600">{finalizedCount}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Finalized</p>
                    </div>
                    <div className="text-center px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <p className="text-base font-bold text-amber-600">{pendingCount}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Pending</p>
                    </div>
                    <button onClick={fetchDistrictSummary} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors" title="Refresh">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* ── Action Cards ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Auto Calculation Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-primary/40 transition-colors flex items-center gap-4 px-4 py-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                        <Calculator className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Auto-Calculate Yearly Quotas</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            Applies Hexa Co. rules (35/21/prorated) to all employees based on join date.
                        </p>
                    </div>
                    <Button onClick={handleCalculate} disabled={isCalculating} className="shrink-0 text-xs h-8 px-3 whitespace-nowrap">
                        {isCalculating ? (
                            <span className="flex items-center gap-1.5 animate-pulse"><RefreshCw className="w-3.5 h-3.5 animate-spin" />Running...</span>
                        ) : (
                            <span className="flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5" />Run Now</span>
                        )}
                    </Button>
                </div>

                {/* Excel Upload Card */}
                <div onClick={handleUploadClick} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/50 transition-colors flex items-center gap-4 px-4 py-3 cursor-pointer group">
                    <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Manual Data Upload</p>
                        {uploadedFile ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate">{uploadedFile.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Upload historical leave balances via .xlsx / .csv file.</p>
                        )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 group-hover:border-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/10 transition-colors">
                        <UploadCloud className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600" />
                        <span className="text-[11px] font-semibold text-gray-500 group-hover:text-emerald-700 whitespace-nowrap">Upload .xlsx</span>
                    </div>
                </div>
            </div>

            {/* ── District Table ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden w-full">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex flex-wrap gap-2 justify-between items-center">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">District-Wise Finalization</h2>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Review and finalize leave balances per district for {currentYear}.</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-700/40 text-[11px] font-bold whitespace-nowrap">
                        <AlertCircle className="w-3.5 h-3.5" />
                        High Authority Required
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[35%]">District / Branch</th>
                                <th className="px-3 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[15%]">Total</th>
                                <th className="px-3 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[15%]">Finalized</th>
                                <th className="px-3 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[15%]">Pending</th>
                                <th className="px-3 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-[20%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                                        <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                                        Loading district data...
                                    </td>
                                </tr>
                            ) : districts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center">
                                        <Calculator className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No leave balances calculated yet</p>
                                        <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1">Click <strong>Run Now</strong> to calculate leave quotas for all employees</p>
                                    </td>
                                </tr>
                            ) : (
                                districts.map((district) => {
                                    const isAllFinalized = district.pending === 0;
                                    return (
                                        <tr key={district.branch} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-1.5">
                                                    <ChevronRight className="w-3 h-3 text-gray-300 dark:text-zinc-600 shrink-0" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{district.branch}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400">{district.total}</td>
                                            <td className="px-3 py-2.5">
                                                <span className="text-sm font-semibold text-emerald-600">{district.finalized}</span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                {isAllFinalized ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                        <CheckCircle2 className="w-3 h-3" /> Done
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
                                                        {district.pending} pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handlePrint(district.branch)}
                                                        disabled={printingBranch === district.branch}
                                                        className="p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
                                                        title="Print Branch Report"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </button>
                                                    {!isAllFinalized && (
                                                        <Button
                                                            onClick={() => handleFinalize(district.branch)}
                                                            disabled={finalizingBranch === district.branch}
                                                            className="text-[11px] h-7 px-3 font-bold"
                                                        >
                                                            {finalizingBranch === district.branch ? "Saving..." : "Finalize"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-2 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {districts.length} districts —{" "}
                        <span className="text-emerald-600 font-semibold">{finalizedCount} fully finalized</span>,{" "}
                        <span className="text-amber-600 font-semibold">{pendingCount} with pending records</span>
                    </p>
                </div>
            </div>

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

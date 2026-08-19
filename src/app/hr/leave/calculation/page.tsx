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

// ── Types ──────────────────────────────────────────────────────────────────────
interface LeaveBalance {
    id: number;
    employee: {
        id: number;
        fullName: string;
        branch: string;
        employeeType: string;
    };
    year: number;
    annualLeaveQuota: number;
    casualLeaveQuota: number;
    medicalLeaveQuota: number;
    annualLeaveUsed: number;
    casualLeaveUsed: number;
    medicalLeaveUsed: number;
    status: "CALCULATED" | "FINALIZED";
    isManuallyEdited: boolean;
}

interface DistrictSummary {
    name: string;
    pending: number;
    total: number;
    finalized: boolean;
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function groupByBranch(balances: LeaveBalance[]): DistrictSummary[] {
    const map: Record<string, { pending: number; total: number; finalized: boolean }> = {};
    for (const lb of balances) {
        const branch = lb.employee?.branch || "Unknown";
        if (!map[branch]) map[branch] = { pending: 0, total: 0, finalized: true };
        map[branch].total += 1;
        if (lb.status !== "FINALIZED") {
            map[branch].pending += 1;
            map[branch].finalized = false;
        }
    }
    return Object.entries(map).map(([name, v]) => ({ name, ...v }));
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({
    message,
    type,
    onClose,
}: {
    message: string;
    type: "success" | "error";
    onClose: () => void;
}) {
    return (
        <div
            className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${
                type === "success" ? "bg-zinc-900 text-white" : "bg-red-600 text-white"
            }`}
        >
            <div
                className={`size-7 rounded-full flex items-center justify-center shrink-0 ${
                    type === "success" ? "bg-emerald-500" : "bg-white/20"
                }`}
            >
                {type === "success" ? (
                    <Check className="w-4 h-4 text-white" />
                ) : (
                    <X className="w-4 h-4 text-white" />
                )}
            </div>
            <p className="text-sm font-semibold">{message}</p>
            <button onClick={onClose} className="ml-2 text-white/50 hover:text-white">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LeaveCalculationPage() {
    const { user } = useAuthStore();
    const currentYear = new Date().getFullYear();

    const [isCalculating, setIsCalculating] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [printingDistrict, setPrintingDistrict] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [districts, setDistricts] = useState<DistrictSummary[]>([]);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Fetch leave balances from backend ──────────────────────────────────────
    const fetchBalances = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/api/leave-calculation/balances?year=${currentYear}`);
            const data: LeaveBalance[] = res.data;
            setBalances(data);
            setDistricts(groupByBranch(data));
        } catch (err) {
            // No data yet (table empty) is not an error
            setBalances([]);
            setDistricts([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentYear]);

    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    // ── Run Calculation ────────────────────────────────────────────────────────
    const handleCalculate = async () => {
        setIsCalculating(true);
        try {
            const res = await api.post(`/api/leave-calculation/calculate?year=${currentYear}`);
            setToast({ message: res.data.message || "Calculation completed!", type: "success" });
            await fetchBalances(); // Refresh table with real data
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setToast({
                message: error.response?.data?.message || "Calculation failed. Please try again.",
                type: "error",
            });
        } finally {
            setIsCalculating(false);
        }
    };

    // ── Finalize District ──────────────────────────────────────────────────────
    const handleFinalize = async (branchName: string) => {
        if (!user?.id) {
            setToast({ message: "You must be logged in to finalize.", type: "error" });
            return;
        }
        setIsFinalizing(branchName);
        try {
            await api.post(
                `/api/leave-calculation/finalize?year=${currentYear}&branch=${encodeURIComponent(branchName)}&finalizedById=${user.id}`
            );
            setToast({ message: `${branchName} leave balances finalized successfully!`, type: "success" });
            await fetchBalances();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setToast({
                message: error.response?.data?.message || "Finalization failed. Please try again.",
                type: "error",
            });
        } finally {
            setIsFinalizing(null);
        }
    };

    // ── Excel Upload ───────────────────────────────────────────────────────────
    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFile(file);
        e.target.value = "";
    };

    // ── Print ──────────────────────────────────────────────────────────────────
    const handlePrint = (branchName: string) => {
        setPrintingDistrict(branchName);
        const district = districts.find((d) => d.name === branchName);
        const branchBalances = balances.filter((b) => b.employee?.branch === branchName);
        if (!district) return;

        const printWindow = window.open("", "_blank", "width=900,height=650");
        if (!printWindow) { setPrintingDistrict(null); return; }

        const rows = branchBalances.map((b) => `
            <tr>
                <td>${b.employee?.fullName || "N/A"}</td>
                <td>${b.annualLeaveQuota}</td>
                <td>${b.casualLeaveQuota}</td>
                <td>${b.medicalLeaveQuota}</td>
                <td>${b.annualLeaveUsed + b.casualLeaveUsed + b.medicalLeaveUsed}</td>
                <td><span class="badge ${b.status === "FINALIZED" ? "green" : "amber"}">${b.status}</span></td>
            </tr>`
        ).join("");

        printWindow.document.write(`
            <html><head><title>Leave Report – ${branchName}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 28px; color: #111; }
                h1 { font-size: 18px; font-weight: bold; margin-bottom: 2px; }
                p { font-size: 12px; color: #666; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th { background: #f3f4f6; text-align: left; padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 10px; text-transform: uppercase; }
                td { padding: 8px 12px; border: 1px solid #e5e7eb; }
                .badge { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: bold; }
                .green { background: #d1fae5; color: #065f46; }
                .amber { background: #fef3c7; color: #92400e; }
            </style></head>
            <body>
                <h1>Branch Leave Report – ${branchName}</h1>
                <p>Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Year: ${currentYear} &nbsp;|&nbsp; Total Employees: ${branchBalances.length}</p>
                <table>
                    <thead><tr><th>Employee Name</th><th>Annual</th><th>Casual</th><th>Medical</th><th>Used</th><th>Status</th></tr></thead>
                    <tbody>${rows || "<tr><td colspan='6' style='text-align:center;color:#999'>No records found for this branch</td></tr>"}</tbody>
                </table>
            </body></html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); setPrintingDistrict(null); }, 400);
    };

    // ── Stats ──────────────────────────────────────────────────────────────────
    const finalizedCount = districts.filter((d) => d.finalized).length;
    const pendingCount = districts.filter((d) => !d.finalized).length;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="p-8 max-w-7xl mx-auto w-full space-y-4">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Leave Calculation &amp; Finalization
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                        Auto-calculate yearly leave quotas for all employees · Year: {currentYear}
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
                    <button
                        onClick={fetchBalances}
                        disabled={isLoading}
                        className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 hover:text-primary hover:border-primary transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Auto Calculation */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-primary/40 transition-colors flex items-center gap-4 px-4 py-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                        <Calculator className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Auto-Calculate Yearly Quotas</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            Apply Hexa Co. rules (35/21/prorated) to all employees based on join date. Skips finalized &amp; manually edited records.
                        </p>
                    </div>
                    <Button
                        onClick={handleCalculate}
                        disabled={isCalculating}
                        className="shrink-0 text-xs h-8 px-3 whitespace-nowrap"
                    >
                        {isCalculating ? (
                            <span className="flex items-center gap-1.5">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Calculating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <Calculator className="w-3.5 h-3.5" /> Run Now
                            </span>
                        )}
                    </Button>
                </div>

                {/* Excel Upload */}
                <div
                    onClick={handleUploadClick}
                    className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/50 transition-colors flex items-center gap-4 px-4 py-3 cursor-pointer group"
                >
                    <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Manual Data Upload</p>
                        {uploadedFile ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate">{uploadedFile.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="ml-1 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Upload previous leave balances via .xlsx / .csv for missing historical data.</p>
                        )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 group-hover:border-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/10 transition-colors">
                        <UploadCloud className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600" />
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap group-hover:text-emerald-700">Upload .xlsx</span>
                    </div>
                </div>
            </div>

            {/* District Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden w-full">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex flex-wrap gap-2 justify-between items-center">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">District-Wise Finalization</h2>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {balances.length > 0
                                ? `${balances.length} employee records loaded for ${currentYear}`
                                : "Run calculation first to populate this table"}
                        </p>
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
                                <th className="px-3 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[20%]">Pending</th>
                                <th className="px-3 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[20%]">Status</th>
                                <th className="px-3 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-[25%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                                        <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                                        Loading balances...
                                    </td>
                                </tr>
                            ) : districts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center">
                                        <p className="text-sm text-gray-400">No leave balances found for {currentYear}.</p>
                                        <p className="text-[11px] text-gray-400 mt-1">Click <strong>Run Now</strong> to calculate quotas for all employees.</p>
                                    </td>
                                </tr>
                            ) : (
                                districts.map((district) => (
                                    <tr key={district.name} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-zinc-600 shrink-0" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{district.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400">
                                            {district.finalized ? "0" : district.pending} / {district.total} emp
                                        </td>
                                        <td className="px-3 py-2.5">
                                            {district.finalized ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                    <CheckCircle2 className="w-3 h-3" /> Finalized
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handlePrint(district.name)}
                                                    disabled={printingDistrict === district.name}
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-40"
                                                    title={`Print ${district.name} Report`}
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                </button>
                                                {!district.finalized && (
                                                    <Button
                                                        onClick={() => handleFinalize(district.name)}
                                                        disabled={isFinalizing === district.name}
                                                        className="text-[11px] h-7 px-3 font-bold"
                                                    >
                                                        {isFinalizing === district.name ? (
                                                            <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Saving...</span>
                                                        ) : "Finalize"}
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-2 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {districts.length} district(s) &mdash;{" "}
                        <span className="text-emerald-600 font-semibold">{finalizedCount} finalized</span>,{" "}
                        <span className="text-amber-600 font-semibold">{pendingCount} pending</span>
                    </p>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}

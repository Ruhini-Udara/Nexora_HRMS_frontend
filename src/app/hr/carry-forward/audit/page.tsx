"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

export default function CarryForwardAuditPage() {
  const searchParams = useSearchParams();
  const initialBatchId = searchParams.get("batchId");

  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(initialBatchId || "");
  const [batchDetails, setBatchDetails] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeEntryModal, setActiveEntryModal] = useState<any>(null);
  const [actualDaysInput, setActualDaysInput] = useState<number>(0);
  const [actualAmountInput, setActualAmountInput] = useState<number>(0);
  const [adjustmentReasonInput, setAdjustmentReasonInput] = useState<string>("");
  const [isSavingAdjustment, setIsSavingAdjustment] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Fetch available batches
  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/carry-forward/batches");
        setBatches(res.data);
        if (!selectedBatchId && res.data.length > 0) {
          setSelectedBatchId(res.data[0].id);
        }
      } catch (err) {
        console.error("Error loading batches:", err);
      }
    };
    loadBatches();
  }, []);

  // Fetch batch details when selectedBatchId changes
  const loadBatchDetails = async (id: string) => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/v1/carry-forward/batches/${id}`);
      setBatchDetails(res.data);
    } catch (err) {
      console.error("Error loading batch details:", err);
      setFeedback({ text: "Failed to load audit data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatchId) {
      loadBatchDetails(selectedBatchId);
    }
  }, [selectedBatchId]);

  const openAdjustmentModal = (entry: any) => {
    setActiveEntryModal(entry);
    const paidDays = entry.carriedForwardDays || 0;
    const paidAmt = Number(entry.paidAmount || entry.calculatedAmount || 0);
    setActualDaysInput(entry.actualDays !== null && entry.actualDays !== undefined ? entry.actualDays : paidDays);
    setActualAmountInput(entry.actualAmount !== null && entry.actualAmount !== undefined ? Number(entry.actualAmount) : paidAmt);
    setAdjustmentReasonInput(entry.adjustmentReason || "");
  };

  const handleActualDaysChange = (days: number) => {
    setActualDaysInput(days);
    const rate = Number(activeEntryModal?.dailyRate || 2500);
    setActualAmountInput(days * rate);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEntryModal) return;

    // Client-side validations
    if (actualDaysInput < 0 || actualDaysInput > 45) {
      setFeedback({ text: "Audited actual days must be between 0 and 45 days.", type: "error" });
      return;
    }
    if (actualAmountInput < 0) {
      setFeedback({ text: "Audited actual payment amount cannot be negative.", type: "error" });
      return;
    }
    if (!adjustmentReasonInput || adjustmentReasonInput.trim().length < 3) {
      setFeedback({ text: "Please provide a valid reason (at least 3 characters) for this audit adjustment.", type: "error" });
      return;
    }

    setIsSavingAdjustment(true);
    setFeedback(null);
    try {
      await axiosInstance.post(`/api/v1/carry-forward/entries/${activeEntryModal.id}/audit-adjustment`, {
        actualDays: actualDaysInput,
        actualAmount: actualAmountInput,
        adjustmentReason: adjustmentReasonInput.trim(),
        auditorName: "Head Office Auditor"
      });
      setFeedback({ text: `Audit adjustment for ${activeEntryModal.name} recorded successfully.`, type: "success" });
      setActiveEntryModal(null);
      await loadBatchDetails(selectedBatchId);
    } catch (err: any) {
      console.error("Failed to record adjustment:", err);
      setFeedback({ text: err.response?.data?.message || "Failed to record adjustment.", type: "error" });
    } finally {
      setIsSavingAdjustment(false);
    }
  };

  const handleCompleteAudit = async () => {
    if (!selectedBatchId) return;

    if (!window.confirm("Are you sure you want to finalize this batch audit? Once finalized, adjustments will be committed for payroll calculation.")) {
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      await axiosInstance.post(`/api/v1/carry-forward/batches/${selectedBatchId}/complete-audit`, {
        auditorName: "Head Office Auditor"
      });
      setFeedback({ text: `Audit finalized and completed for batch ${selectedBatchId}!`, type: "success" });
      await loadBatchDetails(selectedBatchId);
    } catch (err: any) {
      console.error(err);
      setFeedback({ text: err.response?.data?.message || "Failed to complete audit.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Flatten and filter entries across branches
  const allEntries: any[] = [];
  if (batchDetails?.branches) {
    batchDetails.branches.forEach((b: any) => {
      if (selectedBranch === "ALL" || b.branchName === selectedBranch) {
        b.entries?.forEach((entry: any) => {
          allEntries.push({ ...entry, branchName: b.branchName });
        });
      }
    });
  }

  // Summary Metrics
  const totalEntries = allEntries.length;
  const matchedCount = allEntries.filter(e => e.auditStatus === "MATCHED").length;
  const overpaidCount = allEntries.filter(e => e.auditStatus === "DISCREPANCY_OVERPAID").length;
  const underpaidCount = allEntries.filter(e => e.auditStatus === "DISCREPANCY_UNDERPAID").length;
  const pendingCount = allEntries.filter(e => !e.auditStatus || e.auditStatus === "PENDING_AUDIT").length;

  const totalDeductions = allEntries
    .filter(e => e.auditStatus === "DISCREPANCY_OVERPAID" && e.adjustmentAmount)
    .reduce((sum, e) => sum + Math.abs(Number(e.adjustmentAmount)), 0);

  const totalAdditions = allEntries
    .filter(e => e.auditStatus === "DISCREPANCY_UNDERPAID" && e.adjustmentAmount)
    .reduce((sum, e) => sum + Number(e.adjustmentAmount), 0);

  // Available branches
  const branchList = batchDetails?.branches ? batchDetails.branches.map((b: any) => b.branchName) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/hr/carry-forward"
            className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Carry Forward Leave Auditing</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 text-xs font-bold uppercase">
                Post-Payment Audit
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Verify released carry forward payments against actual days, record over/underpay adjustments, and sync to payroll.
            </p>
          </div>
        </div>

        {/* Batch Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="text-xs font-bold text-slate-500 uppercase">Batch:</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="text-xs font-mono font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} ({b.year}) - {b.status}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCompleteAudit}
            disabled={loading || batchDetails?.status === "AUDITED"}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl font-bold shadow-sm transition-all text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            {batchDetails?.status === "AUDITED" ? "Audit Completed" : "Finalize & Complete Audit"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          feedback.type === "success" 
            ? "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700" 
            : "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">{feedback.type === "success" ? "check_circle" : "error"}</span>
            {feedback.text}
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Entries</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{totalEntries}</p>
          <span className="text-[10px] text-slate-400">{pendingCount} Pending Review</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Matched (Correct)</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{matchedCount}</p>
          <span className="text-[10px] text-slate-500">Zero variance</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-primary uppercase">Overpaid (Deductions)</span>
          <p className="text-xl font-bold text-primary mt-1">{overpaidCount}</p>
          <span className="text-[10px] text-primary font-mono font-bold">-Rs. {totalDeductions.toLocaleString()}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Underpaid (Refunds)</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{underpaidCount}</p>
          <span className="text-[10px] text-slate-500 font-mono font-bold">+Rs. {totalAdditions.toLocaleString()}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Net Payroll Adjustment</span>
          <p className={`text-xl font-mono font-bold mt-1 ${
            (totalAdditions - totalDeductions) >= 0 ? "text-slate-900 dark:text-white" : "text-primary"
          }`}>
            {(totalAdditions - totalDeductions) >= 0 ? "+" : ""}Rs. {(totalAdditions - totalDeductions).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Flows to next month payroll</span>
        </div>
      </div>

      {/* Audit Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Branch Filter Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">filter_alt</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Branch:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Branches ({branchList.length})</option>
              {branchList.map((branch: string) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong>{allEntries.length}</strong> employee payment records
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Emp Code</th>
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5 text-center">Paid Days</th>
                <th className="p-3.5 text-right">Paid Amount</th>
                <th className="p-3.5 text-center">Actual Days</th>
                <th className="p-3.5 text-right">Actual Amount</th>
                <th className="p-3.5 text-right">Payroll Adjustment</th>
                <th className="p-3.5 text-center">Audit Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {allEntries.map((entry: any) => {
                const paidAmt = Number(entry.paidAmount || entry.calculatedAmount || 0);
                const actualAmt = entry.actualAmount !== null && entry.actualAmount !== undefined ? Number(entry.actualAmount) : paidAmt;
                const adjAmt = entry.adjustmentAmount !== null && entry.adjustmentAmount !== undefined ? Number(entry.adjustmentAmount) : 0;

                return (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{entry.empId}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{entry.name}</div>
                      <div className="text-[10px] text-slate-400">{entry.department}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">{entry.branchName}</td>
                    <td className="p-3.5 text-center font-bold">{entry.carriedForwardDays}</td>
                    <td className="p-3.5 text-right font-mono font-semibold">
                      Rs. {paidAmt.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-900 dark:text-white">
                      {entry.actualDays !== null && entry.actualDays !== undefined ? entry.actualDays : "-"}
                    </td>
                    <td className="p-3.5 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      {entry.actualAmount !== null && entry.actualAmount !== undefined ? `Rs. ${actualAmt.toLocaleString()}` : "-"}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold">
                      {entry.auditStatus === "DISCREPANCY_OVERPAID" && (
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                          -Rs. {Math.abs(adjAmt).toLocaleString()} (Deduct)
                        </span>
                      )}
                      {entry.auditStatus === "DISCREPANCY_UNDERPAID" && (
                        <span className="text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          +Rs. {adjAmt.toLocaleString()} (Refund)
                        </span>
                      )}
                      {entry.auditStatus === "MATCHED" && (
                        <span className="text-slate-600 dark:text-slate-400 text-[11px]">Rs. 0</span>
                      )}
                      {(!entry.auditStatus || entry.auditStatus === "PENDING_AUDIT") && (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {entry.auditStatus === "MATCHED" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-bold uppercase">
                          Matched
                        </span>
                      )}
                      {entry.auditStatus === "DISCREPANCY_OVERPAID" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 text-[10px] font-bold uppercase">
                          Overpaid
                        </span>
                      )}
                      {entry.auditStatus === "DISCREPANCY_UNDERPAID" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] font-bold uppercase">
                          Underpaid
                        </span>
                      )}
                      {(!entry.auditStatus || entry.auditStatus === "PENDING_AUDIT") && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold uppercase">
                          Pending Audit
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => openAdjustmentModal(entry)}
                        className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
              {allEntries.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-2 block">assignment_late</span>
                    No employee payment records found for auditing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {activeEntryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">price_change</span>
                  Audit Adjustment for {activeEntryModal.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {activeEntryModal.empId} &bull; {activeEntryModal.branchName}
                </p>
              </div>
              <button onClick={() => setActiveEntryModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              {/* Comparison Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Disbursed (Paid) Days</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeEntryModal.carriedForwardDays} Days
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Disbursed Amount</span>
                  <p className="text-base font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    Rs. {Number(activeEntryModal.paidAmount || activeEntryModal.calculatedAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Audited Actual Days</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    required
                    value={actualDaysInput}
                    onChange={(e) => handleActualDaysChange(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Audited Actual Amount (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={actualAmountInput}
                    onChange={(e) => setActualAmountInput(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Dynamic Variance Preview */}
              {(() => {
                const paid = Number(activeEntryModal.paidAmount || activeEntryModal.calculatedAmount || 0);
                const diff = actualAmountInput - paid;
                return (
                  <div className={`p-3 rounded-xl border flex items-center justify-between font-bold ${
                    diff < 0
                      ? "bg-primary/5 border-primary/30 text-primary"
                      : diff > 0
                      ? "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-300"
                  }`}>
                    <span>Calculated Payroll Effect:</span>
                    <span className="font-mono text-sm">
                      {diff < 0 ? `-Rs. ${Math.abs(diff).toLocaleString()} (Deduct Next Salary)` : diff > 0 ? `+Rs. ${diff.toLocaleString()} (Refund Next Salary)` : "Rs. 0 (Fully Matched)"}
                    </span>
                  </div>
                );
              })()}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Auditor Adjustment Reason</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Discrepancy identified during branch register audit"
                  value={adjustmentReasonInput}
                  onChange={(e) => setAdjustmentReasonInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveEntryModal(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdjustment}
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-all cursor-pointer"
                >
                  {isSavingAdjustment ? "Saving..." : "Save Audit Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

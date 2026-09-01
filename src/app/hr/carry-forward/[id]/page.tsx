"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

export default function CarryForwardBatchDetails() {
  const params = useParams();
  const router = useRouter();

  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [financeSyncModal, setFinanceSyncModal] = useState<any>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/v1/carry-forward/batches/${params.id}`);
      setBatch(res.data);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: "Failed to load batch details.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDetails();
    }
  }, [params.id]);

  const handleVerifyBranch = async (branchName: string) => {
    setIsProcessing(true);
    setFeedbackMsg(null);
    try {
      await axiosInstance.post(`/api/v1/carry-forward/batches/${params.id}/verify-branch`, {
        branch: branchName,
        verifiedBy: "Branch Officer"
      });
      setFeedbackMsg({ text: `Branch "${branchName}" verified successfully!`, type: "success" });
      await fetchDetails();
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ text: err.response?.data?.message || "Failed to verify branch.", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveBatch = async () => {
    if (!window.confirm("Are you sure you want to approve this carry forward batch as Head Office HR?")) {
      return;
    }

    setIsProcessing(true);
    setFeedbackMsg(null);
    try {
      await axiosInstance.post(`/api/v1/carry-forward/batches/${params.id}/approve`, {
        approvedBy: "Head Office HR"
      });
      setFeedbackMsg({ text: "Batch successfully approved by Head Office HR!", type: "success" });
      await fetchDetails();
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ text: err.response?.data?.message || "Failed to approve batch.", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncFinance = async () => {
    if (!window.confirm("Are you sure you want to transmit this batch payload to the Finance API for disbursement?")) {
      return;
    }

    setIsProcessing(true);
    setFeedbackMsg(null);
    try {
      const res = await axiosInstance.post(`/api/v1/carry-forward/batches/${params.id}/sync-finance`);
      setFinanceSyncModal(res.data);
      await fetchDetails();
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ text: err.response?.data?.message || "Failed to sync to Finance API.", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-bold uppercase">Draft</span>;
      case "BRANCH_VERIFIED":
        return <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-full text-xs font-bold uppercase">Branch Verified</span>;
      case "HR_APPROVED":
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-xs font-bold uppercase">HR Approved</span>;
      case "FINANCE_SYNCED":
        return <span className="px-3 py-1 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-full text-xs font-bold uppercase">Finance Dispatched</span>;
      case "AUDITING":
        return <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 rounded-full text-xs font-bold uppercase">Auditing</span>;
      case "AUDITED":
        return <span className="px-3 py-1 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100 rounded-full text-xs font-bold uppercase">Audited</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  if (loading) return (
    <div className="p-16 text-center text-slate-500">
      <span className="material-symbols-outlined animate-spin text-3xl text-primary mb-2 block">sync</span>
      Loading carry forward batch details...
    </div>
  );

  if (!batch) return (
    <div className="p-16 text-center text-red-500">
      <span className="material-symbols-outlined text-4xl mb-2 block">error</span>
      Batch not found.
    </div>
  );

  const canApprove = (batch.status === "BRANCH_VERIFIED" || batch.status === "DRAFT") && batch.status !== "HR_APPROVED" && batch.status !== "FINANCE_SYNCED" && batch.status !== "AUDITED";
  const canSyncFinance = batch.status === "HR_APPROVED";
  const hasFinanceDispatched = batch.status === "FINANCE_SYNCED" || batch.status === "AUDITING" || batch.status === "AUDITED";

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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{batch.id}</h1>
              {getStatusBadge(batch.status)}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Year {batch.year} &bull; Created by {batch.submittedBy || "HR Admin"} &bull; {batch.totalEmployees} Employees Across {batch.branches?.length || 0} Branches
            </p>
          </div>
        </div>

        {/* Global Batch Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {canApprove && (
            <button
              onClick={handleApproveBatch}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all text-xs flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              Approve Batch (Head Office HR)
            </button>
          )}

          {canSyncFinance && (
            <button
              onClick={handleSyncFinance}
              disabled={isProcessing}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all text-xs flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Sync to Finance API
            </button>
          )}

          {hasFinanceDispatched && (
            <Link
              href={`/hr/carry-forward/audit?batchId=${batch.id}`}
              className="bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all text-xs flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              Open Audit Console
            </Link>
          )}
        </div>
      </div>

      {/* Notifications */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          feedbackMsg.type === "success" 
            ? "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700" 
            : "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">{feedbackMsg.type === "success" ? "check_circle" : "error"}</span>
            {feedbackMsg.text}
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="opacity-70 hover:opacity-100">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Employees</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{batch.totalEmployees}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Total Carried Days</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{batch.totalCarriedDays} Days</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-primary uppercase">Total Payment Calculation</span>
          <p className="text-xl font-bold text-primary font-mono mt-1">
            Rs. {Number(batch.totalCalculatedAmount || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Finance Dispatch Status</span>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">
              {batch.financeReferenceId ? "cloud_done" : "cloud_off"}
            </span>
            {batch.financeReferenceId ? batch.financeReferenceId : "Pending Dispatch"}
          </p>
        </div>
      </div>

      {/* Branch Sections */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">apartment</span>
          Branch-Wise Verification & Employee Entries
        </h2>

        {batch.branches?.map((branch: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Branch Header */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">location_on</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{branch.branchName}</h3>
                    {branch.isBranchVerified ? (
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-primary/20 text-[10px] font-bold uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-bold uppercase">
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {branch.employeeCount} Employees &bull; {branch.totalCarriedDays} Total Days &bull; Amount: Rs. {Number(branch.totalCalculatedAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Branch Action */}
              <div>
                {!branch.isBranchVerified && batch.status !== "HR_APPROVED" && batch.status !== "FINANCE_SYNCED" && (
                  <button
                    onClick={() => handleVerifyBranch(branch.branchName)}
                    disabled={isProcessing}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Verify Branch Entries
                  </button>
                )}
                {branch.isBranchVerified && (
                  <span className="text-[11px] text-slate-500 italic">
                    Verified by {branch.branchVerifiedBy || "Branch Officer"}
                  </span>
                )}
              </div>
            </div>

            {/* Employee Table for Branch */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/40 dark:bg-slate-800/20">
                    <th className="p-3.5">Emp ID</th>
                    <th className="p-3.5">Employee Name</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5 text-center">Carry Forward Days</th>
                    <th className="p-3.5 text-right">Daily Rate</th>
                    <th className="p-3.5 text-right">Calculated Payment</th>
                    <th className="p-3.5 text-center">Branch Status</th>
                    <th className="p-3.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {branch.entries?.map((entry: any, eIdx: number) => (
                    <tr key={eIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{entry.empId}</td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{entry.name}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{entry.department}</td>
                      <td className="p-3.5 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold">
                          {entry.carriedForwardDays}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        Rs. {Number(entry.dailyRate || 2500).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        Rs. {Number(entry.calculatedAmount || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center">
                        {entry.isBranchVerified ? (
                          <span className="text-primary font-bold flex items-center justify-center gap-1 text-[11px]">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            Verified
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 italic max-w-xs truncate">
                        {entry.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Finance Sync Confirmation Modal */}
      {financeSyncModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">send_and_archive</span>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transmitted to Finance API</h3>
              <p className="text-xs text-slate-500">
                Disbursement payload has been dispatched to the Finance payment gateway.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Finance Reference ID:</span>
                <span className="font-mono font-bold text-primary">{financeSyncModal.financeReferenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employees Disbursed:</span>
                <span className="font-bold text-slate-900 dark:text-white">{financeSyncModal.totalEmployeesDisbursed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Disbursement:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">Rs. {Number(financeSyncModal.totalAmountDisbursed || 0).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => setFinanceSyncModal(null)}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

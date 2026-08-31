"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import axiosInstance from "@/lib/axiosInstance";

export default function NewCarryForwardBatch() {
  const router = useRouter();
  const [fileError, setFileError] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entryMode, setEntryMode] = useState<"auto" | "upload">("auto");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Multi-Leave Type Selection & Caps State
  const [includeAnnual, setIncludeAnnual] = useState<boolean>(true);
  const [annualCap, setAnnualCap] = useState<number>(7);

  const [includeCasual, setIncludeCasual] = useState<boolean>(true);
  const [casualCap, setCasualCap] = useState<number>(3);

  const [includeMedical, setIncludeMedical] = useState<boolean>(false);
  const [medicalCap, setMedicalCap] = useState<number>(3);

  const handleFileChange = (file: File | null) => {
    setFileError("");
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File is too large. Maximum size is 5MB.");
        return;
      }
      if (!file.name.match(/\.(csv|xlsx|xls|txt)$/i)) {
        setFileError("File must be a CSV or text document.");
        return;
      }
      setDocumentFile(file);
    } else {
      setDocumentFile(null);
    }
  };

  const handleAutoGenerate = async () => {
    if (!includeAnnual && !includeCasual && !includeMedical) {
      setFileError("Please select at least one leave type to carry forward.");
      return;
    }

    setIsSubmitting(true);
    setFileError("");
    try {
      const res = await axiosInstance.post("/api/v1/carry-forward/generate", {
        year: selectedYear,
        submittedBy: "Head Office HR",
        includeAnnual,
        includeCasual,
        includeMedical,
        annualCap: Number(annualCap),
        casualCap: Number(casualCap),
        medicalCap: Number(medicalCap)
      });
      router.push(`/hr/carry-forward/${res.data.id}`);
    } catch (err: any) {
      console.error(err);
      setFileError(err.response?.data?.message || "Failed to generate batch from leave balances.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!documentFile) {
      setFileError("Please upload a CSV file first.");
      return;
    }
    
    setIsSubmitting(true);
    setFileError("");
    try {
      const formData = new FormData();
      formData.append("file", documentFile as File);
      formData.append("year", selectedYear.toString());
      formData.append("submittedBy", "Head Office HR");

      const res = await axiosInstance.post("/api/v1/carry-forward/upload", formData);
      router.push(`/hr/carry-forward/${res.data.id}`);
    } catch (err: any) {
      console.error(err);
      setFileError(err.response?.data?.message || "Failed to upload file. Please ensure it has the correct CSV format.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link 
          href="/hr/carry-forward" 
          className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Carry Forward Batch</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate from system leave balances or upload branch reports for {selectedYear}.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg w-fit">
            <button
              onClick={() => setEntryMode("auto")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                entryMode === "auto" 
                  ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm font-bold" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Auto-Generate from Balances
            </button>
            <button
              onClick={() => setEntryMode("upload")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                entryMode === "upload" 
                  ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm font-bold" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              Upload Branch CSV
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-500 uppercase">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>

        {fileError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-xl border border-red-200 dark:border-red-800/30 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <div className="text-sm font-medium">{fileError}</div>
          </div>
        )}

        {entryMode === "auto" ? (
          <div className="space-y-6">
            {/* Multi-Leave Type Configuration */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Eligible Leave Types & Policy Caps
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Annual Leave Card */}
                <div className={`p-4 rounded-xl border transition-all ${
                  includeAnnual 
                    ? "bg-primary/5 border-primary/50 dark:bg-primary/10 dark:border-primary/40 shadow-xs" 
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-900 dark:text-white">
                      <input
                        type="checkbox"
                        checked={includeAnnual}
                        onChange={(e) => setIncludeAnnual(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#8B3A00]"
                      />
                      Annual Leave
                    </label>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Unused statutory annual balance.</p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Max Cap:</span>
                    <select
                      disabled={!includeAnnual}
                      value={annualCap}
                      onChange={(e) => setAnnualCap(parseInt(e.target.value))}
                      className="px-2.5 py-1 font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value={3}>3 Days</option>
                      <option value={5}>5 Days</option>
                      <option value={7}>7 Days (Standard)</option>
                      <option value={10}>10 Days</option>
                      <option value={14}>14 Days (Full Quota)</option>
                    </select>
                  </div>
                </div>

                {/* Casual Leave Card */}
                <div className={`p-4 rounded-xl border transition-all ${
                  includeCasual 
                    ? "bg-primary/5 border-primary/50 dark:bg-primary/10 dark:border-primary/40 shadow-xs" 
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-900 dark:text-white">
                      <input
                        type="checkbox"
                        checked={includeCasual}
                        onChange={(e) => setIncludeCasual(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#8B3A00]"
                      />
                      Casual Leave
                    </label>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Include unused casual days incentive.</p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Max Cap:</span>
                    <select
                      disabled={!includeCasual}
                      value={casualCap}
                      onChange={(e) => setCasualCap(parseInt(e.target.value))}
                      className="px-2.5 py-1 font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value={1}>1 Day</option>
                      <option value={2}>2 Days</option>
                      <option value={3}>3 Days (Standard)</option>
                      <option value={5}>5 Days</option>
                      <option value={7}>7 Days (Full Quota)</option>
                    </select>
                  </div>
                </div>

                {/* Medical Leave Card */}
                <div className={`p-4 rounded-xl border transition-all ${
                  includeMedical 
                    ? "bg-primary/5 border-primary/50 dark:bg-primary/10 dark:border-primary/40 shadow-xs" 
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-900 dark:text-white">
                      <input
                        type="checkbox"
                        checked={includeMedical}
                        onChange={(e) => setIncludeMedical(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#8B3A00]"
                      />
                      Medical Leave
                    </label>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold">
                      Incentive
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Encash / carry unused medical quota.</p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Max Cap:</span>
                    <select
                      disabled={!includeMedical}
                      value={medicalCap}
                      onChange={(e) => setMedicalCap(parseInt(e.target.value))}
                      className="px-2.5 py-1 font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value={1}>1 Day</option>
                      <option value={2}>2 Days</option>
                      <option value={3}>3 Days (Standard)</option>
                      <option value={5}>5 Days</option>
                      <option value={7}>7 Days (Full Quota)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-sm">calculate</span>
                Consolidated Batch Calculation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Eligible days from each checked leave category are capped per policy and summed into each employee's carry-forward balance. The itemized breakdown will be preserved and visible on both the verification tables and the audit console.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <FileUploadDropzone
                onFileAccepted={handleFileChange}
                currentFile={documentFile}
                label="Upload Carry Forward Report (CSV/Text)"
              />
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex gap-3 border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-slate-400 text-lg">info</span>
              <div className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed space-y-1">
                <p className="font-semibold">Expected CSV Header Format:</p>
                <code className="bg-white dark:bg-black/40 px-2 py-1 rounded text-[11px] block border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200">
                  EmployeeCode, CarryForwardDays, DailyRate, Remarks
                </code>
                <p className="text-[11px] text-slate-500">Employee branches will be looked up automatically from employee master records.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          {entryMode === "auto" ? (
            <button 
              onClick={handleAutoGenerate}
              disabled={isSubmitting} 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 text-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Generating Batch...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  Generate Carry Forward Batch
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={handleUploadSubmit}
              disabled={isSubmitting || !documentFile} 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 text-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">file_upload</span>
                  Upload & Proceed to Review
                </>
              )}
            </button>
          )}
          <Link href="/hr/carry-forward" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium px-4 text-sm">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

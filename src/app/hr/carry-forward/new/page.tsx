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
  const [entryMode, setEntryMode] = useState<"upload" | "manual">("upload");

  const currentYear = new Date().getFullYear();

  const handleFileChange = (file: File | null) => {
    setFileError("");
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File is too large. Maximum size is 5MB.");
        return;
      }
      if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
        setFileError("File must be a CSV or Excel document.");
        return;
      }
      setDocumentFile(file);
    } else {
      setDocumentFile(null);
    }
  };

  const handleSubmit = async () => {
    if (entryMode === "upload" && !documentFile) {
      setFileError("Please upload a file first.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", documentFile as File);
      formData.append("year", currentYear.toString());
      formData.append("submittedBy", "HR User"); // In reality, get from auth context

      const res = await axiosInstance.post("/api/v1/carry-forward/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      router.push(`/hr/carry-forward/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setFileError("Failed to upload file. Please ensure it has the correct format.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/hr/carry-forward" className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Carry Forward Batch</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload a report or manually enter carry forward balances for {currentYear}.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex space-x-1 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setEntryMode("upload")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              entryMode === "upload" 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setEntryMode("manual")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              entryMode === "manual" 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Manual Entry
          </button>
        </div>

        {fileError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-xl border border-red-200 dark:border-red-800/30 flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-red-500">error</span>
            <div className="text-sm font-medium">{fileError}</div>
          </div>
        )}

        {entryMode === "upload" ? (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <FileUploadDropzone
                onFileAccepted={handleFileChange}
                currentFile={documentFile}
                label="Upload Carry Forward Report (CSV/Excel)"
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 border border-blue-100 dark:border-blue-900/30">
              <span className="material-symbols-outlined text-blue-500 text-lg">info</span>
              <div className="text-blue-800 dark:text-blue-200 text-xs leading-relaxed space-y-1">
                <p className="font-semibold">Expected File Format</p>
                <p>Your file must include columns for: <code className="bg-white/50 dark:bg-black/20 px-1 py-0.5 rounded">Employee ID</code>, <code className="bg-white/50 dark:bg-black/20 px-1 py-0.5 rounded">Location</code>, and <code className="bg-white/50 dark:bg-black/20 px-1 py-0.5 rounded">Carry Forward Days</code>.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="material-symbols-outlined text-4xl text-slate-400 mb-2 block">table_view</span>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Data Grid Coming Soon</h3>
              <p className="text-sm text-slate-500 mt-1">Manual entry grid is under construction. Please use the upload feature for now.</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-8 mt-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || (entryMode === "upload" && !documentFile)} 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg font-bold shadow-sm shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                Processing...
              </>
            ) : (
              <>
                Save & Proceed to Review
              </>
            )}
          </button>
          <Link href="/hr/carry-forward" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium px-4">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

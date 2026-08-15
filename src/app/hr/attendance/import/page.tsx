"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import api from "@/lib/axiosInstance";

type ImportResult = {
    insertedCount: number;
    duplicateCount: number;
    failedCount: number;
    errors: string[];
};

function getErrorMessage(error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
            return response.data.message;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Unable to import attendance file.";
}

export default function AttendanceImportPage() {
    const [deviceCode, setDeviceCode] = useState("DEVICE-001");
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!file) {
            setError("Please select the AAS CSV file.");
            return;
        }

        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("deviceCode", deviceCode.trim() || "DEVICE-001");

            const response = await api.post<ImportResult>("/api/attendance/import/aas-file", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setResult(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto w-full">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Import Attendance File
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Upload the CSV file exported from AAS.
                    </p>
                </div>
                <Link
                    href="/hr/attendance"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Daily Attendance
                </Link>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-5 mb-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            Device Code
                        </label>
                        <input
                            type="text"
                            value={deviceCode}
                            onChange={(event) => setDeviceCode(event.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                            placeholder="DEVICE-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            AAS CSV File
                        </label>
                        <input
                            type="file"
                            accept=".csv,text/csv"
                            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                        />
                    </div>
                </div>

                <div className="mt-5">
                    <button
                        type="submit"
                        disabled={uploading}
                        className="h-10 px-4 rounded-lg bg-amber-900 text-white text-sm font-semibold hover:bg-amber-800 transition-colors disabled:opacity-60"
                    >
                        {uploading ? "Uploading..." : "Upload File"}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {result && (
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-slate-500">Inserted</p>
                            <p className="text-2xl font-bold text-emerald-700">{result.insertedCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Duplicates</p>
                            <p className="text-2xl font-bold text-amber-700">{result.duplicateCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Failed</p>
                            <p className="text-2xl font-bold text-red-700">{result.failedCount}</p>
                        </div>
                    </div>

                    {result.errors?.length > 0 && (
                        <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4">
                            <p className="mb-3 text-sm font-semibold text-red-800">Import errors</p>
                            <ul className="space-y-2 text-sm text-red-700">
                                {result.errors.map((item, index) => (
                                    <li key={`${item}-${index}`}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

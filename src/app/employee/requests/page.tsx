"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import RecentRequestsTable, { RecentRequestItem } from "@/components/RecentRequestsTable";

export default function AllRequestsPage() {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<RecentRequestItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const employeeId = user?.employeeId || user?.id;
        if (!employeeId) return;

        setLoading(true);
        api.get(`/api/v1/dashboard/employee/${employeeId}/requests`)
            .then((res) => {
                setRequests(res.data);
            })
            .catch((err) => {
                console.error("Failed to fetch all requests", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user?.id, user?.employeeId]);

    return (
        <div className="max-w-7xl mx-auto w-full pb-12 p-6">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/employee" className="text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Requests</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View your complete request history.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Loading requests...</div>
            ) : (
                <RecentRequestsTable requests={requests} hideViewAll={true} />
            )}
        </div>
    );
}

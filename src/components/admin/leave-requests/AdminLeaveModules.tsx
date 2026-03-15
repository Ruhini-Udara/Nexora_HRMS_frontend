import React from "react";
import Link from "next/link";
import ModuleCard from "@/components/ui/ModuleCard";

export default function AdminLeaveModules() {
    return (
        <div className="max-w-7xl mx-auto w-full pt-20">
            {/* Page Header */}
            <div className="mb-8 pt-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Leave Approvals
                </h1>
                <p className="text-gray-500 text-base">
                    Review and verify employee leave requests requiring administrative attention.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                <Link href="/admin/leave-requests/overseas" className="block h-full group">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 h-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col">
                        <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[28px] text-primary">flight_takeoff</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            Overseas Leave Approvals
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed flex-grow">
                            Manage verification and board approval workflows for international travel leave.
                        </p>
                        <div className="mt-6 flex items-center text-primary font-semibold text-sm">
                            Open Module <span className="material-symbols-outlined ml-1 text-base">arrow_forward</span>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/leave-requests/maternity" className="block h-full group">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 h-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col">
                        <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[28px] text-primary">child_care</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            Maternity Leave Approvals
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed flex-grow">
                            Coordinate multi-stage processing for maternity, paternity, and adoption leave requests.
                        </p>
                        <div className="mt-6 flex items-center text-primary font-semibold text-sm">
                            Open Module <span className="material-symbols-outlined ml-1 text-base">arrow_forward</span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

import React from "react";
import Link from "next/link";

export default function LeaveModules() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Normal Leave Approvals Card */}
            <Link href="/hr/leave/normal-approvals" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined text-primary text-4xl">
                        event_available
                    </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Normal Leave Approvals
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                    Review and process standard daily and short-term leave requests from
                    employees.
                </p>
                <span className="text-primary font-bold text-sm flex items-center group-hover:gap-2 transition-all">
                    Open Module{" "}
                    <span className="material-icons-round text-sm ml-1">
                        arrow_forward
                    </span>
                </span>
            </Link>

            {/* Overseas Leave Verification & Board Flow Card */}
            <Link href="/hr/leave/leave-approvals" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined text-primary text-4xl">
                        travel_explore
                    </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Overseas Leave Verification & Board Flow
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                    Manage verification and board approval workflows for international
                    travel leave.
                </p>
                <span className="text-primary font-bold text-sm flex items-center group-hover:gap-2 transition-all">
                    Open Module{" "}
                    <span className="material-icons-round text-sm ml-1">
                        arrow_forward
                    </span>
                </span>
            </Link>

            {/* Maternity Leave Workflow Card */}
            <Link href="/hr/leave/maternity-approvals" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined text-primary text-4xl">
                        child_care
                    </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Maternity Leave Workflow
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                    Coordinate multi-stage processing for maternity, paternity, and
                    adoption leave requests.
                </p>
                <span className="text-primary font-bold text-sm flex items-center group-hover:gap-2 transition-all">
                    Open Module{" "}
                    <span className="material-icons-round text-sm ml-1">
                        arrow_forward
                    </span>
                </span>
            </Link>

            {/* Leave Calculation & Finalization Card */}
            <Link href="/hr/leave/calculation" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined text-primary text-4xl">
                        calculate
                    </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Leave Calculation & Finalization
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                    Perform final leave balance calculations and finalize records for
                    payroll integration.
                </p>
                <span className="text-primary font-bold text-sm flex items-center group-hover:gap-2 transition-all">
                    Open Module{" "}
                    <span className="material-icons-round text-sm ml-1">
                        arrow_forward
                    </span>
                </span>
            </Link>

            {/* Carry-Forward & Auditing Card */}
            <Link href="/hr/leave/auditing" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined text-primary text-4xl">
                        policy
                    </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Carry-Forward & Auditing
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                    Audit year-end balances and manage the carry-forward process into
                    the next period.
                </p>
                <span className="text-primary font-bold text-sm flex items-center group-hover:gap-2 transition-all">
                    Open Module{" "}
                    <span className="material-icons-round text-sm ml-1">
                        arrow_forward
                    </span>
                </span>
            </Link>
        </div>
    );
}

<<<<<<< feature-employee_training
export default function AttendancePage() {
    return (
        <div>
            <h1>Attendance Page</h1>
=======

import Link from "next/link";

export default function AttendancePage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Attendance
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Oversee employee attendance data, shift approvals, and overtime
                    verification.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Upload CSV / Data Cleansing Card */}
                <Link href="/hr/attendance/upload" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                        <span className="material-symbols-outlined text-primary text-4xl">
                            upload_file
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Upload CSV / Data Cleansing
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                        Bulk upload employee attendance records and perform data cleaning
                        for accuracy.
                    </p>
                    <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module{" "}
                        <span className="material-icons-round text-sm ml-1">
                            arrow_forward
                        </span>
                    </span>
                </Link>

                {/* Manual In/Out Approvals Card */}
                <Link href="/hr/attendance/approvals" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                        <span className="material-symbols-outlined text-primary text-4xl">
                            pending_actions
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Manual In/Out Approvals
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                        Review and approve or reject manual clock-in/out requests submitted
                        by employees.
                    </p>
                    <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module{" "}
                        <span className="material-icons-round text-sm ml-1">
                            arrow_forward
                        </span>
                    </span>
                </Link>

                {/* Team Attendance Card */}
                <Link href="/hr/attendance/team" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                        <span className="material-symbols-outlined text-primary text-4xl">
                            groups
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Team Attendance
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                        Monitor daily and weekly attendance patterns across various
                        departments and teams.
                    </p>
                    <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module{" "}
                        <span className="material-icons-round text-sm ml-1">
                            arrow_forward
                        </span>
                    </span>
                </Link>

                {/* Attendance Verification (monthly) Card */}
                <Link href="/hr/attendance/verification" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                        <span className="material-symbols-outlined text-primary text-4xl">
                            verified_user
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Attendance Verification (monthly)
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                        Perform final monthly verification of attendance logs for payroll
                        processing.
                    </p>
                    <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module{" "}
                        <span className="material-icons-round text-sm ml-1">
                            arrow_forward
                        </span>
                    </span>
                </Link>

                {/* OT Time Period Card */}
                <Link href="/hr/attendance/overtime" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                        <span className="material-symbols-outlined text-primary text-4xl">
                            timer
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        OT Time Period
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                        Define and manage overtime calculation rules and time periods for
                        the organization.
                    </p>
                    <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module{" "}
                        <span className="material-icons-round text-sm ml-1">
                            arrow_forward
                        </span>
                    </span>
                </Link>
            </div>
>>>>>>> main
        </div>
    );
}

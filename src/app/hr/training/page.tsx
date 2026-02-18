<<<<<<< feature-employee_training
export default function TrainingPage() {
    return (
        <div>
            <h1>Training Page</h1>
=======

import Link from "next/link";

export default function TrainingPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <nav className="flex mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <Link href="/hr" className="hover:text-primary">
                        Dashboard
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-primary">Training & Development</span>
                </nav>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Training & Development
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage and monitor employee skill development and training programs.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Training Plans Card */}
                <Link href="/hr/training/plans" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors text-primary">
                        <span className="material-symbols-outlined text-4xl">map</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Training Plans
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        Design and manage comprehensive training curriculums and learning
                        paths.
                    </p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module{" "}
                        <span className="material-icons-round text-sm ml-1">
                            arrow_forward
                        </span>
                    </span>
                </Link>

                {/* Scheduling Card */}
                <Link href="/hr/training/scheduling" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors text-primary">
                        <span className="material-symbols-outlined text-4xl">
                            calendar_month
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Scheduling
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        Plan and schedule upcoming training sessions, workshops, and
                        seminars.
                    </p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module{" "}
                        <span className="material-icons-round text-sm ml-1">
                            arrow_forward
                        </span>
                    </span>
                </Link>

                {/* Employee Selection Card */}
                <Link href="/hr/training/selection" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors text-primary">
                        <span className="material-symbols-outlined text-4xl">
                            group_add
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Employee Selection
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        Assign specific employees or departments to relevant training
                        programs.
                    </p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module{" "}
                        <span className="material-icons-round text-sm ml-1">
                            arrow_forward
                        </span>
                    </span>
                </Link>

                {/* Attendance Card */}
                <Link href="/hr/training/attendance" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer text-left">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors text-primary">
                        <span className="material-symbols-outlined text-4xl">
                            checklist
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Attendance
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        Track and verify employee participation and completion of scheduled
                        sessions.
                    </p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module{" "}
                        <span className="material-icons-round text-sm ml-1">
                            arrow_forward
                        </span>
                    </span>
                </Link>

                {/* Feedback & Reports Card */}
                <Link href="/hr/training/reports" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors text-primary">
                        <span className="material-symbols-outlined text-4xl">
                            assessment
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Feedback & Reports
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        Analyze program effectiveness through participant feedback and
                        detailed performance reports.
                    </p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
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

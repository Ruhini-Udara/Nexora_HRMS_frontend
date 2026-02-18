import React from "react";
import Link from "next/link";

export default function EmployeesModules() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Employee Transfers Card */}
            <Link href="/hr/employees/transfers" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-4xl">
                        swap_horiz
                    </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Employee Transfers
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-base mb-8 leading-relaxed flex-1">
                    Manage internal department transfers and role changes. Ensure
                    seamless transitions between teams and update reporting structures.
                </p>
                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                    <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all uppercase tracking-wider">
                        Open Module{" "}
                        <span className="material-icons-round text-lg ml-1">
                            arrow_forward
                        </span>
                    </span>
                </div>
            </Link>

            {/* Resignations Card */}
            <Link href="/hr/employees/resignations" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-4xl">
                        directions_walk
                    </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Resignations
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-base mb-8 leading-relaxed flex-1">
                    Track and process voluntary employee resignation requests. Manage
                    notice periods, exit interviews, and documentation.
                </p>
                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                    <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all uppercase tracking-wider">
                        Open Module{" "}
                        <span className="material-icons-round text-lg ml-1">
                            arrow_forward
                        </span>
                    </span>
                </div>
            </Link>

            {/* Terminations Card */}
            <Link href="/hr/employees/terminations" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-4xl">
                        assignment_late
                    </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Terminations
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-base mb-8 leading-relaxed flex-1">
                    Handle involuntary employee separations and offboarding. Manage
                    legal compliance, final settlements, and equipment recovery.
                </p>
                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                    <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all uppercase tracking-wider">
                        Open Module{" "}
                        <span className="material-icons-round text-lg ml-1">
                            arrow_forward
                        </span>
                    </span>
                </div>
            </Link>

            {/* Employee Death Card */}
            <Link href="/hr/employees/death" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-4xl">
                        potted_plant
                    </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Employee Death
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-base mb-8 leading-relaxed flex-1">
                    Manage records and benefits processing for deceased employees.
                    Coordinate with families for insurance claims and final benefits.
                </p>
                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                    <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all uppercase tracking-wider">
                        Open Module{" "}
                        <span className="material-icons-round text-lg ml-1">
                            arrow_forward
                        </span>
                    </span>
                </div>
            </Link>
        </div>
    );
}

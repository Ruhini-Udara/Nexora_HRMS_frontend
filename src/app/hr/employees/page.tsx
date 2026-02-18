
import Link from "next/link";

export default function EmployeesPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
            <div className="mb-8">
                <nav aria-label="Breadcrumb" className="flex mb-4">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link
                                href="/hr"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400"
                            >
                                <span className="material-icons-round text-base mr-2">
                                    dashboard
                                </span>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="material-icons-round text-gray-400 text-base">
                                    chevron_right
                                </span>
                                <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white md:ml-2">
                                    Employees Management
                                </span>
                            </div>
                        </li>
                    </ol>
                </nav>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Employees Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Handle internal mobility, departures, and employee record updates.
                </p>
            </div>

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
        </div>
    );
}

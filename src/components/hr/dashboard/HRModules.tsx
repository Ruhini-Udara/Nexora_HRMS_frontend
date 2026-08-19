import React from "react";
import Link from "next/link";

export default function HRModules() {
    return (
        <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">HR Management Modules</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                


                <Link href="/hr/employees" className="group bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors">
                        <span className="material-icons-round text-primary text-3xl">people</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Employees</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">View and update staff directory, roles, and basic contact information.</p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </Link>

                <Link href="/hr/documents" className="group bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors">
                        <span className="material-icons-round text-primary text-3xl">description</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Documents</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">Manage staff folders, upload contracts, and monitor document expirations.</p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </Link>

                <Link href="/hr/training" className="group bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors">
                        <span className="material-icons-round text-primary text-3xl">school</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Training & Development</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">Track employee skills growth, mandatory training, and career pathing.</p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </Link>

                <Link href="/hr/attendance" className="group bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors">
                        <span className="material-icons-round text-primary text-3xl">how_to_reg</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Attendance</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">Monitor daily check-ins, overtime hours, and attendance patterns.</p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </Link>

                <Link href="/hr/leave" className="group bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors">
                        <span className="material-icons-round text-primary text-3xl">event_note</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Leave Management</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">Process holiday requests, sick leaves, and manage the team calendar.</p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </Link>

                <Link href="/hr/welfare" className="group bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors">
                        <span className="material-icons-round text-primary text-3xl">volunteer_activism</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Welfare</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">Oversee employee benefits, wellness programs, and insurance claims.</p>
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </Link>

                <Link href="/hr/analytics" className="group bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border border-slate-700 card-shadow hover:border-primary transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/20 rounded-full blur-xl transition-transform group-hover:scale-150" />
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors backdrop-blur-sm border border-white/10">
                        <span className="material-icons-round text-white text-3xl">dashboard</span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2 relative z-10">Analytics</h4>
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed relative z-10">View real-time HR analytics, delayed approvals, and department impact.</p>
                    <span className="text-primary font-bold text-sm flex items-center group-hover:gap-2 transition-all relative z-10">
                        Open Analytics <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </Link>
            </div>
        </div>
    );
}

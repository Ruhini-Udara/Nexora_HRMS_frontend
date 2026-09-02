import React from "react";
import Link from "next/link";

const modules = [
    {
        title: "Transfer Executions",
        description:
            "Finalize branch transfers for employees. Update their active branch records in the system.",
        icon: "swap_horiz",
        href: "/admin/employee-actions/transfers",
    },
    {
        title: "Resignation Executions",
        description:
            "Finalize voluntary separations. Mark the employee as resigned and inactive in the system.",
        icon: "directions_walk",
        href: "/admin/employee-actions/resignations",
    },
    {
        title: "Termination Executions",
        description:
            "Execute involuntary separations. Immediately revoke access and mark employee as terminated.",
        icon: "assignment_late",
        href: "/admin/employee-actions/terminations",
    },
    {
        title: "Death Executions",
        description:
            "Execute final system updates for deceased employees. Mark records appropriately.",
        icon: "potted_plant",
        href: "/admin/employee-actions/death-applications",
    },
];

export default function EmployeeActionsModules() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {modules.map((mod) => (
                <Link
                    key={mod.title}
                    href={mod.href}
                    className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer"
                >
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors text-primary">
                        <span className="material-symbols-outlined text-4xl">
                            {mod.icon}
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {mod.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        {mod.description}
                    </p>
                    <span className="text-primary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Execute Action{" "}
                        <span className="material-icons-round text-sm ml-1">
                            arrow_forward
                        </span>
                    </span>
                </Link>
            ))}
        </div>
    );
}

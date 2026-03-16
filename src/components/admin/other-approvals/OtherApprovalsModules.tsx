import React from "react";
import Link from "next/link";

const modules = [
    {
        title: "Transfer Requests",
        description:
            "Review and finalize employee transfers approved by HR. Manage Committee and Board approval cycles.",
        icon: "swap_horiz",
        href: "/admin/other-approvals/transfers",
    },
    {
        title: "Resignation Requests",
        description:
            "Finalize voluntary separations, verify notice periods, and approve exit documentation.",
        icon: "directions_walk",
        href: "/admin/other-approvals/resignations",
    },
    {
        title: "Termination Requests",
        description:
            "Approve involuntary separations and ensure legal and equipment recovery compliance.",
        icon: "assignment_late",
        href: "/admin/other-approvals/terminations",
    },
    {
        title: "Death Application Requests",
        description:
            "Verify and authorize final benefits and insurance claims for deceased employee records.",
        icon: "potted_plant",
        href: "/admin/other-approvals/death-applications",
    },
];

export default function OtherApprovalsModules() {
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
                    <span className="text-secondary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Open Module{" "}
                        <span className="material-icons-round text-sm ml-1">
                            arrow_forward
                        </span>
                    </span>
                </Link>
            ))}
        </div>
    );
}




import Link from "next/link";

export default function DocumentsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
            <div className="mb-8">

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Documents Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Oversee employee documentation, compliance records, and company
                    policies.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Document Verification Card */}
                <Link href="/hr/documents/verification" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-primary text-4xl">
                            verified_user
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Document Verification
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-8 leading-relaxed flex-1">
                        Review and verify pending employee document submissions for
                        compliance and accuracy.
                    </p>
                    <div className="pt-4 border-t border-border-light dark:border-border-dark">
                        <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all uppercase tracking-wider">
                            OPEN MODULE{" "}
                            <span className="material-icons-round text-lg ml-1">
                                arrow_forward
                            </span>
                        </span>
                    </div>
                </Link>

                {/* Document History Card */}
                <Link href="/hr/documents/history" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-primary text-4xl">
                            history
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Document History
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-8 leading-relaxed flex-1">
                        Access a complete historical log of all document uploads,
                        modifications, and verification statuses.
                    </p>
                    <div className="pt-4 border-t border-border-light dark:border-border-dark">
                        <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all uppercase tracking-wider">
                            OPEN MODULE{" "}
                            <span className="material-icons-round text-lg ml-1">
                                arrow_forward
                            </span>
                        </span>
                    </div>
                </Link>

                {/* Employee Files Card */}
                <Link href="/hr/documents/files" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-primary text-4xl">
                            folder_shared
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Employee Files
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-8 leading-relaxed flex-1">
                        Browse and manage organized digital personnel files for all active
                        and inactive employees.
                    </p>
                    <div className="pt-4 border-t border-border-light dark:border-border-dark">
                        <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all uppercase tracking-wider">
                            OPEN MODULE{" "}
                            <span className="material-icons-round text-lg ml-1">
                                arrow_forward
                            </span>
                        </span>
                    </div>
                </Link>

                {/* Company Policies Card */}
                <Link href="/hr/documents/policies" className="group bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark card-shadow hover:border-primary transition-all cursor-pointer flex flex-col h-full">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-primary text-4xl">
                            policy
                        </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Company Policies
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-8 leading-relaxed flex-1">
                        Manage and update internal company policies, standard operating
                        procedures, and compliance guidelines.
                    </p>
                    <div className="pt-4 border-t border-border-light dark:border-border-dark">
                        <span className="text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all uppercase tracking-wider">
                            OPEN MODULE{" "}
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

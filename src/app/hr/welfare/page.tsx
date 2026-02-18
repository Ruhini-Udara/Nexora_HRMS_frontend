
import Link from "next/link";

export default function WelfarePage() {
    return (
        <div className="p-10 max-w-7xl mx-auto w-full flex-1">
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                    Welfare Management
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
                    Process employee welfare applications and certification approvals.
                </p>
            </div>

            <div className="max-w-4xl">
                {/* Welfare Certification & Approvals Card */}
                <Link href="/hr/welfare/approvals" className="bg-white dark:bg-surface-dark rounded-[24px] border border-border-light dark:border-border-dark card-shadow overflow-hidden flex flex-col md:flex-row items-center p-12 gap-12 group hover:border-primary/30 transition-all duration-300">
                    <div className="w-40 h-40 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <span className="material-symbols-outlined text-primary text-7xl">
                            shield_with_heart
                        </span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Welfare Certification & Approvals
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                            Review and verify employee welfare benefit requests, healthcare
                            certifications, and official support documents.
                        </p>
                        <span className="inline-flex items-center text-primary font-bold text-xl hover:translate-x-1 transition-transform">
                            Open Module
                            <span className="material-icons-round ml-2 text-2xl">
                                arrow_forward
                            </span>
                        </span>
                    </div>
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    {/* Request History Card */}
                    <Link href="/hr/welfare/history" className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-border-light dark:border-border-dark card-shadow hover:border-primary/40 transition-all cursor-pointer group">
                        <div className="flex items-center gap-5 mb-5">
                            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <span className="material-icons-round text-primary text-2xl">
                                    history_edu
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                Request History
                            </h4>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            View past processed applications and detailed audit trails for all
                            welfare actions.
                        </p>
                        <span className="text-sm font-bold text-primary inline-flex items-center group-hover:underline">
                            Manage History
                            <span className="material-icons-round text-base ml-1">
                                chevron_right
                            </span>
                        </span>
                    </Link>

                    {/* Policy Settings Card */}
                    <Link href="/hr/welfare/policies" className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-border-light dark:border-border-dark card-shadow hover:border-primary/40 transition-all cursor-pointer group">
                        <div className="flex items-center gap-5 mb-5">
                            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <span className="material-icons-round text-primary text-2xl">
                                    settings_suggest
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                Policy Settings
                            </h4>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Configure benefit limits, eligibility criteria, and customized
                            approval workflows.
                        </p>
                        <span className="text-sm font-bold text-primary inline-flex items-center group-hover:underline">
                            Configure
                            <span className="material-icons-round text-base ml-1">
                                chevron_right
                            </span>
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

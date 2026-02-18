import Link from "next/link";
import LeaveModules from "@/components/hr/leave/LeaveModules";

export default function LeavePage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-10">
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
                                    Leave Management
                                </span>
                            </div>
                        </li>
                    </ol>
                </nav>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Leave Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Administer employee leave requests, specialized workflows, and balance
                    auditing.
                </p>
            </div>

            <LeaveModules />
        </div>
    );
}

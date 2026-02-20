
import LeaveModules from "@/components/hr/leave/LeaveModules";

export default function LeavePage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-10">

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

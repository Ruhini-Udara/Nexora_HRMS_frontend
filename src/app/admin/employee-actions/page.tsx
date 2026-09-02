import EmployeeActionsModules from "@/components/admin/employee-actions/EmployeeActionsModules";

export default function EmployeeActionsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Employee Actions
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Execute final system changes for approved employee requests (System Removals, Branch Transfers, etc.).
                </p>
            </div>

            <EmployeeActionsModules />
        </div>
    );
}

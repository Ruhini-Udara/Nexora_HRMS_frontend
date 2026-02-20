
import EmployeesModules from "@/components/hr/employees/EmployeesModules";

export default function EmployeesPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
            <div className="mb-8">

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Employees Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Handle internal mobility, departures, and employee record updates.
                </p>
            </div>

            <EmployeesModules />
        </div>
    );
}

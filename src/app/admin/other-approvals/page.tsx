
import OtherApprovalsModules from "@/components/admin/other-approvals/OtherApprovalsModules";

export default function OtherApprovalsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Other Approvals
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Review and finalize pending administrative actions across departments.
                </p>
            </div>

            <OtherApprovalsModules />
        </div>
    );
}

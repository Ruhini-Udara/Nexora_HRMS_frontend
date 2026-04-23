import ResignationRequestsTable from '@/components/director/resignations/ResignationRequestsTable';
import Link from 'next/link';

export default function DirectorResignationsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resignation Approvals</h1>
                    <p className="text-gray-500 mt-1">Review and approve employee resignations and handover documentation.</p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-8">
                <div className="w-full">
                    <ResignationRequestsTable />
                </div>
            </div>
        </div>
    );
}

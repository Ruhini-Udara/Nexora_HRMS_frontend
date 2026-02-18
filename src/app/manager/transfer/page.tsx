import TransferStats from '@/components/manager/transfer/TransferStats';
import TransferTable from '@/components/manager/transfer/TransferTable';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TransferRequestsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>

                    <h1 className="text-2xl font-bold text-gray-900">Transfer Requests</h1>
                    <p className="text-gray-500 mt-1">Manage internal transfer applications and department changes.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                        New Transfer Request
                    </button>
                </div>
            </div>

            {/* Stats */}
            <TransferStats />

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3">



                    <div className="flex justify-end mb-4">
                        <Link href="#" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                            View Transfer List <span className="text-lg leading-none">&rarr;</span>
                        </Link>
                    </div>
                    <TransferTable />
                </div>
            </div>
        </div>
    );
}

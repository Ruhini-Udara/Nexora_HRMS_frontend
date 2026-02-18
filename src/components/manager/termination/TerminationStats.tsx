import { ClipboardList, TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';

export default function TerminationStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-sm font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        <span>3.5%</span>
                    </div>
                </div>
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Applications</p>
                    <h3 className="text-3xl font-bold text-gray-900">56</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                        <TrendingDown className="w-4 h-4" />
                        <span>1.2%</span>
                    </div>
                </div>
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Pending Review</p>
                    <h3 className="text-3xl font-bold text-gray-900">8</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500 text-sm font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        <span>8.2%</span>
                    </div>
                </div>
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Approved This Month</p>
                    <h3 className="text-3xl font-bold text-gray-900">12</h3>
                </div>
            </div>
        </div>
    );
}

import { ClipboardList, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

export default function DeathStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Applications */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Total Applications</p>
                    <div className="flex flex-col">
                        <h3 className="text-3xl font-bold text-gray-900">124</h3>
                        <span className="text-emerald-500 text-sm font-semibold flex items-center mt-1">
                            <TrendingUp className="w-4 h-4 mr-0.5" />
                            5.2%
                        </span>
                    </div>
                </div>
                <div className="w-14 h-14 bg-[#FDF4F0] rounded-2xl flex items-center justify-center text-primary">
                    <ClipboardList className="w-8 h-8" />
                </div>
            </div>

            {/* Pending Review */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Pending Review</p>
                    <div className="flex flex-col items-start gap-1">
                        <h3 className="text-3xl font-bold text-gray-900">12</h3>
                        <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            High Priority
                        </span>
                    </div>
                </div>
                <div className="w-14 h-14 bg-[#FDF4F0] rounded-2xl flex items-center justify-center text-primary">
                    <Clock className="w-8 h-8" />
                </div>
            </div>

            {/* Processed Claims */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Processed Claims</p>
                    <div className="flex flex-col">
                        <h3 className="text-3xl font-bold text-gray-900">28</h3>
                        <p className="text-gray-400 text-sm mt-1">This Month</p>
                    </div>
                </div>
                <div className="w-14 h-14 bg-[#E8F5E9] rounded-2xl flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ResignationStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Total Resignations</span>
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">124</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">+12% from last year</span>
                </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Pending Review</span>
                    <div className="size-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">18</p>
                <div className="flex items-center gap-1 mt-1 text-secondary">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Action Required</span>
                </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Approved This Month</span>
                    <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">42</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Processed smoothly</span>
                </div>
            </div>
        </div>
    );
};

export default ResignationStats;

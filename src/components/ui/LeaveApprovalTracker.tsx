import React from 'react';

export type ApprovalStep = {
    id: string;
    label: string;
    description: string;
    icon: string;
    status: 'completed' | 'current' | 'pending' | 'rejected';
    date?: string;
    approverName?: string;
};

interface LeaveApprovalTrackerProps {
    steps: ApprovalStep[];
    currentStepIndex: number;
    className?: string;
}

export function LeaveApprovalTracker({ steps, currentStepIndex, className = "" }: LeaveApprovalTrackerProps) {
    return (
        <div className={`w-full py-6 flex flex-col items-center ${className}`}>
            <div className="w-full max-w-4xl relative">
                {/* Connecting Line Background */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 rounded-full z-0 hidden sm:block mx-12"></div>

                {/* Active Connecting Line Overlay (Animate width based on progress) */}
                <div
                    className="absolute top-8 left-0 h-1 bg-primary rounded-full z-0 transition-all duration-700 ease-in-out hidden sm:block mx-12"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-6 sm:gap-0">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStepIndex || step.status === 'completed';
                        const isCurrent = index === currentStepIndex && step.status !== 'completed' && step.status !== 'rejected';
                        const isRejected = step.status === 'rejected';
                        const isPending = index > currentStepIndex;

                        return (
                            <div key={step.id} className="flex flex-row sm:flex-col items-start sm:items-center w-full sm:w-1/4 relative group">
                                {/* Vertical line for mobile */}
                                {index !== steps.length - 1 && (
                                    <div className="absolute left-8 top-16 bottom-[-24px] w-0.5 bg-slate-200 dark:bg-slate-700 sm:hidden z-0"></div>
                                )}
                                {index !== steps.length - 1 && isCompleted && (
                                    <div className="absolute left-8 top-16 bottom-[-24px] w-0.5 bg-primary sm:hidden z-0"></div>
                                )}

                                {/* Icon Circle */}
                                <div className={`
                                    w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 z-10
                                    mb-0 sm:mb-4 mr-4 sm:mr-0 border-4
                                    ${isCompleted ? 'bg-primary text-white border-white dark:border-slate-900 shadow-md shadow-primary/30' : ''}
                                    ${isCurrent ? 'bg-white dark:bg-slate-800 text-primary border-primary shadow-lg shadow-primary/20 scale-110' : ''}
                                    ${isRejected ? 'bg-red-500 text-white border-white dark:border-slate-900 shadow-md shadow-red-500/30' : ''}
                                    ${isPending ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-white dark:border-slate-900' : ''}
                                `}>
                                    <span className={`material-symbols-outlined text-2xl ${isCurrent ? 'animate-pulse' : ''}`}>
                                        {isCompleted ? 'check' : isRejected ? 'close' : step.icon}
                                    </span>
                                </div>

                                {/* Text Content */}
                                <div className="flex flex-col sm:items-center sm:text-center mt-2 sm:mt-0">
                                    <h4 className={`text-sm sm:text-base font-bold transition-colors duration-300
                                        ${isCompleted || isCurrent ? 'text-slate-900 dark:text-white' : ''}
                                        ${isRejected ? 'text-red-500' : ''}
                                        ${isPending ? 'text-slate-400 dark:text-slate-500' : ''}
                                    `}>
                                        {step.label}
                                    </h4>

                                    <p className={`text-xs mt-1 max-w-[150px]
                                        ${isCompleted || isCurrent ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}
                                    `}>
                                        {step.description}
                                    </p>

                                    {/* Additional info (Date/Approver) */}
                                    {(step.date || step.approverName) && (
                                        <div className="mt-2 text-[10px] sm:text-xs bg-slate-100 dark:bg-slate-800/50 rounded p-1.5 inline-block text-slate-500 dark:text-slate-400 sm:min-h-[28px]">
                                            {step.date && <span className="block font-medium">{step.date}</span>}
                                            {step.approverName && <span className="block">{step.approverName}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

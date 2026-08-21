import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react';

interface Step {
    label: string;
    status: 'completed' | 'current' | 'pending';
    isDelayed?: boolean;
    timeSpent?: string;
}

interface WorkflowTrackerStepperProps {
    steps: Step[];
}

export function WorkflowTrackerStepper({ steps }: WorkflowTrackerStepperProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Approval Bottleneck Tracker
            </h3>
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700" />
                
                <div className="space-y-8 relative">
                    {steps.map((step, index) => {
                        const isLast = index === steps.length - 1;
                        return (
                            <div key={index} className="flex gap-4 items-start relative">
                                {/* Icon */}
                                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-900
                                    ${step.status === 'completed' ? 'text-green-500' : 
                                      step.status === 'current' ? (step.isDelayed ? 'text-red-500' : 'text-primary') : 
                                      'text-slate-300 dark:text-slate-600'}`}
                                >
                                    {step.status === 'completed' ? (
                                        <CheckCircle2 className="w-6 h-6 bg-white dark:bg-slate-900" />
                                    ) : step.status === 'current' && step.isDelayed ? (
                                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                                    ) : step.status === 'current' ? (
                                        <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20" />
                                    ) : (
                                        <Circle className="w-5 h-5" />
                                    )}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-center">
                                        <p className={`font-semibold ${
                                            step.status === 'completed' ? 'text-slate-700 dark:text-slate-300' :
                                            step.status === 'current' ? (step.isDelayed ? 'text-red-600 dark:text-red-400' : 'text-primary') :
                                            'text-slate-400 dark:text-slate-500'
                                        }`}>
                                            {step.label}
                                        </p>
                                        {step.timeSpent && (
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                step.isDelayed ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                                {step.timeSpent}
                                            </span>
                                        )}
                                    </div>
                                    {step.status === 'current' && step.isDelayed && (
                                        <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            Action required. Escalation pending.
                                        </p>
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

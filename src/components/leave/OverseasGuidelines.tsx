import React from "react";

export function OverseasGuidelines() {
    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">gavel</span>
                Important Guidelines
            </h3>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-[16px] text-amber-500 mt-0.5">warning</span>
                    <span>All mandatory documents must be uploaded correctly. Incorrect documents will lead to rejection.</span>
                </li>
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-[16px] text-blue-500 mt-0.5">schedule</span>
                    <span>Submit the application at least 14 days prior to your travel date to ensure timely processing.</span>
                </li>
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-[16px] text-emerald-500 mt-0.5">verified_user</span>
                    <span>
                        Save as Draft will keep your information safely until you collect all documents. Once submitted, it cannot be edited.
                    </span>
                </li>
            </ul>
        </div>
    );
}

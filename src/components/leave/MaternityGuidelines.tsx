import React from "react";

export function MaternityGuidelines() {
    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">gavel</span>
                Important Guidelines
            </h3>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">looks_one</span>
                    <span><strong>First Level:</strong> 84 Working Day leaves with full salary.</span>
                </li>
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">looks_two</span>
                    <span><strong>Second Level:</strong> Another 84 Calendar Day leaves with half (1/2) salary.</span>
                </li>
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">looks_3</span>
                    <span><strong>Third Level:</strong> Another 84 Calendar Day leaves without salary.</span>
                </li>
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-[16px] text-rose-500 mt-0.5">child_care</span>
                    <span>If returning after the First Level, you are entitled to get Half an Hour (1/2Hrs) leave for both Morning &amp; Evening until the child reaches 5 Months (with salary).</span>
                </li>
                <li className="flex gap-3">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">description</span>
                    <span>Both Maternity Leave Request Letter and Medical Certificate are mandatory for the application.</span>
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

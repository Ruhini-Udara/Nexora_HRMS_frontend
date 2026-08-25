import { UseFormRegister, FieldErrors, FieldValues, Path } from "react-hook-form";

interface Props<T extends FieldValues> {
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    isDisabled: boolean;
    noOfDays: string;
}

export function MaternityLeaveDetailsSection<T extends FieldValues>({ register, errors, isDisabled, noOfDays }: Props<T>) {
    return (
        <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Leave Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Leave Request Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        disabled={isDisabled}
                        {...register("leaveReason" as Path<T>)}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-3 outline-none disabled:opacity-60 ${errors.leaveReason ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Please elaborate on your leave request..."
                        rows={3}
                    />
                    {errors.leaveReason && <p className="text-red-500 text-xs mt-1">{errors.leaveReason.message?.toString()}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("startDate" as Path<T>)}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.startDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                        type="date"
                    />
                    {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message?.toString()}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Maternity Leave Level <span className="text-red-500">*</span>
                    </label>
                    <select
                        disabled={isDisabled}
                        {...register("level" as Path<T>)}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 appearance-none ${errors.level ? 'border-red-500 focus:ring-red-500' : ''}`}
                    >
                        <option value="" disabled>Select Level</option>
                        <option value="Level 1">Level 1 (84 Working Days, Full Salary)</option>
                        <option value="Level 2">Level 2 (84 Calendar Days, Half Salary)</option>
                        <option value="Level 3">Level 3 (84 Calendar Days, No Salary)</option>
                    </select>
                    {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level.message?.toString()}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date of Request</label>
                    <input
                        disabled
                        {...register("dateOfRequest" as Path<T>)}
                        className="w-full bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 p-2.5 outline-none cursor-not-allowed"
                        type="date"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        No. of Requesting Dates
                    </label>
                    <input
                        disabled
                        value={noOfDays}
                        className="w-full bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 p-2.5 outline-none font-bold"
                        type="text"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Child Number <span className="text-red-500">*</span>
                    </label>
                    <select
                        disabled={isDisabled}
                        {...register("childNumber" as Path<T>)}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 appearance-none ${errors.childNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                    >
                        <option value="" disabled>Select Child Number</option>
                        <option value="1">1st Child</option>
                        <option value="2">2nd Child</option>
                        <option value="3">3rd Child or more</option>
                    </select>
                    {errors.childNumber && <p className="text-red-500 text-xs mt-1">{errors.childNumber.message?.toString()}</p>}
                </div>
            </div>
        </section>
    );
}

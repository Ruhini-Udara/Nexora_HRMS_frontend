import { UseFormRegister, FieldErrors, FieldValues, Path } from "react-hook-form";

interface Props<T extends FieldValues> {
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    isDisabled: boolean;
    noOfDays: string;
}

export function OverseasTravelDetailsSection<T extends FieldValues>({ register, errors, isDisabled, noOfDays }: Props<T>) {
    return (
        <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Leave & Travel Details
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
                        placeholder="Please elaborate on your travel plans..."
                        rows={3}
                    />
                    {errors.leaveReason && <p className="text-red-500 text-xs mt-1">{(errors.leaveReason as any).message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("startDate" as Path<T>)}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 transition-colors ${errors.startDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                        type="date"
                    />
                    {errors.startDate && <p className="text-red-500 text-xs mt-1">{(errors.startDate as any).message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("endDate" as Path<T>)}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 transition-colors ${errors.endDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                        type="date"
                    />
                    {errors.endDate && <p className="text-red-500 text-xs mt-1">{(errors.endDate as any).message}</p>}
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
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Passport Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("passportNumber" as Path<T>)}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.passportNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="e.g. NXXXXXXX"
                        type="text"
                    />
                    {errors.passportNumber && <p className="text-red-500 text-xs mt-1">{(errors.passportNumber as any).message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Passport Expired Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("passportExpDate" as Path<T>)}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.passportExpDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                        type="date"
                    />
                    {errors.passportExpDate && <p className="text-red-500 text-xs mt-1">{(errors.passportExpDate as any).message}</p>}
                </div>
            </div>
        </section>
    );
}

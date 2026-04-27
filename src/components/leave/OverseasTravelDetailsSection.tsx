import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface Props {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    isDisabled: boolean;
    noOfDays: string;
}

export function OverseasTravelDetailsSection({ register, errors, isDisabled, noOfDays }: Props) {
    return (
        <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Leave &amp; Travel Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Leave Request Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        disabled={isDisabled}
                        {...register("leaveReason")}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-3 outline-none disabled:opacity-60 ${errors.leaveReason ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Please elaborate on your travel plans..."
                        rows={3}
                    />
                    {errors.leaveReason && <p className="text-red-500 text-xs mt-1">{errors.leaveReason.message as string}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("startDate")}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 transition-colors ${errors.startDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                        type="date"
                    />
                    {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message as string}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("endDate")}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 transition-colors ${errors.endDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                        type="date"
                    />
                    {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message as string}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date of Request</label>
                    <input
                        disabled
                        {...register("dateOfRequest")}
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
                        {...register("passportNumber")}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.passportNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="e.g. NXXXXXXX"
                        type="text"
                    />
                    {errors.passportNumber && <p className="text-red-500 text-xs mt-1">{errors.passportNumber.message as string}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Passport Expired Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("passportExpDate")}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.passportExpDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                        type="date"
                    />
                    {errors.passportExpDate && <p className="text-red-500 text-xs mt-1">{errors.passportExpDate.message as string}</p>}
                </div>
            </div>
        </section>
    );
}

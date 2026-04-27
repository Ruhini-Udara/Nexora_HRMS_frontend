import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface Props {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    isDisabled: boolean;
    children?: React.ReactNode;
}

export function EmployeeDetailsSection({ register, errors, isDisabled, children }: Props) {
    return (
        <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Employee Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Employee Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("employeeName")}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.employeeName ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Full name"
                        type="text"
                    />
                    {errors.employeeName && <p className="text-red-500 text-xs mt-1">{errors.employeeName.message as string}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        EPF Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("epfNumber")}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.epfNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Enter EPF Number"
                        type="text"
                    />
                    {errors.epfNumber && <p className="text-red-500 text-xs mt-1">{errors.epfNumber.message as string}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("designation")}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.designation ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Your role"
                        type="text"
                    />
                    {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message as string}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Branch <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("branch")}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.branch ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="e.g. Head Office"
                        type="text"
                    />
                    {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch.message as string}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("contactNumber")}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.contactNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="+94 77 XXXXXXX"
                        type="text"
                    />
                    {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message as string}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        E-mail Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        disabled={isDisabled}
                        {...register("email")}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none disabled:opacity-60 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="your.email@example.com"
                        type="email"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                </div>
                {children}
            </div>
        </section>
    );
}

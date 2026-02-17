"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    endAdornment?: React.ReactNode;
}

const InputIcon = React.forwardRef<HTMLInputElement, InputIconProps>(
    ({ className, type, icon, iconPosition = "left", endAdornment, ...props }, ref) => {
        return (
            <div className="relative group">
                {icon && iconPosition === "left" && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#8B3A00] transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3.5 text-sm text-zinc-900 dark:text-white transition-all",
                        "focus:outline-none focus:ring-2 focus:ring-[#8B3A00]/20 focus:border-[#8B3A00] dark:focus:border-[#8B3A00]",
                        "placeholder:text-zinc-400",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        icon && iconPosition === "left" && "pl-11",
                        endAdornment && "pr-12",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {endAdornment && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        {endAdornment}
                    </div>
                )}
            </div>
        );
    }
);
InputIcon.displayName = "InputIcon";

export { InputIcon };

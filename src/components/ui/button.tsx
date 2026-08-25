import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
    default: "bg-[#8a3b00] text-white hover:opacity-95",
    outline: "border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700",
    ghost: "bg-transparent text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800",
};

export function buttonVariants({ variant = "default" }: { variant?: ButtonVariant }) {
    const base =
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#8a3b00]/30 disabled:opacity-50 disabled:pointer-events-none";
    return `${base} ${variantClasses[variant]}`;
}

export function Button({
    className = "",
    variant = "default",
    ...props
}: ButtonProps) {
    return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}

export default Button;

import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost";
};

export function Button({
    className = "",
    variant = "default",
    ...props
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#8a3b00]/30 disabled:opacity-50 disabled:pointer-events-none";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
        default: "bg-[#8a3b00] text-white hover:opacity-95",
        outline: "border bg-white text-gray-800 hover:bg-gray-50",
        ghost: "bg-transparent text-gray-800 hover:bg-gray-100",
    };

    return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export default Button;

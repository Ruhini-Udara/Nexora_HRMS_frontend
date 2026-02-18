import React from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
    children: React.ReactNode;
    className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
    return (
        <div className={cn(
            "bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 md:p-12 transition-all duration-300",
            className
        )}>
            {children}
        </div>
    );
}

interface AuthHeaderProps {
    title: string;
    subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
    return (
        <div className="text-center mb-10">
            {subtitle && (
                <span className="text-zinc-400 dark:text-zinc-500 text-xs font-medium uppercase tracking-widest block mb-2">
                    {subtitle}
                </span>
            )}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#8B3A00] dark:text-[#E5BA73] tracking-tight">
                {title}
            </h1>
        </div>
    );
}

interface AuthFooterLinksProps {
    links: Array<{ label: string; href: string }>;
}

export function AuthFooterLinks({ links }: AuthFooterLinksProps) {
    return (
        <div className="mt-12 flex justify-center space-x-6 text-white/70 text-sm font-medium">
            {links.map((link, index) => (
                <React.Fragment key={`${link.href}-${index}`}>
                    {index > 0 && <span className="opacity-30">•</span>}
                    <a href={link.href} className="hover:text-white transition-colors">
                        {link.label}
                    </a>
                </React.Fragment>
            ))}
        </div>
    );
}

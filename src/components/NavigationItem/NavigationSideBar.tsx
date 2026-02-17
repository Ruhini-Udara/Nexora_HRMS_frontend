"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Users,
    Calendar,
    Eye,
    LayoutDashboard,
} from "lucide-react";

const navigationItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Trainers",
        href: "/trainer",
        icon: Users,
    },
    {
        title: "Create Training Plan",
        href: "/training-plan",
        icon: Calendar,
    },
    {
        title: "View Training Plans",
        href: "/view-training-plans",
        icon: Eye,
    },
];

export function NavigationSideBar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-card min-h-screen p-4">
            <div className="mb-8">
                <h2 className="text-2xl font-bold">HRMS</h2>
                <p className="text-sm text-muted-foreground">Training Management</p>
            </div>

            <nav className="space-y-2">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.title}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}


import ManagerHeader from "@/components/ManagerHeader";
import ManagerSidebar from "@/components/ManagerSidebar";

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-dashboard-bg">
            <ManagerSidebar />
            <main className="flex-1 ml-[260px] flex flex-col min-h-screen">
                <ManagerHeader />
                <div className="flex-1">
                    {children}
                </div>
                <footer className="mt-auto px-8 py-6 border-t border-border-light dark:border-border-dark text-center text-sm text-gray-500 dark:text-gray-400">
                    Copyright 2026 - 2030 HR MATE All right reserved
                </footer>
            </main>
        </div>
    );
}

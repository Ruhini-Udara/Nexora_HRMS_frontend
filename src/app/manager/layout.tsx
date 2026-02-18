
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
            <main className="flex-1 ml-[260px]">
                <ManagerHeader />
                {children}
            </main>
        </div>
    );
}


import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-dashboard-bg">
            <Sidebar />
            <main className="flex-1 ml-[260px]">
                <Header />
                {children}
            </main>
        </div>
    );
}

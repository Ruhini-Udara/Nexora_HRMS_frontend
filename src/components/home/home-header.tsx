import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-12">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-[#8B3A00] dark:text-[#E5BA73]">
                        HR MATE
                    </h1>
                </Link>

                {/* Right side - Sign in button */}
                <div className="flex items-center">
                    <Link href="/login">
                        <Button
                            variant="default"
                            className="bg-[#8B3A00] hover:bg-[#722F00] text-white font-semibold px-6"
                        >
                            Sign in
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

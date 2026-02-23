"use client";

import { useEffect, useState } from "react";

export function DarkModeToggle() {
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
            // Check for saved theme preference or default to light mode
            const savedTheme = localStorage.getItem("theme");
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

            if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
                setIsDark(true);
                document.documentElement.classList.add("dark");
            }
        }, 0);
    }, []);

    if (!mounted) {
        return null;
    }

    const toggleDarkMode = () => {
        if (isDark) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDark(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDark(true);
        }
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-zinc-800 shadow-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:scale-110 transition-transform"
            aria-label="Toggle dark mode"
        >
            <span className="material-icons-outlined block dark:hidden">
                dark_mode
            </span>
            <span className="material-icons-outlined hidden dark:block">
                light_mode
            </span>
        </button>
    );
}

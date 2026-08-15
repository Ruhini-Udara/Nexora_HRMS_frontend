import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
    title: string;
    message: string;
    onReset: () => void;
}

export function SuccessBanner({ title, message, onReset }: Props) {
    return (
        <Card className="mb-8 overflow-hidden relative text-center py-8">
            <CardContent>
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    {message}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/employee/leave-requests"
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">dashboard</span>
                        Go to Dashboard
                    </Link>
                    <Button
                        onClick={onReset}
                        variant="outline"
                        className="px-6 py-2.5 font-bold transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Submit New Request
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

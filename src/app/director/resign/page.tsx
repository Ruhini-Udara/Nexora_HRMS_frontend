"use client";

import React from "react";
import ResignationTable from "@/components/director/resign/ResignationTable";

const DirectorResignationPage = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resignation Approvals</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Review, approve, or reject resignation requests submitted by HR for Board consideration.</p>
                </div>
            </div>
            <ResignationTable />
        </div>
    );
};

export default DirectorResignationPage;

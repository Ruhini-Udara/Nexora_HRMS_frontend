"use client";

import React from "react";
import ResignationTable from "@/components/director/resign/ResignationTable";

const DirectorResignationPage = () => {
    return (
        <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Resignation Approvals</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">
                Review, approve, or reject resignation requests submitted by HR for Board consideration.
            </p>
            <ResignationTable />
        </div>
    );
};

export default DirectorResignationPage;

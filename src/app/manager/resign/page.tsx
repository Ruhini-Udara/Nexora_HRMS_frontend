"use client";

import React from 'react';
import ResignationStats from '@/components/manager/resign/ResignationStats';
import ResignationTable from '@/components/manager/resign/ResignationTable';

const ManagerResignationPage = () => {
    return (
        <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Resignation Requests</h2>

            {/* Stats Overview */}
            <ResignationStats />

            {/* Table Card */}
            <ResignationTable />
        </div>
    );
};

export default ManagerResignationPage;

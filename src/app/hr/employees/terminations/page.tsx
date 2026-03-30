"use client";

import React, { useState } from 'react';
import { TerminationRequestForm, TerminationRequest } from './components/TerminationRequestForm';
import { TerminationList } from './components/TerminationList';

export default function TerminationsPage() {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [selectedRequest, setSelectedRequest] = useState<TerminationRequest | undefined>(undefined);
    const [isReadOnly, setIsReadOnly] = useState(false);
    
    // In a real app, this would be fetched from an API
    const [requests, setRequests] = useState<TerminationRequest[]>([
        {
            id: 'TRM-2024-001',
            employeeName: 'Amal Perera',
            epfNumber: '45829',
            branch: 'Colombo',
            type: 'Involuntary (Dismissal)',
            reason: 'Excessive absenteeism',
            initiationDate: '2024-11-01',
            effectiveDate: '2024-11-15',
            specialRemark: '',
            status: 'NEW',
            documents: {}
        },
        {
            id: 'TRM-2024-002',
            employeeName: 'Sunil Silva',
            epfNumber: '11223',
            branch: 'Kandy',
            type: 'Voluntary (Resignation)',
            reason: 'Career Change',
            initiationDate: '2024-10-25',
            effectiveDate: '2024-11-25',
            specialRemark: 'Cleared all dues.',
            status: 'SUBMITTED_FOR_APPROVAL',
            documents: {
                request_for_termination: 'resignation_sunil.pdf',
                loan_clearance_letter: 'clearance_sunil.pdf'
            }
        }
    ]);

    const handleSaveRequest = (newReq: TerminationRequest) => {
        setRequests(prev => {
            const exists = prev.find(r => r.id === newReq.id);
            if (exists) {
                return prev.map(r => r.id === newReq.id ? newReq : r);
            }
            return [...prev, newReq];
        });
        setView('list');
        setSelectedRequest(undefined);
    };

    const handleCreateNew = () => {
        setSelectedRequest(undefined);
        setIsReadOnly(false);
        setView('form');
    };

    const handleEdit = (req: TerminationRequest) => {
        setSelectedRequest(req);
        setIsReadOnly(false);
        setView('form');
    };

    const handleView = (req: TerminationRequest) => {
        setSelectedRequest(req);
        setIsReadOnly(true);
        setView('form');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-8 print:p-0 print:bg-white">
            <div className="max-w-7xl mx-auto space-y-8 print:space-y-0 print:max-w-none print:w-full">
                <div className="print:hidden">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Terminations Management</h1>
                    <p className="text-slate-500 mt-2">Manage employee termination requests and board approvals.</p>
                </div>

                {view === 'list' ? (
                    <TerminationList
                        requests={requests}
                        onUpdateRequests={setRequests}
                        onCreateNew={handleCreateNew}
                        onEdit={handleEdit}
                        onView={handleView}
                    />
                ) : (
                    <TerminationRequestForm
                        onSave={handleSaveRequest}
                        onCancel={() => {
                            setView('list');
                            setSelectedRequest(undefined);
                        }}
                        initialData={selectedRequest}
                        isReadOnly={isReadOnly}
                    />
                )}
            </div>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { DeathRequestForm } from './components/DeathRequestForm';
import { DeathRequestList, DeathRequest } from './components/DeathRequestList';

export default function EmployeeDeathPage() {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [selectedRequest, setSelectedRequest] = useState<DeathRequest | undefined>(undefined);
    const [isReadOnly, setIsReadOnly] = useState(false);
    
    // In a real app, this would be fetched from an API
    const [requests, setRequests] = useState<DeathRequest[]>([
        {
            id: 'DTH-2024-001',
            employeeName: 'Amal Perera',
            epfNumber: '45829',
            dateOfDeath: '2024-11-01',
            natureOfDeath: 'Natural',
            requesterName: 'Sunil Perera',
            relationship: 'Brother',
            address: '123, Galle Road, Colombo',
            contactNumber: '0771234567',
            specialRemark: '',
            status: 'NEW',
            documents: {}
        },
        {
            id: 'DTH-2024-002',
            employeeName: 'Nimali Silva',
            epfNumber: '11223',
            dateOfDeath: '2024-10-25',
            natureOfDeath: 'Accident',
            requesterName: 'Kasun Silva',
            relationship: 'Husband',
            address: '45, Kandy Road, Kandy',
            contactNumber: '0719876543',
            specialRemark: 'Pending police report copy',
            status: 'SUBMITTED_FOR_APPROVAL',
            nomineeName: 'Kasun Silva',
            nomineeBank: 'BOC',
            nomineeBranch: 'Kandy',
            nomineeAccount: '1234567890',
            documents: {
                deathCertificate: 'death_certificate_nimali.pdf',
                nomineeId: 'id_kasun.pdf',
                requestLetter: 'request_letter_kasun.pdf'
            }
        }
    ]);

    const handleSaveRequest = (newReq: DeathRequest) => {
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

    const handleEdit = (req: DeathRequest) => {
        setSelectedRequest(req);
        setIsReadOnly(false);
        setView('form');
    };

    const handleView = (req: DeathRequest) => {
        setSelectedRequest(req);
        setIsReadOnly(true);
        setView('form');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-8 print:p-0 print:bg-white">
            <div className="max-w-7xl mx-auto space-y-8 print:space-y-0 print:max-w-none print:w-full">
                <div className="print:hidden">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Employee Death Applications</h1>
                    <p className="text-slate-500 mt-2">Manage employee death notifications and beneficiary claims.</p>
                </div>

                {view === 'list' ? (
                    <DeathRequestList
                        requests={requests}
                        onUpdateRequests={setRequests}
                        onCreateNew={handleCreateNew}
                        onEdit={handleEdit}
                        onView={handleView}
                    />
                ) : (
                    <DeathRequestForm
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

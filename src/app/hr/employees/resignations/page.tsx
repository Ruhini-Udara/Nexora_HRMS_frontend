"use client";

import React, { useState } from 'react';
import { ResignationRequestForm } from './components/ResignationRequestForm';
import { ResignationRequestList, ResignationRequest } from './components/ResignationRequestList';

export default function HRResignationsPage() {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [selectedRequest, setSelectedRequest] = useState<ResignationRequest | undefined>(undefined);
    const [isReadOnly, setIsReadOnly] = useState(false);
    
    // In a real app, this would be fetched from an API
    const [requests, setRequests] = useState<ResignationRequest[]>([
        {
            id: 'RES-2024-001',
            employeeName: 'Amal Perera',
            epfNumber: '45829',
            designation: 'Software Engineer',
            branch: 'Colombo HQ',
            resignationDate: '2024-11-01',
            lastWorkingDate: '2024-12-01',
            reason: 'Career Growth',
            specialRemark: '',
            status: 'NEW',
            documents: {}
        },
        {
            id: 'RES-2024-002',
            employeeName: 'Nimali Silva',
            epfNumber: '11223',
            designation: 'QA Analyst',
            branch: 'Kandy Branch',
            resignationDate: '2024-10-25',
            lastWorkingDate: '2024-11-25',
            reason: 'Relocation',
            specialRemark: 'Handover checklist pending',
            status: 'SUBMITTED_FOR_ADMIN_APPROVAL',
            documents: {
                resignationLetter: 'resignation_nimali.pdf',
            }
        }
    ]);

    const handleSaveRequest = (newReq: ResignationRequest) => {
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

    const handleEdit = (req: ResignationRequest) => {
        setSelectedRequest(req);
        setIsReadOnly(false);
        setView('form');
    };

    const handleView = (req: ResignationRequest) => {
        setSelectedRequest(req);
        setIsReadOnly(true);
        setView('form');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-8 print:p-0 print:bg-white">
            <div className="max-w-7xl mx-auto space-y-8 print:space-y-0 print:max-w-none print:w-full">
                <div className="print:hidden">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Employee Resignations</h1>
                    <p className="text-slate-500 mt-2">Manage employee resignation notifications and handover processes.</p>
                </div>

                {view === 'list' ? (
                    <ResignationRequestList
                        requests={requests}
                        onUpdateRequests={setRequests}
                        onCreateNew={handleCreateNew}
                        onEdit={handleEdit}
                        onView={handleView}
                    />
                ) : (
                    <ResignationRequestForm
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

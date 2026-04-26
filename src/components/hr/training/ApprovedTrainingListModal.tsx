import React, { useState } from 'react';
import api from '@/lib/axiosInstance';
import { Toast } from '@/components/ui/Toast';

interface RequestDetails {
    id: number;
    employeeName: string;
    department: string;
    designation?: string;
    workEmail?: string;
    personalEmail?: string;
    status: string;
    avatar?: string;
    initials?: string;
}

interface ApprovedTrainingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    requests: RequestDetails[];
    eventName: string;
    eventId?: number;
    eventStatus?: string;
    approvedBy?: string;
    approvedAt?: string;
    onStatusUpdate?: () => void;
}

export default function ApprovedTrainingListModal({ isOpen, onClose, requests, eventName, eventId, eventStatus, approvedBy, approvedAt, onStatusUpdate }: ApprovedTrainingListModalProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Filter only approved requests
    const approvedRequests = requests.filter(req => req.status === 'Approved');

    const handleDownloadCSV = () => {
        if (approvedRequests.length === 0) {
            setToast({ message: "No approved participants to download.", type: 'info' });
            return;
        }
        
        const headers = ["Employee Name", "Department", "Work Email"];
        const csvContent = [
            headers.join(","),
            ...approvedRequests.map(req => [
                `"${req.employeeName}"`,
                `"${req.department}"`,
                `"${req.personalEmail || req.workEmail || 'N/A'}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Approved_Participants_${eventName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({ message: "List downloaded as CSV", type: 'success' });
    };

    const handlePrint = () => {
        const printStyles = document.createElement('style');
        printStyles.innerHTML = `
            @media print {
                body * { visibility: hidden; }
                #printable-modal, #printable-modal * { visibility: visible; }
                #printable-modal {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    background: white !important;
                }
                .no-print, .print-hide { display: none !important; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                th { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
                .print-header { margin-bottom: 20px; border-bottom: 2px solid #334155; padding-bottom: 10px; }
            }
        `;
        document.head.appendChild(printStyles);
        window.print();
        document.head.removeChild(printStyles);
    };

    if (!isOpen) return null;



    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 h-screen max-h-screen">
            <div id="printable-modal" className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 print-header">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">groups</span>
                            Approved Training List
                        </h3>
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                Participants for <span className="text-primary font-bold">&quot;{eventName}&quot;</span>
                            </p>
                            {eventStatus === 'Approved' && approvedBy && (
                                <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-md">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[14px]">verified</span>
                                    <span className="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-tight">
                                        Approved by {approvedBy} {approvedAt ? `on ${new Date(approvedAt).toLocaleDateString()}` : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setToast({ message: "Add Employee feature to be implemented", type: 'info' })}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-semibold transition-colors no-print"
                        >
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            Add Employee
                        </button>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors no-print">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-0 overflow-y-auto flex-1">
                    {approvedRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                            <span className="material-symbols-outlined text-5xl mb-3 opacity-30">group_off</span>
                            <p className="text-base font-medium">No employees have been approved for this training yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {approvedRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="print-hide">
                                                    {req.avatar ? (
                                                        <img src={req.avatar} alt={req.employeeName} className="size-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                                    ) : (
                                                        <div className="size-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm">
                                                            {req.initials}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{req.employeeName}</div>
                                                    <div className="text-xs text-slate-500">{req.designation || 'Employee'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-300 font-medium">
                                            {req.department}
                                        </td>
                                        <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-300 font-medium" title={req.personalEmail || req.workEmail || 'N/A'}>
                                            {req.personalEmail || req.workEmail || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-between rounded-b-2xl no-print">
                    <span className="text-sm font-semibold text-slate-500">
                        Total Participants: <span className="text-primary">{approvedRequests.length}</span>
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDownloadCSV}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">description</span>
                            CSV
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                            PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-bold text-sm transition-colors"
                        >
                            Close
                        </button>
                        {(eventStatus === 'Pending Admin Approval' || eventStatus === 'Approved') ? (
                            <div className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg font-bold text-sm border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-[18px]">done_all</span>
                                {eventStatus === 'Approved' ? 'List Finalized' : 'Sent to Admin'}
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsConfirming(true)}
                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">send</span>
                                Send for Admin Approval
                            </button>
                        )}
                    </div>
                </div>

                {/* Confirmation Dialog Overlay inside the Modal */}
                {isConfirming && (
                    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] rounded-2xl">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center mx-4">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">help_center</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Confirm Submission</h4>
                            <p className="text-sm text-slate-500 mb-6 px-2">
                                Are you sure you want to send this list of {approvedRequests.length} approved participants for Administrator approval?
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button 
                                    onClick={() => setIsConfirming(false)} 
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        if (eventId) {
                                            api.put(`/api/training/events/${eventId}/status`, { status: 'Pending Admin Approval' })
                                                .then(() => {
                                                    setToast({ message: "Training list sent to Admin for approval!", type: 'success' });
                                                    if (onStatusUpdate) onStatusUpdate();
                                                    setTimeout(() => {
                                                        setIsConfirming(false);
                                                        onClose();
                                                    }, 1500);
                                                })
                                                .catch(err => {
                                                    console.error("Failed to send to admin", err);
                                                    setToast({ message: "Failed to send for Admin approval. Please try again.", type: 'error' });
                                                    setIsConfirming(false);
                                                });
                                        } else {
                                            setIsConfirming(false);
                                        }
                                    }} 
                                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-sm transition-colors"
                                >
                                    Confirm & Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Toast Notifications */}
                {toast && (
                    <Toast 
                        message={toast.message} 
                        type={toast.type} 
                        onClose={() => setToast(null)} 
                    />
                )}
            </div>
        </div>
    );
}

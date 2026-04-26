import React, { useState, useEffect } from 'react';
import { getSignedUrl } from '@/lib/supabaseClient';

interface Attachment {
    name: string;
    url: string;
}

interface RequestDetails {
    employeeName: string;
    epfNumber?: string;
    age?: number;
    department: string;
    designation?: string;
    workEmail?: string;
    justification?: string;
    attachmentPath?: string;
    attachments?: Attachment[];
    avatar?: string;
    initials?: string;
    status: string;
}

interface TrainingRequestDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: RequestDetails | null;
}

export default function TrainingRequestDetailsModal({ isOpen, onClose, request }: TrainingRequestDetailsModalProps) {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        if (isOpen && request?.attachmentPath) {
            getSignedUrl(request.attachmentPath)
                .then(url => {
                    if (isMounted) setSignedUrl(url);
                })
                .catch(err => {
                    if (isMounted) console.error("Failed to get signed URL", err);
                });
        } else {
            if (isMounted) setSignedUrl(null);
        }
        return () => {
            isMounted = false;
        };
    }, [isOpen, request?.attachmentPath]);

    if (!isOpen || !request) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 h-screen max-h-screen">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-full">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Training Request</h3>
                        <p className="text-sm text-slate-500 mt-1">Review employee training details and justification</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 overflow-y-auto space-y-8 flex-1">
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Employee Info */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Employee Info</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{request.employeeName}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">EPF No:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{request.epfNumber || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Age:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{request.age || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Department:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{request.department}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Designation:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{request.designation || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Work Email:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{request.workEmail || 'N/A'}</span></div>
                            </div>
                        </div>

                        {/* Training Details */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Training Request Details</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Status:</span> 
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        request.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        request.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                        {request.status}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <span className="text-slate-500 block mb-1">Reason (Justification):</span> 
                                    <p className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                        {request.justification || 'No justification provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Uploaded Attachments</h4>
                        {(request.attachments && request.attachments.length > 0) || request.attachmentPath ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {request.attachments?.map((file, index) => (
                                    <a 
                                        key={index} 
                                        href={file.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 group hover:border-primary transition-colors cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[18px]">description</span>
                                        </div>
                                        <div className="overflow-hidden flex-1">
                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</div>
                                            <div className="text-[10px] text-slate-500 truncate">Document</div>
                                        </div>
                                        <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary transition-colors">download</span>
                                    </a>
                                ))}
                                {request.attachmentPath && (!request.attachments || request.attachments.length === 0) && (
                                    <a 
                                        href={signedUrl || "#"} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-3 p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50 group transition-colors cursor-pointer ${signedUrl ? 'border-slate-200 dark:border-slate-700 hover:border-primary' : 'border-slate-200 opacity-50 cursor-not-allowed'}`}
                                        onClick={(e) => { if (!signedUrl) e.preventDefault(); }}
                                    >
                                        <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[18px]">description</span>
                                        </div>
                                        <div className="overflow-hidden flex-1">
                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">Training_Attachment</div>
                                            <div className="text-[10px] text-slate-500 truncate">Document</div>
                                        </div>
                                        <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary transition-colors">download</span>
                                    </a>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">No attachments provided.</p>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-bold text-sm transition-colors"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
